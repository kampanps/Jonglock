import type { User } from "@supabase/supabase-js";
import { supabase, isAllowedEmail } from "./supabase";

export const DOMAIN_ERROR = "อีเมลนี้ไม่ได้รับอนุญาต ใช้ได้เฉพาะ @kmutnb.ac.th หรือ @email.kmutnb.ac.th เท่านั้น";

export const loginWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/login`, queryParams: { prompt: "select_account" } },
  });

// ตรวจโดเมนหลังล็อกอินสำเร็จ (ทั้ง Email และ Google): ไม่ผ่าน = signOut ทันที, ผ่าน = ไปหน้าที่เหมาะสม
export async function finishLogin(user: User | null, go: (path: string) => void): Promise<string | null> {
  if (!user || !isAllowedEmail(user.email)) {
    await supabase.auth.signOut();
    return DOMAIN_ERROR;
  }
  const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
  if (!shop) return go("/register"), null;
  const { data: bk } = await supabase.from("bookings").select("id").eq("shop_id", shop.id).maybeSingle();
  go(bk ? "/detail" : "/booking");
  return null;
}
