-- เพิ่มโดเมน @itm.kmutnb.ac.th (บัญชีหน่วยงาน เหมือน @op) — รันครั้งเดียวใน SQL Editor ทั้งไฟล์
-- เปิดกว้างขึ้นอย่างเดียว ไม่กระทบบัญชีที่ใช้อยู่ · ห่อด้วย transaction: พังบรรทัดไหน = ไม่มีอะไรเปลี่ยน
-- โดเมนที่รับหลังรัน: @kmutnb.ac.th, @email.kmutnb.ac.th, @op.kmutnb.ac.th, @itm.kmutnb.ac.th
begin;

create or replace function public.is_kmutnb()
 returns boolean
 language sql
 stable
 set search_path to 'public'
as $function$ select coalesce(lower(auth.jwt() ->> 'email') ~ '@((email|op|itm)\.)?kmutnb\.ac\.th$', false) $function$;

create or replace function public.enforce_domain()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.email !~* '@((email|op|itm)\.)?kmutnb\.ac\.th$' then raise exception 'ใช้ได้เฉพาะอีเมล @kmutnb.ac.th, @email.kmutnb.ac.th, @op.kmutnb.ac.th หรือ @itm.kmutnb.ac.th'; end if;
  return new;
end $function$;

commit;

-- เช็กหลังรัน: ต้องได้ true ทั้ง 2 แถว
select proname, pg_get_functiondef(oid) like '%(email|op|itm)%' as updated
from pg_proc where pronamespace = 'public'::regnamespace and proname in ('is_kmutnb', 'enforce_domain');
