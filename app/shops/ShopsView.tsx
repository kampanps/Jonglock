"use client";
// หน้า "ร้านที่จองล็อกแล้ว" — ดีไซน์: Figma utils › section "ร้านที่จองล็อกแล้ว (Jonglock)"
// ให้ร้านเช็กว่าใครขายอะไรไปแล้ว ก่อนเลือกล็อก (กฎห้ามขายซ้ำในระยะ 3 ล็อก) · ข้อมูลจาก RPC shop_directory()
// ส่วนแสดงผลอย่างเดียว (ไม่ดึงข้อมูลเอง) — page.tsx ดึงข้อมูล, app/dev/shops ใช้ข้อมูลตัวอย่างตอนพัฒนา
import { useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Page } from "@/components/ui";

export type Shop = { shop_name: string; products: string[]; stall_id: string };
export type Directory = { server_now: string; total_stalls: number; shops: Shop[] };

const TOP_CHIPS = 8;
const norm = (s: string) => s.trim().toLowerCase();
const clock = (d: Date) => d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Bangkok" });

/** สินค้าที่มีคนขายแล้ว + จำนวนร้าน (นับแบบไม่สนตัวพิมพ์/ช่องว่าง) เรียงจากมากไปน้อย */
function productCounts(shops: Shop[]) {
  const m = new Map<string, { label: string; count: number }>();
  for (const s of shops) for (const p of new Set(s.products.map(norm).filter(Boolean))) {
    const label = s.products.find((x) => norm(x) === p) ?? p;
    const cur = m.get(p);
    if (cur) cur.count++; else m.set(p, { label: label.trim(), count: 1 });
  }
  return [...m.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "th"));
}

export default function ShopsView({ dir, failed, onRetry }: { dir: Directory | null; failed: boolean; onRetry: () => void }) {
  const [q, setQ] = useState("");
  const [allChips, setAllChips] = useState(false);

  const products = useMemo(() => productCounts(dir?.shops ?? []), [dir]);
  const shown = useMemo(() => {
    const k = norm(q);
    const all = dir?.shops ?? [];
    return k ? all.filter((s) => norm(s.shop_name).includes(k) || s.products.some((p) => norm(p).includes(k))) : all;
  }, [dir, q]);

  const booked = dir?.shops.length ?? 0;
  const updated = dir ? clock(new Date(dir.server_now)) : null;
  const chips = allChips ? products : products.slice(0, TOP_CHIPS);

  return (
    <Page title="ร้านที่จองล็อกแล้ว" wide back="/">
      <div className="grid gap-5 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-8">
        {/* ===== สรุป ===== */}
        <section className="space-y-5" aria-label="สรุป">
          <p className="flex items-center gap-2 text-xs text-slate-400" aria-live="polite">
            <i className={`size-2 shrink-0 rounded-full ${failed ? "bg-amber-400" : dir ? "bg-emerald-400" : "bg-slate-500"}`} />
            {!dir && !failed ? "กำลังโหลดรายชื่อร้าน…"
              : failed ? <span className="text-amber-300">อัปเดตไม่สำเร็จ{updated ? ` · แสดงข้อมูลเมื่อ ${updated} น.` : ""}</span>
              : `อัปเดตอัตโนมัติทุก 1 นาที · ล่าสุด ${updated} น.`}
          </p>

          {failed && (
            <div role="alert" className="flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3">
              <p className="flex-1 text-sm leading-relaxed text-amber-100">เชื่อมต่อไม่ได้ {dir ? "รายชื่ออาจไม่ใช่ล่าสุด " : ""}ระบบจะลองใหม่เองใน 1 นาที</p>
              <button onClick={onRetry} className="shrink-0 rounded-xl bg-amber-400/20 px-3.5 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-400/30">ลองอีกครั้ง</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[["จองล็อกแล้ว", dir ? `${booked} ร้าน` : null], ["ล็อกที่ยังว่าง", dir ? `${dir.total_stalls - booked} / ${dir.total_stalls}` : null]].map(([k, v]) => (
              <div key={k} className="space-y-1 rounded-2xl bg-white/[0.04] p-4">
                <p className="text-xs text-slate-400">{k}</p>
                {v ? <p className="text-2xl font-bold text-slate-50">{v}</p> : <div className="h-8 w-24 rounded-lg bg-white/10" />}
              </div>
            ))}
          </div>

          <p className="rounded-2xl bg-sky-400/10 p-3 text-sm leading-relaxed text-sky-200">🏷 ห้ามขายของซ้ำกับร้านในระยะ 3 ล็อกซ้าย–ขวา (ยกเว้นโซนเสื้อผ้า) เช็กก่อนว่ามีใครขายอะไรแล้ว</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-100">ของที่มีคนขายแล้ว</h2>
              {products.length > 0 && <span className="text-xs text-slate-500">แตะเพื่อดูร้าน</span>}
            </div>
            {!dir ? (
              <div className="flex flex-wrap gap-2">{[72, 104, 88, 96, 120].map((w) => <span key={w} className="h-8 rounded-full bg-white/10" style={{ width: w }} />)}</div>
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-500">ยังไม่มี</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {chips.map((p) => {
                  const on = norm(q) === norm(p.label);
                  return (
                    <button key={p.label} onClick={() => setQ(on ? "" : p.label)} aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-neon-cyan bg-neon-cyan/15 text-white" : "border-violet-400/40 bg-violet-400/15 text-violet-50 hover:bg-violet-400/25"}`}>
                      {p.label}<span className="text-xs font-semibold text-violet-300">{p.count}</span>
                    </button>
                  );
                })}
                {products.length > TOP_CHIPS && (
                  <button onClick={() => setAllChips((v) => !v)} className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-sm text-slate-400 transition hover:text-white">
                    {allChips ? "ย่อ" : `+ อีก ${products.length - TOP_CHIPS} อย่าง`}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ===== รายการร้าน ===== */}
        <section className="space-y-5" aria-label="รายการร้าน">
          <label className="flex h-12 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 transition focus-within:border-neon-cyan">
            <FaSearch className="shrink-0 text-slate-500" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อร้าน หรือสินค้า เช่น ชาไทย" aria-label="ค้นหาร้านหรือสินค้า"
              className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
            {q && <button onClick={() => setQ("")} aria-label="ล้างคำค้นหา" className="p-1 text-slate-400 hover:text-white"><FaTimes /></button>}
          </label>

          {!dir ? (
            failed ? null : (
              <ul className="grid gap-3 lg:grid-cols-2" aria-hidden>
                {[180, 220, 150, 200].map((w) => (
                  <li key={w} className="space-y-3 rounded-2xl bg-white/[0.03] p-4"><div className="h-5 rounded-md bg-white/10" style={{ width: w }} /><div className="h-4 w-28 rounded-md bg-white/5" /></li>
                ))}
              </ul>
            )
          ) : shown.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
              <p className="text-3xl" aria-hidden>🔎</p>
              {q ? (<>
                <p className="font-semibold text-slate-100">ยังไม่มีร้านไหนขาย “{q.trim()}”</p>
                <p className="text-sm leading-relaxed text-slate-400">ถ้าคุณขายสินค้านี้ จองล็อกไหนก็ไม่ซ้ำกับร้านข้างเคียง<br />ลองค้นด้วยคำอื่น เผื่อเขียนต่างกัน</p>
                <button onClick={() => setQ("")} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10">ล้างคำค้นหา</button>
              </>) : <p className="text-slate-400">ยังไม่มีร้านจองล็อก</p>}
            </div>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {shown.map((s) => (
                <li key={s.stall_id} className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 font-semibold text-slate-50">{s.shop_name}</p>
                    <span className="shrink-0 rounded-lg bg-violet-400/20 px-2.5 py-1 text-xs font-semibold text-violet-200">ล็อก {s.stall_id}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.products.map((p, i) => <span key={`${p}-${i}`} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">{p}</span>)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {dir && (
            <p className="text-center text-xs leading-relaxed text-slate-500">
              {q ? `พบ ${shown.length} จาก ${booked} ร้านที่จองล็อกแล้ว` : `ทั้งหมด ${booked} ร้านที่จองล็อกแล้ว`}<br />
              แสดงเฉพาะชื่อร้าน ล็อก และสินค้า ไม่แสดงชื่อผู้ลงทะเบียนหรือเบอร์โทร
            </p>
          )}
        </section>
      </div>
    </Page>
  );
}
