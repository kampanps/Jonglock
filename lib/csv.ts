// สร้างและดาวน์โหลด CSV ด้วย Blob (ไม่ต้องใช้ไลบรารี)
// - ใส่ BOM (\uFEFF) เพื่อให้ Excel อ่านภาษาไทยไม่เพี้ยน
// - คอลัมน์ข้อความตัวเลข (เบอร์โทร/รหัสนักศึกษา) ใส่เป็น ="..." กัน Excel ตัดเลข 0 หน้า
// - เซลล์ทั่วไปที่ขึ้นต้นด้วย = + - @ จะใส่ ' นำหน้า กันสูตรแฝงจากข้อมูลที่ผู้ใช้กรอก (CSV injection)
const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
const cell = (v: string | number, asText: boolean) => {
  const s = String(v ?? "");
  if (asText) return `="${s.replace(/"/g, '""')}"`;
  return esc(/^[=+\-@\t\r]/.test(s) ? "'" + s : s);
};

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][], textCols: number[] = []) {
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map((v, i) => cell(v, textCols.includes(i))).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
