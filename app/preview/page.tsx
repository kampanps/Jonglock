"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page, Btn } from "@/components/ui";
import StallMap from "@/components/StallMap";

export default function Preview() {
  const router = useRouter(); const uid = useGuard();
  const [taken, setTaken] = useState<Set<string> | null>(null); const [mine, setMine] = useState<string | null>(null);
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const { data: shop } = await supabase.from("shops").select("id").maybeSingle();
      const { data } = await supabase.from("bookings").select("stall_id, shop_id");
      setTaken(new Set((data ?? []).map((b) => b.stall_id)));
      setMine(data?.find((b) => b.shop_id === shop?.id)?.stall_id ?? null);
    })();
  }, [uid]);
  if (!taken) return null;
  return (
    <Page title="ผังร้านค้า (Preview)" wide>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-400/10 px-4 py-3 ring-1 ring-sky-400/20">
        <p className="text-sm text-sky-300">โหมดดูอย่างเดียว ไม่สามารถจองหรือแก้ไขจากหน้านี้ได้</p>
        <Btn tone="ghost" onClick={() => router.push("/detail")}>กลับไปหน้าเดิม</Btn>
      </div>
      <StallMap taken={taken} mine={mine} readOnly />
    </Page>
  );
}
