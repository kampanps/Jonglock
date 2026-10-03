"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page } from "@/components/ui";
import ShopForm from "@/components/ShopForm";
import { studentIdFromEmail } from "@/lib/studentId";

export default function Register() {
  const router = useRouter(); const uid = useGuard(); const [name, setName] = useState<string | null>(null); const [sid, setSid] = useState("");
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const { data: shop } = await supabase.from("shops").select("id").maybeSingle();
      if (shop) return router.replace("/");
      const { data } = await supabase.auth.getUser();
      setSid(studentIdFromEmail(data.user?.email));
      setName((data.user?.user_metadata?.full_name as string) ?? ""); // ชื่อจากบัญชี Google
    })();
  }, [uid, router]);
  if (name === null) return null;
  return (
    <Page title="ลงทะเบียนร้านของคุณ">
      <p className="-mt-2 mb-5 text-center text-slate-400">กรอกครั้งเดียว แก้ไขได้ทุกเมื่อก่อนวันงาน</p>
      <ShopForm showLine lockedStudentId={sid} submitLabel="บันทึกและไปเลือกล็อค"
        initial={{ owner_name: name, student_id: sid, shop_name: "", phone: "", products: [], guardians: [], line_joined: false }}
        onSubmit={async (v) => {
          const { error } = await supabase.from("shops").insert({ ...v, owner_id: uid });
          if (error) return error.code === "23505" ? "คุณลงทะเบียนร้านไว้แล้ว" : error.message;
          router.push("/booking");
        }} />
    </Page>
  );
}
