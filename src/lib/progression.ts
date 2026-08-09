import type { ExercisePrescription, WorkoutExerciseLog } from "@/types/domain";

export type ProgressionAdvice = "increase" | "maintain" | "reduce" | "insufficient";

/**
 * 只在连续两次训练证据一致时建议改变负荷，避免一次疲劳或状态波动直接改写计划。
 */
export function getProgressionAdvice(
  prescription: ExercisePrescription,
  recentLogs: WorkoutExerciseLog[],
): ProgressionAdvice {
  if (recentLogs.length < 2) return "insufficient";
  const lastTwo = recentLogs.slice(0, 2);
  const workingSets = lastTwo.map((log) => log.sets.filter((set) => set.setType === "working" && set.completed));
  if (workingSets.some((sets) => sets.length < prescription.sets)) return "insufficient";

  const readyToIncrease = workingSets.every(
    (sets) => sets.every((set) => set.reps >= prescription.repMax) && (sets.at(-1)?.rir ?? -1) >= prescription.targetRir,
  );
  if (readyToIncrease) return "increase";

  const needsReduction = workingSets.every(
    (sets) => sets.filter((set) => set.reps < prescription.repMin || set.rir === 0).length >= Math.ceil(sets.length / 2),
  );
  return needsReduction ? "reduce" : "maintain";
}
