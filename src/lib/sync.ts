import { db } from "@/lib/db";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { NutritionProfile, SyncQueueItem, TrainingPlan, UserProfile, WorkoutSession } from "@/types/domain";

export type SyncResult = "local-only" | "signed-out" | "synced" | "failed";

async function pushQueueItem(userId: string, item: SyncQueueItem | undefined) {
  if (!item) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const payload = item.payload as { id: string; updatedAt: string; deviceId: string; deletedAt?: string };
  const row = {
    id: payload.id,
    user_id: userId,
    data: item.payload,
    updated_at: payload.updatedAt,
    deleted_at: payload.deletedAt ?? null,
    device_id: payload.deviceId,
  };
  const table = {
    profile: "profiles",
    plan: "training_plans",
    session: "workout_sessions",
    nutrition: "nutrition_profiles",
  }[item.entity];
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
  if (error) throw error;

  if (item.entity === "session") {
    const session = item.payload as WorkoutSession;
    const setRows = session.exercises.flatMap((exercise) =>
      exercise.sets.map((set) => ({
        id: set.id,
        session_id: session.id,
        user_id: userId,
        data: set,
        updated_at: set.updatedAt,
        deleted_at: set.deletedAt ?? null,
        device_id: set.deviceId,
      })),
    );
    if (setRows.length) {
      const result = await supabase.from("workout_sets").upsert(setRows, { onConflict: "id" });
      if (result.error) throw result.error;
    }
  }
}

async function pullRemote() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const collections = [
    ["profiles", db.profiles],
    ["training_plans", db.plans],
    ["workout_sessions", db.sessions],
    ["nutrition_profiles", db.nutritionProfiles],
  ] as const;

  for (const [tableName, localTable] of collections) {
    const { data, error } = await supabase.from(tableName).select("data,updated_at").is("deleted_at", null);
    if (error) throw error;
    for (const row of data ?? []) {
      const remote = row.data as unknown as UserProfile | TrainingPlan | WorkoutSession | NutritionProfile;
      const local = await localTable.get(remote.id as never);
      if (!local || row.updated_at > local.updatedAt) await localTable.put(remote as never);
    }
  }
}

/**
 * 同步顺序固定为先推后拉，避免离线新记录在拉取时被旧云端副本覆盖。
 * 单用户场景使用实体 updatedAt 执行最后写入优先。
 */
export async function syncNow(): Promise<SyncResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "local-only";
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "signed-out";

  try {
    const queue = await db.syncQueue.orderBy("updatedAt").toArray();
    for (const item of queue) {
      await pushQueueItem(data.user.id, item);
      await db.syncQueue.delete(item.id);
    }
    await pullRemote();
    return "synced";
  } catch {
    return "failed";
  }
}
