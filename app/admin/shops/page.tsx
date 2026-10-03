"use client";
import { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { downloadCsv } from "@/lib/csv";
import { useAdminShops, AShop, LineBadge, StallChip, card, fmtT } from "@/lib/admin";
import AdminShopPanel from "@/components/AdminShopPanel";

export default function Shops() {
  const { rows, reload } = useAdminShops();
  const [q, setQ] = useState(""); const [row, setRow] = useState("ทั้งหมด"); const [sel, setSel] = useState<AShop | null>(null);
  if (!rows) return null;
  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => (row === "ทั้งหมด" || r.stall_id[0] === row) &&
    (!s || [r.stall_id, r.shop_name, r.owner_name, r.student_id, r.phone, ...r.products].join(" ").toLowerCase().includes(s)));
  const LINE = { verified: "ยืนยันแล้ว", pending: "รอตรวจ", none: "ยังไม่เข้า", missing: "ยังไม่เข้า" } as const;
  const exportCsv = () => { // ส่งออกตามข้อมูลที่กรองแล้ว (shown) เท่ากับที่เห็นในตาราง
    const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
    downloadCsv(`shops-${day}${row !== "ทั้งหมด" ? `-row${row}` : ""}${s ? "-search" : ""}.csv`,
      ["ล็อค", "ชื่อร้าน", "ของที่ขาย", "เจ้าของร้าน", "รหัสนักศึกษา", "เบอร์โทร", "บุคคลภายนอก (จำนวน)", "รายชื่อบุคคลภายนอก", "กลุ่มไลน์", "จองเมื่อ"],
      shown.map((r) => [r.stall_id, r.shop_name, r.products.join(", "), r.owner_name, r.student_id, r.phone, r.guardians.length, r.guardians.join(", "),
        LINE[r.line_status], new Date(r.booked_at).toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).slice(0, 16)]),
      [4, 5]); // รหัสนักศึกษา, เบอร์โทร เป็นข้อความ
  };
  const cur = sel && rows.find((r) => r.booking_id === sel.booking_id);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-white">ร้านค้าทั้งหมด</h1><p className="text-sm text-slate-400">จองแล้ว {rows.length} / 48 ล็อค · คลิกแถวเพื่อดูรายละเอียด</p></div>
        <button onClick={exportCsv} disabled={!shown.length} title="ส่งออกเฉพาะรายการที่แสดงอยู่ตามการค้นหา/ตัวกรอง"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-neon-violet to-neon-cyan px-5 py-2.5 font-semibold text-slate-950 transition hover:shadow-glow-cyan active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
          <FaDownload />ส่งออก CSV ({shown.length})
        </button>
      </div>
      <div className={`${card} !p-3 flex flex-wrap items-center gap-3`}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อร้าน เลขล็อค ชื่อเจ้าของ หรือรหัสนักศึกษา…" className="min-w-52 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 outline-none focus:border-neon-cyan" />
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          {["ทั้งหมด", "A", "B", "C", "D"].map((f) => <button key={f} onClick={() => setRow(f)} className={`rounded-xl px-3 py-1.5 text-sm transition ${row === f ? "bg-violet-400/25 text-white" : "text-slate-400 hover:text-white"}`}>{f === "ทั้งหมด" ? f : `แถว ${f}`}</button>)}
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400"><tr>{["ล็อค", "ร้าน / ของที่ขาย", "เจ้าของร้าน", "เบอร์โทร", "บุคคลภายนอก", "กลุ่มไลน์", "จองเมื่อ"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {shown.map((r) => (
              <tr key={r.booking_id} onClick={() => setSel(r)} className="cursor-pointer transition hover:bg-white/5">
                <td className="px-4 py-3"><StallChip id={r.stall_id} /></td>
                <td className="px-4 py-3"><p className="font-semibold text-white">{r.shop_name}</p><p className="text-xs text-slate-500">{r.products.join(" · ")}</p></td>
                <td className="px-4 py-3"><p className="text-slate-100">{r.owner_name}</p><p className="text-xs text-slate-500">{r.student_id}</p></td>
                <td className="px-4 py-3 text-slate-200">{r.phone}</td>
                <td className="px-4 py-3 text-neon-cyan">{r.guardians.length ? `${r.guardians.length} คน` : <span className="text-slate-600">—</span>}</td>
                <td className="px-4 py-3"><LineBadge s={r.line_status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmtT(r.booked_at)}</td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">ไม่พบรายการ</td></tr>}
          </tbody>
        </table>
      </div>
      {/* Drawer สไลด์จากขวา */}
      <div onClick={() => setSel(null)} className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity ${cur ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-900 p-6 shadow-glow-violet transition-transform duration-300 ${cur ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setSel(null)} aria-label="ปิด" className="mb-4 ml-auto block rounded-xl border border-white/10 px-3 py-1.5 text-slate-300 hover:text-white">✕</button>
        {cur && <AdminShopPanel shop={cur} rows={rows} onDone={() => { reload(); setSel(null); }} />}
      </aside>
    </div>
  );
}
