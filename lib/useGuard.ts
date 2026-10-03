"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isAllowedEmail } from "./supabase";

export function useGuard() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !isAllowedEmail(data.user.email)) {
        await supabase.auth.signOut();
        router.replace("/login");
      } else setUid(data.user.id);
    });
  }, [router]);
  return uid;
}
