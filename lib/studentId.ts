// s6706021612011@email.kmutnb.ac.th → 6706021612011 (ตัด "s" หน้าสุด และตัดโดเมนหลัง @ ทิ้ง)
export const studentIdFromEmail = (email?: string | null) => email?.trim().toLowerCase().match(/^s(\d+)@/)?.[1] ?? "";
