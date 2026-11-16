-- เพิ่มโดเมน @op.kmutnb.ac.th (บัญชีหน่วยงาน) — รันครั้งเดียวใน SQL Editor ทั้งไฟล์
-- เปิดกว้างขึ้นอย่างเดียว ไม่กระทบบัญชีที่ใช้อยู่ · ห่อด้วย transaction: พังบรรทัดไหน = ไม่มีอะไรเปลี่ยน
-- โดเมนที่รับหลังรัน: @kmutnb.ac.th, @email.kmutnb.ac.th, @op.kmutnb.ac.th
-- บัญชีหน่วยงานไม่มีรหัสนักศึกษา: enforce_student_id ดึงรหัสจากอีเมล s<เลข>@ เท่านั้น จึงไม่แตะบัญชีหน่วยงาน (student_id = '')
begin;

-- 1) ตัวกรองที่ RLS ทุกตาราง + hold/book/cancel/stall_snapshot/stall_neighbors เรียกใช้
create or replace function public.is_kmutnb()
 returns boolean
 language sql
 stable
 set search_path to 'public'
as $function$ select coalesce(lower(auth.jwt() ->> 'email') ~ '@((email|op)\.)?kmutnb\.ac\.th$', false) $function$;

-- 2) trigger t_domain บน auth.users (กันตอนสร้างบัญชี / เปลี่ยนอีเมล)
create or replace function public.enforce_domain()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.email !~* '@((email|op)\.)?kmutnb\.ac\.th$' then raise exception 'ใช้ได้เฉพาะอีเมล @kmutnb.ac.th, @email.kmutnb.ac.th หรือ @op.kmutnb.ac.th'; end if;
  return new;
end $function$;

commit;

-- เช็กหลังรัน: ต้องเห็น (email|op) ทั้ง 2 แถว
select proname, pg_get_functiondef(oid) like '%(email|op)%' as updated
from pg_proc where pronamespace = 'public'::regnamespace and proname in ('is_kmutnb', 'enforce_domain');
