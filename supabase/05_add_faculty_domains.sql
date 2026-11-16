-- เพิ่มโดเมนคณะ/หน่วยงาน: @fitm, @bas, @agro, @icit (.kmutnb.ac.th) — รันครั้งเดียวใน SQL Editor ทั้งไฟล์
-- ของเดิมยังรับเหมือนเดิม: @kmutnb.ac.th, @email.kmutnb.ac.th, @op.kmutnb.ac.th, @itm.kmutnb.ac.th
-- เปิดกว้างขึ้นอย่างเดียว ไม่กระทบบัญชีที่ใช้อยู่ · ห่อด้วย transaction: พังบรรทัดไหน = ไม่มีอะไรเปลี่ยน
-- รายชื่อเดียวกับ AGENCY_DOMAINS + PERSON_DOMAINS ใน lib/domains.ts
begin;

create or replace function public.is_kmutnb()
 returns boolean
 language sql
 stable
 set search_path to 'public'
as $function$ select coalesce(lower(auth.jwt() ->> 'email') ~ '@((email|op|itm|fitm|bas|agro|icit)\.)?kmutnb\.ac\.th$', false) $function$;

create or replace function public.enforce_domain()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.email !~* '@((email|op|itm|fitm|bas|agro|icit)\.)?kmutnb\.ac\.th$' then raise exception 'ใช้ได้เฉพาะอีเมลมหาวิทยาลัย หรืออีเมลคณะ/หน่วยงาน (.kmutnb.ac.th)'; end if;
  return new;
end $function$;

commit;

-- เช็กหลังรัน: ต้องได้ true ทั้ง 2 แถว
select proname, pg_get_functiondef(oid) like '%(email|op|itm|fitm|bas|agro|icit)%' as updated
from pg_proc where pronamespace = 'public'::regnamespace and proname in ('is_kmutnb', 'enforce_domain');
