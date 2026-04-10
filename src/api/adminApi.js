export const getLineProfile = async (env, userId) => {
  if (!env.LINE_ACCESS_TOKEN || !userId) return null;
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, { headers: { "Authorization": `Bearer ${env.LINE_ACCESS_TOKEN}` } });
    if (res.ok) return (await res.json()).displayName;
  } catch (e) {} return null;
};

export const getAdminData = async (env) => {
  const users = await env.BONUS_KV.list({ prefix: "user:" });
  const apps = await env.BONUS_KV.list({ prefix: "app:" });
  const txs = await env.BONUS_KV.list({ prefix: "tx:" });
  const prods = await env.BONUS_KV.list({ prefix: "prod:" });
  const orders = await env.BONUS_KV.list({ prefix: "order:" });

  let memberList = [], pendingList = [], transactionList = [], productList = [], orderList = [];
  let idToName = { "ROOT": "系統源頭", "COMPANY": "公司" };
  let totalCleared = 0, totalPending = 0, totalSales = 0;
  const now = new Date();

  for (const key of prods.keys) {
    let p = await env.BONUS_KV.get(key.name, "json");
    if (p) productList.push({ id: key.name.replace("prod:", ""), ...p });
  }

  for (const key of orders.keys) {
    let o = await env.BONUS_KV.get(key.name, "json");
    if (o) { orderList.push(o); if (o.status === 'completed') totalSales += o.price; }
  }

  for (const key of users.keys) {
    let u = await env.BONUS_KV.get(key.name, "json");
    if (u) { 
      const uid = key.name.replace("user:", ""); 
      let displayName = u.name || u.lineName;
      if (!displayName && uid.startsWith('U')) {
        const fetchedName = await getLineProfile(env, uid);
        if (fetchedName) { displayName = fetchedName; u.lineName = fetchedName; await env.BONUS_KV.put(key.name, JSON.stringify(u)); }
      }
      memberList.push({ id: uid, ...u }); 
      idToName[uid] = displayName || uid; 
    }
  }
  
  for (const key of apps.keys) { 
    const a = await env.BONUS_KV.get(key.name, "json"); 
    if (a) pendingList.push(a); 
  }
  
  for (const key of txs.keys) {
    let tList = await env.BONUS_KV.get(key.name, "json") || [];
    let needsUpdate = false;
    tList.forEach(t => {
      if (!t.status) { t.status = 'cleared'; t.clearDate = t.date; t.txId = Date.now().toString() + Math.random().toString(36).substring(2, 8); needsUpdate = true; }
      if (t.status === 'pending' && now >= new Date(t.clearDate)) { t.status = 'cleared'; needsUpdate = true; }
      if (t.status === 'cleared') totalCleared += t.amount;
      if (t.status === 'pending') totalPending += t.amount;
      transactionList.push({ toId: key.name.replace("tx:", ""), ...t });
    });
    if (needsUpdate) await env.BONUS_KV.put(key.name, JSON.stringify(tList));
  }

  return { 
    stats: { totalMembers: memberList.length, pendingCount: pendingList.filter(p => p.status === 'pending').length, totalCleared, totalPending, totalSales }, 
    members: memberList, pending: pendingList, 
    transactions: transactionList.sort((a, b) => new Date(b.date) - new Date(a.date)), 
    orders: orderList.sort((a, b) => new Date(b.date) - new Date(a.date)),
    products: productList, idToName 
  };
};

export const updateMemberData = async (kv, targetId, data) => {
  let u = await kv.get(`user:${targetId}`, "json");
  if (u) {
    u.name = data.name; u.gender = data.gender; u.birthday = data.birthday; u.phone = data.phone; u.address = data.address; u.is_independent = data.is_independent;
    await kv.put(`user:${targetId}`, JSON.stringify(u));
  }
};

export const getMemberData = async (kv, userId) => {
  const user = await kv.get(`user:${userId}`, "json");
  let txs = await kv.get(`tx:${userId}`, "json") || [];
  const now = new Date();
  let needsUpdate = false;
  txs.forEach(t => {
    if (!t.status) { t.status = 'cleared'; t.clearDate = t.date; t.txId = Date.now().toString() + Math.random().toString(36).substring(2, 8); needsUpdate = true; }
    if (t.status === 'pending' && now >= new Date(t.clearDate)) { t.status = 'cleared'; needsUpdate = true; }
  });
  if (needsUpdate) await kv.put(`tx:${userId}`, JSON.stringify(txs));
  return { user, txs: txs.sort((a, b) => new Date(b.date) - new Date(a.date)) };
};

export const saveProduct = async (kv, data) => {
  const pId = data.productId || Date.now().toString();
  await kv.put(`prod:${pId}`, JSON.stringify({ name: data.name, price: data.price, bv: data.bv }));
};

export const deleteProduct = async (kv, productId) => {
  await kv.delete(`prod:${productId}`);
};

export const rejectApplication = async (kv, targetId) => {
  await kv.delete(`app:${targetId}`);
};
