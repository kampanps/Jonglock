"use client";
import { ReactNode, useState } from "react";

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
const ZONES = [["A"], ["B", "C"], ["D"]];

type Props = { taken: Set<string>; mine?: string | null; selected?: string | null; held?: Set<string>; readOnly?: boolean; pickTaken?: boolean; onPick?: (id: string) => void };

export default function StallMap({ taken, mine = null, selected = null, held = new Set<string>(), readOnly = false, pickTaken = false, onPick }: Props) {
  const [zoom, setZoom] = useState<string | null>(null);
  const freeIn = (z: string) => 12 - Array.from(taken).filter((id) => id[0] === z).length; // ลดลงเรียลไทม์ตาม taken
  return (
    <div className="space-y-3">
      <S className="mx-auto h-9 w-1/2 rounded-xl border border-white/10 bg-white/5">เต็นท์ศิลปิน</S>
      <S className="mx-auto h-14 w-3/4 rounded-2xl border border-neon-violet/30 bg-violet-400/10 text-lg text-violet-200">เวที</S>
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
        <Zone items={["กิจกรรม SC.", "รับเสื้อเฟรชชี่"]} tone="border-sky-400/30 bg-sky-400/10" />
      </div>
      <div className="grid grid-cols-[4fr_3fr] gap-3 pb-2">
        <Zone items={["SMO", "SMO", "SMO", "SMO"]} tone="border-teal-400/30 bg-teal-400/10" />
        <Zone items={["ชมรม", "ชมรม", "ชมรม"]} tone="border-indigo-400/30 bg-indigo-400/10" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 sm:text-sm">
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-emerald-400/60 bg-emerald-400/20" />ว่าง</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-rose-400/40 bg-rose-400/15" />มีร้านแล้ว</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-amber-300/70 bg-amber-300/30" />กำลังตัดสินใจ</span>
            {mine && <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-violet-400" />ล็อกของคุณ</span>}
          </div>
          <span className="text-slate-500">{zoom ? <button onClick={() => setZoom(null)} className="text-neon-cyan underline">ย่อกลับ</button> : "แตะป้ายแถวเพื่อซูม"}</span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="space-y-8 transition-[width] duration-500 ease-out" style={{ width: zoom ? "max(190%, 1300px)" : "max(100%, 640px)" }}>
            {ZONES.map((g) => (
              <div key={g.join()} className="space-y-2">
                {g.map((z) => (
                  <div key={z} className={`flex items-center gap-2 transition duration-500 ${zoom && zoom !== z ? "opacity-30" : ""}`}>
                    <button onClick={() => setZoom(zoom === z ? null : z)} aria-label={`ซูมแถว ${z}`}
                      className={`sticky left-0 z-[1] flex w-16 shrink-0 flex-col items-center rounded-xl border py-1 leading-tight transition ${zoom === z ? "border-neon-cyan bg-neon-cyan/20 shadow-glow-cyan" : "border-violet-400/40 bg-violet-950 hover:shadow-glow-violet"}`}>
                      <b className="text-lg text-white">{z}</b><span className="text-[11px] text-emerald-300">{freeIn(z)} ว่าง</span>
                    </button>
                    <div className="flex flex-1 gap-1.5 sm:gap-2">
                      {Array.from({ length: 12 }, (_, i) => z + (i + 1)).map((id) => {
                        const t = taken.has(id), h = held.has(id), isMine = id === mine, sel = id === selected;
                        const color = isMine ? "border-violet-300 bg-violet-400/30 text-white shadow-glow-violet"
                          : sel ? "border-neon-cyan bg-neon-cyan/20 text-white shadow-glow-cyan ring-2 ring-neon-cyan scale-105"
                          : h ? "border-amber-300/70 bg-amber-300/25 text-amber-100 shadow-[0_0_12px_rgba(252,211,77,.4)]"
                          : t ? "border-rose-400/30 bg-rose-400/10 text-rose-300/70" : "border-emerald-400/50 bg-emerald-400/15 text-emerald-200";
                        const cls = `flex flex-1 items-center justify-center rounded-lg border text-xs font-medium transition-all duration-500 sm:text-sm ${zoom === z ? "h-14" : "h-10"} ${color}`;
                        if (readOnly) return <div key={id} aria-disabled className={`${cls} select-none`}>{id}</div>;
                        return <button key={id} disabled={(t || h) && !pickTaken} onClick={() => onPick?.(id)} className={`${cls} ${(t || h) && !pickTaken ? "cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(103,232,249,.4)]"}`}>{id}</button>;
                      })}
                    </div>
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
