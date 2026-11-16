// ร่างฟอร์มลงทะเบียนร้าน เก็บใน localStorage ชั่วคราว — กันข้อมูลหายตอนสลับไปแอป LINE แล้วหน้าเว็บโหลดใหม่
// เก็บแยกตามบัญชี · หมดอายุ 24 ชม. · ลบเมื่อบันทึกร้านสำเร็จ / ออกจากระบบ / กด "ล้างแล้วเริ่มใหม่"
// localStorage ใช้ไม่ได้ (โหมดไม่ระบุตัวตนบางเครื่อง) → ทุกฟังก์ชันเงียบ ฟอร์มยังทำงานปกติ แค่ไม่มีร่าง
import type { Shop } from "./supabase";

export type DraftValues = Omit<Shop, "id" | "student_id">;
export type Draft = { savedAt: number; v: DraftValues; draft: string };

const PREFIX = "jonglock:draft:";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const key = (uid: string) => PREFIX + uid;

export function loadDraft(uid: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(uid));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (!d?.v || Date.now() - d.savedAt > MAX_AGE_MS) { localStorage.removeItem(key(uid)); return null; }
    return d;
  } catch { return null; }
}

export function saveDraft(uid: string, v: DraftValues, draft: string) {
  try { localStorage.setItem(key(uid), JSON.stringify({ savedAt: Date.now(), v, draft } satisfies Draft)); } catch {}
}

export function clearDraft(uid: string) {
  try { localStorage.removeItem(key(uid)); } catch {}
}

/** ตอนออกจากระบบ: ลบร่างของทุกบัญชีบนเครื่องนี้ */
export function clearAllDrafts() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  } catch {}
}
