import type { MacroTargets, NutritionProfile } from "@/types/domain";

/**
 * 使用 Mifflin-St Jeor 公式生成可编辑的估算目标。
 * 这些数字是规划起点，不是医学诊断或代谢测量结果。
 */
export function calculateMacros(profile: NutritionProfile): MacroTargets {
  const sexOffset = profile.sex === "male" ? 5 : -161;
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexOffset;
  const tdee = bmr * profile.activityFactor;
  const calories = tdee * (1 + profile.surplusPercent / 100);
  const proteinGrams = profile.weightKg * profile.proteinPerKg;
  const fatGrams = (calories * (profile.fatPercent / 100)) / 9;
  const carbGrams = Math.max(0, (calories - proteinGrams * 4 - fatGrams * 9) / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    proteinGrams: Math.round(proteinGrams),
    fatGrams: Math.round(fatGrams),
    carbGrams: Math.round(carbGrams),
  };
}

export const epleyOneRepMax = (weightKg: number, reps: number) =>
  reps <= 1 ? weightKg : Math.round(weightKg * (1 + reps / 30) * 10) / 10;
