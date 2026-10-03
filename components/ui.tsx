import { ReactNode } from "react";
import LogoutButton from "./LogoutButton";
import AdminSwitch from "./AdminSwitch";

export const Page = ({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) => (
  <main className="relative min-h-screen overflow-hidden px-3 py-5 sm:px-4 sm:py-8">
    <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
    <div className={`relative mx-auto ${wide ? "max-w-5xl" : "max-w-2xl"} rounded-3xl bg-slate-900/70 shadow-glow-violet ring-1 ring-white/10 backdrop-blur`}>
      <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-8 md:py-5">
        <div>
          <p className="text-xs text-neon-cyan md:text-sm">KMUTNB Prachinburi Music Fest 2569</p>
          <h1 className="text-xl font-semibold text-slate-100 md:text-2xl">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2"><AdminSwitch /><LogoutButton /></div>
      </header>
      <div className="p-5 md:p-8">{children}</div>
    </div>
  </main>
);
export const inputCls = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-neon-cyan focus:shadow-glow-cyan";
export const Btn = ({ tone = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "danger" | "ok" | "ghost" }) => {
  const t = {
    primary: "bg-gradient-to-r from-neon-violet to-neon-cyan text-slate-950 hover:shadow-glow-cyan",
    danger: "bg-rose-400 text-slate-950 hover:shadow-glow-pink",
    ok: "bg-emerald-400 text-slate-950 hover:shadow-[0_0_20px_rgba(52,211,153,.5)]",
    ghost: "bg-white/10 text-slate-100 hover:bg-white/15",
  }[tone];
  return <button {...p} className={`rounded-2xl px-5 py-2.5 font-medium transition active:scale-[0.98] disabled:opacity-50 ${t} ${className}`} />;
};
