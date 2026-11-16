import { notFound } from "next/navigation";
import DevForm from "./DevForm";

// ใช้ตอนพัฒนาเท่านั้น (npm run dev): ดูฟอร์มลงทะเบียนร้านด้วยข้อมูลตัวอย่าง ไม่บันทึกอะไร · production = 404
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevForm />;
}
