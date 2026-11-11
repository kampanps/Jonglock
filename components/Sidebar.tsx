"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaPen, FaUserShield, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type ItemProps = { icon: ReactNode; children: ReactNode; active?: boolean; tone?: string; href?: string; onClick?: () => void };

// เมนู: Hover แล้วเด้งขยาย (CSS spring) จากนั้นลอยซ้าย-ขวาวนลูป (Web Animations) · เอาเมาส์ออกแล้วค่อยๆ กลับที่เดิม
function Item({ icon, children, active, tone = "", href, onClick }: ItemProps) {
  const inner = useRef<HTMLSpanElement>(null); const anim = useRef<Animation | null>(null);
  const enter = () => {
    if (!inner.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    anim.current?.cancel();
    anim.current = inner.current.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
      { duration: 1800, delay: 300, iterations: Infinity, easing: "ease-in-out" });   // delay = รอให้เด้งขยายเสร็จก่อน
  };
  const leave = () => {
    const el = inner.current, a = anim.current; if (!el || !a) return;
    const x = new DOMMatrix(getComputedStyle(el).transform).m41;                      // ตำแหน่งปัจจุบัน → เลื่อนกลับ 0 นุ่มๆ
    a.cancel(); anim.current = null;
    el.animate([{ transform: `translateX(${x}px)` }, { transform: "translateX(0)" }], { duration: 250, easing: "ease-out" });
  };
  const cls = `block w-full rounded-xl px-3 py-3 text-left text-[15px] transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:bg-white/10 ${active ? "bg-white/10 text-white" : `text-slate-100 ${tone}`}`;
  const body = <span ref={inner} className="flex items-center gap-4"><span className="grid w-6 place-items-center text-lg">{icon}</span><span>{children}</span></span>;
  return href
    ? <Link href={href} className={cls} onMouseEnter={enter} onMouseLeave={leave}>{body}</Link>
    : <button type="button" onClick={onClick} className={cls} onMouseEnter={enter} onMouseLeave={leave}>{body}</button>;
}

export default function Sidebar() {
  const router = useRouter(); const path = usePathname();
  const [open, setOpen] = useState(false); const [admin, setAdmin] = useState(false); const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.rpc("is_admin").then(({ data }) => setAdmin(!!data));
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  async function logout() { await supabase.auth.signOut(); router.replace("/login"); }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="เปิดเมนู" aria-expanded={open} aria-controls="user-sidebar"
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 p-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <div onClick={() => setOpen(false)} aria-hidden className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      {/* กระจกฝ้า: เห็นดวงดาวด้านหลังรางๆ แต่ยังอ่านตัวอักษรชัด */}
      <aside id="user-sidebar" role="dialog" aria-modal="true" aria-label="เมนู" aria-hidden={!open}
        className={`fixed right-0 top-0 z-[70] flex h-full w-72 max-w-[85vw] flex-col border-l border-white/15 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-md transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "visible translate-x-0" : "invisible translate-x-full"}`}>
        {/* โปรไฟล์ผู้ใช้อยู่บนสุด */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500/40 text-base font-semibold uppercase text-white">{email[0] ?? "•"}</span>
          <div className="min-w-0 flex-1"><p className="text-xs text-slate-400">เข้าสู่ระบบอยู่</p><p className="truncate text-sm text-white" title={email}>{email || "…"}</p></div>
          <button onClick={() => setOpen(false)} aria-label="ปิดเมนู" className="p-1 text-slate-300 transition hover:text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          <Item href="/edit" icon={<FaPen />} active={path === "/edit"}>แก้ไขข้อมูลร้านค้า</Item>
          {admin && <Item href="/admin" icon={<FaUserShield />}>แผงควบคุมแอดมิน</Item>}
          <div className="!my-3 border-t border-white/10" />
          <Item onClick={logout} icon={<FaSignOutAlt />} tone="hover:text-rose-300">ออกจากระบบ</Item>
        </nav>
      </aside>
    </>
  );
}
