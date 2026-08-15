"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, CloudOff, RefreshCw } from "lucide-react";
import { db } from "@/lib/db";
import { syncNow, type SyncResult } from "@/lib/sync";

export function SyncStatus() {
  const pending = useLiveQuery(() => db.syncQueue.count(), [], 0);
  // 初始默认在线，避免 SSR 与客户端在 navigator.onLine 上产生水合不一致。
  const [online, setOnline] = useState(true);
  const [status, setStatus] = useState<SyncResult>("local-only");
  const [syncing, setSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    setStatus(await syncNow());
    setSyncing(false);
  };

  useEffect(() => {
    const onOnline = () => { setOnline(true); void runSync(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void syncNow().then(setStatus);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const label = !online ? "离线可用" : pending ? `${pending} 项待同步` : status === "synced" ? "已同步" : "本地模式";
  const Icon = !online ? CloudOff : pending || syncing ? RefreshCw : Check;
  return (
    <button className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white" onClick={runSync} type="button">
      <Icon size={15} className={syncing ? "animate-spin text-primary" : status === "synced" ? "text-success" : ""} />{label}
    </button>
  );
}
