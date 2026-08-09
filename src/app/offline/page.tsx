import Link from "next/link";
import { CloudOff, Dumbbell } from "lucide-react";

export default function OfflinePage() {
  return (
    <section className="page-wrap grid min-h-[70vh] place-items-center">
      <div className="panel max-w-md border-t-2 border-t-primary p-8 text-center">
        <CloudOff className="mx-auto text-primary" size={38} />
        <h1 className="mt-5 text-2xl font-bold">当前没有网络</h1>
        <p className="mt-3 leading-7 text-muted">已缓存的训练和动作仍可使用。未访问过的页面需要联网加载一次。</p>
        <Link className="btn-primary mt-6" href="/"><Dumbbell size={18} />返回训练系统</Link>
      </div>
    </section>
  );
}
