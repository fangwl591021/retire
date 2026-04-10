import { addTx } from './bonus.js';

export const processAddMember = async (kv, newUserId, sponsorId, name, phone, lineName, gender, birthday, address) => {
  let sponsor = await kv.get(`user:${sponsorId}`, "json");
  if (!sponsor && sponsorId !== 'ROOT') throw new Error("推薦人不存在");
  const now = new Date().toISOString();
  let memberData = { name, phone, lineName, gender, birthday, address, sponsor_id: sponsorId, created_at: now, left_leg: null, right_leg: null };
  
  if (sponsorId === 'ROOT') { 
    memberData.upline_id = null; memberData.is_independent = true; 
    await kv.put(`user:${newUserId}`, JSON.stringify(memberData)); 
    return; 
  }
  
  let uplineId = sponsor.is_independent ? sponsorId : sponsor.upline_id;
  memberData.upline_id = uplineId; memberData.is_independent = false;
  await kv.put(`user:${newUserId}`, JSON.stringify(memberData));
  
  if (!sponsor.is_independent) {
    if (!sponsor.left_leg) sponsor.left_leg = newUserId; 
    else if (!sponsor.right_leg) { sponsor.right_leg = newUserId; sponsor.is_independent = true; }
    
    await kv.put(`user:${sponsorId}`, JSON.stringify(sponsor));
    await addTx(kv, sponsorId, 1500, newUserId, "入會套組 (生母推薦)"); 
    if (sponsor.upline_id) await addTx(kv, sponsor.upline_id, 1500, newUserId, "入會套組 (養母輔導)");
  } else { 
    await addTx(kv, sponsorId, 3000, newUserId, "入會套組 (獨立直推)"); 
  }
};

export const approveApplication = async (kv, newUserId) => {
  const app = await kv.get(`app:${newUserId}`, "json");
  if (!app || app.status !== 'pending') return;

  const orderId = "ORD-" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const order = { orderId, buyerId: newUserId, productName: "入會資格與系統開通", price: 3000, bv: 3000, date: new Date().toISOString(), status: "completed" };
  await kv.put(`order:${orderId}`, JSON.stringify(order));

  await processAddMember(kv, newUserId, app.sponsorId, app.name, app.phone, app.lineName, app.gender, app.birthday, app.address);
  app.status = "approved";
  await kv.put(`app:${newUserId}`, JSON.stringify(app));
};

export const renewMember = async (kv, targetId) => {
  const member = await kv.get(`user:${targetId}`, "json");
  if (!member) throw new Error("找不到該會員資料");
  const now = new Date().toISOString();

  const orderId = "RNW-" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const order = { orderId, buyerId: targetId, productName: "年度續約資格", price: 3000, bv: 3000, date: now, status: "completed" };
  await kv.put(`order:${orderId}`, JSON.stringify(order));

  if (member.sponsor_id && member.sponsor_id !== 'ROOT') await addTx(kv, member.sponsor_id, 1500, targetId, "年度續約 (生母推薦)");
  if (member.upline_id && member.upline_id !== 'ROOT') await addTx(kv, member.upline_id, 1500, targetId, "年度續約 (養母輔導)");
  
  member.last_renew_at = now;
  await kv.put(`user:${targetId}`, JSON.stringify(member));
};

export const submitApplication = async (kv, newUserId, sponsorId, name, phone, lineName, gender, birthday, address) => {
  const app = { newUserId, sponsorId, name, phone, lineName, gender, birthday, address, status: "pending", date: new Date().toISOString() };
  await kv.put(`app:${newUserId}`, JSON.stringify(app));
  return { message: "申請已送出" };
};
