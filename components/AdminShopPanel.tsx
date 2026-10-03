"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AShop, ALL, LineBadge, fmtT } from "@/lib/admin";

const Row = ({ k, v }: { k: string; v?: string | null }) => <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm"><span className="text-slate-500">{k}</span><span className="text-right text-slate-100">{v || "-"}</span></div>;

// แผงรายละเอียดร้าน + ย้าย/ยกเลิก (Bypass เวลาและเงื่อนไขทั้งหมด) ใช้ร่วมกันทั้ง Drawer และผังสด
export default function AdminShopPanel({ shop, rows, onDone }: { shop: AShop; rows: AShop[]; onDone: () => void }) {
  const [dest, setDest] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const taken = new Set(rows.map((r) => r.stall_id));
  const free = ALL.filter((i) => !taken.has(i));
  async function run(p: PromiseLike<{ error: { message: string } | null }>) { setBusy(true); const { error } = await p; setBusy(false); if (error) setErr(error.message); else { setErr(""); setDest(""); onDone(); } }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-violet-300 text-xl font-bold text-slate-950">{shop.stall_id}</span>
        <div><h3 className="text-lg font-bold text-white">{shop.shop_name}</h3><p className="text-xs text-slate-400">แถว {shop.stall_id[0]} · คอลัมน์ {shop.stall_id.slice(1)} · จองเมื่อ {fmtT(shop.booked_at)}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">{shop.products.map((p) => <span key={p} className="rounded-full border border-violet-400/40 bg-violet-400/15 px-3 py-1 text-sm text-violet-100">{p}</span>)}</div>
      <div><Row k="ชื่อ" v={shop.owner_name} /><Row k="รหัสนักศึกษา" v={shop.student_id} /><Row k="อีเมล" v={shop.email} /><Row k="เบอร์โทร" v={shop.phone} />
        <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">กลุ่มไลน์</span><LineBadge s={shop.line_status} /></div></div>
      <div><p className="mb-1 text-sm text-slate-400">บุคคลภายนอก · {shop.guardians.length} คน</p>{shop.guardians.map((g) => <p key={g} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100">{g}</p>)}</div>
      {err && <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</p>}
      <div className="flex gap-2">
        <select value={dest} onChange={(e) => setDest(e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100">
          <option value="">ย้ายร้านไปล็อคอื่น…</option>{free.map((f) => <option key={f}>{f}</option>)}
        </select>
        <button disabled={!dest || busy} onClick={() => run(supabase.rpc("admin_move_booking", { p_booking: shop.booking_id, p_stall: dest }))} className="rounded-2xl bg-white/10 px-4 text-sm text-slate-100 transition hover:bg-white/15 disabled:opacity-40">ย้าย</button>
      </div>
      <button disabled={busy} onClick={() => confirm(`ยกเลิกการจอง ${shop.stall_id} ของ “${shop.shop_name}”? (ไม่สนเงื่อนไขเวลา)`) && run(supabase.rpc("admin_cancel_booking", { p_booking: shop.booking_id }))}
        className="w-full rounded-2xl border border-rose-400/40 bg-rose-500/10 py-3 font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-40">ยกเลิกการจอง</button>
    </div>
  );
}
