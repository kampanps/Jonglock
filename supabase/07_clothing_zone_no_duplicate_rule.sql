-- โซนเสื้อผ้า (B1–B4, C1–C4, D1–D4) ไม่ใช้กฎห้ามขายของซ้ำในระยะ 3 ล็อก — รันครั้งเดียวใน SQL Editor ทั้งไฟล์
-- ปัญหาเดิม: ร้านเสื้อผ้าทุกร้านมีสินค้า "เสื้อผ้า" เหมือนกัน และแต่ละแถวมีแค่ 4 ล็อก (D1–D4 ห่างกันไม่เกิน 3)
--   → แถวละจองได้ 1 ร้าน → แถว D ไม่มีวันเต็ม → แถว C และ B (เปิดเมื่อแถวก่อนหน้าเต็ม) ไม่มีวันเปิด
-- กติกาใหม่: เช็กของซ้ำเฉพาะ ล็อกอาหาร ↔ ล็อกอาหาร (ไม่นับข้ามโซน) · โซนเสื้อผ้าไม่เช็ก
-- ผ่อนกฎลงอย่างเดียว ร้านที่จองแล้วไม่โดนผลกระทบ · ห่อด้วย transaction: พังบรรทัดไหน = ไม่มีอะไรเปลี่ยน
-- ใช้ใน: book_stall (ตอนจอง), guard_shop_update (ตอนแก้สินค้า) ผ่าน find_conflict · popup หน้าจองผ่าน stall_neighbors
begin;

create or replace function public.find_conflict(p_stall text, p_shop uuid, p_products text[])
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select s2.id || ' (' || sh.shop_name || ')'
  from stalls me
  join stalls s2 on s2.zone = me.zone and s2.id <> me.id and abs(s2.num - me.num) <= (select conflict_range from app_settings)
  join bookings b on b.stall_id = s2.id join shops sh on sh.id = b.shop_id
  where me.id = p_stall and sh.id <> p_shop
    and not is_clothing_stall(me.id) and not is_clothing_stall(s2.id)   -- โซนเสื้อผ้าไม่เช็ก และไม่นับข้ามโซน
    and norm(sh.products) && norm(p_products)
  limit 1
$function$;

create or replace function public.stall_neighbors(p_stall text)
 returns table(stall_id text, products text[])
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select s2.id, sh.products from stalls me
  join stalls s2 on s2.zone = me.zone and s2.id <> me.id and abs(s2.num - me.num) <= (select conflict_range from app_settings)
  join bookings b on b.stall_id = s2.id join shops sh on sh.id = b.shop_id
  where me.id = p_stall and is_kmutnb()
    and not is_clothing_stall(me.id) and not is_clothing_stall(s2.id)   -- ตรงกับ find_conflict
  order by s2.num
$function$;

commit;

-- เช็กหลังรัน: ต้องได้ true ทั้ง 2 แถว
select proname, pg_get_functiondef(oid) like '%is_clothing_stall(s2.id)%' as updated
from pg_proc where pronamespace = 'public'::regnamespace and proname in ('find_conflict', 'stall_neighbors');
