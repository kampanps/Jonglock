// แถวโซนกิจกรรม 11 ล็อก (แสดงอย่างเดียว กดไม่ได้): ซ้าย 6 = สโมสร ×4 (เหลือง) + องค์การนักศึกษา ×2 (ม่วง) · ขวา 5 = สภา ×2 (แดง) + ชมรม ×3 (ฟ้า)
const Group = ({ label, n, tone }: { label: string; n: number; tone: string }) => (
  <div className={`pointer-events-none grid h-12 select-none overflow-hidden rounded-xl border ${tone}`} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className={`flex items-center justify-center px-0.5 text-center text-[10px] leading-tight sm:text-xs ${i ? "border-l border-inherit" : ""}`}>{label}</div>
    ))}
  </div>
);
export default function VenueRow() {
  return (
    <div className="grid grid-cols-[6fr_5fr] gap-3 pb-2" aria-label="โซนกิจกรรม">
      <div className="grid grid-cols-[4fr_2fr] gap-1.5">
        <Group label="สโมสร" n={4} tone="border-amber-300/40 bg-amber-300/10 text-amber-100" />
        <Group label="องค์การนักศึกษา" n={2} tone="border-violet-400/40 bg-violet-400/10 text-violet-200" />
      </div>
      <div className="grid grid-cols-[2fr_3fr] gap-1.5">
        <Group label="สภา" n={2} tone="border-rose-400/40 bg-rose-400/10 text-rose-200" />
        <Group label="ชมรม" n={3} tone="border-sky-400/40 bg-sky-400/10 text-sky-200" />
      </div>
    </div>
  );
}
