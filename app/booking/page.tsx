"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaRocket } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page, Btn } from "@/components/ui";
import UserStallMap from "@/components/UserStallMap";
import { CLOTHING, ALL_IDS } from "@/lib/venue";

type Snap = { taken: string[]; holds: { stall_id: string; mine: boolean; expires_at: string }[]; mine: string | null; server_now: string; zone_release_at: string | null };
type Nb = { stall_id: string; products: string[] };
const norm = (s: string) => s.trim().toLowerCase();
const POLL_MS = 2000;
const TOAST_MSGS = [
  (id: string) => `ล็อค ${id} ถูกจองไปแล้ว!!`, (id: string) => `ว้าว! ล็อค ${id} มีเจ้าของแล้วนะ`, (id: string) => `ช้าอด! ล็อค ${id} โดนสอยไปแล้ว`,
  (id: string) => `มีคนคว้าล็อค ${id} ไปเรียบร้อย!`, (id: string) => `อัปเดตด่วน: ล็อค ${id} ไม่ว่างแล้วจ้า`, (id: string) => `ปิ๊งป่อง! ล็อค ${id} ถูกจองตัดหน้าไปแล้ว`,
];
const KF = `
@keyframes pop-in{0%{transform:scale(.55);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
@keyframes rocket{0%{transform:translateY(14px) scale(.9);opacity:0}40%{opacity:1}100%{transform:translateY(-12px) scale(1.05);opacity:.9}}
@keyframes fill{from{width:0}to{width:100%}}
@keyframes toast-life{0%{transform:translateY(10px);opacity:0}8%{transform:none;opacity:1}85%{opacity:1}100%{opacity:0}}`;

export default function Booking() {
  const router = useRouter(); const uid = useGuard();
  const [ready, setReady] = useState(false);
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [holds, setHolds] = useState<Snap["holds"]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0); const [now, setNow] = useState(0);
  const [range, setRange] = useState(3); const [holdMin, setHoldMin] = useState(5);
  const [releaseAt, setReleaseAt] = useState<number | null>(null); const [, setTick] = useState(0); const [mine, setMine] = useState<string[]>([]);
  const [nb, setNb] = useState<Nb[] | null>(null);
  const [live, setLive] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]); const [done, setDone] = useState<string | null>(null);
  // refs ป้องกัน race ฝั่งหน้าเว็บ
  const skew = useRef(0);                         // เวลาเซิร์ฟเวอร์ − เวลาเครื่อง (ms) ให้นาฬิกานับถอยหลังตรงกับ expires_at จริง
  const prevTaken = useRef<Set<string> | null>(null);
  const choosing = useRef(false); const confirming = useRef(false); const doneRef = useRef(false);
  const reqId = useRef(0); const pickRef = useRef<string | null>(null); pickRef.current = pick;

  const addToast = useCallback((text: string) => {
    const k = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id: k, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== k)), 4500);
  }, []);
  const notify = useCallback((t: string) => addToast("⚠️ " + t), [addToast]);

  // ===== (10) Polling ทุก 2 วินาที: 1 request ต่อรอบ (stall_snapshot) =====
  const poll = useCallback(async () => {
    const { data, error } = await supabase.rpc("stall_snapshot");
    if (error || !data) { setLive(false); return; }
    const s = data as Snap; setLive(true);
    skew.current = new Date(s.server_now).getTime() - Date.now();
    setReleaseAt(s.zone_release_at ? new Date(s.zone_release_at).getTime() : null);
    if (s.mine && !doneRef.current) { router.replace("/detail"); return; }
    const next = new Set(s.taken), prev = prevTaken.current;
    if (prev) next.forEach((id) => { if (!prev.has(id)) addToast("🎵 " + TOAST_MSGS[Math.floor(Math.random() * TOAST_MSGS.length)](id)); });
    prevTaken.current = next; setTaken(next); setHolds(s.holds);
  }, [router, addToast]);

  // (11) โหลดครั้งแรก: ยิงพร้อมกัน ไม่รอทีละคำสั่ง
  useEffect(() => {
    if (!uid) return;
    let inflight = false;
    (async () => {
      const [shop, cfg] = await Promise.all([
        supabase.from("shops").select("products").maybeSingle(),
        supabase.from("app_settings").select("conflict_range, hold_minutes").single(),
        poll(),
      ]);
      if (!shop.data) return router.replace("/register");
      setMine(shop.data.products); if (cfg.data) { setRange(cfg.data.conflict_range); setHoldMin(cfg.data.hold_minutes); } setReady(true);
    })();
    const run = async () => { if (inflight || document.visibilityState !== "visible") return; inflight = true; try { await poll(); } finally { inflight = false; } };
    const t = setInterval(run, POLL_MS);
    document.addEventListener("visibilitychange", run);       // กลับมาที่แท็บ → อัปเดตทันที
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", run); };
  }, [uid, poll, router]);

  // ===== (15) hold / นาฬิกา / กดรัว =====
  const close = useCallback((stall: string | null, msg?: string) => {
    supabase.rpc("release_hold", stall ? { p_stall: stall } : {}).then(() => {});
    setPick((p) => (stall && p === stall ? null : p)); if (msg) notify(msg);
  }, [notify]);
  useEffect(() => () => { if (pickRef.current) supabase.rpc("release_hold", { p_stall: pickRef.current }).then(() => {}); }, []);
  useEffect(() => { if (!pick) return; setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [pick]);
  const left = pick ? Math.max(0, Math.ceil((expiresAt - (now + skew.current)) / 1000)) : 0;
  useEffect(() => { if (pick && now && left <= 0) close(pick, "หมดเวลายืนยัน กรุณาเลือกล็อกใหม่"); }, [left, pick, now, close]);

  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 1000); return () => clearInterval(t); }, []);   // เช็คเวลาทุกวินาที → ผังเปลี่ยนเองเมื่อถึงเวลา
  const isClothingShop = mine.some((p) => norm(p) === "เสื้อผ้า");
  // เวลาปลดล็อก = เวลาเซิร์ฟเวอร์ (เครื่องผู้ใช้ + ส่วนต่างที่วัดจาก server_now) · การตัดสินจริงอยู่ที่ฐานข้อมูล
  const zoneActive = releaseAt === null || Date.now() + skew.current < releaseAt;
  async function choose(id: string) {
    if (choosing.current || doneRef.current) return;                         // กดรัว: ขณะรอคำตอบเก่า ไม่รับคลิกใหม่
    if (zoneActive && !isClothingShop && CLOTHING.has(id)) return notify("โซนนี้สงวนสิทธิ์สำหรับร้านเสื้อผ้าเท่านั้น");
    if (zoneActive && isClothingShop && !CLOTHING.has(id)) return notify("ร้านเสื้อผ้าจองได้เฉพาะโซนเสื้อผ้า");
    choosing.current = true; const my = ++reqId.current; setErr("");
    try {
      const { data, error } = await supabase.rpc("hold_stall", { p_stall: id });
      if (error) { close(null); setPick(null); setErr(error.message); return; }
      // hold_stall เวอร์ชันใหม่คืน {expires_at, server_now} · เวอร์ชันเก่าคืนแค่ timestamp (string) → รองรับทั้งสองแบบ
      const h = data as string | { expires_at?: string; server_now?: string } | null;
      const expStr = typeof h === "string" ? h : h?.expires_at;
      const srvNow = typeof h === "object" && h ? h.server_now : undefined;
      skew.current = srvNow ? new Date(srvNow).getTime() - Date.now() : 0;
      let expMs = expStr ? new Date(expStr).getTime() : NaN;
      if (!Number.isFinite(expMs)) expMs = Date.now() + skew.current + holdMin * 60_000;   // กัน NaN: ใช้เวลากันล็อกจากตั้งค่าแทน
      setExpiresAt(expMs); setNow(Date.now()); setPick(id); setNb(null);
      const { data: n } = await supabase.rpc("stall_neighbors", { p_stall: id });
      if (my === reqId.current) setNb((n ?? []) as Nb[]);                      // ทิ้งคำตอบที่ล้าสมัย
    } finally { choosing.current = false; }
  }
  async function confirm() {
    if (!pick || confirming.current) return;                                    // กดยืนยันรัว: ส่งครั้งเดียว
    confirming.current = true; setBusy(true); setErr(""); const stall = pick;
    const { error } = await supabase.rpc("book_stall", { p_stall: stall });
    setBusy(false);
    if (error) { confirming.current = false; setErr(error.message); close(stall); await poll(); return; }
    doneRef.current = true; prevTaken.current?.add(stall);
    setTaken((s) => new Set(s).add(stall)); setPick(null); setDone(stall);
    setTimeout(() => router.push("/detail"), 2300);
  }
  if (!uid || !ready) return null;

  const heldByOthers = new Set(holds.filter((h) => !h.mine && new Date(h.expires_at).getTime() > Date.now() + skew.current).map((h) => h.stall_id));
  const mineSet = new Set(mine.map(norm));
  const list = (nb ?? []).map((n) => ({ ...n, dup: n.products.filter((p) => mineSet.has(norm(p))) }));
  const conflict = list.some((n) => n.dup.length > 0);
  const dim = new Set(zoneActive ? ALL_IDS.filter((id) => CLOTHING.has(id) !== isClothingShop) : []);
  const releaseLabel = releaseAt ? new Date(releaseAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Bangkok" }) : "";
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  return (
    <Page title="เลือกล็อก" wide>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1" />
        <span className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${live ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300 " : "border-white/10 text-slate-500"}`}>
          <i className={`size-2 rounded-full ${live ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />{live ? "LIVE" : "OFFLINE"}</span>
      </div>
      {err && <p role="alert" className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}
      <UserStallMap taken={taken} held={heldByOthers} selected={pick} dim={dim} zoneActive={zoneActive} releaseLabel={releaseLabel} onPick={choose} />

      {pick && (
        /* มือถือ: Bottom Sheet ชิดขอบล่าง กว้างเต็มจอ · เดสก์ท็อป: กลางจอ */
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal>
          <div className="max-h-[92vh] w-full animate-sheet space-y-4 overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg shadow-black/30 md:max-w-md md:rounded-3xl md:pb-6">
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
            <button onClick={() => close(pick)} className="w-full py-2 text-slate-400 transition hover:text-white">เลือกล็อกอื่น</button>
          </div>
        </div>
      )}
      <style>{KF}</style>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-40 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-auto sm:items-end">
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: "toast-life 4.5s ease forwards" }} className="max-w-xs rounded-2xl border border-neon-pink/40 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-md shadow-pink-400/10">{t.text}</div>
        ))}
      </div>
      {done && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="status" aria-live="assertive">
          <div style={{ animation: "pop-in .55s cubic-bezier(.34,1.56,.64,1) both" }}
            className="w-full max-w-sm space-y-4 rounded-3xl border border-white/15 bg-slate-900 p-8 text-center ">
            <div className="relative mx-auto grid size-24 place-items-center rounded-full border-2 border-neon-pink/70 bg-neon-pink/10 shadow-md shadow-pink-400/10">
              <FaRocket className="text-4xl text-neon-cyan" style={{ animation: "rocket 1.1s ease-out infinite" }} />
              <FaCheckCircle className="absolute -bottom-1 -right-1 text-3xl text-emerald-400 drop-" />
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
