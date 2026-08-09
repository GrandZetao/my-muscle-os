"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, CalendarDays, ChevronRight, Clock3, Flame, History, Plus, TrendingUp } from "lucide-react";
import { getExercise } from "@/features/exercises/data";
import { generatePlan } from "@/features/planner/generator";
import { createDefaultProfile, nutritionFromProfile } from "@/features/profile/defaults";
import { calculateMacros } from "@/lib/nutrition";
import { db } from "@/lib/db";
import { savePlan } from "@/lib/repository";
import { useWorkoutStore } from "@/stores/workout-store";

export default function DashboardPage() {
  const router = useRouter();
  const [referenceNow] = useState(() => Date.now());
  const profile = useLiveQuery(() => db.profiles.orderBy("updatedAt").last());
  const plan = useLiveQuery(() => db.plans.orderBy("updatedAt").last());
  const sessions = useLiveQuery(() => db.sessions.orderBy("startedAt").reverse().toArray(), [], []);
  const nutrition = useLiveQuery(() => db.nutritionProfiles.orderBy("updatedAt").last());
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);
  const currentProfile = profile ?? createDefaultProfile();
  const macros = calculateMacros(nutrition ?? nutritionFromProfile(currentProfile));
  const completedThisWeek = sessions.filter((session) => session.completedAt && referenceNow - new Date(session.completedAt).getTime() < 7 * 86400000);
  const weeklyVolume = completedThisWeek.reduce((total, session) => total + session.exercises.flatMap((item) => item.sets).filter((set) => set.completed).reduce((sum, set) => sum + set.weightKg * set.reps, 0), 0);
  const todayIndex = plan ? (plan.currentWeek - 1) % plan.days.length : 0;
  const today = plan?.days[todayIndex];

  const begin = async () => {
    const selectedPlan = plan ?? generatePlan(currentProfile);
    if (!plan) await savePlan(selectedPlan);
    startWorkout(selectedPlan, selectedPlan.days[(selectedPlan.currentWeek - 1) % selectedPlan.days.length]);
    router.push("/workout");
  };

  return (
    <div className="page-wrap">
      {!profile && <Link href="/profile" className="mb-5 flex min-h-12 items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-4 text-sm"><span>正在使用示例档案，完成个人设置后计划会自动适配。</span><ChevronRight size={18} /></Link>}
      <header className="mb-8 flex items-end justify-between gap-4">
        <div><p className="eyebrow">{new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date())}</p><h1 className="page-title">今天，<br />继续向上。</h1></div>
        <div className="hidden text-right sm:block"><p className="metric text-primary">{completedThisWeek.length}</p><p className="text-xs text-muted">本周已训练</p></div>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-[#26201d] to-[#12171d] p-5 sm:p-7">
        <div className="absolute -right-14 -top-20 size-56 rounded-full border-[36px] border-primary/10" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="eyebrow">{activeSession ? "训练进行中" : today ? "今日训练" : "建立第一份计划"}</p><h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{activeSession?.name ?? today?.name ?? "四日上 / 下肢 A·B"}</h2><p className="mt-2 text-sm text-muted">{today?.focus ?? "根据档案与器械生成可修改的增肌安排"}</p>
            {today && <div className="mt-5 flex flex-wrap gap-2">{today.exercises.slice(0, 5).map((item) => <span className="tag" key={item.id}>{getExercise(item.exerciseId)?.name}</span>)}</div>}
          </div>
          <button className="btn-primary min-w-48" onClick={activeSession ? () => router.push("/workout") : begin} type="button">{activeSession ? "继续训练" : "开始今天的训练"}<ArrowRight size={18} /></button>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel rounded-xl p-4"><Clock3 size={18} className="text-primary" /><p className="metric mt-5">{currentProfile.sessionMinutes}</p><p className="mt-1 text-xs text-muted">计划分钟</p></div>
        <div className="panel rounded-xl p-4"><TrendingUp size={18} className="text-success" /><p className="metric mt-5">{Math.round(weeklyVolume / 100) / 10}k</p><p className="mt-1 text-xs text-muted">本周训练容量 kg</p></div>
        <div className="panel rounded-xl p-4"><Flame size={18} className="text-primary" /><p className="metric mt-5">{macros.calories}</p><p className="mt-1 text-xs text-muted">每日目标 kcal</p></div>
        <div className="panel rounded-xl p-4"><CalendarDays size={18} className="text-success" /><p className="metric mt-5">{plan?.frequency ?? currentProfile.trainingDays}</p><p className="mt-1 text-xs text-muted">每周训练日</p></div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section>
          <div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Weekly split</p><h2 className="mt-2 text-xl font-bold">本周安排</h2></div><Link href="/plan" className="btn-ghost">编辑计划<ChevronRight size={17} /></Link></div>
          <div className="space-y-2">{(plan?.days ?? []).map((day, index) => <div key={day.id} className={`panel flex items-center gap-4 rounded-xl p-4 ${index === todayIndex ? "border-primary/60" : ""}`}><span className={`grid size-10 shrink-0 place-items-center rounded-lg font-display text-xl font-bold ${index === todayIndex ? "bg-primary text-black" : "bg-white/5 text-muted"}`}>{index + 1}</span><div className="min-w-0 flex-1"><p className="font-bold">{day.name}</p><p className="truncate text-xs text-muted">{day.focus}</p></div><span className="text-xs text-muted">{day.exercises.length} 动作</span></div>)}{!plan && <button className="panel flex min-h-20 w-full items-center justify-center gap-2 rounded-xl text-muted hover:border-primary hover:text-white" onClick={begin}><Plus size={18} />生成我的第一份计划</button>}</div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Recent log</p><h2 className="mt-2 text-xl font-bold">最近训练</h2></div><Link href="/history" className="btn-ghost"><History size={17} />全部</Link></div>
          <div className="panel rounded-xl p-2">{sessions.slice(0, 4).map((session) => <Link key={session.id} href="/history" className="flex min-h-16 items-center justify-between rounded-lg px-3 transition-colors hover:bg-white/5"><div><p className="font-medium">{session.name}</p><p className="mt-1 text-xs text-muted">{new Date(session.startedAt).toLocaleDateString("zh-CN")} · {session.exercises.length} 动作</p></div><ChevronRight size={17} className="text-muted" /></Link>)}{!sessions.length && <p className="px-4 py-10 text-center text-sm text-muted">完成训练后，历史会出现在这里。</p>}</div>
        </section>
      </div>
    </div>
  );
}
