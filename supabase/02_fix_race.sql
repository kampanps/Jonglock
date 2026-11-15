-- ปิด race ที่เหลือ (ตรวจจาก dump 15 พ.ย.) — รันครั้งเดียวใน SQL Editor ทั้งไฟล์
-- ปัญหา: book_stall ล็อกคิว "ต่อแถว" จึงกันร้านข้างกันได้ แต่ร้านเดียวกันยิงจอง 2 ล็อก "ต่างแถว" พร้อมกัน (เช่นเปิด 2 แท็บ)
--        จะได้ 2 ล็อก เพราะ bookings.shop_id ไม่มี unique และ book_stall ไม่บังคับว่าต้องถือ hold ของล็อกนั้น
-- ห่อด้วย transaction: ถ้าบรรทัดไหนพัง จะไม่มีอะไรเปลี่ยนเลย
begin;

-- 1) ร้านละ 1 ล็อก บังคับที่ระดับข้อมูล (one_per_account = true อยู่แล้ว)
--    ถ้ามีร้านที่จองเกิน 1 ล็อกอยู่ก่อน คำสั่งนี้จะ error และยกเลิกทั้งไฟล์ — ตอนนี้ dump บอก 0 ร้าน
create unique index if not exists bookings_shop_uq on public.bookings (shop_id);

-- 2) book_stall: ต้องถือ hold ของล็อกนั้นอยู่และยังไม่หมดเวลา (เดิมเรียกจองตรงๆ ข้ามขั้นนับถอยหลังได้)
--    นอกนั้นเหมือนเดิมทุกบรรทัด
create or replace function public.book_stall(p_stall text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_shop shops; v_conf text; c app_settings; v_zone char(1);
begin
  if not is_kmutnb() then raise exception 'ใช้ได้เฉพาะอีเมลมหาวิทยาลัย'; end if;
  select * into c from app_settings;
  if now() < c.open_at then raise exception 'ยังไม่เปิดรับจอง'; end if;
  if now() > c.close_at then raise exception 'ปิดรับจองแล้ว'; end if;
  select zone into v_zone from stalls where id = p_stall;
  if not found then raise exception 'ไม่พบล็อก'; end if;
  perform pg_advisory_xact_lock(hashtext('row-' || v_zone));          -- คิวเดียวต่อแถว: คนที่สองจะเห็นผลของคนแรกเสมอ
  select * into v_shop from shops where owner_id = auth.uid();
  if not found then raise exception 'กรุณาลงทะเบียนร้านค้าก่อน'; end if;
  if c.one_per_account and exists (select 1 from bookings where shop_id = v_shop.id) then raise exception 'คุณจองล็อกไปแล้ว'; end if;
  if not exists (select 1 from holds where stall_id = p_stall and owner_id = auth.uid() and expires_at > now()) then
    raise exception 'หมดเวลายืนยัน หรือยังไม่ได้เลือกล็อกนี้ กรุณาเลือกล็อกใหม่';
  end if;
  perform zone_check(p_stall, v_shop.products);
  if exists (select 1 from bookings where stall_id = p_stall) then raise exception 'ล็อกนี้ถูกจองแล้ว'; end if;
  v_conf := find_conflict(p_stall, v_shop.id, v_shop.products);
  if v_conf is not null then raise exception 'จองไม่ได้: ขายของซ้ำกับล็อก % ในระยะ % ล็อก', v_conf, c.conflict_range; end if;
  begin
    insert into bookings(stall_id, shop_id) values (p_stall, v_shop.id);
  exception when unique_violation then
    raise exception 'จองไม่สำเร็จ: ล็อกนี้ถูกจองแล้ว หรือคุณจองล็อกอื่นไปแล้ว';
  end;
  delete from holds where owner_id = auth.uid();
end $function$;

-- 3) cancel_booking เข้าคิวแถวเดียวกับการจอง (กันจังหวะยกเลิกแถว D ชนกับการเปิดแถว C)
create or replace function public.cancel_booking()
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_zone char(1);
begin
  if not is_kmutnb() then raise exception 'ใช้ได้เฉพาะอีเมลมหาวิทยาลัย'; end if;
  if now() > (select edit_deadline from app_settings) then raise exception 'หมดเวลายกเลิกแล้ว'; end if;
  select st.zone into v_zone from bookings b join shops s on s.id = b.shop_id join stalls st on st.id = b.stall_id where s.owner_id = auth.uid();
  if v_zone is null then return; end if;
  perform pg_advisory_xact_lock(hashtext('row-' || v_zone));
  delete from bookings where shop_id = (select id from shops where owner_id = auth.uid());
end $function$;

commit;

-- เช็กหลังรัน (ควรได้ 1 แถว: bookings_shop_uq)
select indexname from pg_indexes where schemaname = 'public' and indexname = 'bookings_shop_uq';
