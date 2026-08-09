import Dexie, { type EntityTable } from "dexie";
import type {
  NutritionProfile,
  SyncQueueItem,
  TrainingPlan,
  UserProfile,
  WorkoutSession,
} from "@/types/domain";

class MuscleDatabase extends Dexie {
  profiles!: EntityTable<UserProfile, "id">;
  plans!: EntityTable<TrainingPlan, "id">;
  sessions!: EntityTable<WorkoutSession, "id">;
  nutritionProfiles!: EntityTable<NutritionProfile, "id">;
  syncQueue!: EntityTable<SyncQueueItem, "id">;

  constructor() {
    super("muscle-os");
    this.version(1).stores({
      profiles: "&id, updatedAt",
      plans: "&id, updatedAt",
      sessions: "&id, startedAt, completedAt, updatedAt",
      nutritionProfiles: "&id, updatedAt",
      syncQueue: "&id, entity, updatedAt",
    });
  }
}

export const db = new MuscleDatabase();
