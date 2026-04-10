export const getAdminHtml = () => {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>管理控制台</title><style>
  body { font-family: "Microsoft JhengHei", sans-serif; background: #ffffff; color: #000000; margin: 0; display: flex; height: 100vh; overflow: hidden; font-weight: normal; font-size: 14px; }
  .sidebar { background: #f8f9fa; border-right: 1px solid #e5e5e5; width: 240px; display: flex; flex-direction: column; }
  .nav-item { color: #000000; padding: 18px 30px; cursor: pointer; border-left: 4px solid transparent; transition: background 0.2s; }
  .nav-item:hover { background: #f1f2f4; }
  .nav-item.active { background: #ffffff; color: #000000; border-left-color: #000000; }
  .main { flex-grow: 1; overflow-y: auto; padding: 50px 60px; position: relative; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { text-align: left; color: #000000; padding: 15px 10px; border-bottom: 1px solid #000000; font-weight: normal; }
  td { padding: 18px 10px; border-bottom: 1px solid #eeeeee; color: #000000; }
  tr:hover td { background-color: #fafafa; }
  .stat-box { border-bottom: 1px solid #eeeeee; padding-bottom: 30px; margin-bottom: 40px; display: flex; gap: 60px; }
  .btn { color: #000000; border: 1px solid #000000; padding: 6px 14px; font-size: 12px; cursor: pointer; background: #ffffff; font-family: inherit; }
  .btn:hover { background: #000000; color: #ffffff; }
  .hidden { display: none !important; }
  .text-2xl { font-size: 24px; margin-bottom: 30px; }
  .text-lg { font-size: 18px; margin-bottom: 15px; }
  .text-3xl { font-size: 32px; }
  .text-xs { font-size: 12px; margin-bottom: 8px; }
  .text-right { text-align: right; }
  .flex { display: flex; justify-content: space-between; align-items: center; }
  
  .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ffffff; z-index: 100; padding: 50px 60px; overflow-y: auto; display: none; }
  .overlay.active { display: block; }
  .crm-grid { display: flex; gap: 60px; }
  .crm-col { flex: 1; }
  .form-group { margin-bottom: 25px; }
  .form-group label { display: block; font-size: 12px; margin-bottom: 8px; color: #666666; }
  .form-control { width: 100%; border: none; border-bottom: 1px solid #000000; padding: 8px 0; outline: none; font-family: inherit; font-size: 15px; background: transparent; }
  select.form-control { appearance: none; border-radius: 0; }
  .readonly-val { padding: 8px 0; border-bottom: 1px solid #eeeeee; font-size: 15px; color: #000000; }
  </style></head><body>
  <aside class="sidebar">
    <div style="padding: 40px 30px; font-size: 18px;">系統管理中心</div>
    <nav>
      <div onclick="switchPage('stat')" id="menu-stat" class="nav-item active">營運總覽</div>
      <div onclick="switchPage('member')" id="menu-member" class="nav-item">客戶關係 (CRM)</div>
      <div onclick="switchPage('order')" id="menu-order" class="nav-item">銷售訂單</div>
      <div onclick="switchPage('bonus')" id="menu-bonus" class="nav-item">獎金結算</div>
      <div onclick="switchPage('product')" id="menu-product" class="nav-item">商品目錄</div>
    </nav>
  </aside>
  <main class="main">
    <div id="page-title" class="text-2xl">營運總覽</div>
    
    <div id="view-stat">
      <div class="stat-box">
        <div><div class="text-xs">總會員數</div><div id="stat-members" class="text-3xl">--</div></div>
        <div><div class="text-xs">總營業額</div><div id="stat-sales" class="text-3xl">--</div></div>
        <div><div class="text-xs">已結算獎金</div><div id="stat-cleared" class="text-3xl" style="color:#00b900;">--</div></div>
        <div><div class="text-xs">凍結中獎金 (14天)</div><div id="stat-pending-bonus" class="text-3xl" style="color:#f59e0b;">--</div></div>
      </div>
      <div class="text-lg">待核准入會申請</div>
      <table><thead><tr><th>申請時間</th><th>報單姓名</th><th>LINE 暱稱</th><th>聯絡電話</th><th>推薦人</th><th class="text-right">操作管理</th></tr></thead><tbody id="table-pending"></tbody></table>
    </div>
    
    <div id="view-member" class="hidden">
      <div class="text-lg">正式會員名錄</div>
      <table><thead><tr><th>加入時間</th><th>會員姓名</th><th>LINE 暱稱</th><th>推薦源頭 (生母)</th><th>獨立狀態</th><th class="text-right">操作管理</th></tr></thead><tbody id="table-member"></tbody></table>
    </div>

    <div id="view-order" class="hidden">
      <div class="text-lg">客戶購買紀錄</div>
      <table><thead><tr><th>訂單時間</th><th>訂單編號</th><th>購買會員</th><th>購買項目</th><th>訂單金額</th><th>訂單狀態</th></tr></thead><tbody id="table-order"></tbody></table>
    </div>

    <div id="view-bonus" class="hidden">
      <div class="text-lg">獎金撥發流水與凍結管理</div>
      <table><thead><tr><th>產生時間</th><th>領取人</th><th>獎金項目</th><th>撥發金額</th><th>觸發來源</th><th>狀態</th><th class="text-right">操作管理</th></tr></thead><tbody id="table-bonus"></tbody></table>
    </div>

    <div id="view-product" class="hidden">
      <div class="flex" style="margin-bottom: 20px;">
        <div class="text-lg" style="margin:0;">上架商品管理</div>
        <button class="btn" style="background:#000000; color:#ffffff;" onclick="openProductEdit()">新增商品</button>
      </div>
      <table><thead><tr><th>商品名稱</th><th>商品定價</th><th>提撥獎金 (BV)</th><th class="text-right">操作管理</th></tr></thead><tbody id="table-product"></tbody></table>
    </div>

    <div id="edit-overlay" class="overlay">
      <div class="flex" style="margin-bottom: 40px;">
        <div class="text-2xl" style="margin:0;">會員詳細資料卡 (CRM)</div>
        <button class="btn" onclick="closeOverlay('edit-overlay')">關閉面板</button>
      </div>
      <input type="hidden" id="edit-id">
      <div class="crm-grid">
        <div class="crm-col">
          <div class="text-lg" style="margin-bottom: 25px; border-bottom: 2px solid #000000; padding-bottom: 10px;">基本資料設定</div>
          <div class="form-group"><label>真實姓名</label><input type="text" id="edit-name" class="form-control"></div>
          <div class="form-group"><label>性別</label><select id="edit-gender" class="form-control"><option value="">未提供</option><option value="M">男</option><option value="F">女</option><option value="O">其他</option></select></div>
          <div class="form-group"><label>生日</label><input type="date" id="edit-birthday" class="form-control"></div>
          <div class="form-group"><label>聯絡電話</label><input type="tel" id="edit-phone" class="form-control"></div>
          <div class="form-group"><label>聯絡地址</label><input type="text" id="edit-address" class="form-control"></div>
          <div style="margin-top: 40px;"><button class="btn" onclick="saveEdit()" style="background:#000000; color:#ffffff; width:100%; padding:15px 0; font-size:15px;">儲存基本資料</button></div>
        </div>
        <div class="crm-col">
          <div class="text-lg" style="margin-bottom: 25px; border-bottom: 2px solid #000000; padding-bottom: 10px;">組織網路與狀態</div>
          <div class="form-group"><label>推薦源頭 (生母)</label><div class="readonly-val" id="edit-sponsor-name">--</div></div>
          <div class="form-group"><label>輔導上線 (養母)</label><div class="readonly-val" id="edit-upline-name">--</div></div>
          <div style="display:flex; gap:20px;">
            <div class="form-group" style="flex:1;"><label>左區安置</label><div class="readonly-val" id="edit-left-leg">--</div></div>
            <div class="form-group" style="flex:1;"><label>右區安置</label><div class="readonly-val" id="edit-right-leg">--</div></div>
          </div>
          <div class="form-group"><label>獨立狀態 (特權強制調整)</label>
            <select id="edit-indep" class="form-control"><option value="false">未獨立</option><option value="true">已獨立</option></select>
          </div>
        </div>
      </div>
    </div>

    <div id="product-overlay" class="overlay">
      <div class="flex" style="margin-bottom: 40px;">
        <div class="text-2xl" style="margin:0;">商品上架與編輯</div>
        <button class="btn" onclick="closeOverlay('product-overlay')">關閉面板</button>
      </div>
      <div style="max-width: 500px;">
        <input type="hidden" id="prod-id">
        <div class="form-group"><label>商品名稱</label><input type="text" id="prod-name" class="form-control" placeholder="例如：高階保養套組"></div>
        <div class="form-group"><label>終端定價 (元)</label><input type="number" id="prod-price" class="form-control" placeholder="輸入售價"></div>
        <div class="form-group"><label>提撥總獎金 BV (元)</label><input type="number" id="prod-bv" class="form-control" placeholder="輸入撥出供分配的獎金總額"></div>
        <div style="margin-top: 40px;"><button class="btn" onclick="saveProduct()" style="background:#000000; color:#ffffff; width:100%; padding:15px 0; font-size:15px;">儲存商品設定</button></div>
      </div>
    </div>

    <div id="order-overlay" class="overlay">
      <div class="flex" style="margin-bottom: 40px;">
        <div class="text-2xl" style="margin:0;">為客戶建立新訂單</div>
        <button class="btn" onclick="closeOverlay('order-overlay')">取消</button>
      </div>
      <div style="max-width: 500px;">
        <input type="hidden" id="order-target-id">
        <div class="form-group"><label>購買會員</label><div class="readonly-val" id="order-target-name">--</div></div>
        <div class="form-group"><label>選擇購買商品</label>
          <select id="order-product" class="form-control"></select>
        </div>
        <div style="margin-top: 40px;"><button class="btn" onclick="submitOrder()" style="background:#000000; color:#ffffff; width:100%; padding:15px 0; font-size:15px;">確認收款並建立訂單</button></div>
      </div>
    </div>
  </main>
  
  <script>
    let rawData = {};
    
    async function loadData() {
      try {
        const res = await fetch(window.location.origin, { 
          method: 'POST', 
          headers: { 'Cache-Control': 'no-cache' },
          body: JSON.stringify({ action: "getAdminData" }) 
        });
        rawData = await res.json();
        render();
      } catch(e) { console.error(e); }
    }
    
    function safelyGetName(uid) { return (!uid || uid === 'null') ? '待開發' : (rawData.idToName[uid] || uid); }
    
    function formatDateTime(isoStr) {
      if (!isoStr) return '--';
      const d = new Date(isoStr);
      return d.getFullYear() + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }

    function render() {
      document.getElementById('stat-members').innerText = rawData.stats.totalMembers;
      document.getElementById('stat-sales').innerText = '$' + (rawData.stats.totalSales || 0).toLocaleString();
      document.getElementById('stat-cleared').innerText = '$' + rawData.stats.totalCleared.toLocaleString();
      document.getElementById('stat-pending-bonus').innerText = '$' + rawData.stats.totalPending.toLocaleString();
      
      const pBody = document.getElementById('table-pending');
      const pList = rawData.pending.filter(x => x.status === 'pending');
      pBody.innerHTML = pList.length ? "" : '<tr><td colspan="6" style="text-align:center;padding:30px;color:#888888;">目前無待處理項目</td></tr>';
      pList.forEach(p => { 
        pBody.innerHTML += '<tr><td>'+formatDateTime(p.date)+'</td><td>'+p.name+'</td><td>'+(p.lineName||'--')+'</td><td>'+p.phone+'</td><td>'+safelyGetName(p.sponsorId)+'</td><td class="text-right"><button onclick="approve(\\''+p.newUserId+'\\')" class="btn" style="color:#00b900;border-color:#00b900;margin-right:8px;">確認收款並開通</button><button onclick="rejectApp(\\''+p.newUserId+'\\')" class="btn" style="color:#ef4444;border-color:#ef4444;">拒絕</button></td></tr>'; 
      });
      
      const mBody = document.getElementById('table-member');
      mBody.innerHTML = "";
      rawData.members.forEach(m => {
        const displayName = m.name || m.lineName || m.id;
        mBody.innerHTML += '<tr><td>'+formatDateTime(m.created_at)+'</td><td>'+displayName+'</td><td>'+(m.lineName||'--')+'</td><td>'+safelyGetName(m.sponsor_id)+'</td><td>'+(m.is_independent?'已獨立':'未獨立')+'</td><td class="text-right"><button onclick="openEdit(\\''+m.id+'\\')" class="btn" style="margin-right:8px;">CRM編輯</button><button onclick="openOrderModal(\\''+m.id+'\\')" class="btn" style="margin-right:8px;">建立訂單</button><button onclick="renew(\\''+m.id+'\\')" class="btn">年度續約</button></td></tr>';
      });

      const oBody = document.getElementById('table-order');
      oBody.innerHTML = "";
      if(!rawData.orders || rawData.orders.length === 0) oBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#888888;">尚無訂單紀錄</td></tr>';
      else {
        rawData.orders.forEach(o => {
          oBody.innerHTML += '<tr><td>'+formatDateTime(o.date)+'</td><td>'+o.orderId+'</td><td>'+safelyGetName(o.buyerId)+'</td><td>'+o.productName+'</td><td>$'+o.price.toLocaleString()+'</td><td><span style="color:#00b900;">交易完成</span></td></tr>';
        });
      }
      
      const bBody = document.getElementById('table-bonus'); 
      bBody.innerHTML = "";
      rawData.transactions.forEach(o => { 
        let statusHtml = '', actionHtml = '--';
        if (o.status === 'cleared') { statusHtml = '<span style="color:#00b900;">已結算</span>'; } 
        else if (o.status === 'pending') { statusHtml = '<span style="color:#f59e0b;">凍結中 (' + formatDateTime(o.clearDate).split(' ')[0] + ' 解除)</span>'; actionHtml = '<button onclick="cancelTx(\\''+o.toId+'\\', \\''+o.txId+'\\')" class="btn" style="border-color:#ef4444; color:#ef4444;">退費作廢</button>'; } 
        else if (o.status === 'cancelled') { statusHtml = '<span style="color:#ef4444; text-decoration: line-through;">已作廢</span>'; }
        bBody.innerHTML += '<tr><td>'+formatDateTime(o.date)+'</td><td>'+safelyGetName(o.toId)+'</td><td>'+(o.reason||'新進入會')+'</td><td>$'+o.amount.toLocaleString()+'</td><td>'+safelyGetName(o.fromId)+'</td><td>'+statusHtml+'</td><td class="text-right">'+actionHtml+'</td></tr>'; 
      });

      const prBody = document.getElementById('table-product');
      prBody.innerHTML = "";
      if(!rawData.products || rawData.products.length === 0) {
        prBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:#888888;">尚無商品，請點擊上方新增</td></tr>';
      } else {
        rawData.products.forEach(pr => {
          prBody.innerHTML += '<tr><td>'+pr.name+'</td><td>$'+parseInt(pr.price).toLocaleString()+'</td><td>$'+parseInt(pr.bv).toLocaleString()+'</td><td class="text-right"><button onclick="openProductEdit(\\''+pr.id+'\\')" class="btn" style="margin-right:8px;">編輯</button><button onclick="deleteProduct(\\''+pr.id+'\\')" class="btn" style="border-color:#ef4444; color:#ef4444;">下架</button></td></tr>';
        });
      }
    }
    
    function switchPage(page) {
      ['stat', 'member', 'order', 'bonus', 'product'].forEach(p => { document.getElementById('view-' + p).classList.add('hidden'); document.getElementById('menu-' + p).classList.remove('active'); });
      document.getElementById('view-' + page).classList.remove('hidden'); document.getElementById('menu-' + page).classList.add('active');
      const titles = {stat:'營運總覽', member:'客戶關係 (CRM)', order:'銷售訂單', bonus:'獎金結算與流水', product:'上架商品管理'};
      document.getElementById('page-title').innerText = titles[page];
    }
    
    function closeOverlay(id) { document.getElementById(id).classList.remove('active'); }

    async function approve(id) { 
      if(!confirm("確定已收到入會費，並開通此會員資格？(系統將同步發放獎金給上線)")) return; 
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "approveFromAdmin", targetId: id }) }); 
      await loadData(); 
    }
    
    async function rejectApp(id) {
      if(!confirm("確定要拒絕並刪除這筆申請嗎？")) return;
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "rejectApplication", targetId: id }) }); 
      await loadData();
    }

    async function renew(id) { 
      if(!confirm("確定已收到款項，並為此會員辦理年度續約？")) return; 
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "renewMember", targetId: id }) }); 
      await loadData(); 
    }
    
    async function cancelTx(userId, txId) { 
      if(!confirm("確定要註銷作廢此筆獎金嗎？(常用於退貨或退會)")) return; 
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "cancelTx", userId, txId }) }); 
      await loadData(); 
    }

    function openProductEdit(id = '') {
      document.getElementById('prod-id').value = id;
      if(id) {
        const p = rawData.products.find(x => x.id === id);
        document.getElementById('prod-name').value = p.name; document.getElementById('prod-price').value = p.price; document.getElementById('prod-bv').value = p.bv;
      } else {
        document.getElementById('prod-name').value = ''; document.getElementById('prod-price').value = ''; document.getElementById('prod-bv').value = '';
      }
      document.getElementById('product-overlay').classList.add('active');
    }
    async function saveProduct() {
      const payload = { action: "saveProduct", productId: document.getElementById('prod-id').value, name: document.getElementById('prod-name').value, price: document.getElementById('prod-price').value, bv: document.getElementById('prod-bv').value };
      if(!payload.name || !payload.price || !payload.bv) return alert("請填寫完整資訊");
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify(payload) }); 
      closeOverlay('product-overlay'); 
      await loadData();
    }
    async function deleteProduct(id) {
      if(!confirm("確定要下架刪除此商品嗎？")) return;
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "deleteProduct", productId: id }) }); 
      await loadData();
    }

    function openOrderModal(id) {
      const user = rawData.members.find(m => m.id === id);
      if(!user || !rawData.products || rawData.products.length === 0) return alert("尚無上架商品，請先至商品管理中心新增。");
      document.getElementById('order-target-id').value = id;
      document.getElementById('order-target-name').innerText = safelyGetName(id);
      const pSelect = document.getElementById('order-product');
      pSelect.innerHTML = '<option value="">請選擇商品...</option>';
      rawData.products.forEach(p => { pSelect.innerHTML += '<option value="' + p.id + '">' + p.name + ' (定價 $' + p.price + ' / BV $' + p.bv + ')</option>'; });
      document.getElementById('order-overlay').classList.add('active');
    }
    async function submitOrder() {
      const uid = document.getElementById('order-target-id').value;
      const pid = document.getElementById('order-product').value;
      if(!pid) return alert("請選擇商品");
      if(!confirm("確認收款並建立此訂單？系統將自動依制度發放獎金給上線。")) return;
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "purchaseProduct", targetId: uid, productId: pid }) });
      closeOverlay('order-overlay'); 
      await loadData();
    }

    function openEdit(id) {
      const user = rawData.members.find(m => m.id === id);
      if(!user) return;
      document.getElementById('edit-id').value = id; document.getElementById('edit-name').value = user.name || ''; document.getElementById('edit-gender').value = user.gender || ''; document.getElementById('edit-birthday').value = user.birthday || ''; document.getElementById('edit-phone').value = user.phone || ''; document.getElementById('edit-address').value = user.address || ''; document.getElementById('edit-indep').value = user.is_independent ? 'true' : 'false';
      document.getElementById('edit-sponsor-name').innerText = safelyGetName(user.sponsor_id); document.getElementById('edit-upline-name').innerText = safelyGetName(user.upline_id); document.getElementById('edit-left-leg').innerText = user.left_leg ? safelyGetName(user.left_leg) : '待開發'; document.getElementById('edit-right-leg').innerText = user.right_leg ? safelyGetName(user.right_leg) : '待開發';
      document.getElementById('edit-overlay').classList.add('active');
    }
    async function saveEdit() {
      const id = document.getElementById('edit-id').value;
      await fetch(window.location.origin, { method: 'POST', body: JSON.stringify({ action: "updateMemberData", targetId: id, name: document.getElementById('edit-name').value, gender: document.getElementById('edit-gender').value, birthday: document.getElementById('edit-birthday').value, phone: document.getElementById('edit-phone').value, address: document.getElementById('edit-address').value, is_independent: document.getElementById('edit-indep').value === 'true' }) }); 
      closeOverlay('edit-overlay'); 
      await loadData();
    }
    loadData();
  </script></body></html>`;
};
