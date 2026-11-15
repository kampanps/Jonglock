import type { NextConfig } from "next";

// (13) Security headers — ถ้ามี next.config.ts เดิมให้รวมเฉพาะส่วน headers()
const supa = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : "*.supabase.co";
const dev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,   // Next ต้องใช้ inline script (ถ้าจะเข้มกว่านี้ต้องทำ nonce ผ่าน middleware)
  "style-src 'self' 'unsafe-inline'",                                  // มี <style> ในคอมโพเนนต์พื้นหลัง/Loading
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://${supa} wss://${supa}${dev ? " ws://localhost:* http://localhost:*" : ""}`,
  "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ] }];
  },
};
export default nextConfig;
