"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Beef, Calculator, CircleAlert, Clock3, Save, Wheat } from "lucide-react";
import { recipes } from "@/features/nutrition/recipes";
import { createDefaultProfile, nutritionFromProfile } from "@/features/profile/defaults";
import { calculateMacros } from "@/lib/nutrition";
import { db } from "@/lib/db";
import { getDeviceId } from "@/lib/ids";
import { saveNutrition } from "@/lib/repository";
import type { NutritionProfile, Recipe } from "@/types/domain";

const categories: (Recipe["category"] | "全部")[] = ["全部", "早餐", "正餐", "加餐"];

export default function NutritionPage() {
  const profile = useLiveQuery(() => db.profiles.orderBy("updatedAt").last());
  const stored = useLiveQuery(() => db.nutritionProfiles.orderBy("updatedAt").last());
  const baseProfile = profile ?? createDefaultProfile();
  const [fallback] = useState<NutritionProfile>(() => nutritionFromProfile(createDefaultProfile()));
  const [draft, setDraft] = useState<NutritionProfile>();
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [saved, setSaved] = useState(false);

  const fromProfile = profile ? { ...fallback, weightKg: profile.weightKg, heightCm: profile.heightCm, age: profile.age, sex: profile.sex, activityFactor: profile.activityFactor } : fallback;
  const form = draft ?? stored ?? fromProfile;

  const macros = calculateMacros(form);
  const visibleRecipes = useMemo(() => recipes.filter((recipe) =>
    (category === "全部" || recipe.category === category) &&
    !recipe.allergens.some((allergen) => baseProfile.allergens.includes(allergen)),
  ), [category, baseProfile.allergens]);
  const patch = <K extends keyof NutritionProfile>(key: K, value: NutritionProfile[K]) => setDraft((current) => ({ ...(current ?? form), [key]: value }));
  const save = async () => {
    const next = { ...form, updatedAt: new Date().toISOString(), deviceId: getDeviceId() };
    await saveNutrition(next);
    setDraft(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const macroCalories = [macros.proteinGrams * 4, macros.carbGrams * 4, macros.fatGrams * 9];
  const proteinEnd = macroCalories[0] / macros.calories * 360;
  const carbEnd = proteinEnd + macroCalories[1] / macros.calories * 360;

  return (
    <div className="page-wrap">
      <header className="mb-8"><p className="eyebrow">Nutrition & macros</p><h1 className="page-title">把增长需要的<br />能量吃进去</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">先用估算建立稳定执行的起点，再根据连续 2–3 周体重与训练表现微调。</p></header>
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <section className="panel rounded-xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Calculator size={20} className="text-primary" />增肌目标计算器</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="text-xs text-muted">体重 kg<input className="field mt-2" type="number" inputMode="decimal" value={form.weightKg} onChange={(e) => patch("weightKg", Number(e.target.value))} /></label>
            <label className="text-xs text-muted">身高 cm<input className="field mt-2" type="number" inputMode="numeric" value={form.heightCm} onChange={(e) => patch("heightCm", Number(e.target.value))} /></label>
            <label className="text-xs text-muted">年龄<input className="field mt-2" type="number" inputMode="numeric" value={form.age} onChange={(e) => patch("age", Number(e.target.value))} /></label>
            <label className="text-xs text-muted">计算性别<select className="field mt-2" value={form.sex} onChange={(e) => patch("sex", e.target.value as NutritionProfile["sex"])}><option value="male">男性公式</option><option value="female">女性公式</option></select></label>
          </div>
          <label className="mt-5 block text-sm"><span className="flex justify-between"><span>活动系数</span><b className="font-display text-xl text-primary">{form.activityFactor}</b></span><input className="mt-3 w-full accent-orange-500" type="range" min="1.2" max="1.9" step="0.05" value={form.activityFactor} onChange={(e) => patch("activityFactor", Number(e.target.value))} /></label>
          <label className="mt-5 block text-sm"><span className="flex justify-between"><span>热量盈余</span><b className="font-display text-xl text-primary">{form.surplusPercent}%</b></span><input className="mt-3 w-full accent-orange-500" type="range" min="10" max="15" step="0.5" value={form.surplusPercent} onChange={(e) => patch("surplusPercent", Number(e.target.value))} /></label>
          <label className="mt-5 block text-sm"><span className="flex justify-between"><span>蛋白质</span><b className="font-display text-xl text-primary">{form.proteinPerKg} g/kg</b></span><input className="mt-3 w-full accent-orange-500" type="range" min="1.6" max="2.2" step="0.1" value={form.proteinPerKg} onChange={(e) => patch("proteinPerKg", Number(e.target.value))} /></label>
          <label className="mt-5 block text-sm"><span className="flex justify-between"><span>脂肪热量占比</span><b className="font-display text-xl text-primary">{form.fatPercent}%</b></span><input className="mt-3 w-full accent-orange-500" type="range" min="20" max="30" step="1" value={form.fatPercent} onChange={(e) => patch("fatPercent", Number(e.target.value))} /></label>
          <button className="btn-primary mt-7 w-full" type="button" onClick={save}><Save size={18} />{saved ? "已保存" : "保存营养目标"}</button>
        </section>
        <section className="panel relative overflow-hidden rounded-xl p-5 sm:p-7">
          <div className="absolute right-0 top-0 h-44 w-44 bg-primary/10 blur-[70px]" />
          <div className="relative grid items-center gap-7 sm:grid-cols-[210px_1fr]">
            <div className="relative mx-auto grid size-48 place-items-center rounded-full" style={{ background: `conic-gradient(#f97316 0deg ${proteinEnd}deg, #eab308 ${proteinEnd}deg ${carbEnd}deg, #22c55e ${carbEnd}deg 360deg)` }}>
              <div className="grid size-36 place-items-center rounded-full bg-[#11171e] text-center"><div><p className="font-display text-5xl font-bold">{macros.calories}</p><p className="text-xs text-muted">KCAL / DAY</p></div></div>
            </div>
            <div><p className="eyebrow">Daily target</p><h2 className="mt-2 text-2xl font-bold">今日宏量目标</h2><div className="mt-6 grid grid-cols-3 gap-2"><div><span className="block h-1 bg-primary" /><p className="metric mt-3 !text-3xl">{macros.proteinGrams}g</p><p className="text-xs text-muted">蛋白质</p></div><div><span className="block h-1 bg-yellow-500" /><p className="metric mt-3 !text-3xl">{macros.carbGrams}g</p><p className="text-xs text-muted">碳水</p></div><div><span className="block h-1 bg-success" /><p className="metric mt-3 !text-3xl">{macros.fatGrams}g</p><p className="text-xs text-muted">脂肪</p></div></div><div className="mt-6 grid grid-cols-2 gap-2 text-xs text-muted"><p>BMR <b className="text-white">{macros.bmr}</b></p><p>TDEE <b className="text-white">{macros.tdee}</b></p></div></div>
          </div>
          <p className="relative mt-7 flex gap-2 border-t border-line pt-5 text-xs leading-6 text-muted"><CircleAlert size={16} className="mt-1 shrink-0 text-primary" />结果来自 Mifflin–St Jeor 与活动系数估算，不是代谢检测或医疗建议。若存在代谢疾病、孕期或治疗性饮食需求，请咨询专业人员。</p>
        </section>
      </div>

      <section className="mt-10"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Quick meals / {recipes.length}</p><h2 className="mt-2 text-2xl font-bold">便捷增肌食谱</h2></div><div className="flex gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`tag transition-colors ${category === item ? "border-primary bg-primary text-black" : ""}`}>{item}</button>)}</div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleRecipes.map((recipe) => <article className="panel rounded-xl p-5" key={recipe.id}><div className="flex items-center justify-between"><span className="tag">{recipe.category}</span><span className="flex items-center gap-1 text-xs text-muted"><Clock3 size={14} />{recipe.minutes} min</span></div><h3 className="mt-5 text-lg font-bold">{recipe.name}</h3><p className="mt-1 text-xs text-muted">{recipe.serving}</p><div className="mt-5 grid grid-cols-4 border-y border-line py-3 text-center"><div><b className="font-display text-xl">{recipe.calories}</b><p className="text-[10px] text-muted">kcal</p></div><div><b className="font-display text-xl text-primary">{recipe.protein}</b><p className="text-[10px] text-muted">蛋白</p></div><div><b className="font-display text-xl">{recipe.carbs}</b><p className="text-[10px] text-muted">碳水</p></div><div><b className="font-display text-xl">{recipe.fat}</b><p className="text-[10px] text-muted">脂肪</p></div></div><ul className="mt-4 space-y-1 text-xs leading-5 text-muted">{recipe.ingredients.map((item) => <li key={item}>· {item}</li>)}</ul>{recipe.allergens.length > 0 && <p className="mt-4 flex items-center gap-2 text-[11px] text-muted"><Wheat size={14} />含 {recipe.allergens.join("、")}</p>}</article>)}</div>
        {!visibleRecipes.length && <div className="panel rounded-xl p-10 text-center text-muted"><Beef className="mx-auto mb-3" />当前过敏原设置排除了本类全部食谱。</div>}
      </section>
    </div>
  );
}
