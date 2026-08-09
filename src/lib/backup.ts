import { db } from "@/lib/db";
import type { BackupEnvelope, PersistedEntity } from "@/types/domain";

export async function createBackup(): Promise<BackupEnvelope> {
  const [profiles, plans, sessions, nutritionProfiles] = await Promise.all([
    db.profiles.toArray(),
    db.plans.toArray(),
    db.sessions.toArray(),
    db.nutritionProfiles.toArray(),
  ]);
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), profiles, plans, sessions, nutritionProfiles };
}

export async function downloadBackup() {
  const backup = await createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `muscle-os-backup-${backup.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function newestById<T extends PersistedEntity>(local: T[], incoming: T[]) {
  const merged = new Map(local.map((item) => [item.id, item]));
  for (const item of incoming) {
    const current = merged.get(item.id);
    if (!current || item.updatedAt > current.updatedAt) merged.set(item.id, item);
  }
  return [...merged.values()];
}

/** 导入前返回当前快照，由调用方负责下载；合并不覆盖时间更新的本地记录。 */
export async function importBackup(raw: string) {
  const parsed = JSON.parse(raw) as BackupEnvelope;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.profiles) || !Array.isArray(parsed.sessions)) {
    throw new Error("备份文件版本或结构不受支持");
  }
  const current = await createBackup();
  await db.transaction("rw", db.profiles, db.plans, db.sessions, db.nutritionProfiles, async () => {
    await db.profiles.bulkPut(newestById(current.profiles, parsed.profiles));
    await db.plans.bulkPut(newestById(current.plans, parsed.plans));
    await db.sessions.bulkPut(newestById(current.sessions, parsed.sessions));
    await db.nutritionProfiles.bulkPut(newestById(current.nutritionProfiles, parsed.nutritionProfiles));
  });
}
