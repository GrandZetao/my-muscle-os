import type { Movement, MuscleGroup } from "@/types/domain";

const paths: Record<Movement, { d: string; start: [number, number]; end: [number, number]; label: string }> = {
  press: { d: "M160 150 C160 120 160 82 160 45", start: [160, 150], end: [160, 45], label: "向外推" },
  pull: { d: "M160 42 C160 74 160 112 160 150", start: [160, 42], end: [160, 150], label: "拉向身体" },
  squat: { d: "M160 54 C160 86 160 116 160 152", start: [160, 54], end: [160, 152], label: "垂直下蹲" },
  hinge: { d: "M205 70 C182 83 152 102 118 124", start: [205, 70], end: [118, 124], label: "髋部后移" },
  curl: { d: "M205 148 C222 120 218 93 190 79", start: [205, 148], end: [190, 79], label: "屈曲抬起" },
  extension: { d: "M122 84 C145 103 176 119 212 130", start: [122, 84], end: [212, 130], label: "主动伸展" },
  raise: { d: "M160 148 C137 119 112 91 75 70", start: [160, 148], end: [75, 70], label: "沿肩胛面抬起" },
  core: { d: "M110 102 C137 84 182 84 210 102", start: [110, 102], end: [210, 102], label: "保持躯干稳定" },
};

const groupY: Record<MuscleGroup, number> = { 肩: 64, 胸: 80, 背: 84, 手臂: 98, 核心: 112, 臀: 132, 腿: 158 };

export function ExerciseDemo({ movement, muscle, name }: { movement: Movement; muscle: MuscleGroup; name: string }) {
  const path = paths[movement];
  return (
    <figure className="relative overflow-hidden rounded-xl border border-line bg-[#0c1117] p-4">
      <svg viewBox="0 0 320 210" className="aspect-[16/10] w-full" role="img" aria-label={`${name}动作路径示意图`}>
        <defs>
          <marker id={`arrow-${movement}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10Z" fill="#f97316" />
          </marker>
          <linearGradient id="body" x1="0" x2="1"><stop stopColor="#596575" /><stop offset="1" stopColor="#303845" /></linearGradient>
        </defs>
        <g opacity=".9" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none">
          <circle cx="160" cy="34" r="16" fill="#303845" strokeWidth="3" />
          <path d="M160 52V122M160 68 116 102M160 68 204 102M160 122 132 184M160 122 188 184" />
        </g>
        <ellipse cx="160" cy={groupY[muscle]} rx={muscle === "腿" ? 31 : 25} ry="16" fill="#f97316" opacity=".28" />
        <path d={path.d} fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 7" markerEnd={`url(#arrow-${movement})`} />
        <circle cx={path.start[0]} cy={path.start[1]} r="7" fill="#f8fafc" opacity=".5" />
        <circle cx={path.end[0]} cy={path.end[1]} r="7" fill="#f97316" />
        <text x="16" y="198" fill="#a6b0bf" fontSize="12">ORIGINAL VECTOR · {path.label}</text>
      </svg>
      <figcaption className="sr-only">橙色虚线路径表示主要发力方向，不替代教练现场指导。</figcaption>
    </figure>
  );
}
