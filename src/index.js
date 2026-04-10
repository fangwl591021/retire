import { getShareHtml, getApplyHtml } from './views/liff.js';
import { getAdminHtml } from './views/admin.js';
import { getPortalHtml } from './views/portal.js';
import { handleLineEvents } from './bot/lineHandler.js';
import { getAdminData, updateMemberData, getMemberData, saveProduct, deleteProduct, rejectApplication } from './api/adminApi.js';
import { cancelTx, processProductPurchase } from './core/bonus.js';
import { approveApplication, renewMember, submitApplication } from './core/member.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 頁面路由
    if (url.pathname.includes("/share")) return new Response(getShareHtml(env.LIFF_ID), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    if (url.pathname.includes("/apply")) return new Response(getApplyHtml(env.LIFF_ID), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    if (url.pathname.includes("/admin")) return new Response(getAdminHtml(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    if (url.pathname.includes("/portal")) return new Response(getPortalHtml(env.LIFF_ID), { headers: { "Content-Type": "text/html;charset=UTF-8" } });

    if (request.method === "POST") {
      try {
        const body = await request.json();

        // 1. LINE 機器人 Webhook
        if (body.events) {
          await handleLineEvents(env, body.events);
          return new Response("OK", { status: 200 });
        }

        // 2. 後台管理 API
        if (body.action === "getAdminData") {
          const data = await getAdminData(env);
          return new Response(JSON.stringify(data));
        }
        if (body.action === "updateMemberData") {
          await updateMemberData(env.BONUS_KV, body.targetId, body);
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "saveProduct") {
          await saveProduct(env.BONUS_KV, body);
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "deleteProduct") {
          await deleteProduct(env.BONUS_KV, body.productId);
          return new Response(JSON.stringify({ success: true }));
        }

        // 3. 會員專區與申請 API
        if (body.action === "getMemberData") {
          const data = await getMemberData(env.BONUS_KV, body.userId);
          return new Response(JSON.stringify({ success: true, ...data }));
        }
        if (body.action === "submitApplication") {
          const res = await submitApplication(env.BONUS_KV, body.newUserId, body.sponsorId, body.name, body.phone, body.lineName, body.gender, body.birthday, body.address);
          return new Response(JSON.stringify({ success: true, data: res }));
        }

        // 4. 核心財務與訂單 API
        if (body.action === "approveFromAdmin") {
          await approveApplication(env.BONUS_KV, body.targetId);
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "rejectApplication") {
          await rejectApplication(env.BONUS_KV, body.targetId);
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "renewMember") {
          await renewMember(env.BONUS_KV, body.targetId);
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "purchaseProduct") {
          const p = await env.BONUS_KV.get(`prod:${body.productId}`, "json");
          if (!p) throw new Error("找不到該商品");
          await processProductPurchase(env.BONUS_KV, body.targetId, p.name, parseInt(p.price, 10), parseInt(p.bv, 10));
          return new Response(JSON.stringify({ success: true }));
        }
        if (body.action === "cancelTx") {
          await cancelTx(env.BONUS_KV, body.userId, body.txId);
          return new Response(JSON.stringify({ success: true }));
        }

      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
      }
    }
    return new Response("Bonus System Running (V2 Modular)", { status: 200 });
  }
};
