"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function out() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }
  return (
    <button onClick={out} disabled={busy}
      className="shrink-0 rounded-full border border-white/10 bg-slate-900 px-4 py-1.5 text-sm text-slate-400 shadow-sm transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 active:scale-95 disabled:opacity-50">
      {busy ? "กำลังออก…" : "ออกจากระบบ"}
    </button>
  );
}
