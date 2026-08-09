import type { NutritionProfile, UserProfile } from "@/types/domain";
import { createId, getDeviceId } from "@/lib/ids";

export function createDefaultProfile(): UserProfile {
  return {
    id: "personal-profile",
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    name: "训练者",
    age: 28,
    sex: "male",
    heightCm: 175,
    weightKg: 70,
    experience: "intermediate",
    trainingDays: 4,
    sessionMinutes: 60,
    equipment: ["哑铃", "杠铃", "绳索", "自重", "固定器械"],
    limitations: "",
    dietPreference: "日常均衡饮食",
    allergens: [],
    activityFactor: 1.55,
    unit: "kg",
    effortMode: "RIR",
  };
}

export function nutritionFromProfile(profile: UserProfile): NutritionProfile {
  return {
    id: createId("nutrition"),
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex,
    activityFactor: profile.activityFactor,
    surplusPercent: 12.5,
    proteinPerKg: 1.8,
    fatPercent: 25,
  };
}
