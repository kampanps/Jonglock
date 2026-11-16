import { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

// back = ลิงก์ "← กลับหน้าหลัก" เหนือชื่อหน้า (หน้าที่เข้ามาจากเมนู ไม่ได้อยู่ในขั้นตอนจอง) · "/" พาไปหน้าที่ถูกเอง (ลงทะเบียน / เลือกล็อก / บัตรร้าน)
export const Page = ({ title, children, wide, back }: { title: string; children: ReactNode; wide?: boolean; back?: string }) => (
  <main className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-4 sm:py-8">
    <Sidebar />
    <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
    <div className={`relative mx-auto ${wide ? "max-w-5xl" : "max-w-2xl"} rounded-3xl bg-slate-900/70 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur`}>
      <header className="flex items-start justify-between gap-3 border-b border-white/10 py-4 pl-5 pr-16 md:py-5 md:pl-8 md:pr-20">
        <div>
          {back && (
            <Link href={back} className="-ml-2 mb-1 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <span aria-hidden>←</span>กลับหน้าหลัก
            </Link>
          )}
          <p className="text-xs text-neon-cyan md:text-sm">KMUTNB Prachinburi Music Fest 2569</p>
          <h1 className="text-xl font-semibold text-slate-100 md:text-2xl">{title}</h1>
        </div>
      </header>
      <div className="p-5 md:p-8">{children}</div>
    </div>
  </main>
);
export const inputCls = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-neon-cyan ";
export const Btn = ({ tone = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "danger" | "ok" | "ghost" }) => {
  const t = {
    primary: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:brightness-110",
    danger: "bg-rose-400 text-slate-950 hover:brightness-110",
    ok: "bg-emerald-400 text-slate-950 ",
    ghost: "bg-white/10 text-slate-100 hover:bg-white/15",
  }[tone];
  return <button {...p} className={`rounded-2xl px-5 py-2.5 font-medium transition active:scale-[0.98] disabled:opacity-50 ${t} ${className}`} />;
};
