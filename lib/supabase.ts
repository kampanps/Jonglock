import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
export { ALLOWED_DOMAINS, isAllowedEmail } from "./domains"; // รายชื่อโดเมนอยู่ที่ lib/domains.ts
export type Shop = { id: string; owner_name: string; student_id: string; shop_name: string; phone: string; products: string[]; guardians: string[]; line_joined?: boolean };
