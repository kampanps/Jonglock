import { supabase } from "./supabase";
// เช็คสิทธิ์แอดมิน 1 ครั้งต่อผู้ใช้ (ไม่เรียกซ้ำทุกหน้า)
let key = ""; let p: Promise<boolean> | null = null;
export const checkAdmin = (uid: string) => { if (key !== uid || !p) { key = uid; p = Promise.resolve(supabase.rpc("is_admin")).then(({ data }) => !!data); } return p; };
