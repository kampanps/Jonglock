"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaPen, FaTimes, FaTag, FaRegCalendarAlt, FaLock, FaInstagram } from "react-icons/fa";
import { supabase, Shop } from "@/lib/supabase";
import { useGuard } from "@/lib/useGuard";
import { Page } from "@/components/ui";

const fmt = (d: Date) => d.toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Bangkok" });
const Info = ({ k, children }: { k: string; children: React.ReactNode }) => (<div><p className="text-xs text-slate-500">{k}</p><p className="mt-0.5 font-semibold text-slate-100">{children}</p></div>);

export default function Detail() {
  const router = useRouter(); const uid = useGuard();
  const [shop, setShop] = useState<Shop | null>(null); const [stall, setStall] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [open, setOpen] = useState(false); const [late, setLate] = useState(false); const [err, setErr] = useState("");

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const { data: s } = await supabase.from("shops").select("*").maybeSingle();
      if (!s) return router.replace("/register");
      const { data: b } = await supabase.from("bookings").select("stall_id").eq("shop_id", s.id).maybeSingle();
      if (!b) return router.replace("/booking");
      const { data: cfg } = await supabase.from("app_settings").select("edit_deadline").single();
      setShop(s); setStall(b.stall_id); setDeadline(cfg ? new Date(cfg.edit_deadline) : null);
    })();
  }, [uid, router]);

  async function cancel() {
    const { error } = await supabase.rpc("cancel_booking"); // ฐานข้อมูลเช็คเส้นตายซ้ำอีกชั้น
    if (error) { setOpen(false); return setErr(error.message); }
    router.replace("/booking");
  }
  if (!shop || !deadline) return null;

  const canEdit = Date.now() <= deadline.getTime();                       // เช็คเวลา 15 ต.ค. 23:59
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000));
  const off = "cursor-not-allowed border-white/5 bg-white/5 text-slate-600";

  return (
    <Page title="บัตรร้านของฉัน">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-400 text-slate-950"><FaCheck /></span>
          <div><p className="font-semibold text-slate-100">จองสำเร็จ เจอกันที่ Music Fest!</p><p className="text-sm text-slate-400">แสดงบัตรนี้กับทีมงานในวันงาน</p></div>
        </div>

        {/* ===== ตั๋ว ===== */}
        <article className="overflow-hidden rounded-3xl shadow-glow-violet ring-1 ring-white/10">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white">
            <div className="flex justify-between text-xs font-bold tracking-widest"><span>♪ MUSIC FEST 2569</span><span>VENDOR PASS</span></div>
            <p className="mt-5 text-sm text-violet-100">เลขล็อก</p>
            <div className="flex items-end justify-between">
              <span className="text-7xl font-extrabold leading-none">{stall}</span>
              <div className="text-right"><p className="text-xl font-bold">แถว {stall[0]}</p><p className="text-sm text-violet-100">คอลัมน์ {stall.slice(1)}</p></div>
            </div>
          </div>
          <div className="relative bg-slate-900">
            <span className="absolute -left-3 top-0 size-6 -translate-y-1/2 rounded-full bg-slate-950" />
            <span className="absolute -right-3 top-0 size-6 -translate-y-1/2 rounded-full bg-slate-950" />
            <div className="mx-4 border-t-2 border-dashed border-white/15" />
            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs text-slate-500">ชื่อร้าน</p>
                <h2 className="text-2xl font-bold text-white">{shop.shop_name}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shop.products.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/15 px-3 py-1 text-sm text-violet-100"><FaTag className="text-xs" />{p}</span>)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Info k="เจ้าของร้าน">{shop.owner_name}</Info>
                <Info k="เบอร์โทร">{shop.phone}</Info>
                <Info k="รหัสนักศึกษา">{shop.student_id}</Info>
                <Info k="กลุ่มไลน์">{shop.line_joined ? <span className="text-emerald-300">✓ เข้ากลุ่มแล้ว</span> : <span className="text-amber-300">ยังไม่ได้เข้ากลุ่ม</span>}</Info>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-sm text-slate-500">บุคคลภายนอก {shop.guardians.length} คน</p>
                {shop.guardians.length ? shop.guardians.map((g) => <p key={g} className="py-1 font-medium text-slate-100">{g}</p>) : <p className="text-sm text-slate-500">-</p>}
              </div>
            </div>
          </div>
        </article>

        <p className={`flex items-center gap-2 text-sm ${canEdit ? "text-slate-400" : "text-amber-300"}`}>
          <FaRegCalendarAlt className="text-neon-cyan" />
          {canEdit ? `ยกเลิกหรือเปลี่ยนล็อคได้ถึง ${fmt(deadline)} (เหลือ ${daysLeft} วัน)` : `หมดเวลายกเลิก/เปลี่ยนล็อคแล้ว (สิ้นสุด ${fmt(deadline)})`}
        </p>
        {err && <p role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">{err}</p>}

        <button onClick={() => router.push("/preview")} className="w-full rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 py-3 font-medium text-neon-cyan transition hover:bg-neon-cyan/10">ดูผังร้านค้า (Preview)</button>
        <div className="grid grid-cols-2 gap-3">
          <button aria-disabled={!canEdit} onClick={() => (canEdit ? router.push("/edit") : setLate(true))}
            className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-medium transition ${canEdit ? "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10" : off}`}><FaPen />แก้ไขข้อมูล</button>
          <button aria-disabled={!canEdit} onClick={() => (canEdit ? setOpen(true) : setLate(true))}
            className={`flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-medium transition ${canEdit ? "border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : off}`}><FaTimes />ยกเลิก / ย้ายล็อค</button>
        </div>
      </div>

      {late && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal>
          <div className="w-full max-w-sm animate-sheet space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-glow-violet">
            <span className="mx-auto grid size-14 place-items-center rounded-full border border-amber-300/40 bg-amber-300/10 text-xl text-amber-300"><FaLock /></span>
            <h2 className="text-2xl font-bold text-white">เลยกำหนดยกเลิกแล้ว</h2>
            <p className="text-slate-400">ล็อค {stall} ถูกยืนยันถาวรแล้ว หากมีเหตุจำเป็น ติดต่อทีมงานในกลุ่มไลน์ผู้ค้า</p>
            <p className="rounded-xl bg-amber-300/10 px-3 py-2 text-sm text-amber-200">หมดเขตยกเลิกเมื่อ {fmt(deadline)}</p>
            <a href="https://www.instagram.com/so.kmutnb.prachinburi/" target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-violet to-neon-cyan py-3.5 font-bold text-slate-950 transition hover:shadow-glow-cyan active:scale-[0.98]"><FaInstagram />ติดต่อองค์การนักศึกษา</a>
            <button onClick={() => setLate(false)} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-slate-100 transition hover:bg-white/10">ปิด</button>
          </div>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal>
          <div className="w-full max-w-sm animate-sheet space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-glow-violet">
            <h2 className="text-2xl font-bold text-white">ยกเลิกล็อค {stall}?</h2>
            <p className="text-slate-400">ล็อคนี้จะว่างให้คนอื่นจองได้ทันที ถ้าเปลี่ยนใจภายหลังอาจไม่ได้ล็อคเดิมคืน</p>
            <p className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">✓ ยังอยู่ในช่วงยกเลิกได้ (ถึง {fmt(deadline)})</p>
            <button onClick={cancel} className="w-full rounded-2xl bg-rose-400 py-3.5 font-bold text-slate-950 transition hover:shadow-glow-pink active:scale-[0.98]">ยกเลิกและเลือกล็อคใหม่</button>
            <button onClick={() => setOpen(false)} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-slate-100 transition hover:bg-white/10">เก็บล็อคไว้</button>
          </div>
        </div>
      )}
    </Page>
  );
}
