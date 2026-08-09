"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, ChartNoAxesCombined, Pencil, Save, Trophy } from "lucide-react";
import { getExercise } from "@/features/exercises/data";
import { db } from "@/lib/db";
import { epleyOneRepMax } from "@/lib/nutrition";
import { saveSession } from "@/lib/repository";

export default function HistoryPage() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("startedAt").reverse().toArray(), [], []);
  const [editing, setEditing] = useState<string>();
  const [name, setName] = useState("");
  const chartData = [...sessions].reverse().map((session) => ({
    date: new Date(session.startedAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
    volume: Math.round(session.exercises.flatMap((item) => item.sets).filter((set) => set.completed).reduce((sum, set) => sum + set.weightKg * set.reps, 0)),
  }));
  const allSets = sessions.flatMap((session) => session.exercises.flatMap((item) => item.sets)).filter((set) => set.completed);
  const bestE1rm = allSets.reduce((best, set) => Math.max(best, epleyOneRepMax(set.weightKg, set.reps)), 0);
  const volume = allSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);

  return (
    <div className="page-wrap">
      <header className="mb-8"><p className="eyebrow">Training history</p><h1 className="page-title">每一组，<br />都有迹可循</h1></header>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="panel rounded-xl p-4"><CalendarDays className="text-primary" size={18} /><p className="metric mt-5">{sessions.length}</p><p className="text-xs text-muted">完成训练</p></div><div className="panel rounded-xl p-4"><ChartNoAxesCombined className="text-success" size={18} /><p className="metric mt-5">{Math.round(volume / 100) / 10}k</p><p className="text-xs text-muted">累计容量 kg</p></div><div className="panel rounded-xl p-4"><Trophy className="text-primary" size={18} /><p className="metric mt-5">{bestE1rm}</p><p className="text-xs text-muted">最高估算 1RM kg</p></div><div className="panel rounded-xl p-4"><Save className="text-success" size={18} /><p className="metric mt-5">{allSets.length}</p><p className="text-xs text-muted">完成组数</p></div></section>
      <section className="panel mt-5 rounded-xl p-4 sm:p-6"><div className="mb-5"><p className="eyebrow">Volume trend</p><h2 className="mt-2 text-xl font-bold">训练容量趋势</h2></div>{chartData.length ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={.45} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="date" stroke="#6b7280" tickLine={false} axisLine={false} fontSize={11} /><YAxis hide /><Tooltip contentStyle={{ background: "#151a21", border: "1px solid #374151", borderRadius: 8 }} formatter={(value) => [`${value} kg`, "容量"]} /><Area type="monotone" dataKey="volume" stroke="#f97316" strokeWidth={3} fill="url(#volume-fill)" /></AreaChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm text-muted">完成两次训练后，这里会形成趋势。</p>}</section>
      <section className="mt-8"><p className="eyebrow">Session log</p><h2 className="mt-2 text-2xl font-bold">训练记录</h2><div className="mt-4 space-y-3">{sessions.map((session) => <article className="panel rounded-xl p-4 sm:p-5" key={session.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0 flex-1">{editing === session.id ? <input className="field" value={name} onChange={(e) => setName(e.target.value)} /> : <h3 className="text-lg font-bold">{session.name}</h3>}<p className="mt-1 text-xs text-muted">{new Date(session.startedAt).toLocaleString("zh-CN")} · {Math.round(session.durationSeconds / 60)} 分钟</p></div>{editing === session.id ? <button className="btn-primary" onClick={async () => { await saveSession({ ...session, name, updatedAt: new Date().toISOString() }); setEditing(undefined); }}><Save size={16} />保存</button> : <button className="btn-ghost !px-2" aria-label="编辑训练名称" onClick={() => { setEditing(session.id); setName(session.name); }}><Pencil size={16} /></button>}</div><div className="mt-4 flex flex-wrap gap-2">{session.exercises.map((log) => <span className="tag" key={log.exerciseId}>{getExercise(log.exerciseId)?.name} · {log.sets.filter((set) => set.completed).length} 组</span>)}</div></article>)}{!sessions.length && <div className="panel rounded-xl p-12 text-center text-muted">还没有历史记录。完成第一次训练后再回来。</div>}</div></section>
    </div>
  );
}
