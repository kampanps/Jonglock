"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { finishLogin, loginWithGoogle, DOMAIN_ERROR } from "@/lib/auth";

const ring = "absolute rounded-full border border-neon-violet/20";
const dot = "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full";

function Orbit() {
  return (
    <div className="relative size-60 sm:size-72 md:size-96" aria-hidden>
      <div className={`${ring} inset-0`} /><div className={`${ring} inset-[9%]`} /><div className={`${ring} inset-[18%]`} />
      <div className={`${ring} inset-[27%] border-neon-violet/40`} />
      {/* ก้อนฟ้า: วงนอก หมุนตามเข็มช้า */}
      <div className="absolute inset-0 animate-orbit-cw motion-reduce:animate-none"><i className={`${dot} size-4 bg-neon-cyan shadow-glow-cyan`} /></div>
      {/* ก้อนชมพู: วงใน หมุนทวนเข็มเร็วกว่า */}
      <div className="absolute inset-[18%] animate-orbit-ccw motion-reduce:animate-none"><i className={`${dot} size-3 bg-neon-pink shadow-glow-pink`} /></div>
      <div className="absolute inset-[33%] grid place-items-center rounded-full bg-neon-violet shadow-glow-violet">
        <svg viewBox="0 0 24 24" className="size-1/3 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
      </div>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(location.search + "&" + location.hash.slice(1));
    const e = p.get("error_description");
    if (e) return setMsg(/database error/i.test(e) ? DOMAIN_ERROR : e);
    supabase.auth.getSession().then(async ({ data }) => { if (data.session) setMsg((await finishLogin(data.session.user, router.replace)) ?? ""); });
  }, [router]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-5">
      <div className="pointer-events-none absolute left-1/2 top-1/4 size-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="relative grid w-full max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex justify-center"><Orbit /></div>
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan">จัดโดย องค์การนักศึกษา</span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">KMUTNB PRACHINBURI<br />MUSIC FEST 2569</h1>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300 sm:text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">เปิดจอง 1 – 20 ต.ค. 69</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">48 ล็อก · 4 แถว</span>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow-violet sm:p-5">
            {msg && (
              <div role="alert" className="animate-slide-down rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4">
                <p className="font-semibold text-rose-300">อีเมลนี้เข้าใช้งานไม่ได้</p>
                <p className="mt-1 text-sm text-slate-300">{msg} ระบบจึงออกจากระบบให้อัตโนมัติ</p>
              </div>
            )}
            <button onClick={async () => { setMsg(""); const { error } = await loginWithGoogle(); if (error) setMsg(error.message); }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 font-semibold text-slate-900 transition hover:shadow-glow-cyan active:scale-[0.98]">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
              {msg ? "ลองใหม่ด้วยอีเมลมหาวิทยาลัย" : "เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย"}
            </button>
            <p className="text-sm text-emerald-300">✓ รับเฉพาะอีเมล @kmutnb.ac.th และ @email.kmutnb.ac.th เท่านั้น</p>
          </div>
          <p className="text-xs text-slate-500">ผังล็อกจะเปิดหลังเข้าสู่ระบบ เพื่อให้ทุกคนเห็นสถานะที่อัปเดตจริง</p>
        </div>
      </div>
    </main>
  );
}
