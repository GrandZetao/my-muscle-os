"use client";

import { useEffect, useState } from "react";
import { Dumbbell, LoaderCircle, Mail } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(isSupabaseConfigured);
  const [signedIn, setSignedIn] = useState(!isSupabaseConfigured);
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_APP_OWNER_EMAIL ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then((result: { data: { session: Session | null } }) => {
      setSignedIn(Boolean(result.data.session));
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) {
    return <div className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-primary" aria-label="正在验证登录状态" /></div>;
  }
  if (signedIn) return children;

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setMessage("正在发送…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setMessage(error ? "邮箱未获授权或发送失败。" : "登录链接已发送，请检查邮箱。此页面可以关闭。");
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
      <section className="panel relative w-full max-w-md border-t-2 border-t-primary p-6 sm:p-8">
        <div className="mb-10 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-primary text-black"><Dumbbell /></span>
          <div><p className="font-display text-2xl font-bold tracking-wide">MUSCLE OS</p><p className="text-xs text-muted">PRIVATE TRAINING SYSTEM</p></div>
        </div>
        <p className="eyebrow">单人访问</p>
        <h1 className="mt-3 text-3xl font-bold">回到你的训练系统</h1>
        <p className="mt-3 text-sm leading-6 text-muted">输入已授权邮箱。我们只发送一次性登录链接，不保存密码。</p>
        <form className="mt-8 space-y-4" onSubmit={sendMagicLink}>
          <label className="block text-sm font-medium" htmlFor="email">授权邮箱</label>
          <input className="field" id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button className="btn-primary w-full" type="submit"><Mail size={18} />发送魔法链接</button>
        </form>
        {message && <p className="mt-5 border-l-2 border-primary pl-3 text-sm text-muted" role="status">{message}</p>}
      </section>
    </main>
  );
}
