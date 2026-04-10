export const addTx = async (kv, userId, amount, fromId, reason = "新進入會") => {
  const key = `tx:${userId}`;
  const txs = await kv.get(key, "json") || [];
  const now = new Date();
  const clearDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 天猶豫期
  
  txs.push({ 
    txId: Date.now().toString() + Math.random().toString(36).substring(2, 8),
    amount, 
    fromId, 
    reason, 
    date: now.toISOString(),
    clearDate: clearDate.toISOString(),
    status: 'pending' // 預設進入凍結
  });
  await kv.put(key, JSON.stringify(txs));
};

export const cancelTx = async (kv, userId, txId) => {
  const key = `tx:${userId}`;
  let txs = await kv.get(key, "json") || [];
  let updated = false;
  txs.forEach(t => {
    if (t.txId === txId && t.status === 'pending') {
      t.status = 'cancelled';
      updated = true;
    }
  });
  if (updated) await kv.put(key, JSON.stringify(txs));
};

export const processProductPurchase = async (kv, targetId, productName, price, bv) => {
  const member = await kv.get(`user:${targetId}`, "json");
  if (!member) throw new Error("找不到該會員資料");

  // 生成銷售訂單
  const orderId = "PRD-" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const order = { orderId, buyerId: targetId, productName, price, bv, date: new Date().toISOString(), status: "completed" };
  await kv.put(`order:${orderId}`, JSON.stringify(order));

  const sponsorId = member.sponsor_id;
  if (!sponsorId) return;

  if (sponsorId === 'ROOT') {
    await addTx(kv, 'ROOT', bv, targetId, `商品銷售: ` + productName + ` (系統直屬)`);
    return;
  }

  const sponsor = await kv.get(`user:${sponsorId}`, "json");
  if (!sponsor) return;
  const halfBonus = Math.floor(bv / 2);

  // 雙軌分潤邏輯
  if (sponsor.is_independent) {
    await addTx(kv, sponsorId, bv, targetId, `商品銷售: ` + productName + ` (獨立直推)`);
  } else {
    await addTx(kv, sponsorId, halfBonus, targetId, `商品銷售: ` + productName + ` (生母推薦)`);
    if (member.upline_id && member.upline_id !== 'ROOT') {
      await addTx(kv, member.upline_id, halfBonus, targetId, `商品銷售: ` + productName + ` (養母輔導)`);
    }
  }
};
