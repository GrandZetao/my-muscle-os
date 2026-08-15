"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { BodyMap } from "@/features/exercises/body-map";
import { equipmentOptions, exercises } from "@/features/exercises/data";
import type { Equipment, MuscleGroup } from "@/types/domain";

export default function ExercisesPage() {
  const [muscle, setMuscle] = useState<MuscleGroup>();
  const [equipment, setEquipment] = useState<Equipment>();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => exercises.filter((exercise) =>
    (!muscle || exercise.primaryMuscle === muscle || exercise.secondaryMuscles.includes(muscle)) &&
    (!equipment || exercise.equipment === equipment) &&
    (!query || `${exercise.name}${exercise.aliases.join("")}`.toLowerCase().includes(query.toLowerCase())),
  ), [muscle, equipment, query]);

  return (
    <div className="page-wrap">
      <header className="mb-8">
        <p className="eyebrow">Exercise finder / 60 movements</p>
        <h1 className="page-title">找到今天<br />真正需要的动作</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">点击身体区域，再按器械缩小范围。每个动作都有动画演示（© Gym visual）、动作规范与常见错误。</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <BodyMap selected={muscle} onSelect={setMuscle} />
          <div className="panel rounded-xl p-4">
            <label htmlFor="exercise-search" className="mb-2 flex items-center gap-2 text-sm font-medium"><Search size={16} />搜索动作</label>
            <input id="exercise-search" className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="卧推、划船、深蹲…" />
            <p className="mb-2 mt-4 flex items-center gap-2 text-sm font-medium"><SlidersHorizontal size={16} />现有器械</p>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((item) => <button key={item} type="button" className={`tag transition-colors ${equipment === item ? "border-primary bg-primary text-black" : ""}`} onClick={() => setEquipment(equipment === item ? undefined : item)}>{item}</button>)}
            </div>
          </div>
        </aside>
        <section>
          <div className="mb-4 flex items-end justify-between border-b border-line pb-3">
            <div><p className="font-display text-4xl font-bold">{filtered.length}</p><p className="text-xs text-muted">匹配动作</p></div>
            {(muscle || equipment || query) && <button className="btn-ghost" type="button" onClick={() => { setMuscle(undefined); setEquipment(undefined); setQuery(""); }}>清除筛选</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((exercise, index) => (
              <Link key={exercise.id} href={`/exercises/${exercise.slug}`} className="panel group min-h-[168px] rounded-xl p-4 transition-colors hover:border-primary/70">
                <div className="flex items-start justify-between"><span className="font-display text-xs tracking-[.18em] text-primary">{String(index + 1).padStart(2, "0")} / {exercise.equipment}</span><ArrowUpRight size={18} className="text-muted transition-colors group-hover:text-primary" /></div>
                {exercise.gifUrl && (
                  <div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-line bg-[#0c1117]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={exercise.gifUrl} alt={`${exercise.name}动作演示`} width={180} height={180} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                )}
                <h2 className="mt-4 text-xl font-bold">{exercise.name}</h2>
                <p className="mt-2 text-sm text-muted">主练 {exercise.primaryMuscle} · {exercise.difficulty}</p>
                <div className="mt-4 flex gap-2">{exercise.secondaryMuscles.slice(0, 2).map((item) => <span className="tag" key={item}>{item}</span>)}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
