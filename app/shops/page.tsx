"use client";
// หน้า "ร้านที่จองล็อกแล้ว" (/shops) — ดึงข้อมูลจาก RPC shop_directory() ทุก 1 นาที เฉพาะตอนแท็บเปิดอยู่
// แสดงเฉพาะร้านที่จองแล้ว ไม่มีข้อมูลส่วนบุคคล · หน้าตาอยู่ใน ShopsView.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import ShopsView, { Directory } from "./ShopsView";

const POLL_MS = 60_000;

export default function Shops() {
  const uid = useGuard();
  const [dir, setDir] = useState<Directory | null>(null);
  const [failed, setFailed] = useState(false);
  const inflight = useRef(false);

  const load = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const { data, error } = await supabase.rpc("shop_directory");
      if (error || !data) return setFailed(true);   // คงข้อมูลชุดเดิมไว้ แล้วแจ้งว่าไม่ใช่ล่าสุด
      setDir(data as Directory); setFailed(false);
    } finally { inflight.current = false; }
  }, []);

  useEffect(() => {
    if (!uid) return;
    load();
    const run = () => { if (document.visibilityState === "visible") load(); };
    const t = setInterval(run, POLL_MS);
    document.addEventListener("visibilitychange", run);   // กลับมาที่แท็บ → ดึงใหม่ทันที
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", run); };
  }, [uid, load]);

  if (!uid) return null;
  return <ShopsView dir={dir} failed={failed} onRetry={load} />;
}
