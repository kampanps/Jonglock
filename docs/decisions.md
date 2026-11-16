# Project decisions

Agreed choices and rules for this project, newest last. Each entry: `## D-n · date · title`, then Tags / Decision / Why (and Supersedes when it replaces an older one). Edit freely; the AI reads it through wridge `project_memory`.

## D-1 · 2026-11-14 · เช็กของซ้ำกับร้านข้างเฉพาะร้านที่จองเสร็จแล้ว
Decision: กฎของซ้ำในระยะ conflict_range เช็กกับ bookings ที่จองเสร็จแล้วเท่านั้น ไม่นับ holds ที่กดค้างอยู่ เช็กทั้งตอน hold_stall (กันกดล็อกที่จองไม่ได้แน่) และตอน book_stall ภายใต้ global advisory lock
Why: hold เป็นของชั่วคราวและอาจถูกปล่อย การนับ hold จะบล็อกคนเกินจำเป็น ส่วน race ถูกปิดด้วย lock ตอนยืนยัน

## D-2 · 2026-11-14 · เวลา hold ต่อคน 90 วินาที
Decision: ตั้งเวลา hold ล็อกต่อคนเป็น 90 วินาที (ค่าใน app_settings ผ่านหน้าแอดมิน) และนับถอยหลังจากจำนวนวินาทีที่ server ส่งมา ไม่ใช้นาฬิกามือถือ
Why: คน ~200 คนแย่ง 55 ล็อก: นานไปล็อกถูกกั้นโดยคนลังเล สั้นไปอ่านร้านข้างไม่ทันบนมือถือ

## D-3 · 2026-11-14 · หน้าจองใช้ polling แทน Supabase Realtime
Decision: หน้าจองดึงสถานะผังผ่าน RPC stall_board() ทุก 2 วินาที (เฉพาะตอนแท็บเปิด, หน่วงเริ่มสุ่ม, ดึงทันทีหลังกด/ยืนยัน) เลิกใช้ postgres_changes และ presence ทั้งฝั่งจองและแอดมิน แอดมินใช้ปุ่ม refresh หรือ poll ทุก 15 วินาที ความถูกต้องของการจองอยู่ที่ global advisory lock ในฐานข้อมูล ไม่ขึ้นกับการแสดงผล
Why: Supabase Free จำกัด 200 connection และ 100 ข้อความ/วินาที (นับต่อผู้รับ) รับ ~200 ร้านแบบ realtime ไม่ได้ polling ไม่ติดลิมิตนี้ ภาระ ~100 req/s query เล็ก

## D-4 · 2026-11-15 · เวลา hold ต่อคน 60 วินาที
Decision: ใช้ hold 60 วินาที (app_settings.hold_minutes = 1) แทน 90 วินาที ไม่เปลี่ยนคอลัมน์เป็นหน่วยวินาที นับถอยหลังจากเวลา server เหมือนเดิม
Why: ใกล้วันเปิดจอง ไม่ต้องแก้ DB/หน้าแอดมิน popup มีแค่ร้านข้างเคียงกับปุ่มยืนยัน 60 วินาทีพอ เอาเวลาไปทำ race ในฐานข้อมูลแทน
Supersedes: D-2

## D-5 · 2026-11-15 · กันจองชนกันด้วยคิวต่อแถว + unique constraint (ของจริงใน DB)
Decision: ที่ทำจริง: book_stall / guard_shop_update / cancel_booking ใช้ pg_advisory_xact_lock ต่อแถว (A/B/C/D) แทน global lock และ RPC polling ชื่อ stall_snapshot() (ไม่ใช่ stall_board) ความถูกต้องข้ามแถวบังคับด้วย unique bookings.stall_id, bookings.shop_id, holds.owner_id และ book_stall ต้องถือ hold ของล็อกนั้น (supabase/02_fix_race.sql) ทดสอบด้วย supabase/race_test.js บน production 15 พ.ย. ผ่าน
Why: กฎของซ้ำและลำดับแถวเสื้อผ้าดูแค่แถวเดียวกัน คิวต่อแถวพอและไม่ทำให้ทุกแถวรอกัน ส่วนกฎ 1 ร้าน 1 ล็อกข้ามแถวใช้ unique แทน

## D-6 · 2026-11-15 · Code freeze ก่อนเปิดจอง 16 พ.ย.
Decision: ตั้งแต่ 15 พ.ย. ไม่แก้โค้ดหน้าเว็บ/ฟังก์ชันในฐานข้อมูลอีกจนปิดจอง ยกเว้นบั๊กที่ทำให้จองไม่ได้หรือจองผิด lint และ refactor ทำหลังจบงาน ระหว่างนี้แก้ได้แค่ค่าตั้ง (เวลา, rate limit) และข้อมูล
Why: ระบบผ่านการทดสอบ race บน production แล้ว การแก้เพิ่มในวันก่อนเปิดเสี่ยงกว่าประโยชน์

## D-7 · 2026-11-16 · รับบัญชีหน่วยงาน @op.kmutnb.ac.th
Decision: โดเมนที่รับ: @kmutnb.ac.th, @email.kmutnb.ac.th, @op.kmutnb.ac.th (regex @((email|op)\.)?kmutnb\.ac\.th$ ใน is_kmutnb() และ enforce_domain(), ALLOWED_DOMAINS ในหน้าเว็บ) บัญชี @op เป็นหน่วยงาน ไม่มีรหัสนักศึกษา: ฟอร์มไม่ถาม บันทึก student_id = '' และหน้าแอดมิน/บัตรร้านแสดงว่า "หน่วยงาน" วิดีโอไม่แก้
Why: หน่วยงานต้องจองล็อกได้ อีเมลหน่วยงานเป็นชื่อหน่วยงาน ไม่มีรหัสนักศึกษาให้ดึง

## D-8 · 2026-11-16 · รับบัญชีหน่วยงาน @itm.kmutnb.ac.th
Decision: เพิ่ม @itm.kmutnb.ac.th เป็นบัญชีหน่วยงานแบบเดียวกับ @op (ไม่มีรหัสนักศึกษา) regex ทุกที่เป็น @((email|op|itm)\.)?kmutnb\.ac\.th$ และ isAgencyEmail = @(op|itm)\.kmutnb\.ac\.th$ (supabase/04_add_itm_domain.sql)
Why: หน่วยงานที่ใช้โดเมน itm ต้องจองล็อกได้
Supersedes: D-7

## D-9 · 2026-11-16 · รับอีเมลคณะ/หน่วยงาน fitm, bas, agro, icit
Decision: โดเมนที่รับ: email., (ไม่มี subdomain), op, itm, fitm, bas, agro, icit .kmutnb.ac.th — DB regex @((email|op|itm|fitm|bas|agro|icit)\.)?kmutnb\.ac\.th$ (supabase/05_add_faculty_domains.sql) หน้าเว็บอ่านจาก lib/domains.ts ที่เดียว (PERSON_DOMAINS + AGENCY_DOMAINS) คณะ/หน่วยงานทั้งหมดเป็นบัญชีหน่วยงาน ไม่มีรหัสนักศึกษา
Why: คณะและหน่วยงานในวิทยาเขตปราจีนบุรีต้องจองล็อกได้ รวมรายชื่อไว้ที่เดียวกันลืมแก้บางจุด
Supersedes: D-8
