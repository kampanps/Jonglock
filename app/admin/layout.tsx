"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { usePresence } from "@/lib/live";
import LogoutButton from "@/components/LogoutButton";

const NAV = [["/admin", "ภาพรวม"], ["/admin/shops", "ร้านค้า"], ["/admin/map", "ผังล็อคสด"], ["/admin/line", "ตรวจกลุ่มไลน์"], ["/admin/settings", "กำหนดการ"]];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter(); const path = usePathname(); const uid = useGuard();
  const [ok, setOk] = useState(false); const online = usePresence(true);
  useEffect(() => { if (uid) supabase.rpc("is_admin").then(({ data }) => (data ? setOk(true) : router.replace("/"))); }, [uid, router]);
  if (!ok) return null;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[14rem_1fr]">
      <aside className="flex items-center gap-2 overflow-x-auto border-b border-white/10 bg-slate-950 p-3 md:sticky md:top-0 md:h-screen md:flex-col md:items-stretch md:border-b-0 md:border-r md:p-4">
        <div className="hidden pb-4 md:block"><p className="font-bold text-white">MUSIC FEST 2569</p><p className="text-xs text-slate-500">องค์การนักศึกษา · Admin</p></div>
        {NAV.map(([href, t]) => (
          <Link key={href} href={href} className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm transition ${path === href ? "border-violet-400/40 bg-violet-400/15 text-white shadow-glow-violet" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}>{t}</Link>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:mt-auto md:flex-col md:items-stretch">
          <Link href="/" className="rounded-2xl border border-white/10 px-4 py-2.5 text-center text-sm text-slate-300 transition hover:border-neon-cyan/50 hover:text-white">🏠 <span className="hidden md:inline">กลับไปหน้าผู้ใช้งานปกติ</span><span className="md:hidden">ผู้ใช้</span></Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">
        <div className="mb-5 flex justify-end">
          <span className="flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,.3)]">
            <i className="size-2 animate-pulse rounded-full bg-emerald-400" />LIVE · {online} คนออนไลน์</span>
        </div>
        {children}
      </main>
    </div>
  );
}
