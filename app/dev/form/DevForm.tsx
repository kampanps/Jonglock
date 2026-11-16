"use client";
// ฟอร์มลงทะเบียนตัวอย่าง: ใช้ RegisterForm ตัวจริง (มีร่างใน localStorage) แต่ไม่บันทึกลงฐานข้อมูล
// ลอง: กรอก → รีเฟรชหน้า → ข้อมูลต้องกลับมา พร้อมแถบ "กู้ข้อมูลที่กรอกค้างไว้แล้ว"
import { Page } from "@/components/ui";
import RegisterForm from "@/components/RegisterForm";

export default function DevForm() {
  return (
    <Page title="ลงทะเบียนร้านของคุณ (DEV ตัวอย่าง)">
      <p className="-mt-2 mb-5 text-center text-slate-400">กรอกครั้งเดียว แก้ไขได้ทุกเมื่อก่อนวันงาน</p>
      <RegisterForm uid="dev-preview" lockedStudentId="6501012345678" agency={false}
        base={{ owner_name: "สมชาย ใจดี", student_id: "6501012345678", shop_name: "", phone: "", products: [], guardians: [], line_joined: false }}
        onSubmit={async () => "DEV: ฟอร์มตัวอย่าง ไม่ได้บันทึกจริง (ร่างยังอยู่ เพราะบันทึกไม่สำเร็จ)"} />
    </Page>
  );
}
