"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

// แสดงตอนเปิดเว็บ (SSR ใส่มาให้เลย ไม่มีหน้ากระพริบ) และทุกครั้งที่เปลี่ยนหน้า — ยกเว้น /admin
export default function GlobalLoader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [show, setShow] = useState(true); const [mount, setMount] = useState(true); const first = useRef(true);

  useEffect(() => {
    if (isAdmin) { setShow(false); setMount(false); return; }
    setMount(true); setShow(true);
    const t = setTimeout(() => setShow(false), first.current ? 700 : 350);
    first.current = false;
    return () => clearTimeout(t);
  }, [pathname, isAdmin]);
  useEffect(() => { if (show) return; const t = setTimeout(() => setMount(false), 300); return () => clearTimeout(t); }, [show]);

  if (isAdmin || !mount) return null;
  return <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}><LoadingScreen /></div>;
}
