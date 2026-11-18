// แหล่งข้อมูลเดียวของผังงาน (เดิมตัวเลข 12/48 กระจายหลายไฟล์): A=13, B/C/D=14 รวม 55 ล็อก
export const ROW_IDS = ["A", "B", "C", "D"] as const;
export const rowLen = (z: string) => (z === "A" ? 13 : 14);
export const ALL_IDS = ROW_IDS.flatMap((z) => Array.from({ length: rowLen(z) }, (_, i) => z + (i + 1)));
export const TOTAL_STALLS = ALL_IDS.length;
// โซนเสื้อผ้า = D1–D4 เท่านั้น (ต้องตรงกับ is_clothing_stall ในฐานข้อมูล)
export const CLOTHING = new Set([1, 2, 3, 4].map((n) => "D" + n));
