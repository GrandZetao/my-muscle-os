"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Dumbbell, Home, Salad, UserRound } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { SyncStatus } from "@/components/sync-status";

const navigation = [
  { href: "/", label: "首页", icon: Home },
  { href: "/exercises", label: "动作", icon: Dumbbell },
  { href: "/plan", label: "训练", icon: Apple },
  { href: "/nutrition", label: "营养", icon: Salad },
  { href: "/profile", label: "我的", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <AuthGate>
      <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-line bg-[#0b0f14]/95 p-5 backdrop-blur md:flex md:flex-col">
          <Link href="/" className="mb-10 flex min-h-11 items-center gap-3 rounded-lg">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-black"><Dumbbell size={22} strokeWidth={2.5} /></span>
            <div><p className="font-display text-2xl font-bold leading-none">MUSCLE OS</p><p className="mt-1 text-[10px] tracking-[.16em] text-muted">TRAIN / FUEL / GROW</p></div>
          </Link>
          <nav className="space-y-2" aria-label="主导航">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium transition-colors ${isActive(href) ? "border-primary bg-primary/10 text-white" : "border-transparent text-muted hover:bg-white/5 hover:text-white"}`}>
                <Icon size={19} />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-3"><SyncStatus /></div>
        </aside>
        <div className="min-w-0 md:col-start-2">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-[#090c10]/85 px-4 backdrop-blur md:px-8">
            <p className="font-display text-sm font-bold tracking-[.14em] text-muted">PERSONAL HYPERTROPHY SYSTEM</p>
            <SyncStatus />
          </header>
          <main>{children}</main>
        </div>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-xl border border-line bg-[#10151c]/95 p-1.5 shadow-2xl backdrop-blur md:hidden" aria-label="移动端主导航">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-medium transition-colors ${isActive(href) ? "bg-primary text-black" : "text-muted hover:bg-white/5 hover:text-white"}`}>
              <Icon size={19} strokeWidth={isActive(href) ? 2.6 : 2} />{label}
            </Link>
          ))}
        </nav>
      </div>
    </AuthGate>
  );
}
