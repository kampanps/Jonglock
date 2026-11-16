-- อ่านอย่างเดียว ไม่แก้อะไรในฐานข้อมูล · ไม่ดึงข้อมูลส่วนบุคคล (มีแค่จำนวนแถว)
-- วิธีใช้: Supabase → SQL Editor → วางทั้งไฟล์ → Run → คลิกช่องผลลัพธ์ "report" → Copy cell แล้วส่งกลับมา
with
cols as (
  select string_agg(format('%s.%s  %s%s%s', c.table_name, c.column_name, c.data_type,
           case when c.is_nullable = 'NO' then ' not null' else '' end,
           coalesce(' default ' || c.column_default, '')), E'\n' order by c.table_name, c.ordinal_position) t
  from information_schema.columns c where c.table_schema = 'public'
),
cons as (
  select string_agg(format('%s: %s  %s', conrelid::regclass, conname, pg_get_constraintdef(oid)), E'\n' order by conrelid::regclass::text, conname) t
  from pg_constraint where connamespace = 'public'::regnamespace
),
idx as (
  select string_agg(indexdef, E'\n' order by tablename, indexname) t from pg_indexes where schemaname = 'public'
),
tbl as (
  select string_agg(format('%s  rls=%s  replica_identity=%s', relname, relrowsecurity, relreplident), E'\n' order by relname) t
  from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'
),
pol as (
  select string_agg(format('%s | %s | %s | roles=%s | using: %s | check: %s', tablename, policyname, cmd, roles, qual, with_check), E'\n' order by tablename, policyname) t
  from pg_policies where schemaname = 'public'
),
grants as (
  select string_agg(format('%s  %s  %s', table_name, grantee, privilege_type), E'\n' order by table_name, grantee, privilege_type) t
  from information_schema.role_table_grants where table_schema = 'public' and grantee in ('anon', 'authenticated')
),
fn as (
  select string_agg(pg_get_functiondef(p.oid), E'\n\n' order by p.proname) t
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
),
fexec as (
  select string_agg(format('%s  anon=%s  authenticated=%s', p.oid::regprocedure,
           has_function_privilege('anon', p.oid, 'execute'), has_function_privilege('authenticated', p.oid, 'execute')), E'\n' order by p.proname) t
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
    and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
),
trg as (
  select string_agg(format('%s: %s', tgrelid::regclass, pg_get_triggerdef(oid)), E'\n' order by tgname) t
  from pg_trigger where not tgisinternal and tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace)
),
pub as (
  select string_agg(format('%s.%s', schemaname, tablename), ', ') t from pg_publication_tables where pubname = 'supabase_realtime'
),
ext as (
  select string_agg(format('%s %s', extname, extversion), ', ' order by extname) t from pg_extension
),
settings as (
  select json_agg(s)::text t from public.app_settings s
),
counts as (
  select format('shops=%s  bookings=%s  holds=%s  stalls=%s  admins=%s  non_kmutnb_users=%s  shops_with_2plus_bookings=%s  users_with_2plus_holds=%s',
    (select count(*) from public.shops), (select count(*) from public.bookings), (select count(*) from public.holds),
    (select count(*) from public.stalls), (select count(*) from public.admins),
    (select count(*) from auth.users where email !~* '@((email|op|itm|fitm|bas|agro|icit)\.)?kmutnb\.ac\.th$'),
    (select count(*) from (select shop_id from public.bookings group by shop_id having count(*) > 1) d),
    (select count(*) from (select owner_id from public.holds group by owner_id having count(*) > 1) d)) t
),
authtrg as (
  select string_agg(t.tgname || ': ' || pg_get_triggerdef(t.oid), E'\n') t
  from pg_trigger t where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
),
colgrants as (
  select string_agg(format('%s  %s.%s  %s', grantee, table_name, column_name, privilege_type), E'\n' order by table_name, column_name, grantee) t
  from information_schema.column_privileges
  where table_schema = 'public' and grantee in ('anon', 'authenticated') and privilege_type in ('INSERT', 'UPDATE')
)
select concat_ws(E'\n\n',
  '== VERSION', version(),
  '== TABLES', tbl.t,
  '== COLUMNS', cols.t,
  '== CONSTRAINTS', cons.t,
  '== INDEXES', idx.t,
  '== POLICIES', pol.t,
  '== TABLE GRANTS (anon/authenticated)', grants.t,
  '== TRIGGERS', trg.t,
  '== AUTH.USERS TRIGGERS', authtrg.t,
  '== COLUMN GRANTS (insert/update)', colgrants.t,
  '== FUNCTION EXECUTE', fexec.t,
  '== REALTIME PUBLICATION', pub.t,
  '== EXTENSIONS', ext.t,
  '== APP_SETTINGS', settings.t,
  '== COUNTS', counts.t,
  '== FUNCTIONS', fn.t
) as report
from cols, cons, idx, tbl, pol, grants, fn, fexec, trg, pub, ext, settings, counts, authtrg, colgrants;
