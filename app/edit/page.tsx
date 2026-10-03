"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Shop } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page } from "@/components/ui";
import ShopForm from "@/components/ShopForm";

export default function Edit() {
  const router = useRouter(); const uid = useGuard(); const [shop, setShop] = useState<Shop | null>(null);
  useEffect(() => { if (uid) supabase.from("shops").select("*").maybeSingle().then(({ data }) => (data ? setShop(data) : router.replace("/register"))); }, [uid, router]);
  if (!shop) return null;
  return (
    <Page title="แก้ไขข้อมูลร้านค้า">
      <p className="mb-5 text-sm text-slate-400">เลขที่ล็อกแก้ไขไม่ได้ หากต้องการเปลี่ยนล็อกให้ยกเลิกแล้วจองใหม่</p>
      <ShopForm initial={shop} tone="ok" submitLabel="แก้ไข" onSubmit={async (v) => {
        const { error } = await supabase.from("shops").update(v).eq("id", shop.id);
        if (error) return error.message; // trigger เช็กวันที่ + ของซ้ำในระยะ 3 ร้าน
        router.push("/detail");
      }} />
    </Page>
  );
}
