import { describe, expect, it } from "vitest";
import { generatePlan } from "@/features/planner/generator";
import { createDefaultProfile } from "@/features/profile/defaults";

describe("plan generator", () => {
  it.each([2, 3, 4, 5, 6])("creates a %i-day plan within the equipment profile", (trainingDays) => {
    const profile = { ...createDefaultProfile(), trainingDays, equipment: ["哑铃", "自重"] as const };
    const plan = generatePlan({ ...profile, equipment: [...profile.equipment] });
    expect(plan.days).toHaveLength(trainingDays);
    expect(plan.days.every((day) => day.exercises.length > 0)).toBe(true);
  });
});
