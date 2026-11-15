// ทดสอบ race condition ของระบบจองบนเว็บจริง — วางใน DevTools Console ของหน้า jonglock (ต้องล็อกอินแล้ว)
// ⚠️ เขียนข้อมูลจริง: hold / จอง / ยกเลิก — ใช้กับบัญชีทดสอบ ก่อนประกาศลิงก์เท่านั้น สคริปต์ยกเลิกสิ่งที่สร้างให้เองตอนจบ
// ใช้: await raceTest({ rounds: 5 })                        → ทดสอบ 1 บัญชี (กดรัว hold 2 ล็อก, จอง 2 ล็อกพร้อมกัน)
//      await raceTest({ rounds: 5, token2: "<access_token บัญชีที่ 2>" }) → เพิ่มทดสอบร้านข้างกันขายของซ้ำ
//      token2: เปิดเว็บอีกเบราว์เซอร์/โหมดไม่ระบุตัวตน ล็อกอินบัญชีที่ 2 แล้วรันใน console นั้น:
//      JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /^sb-.*-auth-token$/.test(k)))).access_token
//      (2 บัญชีต้องมีสินค้าเหมือนกันอย่างน้อย 1 อย่าง ไม่ใช่ร้านเสื้อผ้า และยังไม่ได้จอง)
// stalls  = 2 ล็อกต่างแถว (ล็อกของ DB เป็นคิวต่อแถว — race ข้ามแถวจะเห็นเฉพาะคู่ต่างแถว)
// nearby  = 2 ล็อกติดกันแถวเดียวกัน สำหรับทดสอบของซ้ำกับร้านข้างเคียง
async function raceTest({ rounds = 5, stalls = ["A5", "B6"], nearby = ["A9", "A10"], token2 = null } = {}) {
  const base = "https://eeptoukaufpxiwsmwsws.supabase.co";
  let key = null;
  for (const s of performance.getEntriesByType("resource").map((e) => e.name).filter((n) => n.endsWith(".js"))) {
    const m = (await (await fetch(s)).text()).match(/sb_publishable_[A-Za-z0-9_-]+/); if (m) { key = m[0]; break; }
  }
  const token1 = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k)))).access_token;
  const rpc = async (tok, fn, args = {}) => {
    const r = await fetch(`${base}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: key, Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    const t = await r.text(); let d = null; try { d = JSON.parse(t); } catch { d = t; }
    return { ok: r.ok, data: d, msg: r.ok ? "" : (d?.message ?? t) };
  };
  const snap = (tok) => rpc(tok, "stall_snapshot").then((x) => x.data);
  const cleanup = async (tok) => { await rpc(tok, "cancel_booking"); await rpc(tok, "release_hold"); };
  const [x, y] = stalls; const result = { holdTwice: [], bookTwice: [], neighbor: [] };

  const start = await snap(token1);
  if (start?.mine) return console.warn("บัญชีนี้จองไว้แล้ว (" + start.mine + ") — ยกเลิกก่อน หรือใช้บัญชีอื่น"), null;
  if ((start?.taken ?? []).some((s) => stalls.includes(s) || nearby.includes(s))) return console.warn("ล็อกทดสอบมีคนจองแล้ว เปลี่ยน stalls / nearby"), null;

  for (let i = 0; i < rounds; i++) {
    // 1) กด hold 2 ล็อกพร้อมกัน → ต้องถือได้ไม่เกิน 1
    await Promise.all([rpc(token1, "hold_stall", { p_stall: x }), rpc(token1, "hold_stall", { p_stall: y })]);
    const s1 = await snap(token1); result.holdTwice.push(s1.holds.filter((h) => h.mine).length);
    await rpc(token1, "release_hold");

    // 2) hold x แล้วยิงจอง x กับ y พร้อมกัน → ต้องได้ไม่เกิน 1 ล็อก (y ไม่ได้ hold ควรถูกปฏิเสธ)
    await rpc(token1, "hold_stall", { p_stall: x });
    const b = await Promise.all([rpc(token1, "book_stall", { p_stall: x }), rpc(token1, "book_stall", { p_stall: y })]);
    const s2 = await snap(token1);
    result.bookTwice.push({ success: b.filter((r) => r.ok).length, mineTaken: s2.taken.filter((s) => stalls.includes(s)).length, errors: b.filter((r) => !r.ok).map((r) => r.msg) });
    await cleanup(token1);

    // 3) 2 บัญชีขายของเหมือนกัน hold ล็อกติดกัน แล้วกดยืนยันพร้อมกัน → ต้องผ่านแค่คนเดียว
    if (token2) {
      const [n1, n2] = nearby;
      await Promise.all([rpc(token1, "hold_stall", { p_stall: n1 }), rpc(token2, "hold_stall", { p_stall: n2 })]);
      const c = await Promise.all([rpc(token1, "book_stall", { p_stall: n1 }), rpc(token2, "book_stall", { p_stall: n2 })]);
      result.neighbor.push({ success: c.filter((r) => r.ok).length, errors: c.filter((r) => !r.ok).map((r) => r.msg) });
      await Promise.all([cleanup(token1), cleanup(token2)]);
    }
  }
  const fail = result.holdTwice.some((n) => n > 1) || result.bookTwice.some((r) => r.success > 1 || r.mineTaken > 1) || result.neighbor.some((r) => r.success > 1);
  console.log(fail ? "❌ เจอ race — ดูรายละเอียดด้านล่าง" : "✅ ไม่เจอ race ใน " + rounds + " รอบ (ไม่ได้พิสูจน์ว่าไม่มี — ต้องดูโค้ดฟังก์ชันด้วย)");
  console.log(JSON.stringify(result, null, 2));
  return result;
}
