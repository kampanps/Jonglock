"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

// (12) แสดงเฉพาะตอนเปิดเว็บ (SSR ใส่มาให้) แล้วซ่อนทันทีที่ hydrate เสร็จ — ไม่มีดีเลย์ประดิษฐ์ และไม่แสดงตอนเปลี่ยนหน้า (ยกเว้น /admin)
export default function GlobalLoader() {
  const isAdmin = usePathname().startsWith("/admin");
  const [show, setShow] = useState(true); const [mount, setMount] = useState(true);
  useEffect(() => { setShow(false); const t = setTimeout(() => setMount(false), 250); return () => clearTimeout(t); }, []);
  if (isAdmin || !mount) return null;
  return <div className={`fixed inset-0 z-[100] transition-opacity duration-200 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}><LoadingScreen /></div>;
}
