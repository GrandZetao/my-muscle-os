import { describe, expect, it } from "vitest";
import { calculateMacros, epleyOneRepMax } from "@/lib/nutrition";
import type { NutritionProfile } from "@/types/domain";

const profile: NutritionProfile = {
  id: "nutrition-test", deviceId: "test", updatedAt: "2026-08-09T00:00:00.000Z",
  age: 28, sex: "male", heightCm: 175, weightKg: 70, activityFactor: 1.55,
  surplusPercent: 12.5, proteinPerKg: 1.8, fatPercent: 25,
};

describe("nutrition calculations", () => {
  it("calculates Mifflin-St Jeor and macro targets", () => {
    expect(calculateMacros(profile)).toEqual({ bmr: 1649, tdee: 2556, calories: 2875, proteinGrams: 126, fatGrams: 80, carbGrams: 413 });
  });
  it("calculates estimated one-rep max", () => expect(epleyOneRepMax(100, 10)).toBe(133.3));
});
