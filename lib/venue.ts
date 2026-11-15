// แหล่งข้อมูลเดียวของผังงาน (เดิมตัวเลข 12/48 กระจายหลายไฟล์): A=13, B/C/D=14 รวม 55 ล็อก
export const ROW_IDS = ["A", "B", "C", "D"] as const;
export const rowLen = (z: string) => (z === "A" ? 13 : 14);
export const ALL_IDS = ROW_IDS.flatMap((z) => Array.from({ length: rowLen(z) }, (_, i) => z + (i + 1)));
export const TOTAL_STALLS = ALL_IDS.length;
// โซนเสื้อผ้า = B1–B4, C1–C4, D1–D4 (ต้องตรงกับ zone_check ในฐานข้อมูล)
export const CLOTHING = new Set(["B", "C", "D"].flatMap((z) => [1, 2, 3, 4].map((n) => z + n)));
