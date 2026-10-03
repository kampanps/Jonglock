"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { card } from "@/lib/admin";

type F = { open: string; edit: string; close: string; range: number; hold: number; one: boolean };
const toIn = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16); // แสดงเป็นเวลาไทย
const toIso = (v: string) => new Date(v + ":00+07:00").toISOString();

const Step = ({ v, set, unit, min = 1, max = 60 }: { v: number; set: (n: number) => void; unit: string; min?: number; max?: number }) => (
  <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
    <button type="button" onClick={() => set(Math.max(min, v - 1))} className="size-9 rounded-xl hover:bg-white/10">−</button>
    <span className="w-16 text-center text-white"><b>{v}</b> <small className="text-slate-400">{unit}</small></span>
    <button type="button" onClick={() => set(Math.min(max, v + 1))} className="size-9 rounded-xl hover:bg-white/10">+</button>
  </div>
);
const Toggle = ({ on, set }: { on: boolean; set: (b: boolean) => void }) => (
  <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className={`h-7 w-12 rounded-full p-0.5 transition ${on ? "bg-emerald-400" : "bg-white/15"}`}><i className={`block size-6 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} /></button>
);
const Rule = ({ t, d, children }: { t: string; d: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-t border-white/5 py-4 first:border-0"><div><p className="font-medium text-slate-100">{t}</p><p className="text-xs text-slate-500">{d}</p></div>{children}</div>
);

export default function Settings() {
  const [f, setF] = useState<F | null>(null); const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    const { data: c } = await supabase.from("app_settings").select("*").single();
    if (c) setF({ open: toIn(c.open_at), edit: toIn(c.edit_deadline), close: toIn(c.close_at), range: c.conflict_range, hold: c.hold_minutes, one: c.one_per_account });
  }, []);
  useEffect(() => { load(); }, [load]);
  if (!f) return null;
  const up = (p: Partial<F>) => setF({ ...f, ...p });
  async function save() {
    if (!(f!.open < f!.edit && f!.edit <= f!.close)) return setMsg("ลำดับเวลาต้องเป็น เปิดจอง < หมดเขตยกเลิก ≤ ปิดรับจอง");
    const { error } = await supabase.rpc("admin_save_settings", { p_open: toIso(f!.open), p_edit: toIso(f!.edit), p_close: toIso(f!.close), p_range: f!.range, p_hold: f!.hold, p_one: f!.one });
    setMsg(error ? error.message : "บันทึกแล้ว ✓");
  }
  const dt = "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 [color-scheme:dark]";
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-white">กำหนดการและการตั้งค่า</h1><p className="text-sm text-slate-400">การเปลี่ยนแปลงมีผลกับผู้ค้าทันทีหลังกดบันทึก</p></div>
        <div className="flex gap-2"><button onClick={load} className="rounded-2xl border border-white/10 px-4 py-2.5 text-slate-200 hover:bg-white/5">ยกเลิก</button>
          <button onClick={save} className="rounded-2xl bg-gradient-to-r from-neon-violet to-neon-cyan px-4 py-2.5 font-semibold text-slate-950 hover:shadow-glow-cyan">บันทึกการเปลี่ยนแปลง</button></div>
      </div>
      {msg && <p role="status" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200">{msg}</p>}
      <section className={card}><h2 className="mb-4 font-semibold text-white">ช่วงเวลา</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {([["open", "เปิดรับจอง"], ["edit", "หมดเขตยกเลิก / ย้ายล็อค"], ["close", "ปิดรับจอง"]] as const).map(([k, l]) => (
            <label key={k} className="space-y-1.5 text-sm text-slate-300">{l}<input type="datetime-local" className={dt} value={f[k]} onChange={(e) => up({ [k]: e.target.value })} /></label>))}
        </div></section>
      <section className={card}><h2 className="mb-2 font-semibold text-white">กฎการจอง</h2>
        <Rule t="ระยะห้ามขายของซ้ำ" d="นับจากร้านที่จองแล้วที่ใกล้ที่สุด ซ้าย–ขวา–แถวตรงข้าม (ล็อคว่างถูกข้าม)"><Step v={f.range} set={(range) => up({ range })} unit="ล็อค" max={12} /></Rule>
        <Rule t="เวลากันล็อคระหว่างยืนยัน" d="เวลานับถอยหลังในหน้ายืนยันการจอง"><Step v={f.hold} set={(hold) => up({ hold })} unit="นาที" /></Rule>
        <Rule t="1 บัญชีจองได้ 1 ร้าน" d="กันการจองเผื่อหลายล็อคด้วยบัญชีเดียว"><Toggle on={f.one} set={(one) => up({ one })} /></Rule>
      </section>
    </div>
  );
}
