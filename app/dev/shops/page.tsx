import { notFound } from "next/navigation";
import DevShops from "./DevShops";

// ใช้ตอนพัฒนาเท่านั้น (npm run dev): ดูหน้า /shops ด้วยข้อมูลตัวอย่าง ไม่ต้องล็อกอิน ไม่แตะฐานข้อมูล
// บนเว็บจริง (production build) หน้านี้ตอบ 404
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevShops />;
}
