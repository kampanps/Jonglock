"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { ALL_IDS } from "./venue";

export type AShop = { booking_id: string; stall_id: string; booked_at: string; shop_id: string; shop_name: string; products: string[]; owner_name: string;
  student_id: string; phone: string; email: string | null; guardians: string[]; line_status: "none" | "pending" | "verified" | "missing" };
export const ALL = ALL_IDS;
export const card = "rounded-3xl border border-white/10 bg-white/[0.04] p-5";
export const fmtT = (x: string) => new Date(x).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Bangkok" });

// (D-3) แอดมินไม่ใช้ Realtime: ดึงใหม่ทุก ADMIN_POLL_MS เฉพาะตอนแท็บเปิดอยู่ + ทันทีเมื่อกลับมาที่แท็บ / หลังกดแก้ไข (reload)
export const ADMIN_POLL_MS = 15_000;
export function useAdminShops() {
  const [rows, setRows] = useState<AShop[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const reload = useCallback(async () => {
    const { data, error } = await supabase.rpc("admin_shops");
    if (error) return;                       // คงข้อมูลเดิมไว้ ไม่ล้างตารางเมื่อเน็ตสะดุด
    setRows((data ?? []) as AShop[]); setUpdatedAt(new Date());
  }, []);
  useEffect(() => {
    let inflight = false;
    const run = async () => { if (inflight || document.visibilityState !== "visible") return; inflight = true; try { await reload(); } finally { inflight = false; } };
    reload();
    const t = setInterval(run, ADMIN_POLL_MS);
    document.addEventListener("visibilitychange", run);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", run); };
  }, [reload]);
  return { rows, reload, updatedAt };
}

export const LineBadge = ({ s }: { s: AShop["line_status"] }) => {
  const m = s === "verified" ? ["ยืนยันแล้ว", "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"]
    : s === "pending" ? ["รอตรวจ", "border-amber-300/40 bg-amber-300/10 text-amber-200"] : ["ยังไม่เข้า", "border-rose-400/40 bg-rose-400/10 text-rose-300"];
  return <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${m[1]}`}>{m[0]}</span>;
};
export const StallChip = ({ id }: { id: string }) => <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-sm font-semibold text-slate-100">{id}</span>;
