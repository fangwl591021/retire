import { getLineProfile } from '../api/adminApi.js';
import { processAddMember, approveApplication } from '../core/member.js';

export const postToLine = async (env, payload) => {
  return await fetch(`https://api.line.me/v2/bot/message/reply`, { 
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_ACCESS_TOKEN}` }, body: JSON.stringify(payload) 
  });
};

export const replyLine = async (env, replyToken, text) => { 
  return await postToLine(env, { replyToken, messages: [{ type: "text", text }] }); 
};

export const showMyBonuses = async (env, replyToken, userId) => {
  const txs = await env.BONUS_KV.get(`tx:${userId}`, "json") || [];
  const now = new Date();
  let clearedTotal = 0, pendingTotal = 0;
  
  txs.forEach(t => {
    if (!t.status) t.status = 'cleared';
    if (t.status === 'pending' && now >= new Date(t.clearDate)) t.status = 'cleared';
    if (t.status === 'cleared') clearedTotal += t.amount;
    if (t.status === 'pending') pendingTotal += t.amount;
  });

  const contents = txs.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0, 5).map(t => {
    let statusText = t.status === 'cleared' ? '已結算' : (t.status === 'pending' ? '凍結中' : '已註銷');
    let statusColor = t.status === 'cleared' ? '#00b900' : (t.status === 'pending' ? '#f59e0b' : '#ef4444');
    return { "type": "box", "layout": "horizontal", "contents": [
      { "type": "text", "text": t.date.split('T')[0], "size": "xs", "color": "#000000" }, 
      { "type": "text", "text": `[${statusText}]`, "size": "xs", "color": statusColor, "flex": 0, "margin": "sm" },
      { "type": "text", "text": `$${t.amount}`, "size": "xs", "align": "end", "color": "#000000" }
    ], "margin": "sm" };
  });

  const flex = { "type": "bubble", "body": { "type": "box", "layout": "vertical", "contents": [
    { "type": "text", "text": "總結算金額 (可提領)", "size": "xs", "color": "#000000" }, 
    { "type": "text", "text": `$${clearedTotal}`, "size": "xxl", "margin": "sm", "color": "#00b900" },
    { "type": "box", "layout": "horizontal", "margin": "md", "contents": [
      { "type": "text", "text": "處理中金額 (14天內)", "size": "xs", "color": "#000000" },
      { "type": "text", "text": `$${pendingTotal}`, "size": "xs", "align": "end", "color": "#f59e0b" }
    ]},
    { "type": "separator", "margin": "lg" }, 
    { "type": "text", "text": "近期明細 (5筆)", "size": "xs", "color": "#000000", "margin": "lg" }, 
    ...contents
  ] } };
  return await postToLine(env, { replyToken, messages: [{ type: "flex", altText: "績效統計", contents: flex }] });
};

export const showMyStatus = async (env, replyToken, userId) => {
  const user = await env.BONUS_KV.get(`user:${userId}`, "json");
  if (!user) return replyLine(env, replyToken, "尚未查獲會員資料。");
  const flex = { "type": "bubble", "body": { "type": "box", "layout": "vertical", "contents": [{ "type": "text", "text": "邀約統計狀態", "size": "xs", "color": "#000000" }, { "type": "box", "layout": "horizontal", "margin": "md", "contents": [{ "type": "text", "text": "獨立狀態", "size": "sm", "color": "#000000" }, { "type": "text", "text": user.is_independent ? "已獨立" : "未獨立", "size": "sm", "align": "end", "color": "#000000" }] }, { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "下線安置", "size": "sm", "color": "#000000" }, { "type": "text", "text": (user.left_leg ? '●' : '○') + ' / ' + (user.right_leg ? '●' : '○'), "size": "sm", "align": "end", "color": "#000000" }] }] } };
  return await postToLine(env, { replyToken, messages: [{ type: "flex", altText: "邀約統計", contents: flex }] });
};

export const listPendingApplications = async (env, replyToken) => {
  const list = await env.BONUS_KV.list({ prefix: "app:" });
  let bubbles = [];
  for (const key of list.keys) {
    const app = await env.BONUS_KV.get(key.name, "json");
    if (app && app.status === "pending") {
      const displayName = app.name || app.lineName || app.newUserId;
      bubbles.push({ "type": "bubble", "size": "micro", "body": { "type": "box", "layout": "vertical", "contents": [{ "type": "text", "text": "待核准入會申請", "size": "xs", "color": "#000000" }, { "type": "text", "text": displayName, "size": "sm", "margin": "md", "color": "#000000" }, { "type": "text", "text": `電話: ${app.phone}`, "size": "xs", "color": "#888888", "wrap": true }] }, "footer": { "type": "box", "layout": "vertical", "contents": [{ "type": "button", "action": { "type": "message", "label": "確認收款並開通", "text": `核准 ${app.newUserId}` }, "style": "link", "height": "sm", "color": "#000000" }] } });
    }
  }
  if (bubbles.length === 0) return replyLine(env, replyToken, "目前無待處理申請。");
  return await postToLine(env, { replyToken, messages: [{ type: "flex", altText: "待核准名單", contents: { "type": "carousel", "contents": bubbles.slice(0, 10) } }] });
};

export const sendFlexInvitation = async (env, replyToken, sponsorId) => {
  const shareUrl = `https://liff.line.me/${env.LIFF_ID}/share?sponsorId=${sponsorId}`;
  const flexContent = { "type": "bubble", "size": "kilo", "body": { "type": "box", "layout": "vertical", "contents": [{ "type": "text", "text": "專屬邀約名片", "size": "sm", "color": "#000000" }, { "type": "text", "text": "誠摯邀請您加入團隊", "size": "md", "margin": "sm", "color": "#000000" }, { "type": "text", "text": "點擊下方按鈕將此邀約發送給好友。", "size": "xs", "color": "#000000", "margin": "xs", "wrap": true }] }, "footer": { "type": "box", "layout": "vertical", "spacing": "sm", "contents": [{ "type": "button", "action": { "type": "uri", "label": "立即查看並申請", "uri": shareUrl }, "style": "primary", "color": "#000000", "height": "sm" }, { "type": "button", "action": { "type": "uri", "label": "前往官方帳號", "uri": "https://lin.ee/r2X7V2F" }, "style": "secondary", "height": "sm" }] } };
  return await postToLine(env, { replyToken, messages: [{ "type": "flex", "altText": "會員資格邀約", "contents": flexContent }] });
};

export const handleLineEvents = async (env, events) => {
  const SUPER_ADMIN = "Uf729764dbb5b652a5a90a467320bea29";
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMsg = event.message.text.trim();
      const userId = event.source.userId;
      try {
        if (userMsg.toUpperCase().includes("ID")) { await replyLine(env, event.replyToken, `您的 ID：\n${userId}`); continue; }
        
        // 關鍵字更新：邀約 -> 邀約好友
        if (userMsg.includes("邀約好友")) { await sendFlexInvitation(env, event.replyToken, userId); continue; }
        if (userMsg.includes("專區") || userMsg.includes("會員")) { await replyLine(env, event.replyToken, `🔗 您的專屬會員中心：\nhttps://bonus-system.fangwl591021.workers.dev/portal`); continue; }
        
        // 關鍵字更新：獎金 -> 績效統計
        if (userMsg.includes("績效統計")) { await showMyBonuses(env, event.replyToken, userId); continue; }
        
        // 關鍵字更新：組織 -> 邀約統計
        if (userMsg.includes("邀約統計")) { await showMyStatus(env, event.replyToken, userId); continue; }

        if (userId === SUPER_ADMIN) {
          if (userMsg.includes("系統初始化")) {
            await env.BONUS_KV.put("config:admin_uid", userId);
            let adminName = await getLineProfile(env, userId) || "系統管理員";
            await processAddMember(env.BONUS_KV, userId, "ROOT", adminName, "0900000000", adminName, "M", "", "");
            await replyLine(env, event.replyToken, "✅ 系統管理員權限已重置。");
          } else if (userMsg.includes("後台")) {
            await replyLine(env, event.replyToken, `🔗 管理中心網址：\nhttps://bonus-system.fangwl591021.workers.dev/admin`);
          } else if (userMsg.includes("待核准")) {
            await listPendingApplications(env, event.replyToken);
          } else if (userMsg.startsWith("核准 ")) {
            const tid = userMsg.replace("核准 ", "").trim();
            await approveApplication(env.BONUS_KV, tid);
            await replyLine(env, event.replyToken, `✅ 已確認收款並開通會員。`);
          } else {
            await replyLine(env, event.replyToken, "您可以輸入以下指令：\n- 邀約好友：發送名片\n- 專區：進入會員專區\n- 績效統計：查詢明細\n- 邀約統計：查看狀態\n- 後台：開啟管理網頁\n- 待核准：列出新報單");
          }
          continue;
        }
        await replyLine(env, event.replyToken, "您好，您可以輸入「專區」進入您的會員中心，或點擊好友的邀約連結加入我們。");
      } catch (err) { console.error(err); }
    }
  }
};
