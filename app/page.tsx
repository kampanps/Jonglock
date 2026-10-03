"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { finishLogin } from "@/lib/auth";

// จุดเข้าเดียว: ไม่มี session → Login / มี session → แยกตามเงื่อนไข (แอดมิน / ยังไม่ลงทะเบียน / จองแล้ว / ยังไม่จอง)
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      if (await finishLogin(data.session.user, router.replace)) router.replace("/login");
    });
  }, [router]);
  return <p className="grid min-h-screen place-items-center text-slate-400">กำลังโหลด…</p>;
}
