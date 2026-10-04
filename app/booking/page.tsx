"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaRocket } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { usePresence } from "@/lib/live";
import { Page, Btn } from "@/components/ui";
import StallMap from "@/components/StallMap";

type Hold = { stall_id: string; owner_id: string; expires_at: string };
type Nb = { stall_id: string; products: string[] };
const norm = (s: string) => s.trim().toLowerCase();
// ข้อความแจ้งเตือนเมื่อมีคนอื่นจองล็อก (สุ่ม 1 ใน 6)
const TOAST_MSGS = [
  (id: string) => `ล็อค ${id} ถูกจองไปแล้ว!!`,
  (id: string) => `ว้าว! ล็อค ${id} มีเจ้าของแล้วนะ`,
  (id: string) => `ช้าอด! ล็อค ${id} โดนสอยไปแล้ว`,
  (id: string) => `มีคนคว้าล็อค ${id} ไปเรียบร้อย!`,
  (id: string) => `อัปเดตด่วน: ล็อค ${id} ไม่ว่างแล้วจ้า`,
  (id: string) => `ปิ๊งป่อง! ล็อค ${id} ถูกจองตัดหน้าไปแล้ว`,
];
const KF = `
@keyframes pop-in{0%{transform:scale(.55);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
@keyframes rocket{0%{transform:translateY(14px) scale(.9);opacity:0}40%{opacity:1}100%{transform:translateY(-12px) scale(1.05);opacity:.9}}
@keyframes fill{from{width:0}to{width:100%}}
@keyframes toast-life{0%{transform:translateY(10px);opacity:0}8%{transform:none;opacity:1}85%{opacity:1}100%{opacity:0}}`;

export default function Booking() {
  const router = useRouter(); const uid = useGuard(); usePresence(!!uid);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [holds, setHolds] = useState<Record<string, Hold>>({});
  const [pick, setPick] = useState<string | null>(null);
  const [left, setLeft] = useState(0); const [range, setRange] = useState(3);
  const [nb, setNb] = useState<Nb[] | null>(null); const [mine, setMine] = useState<string[]>([]);
  const [live, setLive] = useState(false); const [banner, setBanner] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]); const [done, setDone] = useState<string | null>(null);
  const myShop = useRef<string | null>(null); const pickRef = useRef<string | null>(null); pickRef.current = pick;

  const load = useCallback(async () => {
    const { data: shop } = await supabase.from("shops").select("id, products").maybeSingle();
    if (!shop) return router.replace("/register");
    myShop.current = shop.id; setMine(shop.products);
    const { data: cfg } = await supabase.from("app_settings").select("conflict_range").single(); if (cfg) setRange(cfg.conflict_range);
    const { data } = await supabase.from("bookings").select("stall_id, shop_id");
    if (data?.some((b) => b.shop_id === shop.id)) return router.replace("/detail");
    setTaken(new Set((data ?? []).map((b) => b.stall_id)));
    const { data: hs } = await supabase.from("holds").select("stall_id, owner_id, expires_at");
    setHolds(Object.fromEntries((hs ?? []).map((h) => [h.stall_id, h])));
  }, [router]);
  useEffect(() => { if (uid) load(); }, [uid, load]);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(t); }, []); // ให้ hold หมดอายุหายจากผัง
  useEffect(() => () => { if (pickRef.current) supabase.rpc("release_hold").then(() => {}); }, []);

  const close = useCallback((msg?: string) => { supabase.rpc("release_hold").then(() => {}); setPick(null); if (msg) setBanner(msg); }, []);

  const pushToast = useCallback((lockId: string) => {
    const text = TOAST_MSGS[Math.floor(Math.random() * TOAST_MSGS.length)](lockId);
    const k = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id: k, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== k)), 4500); // แสดง 4.5 วิ แล้วจางหาย (CSS)
  }, []);

  // ===== Realtime: bookings + holds =====
  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel("stalls-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (p) => {
        if (p.eventType === "INSERT") {
          const id = p.new.stall_id as string; setTaken((s) => new Set(s).add(id));
          if (p.new.shop_id !== myShop.current) pushToast(id);
        } else if (p.eventType === "DELETE") {
          const id = (p.old as { stall_id?: string }).stall_id;
          if (id) setTaken((s) => { const n = new Set(s); n.delete(id); return n; }); else load();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "holds" }, (p) => {
        if (p.eventType === "DELETE") { const id = (p.old as Partial<Hold>).stall_id; if (id) setHolds((h) => { const n = { ...h }; delete n[id]; return n; }); }
        else { const r = p.new as Hold; setHolds((h) => ({ ...h, [r.stall_id]: r })); }
      })
      .subscribe((st) => setLive(st === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, [uid, load, pushToast]);

  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(""), 6000); return () => clearTimeout(t); }, [banner]);
  useEffect(() => { if (!pick) return; const t = setInterval(() => setLeft((n) => n - 1), 1000); return () => clearInterval(t); }, [pick]);
  useEffect(() => { if (pick && left <= 0) close("หมดเวลายืนยัน กรุณาเลือกล็อกใหม่"); }, [left, pick, close]);

  // กดเลือก → ขอ hold จากฐานข้อมูล (สำเร็จจึงเปิด Popup)
  async function choose(id: string) {
    setErr("");
    const { data, error } = await supabase.rpc("hold_stall", { p_stall: id });
    if (error) { setPick(null); setErr(error.message); return; }
    setPick(id); setNb(null);
    setLeft(Math.max(1, Math.round((new Date(data as string).getTime() - Date.now()) / 1000)));
    const { data: n } = await supabase.rpc("stall_neighbors", { p_stall: id }); setNb((n ?? []) as Nb[]);
  }
  async function confirm() {
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("book_stall", { p_stall: pick });
    setBusy(false);
    if (error) { setErr(error.message); close(); await load(); return; }
    setDone(pick); setPick(null);              // แสดง Success ก่อน แล้วค่อยพาไปบัตรร้าน
    setTimeout(() => router.push("/detail"), 2300);
  }
  if (!uid) return null;

  const heldByOthers = new Set(Object.values(holds).filter((h) => h.owner_id !== uid && new Date(h.expires_at).getTime() > Date.now()).map((h) => h.stall_id));
  const mineSet = new Set(mine.map(norm));
  const list = (nb ?? []).map((n) => ({ ...n, dup: n.products.filter((p) => mineSet.has(norm(p))) }));
  const conflict = list.some((n) => n.dup.length > 0);
  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, "0"), ss = String(Math.max(0, left % 60)).padStart(2, "0");

  return (
    <Page title="เลือกล็อก" wide>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div aria-live="polite" className="min-h-10 flex-1">{banner && <p className="animate-slide-down rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">📡 {banner}</p>}</div>
        <span className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${live ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,.35)]" : "border-white/10 text-slate-500"}`}>
          <i className={`size-2 rounded-full ${live ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />{live ? "LIVE" : "OFFLINE"}</span>
      </div>
      {err && <p role="alert" className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}
      <StallMap taken={taken} held={heldByOthers} selected={pick} onPick={choose} />

      {pick && (
        /* มือถือ: Bottom Sheet ชิดขอบล่าง กว้างเต็มจอ · เดสก์ท็อป: กลางจอ */
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal>
          <div className="max-h-[92vh] w-full animate-sheet space-y-4 overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-glow-violet md:max-w-md md:rounded-3xl md:pb-6">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20 md:hidden" />
            <p className="text-sm text-slate-400">แถว {pick[0]} · คอลัมน์ {pick.slice(1)}</p>
            <h2 className="text-3xl font-bold text-white">ล็อก {pick}</h2>
            <div className="flex items-center justify-between rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
              <div><p className="font-medium text-amber-100">เวลายืนยันการจอง</p><p className="text-xs text-slate-400">ล็อกนี้ถูกกันไว้ให้คุณระหว่างนี้</p></div>
              <span className={`font-mono text-2xl font-bold ${left < 60 ? "text-rose-300" : "text-amber-300"}`}>{mm}:{ss}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="mb-2 text-sm font-medium text-slate-200">ร้านข้างเคียง ±{range} ล็อก (แถว {pick[0]})</p>
              {nb === null ? <p className="text-sm text-slate-500">กำลังตรวจร้านข้างเคียง…</p>
                : list.length === 0 ? <p className="text-sm text-slate-500">ยังไม่มีร้านค้าในบริเวณนี้</p>
                : <ul className="space-y-2">{list.map((n) => (
                    <li key={n.stall_id} className="flex items-start gap-2 text-sm">
                      {n.dup.length ? <FaTimesCircle className="mt-0.5 shrink-0 text-rose-400" aria-label="ซ้ำ" /> : <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-400" aria-label="ไม่ซ้ำ" />}
                      <span className="text-slate-200"><b className="mr-1.5 text-slate-100">{n.stall_id}</b>{n.products.join(", ")}{n.dup.length > 0 && <em className="ml-1 not-italic text-rose-300">(ซ้ำ: {n.dup.join(", ")})</em>}</span>
                    </li>))}</ul>}
            </div>
            {conflict && <p role="alert" className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-200">มีสินค้าซ้ำกับร้านข้างเคียง จึงจองล็อกนี้ไม่ได้</p>}

            <Btn disabled={busy || nb === null || conflict} onClick={confirm} className="w-full py-3.5 disabled:grayscale">{busy ? "กำลังจอง…" : `ยืนยันจองล็อก ${pick}`}</Btn>
            <button onClick={() => close()} className="w-full py-2 text-slate-400 transition hover:text-white">เลือกล็อกอื่น</button>
          </div>
        </div>
      )}
      <style>{KF}</style>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-40 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:items-end">
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: "toast-life 4.5s ease forwards" }} className="max-w-xs rounded-2xl border border-neon-pink/40 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-glow-pink">🎵 {t.text}</div>
        ))}
      </div>
      {done && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="status" aria-live="assertive">
          <div style={{ animation: "pop-in .55s cubic-bezier(.34,1.56,.64,1) both" }}
            className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-neon-cyan bg-slate-900 p-8 text-center shadow-[0_0_30px_rgba(103,232,249,.5),0_0_70px_rgba(244,114,182,.35)]">
            <div className="relative mx-auto grid size-24 place-items-center rounded-full border-2 border-neon-pink/70 bg-neon-pink/10 shadow-glow-pink">
              <FaRocket className="text-4xl text-neon-cyan" style={{ animation: "rocket 1.1s ease-out infinite" }} />
              <FaCheckCircle className="absolute -bottom-1 -right-1 text-3xl text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
            </div>
            <h2 className="text-2xl font-bold text-white">คุณได้ทำการจองล็อคสำเร็จแล้ว!</h2>
            <p className="text-slate-300">ล็อค <b className="text-neon-cyan">{done}</b> เป็นของคุณแล้ว</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><i className="block h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan" style={{ animation: "fill 2.3s linear forwards" }} /></div>
            <p className="text-xs text-slate-500">กำลังพาไปบัตรร้านของคุณ…</p>
          </div>
        </div>
      )}
    </Page>
  );
}
