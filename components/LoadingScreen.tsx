// หน้า Loading: วงแหวนเอียงแบบดาวเสาร์ (ระนาบเดียวกัน) + ดาวเคราะห์โคจรสวนทางกัน
// เทคนิค: ดาวเคราะห์อยู่ในระนาบที่เอียง แล้ว "หมุนหักล้าง" ทั้งการหมุนของแขนและการเอียงของระนาบ → ยังเป็นทรงกลมหันหน้าเข้าหากล้องเสมอ
const css = `
.ld-scene{position:relative;width:var(--s);height:var(--s);perspective:900px}
.ld-world{position:absolute;inset:0;transform-style:preserve-3d}
.ld-plane{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(70deg) rotateZ(-20deg)}
.ld-ring{position:absolute;border-radius:9999px;border:1.5px solid rgba(96,165,250,.75);box-shadow:0 0 14px rgba(59,130,246,.55),inset 0 0 14px rgba(59,130,246,.3)}
.ld-arm{position:absolute;transform-style:preserve-3d}
.ld-hold{position:absolute;left:calc(50% - var(--p)/2);top:calc(var(--p)/-2);width:var(--p);height:var(--p);transform-style:preserve-3d}
.ld-planet{width:100%;height:100%;border-radius:9999px;transform:rotateZ(20deg) rotateX(-70deg)}
.ld-core{position:absolute;left:31%;top:31%;width:38%;height:38%;transform:translateZ(0)}
@keyframes ld-cw{to{transform:rotate(360deg)}}
@keyframes ld-ccw{to{transform:rotate(-360deg)}}
.ld-a1{animation:ld-cw 7s linear infinite}   .ld-h1{animation:ld-ccw 7s linear infinite}   /* ฟ้า: ตามเข็ม ช้ากว่า */
.ld-a2{animation:ld-ccw 4.5s linear infinite} .ld-h2{animation:ld-cw 4.5s linear infinite}  /* ชมพู: ทวนเข็ม เร็วกว่า */
@media (prefers-reduced-motion:reduce){.ld-a1,.ld-h1,.ld-a2,.ld-h2{animation:none}}`;

export default function LoadingScreen() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen w-full flex-col items-center justify-center gap-14 bg-slate-950">
      <style>{css}</style>
      <div className="ld-scene [--s:260px] [--p:16px] sm:[--s:340px] sm:[--p:20px]">
        <div className="ld-world">
          <div className="ld-plane">
            <div className="ld-ring inset-0" />
            <div className="ld-ring inset-[14%]" />
            <div className="ld-arm ld-a1 inset-0"><div className="ld-hold ld-h1"><div className="ld-planet bg-cyan-300 shadow-[0_0_18px_#22d3ee]" /></div></div>
            <div className="ld-arm ld-a2 inset-[14%]"><div className="ld-hold ld-h2"><div className="ld-planet bg-pink-400 shadow-[0_0_18px_#f472b6]" /></div></div>
          </div>
          <div className="ld-core grid place-items-center rounded-full border-2 border-white/90 bg-slate-950/70 shadow-[0_0_30px_rgba(96,165,250,.7),inset_0_0_24px_rgba(96,165,250,.35)]">
            <svg viewBox="0 0 24 24" className="size-1/2 text-white" fill="currentColor" aria-hidden><path d="M9 3v11.3A3.5 3.5 0 1 0 11 17.5V8h6v6.3a3.5 3.5 0 1 0 2 3.2V3H9z" /></svg>
          </div>
        </div>
      </div>
      <p className="animate-pulse text-xl font-light tracking-[0.35em] text-white sm:text-2xl">LOADING...</p>
    </div>
  );
}
