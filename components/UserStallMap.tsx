"use client";
import { ReactNode, useState } from "react";
// ผังฝั่งผู้ใช้ (แยกจาก StallMap ของ Admin): แยกโซนเสื้อผ้า/อาหาร + ล็อกแถวที่ยังไม่เปิด + เอฟเฟกต์เรียบๆ

const S = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`pointer-events-none flex select-none items-center justify-center text-center text-xs text-slate-400 sm:text-sm ${className}`}>{children}</div>
);
const Fence = () => <div className="h-0.5 w-full rounded bg-white/15" />;
const Zone = ({ items, tone }: { items: string[]; tone: string }) => (
  <div className={`grid h-11 overflow-hidden rounded-xl border ${tone}`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
    {items.map((t, i) => <S key={i} className={`px-1 ${i ? "border-l border-inherit" : ""}`}>{t}</S>)}
  </div>
);
const Bar = () => <i className="h-3.5 rounded border border-amber-300/30 bg-amber-300/10" />;
const Badge = ({ children, tone }: { children: ReactNode; tone: string }) => <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium leading-tight sm:text-xs ${tone}`}>{children}</span>;
const FOOD = "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
const CLOTH = "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200";
const ROWS = [["A"], ["B", "C"], ["D"]];

type Props = { taken: Set<string>; mine?: string | null; selected?: string | null; held?: Set<string>; locked?: Set<string>; dim?: Set<string>; readOnly?: boolean; onPick?: (id: string) => void };

export default function UserStallMap({ taken, mine = null, selected = null, held = new Set<string>(), locked = new Set<string>(), dim = new Set<string>(), readOnly = false, onPick }: Props) {
  const [zoom, setZoom] = useState<string | null>(null);
  const freeIn = (z: string) => 12 - Array.from(taken).filter((id) => id[0] === z).length;

  const cell = (id: string, z: string) => {
    const t = taken.has(id), h = held.has(id), lk = locked.has(id), isMine = id === mine, sel = id === selected;
    const color = isMine ? "border-violet-300 bg-violet-400/30 text-white"
      : sel ? "border-sky-300 bg-sky-400/20 text-white ring-1 ring-sky-300"
      : lk ? "border-amber-300/30 bg-white/5 text-slate-400"
      : h ? "border-amber-300/60 bg-amber-300/20 text-amber-100"
      : t ? "border-rose-400/25 bg-rose-400/10 text-rose-300/70"
      : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    const cls = `flex min-w-0 items-center justify-center rounded-lg border text-xs font-medium transition-all duration-500 sm:text-sm ${zoom === z ? "h-14" : "h-10"} ${color} ${dim.has(id) && !t && !isMine ? "opacity-45" : ""}`;
    const inner = lk ? <span className="flex flex-col items-center leading-none"><span>{id}</span><span className="mt-0.5 text-[9px] text-amber-200/80">🔒 รอเปิด</span></span> : id;
    if (readOnly) return <div key={id} aria-disabled className={`${cls} select-none`}>{inner}</div>;
    const off = t || h || lk;
    return <button key={id} disabled={off} title={lk ? "รอเปิด: ต้องจองแถวก่อนหน้าให้เต็มก่อน" : undefined} onClick={() => onPick?.(id)}
      className={`${cls} ${off ? "cursor-not-allowed" : "hover:-translate-y-0.5 hover:border-white/40"}`}>{inner}</button>;
  };
  const ids = (z: string) => Array.from({ length: 12 }, (_, i) => z + (i + 1));

  return (
    <div className="space-y-3">
      <S className="mx-auto h-9 w-1/2 rounded-xl border border-white/10 bg-white/5">เต็นท์ศิลปิน</S>
      <S className="mx-auto h-14 w-3/4 rounded-2xl border border-violet-300/30 bg-violet-400/10 text-lg text-violet-200">เวที</S>
      <Fence />
      <div className="grid grid-cols-[1fr_5.5rem] gap-3 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <S>ลานชมคอนเสิร์ต · ฟาง</S>
          <div className="flex justify-between">{[0, 1].map((s) => <div key={s} className="grid w-[42%] gap-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="grid grid-cols-2 gap-2"><Bar /><Bar /></div>)}</div>)}</div>
        </div>
        <S className="rounded-2xl border border-teal-400/30 bg-teal-400/10 text-teal-100">หอพระ</S>
      </div>
      <Fence />
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Zone items={["กิจกรรม SO.", "จุดลงทะเบียน"]} tone="border-sky-400/30 bg-sky-400/10" />
        <Zone items={["รับเสื้อเฟรชชี่", "กิจกรรม SC."]} tone="border-sky-400/30 bg-sky-400/10" />
      </div>
      <div className="grid grid-cols-[4fr_3fr] gap-3 pb-2">
        <Zone items={["SMO", "SMO", "SMO", "SMO"]} tone="border-teal-400/30 bg-teal-400/10" />
        <Zone items={["ชมรม", "ชมรม", "ชมรม"]} tone="border-indigo-400/30 bg-indigo-400/10" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 sm:text-sm">
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-emerald-400/50 bg-emerald-400/15" />ว่าง</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-rose-400/40 bg-rose-400/15" />มีร้านแล้ว</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-amber-300/60 bg-amber-300/25" />กำลังตัดสินใจ</span>
            {mine && <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-violet-400" />ล็อกของคุณ</span>}
          </div>
          <span className="text-slate-500">{zoom ? <button onClick={() => setZoom(null)} className="text-sky-300 underline">ย่อกลับ</button> : "แตะป้ายแถวเพื่อซูม"}</span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="space-y-3 transition-[width] duration-500 ease-out" style={{ width: zoom ? "max(190%, 1300px)" : "max(100%, 640px)" }}>
            {ROWS.map((g, gi) => (
              <div key={g.join()} className={`space-y-2 ${gi ? "pt-6" : ""}`}>
                {/* ป้ายโซน: แถว A = อาหาร · กลุ่ม B/C = เสื้อผ้า (คอลัมน์ 1–4) + อาหาร (5–12) */}
                <div className="flex gap-2"><div className="w-16 shrink-0" />
                  {gi === 1 ? (
                    <div className="grid flex-1 grid-cols-12 gap-1.5"><div className="col-span-4"><Badge tone={CLOTH}>โซนเสื้อผ้า (เปิดแถว D ก่อน)</Badge></div><div className="col-span-8"><Badge tone={FOOD}>โซนอาหารและเครื่องดื่ม</Badge></div></div>
                  ) : gi === 0 ? <Badge tone={FOOD}>โซนอาหารและเครื่องดื่ม</Badge> : null}
                </div>
                {g.map((z) => (
                  <div key={z} className={`flex items-center gap-2 transition duration-500 ${zoom && zoom !== z ? "opacity-30" : ""}`}>
                    <button onClick={() => setZoom(zoom === z ? null : z)} aria-label={`ซูมแถว ${z}`}
                      className={`sticky left-0 z-[1] flex w-16 shrink-0 flex-col items-center rounded-xl border py-1 leading-tight transition ${zoom === z ? "border-sky-300 bg-sky-400/20" : "border-white/15 bg-slate-900 hover:border-white/30"}`}>
                      <b className="text-lg text-white">{z}</b><span className="text-[11px] text-emerald-300">{freeIn(z)} ว่าง</span>
                    </button>
                    {z === "A" ? <div className="grid flex-1 grid-cols-12 gap-1.5">{ids(z).map((id) => cell(id, z))}</div> : (
                      <div className="grid flex-1 grid-cols-12 gap-1.5">
                        {/* กล่องครอบโซนเสื้อผ้า คอลัมน์ 1–4 */}
                        <div className="col-span-4 -m-1 grid grid-cols-4 gap-1.5 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/[0.06] p-1">{ids(z).slice(0, 4).map((id) => cell(id, z))}</div>
                        <div className="col-span-8 grid grid-cols-8 gap-1.5">{ids(z).slice(4).map((id) => cell(id, z))}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
