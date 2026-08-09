export type MuscleGroup =
  | "胸"
  | "背"
  | "腿"
  | "臀"
  | "肩"
  | "手臂"
  | "核心";

export type Equipment = "哑铃" | "杠铃" | "绳索" | "自重" | "固定器械";
export type Difficulty = "入门" | "进阶" | "高级";
export type Movement =
  | "press"
  | "pull"
  | "squat"
  | "hinge"
  | "curl"
  | "extension"
  | "raise"
  | "core";

export interface MediaCredit {
  kind: "original-vector" | "licensed-video";
  author: string;
  sourceUrl?: string;
  licenseName: string;
  licenseUrl?: string;
}

/** 单个动作的稳定内容契约；教学文字与媒体许可随应用版本发布。 */
export interface Exercise {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  movement: Movement;
  steps: string[];
  cues: string[];
  mistakes: string[];
  alternatives: string[];
  media: MediaCredit;
}

export interface PersistedEntity {
  id: string;
  updatedAt: string;
  deletedAt?: string;
  deviceId: string;
}

export interface UserProfile extends PersistedEntity {
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  experience: "beginner" | "intermediate" | "advanced";
  trainingDays: number;
  sessionMinutes: 45 | 60 | 75 | 90;
  equipment: Equipment[];
  limitations: string;
  dietPreference: string;
  allergens: string[];
  activityFactor: number;
  unit: "kg" | "lb";
  effortMode: "RIR" | "RPE";
}

export interface ExercisePrescription {
  id: string;
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  restSeconds: number;
  suggestedWeightKg?: number;
}

export interface TrainingDay {
  id: string;
  name: string;
  focus: string;
  exercises: ExercisePrescription[];
}

/** 可重复使用的周计划；训练日志只保存当次快照，不反向篡改模板。 */
export interface TrainingPlan extends PersistedEntity {
  name: string;
  frequency: number;
  currentWeek: number;
  days: TrainingDay[];
}

export interface SetLog extends PersistedEntity {
  exerciseId: string;
  order: number;
  setType: "warmup" | "working";
  weightKg: number;
  reps: number;
  rir?: number;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  prescriptionId: string;
  exerciseId: string;
  notes: string;
  sets: SetLog[];
}

export interface WorkoutSession extends PersistedEntity {
  planId?: string;
  trainingDayId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  exercises: WorkoutExerciseLog[];
}

export interface NutritionProfile extends PersistedEntity {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityFactor: number;
  surplusPercent: number;
  proteinPerKg: number;
  fatPercent: number;
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: "早餐" | "正餐" | "加餐";
  minutes: number;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  swaps: string[];
  allergens: string[];
}

export interface SyncQueueItem {
  id: string;
  entity: "profile" | "plan" | "session" | "nutrition";
  entityId: string;
  payload: unknown;
  updatedAt: string;
  attempts: number;
}

export interface BackupEnvelope {
  schemaVersion: 1;
  exportedAt: string;
  profiles: UserProfile[];
  plans: TrainingPlan[];
  sessions: WorkoutSession[];
  nutritionProfiles: NutritionProfile[];
}
