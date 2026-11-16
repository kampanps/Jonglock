"use client";
import { Page } from "@/components/ui";
import ShopForm from "@/components/ShopForm";

export default function DevForm() {
  return (
    <Page title="ลงทะเบียนร้านของคุณ (DEV ตัวอย่าง)">
      <ShopForm showLine lockedStudentId="6501012345678" submitLabel="บันทึกและไปเลือกล็อค"
        initial={{ owner_name: "สมชาย ใจดี", student_id: "6501012345678", shop_name: "Moon Milk Tea", phone: "0812345678", products: ["ชานมไข่มุก"], guardians: [], line_joined: false }}
        onSubmit={async () => "DEV: ฟอร์มตัวอย่าง ไม่ได้บันทึกจริง"} />
    </Page>
  );
}
