"use client";

import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDown, ArrowUp, Dumbbell, Play, RefreshCcw, Save } from "lucide-react";
import { getExercise, exercises } from "@/features/exercises/data";
import { generatePlan } from "@/features/planner/generator";
import { createDefaultProfile } from "@/features/profile/defaults";
import { db } from "@/lib/db";
import { getDeviceId } from "@/lib/ids";
import { savePlan } from "@/lib/repository";
import { useWorkoutStore } from "@/stores/workout-store";
import type { TrainingPlan } from "@/types/domain";

export default function PlanPage() {
  const router = useRouter();
  const profile = useLiveQuery(() => db.profiles.orderBy("updatedAt").last());
  const plan = useLiveQuery(() => db.plans.orderBy("updatedAt").last());
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);
  const currentProfile = profile ?? createDefaultProfile();

  const regenerate = async (frequency = currentProfile.trainingDays) => {
    await savePlan(generatePlan({ ...currentProfile, trainingDays: frequency }));
  };
  const updatePlan = async (mutate: (draft: TrainingPlan) => void) => {
    if (!plan) return;
    const draft = structuredClone(plan);
    mutate(draft);
    draft.updatedAt = new Date().toISOString();
    draft.deviceId = getDeviceId();
    await savePlan(draft);
  };
  const beginDay = (dayIndex: number) => {
    if (!plan) return;
    startWorkout(plan, plan.days[dayIndex]);
    router.push("/workout");
  };

  return (
    <div className="page-wrap">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Program builder</p><h1 className="page-title">训练计划<br />控制台</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">计划只提供下一次目标，真实完成数据永远保留在历史日志中。</p></div>{plan && <button className="btn-secondary" type="button" onClick={() => regenerate(plan.frequency)}><RefreshCcw size={17} />重新生成</button>}</header>
      {activeSession && <button type="button" onClick={() => router.push("/workout")} className="mb-5 flex min-h-14 w-full items-center justify-between rounded-xl border border-success/40 bg-success/10 px-4"><span className="font-medium text-success">{activeSession.name} 正在进行</span><span className="text-sm">继续训练 →</span></button>}
      <section className="panel mb-6 rounded-xl p-4"><p className="mb-3 text-sm font-medium">每周训练频次</p><div className="grid grid-cols-5 gap-2">{[2,3,4,5,6].map((day) => <button className={`min-h-12 rounded-lg border font-display text-xl font-bold transition-colors ${plan?.frequency === day ? "border-primary bg-primary text-black" : "border-line bg-white/5 text-muted hover:border-primary/60"}`} key={day} onClick={() => regenerate(day)} type="button">{day}D</button>)}</div></section>
      {!plan ? <section className="panel grid min-h-72 place-items-center rounded-xl p-8 text-center"><div><Dumbbell className="mx-auto text-primary" size={34} /><h2 className="mt-4 text-2xl font-bold">还没有训练计划</h2><p className="mt-2 text-muted">根据示例档案先生成，之后可在“我的”中精确调整。</p><button className="btn-primary mt-6" onClick={() => regenerate()}><Save size={18} />生成四日计划</button></div></section> :
        <div className="space-y-5">{plan.days.map((day, dayIndex) => (
          <section className="panel overflow-hidden rounded-xl" key={day.id}>
            <div className="flex items-center justify-between border-b border-line bg-white/[.025] p-4 sm:p-5"><div><p className="font-display text-xs tracking-[.16em] text-primary">DAY {String(dayIndex + 1).padStart(2, "0")}</p><h2 className="mt-1 text-xl font-bold">{day.name}</h2><p className="mt-1 text-xs text-muted">{day.focus}</p></div><button className="btn-primary" type="button" onClick={() => beginDay(dayIndex)}><Play size={17} />开始</button></div>
            <div className="divide-y divide-line">{day.exercises.map((prescription, index) => {
              const exercise = getExercise(prescription.exerciseId)!;
              return <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={prescription.id}>
                <div className="flex min-w-0 items-center gap-3"><span className="font-display text-2xl text-muted">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate font-medium">{exercise.name}</p><p className="mt-1 text-xs text-muted">{exercise.primaryMuscle} · {exercise.equipment}</p></div></div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-muted">组 <input className="field ml-1 !min-h-10 w-16 !py-1 text-center" inputMode="numeric" type="number" min="1" max="8" value={prescription.sets} onChange={(event) => updatePlan((draft) => { draft.days[dayIndex].exercises[index].sets = Number(event.target.value); })} /></label>
                  <span className="tag">{prescription.repMin}–{prescription.repMax} 次</span><span className="tag">RIR {prescription.targetRir}</span>
                  <button className="btn-ghost !min-h-10 !px-2" aria-label="上移动作" disabled={index === 0} onClick={() => updatePlan((draft) => { const list = draft.days[dayIndex].exercises; [list[index - 1], list[index]] = [list[index], list[index - 1]]; })}><ArrowUp size={16} /></button>
                  <button className="btn-ghost !min-h-10 !px-2" aria-label="下移动作" disabled={index === day.exercises.length - 1} onClick={() => updatePlan((draft) => { const list = draft.days[dayIndex].exercises; [list[index + 1], list[index]] = [list[index], list[index + 1]]; })}><ArrowDown size={16} /></button>
                  <button className="btn-ghost !min-h-10 text-xs" onClick={() => updatePlan((draft) => { const replacement = exercises.find((item) => item.primaryMuscle === exercise.primaryMuscle && item.id !== exercise.id && currentProfile.equipment.includes(item.equipment)); if (replacement) draft.days[dayIndex].exercises[index].exerciseId = replacement.id; })}>替换</button>
                </div>
              </div>;
            })}</div>
          </section>
        ))}</div>}
    </div>
  );
}
