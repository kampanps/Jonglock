"use client";
// ฟอร์มลงทะเบียนร้าน + ร่างชั่วคราวใน localStorage (lib/draft.ts) — ใช้เฉพาะหน้าลงทะเบียน
// กรอกค้างไว้ → สลับไปแอป LINE → กลับมาแล้วหน้าโหลดใหม่ → ข้อมูลยังอยู่
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import ShopForm from "./ShopForm";
import type { Shop } from "@/lib/supabase";
import { clearDraft, loadDraft, saveDraft, type DraftValues } from "@/lib/draft";

type V = Omit<Shop, "id">;
type Props = { uid: string; base: V; lockedStudentId: string; agency: boolean; onSubmit: (v: V) => Promise<string | void> };

const noop = () => () => {};

export default function RegisterForm({ uid, base, lockedStudentId, agency, onSubmit }: Props) {
  // ร่างอยู่ใน localStorage (มีแค่ฝั่งเบราว์เซอร์) → ยังไม่วาดฟอร์มตอน SSR/hydrate กัน HTML ไม่ตรงกัน
  const inBrowser = useSyncExternalStore(noop, () => true, () => false);
  const [saved] = useState(() => loadDraft(uid));          // อ่านครั้งเดียวตอนเปิดหน้า
  const [restored, setRestored] = useState(saved !== null);
  const [gen, setGen] = useState(0);                         // เปลี่ยนเลข = เริ่มฟอร์มใหม่
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initial: V = restored && saved ? { ...base, ...saved.v, student_id: base.student_id } : base;

  const onChange = useCallback((v: V, typing: string) => {
    if (timer.current) clearTimeout(timer.current);
    const { student_id: _sid, ...rest } = v;                 // รหัสนักศึกษาไม่ต้องเก็บ (ดึงจากอีเมลใหม่ได้)
    void _sid;
    timer.current = setTimeout(() => saveDraft(uid, rest as DraftValues, typing), 300);
  }, [uid]);

  const startOver = () => {
    if (timer.current) clearTimeout(timer.current);
    clearDraft(uid); setRestored(false); setGen((g) => g + 1);
  };

  if (!inBrowser) return null;
  return (
    <>
      {restored && (
        <div role="status" className="mx-auto mb-5 flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          <span>✓ กู้ข้อมูลที่กรอกค้างไว้แล้ว</span>
          <button type="button" onClick={startOver} className="rounded-xl px-2 py-1 text-emerald-200 underline underline-offset-2 hover:text-white">ล้างแล้วเริ่มใหม่</button>
        </div>
      )}
      <ShopForm key={gen} showLine lockedStudentId={lockedStudentId} agency={agency} submitLabel="บันทึกและไปเลือกล็อค"
        initial={initial} initialTyping={restored && saved ? saved.draft : ""} onChange={onChange}
        onSubmit={async (v) => {
          const m = await onSubmit(v);
          if (!m) { if (timer.current) clearTimeout(timer.current); clearDraft(uid); }   // บันทึกสำเร็จ → ลบร่าง
          return m;
        }} />
    </>
  );
}
