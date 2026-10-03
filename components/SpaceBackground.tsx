// พื้นหลังอวกาศ: ดาวชมพู/ฟ้า โคจรช้าๆ + กะพริบบางดวง ใช้ CSS transform/opacity ล้วน (ไม่กิน CPU, ไม่ต้องมี JS ตอนรัน)
const rng = (a: number) => () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// สุ่มแบบ seed คงที่ → server/client ได้ค่าเดียวกัน ไม่เกิด hydration error
const STARS = (() => {
  const r = rng(2569);
  return Array.from({ length: 36 }, () => ({
    x: r() * 100, y: r() * 100, size: 2 + r() * 2.5, radius: 24 + r() * 90, dur: 50 + r() * 60,
    twinkle: r() < 0.4 ? 3 + r() * 4 : 0, delay: -r() * 90, pink: r() < 0.5, rev: r() < 0.5,
  }));
})();

const css = `
@keyframes sb-orbit{to{transform:rotate(360deg)}}
@keyframes sb-twinkle{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.3)}}
.sb-o{position:absolute;width:0;height:0;animation:sb-orbit var(--d) linear var(--dl) infinite;animation-direction:var(--dir)}
.sb-s{position:absolute;top:0;border-radius:9999px;opacity:.75}
.sb-t{animation:sb-twinkle var(--t) ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.sb-o,.sb-t{animation:none}}`;

export default function SpaceBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0F19]">
      <style>{css}</style>
      {STARS.map((s, i) => {
        const c = s.pink ? "#f472b6" : "#67e8f9";
        return (
          <div key={i} className="sb-o" style={{ left: `${s.x}%`, top: `${s.y}%`, ["--d" as string]: `${s.dur}s`, ["--dl" as string]: `${s.delay}s`, ["--dir" as string]: s.rev ? "reverse" : "normal" }}>
            <span className={`sb-s ${s.twinkle ? "sb-t" : ""}`}
              style={{ left: s.radius, width: s.size, height: s.size, background: c, boxShadow: `0 0 ${s.size * 3}px ${c}`, ["--t" as string]: `${s.twinkle}s` }} />
          </div>
        );
      })}
    </div>
  );
}
