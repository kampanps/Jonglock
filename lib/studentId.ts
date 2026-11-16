// s6706021612011@email.kmutnb.ac.th → 6706021612011 (ตัด "s" หน้าสุด และตัดโดเมนหลัง @ ทิ้ง)
export const studentIdFromEmail = (email?: string | null) => email?.trim().toLowerCase().match(/^s(\d+)@/)?.[1] ?? "";
// บัญชีหน่วยงาน (@op.kmutnb.ac.th) ใช้ชื่อหน่วยงานเป็นอีเมล ไม่มีรหัสนักศึกษา
export const isAgencyEmail = (email?: string | null) => /@op\.kmutnb\.ac\.th$/i.test(email?.trim() ?? "");
