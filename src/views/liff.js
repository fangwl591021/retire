export const getApplyHtml = (liffId) => {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>會員資格申請</title><script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script><style>
  body { font-family: "Microsoft JhengHei", sans-serif; background: #ffffff; color: #000000; margin: 0; padding: 40px 30px; font-weight: normal; }
  .container { max-width: 400px; margin: 0 auto; }
  .title { font-size: 24px; margin-bottom: 40px; border-bottom: 2px solid #000000; padding-bottom: 10px; }
  .form-group { margin-bottom: 30px; }
  .label { font-size: 13px; margin-bottom: 10px; display: block; color: #666666; }
  .input { width: 100%; border: none; border-bottom: 1px solid #000000; padding: 10px 0; outline: none; font-size: 16px; font-family: inherit; background: transparent; }
  select.input { appearance: none; border-radius: 0; }
  .btn { width: 100%; background: #000000; color: #ffffff; padding: 18px 0; border: none; font-size: 16px; cursor: pointer; margin-top: 20px; font-family: inherit; }
  #profile-info { display: flex; align-items: center; margin-bottom: 30px; }
  #profile-img { width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; display: none; }
  #profile-name { font-size: 14px; }
  </style></head><body><div class="container"><div class="title">會員資格申請書</div>
  <div id="profile-info"><img id="profile-img"><div id="profile-name">讀取 LINE 帳號中...</div></div>
  <form id="f">
    <div class="form-group"><span class="label">推薦人 ID</span><input type="text" id="s" readonly class="input" style="color:#888888;"></div>
    <div class="form-group"><span class="label">真實姓名</span><input type="text" id="n" placeholder="請輸入姓名" required class="input"></div>
    <div class="form-group"><span class="label">性別</span>
      <select id="g" class="input" required>
        <option value="">請選擇性別</option><option value="M">男</option><option value="F">女</option><option value="O">其他</option>
      </select>
    </div>
    <div class="form-group"><span class="label">生日</span><input type="date" id="b" class="input" required></div>
    <div class="form-group"><span class="label">聯絡電話</span><input type="tel" id="p" placeholder="請輸入電話" required class="input"></div>
    <div class="form-group"><span class="label">聯絡地址</span><input type="text" id="a" placeholder="請輸入完整地址" required class="input"></div>
    <button class="btn">送出申請</button>
  </form></div><script>
  let lineName = "";
  async function i(){
    await liff.init({liffId:"${liffId}"});
    if(!liff.isLoggedIn()){liff.login();return;}
    const profile=await liff.getProfile();
    lineName = profile.displayName;
    document.getElementById('profile-name').innerText = "綁定帳號: " + lineName;
    if(profile.pictureUrl) { document.getElementById('profile-img').src = profile.pictureUrl; document.getElementById('profile-img').style.display = "block"; }
    document.getElementById('s').value=new URLSearchParams(window.location.search).get('sponsorId')||'ROOT';
    document.getElementById('f').onsubmit=async(e)=>{
      e.preventDefault();
      const payload = { action: "submitApplication", newUserId: profile.userId, sponsorId: document.getElementById('s').value, name: document.getElementById('n').value, phone: document.getElementById('p').value, gender: document.getElementById('g').value, birthday: document.getElementById('b').value, address: document.getElementById('a').value, lineName: lineName };
      const res=await fetch(window.location.origin + "/",{method:'POST',body:JSON.stringify(payload)});
      const d=await res.json();
      alert(d.success?"申請已送出，請等待核准。":d.error);
      if(d.success)liff.closeWindow();
    }
  } i();
  </script></body></html>`;
};

export const getShareHtml = (liffId) => {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>正在開啟</title><script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script><style>body{font-family:"Microsoft JhengHei",sans-serif;background:#ffffff;display:flex;align-items:center;justify-center;height:100vh;margin:0;color:#000000;}#msg{font-size:14px;text-align:center;}#btn{display:none;background:#000000;color:#ffffff;padding:12px 30px;border-radius:50px;font-size:14px;cursor:pointer;border:none;margin-top:20px;}</style></head><body><div id="container"><div id="msg">正在開啟通訊錄...</div><button id="btn" onclick="startShare()">點擊登入並分享</button></div><script>let lId="${liffId}";let sponsorId=new URLSearchParams(window.location.search).get('sponsorId')||'ROOT';async function i(){try{await liff.init({liffId:lId});if(!liff.isLoggedIn()){showLogin();return;}await startShare();}catch(e){document.getElementById('msg').innerText="初始化失敗";showLogin();}}function showLogin(){document.getElementById('msg').innerText="需要登入以開啟分享功能";document.getElementById('btn').style.display="inline-block";}async function startShare(){try{document.getElementById('btn').style.display="none";document.getElementById('msg').innerText="通訊錄開啟中...";if(!liff.isLoggedIn()){liff.login({redirectUri:window.location.href});return;}const liffApplyUrl="https://liff.line.me/"+lId+"?sponsorId="+sponsorId;if(liff.isApiAvailable('shareTargetPicker')){await liff.shareTargetPicker([{"type":"flex","altText":"會員資格邀約","contents":{"type":"bubble","body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"誠摯邀請您加入團隊","size":"md","color":"#000000"},{"type":"text","text":"點擊下方連結了解詳情並申請。","size":"sm","color":"#000000","margin":"sm","wrap":true}]},"footer":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","action":{"type":"uri","label":"立即查看並申請","uri":liffApplyUrl},"style":"primary","color":"#000000"},{"type":"button","action":{"type":"uri","label":"前往官方帳號","uri":"https://lin.ee/r2X7V2F"},"style":"secondary"}]}}}]);liff.closeWindow();}else{document.getElementById('msg').innerText="不支援通訊錄分享";}}catch(e){document.getElementById('msg').innerText="發生錯誤";showLogin();}}setTimeout(()=>{if(document.getElementById('msg').innerText==="正在開啟通訊錄..."){showLogin();}},3000);i();</script></body></html>`;
};
