"use client";

import type { KeyboardEvent } from "react";
import { muscleGroups } from "@/features/exercises/data";
import type { MuscleGroup } from "@/types/domain";

const frontZones: { muscle: MuscleGroup; cx: number; cy: number; rx: number; ry: number }[] = [
  { muscle: "肩", cx: 68, cy: 55, rx: 30, ry: 15 },
  { muscle: "胸", cx: 68, cy: 78, rx: 24, ry: 17 },
  { muscle: "手臂", cx: 68, cy: 104, rx: 43, ry: 12 },
  { muscle: "核心", cx: 68, cy: 116, rx: 19, ry: 29 },
  { muscle: "腿", cx: 68, cy: 178, rx: 29, ry: 47 },
];
const backZones: typeof frontZones = [
  { muscle: "肩", cx: 68, cy: 55, rx: 30, ry: 15 },
  { muscle: "背", cx: 68, cy: 90, rx: 27, ry: 35 },
  { muscle: "手臂", cx: 68, cy: 104, rx: 43, ry: 12 },
  { muscle: "臀", cx: 68, cy: 142, rx: 24, ry: 19 },
  { muscle: "腿", cx: 68, cy: 184, rx: 28, ry: 42 },
];

function Figure({ zones, selected, onSelect, label }: { zones: typeof frontZones; selected?: MuscleGroup; onSelect: (muscle: MuscleGroup) => void; label: string }) {
  const keySelect = (event: KeyboardEvent<SVGEllipseElement>, muscle: MuscleGroup) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(muscle); }
  };
  return (
    <svg viewBox="0 0 136 240" className="mx-auto h-[250px] w-[142px]" role="group" aria-label={label}>
      <g fill="#26303b" stroke="#596575" strokeWidth="2">
        <circle cx="68" cy="24" r="16" />
        <path d="M44 48 Q68 38 92 48 L101 117 86 137 86 218 70 218 68 151 66 218 50 218 50 137 35 117Z" />
        <path d="M43 54 20 120 32 126 56 76M93 54l23 66-12 6-24-50" />
      </g>
      {zones.map((zone) => (
        <ellipse key={zone.muscle} tabIndex={0} role="button" aria-label={`选择${zone.muscle}`} cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry}
          onClick={() => onSelect(zone.muscle)} onKeyDown={(event) => keySelect(event, zone.muscle)}
          className="cursor-pointer transition-colors duration-200 focus:outline-none"
          fill={selected === zone.muscle ? "#f97316" : "#f9731642"} stroke={selected === zone.muscle ? "#fb923c" : "transparent"} strokeWidth="3" />
      ))}
      <text x="68" y="236" textAnchor="middle" fill="#a6b0bf" fontSize="10" letterSpacing="2">{label}</text>
    </svg>
  );
}

export function BodyMap({ selected, onSelect }: { selected?: MuscleGroup; onSelect: (muscle?: MuscleGroup) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-[#0c1117] p-3">
        <Figure zones={frontZones} selected={selected} onSelect={onSelect} label="FRONT" />
        <Figure zones={backZones} selected={selected} onSelect={onSelect} label="BACK" />
      </div>
      <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => onSelect(undefined)} className={`tag shrink-0 transition-colors ${!selected ? "border-primary bg-primary text-black" : ""}`}>全部</button>
        {muscleGroups.map((muscle) => <button type="button" key={muscle} onClick={() => onSelect(muscle)} className={`tag shrink-0 transition-colors ${selected === muscle ? "border-primary bg-primary text-black" : ""}`}>{muscle}</button>)}
      </div>
    </div>
  );
}
