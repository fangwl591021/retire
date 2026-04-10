export const getPortalHtml = (liffId) => {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>會員專區</title><script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script><style>
  body { font-family: "Microsoft JhengHei", sans-serif; background: #ffffff; color: #000000; margin: 0; padding: 40px 30px; font-weight: normal; }
  .container { max-width: 500px; margin: 0 auto; }
  .header { font-size: 24px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000000; padding-bottom: 10px; }
  .section { border-bottom: 1px solid #eeeeee; padding: 30px 0; }
  .section:last-child { border-bottom: none; }
  .section-title { font-size: 13px; margin-bottom: 20px; color: #666666; letter-spacing: 1px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; }
  .val { text-align: right; }
  .bonus-total { font-size: 40px; margin: 20px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
  td { padding: 12px 0; border-bottom: 1px solid #f2f2f2; }
  #msg { font-size: 14px; text-align: center; margin-top: 50px; }
  </style></head><body><div class="container">
    <div class="header"><div>會員專區</div><div id="u-name" style="font-size:16px;">讀取中...</div></div>
    <div id="content" style="display:none;">
      <div class="section">
        <div class="section-title">獎金與財務概況</div>
        <div class="row"><span>可提領餘額</span><span class="val" id="u-cleared" style="color:#00b900; font-size:24px;">$0</span></div>
        <div class="row"><span>處理中獎金 (14天猶豫期)</span><span class="val" id="u-pending" style="color:#f59e0b;">$0</span></div>
      </div>
      <div class="section">
        <div class="section-title">基本資料</div>
        <div class="row"><span>性別</span><span class="val" id="u-gender">--</span></div>
        <div class="row"><span>生日</span><span class="val" id="u-birthday">--</span></div>
        <div class="row"><span>聯絡電話</span><span class="val" id="u-phone">--</span></div>
        <div class="row"><span>住址</span><span class="val" id="u-address" style="text-align:right; max-width:60%;">--</span></div>
      </div>
      <div class="section">
        <div class="section-title">組織網絡</div>
        <div class="row"><span>獨立狀態</span><span class="val" id="u-indep">--</span></div>
        <div class="row"><span>推薦人 (生母)</span><span class="val" id="u-sponsor">--</span></div>
        <div class="row"><span>輔導上線 (養母)</span><span class="val" id="u-upline">--</span></div>
        <div class="row" style="margin-top:20px;"><span>左區安置</span><span class="val" id="u-left">--</span></div>
        <div class="row"><span>右區安置</span><span class="val" id="u-right">--</span></div>
      </div>
      <div class="section">
        <div class="section-title">近期獎金明細</div>
        <table><tbody id="tx-list"></tbody></table>
      </div>
    </div>
    <div id="msg">正在驗證會員身分...</div>
  </div><script>
  async function i(){
    try {
      await liff.init({liffId:"${liffId}"});
      if(!liff.isLoggedIn()){liff.login({redirectUri:window.location.href});return;}
      const profile = await liff.getProfile();
      const res = await fetch(window.location.origin + "/", { method: 'POST', body: JSON.stringify({ action: "getMemberData", userId: profile.userId }) });
      const d = await res.json();
      
      if(!d.user) { document.getElementById('msg').innerText = "您尚未成為正式會員或申請仍在審核中。"; return; }
      
      document.getElementById('msg').style.display = 'none';
      document.getElementById('content').style.display = 'block';
      document.getElementById('u-name').innerText = d.user.name || profile.displayName;
      
      const genderMap = {'M':'男', 'F':'女', 'O':'其他'};
      document.getElementById('u-gender').innerText = genderMap[d.user.gender] || '--';
      document.getElementById('u-birthday').innerText = d.user.birthday || '--';
      document.getElementById('u-phone').innerText = d.user.phone || '--';
      document.getElementById('u-address').innerText = d.user.address || '--';

      document.getElementById('u-indep').innerText = d.user.is_independent ? "已獨立" : "未獨立";
      document.getElementById('u-sponsor').innerText = d.user.sponsor_id === 'ROOT' ? '系統直屬' : '已綁定';
      document.getElementById('u-upline').innerText = d.user.upline_id ? '已綁定' : '--';
      document.getElementById('u-left').innerText = d.user.left_leg ? '已安置' : '待開發';
      document.getElementById('u-right').innerText = d.user.right_leg ? '已安置' : '待開發';
      
      let cTotal = 0, pTotal = 0;
      d.txs.forEach(t => { if(t.status === 'cleared') cTotal += t.amount; else if(t.status === 'pending') pTotal += t.amount; });
      
      document.getElementById('u-cleared').innerText = '$' + cTotal.toLocaleString();
      document.getElementById('u-pending').innerText = '$' + pTotal.toLocaleString();
      
      const txList = document.getElementById('tx-list');
      if(d.txs.length === 0) txList.innerHTML = '<tr><td style="color:#888888;">尚無交易紀錄</td></tr>';
      d.txs.forEach(t => {
        let st = t.status === 'cleared' ? '<span style="color:#00b900;">已結算</span>' : (t.status === 'pending' ? '<span style="color:#f59e0b;">凍結中</span>' : '<span style="color:#ef4444;text-decoration:line-through;">已作廢</span>');
        txList.innerHTML += '<tr><td>'+t.date.split('T')[0]+'</td><td>'+(t.reason||'新進入會')+'<br><span style="font-size:12px;">'+st+'</span></td><td style="text-align:right;">$'+t.amount.toLocaleString()+'</td></tr>';
      });
    } catch(e) { document.getElementById('msg').innerText = "讀取失敗，請重新開啟。"; }
  } i();
  </script></body></html>`;
};
