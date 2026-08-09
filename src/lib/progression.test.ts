import { describe, expect, it } from "vitest";
import { getProgressionAdvice } from "@/lib/progression";
import type { ExercisePrescription, WorkoutExerciseLog } from "@/types/domain";

const prescription: ExercisePrescription = { id: "rx", exerciseId: "bench", sets: 2, repMin: 6, repMax: 10, targetRir: 2, restSeconds: 120 };
const log = (reps: number, rir: number): WorkoutExerciseLog => ({ prescriptionId: "rx", exerciseId: "bench", notes: "", sets: [1, 2].map((order) => ({ id: `set-${reps}-${order}`, exerciseId: "bench", order, setType: "working", weightKg: 60, reps, rir, completed: true, updatedAt: "2026-08-09", deviceId: "test" })) });

describe("progression advice", () => {
  it("waits for two sessions", () => expect(getProgressionAdvice(prescription, [log(10, 2)])).toBe("insufficient"));
  it("suggests an increase after two complete top-range sessions", () => expect(getProgressionAdvice(prescription, [log(10, 2), log(10, 3)])).toBe("increase"));
  it("suggests a reduction after repeated misses", () => expect(getProgressionAdvice(prescription, [log(4, 0), log(5, 0)])).toBe("reduce"));
});
