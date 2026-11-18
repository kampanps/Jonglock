"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Shop } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page } from "@/components/ui";
import { FaLine } from "react-icons/fa";

// ★ แก้ลิงก์กลุ่มไลน์ตรงนี้ (หรือกำหนด NEXT_PUBLIC_LINE_GROUP_URL ใน .env.local ให้ใช้ลิงก์เดียวกันทั้งระบบ)
const lineGroupUrl = process.env.NEXT_PUBLIC_LINE_GROUP_URL ?? "https://line.me/ti/g/ใส่ลิงก์กลุ่มของคุณ";
import ShopForm from "@/components/ShopForm";

export default function Edit() {
  const router = useRouter(); const uid = useGuard(); const [shop, setShop] = useState<Shop | null>(null);
  useEffect(() => { if (uid) supabase.from("shops").select("*").maybeSingle().then(({ data }) => (data ? setShop(data) : router.replace("/register"))); }, [uid, router]);
  if (!shop) return null;
  return (
    <Page title="แก้ไขข้อมูลร้านค้า">
      <p className="mb-5 text-sm text-slate-400">เลขที่ล็อกแก้ไขไม่ได้ หากต้องการเปลี่ยนล็อกให้ยกเลิกแล้วจองใหม่</p>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#06C755]/30 bg-[#06C755]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-200">เข้ากลุ่มไลน์ผู้ค้า เพื่อรับประกาศสำคัญและการยืนยันตัวตนจากทีมงาน</p>
        <a href={lineGroupUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#06C755] px-5 py-3 font-semibold text-white transition duration-200 hover:brightness-110 hover:shadow-[0_0_20px_rgba(6,199,85,0.45)] active:scale-[0.98] sm:w-auto">
          <FaLine className="text-xl" />เข้ากลุ่มไลน์ร้านค้า
        </a>
      </div>
      <ShopForm initial={shop} lockedStudentId={shop.student_id} tone="ok" submitLabel="แก้ไข" onSubmit={async (v) => {
        const rest: Partial<typeof v> = { ...v }; delete rest.student_id;   // student_id แก้ไม่ได้ (ไม่มีสิทธิ์ UPDATE)
        const { error } = await supabase.from("shops").update(rest).eq("id", shop.id);
        if (error) return error.message; // trigger เช็กวันที่ + ของซ้ำในระยะ 3 ร้าน
        router.push("/detail");
      }} />
    </Page>
  );
}