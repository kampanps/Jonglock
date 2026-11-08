"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaPen, FaUserShield, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

const Item = ({ icon, children, active, tone = "", ...p }: { icon: React.ReactNode; children: React.ReactNode; active?: boolean; tone?: string } & React.HTMLAttributes<HTMLElement> & { href?: string; onClick?: () => void }) => {
  const cls = `flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-[15px] transition ${active ? "bg-white/10 text-white" : `text-slate-200 hover:bg-white/10 ${tone}`}`;
  const inner = <><span className="grid w-6 place-items-center text-lg">{icon}</span><span>{children}</span></>;
  return p.href ? <Link href={p.href} className={cls}>{inner}</Link> : <button type="button" onClick={p.onClick} className={cls}>{inner}</button>;
};

export default function Sidebar() {
  const router = useRouter(); const path = usePathname();
  const [open, setOpen] = useState(false); const [admin, setAdmin] = useState(false); const [email, setEmail] = useState("");

  useEffect(() => { // สิทธิ์แอดมินเช็คจากฐานข้อมูล (is_admin) ไม่ได้ฝังอีเมลไว้ในโค้ด
    supabase.rpc("is_admin").then(({ data }) => setAdmin(!!data));
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  useEffect(() => setOpen(false), [path]);                       // เปลี่ยนหน้าแล้วปิดเมนู
  useEffect(() => {                                              // Esc ปิด + กันหน้าเลื่อนตอนเปิด
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  async function logout() { await supabase.auth.signOut(); router.replace("/login"); }

  return (
    <>
      {/* Hamburger: ลอยบนพื้นหลัง ไม่มีกรอบ/พื้นหลัง ใช้เงาตัวไอคอนช่วยให้เห็นชัด */}
      <button onClick={() => setOpen(true)} aria-label="เปิดเมนู" aria-expanded={open} aria-controls="user-sidebar"
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 p-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <div onClick={() => setOpen(false)} aria-hidden className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside id="user-sidebar" role="dialog" aria-modal="true" aria-label="เมนู" aria-hidden={!open}
        className={`fixed right-0 top-0 z-[70] flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur transition-[transform,visibility] duration-300 ease-out ${open ? "visible translate-x-0" : "invisible translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <div><p className="font-bold text-white">MUSIC FEST 2569</p><p className="text-xs text-slate-500">ระบบจองล็อกร้านค้า</p></div>
          <button onClick={() => setOpen(false)} aria-label="ปิดเมนู" className="p-1 text-slate-300 transition hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          <Item href="/edit" icon={<FaPen />} active={path === "/edit"}>แก้ไขข้อมูลร้านค้า</Item>
          {admin && <Item href="/admin" icon={<FaUserShield />}>แผงควบคุมแอดมิน</Item>}
          <div className="!my-3 border-t border-white/10" />
          <Item onClick={logout} icon={<FaSignOutAlt />} tone="hover:text-rose-300">ออกจากระบบ</Item>
        </nav>
        {email && (
          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-500/30 text-sm font-semibold uppercase text-violet-100">{email[0]}</span>
            <p className="min-w-0 truncate text-sm text-slate-300" title={email}>{email}</p>
          </div>
        )}
      </aside>
    </>
  );
}
