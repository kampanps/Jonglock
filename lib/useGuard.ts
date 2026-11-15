"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isAllowedEmail } from "./supabase";

// (11) ใช้ getSession (อ่านจากเครื่อง ไม่ยิงเน็ตทุกหน้า) แทน getUser · ความปลอดภัยจริงอยู่ที่ RLS/ฟังก์ชันในฐานข้อมูล ซึ่งตรวจ JWT ทุกคำขออยู่แล้ว
export function useGuard() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (!u || !isAllowedEmail(u.email)) { await supabase.auth.signOut(); router.replace("/login"); } else setUid(u.id);
    });
  }, [router]);
  return uid;
}
