"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// แสดงเฉพาะแอดมิน: เช็คจากฐานข้อมูล (is_admin) ไม่ใช่แค่ซ่อนปุ่ม ผู้ใช้ทั่วไปจึงไม่เห็นปุ่มนี้
export default function AdminSwitch() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => { supabase.rpc("is_admin").then(({ data }) => setAdmin(!!data)); }, []);
  if (!admin) return null;
  return (
    <Link href="/admin" className="shrink-0 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-1.5 text-sm text-neon-cyan shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow-cyan active:scale-95">
      ⚙️<span className="hidden sm:inline"> ไปหน้า Admin Dashboard</span>
    </Link>
  );
}
