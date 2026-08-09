"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, CirclePause, CirclePlay, Clock3, Flame, Plus, Square } from "lucide-react";
import { getExercise } from "@/features/exercises/data";
import { db } from "@/lib/db";
import { saveSession } from "@/lib/repository";
import { useWorkoutStore } from "@/stores/workout-store";

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function WorkoutPage() {
  const router = useRouter();
  const [tick, setTick] = useState(() => Date.now());
  const session = useWorkoutStore((state) => state.activeSession);
  const restEndsAt = useWorkoutStore((state) => state.restEndsAt);
  const isPaused = useWorkoutStore((state) => state.isPaused);
  const pausedAt = useWorkoutStore((state) => state.pausedAt);
  const accumulatedPausedSeconds = useWorkoutStore((state) => state.accumulatedPausedSeconds);
  const updateSet = useWorkoutStore((state) => state.updateSet);
  const toggleSet = useWorkoutStore((state) => state.toggleSet);
  const addWarmupSet = useWorkoutStore((state) => state.addWarmupSet);
  const pause = useWorkoutStore((state) => state.pause);
  const resume = useWorkoutStore((state) => state.resume);
  const clear = useWorkoutStore((state) => state.clear);
  const plans = useLiveQuery(() => db.plans.toArray(), [], []);
  const history = useLiveQuery(() => db.sessions.orderBy("startedAt").reverse().toArray(), [], []);

  useEffect(() => { const timer = window.setInterval(() => setTick(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  if (!session) return <div className="page-wrap"><section className="panel grid min-h-[60vh] place-items-center rounded-xl p-8 text-center"><div><Flame className="mx-auto text-primary" size={38} /><h1 className="mt-5 text-3xl font-bold">没有进行中的训练</h1><p className="mt-3 text-muted">从计划页选择今天的训练日。</p><button className="btn-primary mt-6" onClick={() => router.push("/plan")}>打开训练计划</button></div></section></div>;

  const plan = plans.find((item) => item.id === session.planId);
  const day = plan?.days.find((item) => item.id === session.trainingDayId);
  const elapsed = Math.max(0, Math.floor(((isPaused && pausedAt ? pausedAt : tick) - new Date(session.startedAt).getTime()) / 1000) - accumulatedPausedSeconds);
  const rest = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - tick) / 1000)) : 0;
  const totalSets = session.exercises.flatMap((item) => item.sets).filter((set) => set.setType === "working").length;
  const completedSets = session.exercises.flatMap((item) => item.sets).filter((set) => set.setType === "working" && set.completed).length;

  const finish = async () => {
    await saveSession({ ...session, completedAt: new Date().toISOString(), durationSeconds: elapsed, updatedAt: new Date().toISOString() });
    clear();
    router.push("/history");
  };

  return (
    <div className="page-wrap !max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Live session</p><h1 className="page-title">{session.name}</h1><p className="mt-3 text-sm text-muted">{completedSets} / {totalSets} 正式组完成</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={isPaused ? resume : pause}>{isPaused ? <CirclePlay size={18} /> : <CirclePause size={18} />}{isPaused ? "继续" : "暂停"}</button><div className="panel flex min-h-11 items-center gap-2 rounded-lg px-4 font-display text-xl"><Clock3 size={17} className="text-primary" />{formatTime(elapsed)}</div></div></header>
      {rest > 0 && <div className="sticky top-16 z-20 mb-4 flex min-h-14 items-center justify-between rounded-xl border border-primary/50 bg-[#261a12]/95 px-4 shadow-xl backdrop-blur"><span className="flex items-center gap-2 text-sm font-medium"><Flame size={18} className="text-primary" />组间休息</span><span className="font-display text-3xl font-bold text-primary">{formatTime(rest)}</span></div>}
      <div className="space-y-5">{session.exercises.map((exerciseLog, exerciseIndex) => {
        const exercise = getExercise(exerciseLog.exerciseId)!;
        const prescription = day?.exercises.find((item) => item.id === exerciseLog.prescriptionId);
        const previous = history.find((item) => item.exercises.some((log) => log.exerciseId === exerciseLog.exerciseId));
        const previousLog = previous?.exercises.find((item) => item.exerciseId === exerciseLog.exerciseId);
        return <section className="panel overflow-hidden rounded-xl" key={exerciseLog.exerciseId}>
          <div className="border-b border-line p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-xs tracking-[.16em] text-primary">EXERCISE {String(exerciseIndex + 1).padStart(2, "0")}</p><h2 className="mt-1 text-xl font-bold">{exercise.name}</h2><p className="mt-1 text-xs text-muted">目标 {prescription?.repMin ?? 8}–{prescription?.repMax ?? 12} 次 · RIR {prescription?.targetRir ?? 2} · 休息 {prescription?.restSeconds ?? 90}s</p></div><button className="btn-ghost !px-2" aria-label={`为${exercise.name}增加热身组`} onClick={() => addWarmupSet(exercise.id)}><Plus size={18} />热身</button></div>{previousLog && <p className="mt-3 rounded-md bg-white/[.035] px-3 py-2 text-xs text-muted">上次：{previousLog.sets.filter((set) => set.setType === "working").map((set) => `${set.weightKg}kg×${set.reps}`).join(" / ")}</p>}</div>
          <div className="p-3 sm:p-4"><div className="mb-2 grid grid-cols-[34px_1fr_1fr_1fr_46px] gap-2 px-1 text-center text-[10px] tracking-wider text-muted"><span>组</span><span>KG</span><span>次数</span><span>RIR</span><span>完成</span></div>
            <div className="space-y-2">{exerciseLog.sets.map((setLog, index) => <div className={`grid grid-cols-[34px_1fr_1fr_1fr_46px] items-center gap-2 rounded-lg border p-1.5 transition-colors ${setLog.completed ? "border-success/40 bg-success/10" : "border-line bg-[#0d1218]"}`} key={setLog.id}>
              <span className={`text-center font-display text-lg ${setLog.setType === "warmup" ? "text-primary" : "text-muted"}`}>{setLog.setType === "warmup" ? "W" : index + 1}</span>
              <input aria-label={`${exercise.name}重量`} className="field !min-h-11 !p-1 text-center font-display text-lg" inputMode="decimal" type="number" min="0" step="0.5" value={setLog.weightKg} onChange={(event) => updateSet(setLog.id, { weightKg: Number(event.target.value) })} />
              <input aria-label={`${exercise.name}次数`} className="field !min-h-11 !p-1 text-center font-display text-lg" inputMode="numeric" type="number" min="0" value={setLog.reps} onChange={(event) => updateSet(setLog.id, { reps: Number(event.target.value) })} />
              <input aria-label={`${exercise.name}剩余次数`} className="field !min-h-11 !p-1 text-center font-display text-lg" inputMode="numeric" type="number" min="0" max="5" value={setLog.rir ?? ""} onChange={(event) => updateSet(setLog.id, { rir: event.target.value === "" ? undefined : Number(event.target.value) })} />
              <button aria-label={`${setLog.completed ? "取消" : "完成"}${exercise.name}第${index + 1}组`} className={`grid size-11 place-items-center rounded-md border transition-colors ${setLog.completed ? "border-success bg-success text-black" : "border-line text-muted hover:border-success hover:text-success"}`} onClick={() => toggleSet(setLog.id, prescription?.restSeconds ?? 90)}><Check size={20} /></button>
            </div>)}</div>
          </div>
        </section>;
      })}</div>
      <div className="sticky bottom-20 z-20 mt-6 flex items-center justify-between gap-3 rounded-xl border border-line bg-[#10151c]/95 p-3 shadow-2xl backdrop-blur md:bottom-4"><div className="hidden sm:block"><p className="font-display text-2xl font-bold">{Math.round(completedSets / Math.max(totalSets, 1) * 100)}%</p><p className="text-xs text-muted">训练完成度</p></div><button className="btn-primary flex-1 sm:flex-none" type="button" onClick={finish}><Square size={17} fill="currentColor" />结束并保存训练</button></div>
    </div>
  );
}
