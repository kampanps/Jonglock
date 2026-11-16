-- หน้า "ร้านที่จองล็อกแล้ว" (/shops): ให้ผู้ใช้ที่ล็อกอินเห็นชื่อร้าน สินค้า และเลขล็อก ของร้านที่จองแล้ว
-- RLS ของตาราง shops ให้เห็นแค่ร้านตัวเอง จึงต้องผ่านฟังก์ชันนี้ ซึ่งส่งออกเฉพาะ 3 ช่องนี้เท่านั้น
-- (ไม่มีชื่อเจ้าของ เบอร์โทร รหัสนักศึกษา อีเมล หรือ id ใดๆ) · รันครั้งเดียวใน SQL Editor ทั้งไฟล์
begin;

create or replace function public.shop_directory()
 returns jsonb
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select case when not is_kmutnb() then null else jsonb_build_object(
    'server_now', now(),
    'total_stalls', (select count(*) from stalls),
    'shops', coalesce((
      select jsonb_agg(jsonb_build_object('shop_name', s.shop_name, 'products', s.products, 'stall_id', b.stall_id) order by st.zone, st.num)
      from bookings b
      join shops s on s.id = b.shop_id
      join stalls st on st.id = b.stall_id
    ), '[]'::jsonb)
  ) end
$function$;

-- เฉพาะผู้ใช้ที่ล็อกอินแล้วเรียกได้ (คนนอกเรียกไม่ได้)
revoke all on function public.shop_directory() from public, anon;
grant execute on function public.shop_directory() to authenticated;

commit;

-- เช็กหลังรัน: anon = false, authenticated = true
select has_function_privilege('anon', 'public.shop_directory()', 'execute') as anon,
       has_function_privilege('authenticated', 'public.shop_directory()', 'execute') as authenticated;
