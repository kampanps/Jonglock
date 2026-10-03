import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
export const ALLOWED_DOMAINS = ["kmutnb.ac.th", "email.kmutnb.ac.th"];
export const isAllowedEmail = (e?: string | null) =>
  !!e && ALLOWED_DOMAINS.some((d) => e.trim().toLowerCase().endsWith("@" + d));
export type Shop = { id: string; owner_name: string; student_id: string; shop_name: string; phone: string; products: string[]; guardians: string[]; line_joined?: boolean };
