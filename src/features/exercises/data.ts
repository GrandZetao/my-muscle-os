import type { Difficulty, Equipment, Exercise, Movement, MuscleGroup } from "@/types/domain";

type ExerciseSeed = [
  slug: string,
  name: string,
  primary: MuscleGroup,
  equipment: Equipment,
  difficulty: Difficulty,
  movement: Movement,
  secondary: MuscleGroup[],
  aliases?: string[],
];

const seeds: ExerciseSeed[] = [
  ["barbell-bench-press", "杠铃卧推", "胸", "杠铃", "进阶", "press", ["肩", "手臂"], ["平板卧推"]],
  ["incline-dumbbell-press", "上斜哑铃卧推", "胸", "哑铃", "入门", "press", ["肩", "手臂"]],
  ["cable-chest-fly", "站姿绳索夹胸", "胸", "绳索", "入门", "press", ["肩"], ["龙门架夹胸"]],
  ["machine-chest-press", "坐姿推胸机", "胸", "固定器械", "入门", "press", ["肩", "手臂"]],
  ["push-up", "标准俯卧撑", "胸", "自重", "入门", "press", ["肩", "手臂", "核心"]],
  ["incline-barbell-press", "上斜杠铃卧推", "胸", "杠铃", "进阶", "press", ["肩", "手臂"]],
  ["dumbbell-fly", "平板哑铃飞鸟", "胸", "哑铃", "进阶", "press", ["肩"]],
  ["chest-dip", "双杠臂屈伸", "胸", "自重", "高级", "press", ["肩", "手臂", "核心"]],
  ["pec-deck", "蝴蝶机夹胸", "胸", "固定器械", "入门", "press", ["肩"]],
  ["pull-up", "正握引体向上", "背", "自重", "进阶", "pull", ["手臂", "核心"]],
  ["lat-pulldown", "高位下拉", "背", "固定器械", "入门", "pull", ["手臂"]],
  ["barbell-row", "俯身杠铃划船", "背", "杠铃", "进阶", "pull", ["手臂", "核心"]],
  ["one-arm-dumbbell-row", "单臂哑铃划船", "背", "哑铃", "入门", "pull", ["手臂"]],
  ["seated-cable-row", "坐姿绳索划船", "背", "绳索", "入门", "pull", ["手臂"]],
  ["straight-arm-pulldown", "直臂下压", "背", "绳索", "进阶", "pull", ["核心"]],
  ["chest-supported-row", "胸托划船机", "背", "固定器械", "入门", "pull", ["手臂"]],
  ["inverted-row", "反向划船", "背", "自重", "进阶", "pull", ["手臂", "核心"]],
  ["rack-pull", "架上硬拉", "背", "杠铃", "高级", "hinge", ["腿", "臀", "核心"]],
  ["barbell-back-squat", "杠铃深蹲", "腿", "杠铃", "进阶", "squat", ["臀", "核心"]],
  ["front-squat", "杠铃前蹲", "腿", "杠铃", "高级", "squat", ["臀", "核心"]],
  ["goblet-squat", "高脚杯深蹲", "腿", "哑铃", "入门", "squat", ["臀", "核心"]],
  ["leg-press", "腿举", "腿", "固定器械", "入门", "squat", ["臀"]],
  ["bulgarian-split-squat", "保加利亚分腿蹲", "腿", "哑铃", "进阶", "squat", ["臀", "核心"]],
  ["walking-lunge", "哑铃行走弓步", "腿", "哑铃", "进阶", "squat", ["臀", "核心"]],
  ["leg-extension", "腿屈伸", "腿", "固定器械", "入门", "extension", []],
  ["lying-leg-curl", "俯卧腿弯举", "腿", "固定器械", "入门", "curl", []],
  ["romanian-deadlift", "杠铃罗马尼亚硬拉", "腿", "杠铃", "进阶", "hinge", ["臀", "背", "核心"]],
  ["dumbbell-rdl", "哑铃罗马尼亚硬拉", "腿", "哑铃", "入门", "hinge", ["臀", "背", "核心"]],
  ["machine-calf-raise", "器械提踵", "腿", "固定器械", "入门", "extension", []],
  ["single-leg-calf-raise", "单腿自重提踵", "腿", "自重", "入门", "extension", ["核心"]],
  ["barbell-hip-thrust", "杠铃臀推", "臀", "杠铃", "进阶", "hinge", ["腿", "核心"]],
  ["glute-bridge", "自重臀桥", "臀", "自重", "入门", "hinge", ["腿", "核心"]],
  ["cable-kickback", "绳索后踢腿", "臀", "绳索", "入门", "extension", ["腿", "核心"]],
  ["hip-abduction", "髋外展机", "臀", "固定器械", "入门", "extension", ["腿"]],
  ["sumo-squat", "哑铃相扑深蹲", "臀", "哑铃", "入门", "squat", ["腿", "核心"]],
  ["step-up", "哑铃登阶", "臀", "哑铃", "进阶", "squat", ["腿", "核心"]],
  ["overhead-press", "杠铃站姿推举", "肩", "杠铃", "进阶", "press", ["手臂", "核心"]],
  ["dumbbell-shoulder-press", "哑铃肩推", "肩", "哑铃", "入门", "press", ["手臂"]],
  ["dumbbell-lateral-raise", "哑铃侧平举", "肩", "哑铃", "入门", "raise", []],
  ["cable-lateral-raise", "单臂绳索侧平举", "肩", "绳索", "进阶", "raise", []],
  ["reverse-pec-deck", "反向蝴蝶机", "肩", "固定器械", "入门", "pull", ["背"]],
  ["face-pull", "绳索面拉", "肩", "绳索", "入门", "pull", ["背", "手臂"]],
  ["machine-shoulder-press", "器械肩推", "肩", "固定器械", "入门", "press", ["手臂"]],
  ["dumbbell-front-raise", "哑铃前平举", "肩", "哑铃", "入门", "raise", []],
  ["barbell-curl", "杠铃弯举", "手臂", "杠铃", "入门", "curl", []],
  ["alternating-dumbbell-curl", "交替哑铃弯举", "手臂", "哑铃", "入门", "curl", []],
  ["hammer-curl", "哑铃锤式弯举", "手臂", "哑铃", "入门", "curl", []],
  ["cable-curl", "绳索弯举", "手臂", "绳索", "入门", "curl", []],
  ["preacher-curl", "牧师凳弯举", "手臂", "固定器械", "进阶", "curl", []],
  ["triceps-pushdown", "绳索肱三头下压", "手臂", "绳索", "入门", "extension", []],
  ["overhead-cable-extension", "绳索过顶臂屈伸", "手臂", "绳索", "进阶", "extension", []],
  ["skull-crusher", "仰卧杠铃臂屈伸", "手臂", "杠铃", "进阶", "extension", ["胸"]],
  ["close-grip-bench", "窄握杠铃卧推", "手臂", "杠铃", "进阶", "press", ["胸", "肩"]],
  ["plank", "平板支撑", "核心", "自重", "入门", "core", ["肩", "臀"]],
  ["dead-bug", "死虫式", "核心", "自重", "入门", "core", ["臀"]],
  ["hanging-leg-raise", "悬垂举腿", "核心", "自重", "高级", "core", ["手臂"]],
  ["cable-crunch", "跪姿绳索卷腹", "核心", "绳索", "进阶", "core", []],
  ["ab-wheel", "健腹轮", "核心", "自重", "高级", "core", ["肩", "背"]],
  ["pallof-press", "绳索抗旋推", "核心", "绳索", "进阶", "core", ["肩"]],
];

const movementCopy: Record<Movement, { steps: string[]; cues: string[]; mistakes: string[] }> = {
  press: {
    steps: ["稳定肩胛与躯干，建立全脚掌支撑。", "控制负重下降到目标位置，不借反弹。", "沿稳定轨迹推起，顶端不过度锁死关节。"],
    cues: ["肩膀远离耳朵", "下降吸气，发力呼气", "手腕与前臂保持一线"],
    mistakes: ["肘部完全外展", "腰椎过度反弓", "为追重量缩短动作幅度"],
  },
  pull: {
    steps: ["先固定躯干并让肩胛自然前伸。", "以肘部带动负重，肩胛向后下方收紧。", "顶点短暂停留，再控制回到伸展位。"],
    cues: ["想象肘部拉向髋部", "胸口保持展开", "回程不卸力"],
    mistakes: ["耸肩代偿", "用腰部甩动负重", "只弯手臂不移动肩胛"],
  },
  squat: {
    steps: ["双脚建立三点支撑，收紧躯干。", "膝髋同步屈曲，膝盖跟随脚尖方向。", "保持重心稳定，推动地面站起。"],
    cues: ["脚掌抓地", "膝盖对准第二脚趾", "全程保持腹压"],
    mistakes: ["足弓塌陷", "下蹲时膝盖内扣", "起身先抬臀导致躯干折叠"],
  },
  hinge: {
    steps: ["微屈膝并收紧核心，脊柱保持中立。", "髋部向后移动，让负重贴近身体下降。", "臀腿后侧拉长后主动伸髋站直。"],
    cues: ["屁股向后找墙", "负重贴腿", "顶端收臀不后仰"],
    mistakes: ["把髋铰链做成深蹲", "负重远离身体", "腰背弯曲或顶端过伸"],
  },
  curl: {
    steps: ["固定上臂和躯干，关节处于自然位置。", "通过目标关节屈曲抬起负重。", "顶点挤压后缓慢回到接近完全伸展。"],
    cues: ["上臂像被钉住", "回程保持张力", "使用可控重量"],
    mistakes: ["身体后仰借力", "肘部大幅前移", "快速坠落负重"],
  },
  extension: {
    steps: ["固定非目标关节，保持躯干稳定。", "主动伸展目标关节至肌肉充分收缩。", "控制回程，不让配重片撞击。"],
    cues: ["动作来自目标关节", "末端短暂停顿", "回程比发力稍慢"],
    mistakes: ["用身体摆动", "关节突然锁死", "回程完全失去控制"],
  },
  raise: {
    steps: ["保持肋骨下沉与肩胛稳定。", "以手肘带动手臂沿肩胛平面抬起。", "到目标高度后缓慢下降。"],
    cues: ["手肘略高于手腕", "肩膀远离耳朵", "小重量换取稳定轨迹"],
    mistakes: ["耸肩", "惯性甩起", "抬得过高导致肩部挤压"],
  },
  core: {
    steps: ["先呼气让肋骨下沉，骨盆回到中立。", "维持腹压完成动作或抗住外力。", "出现腰椎代偿前结束当前次数。"],
    cues: ["像准备承受一拳般收紧", "保持均匀呼吸", "质量优先于时长"],
    mistakes: ["憋气过久", "腰部塌陷", "用惯性代替腹部控制"],
  },
};

const originalMedia = {
  kind: "original-vector" as const,
  author: "Muscle OS",
  licenseName: "项目原创矢量演示",
};

const baseExercises = seeds.map<Exercise>(([slug, name, primaryMuscle, equipment, difficulty, movement, secondaryMuscles, aliases = []]) => ({
  id: `exercise_${slug}`,
  slug,
  name,
  aliases,
  primaryMuscle,
  secondaryMuscles,
  equipment,
  difficulty,
  movement,
  ...movementCopy[movement],
  alternatives: [],
  media: originalMedia,
}));

export const exercises: Exercise[] = baseExercises.map((exercise) => ({
  ...exercise,
  alternatives: baseExercises
    .filter((candidate) => candidate.primaryMuscle === exercise.primaryMuscle && candidate.id !== exercise.id)
    .slice(0, 3)
    .map((candidate) => candidate.id),
}));

export const muscleGroups: MuscleGroup[] = ["胸", "背", "腿", "臀", "肩", "手臂", "核心"];
export const equipmentOptions: Equipment[] = ["哑铃", "杠铃", "绳索", "自重", "固定器械"];

export const getExercise = (idOrSlug: string) =>
  exercises.find((exercise) => exercise.id === idOrSlug || exercise.slug === idOrSlug);
