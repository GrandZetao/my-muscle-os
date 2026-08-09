import { exercises } from "@/features/exercises/data";
import { createId, getDeviceId } from "@/lib/ids";
import type { MuscleGroup, TrainingDay, TrainingPlan, UserProfile } from "@/types/domain";

const splitTemplates: Record<number, { name: string; focus: string; muscles: MuscleGroup[] }[]> = {
  2: [
    { name: "全身 A", focus: "深蹲 · 水平推拉", muscles: ["腿", "胸", "背", "肩", "核心"] },
    { name: "全身 B", focus: "髋铰链 · 垂直推拉", muscles: ["臀", "背", "胸", "腿", "手臂"] },
  ],
  3: [
    { name: "全身 A", focus: "腿 · 胸 · 背", muscles: ["腿", "胸", "背", "肩", "核心"] },
    { name: "全身 B", focus: "臀 · 背 · 肩", muscles: ["臀", "背", "肩", "胸", "手臂"] },
    { name: "全身 C", focus: "腿 · 胸 · 手臂", muscles: ["腿", "胸", "背", "手臂", "核心"] },
  ],
  4: [
    { name: "上肢 A", focus: "水平推拉", muscles: ["胸", "背", "肩", "手臂", "手臂"] },
    { name: "下肢 A", focus: "股四头主导", muscles: ["腿", "臀", "腿", "核心", "腿"] },
    { name: "上肢 B", focus: "垂直推拉", muscles: ["背", "肩", "胸", "手臂", "手臂"] },
    { name: "下肢 B", focus: "后链主导", muscles: ["臀", "腿", "腿", "核心", "臀"] },
  ],
  5: [
    { name: "推", focus: "胸 · 肩 · 三头", muscles: ["胸", "胸", "肩", "肩", "手臂"] },
    { name: "拉", focus: "背 · 二头", muscles: ["背", "背", "肩", "手臂", "手臂"] },
    { name: "腿", focus: "股四头 · 后链", muscles: ["腿", "腿", "臀", "腿", "核心"] },
    { name: "上肢", focus: "上肢容量", muscles: ["胸", "背", "肩", "手臂", "手臂"] },
    { name: "下肢", focus: "下肢容量", muscles: ["腿", "臀", "腿", "核心", "臀"] },
  ],
  6: [
    { name: "推 A", focus: "胸部主导", muscles: ["胸", "胸", "肩", "手臂", "肩"] },
    { name: "拉 A", focus: "背部宽度", muscles: ["背", "背", "肩", "手臂", "核心"] },
    { name: "腿 A", focus: "股四头主导", muscles: ["腿", "腿", "臀", "腿", "核心"] },
    { name: "推 B", focus: "肩部主导", muscles: ["肩", "胸", "肩", "手臂", "胸"] },
    { name: "拉 B", focus: "背部厚度", muscles: ["背", "背", "肩", "手臂", "手臂"] },
    { name: "腿 B", focus: "后链主导", muscles: ["臀", "腿", "腿", "臀", "核心"] },
  ],
};

/**
 * 按训练频次、器械和单次时长生成确定性计划，保证同一档案重复生成时动作顺序稳定。
 */
export function generatePlan(profile: UserProfile): TrainingPlan {
  const frequency = Math.min(6, Math.max(2, profile.trainingDays));
  const templates = splitTemplates[frequency];
  const exerciseLimit = profile.sessionMinutes <= 45 ? 4 : profile.sessionMinutes <= 60 ? 5 : profile.sessionMinutes <= 75 ? 6 : 7;
  const used = new Map<MuscleGroup, number>();

  const days: TrainingDay[] = templates.map((template) => ({
    id: createId("day"),
    name: template.name,
    focus: template.focus,
    exercises: template.muscles.slice(0, exerciseLimit).map((muscle, index) => {
      const pool = exercises.filter((exercise) => exercise.primaryMuscle === muscle && profile.equipment.includes(exercise.equipment));
      const cursor = used.get(muscle) ?? 0;
      const exercise = pool[cursor % pool.length] ?? exercises.find((candidate) => candidate.primaryMuscle === muscle)!;
      used.set(muscle, cursor + 1);
      const isCompound = ["press", "pull", "squat", "hinge"].includes(exercise.movement);
      return {
        id: createId("rx"),
        exerciseId: exercise.id,
        sets: profile.experience === "beginner" ? 2 : 3,
        repMin: isCompound ? 6 : 10,
        repMax: isCompound ? 10 : 15,
        targetRir: profile.experience === "advanced" ? 1 : 2,
        restSeconds: isCompound ? 120 : 75,
        suggestedWeightKg: index === 0 ? 20 : 10,
      };
    }),
  }));

  return {
    id: createId("plan"),
    name: frequency === 4 ? "四日上 / 下肢 A·B" : `${frequency} 日增肌计划`,
    frequency,
    currentWeek: 1,
    days,
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
  };
}
