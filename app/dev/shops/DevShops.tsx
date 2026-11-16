"use client";
// ข้อมูลตัวอย่าง (ชื่อร้านสมมติ) + ปุ่มสลับสถานะ สำหรับตรวจหน้าตาของ /shops ตอนพัฒนา
import { useState } from "react";
import ShopsView, { Directory, Shop } from "../../shops/ShopsView";

const SHOPS: Shop[] = [
  { stall_id: "A2", shop_name: "Moon Milk Tea", products: ["ชานมไข่มุก", "ของทอด"] },
  { stall_id: "A4", shop_name: "ข้าวเหนียวมะม่วงป้าแดง สาขาหน้ามหาลัย", products: ["ข้าวเหนียวมะม่วง"] },
  { stall_id: "A9", shop_name: "ชาไทยใจดี", products: ["ชาไทย", "ชานมไข่มุก"] },
  { stall_id: "A11", shop_name: "Cookie Jar", products: ["ขนมหวาน", "เครื่องดื่ม"] },
  { stall_id: "B5", shop_name: "ลูกชิ้นปิ้งนายตี๋", products: ["ลูกชิ้นทอด", "ของทอด"] },
  { stall_id: "B8", shop_name: "เฟรนช์ฟรายส์ทอดใหม่", products: ["ของทอด"] },
  { stall_id: "B12", shop_name: "บิงซูหิมะ", products: ["ขนมหวาน"] },
  { stall_id: "C6", shop_name: "ไก่ทอดหาดใหญ่", products: ["ของทอด", "ข้าวเหนียว"] },
  { stall_id: "C9", shop_name: "Handmade by Fon", products: ["งานคราฟต์"] },
  { stall_id: "C13", shop_name: "น้ำปั่นผลไม้สด", products: ["เครื่องดื่ม", "น้ำผลไม้"] },
  { stall_id: "D1", shop_name: "Vintage@ เสื้อมือสอง", products: ["เสื้อผ้า"] },
  { stall_id: "D2", shop_name: "เสื้อยืดสกรีนลาย Music Fest", products: ["เสื้อผ้า"] },
  { stall_id: "D5", shop_name: "ทาโกะยากิ", products: ["อาหารญี่ปุ่น", "ของทอด"] },
  { stall_id: "D10", shop_name: "กาแฟโบราณ", products: ["เครื่องดื่ม", "ชาไทย"] },
];
const OK: Directory = { server_now: "2026-11-16T07:32:00Z", total_stalls: 55, shops: SHOPS };
type Mode = "ok" | "loading" | "stale" | "down" | "empty";
const MODES: Record<Mode, { label: string; dir: Directory | null; failed: boolean }> = {
  ok: { label: "ปกติ", dir: OK, failed: false },
  loading: { label: "กำลังโหลด", dir: null, failed: false },
  stale: { label: "อัปเดตไม่สำเร็จ (มีข้อมูลเก่า)", dir: OK, failed: true },
  down: { label: "โหลดไม่ได้เลย", dir: null, failed: true },
  empty: { label: "ยังไม่มีร้านจอง", dir: { ...OK, shops: [] }, failed: false },
};

export default function DevShops() {
  const [mode, setMode] = useState<Mode>("ok");
  const m = MODES[mode];
  return (
    <>
      <ShopsView key={mode} dir={m.dir} failed={m.failed} onRetry={() => setMode("ok")} />
      <div className="fixed bottom-3 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-wrap gap-1.5 rounded-2xl border border-amber-300/40 bg-slate-950/90 p-2 text-xs shadow-lg backdrop-blur">
        <span className="px-1.5 py-1 font-semibold text-amber-200">DEV ข้อมูลตัวอย่าง:</span>
        {(Object.keys(MODES) as Mode[]).map((k) => (
          <button key={k} onClick={() => setMode(k)} className={`rounded-lg px-2.5 py-1 ${k === mode ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}>{MODES[k].label}</button>
        ))}
      </div>
    </>
  );
}
