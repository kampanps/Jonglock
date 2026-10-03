"use client";
import { ReactNode, useState } from "react";
import { FaLine, FaUser, FaStore, FaUsers, FaTag } from "react-icons/fa";
import { inputCls } from "./ui";
import type { Shop } from "@/lib/supabase";

type V = Omit<Shop, "id">;
const empty: V = { owner_name: "", student_id: "", shop_name: "", phone: "", products: [], guardians: [], line_joined: false };
const SUGGEST = ["เครื่องดื่ม", "ของทอด", "ขนมหวาน", "อาหารจานเดียว", "เสื้อผ้า", "งานคราฟต์"];
const LINE_URL = process.env.NEXT_PUBLIC_LINE_GROUP_URL || "#";

const Card = ({ icon, title, badge, children }: { icon: ReactNode; title: string; badge?: ReactNode; children: ReactNode }) => (
  <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-400/15 text-violet-300">{icon}</span><h2 className="font-semibold text-slate-100">{title}</h2></div>
      {badge}
    </div>
    {children}
  </section>
);
const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div><label className="mb-1.5 block text-sm text-slate-300">{label} <span className="text-neon-pink">*</span></label>{children}{hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}</div>
);

export default function ShopForm({ initial = empty, submitLabel, showLine, lockedStudentId, onSubmit }:
  { initial?: V; submitLabel: string; showLine?: boolean; lockedStudentId?: string; tone?: string; onSubmit: (v: V) => Promise<string | void> }) {
  const [v, setV] = useState<V>({ ...initial, products: initial.products.filter(Boolean) });
  const [draft, setDraft] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof V) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  const addTag = (t: string) => {
    const s = t.trim().replace(/,$/, "");
    if (s && !v.products.some((p) => p.toLowerCase() === s.toLowerCase())) setV((x) => ({ ...x, products: [...x.products, s] }));
    setDraft("");
  };
  const delTag = (t: string) => setV({ ...v, products: v.products.filter((p) => p !== t) });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const products = draft.trim() && !v.products.includes(draft.trim()) ? [...v.products, draft.trim()] : v.products;
    const clean = { ...v, student_id: lockedStudentId || v.student_id, products, guardians: v.guardians.map((s) => s.trim()).filter(Boolean) };
    if (!clean.products.length) return setErr("เพิ่มของที่ขายอย่างน้อย 1 อย่าง");
    if (!/^0\d{8,9}$/.test(clean.phone.replace(/-/g, ""))) return setErr("เบอร์โทรไม่ถูกต้อง (เช่น 0812345678)");
    setBusy(true); const m = await onSubmit({ ...clean, phone: clean.phone.replace(/-/g, "") }); setBusy(false); if (m) setErr(m);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5">
      <Card icon={<FaUser />} title="ผู้ลงทะเบียน">
        <Field label="ชื่อ–นามสกุล" hint="ดึงจากบัญชีมหาวิทยาลัยให้แล้ว แก้ไขได้"><input required className={inputCls} value={v.owner_name} onChange={set("owner_name")} /></Field>
        <Field label="รหัสนักศึกษา" hint={lockedStudentId ? "ดึงจากอีเมลมหาวิทยาลัยอัตโนมัติ แก้ไขไม่ได้" : undefined}>
          {lockedStudentId ? (
            <div className="relative">
              <input readOnly tabIndex={-1} aria-readonly value={lockedStudentId} className="w-full cursor-not-allowed rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5 pr-11 text-slate-400 outline-none" />
              <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
            </div>
          ) : <input required inputMode="numeric" className={inputCls} value={v.student_id} onChange={set("student_id")} />}
        </Field>
        <Field label="เบอร์โทร" hint="ทีมงานจะติดต่อเบอร์นี้ในวันงาน"><input required inputMode="tel" className={inputCls} value={v.phone} onChange={set("phone")} placeholder="081-234-5678" /></Field>
      </Card>

      <Card icon={<FaStore />} title="ร้านค้า">
        <Field label="ชื่อร้าน"><input required className={inputCls} value={v.shop_name} onChange={set("shop_name")} /></Field>
        <Field label="ของที่ขาย">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 focus-within:border-neon-cyan focus-within:shadow-glow-cyan">
            {v.products.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/15 px-3 py-1 text-sm text-violet-100">
                {t}<button type="button" onClick={() => delTag(t)} aria-label={`ลบ ${t}`} className="text-violet-300 hover:text-white">×</button>
              </span>
            ))}
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => addTag(draft)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(draft); } }}
              placeholder="+ พิมพ์สินค้า แล้วกด Enter" className="min-w-40 flex-1 bg-transparent py-1 text-slate-100 outline-none placeholder:text-slate-500" />
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          {SUGGEST.filter((s) => !v.products.includes(s)).map((s) => (
            <button type="button" key={s} onClick={() => addTag(s)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-neon-cyan/50 hover:text-white">+ {s}</button>
          ))}
        </div>
        <p className="flex gap-2 rounded-2xl bg-sky-400/10 p-3 text-sm text-sky-200"><FaTag className="mt-1 shrink-0" />ระบบใช้ข้อมูลนี้ไม่ให้คุณขายของซ้ำกับร้านในระยะ 3 ล็อกซ้าย–ขวา</p>
      </Card>

      <Card icon={<FaUsers />} title="ผู้ปกครอง / บุคคลภายนอก" badge={<span className="rounded-full bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan">{v.guardians.filter(Boolean).length} คน</span>}>
        <p className="text-sm text-slate-400">คนที่ไม่ใช่นักศึกษาแต่จะมาช่วยขาย ต้องลงชื่อไว้เพื่อผ่านจุดตรวจ เพิ่มได้ไม่จำกัด</p>
        {v.guardians.map((g, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={g} placeholder="ชื่อ–นามสกุล" onChange={(e) => setV({ ...v, guardians: v.guardians.map((x, j) => (j === i ? e.target.value : x)) })} />
            <button type="button" aria-label="ลบ" onClick={() => setV({ ...v, guardians: v.guardians.filter((_, j) => j !== i) })} className="size-11 shrink-0 rounded-2xl border border-white/10 text-slate-400 hover:text-rose-300">×</button>
          </div>
        ))}
        <button type="button" onClick={() => setV({ ...v, guardians: [...v.guardians, ""] })} className="w-full rounded-2xl border border-dashed border-neon-cyan/40 bg-neon-cyan/5 py-3 text-neon-cyan transition hover:bg-neon-cyan/10">+ เพิ่มบุคคลภายนอก</button>
      </Card>

      {showLine && (
        <Card icon={<FaLine />} title="กลุ่มไลน์ผู้ค้า">
          <p className="text-sm text-slate-400">ประกาศสำคัญและการยืนยันตัวตนจะแจ้งในกลุ่มนี้ ทีมงานจะตรวจว่าคุณเข้ากลุ่มแล้วก่อนเปิดให้จอง</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://line.me/R/ti/g/QwAUE--TUr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#06C755] px-5 py-2.5 font-semibold text-white transition hover:shadow-[0_0_22px_rgba(6,199,85,.55)] active:scale-95">
              <FaLine className="text-xl" />เข้ากลุ่มไลน์
            </a>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={!!v.line_joined} onChange={(e) => setV({ ...v, line_joined: e.target.checked })} className="size-5 accent-emerald-400" />ฉันเข้ากลุ่มแล้ว
            </label>
          </div>
        </Card>
      )}

      {err && <p role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</p>}
      <div className="sticky bottom-3 z-10 space-y-2 pt-2">
        <button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-neon-violet to-neon-cyan py-4 text-lg font-bold text-slate-950 shadow-glow-violet transition hover:shadow-glow-cyan active:scale-[0.98] disabled:opacity-60">
          {busy ? "กำลังบันทึก…" : `${submitLabel}  ›`}
        </button>
        <p className="text-center text-xs text-slate-500">ข้อมูลถูกบันทึกอัตโนมัติ ออกจากหน้านี้ได้โดยไม่หาย</p>
      </div>
    </form>
  );
}
