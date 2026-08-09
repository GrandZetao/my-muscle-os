import { db } from "@/lib/db";
import { createId } from "@/lib/ids";
import type { NutritionProfile, SyncQueueItem, TrainingPlan, UserProfile, WorkoutSession } from "@/types/domain";

type SyncEntity = SyncQueueItem["entity"];

async function queue(entity: SyncEntity, entityId: string, payload: unknown, updatedAt: string) {
  await db.syncQueue.put({ id: createId("sync"), entity, entityId, payload, updatedAt, attempts: 0 });
}

/** 本地写入与同步队列在同一事务完成，断网时不会出现“保存成功但未排队”的状态。 */
export async function saveProfile(profile: UserProfile) {
  await db.transaction("rw", db.profiles, db.syncQueue, async () => {
    await db.profiles.put(profile);
    await queue("profile", profile.id, profile, profile.updatedAt);
  });
}

export async function savePlan(plan: TrainingPlan) {
  await db.transaction("rw", db.plans, db.syncQueue, async () => {
    await db.plans.put(plan);
    await queue("plan", plan.id, plan, plan.updatedAt);
  });
}

export async function saveSession(session: WorkoutSession) {
  await db.transaction("rw", db.sessions, db.syncQueue, async () => {
    await db.sessions.put(session);
    await queue("session", session.id, session, session.updatedAt);
  });
}

export async function saveNutrition(profile: NutritionProfile) {
  await db.transaction("rw", db.nutritionProfiles, db.syncQueue, async () => {
    await db.nutritionProfiles.put(profile);
    await queue("nutrition", profile.id, profile, profile.updatedAt);
  });
}
