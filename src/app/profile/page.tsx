"use client";

import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Download, LogOut, Save, ShieldCheck, Upload } from "lucide-react";
import { equipmentOptions } from "@/features/exercises/data";
import { createDefaultProfile } from "@/features/profile/defaults";
import { downloadBackup, importBackup } from "@/lib/backup";
import { db } from "@/lib/db";
import { getDeviceId } from "@/lib/ids";
import { saveProfile } from "@/lib/repository";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser";
import type { Equipment, UserProfile } from "@/types/domain";

export default function ProfilePage() {
  const stored = useLiveQuery(() => db.profiles.orderBy("updatedAt").last());
  const [fallback] = useState<UserProfile>(createDefaultProfile);
  const [draft, setDraft] = useState<UserProfile>();
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const form = draft ?? stored ?? fallback;
  const patch = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setDraft((current) => ({ ...(current ?? form), [key]: value }));
  const toggleEquipment = (equipment: Equipment) => patch("equipment", form.equipment.includes(equipment) ? form.equipment.filter((item) => item !== equipment) : [...form.equipment, equipment]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = { ...form, updatedAt: new Date().toISOString(), deviceId: getDeviceId() };
    await saveProfile(next);
    setDraft(next);
    setStatus("个人档案已保存，后续计划将使用新设置。");
  };
  const handleImport = async (file?: File) => {
    if (!file) return;
    await downloadBackup();
    try { await importBackup(await file.text()); setStatus("导入完成，已按更新时间合并记录。"); }
    catch (error) { setStatus(error instanceof Error ? error.message : "导入失败"); }
  };

  return (
    <div className="page-wrap !max-w-4xl">
      <header className="mb-8"><p className="eyebrow">Personal settings</p><h1 className="page-title">你的身体，<br />你的训练参数</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">这些数据仅用于生成计划与估算营养目标。浏览器本地数据可随时导出。</p></header>
      <form className="space-y-5" onSubmit={save}>
        <section className="panel rounded-xl p-5 sm:p-6"><h2 className="text-lg font-bold">基础档案</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted sm:col-span-2">称呼<input className="field mt-2" value={form.name} onChange={(e) => patch("name", e.target.value)} /></label>
          <label className="text-xs text-muted">年龄<input className="field mt-2" type="number" inputMode="numeric" min="18" max="90" value={form.age} onChange={(e) => patch("age", Number(e.target.value))} /></label>
          <label className="text-xs text-muted">计算性别<select className="field mt-2" value={form.sex} onChange={(e) => patch("sex", e.target.value as UserProfile["sex"])}><option value="male">男性公式</option><option value="female">女性公式</option></select></label>
          <label className="text-xs text-muted">身高 cm<input className="field mt-2" type="number" inputMode="numeric" value={form.heightCm} onChange={(e) => patch("heightCm", Number(e.target.value))} /></label>
          <label className="text-xs text-muted">体重 kg<input className="field mt-2" type="number" inputMode="decimal" step="0.1" value={form.weightKg} onChange={(e) => patch("weightKg", Number(e.target.value))} /></label>
          <label className="text-xs text-muted">训练经验<select className="field mt-2" value={form.experience} onChange={(e) => patch("experience", e.target.value as UserProfile["experience"])}><option value="beginner">入门</option><option value="intermediate">进阶</option><option value="advanced">高级</option></select></label>
          <label className="text-xs text-muted">活动系数<select className="field mt-2" value={form.activityFactor} onChange={(e) => patch("activityFactor", Number(e.target.value))}><option value="1.2">久坐 1.2</option><option value="1.375">轻活动 1.375</option><option value="1.55">中等 1.55</option><option value="1.725">高活动 1.725</option><option value="1.9">极高 1.9</option></select></label>
        </div></section>
        <section className="panel rounded-xl p-5 sm:p-6"><h2 className="text-lg font-bold">训练边界</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs text-muted">每周训练日<select className="field mt-2" value={form.trainingDays} onChange={(e) => patch("trainingDays", Number(e.target.value))}>{[2,3,4,5,6].map((day) => <option key={day} value={day}>{day} 天</option>)}</select></label><label className="text-xs text-muted">单次时长<select className="field mt-2" value={form.sessionMinutes} onChange={(e) => patch("sessionMinutes", Number(e.target.value) as UserProfile["sessionMinutes"])}>{[45,60,75,90].map((minute) => <option key={minute} value={minute}>{minute} 分钟</option>)}</select></label></div><p className="mb-3 mt-5 text-sm font-medium">可用器械</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{equipmentOptions.map((equipment) => <button type="button" key={equipment} onClick={() => toggleEquipment(equipment)} className={`min-h-12 rounded-lg border text-sm transition-colors ${form.equipment.includes(equipment) ? "border-primary bg-primary/15 text-white" : "border-line text-muted"}`}>{form.equipment.includes(equipment) && <Check className="mr-1 inline text-primary" size={15} />}{equipment}</button>)}</div><label className="mt-5 block text-xs text-muted">训练限制或旧伤<textarea className="field mt-2 min-h-24 resize-y" value={form.limitations} onChange={(e) => patch("limitations", e.target.value)} placeholder="仅记录需要避开的动作范围；本应用不提供康复诊断。" /></label></section>
        <section className="panel rounded-xl p-5 sm:p-6"><h2 className="text-lg font-bold">显示与饮食偏好</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs text-muted">重量单位<select className="field mt-2" value={form.unit} onChange={(e) => patch("unit", e.target.value as UserProfile["unit"])}><option value="kg">kg</option><option value="lb">lb</option></select></label><label className="text-xs text-muted">主观强度<select className="field mt-2" value={form.effortMode} onChange={(e) => patch("effortMode", e.target.value as UserProfile["effortMode"])}><option value="RIR">RIR</option><option value="RPE">RPE</option></select></label><label className="text-xs text-muted">饮食偏好<input className="field mt-2" value={form.dietPreference} onChange={(e) => patch("dietPreference", e.target.value)} /></label><label className="text-xs text-muted">过敏原（顿号分隔）<input className="field mt-2" value={form.allergens.join("、")} onChange={(e) => patch("allergens", e.target.value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean))} placeholder="奶、蛋、坚果" /></label></div></section>
        <button className="btn-primary w-full sm:w-auto" type="submit"><Save size={18} />保存个人档案</button>
      </form>
      {status && <p className="mt-4 border-l-2 border-success pl-3 text-sm text-muted" role="status">{status}</p>}

      <section className="panel mt-8 rounded-xl p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 text-success" /><div><h2 className="text-lg font-bold">数据与访问</h2><p className="mt-1 text-sm text-muted">{isSupabaseConfigured ? "已配置 Supabase；登录后自动同步。" : "当前为本地模式；数据只在本浏览器中。"}</p></div></div><div className="mt-6 flex flex-wrap gap-2"><button className="btn-secondary" type="button" onClick={downloadBackup}><Download size={17} />导出 JSON 备份</button><button className="btn-secondary" type="button" onClick={() => inputRef.current?.click()}><Upload size={17} />导入并合并</button>{isSupabaseConfigured && <button className="btn-ghost text-danger" type="button" onClick={() => getSupabaseBrowserClient()?.auth.signOut()}><LogOut size={17} />退出登录</button>}<input ref={inputRef} className="hidden" type="file" accept="application/json" onChange={(e) => handleImport(e.target.files?.[0])} /></div></section>
    </div>
  );
}
