"use client";
import Link from "next/link";
import { useAdminShops, card } from "@/lib/admin";

export default function Overview() {
  const { rows } = useAdminShops();
  if (!rows) return null;
  const stats = [["จองแล้ว", `${rows.length} / 48 ล็อค`], ["ล็อคว่าง", `${48 - rows.length} ล็อค`],
    ["รอตรวจกลุ่มไลน์", `${rows.filter((r) => r.line_status === "pending").length} ร้าน`], ["บุคคลภายนอก", `${rows.reduce((a, r) => a + r.guardians.length, 0)} คน`]];
  const byRow = ["A", "B", "C", "D"].map((z) => [z, rows.filter((r) => r.stall_id[0] === z).length] as const);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">ภาพรวม</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([k, v]) => <div key={k} className={card}><p className="text-sm text-slate-400">{k}</p><p className="mt-2 text-2xl font-bold text-white">{v}</p></div>)}</div>
      <div className={`${card} space-y-3`}>
        <p className="font-semibold text-slate-100">การจองแต่ละแถว</p>
        {byRow.map(([z, n]) => <div key={z} className="flex items-center gap-3 text-sm text-slate-300"><b className="w-4">{z}</b><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan transition-all" style={{ width: `${(n / 12) * 100}%` }} /></div><span>{n}/12</span></div>)}
      </div>
      <div className="flex flex-wrap gap-3 text-sm">{[["/admin/shops", "ดูร้านค้าทั้งหมด"], ["/admin/map", "เปิดผังล็อคสด"], ["/admin/line", "ตรวจกลุ่มไลน์"]].map(([h, t]) => <Link key={h} href={h} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-200 transition hover:border-neon-cyan/50">{t} →</Link>)}</div>
    </div>
  );
}
