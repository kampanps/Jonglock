"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminShops, AShop, StallChip, card, fmtT } from "@/lib/admin";

const TABS: [string, AShop["line_status"][]][] = [["รอตรวจ", ["pending"]], ["ยืนยันแล้ว", ["verified"]], ["ไม่พบในกลุ่ม", ["missing", "none"]]];
const BTN: [string, AShop["line_status"], string][] = [["ไม่พบในกลุ่ม", "missing", "border-rose-400/40 text-rose-300 hover:bg-rose-500/10"], ["ยืนยัน", "verified", "border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10"], ["รอตรวจ", "pending", "border-amber-300/40 text-amber-200 hover:bg-amber-300/10"]];

export default function Line() {
  const { rows, reload } = useAdminShops(); const [tab, setTab] = useState(0); const [err, setErr] = useState("");
  if (!rows) return null;
  const set = async (shop: string, status: string) => { const { error } = await supabase.rpc("admin_set_line", { p_shop: shop, p_status: status }); setErr(error?.message ?? ""); reload(); };
  const list = rows.filter((r) => TABS[tab][1].includes(r.line_status));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-white">ตรวจกลุ่มไลน์</h1><p className="text-sm text-slate-400">เทียบรายชื่อในกลุ่มไลน์ผู้ค้ากับร้านที่แจ้งว่าเข้ากลุ่มแล้ว</p></div>
        <a href={process.env.NEXT_PUBLIC_LINE_GROUP_URL || "https://line.me/R/ti/g/QwAUE--TUr"} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-[#06C755] px-4 py-2.5 font-semibold text-white">เปิดกลุ่มไลน์ผู้ค้า</a>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
        {TABS.map(([t, st], i) => <button key={t} onClick={() => setTab(i)} className={`rounded-xl py-2.5 text-sm transition ${tab === i ? "bg-violet-400/25 text-white" : "text-slate-400 hover:text-white"}`}>{t} <span className="ml-1 rounded-full bg-white/10 px-2 text-xs">{rows.filter((r) => st.includes(r.line_status)).length}</span></button>)}
      </div>
      {err && <p role="alert" className="rounded-2xl bg-rose-500/10 px-4 py-2 text-rose-200">{err}</p>}
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.booking_id} className={`${card} !p-4 flex flex-wrap items-center gap-4`}>
            <StallChip id={r.stall_id} />
            <div className="min-w-0 flex-1"><p className="font-semibold text-white">{r.shop_name}</p><p className="text-xs text-slate-500">{r.owner_name} · {r.student_id} · {r.phone}</p></div>
            <span className="text-xs text-slate-500">จองเมื่อ {fmtT(r.booked_at)}</span>
            <div className="flex gap-2">{BTN.filter(([, s]) => !TABS[tab][1].includes(s)).map(([t, s, c]) => <button key={s} onClick={() => set(r.shop_id, s)} className={`rounded-xl border px-3 py-1.5 text-sm transition ${c}`}>{t}</button>)}</div>
          </div>
        ))}
        {!list.length && <p className="py-10 text-center text-slate-500">ไม่มีรายการในแท็บนี้</p>}
      </div>
    </div>
  );
}
