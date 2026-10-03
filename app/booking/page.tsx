"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page, Btn } from "@/components/ui";
import StallMap from "@/components/StallMap";
import { usePresence } from "@/lib/live";


export default function Booking() {
  const router = useRouter(); const uid = useGuard();
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<string | null>(null);
  const [left, setLeft] = useState(300);
  const [live, setLive] = useState(false);
  const [banner, setBanner] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const myShop = useRef<string | null>(null); const pickRef = useRef<string | null>(null);
  const [holdSec, setHoldSec] = useState(300);
  usePresence(!!uid);
  pickRef.current = pick;

  const load = useCallback(async () => {
    const { data: shop } = await supabase.from("shops").select("id").maybeSingle();
    if (!shop) return router.replace("/register");
    myShop.current = shop.id;
    const { data: cfg } = await supabase.from("app_settings").select("hold_minutes").single();
    if (cfg) setHoldSec(cfg.hold_minutes * 60);
    const { data } = await supabase.from("bookings").select("stall_id, shop_id");
    if (data?.some((b) => b.shop_id === shop.id)) return router.replace("/detail");
    setTaken(new Set((data ?? []).map((b) => b.stall_id)));
  }, [router]);
  useEffect(() => { if (uid) load(); }, [uid, load]);

  // ===== Supabase Realtime: ฟังตาราง bookings =====
  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel("bookings-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (p) => {
        if (p.eventType === "INSERT") {
          const id = p.new.stall_id as string;
          setTaken((s) => new Set(s).add(id));
          if (p.new.shop_id !== myShop.current) {
            setBanner(`${id} เพิ่งถูกจองโดยร้านอื่น`);
            if (pickRef.current === id) setPick(null); // ล็อกที่กำลังเลือกถูกแย่งไปแล้ว
          }
        } else if (p.eventType === "DELETE") {
          const id = (p.old as { stall_id?: string }).stall_id;
          if (id) setTaken((s) => { const n = new Set(s); n.delete(id); return n; }); else load();
        }
      })
      .subscribe((st) => setLive(st === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, [uid, load]);

  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(""), 6000); return () => clearTimeout(t); }, [banner]);

  // ===== นับถอยหลังใน Pop-up (ฝั่งหน้าเว็บ ไม่ได้ล็อกล็อกในฐานข้อมูล) =====
  useEffect(() => {
    if (!pick) return;
    setLeft(holdSec);
    const t = setInterval(() => setLeft((n) => { if (n <= 1) { setPick(null); setBanner("หมดเวลายืนยัน กรุณาเลือกล็อกใหม่"); return 0; } return n - 1; }), 1000);
    return () => clearInterval(t);
  }, [pick, holdSec]);

  async function confirm() {
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("book_stall", { p_stall: pick });
    setBusy(false); setPick(null);
    if (error) { setErr(error.message); await load(); return; }
    router.push("/detail");
  }
  if (!uid) return null;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  return (
    <Page title="เลือกล็อก" wide>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div aria-live="polite" className="min-h-10 flex-1">
          {banner && <p className="animate-slide-down rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">📡 {banner}</p>}
        </div>
        <span className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${live ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,.35)]" : "border-white/10 text-slate-500"}`}>
          <i className={`size-2 rounded-full ${live ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />{live ? "LIVE" : "OFFLINE"}
        </span>
      </div>
      {err && <p role="alert" className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200">{err}</p>}
      <StallMap taken={taken} selected={pick} onPick={(id) => { setErr(""); setPick(id); }} />

      {pick && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal>
          <div className="w-full max-w-md animate-sheet space-y-4 rounded-t-3xl border border-white/10 bg-slate-900 p-6 shadow-glow-violet md:rounded-3xl">
            <p className="text-sm text-slate-400">แถว {pick[0]} · คอลัมน์ {pick.slice(1)}</p>
            <h2 className="text-3xl font-bold text-white">ล็อก {pick}</h2>
            <div className="flex items-center justify-between rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
              <div><p className="font-medium text-amber-100">เวลายืนยันการจอง</p><p className="text-xs text-slate-400">หมดเวลาแล้วต้องเลือกใหม่</p></div>
              <span className={`font-mono text-2xl font-bold ${left < 60 ? "text-rose-300" : "text-amber-300"}`}>{mm}:{ss}</span>
            </div>
            <p className="text-sm text-slate-400">ระบบจะตรวจอีกครั้งว่าไม่มีร้านขายของซ้ำในระยะ ±3 ล็อก ตอนกดยืนยัน</p>
            <Btn disabled={busy} onClick={confirm} className="w-full py-3.5">{busy ? "กำลังจอง…" : `ยืนยันจองล็อก ${pick}`}</Btn>
            <button onClick={() => setPick(null)} className="w-full py-2 text-slate-400 transition hover:text-white">เลือกล็อกอื่น</button>
          </div>
        </div>
      )}
    </Page>
  );
}
