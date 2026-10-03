"use client";
import { useState } from "react";
import { useAdminShops, card } from "@/lib/admin";
import StallMap from "@/components/StallMap";
import AdminShopPanel from "@/components/AdminShopPanel";

export default function LiveMap() {
  const { rows, reload } = useAdminShops(); const [id, setId] = useState<string | null>(null);
  if (!rows) return null;
  const shop = rows.find((r) => r.stall_id === id);
  return (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-bold text-white">ผังล็อคสด</h1><p className="text-sm text-slate-400">คลิกล็อคเพื่อดูร้าน ย้าย หรือยกเลิก โดยไม่สนเงื่อนไขเวลา</p></div>
      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className={card}><StallMap taken={new Set(rows.map((r) => r.stall_id))} selected={id} pickTaken onPick={setId} /></div>
        <div className={`${card} h-fit xl:sticky xl:top-6`}>
          {shop ? <AdminShopPanel shop={shop} rows={rows} onDone={() => { reload(); setId(null); }} />
            : <p className="text-sm text-slate-400">{id ? `ล็อค ${id} ว่างอยู่` : "เลือกล็อคจากผังเพื่อดูรายละเอียด"}</p>}
        </div>
      </div>
    </div>
  );
}
