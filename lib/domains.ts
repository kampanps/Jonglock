// โดเมนอีเมลที่เข้าระบบได้ — ที่เดียวในหน้าเว็บ
// ต้องตรงกับ regex ใน is_kmutnb() / enforce_domain() ในฐานข้อมูล (ไฟล์ล่าสุด: supabase/05_add_faculty_domains.sql)

/** นักศึกษา (s<รหัส>@email…) และบุคลากรทั่วไป (@kmutnb.ac.th) */
export const PERSON_DOMAINS = ["email.kmutnb.ac.th", "kmutnb.ac.th"];

/** คณะ / หน่วยงาน: ไม่มีรหัสนักศึกษา ฟอร์มไม่ถาม และแสดงเป็น "หน่วยงาน" */
export const AGENCY_DOMAINS = [
  "fitm.kmutnb.ac.th", // คณะเทคโนโลยีและการจัดการอุตสาหกรรม
  "bas.kmutnb.ac.th", // คณะบริหารธุรกิจและอุตสาหกรรมบริการ
  "agro.kmutnb.ac.th", // คณะอุตสาหกรรมเกษตรดิจิทัล
  "op.kmutnb.ac.th", // กองงานวิทยาเขตปราจีนบุรี
  "icit.kmutnb.ac.th", // ฝ่ายเทคโนโลยีสารสนเทศ วิทยาเขตปราจีนบุรี
  "itm.kmutnb.ac.th",
];

export const ALLOWED_DOMAINS = [...PERSON_DOMAINS, ...AGENCY_DOMAINS];

const ends = (email: string | null | undefined, domains: string[]) => {
  const e = email?.trim().toLowerCase() ?? "";
  return domains.some((d) => e.endsWith("@" + d));
};
export const isAllowedEmail = (email?: string | null) => ends(email, ALLOWED_DOMAINS);
export const isAgencyEmail = (email?: string | null) => ends(email, AGENCY_DOMAINS);

/** "@fitm, @bas, … .kmutnb.ac.th" สำหรับข้อความบนหน้าจอ */
export const agencyList = AGENCY_DOMAINS.map((d) => "@" + d.split(".")[0]).join(", ") + " .kmutnb.ac.th";
