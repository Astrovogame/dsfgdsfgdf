/* Kraken.io — Browser game (singleplayer + optional online PvP)
   MIT License
*/
(() => {
  // ---------- DOM
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const HUD = document.getElementById('hud');
  const MENU = document.getElementById('menu');
  const SHOP = document.getElementById('shop');
  const SETTINGS = document.getElementById('settings');
  const SCORES = document.getElementById('scores');
  const PAUSED = document.getElementById('paused');
  const GAMEOVER = document.getElementById('gameOver');

  const els = {
    lenLabel: document.getElementById('lenLabel'),
    orbLabel: document.getElementById('orbLabel'),
    powerLabel: document.getElementById('powerLabel'),
    coinLabel: document.getElementById('coinLabel'),
    coinsShop: document.getElementById('coinsShop'),
    colorsGrid: document.getElementById('colorsGrid'),
    hatsGrid: document.getElementById('hatsGrid'),
    hsList: document.getElementById('hsList'),
  };
  const buttons = {
    start: document.getElementById('startBtn'),
    shop: document.getElementById('shopBtn'),
    scores: document.getElementById('scoresBtn'),
    settings: document.getElementById('settingsBtn'),
    back1: document.getElementById('backToMenu1'),
    back2: document.getElementById('backToMenu2'),
    back3: document.getElementById('backToMenu3'),
    pause: document.getElementById('pauseBtn'),
    resume: document.getElementById('resumeBtn'),
    quit: document.getElementById('quitBtn'),
    again: document.getElementById('againBtn'),
    goMenu: document.getElementById('goMenuBtn')
  };
  const inputs = {
    diff: document.getElementById('difficulty'),
    controlMode: document.getElementById('controlMode'),
    music: document.getElementById('musicToggle'),
    sfx: document.getElementById('sfxToggle'),
    online: document.getElementById('onlineToggle'),
    name: document.getElementById('playerName')
  };

  // ---------- Utils
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const rand = (a,b)=>Math.random()*(b-a)+a;
  const irand = (a,b)=>Math.floor(rand(a,b+1));
  const dist2=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1;return dx*dx+dy*dy};
  const PI2 = Math.PI*2;

  // ---------- Resize
  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.floor(w*DPR); canvas.height = Math.floor(h*DPR);
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize); resize();

  // ---------- Save / Load
  const SAVE_KEY = 'krakenio_save_v2';
  function defaultSave(){ return {
    coins: 0,
    owned: { colors:['aqua','neon','emerald'], hats:['none'] },
    equipped: { color:'aqua', hat:'none' },
    settings: { music:false, sfx:true, controlMode:'mouse' },
    highscores: [],
    lastName: null
  };}
  let SAVE;
  function loadSave(){ try{ SAVE=JSON.parse(localStorage.getItem(SAVE_KEY))||defaultSave(); }catch{ SAVE=defaultSave(); } }
  function saveSave(){ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }
  loadSave();
  if (SAVE.lastName) inputs.name.value = SAVE.lastName;

  // ---------- Shop data
  const COLOR_ITEMS=[
    {id:'aqua', name:'Aqua', price:0, gradient:['#9efcff','#29bdd9']},
    {id:'neon', name:'Neon', price:50, gradient:['#e1ff00','#10ffcb']},
    {id:'emerald', name:'Emerald', price:80, gradient:['#69ff8a','#168d4d']},
    {id:'violet', name:'Violet', price:120, gradient:['#d88cff','#6a27c6']},
    {id:'lava', name:'Lava', price:150, gradient:['#ffaf5f','#ff3a2f']},
    {id:'ghost', name:'Ghost', price:200, gradient:['#e0f7ff','#b5d4ff']},
  ];
  const HAT_ITEMS=[
    {id:'none', name:'(geen)', price:0},
    {id:'crown', name:'Kroon', price:200},
    {id:'pirate', name:'Piratenhoed', price:150},
    {id:'samurai', name:'Samurai', price:180},
  ];

  function renderShop(){
    els.coinsShop.textContent = SAVE.coins|0; els.coinLabel.textContent = SAVE.coins|0;
    els.colorsGrid.innerHTML='';
    COLOR_ITEMS.forEach(item=>{
      const owned = SAVE.owned.colors.includes(item.id);
      const el = document.createElement('div'); el.className='item';
      const thumb=document.createElement('div'); thumb.className='thumb'; thumb.style.background=`linear-gradient(135deg,${item.gradient[0]},${item.gradient[1]})`;
      const title=document.createElement('div'); title.textContent=item.name;
      const price=document.createElement('div'); price.className='price'; price.textContent=owned?'Gekocht':`${item.price} coins`;
      const btn=document.createElement('button'); btn.className='btn equip'; btn.textContent=owned?(SAVE.equipped.color===item.id?'Geselecteerd':'Selecteer'):'Kopen';
      if (owned) el.classList.add('owned');
      btn.onclick=()=>{
        if (!owned){
          if ((SAVE.coins|0) >= item.price){ SAVE.coins -= item.price; SAVE.owned.colors.push(item.id); SAVE.equipped.color=item.id; saveSave(); renderShop(); }
          else alert('Niet genoeg coins.');
        } else { SAVE.equipped.color=item.id; saveSave(); renderShop(); }
      };
      el.appendChild(thumb); el.appendChild(title); el.appendChild(price); el.appendChild(btn);
      els.colorsGrid.appendChild(el);
    });
    els.hatsGrid.innerHTML='';
    HAT_ITEMS.forEach(item=>{
      const owned = SAVE.owned.hats.includes(item.id);
      const el = document.createElement('div'); el.className='item';
      const thumb=document.createElement('div'); thumb.className='thumb'; thumb.textContent=item.name;
      const title=document.createElement('div'); title.textContent=item.name;
      const price=document.createElement('div'); price.className='price'; price.textContent=owned?'Gekocht':`${item.price} coins`;
      const btn=document.createElement('button'); btn.className='btn equip'; btn.textContent=owned?(SAVE.equipped.hat===item.id?'Geselecteerd':'Selecteer'):'Kopen';
      btn.onclick=()=>{
        if (!owned){
          if ((SAVE.coins|0) >= item.price){ SAVE.coins -= item.price; SAVE.owned.hats.push(item.id); SAVE.equipped.hat=item.id; saveSave(); renderShop(); }
          else alert('Niet genoeg coins.');
        } else { SAVE.equipped.hat=item.id; saveSave(); renderShop(); }
      };
      el.appendChild(thumb); el.appendChild(title); el.appendChild(price); el.appendChild(btn);
      els.hatsGrid.appendChild(el);
    });
  }

  // ---------- UI helpers
  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }
  function gotoMenu(){ hide(SHOP); hide(SETTINGS); hide(SCORES); hide(PAUSED); hide(GAMEOVER); show(MENU); hide(HUD); }
  function gotoShop(){ renderShop(); hide(MENU); show(SHOP); }
  function gotoSettings(){ hide(MENU); show(SETTINGS); }
  function gotoScores(){
    els.hsList.innerHTML='';
    SAVE.highscores.forEach((h,i)=>{
      const li=document.createElement('li');
      const when=new Date(h.date).toLocaleString();
      li.textContent=`${i+1}. ${h.score} — ${when}`;
      els.hsList.appendChild(li);
    });
    hide(MENU); show(SCORES);
  }

  // ---------- Inputs
  const keys={};
  window.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()] = true; if(e.key===' ') e.preventDefault(); });
  window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });
  const pointer={active:false,x:0,y:0};
  function setPointer(e,clientX,clientY){
    const r=canvas.getBoundingClientRect(); pointer.x=clientX-r.left; pointer.y=clientY-r.top;
  }
  canvas.addEventListener('mousedown', e=>{ pointer.active=true; setPointer(e,e.clientX,e.clientY); });
  canvas.addEventListener('mouseup', ()=>{ pointer.active=false; });
  canvas.addEventListener('mousemove', e=>{ setPointer(e,e.clientX,e.clientY); });
  canvas.addEventListener('touchstart', e=>{ pointer.active=true; const t=e.touches[0]; setPointer(e,t.clientX,t.clientY); }, {passive:true});
  canvas.addEventListener('touchend', ()=>{ pointer.active=false; });
  canvas.addEventListener('touchmove', e=>{ const t=e.touches[0]; setPointer(e,t.clientX,t.clientY); }, {passive:true});

  // ---------- Game state
  const GameState={ MENU:0, PLAY:1, PAUSE:2, OVER:3 };
  let state=GameState.MENU;
  let world=null;
  let lastTime=0;

  const DIFFS={
    easy:{ bots:6, botSpeed:1.6, orbRate:1.0, powerRate:0.8 },
    normal:{ bots:10, botSpeed:2.0, orbRate:1.2, powerRate:1.0 },
    hard:{ bots:14, botSpeed:2.3, orbRate:1.4, powerRate:1.2 },
  };

  // ---------- Entities
  function makeKraken(x,y,isPlayer,colorId,hat){
    return {
      x,y, vx:0, vy:0, angle:Math.random()*PI2,
      len:20, segSpacing:7, segments:[], radius:10,
      isPlayer, alive:true, colorId, hat,
      invuln:0, turbo:0, magnet:0, ink:0, grabCd:0,
      kills:0, orbs:0, maxSpeed:2.8, speed:2.4,
      controlMode:'mouse', name: 'Anoniem'
    };
  }
  function addOrb(world){ world.orbs.push({x:rand(20,world.w-20), y:rand(20,world.h-20), v:irand(1,3)}); }
  function addPowerup(world){ const types=['ink','turbo','magnet','shield','grab']; world.powerups.push({x:rand(30,world.w-30), y:rand(30,world.h-30), type: types[irand(0,types.length-1)]}); }

  // ---------- Start / Pause / Over
  buttons.start.onclick = ()=>{
    alreadyOver=false;
    // reset any lingering inputs
    for (const k in keys) keys[k]=false; pointer.active=false;
    SAVE.settings.controlMode = document.getElementById('controlMode').value;
    saveSave();
    world = makeWorld();
    state = GameState.PLAY;
    hide(MENU); hide(GAMEOVER); show(HUD);
    if (inputs.online.checked) connectOnline();
  };
  buttons.shop.onclick = gotoShop;
  buttons.settings.onclick = gotoSettings;
  buttons.scores.onclick = gotoScores;
  buttons.back1.onclick = gotoMenu;
  buttons.back2.onclick = ()=>{ SAVE.settings.music=inputs.music.checked; SAVE.settings.sfx=inputs.sfx.checked; SAVE.settings.controlMode=document.getElementById('controlMode').value; saveSave(); gotoMenu(); };
  buttons.back3.onclick = gotoMenu;
  buttons.pause.onclick = ()=>{ if(state===GameState.PLAY){ state=GameState.PAUSE; show(PAUSED);} };
  buttons.resume.onclick = ()=>{ if(state===GameState.PAUSE){ state=GameState.PLAY; hide(PAUSED);} };
  buttons.quit.onclick = ()=>{ if(state===GameState.PAUSE){ endGame(false);} };
  buttons.again.onclick = ()=>{ hide(GAMEOVER); show(MENU); };
  buttons.goMenu.onclick = ()=>{ hide(GAMEOVER); show(MENU); };

  let alreadyOver=false;
  function endGame(){
    if (state !== GameState.PLAY) return; // guard

    if (alreadyOver) return; alreadyOver=true;
    state = GameState.OVER; hide(HUD); show(GAMEOVER);
    const score = world.score|0;
    const coins = Math.max(1, Math.round(score*0.1) + world.player.kills*10);
    SAVE.coins = (SAVE.coins|0) + coins; saveSave(); addHighscore(score);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCoins').textContent = coins;
    if (ws){ try{ ws.close(); }catch{} ws=null; }
  }
  function addHighscore(score){
    SAVE.highscores.push({ score, date: new Date().toISOString() });
    SAVE.highscores.sort((a,b)=>b.score-a.score);
    SAVE.highscores = SAVE.highscores.slice(0,15);
    saveSave();
  }

  // ---------- World
  function makeWorld(){
    const W=canvas.width/DPR, H=canvas.height/DPR;
    const cfg=DIFFS[inputs.diff.value]||DIFFS.normal;
    const colorId = SAVE.equipped.color||'aqua';
    const hat = SAVE.equipped.hat||'none';

    const w = {
      w:W,h:H, orbs:[], powerups:[], obstacles:[], bots:[], player:null,
      score:0, coinsEarned:0, tick:0, diffCfg:cfg, online:false,
      others: new Map(), // netId -> snapshot
    };
    // player FIRST (so we can place safe obstacles)
    const p = makeKraken(W*0.5,H*0.5,true,colorId,hat);
    p.maxSpeed=2.9; p.speed=2.4; p.controlMode=SAVE.settings.controlMode||'mouse';
    p.invuln = 2.5; // brief spawn protection
    p.name = (inputs.name.value||'').trim() || randomName();
    SAVE.lastName = p.name; saveSave();
    w.player = p;
    // safe obstacles (not near player spawn)
    const SAFE = 120; // pixels from player
    for(let i=0;i<6;i++){
      let placed=false, tries=0;
      while(!placed && tries<50){
        const o={x:rand(80,W-80), y:rand(80,H-80), r:rand(20,40)};
        const dx=o.x-p.x, dy=o.y-p.y; if (dx*dx+dy*dy > (o.r+SAFE)*(o.r+SAFE)){ w.obstacles.push(o); placed=true; }
        tries++;
      }
    }
    // orbs
    for(let i=0;i<80;i++) addOrb(w);
    // bots
    for(let i=0;i<cfg.bots;i++){
      const b = makeKraken(rand(50,W-50), rand(50,H-50), false, COLOR_ITEMS[irand(0,COLOR_ITEMS.length-1)].id, 'none');
      b.ai={target:null,t:0}; b.speed=cfg.botSpeed; b.maxSpeed=b.speed*1.25; w.bots.push(b);
    }
    return w;
  }
  function randomName(){
    const A=['Blub','Bub','Inky','Bubbles','Coral','Fang','Nori','Mizu','Kelpie','Finn'];
    const B=['Prime','Zero','Nova','Flux','Jade','Vex','Echo','Volt','Gale','Drift'];
    return A[irand(0,A.length-1)] + ' ' + B[irand(0,B.length-1)];
  }

  // ---------- Colors
  function colorFor(id){
    const map={
      aqua:['#9efcff','#29bdd9'], neon:['#e1ff00','#10ffcb'], emerald:['#69ff8a','#168d4d'],
      violet:['#d88cff','#6a27c6'], lava:['#ffaf5f','#ff3a2f'], ghost:['#e0f7ff','#b5d4ff']
    }; return map[id]||map.aqua;
  }

  // ---------- Update loop
  function update(dt){
    const W=world.w,H=world.h; world.tick+=dt; const p=world.player;
    els.coinLabel.textContent = SAVE.coins|0;

    // spawns
    if (world.orbs.length<120 && Math.random()<0.03*world.diffCfg.orbRate) addOrb(world);
    if (world.powerups.length<3 && Math.random()<0.004*world.diffCfg.powerRate) addPowerup(world);

    // control
    const ACC=0.25, FRI=0.92;
    let targetAngle = p.angle;
    if (p.controlMode==='mouse'){
      const dx=pointer.x-p.x, dy=pointer.y-p.y;
      if (dx*dx+dy*dy>4){
        const ang=Math.atan2(dy,dx);
        let da=(ang-p.angle+Math.PI*3)%(PI2)-Math.PI;
        p.angle += da*0.15;
      }
      const thrust = pointer.active?1:0.5;
      p.vx += Math.cos(p.angle)*ACC*thrust;
      p.vy += Math.sin(p.angle)*ACC*thrust;
    } else {
      if (keys['a']||keys['arrowleft']) p.angle-=0.07;
      if (keys['d']||keys['arrowright']) p.angle+=0.07;
      if (keys['w']||keys['arrowup']){ p.vx+=Math.cos(p.angle)*ACC; p.vy+=Math.sin(p.angle)*ACC; }
    }

    // abilities
    if ((keys['shift']||keys['shiftleft']) && p.turbo<=0) p.turbo=1.2;
    if (keys['e'] && p.ink<=0){ p.ink=5.0; p.invuln=Math.max(p.invuln, 3.0); }
    if (keys[' '] && p.grabCd<=0){ performGrab(p); p.grabCd=5.0; }

    const maxSpeed=(p.maxSpeed||3.0)*(p.turbo>0?1.6:1.0);
    p.vx*=FRI; p.vy*=FRI;
    const sp=Math.hypot(p.vx,p.vy);
    if (sp>maxSpeed){ p.vx=p.vx/sp*maxSpeed; p.vy=p.vy/sp*maxSpeed; }
    p.x = clamp(p.x+p.vx, 10, W-10);
    p.y = clamp(p.y+p.vy, 10, H-10);
    p.turbo=Math.max(0,p.turbo-dt); p.invuln=Math.max(0,p.invuln-dt); p.ink=Math.max(0,p.ink-dt); p.grabCd=Math.max(0,p.grabCd-dt);

    updateTrail(p);
    collectOrbs(p,world);
    // powerups
    for (let i=world.powerups.length-1;i>=0;i--){
      const u=world.powerups[i]; if (dist2(p.x,p.y,u.x,u.y) < (p.radius+8)**2){ applyPower(p,u.type); world.powerups.splice(i,1); }
    }
    // magnet pulls
    if (p.magnet>0){ const R=140,R2=R*R; world.orbs.forEach(o=>{ const dd=dist2(p.x,p.y,o.x,o.y); if (dd<R2){ const d=Math.sqrt(dd)+1e-3; o.x += (p.x-o.x)/d*0.7; o.y += (p.y-o.y)/d*0.7; } }); p.magnet-=dt; }

    // bots
    for (const b of world.bots){
      if (!b.alive) continue;
      const ACCb=0.2; b.ai.t-=dt;
      if (b.ai.t<=0){
        b.ai.t=rand(0.4,1.2);
        let best=null,bestD=1e9;
        for (const o of world.orbs){ const dd=dist2(b.x,b.y,o.x,o.y); if (dd<bestD){best=o;bestD=dd;} }
        b.ai.target=best;
      }
      if (b.ai.target){
        const dx=b.ai.target.x-b.x, dy=b.ai.target.y-b.y; const ang=Math.atan2(dy,dx);
        let da=(ang-b.angle+Math.PI*3)%(PI2)-Math.PI; b.angle+=da*0.18;
        b.vx+=Math.cos(b.angle)*ACCb; b.vy+=Math.sin(b.angle)*ACCb;
      } else { b.vx+=Math.cos(b.angle)*ACCb*0.3; b.vy+=Math.sin(b.angle)*ACCb*0.3; }
      const spb=Math.hypot(b.vx,b.vy), maxB=b.maxSpeed||2.2;
      if (spb>maxB){ b.vx=b.vx/spb*maxB; b.vy=b.vy/spb*maxB; }
      b.vx*=0.92; b.vy*=0.92; b.x=clamp(b.x+b.vx,10,W-10); b.y=clamp(b.y+b.vy,10,H-10);
      updateTrail(b); collectOrbs(b,world);
    }

    // collisions heads vs segments
    for (const b of world.bots){
      if (!b.alive) continue;
      if (p.invuln<=0 && hitSegments(p.x,p.y,b.segments,p.radius)){ dropOrbs(world,p); endGame(); return; }
      if (hitSegments(b.x,b.y,p.segments,b.radius)){ b.alive=false; world.player.kills++; dropOrbs(world,b); setTimeout(()=>respawnBot(b),800); }
    }
    // obstacles
    for (const o of world.obstacles){
      if (dist2(p.x,p.y,o.x,o.y) < (o.r+p.radius)**2 && p.invuln<=0){ dropOrbs(world,p); endGame(); return; }
      for (const b of world.bots){
        if (!b.alive) continue;
        if (dist2(b.x,b.y,o.x,o.y) < (o.r+b.radius)**2){ b.alive=false; dropOrbs(world,b); setTimeout(()=>respawnBot(b),800); }
      }
    }
    // score
    world.score += dt*(1 + p.orbs*0.05 + p.kills*0.2);
    els.lenLabel.textContent = p.len|0; els.orbLabel.textContent=p.orbs|0;
    els.powerLabel.textContent = p.invuln>0?'Schild': p.magnet>0?'Magneet': p.turbo>0?'Turbo': p.ink>0?'Inkt':'—';

    // online tick
    netUpdate(dt);
  }

  function respawnBot(b){
    const W=world.w,H=world.h;
    b.x=rand(50,W-50); b.y=rand(50,H-50); b.vx=b.vy=0; b.alive=true; b.segments=[]; b.orbs=0; b.kills=0;
  }

  function updateTrail(k){
    const maxSeg = 20 + k.orbs*3; k.len=maxSeg;
    const sp = k.segSpacing; const segs=k.segments;
    if (segs.length===0) segs.push({x:k.x,y:k.y});
    let last = segs[0]; const dx=k.x-last.x, dy=k.y-last.y; const d=Math.hypot(dx,dy);
    if (d>=sp){ const nx=last.x+dx/d*sp, ny=last.y+dy/d*sp; segs.unshift({x:nx,y:ny}); }
    while (segs.length>k.len) segs.pop();
  }
  function hitSegments(hx,hy,segs,rHead){
    const r=8, r2=(r+rHead)*(r+rHead);
    for (let i=5;i<segs.length;i+=2){ const s=segs[i]; if (dist2(hx,hy,s.x,s.y)<r2) return true; } return false;
  }
  function dropOrbs(world,k){
    for (let i=0;i<k.orbs;i++) world.orbs.push({x:k.x+rand(-20,20), y:k.y+rand(-20,20), v:irand(1,3)});
    k.orbs=0; k.segments.length=0;
  }
  function collectOrbs(k,world){
    for (let i=world.orbs.length-1;i>=0;i--){
      const o=world.orbs[i]; if (dist2(k.x,k.y,o.x,o.y)<(k.radius+6)**2){ world.orbs.splice(i,1); k.orbs++; }
    }
  }
  function applyPower(k,t){
    if (t==='ink'){ k.ink=5.0; k.invuln=Math.max(k.invuln,3.0); }
    else if (t==='turbo'){ k.turbo=1.5; }
    else if (t==='magnet'){ k.magnet=8.0; }
    else if (t==='shield'){ k.invuln=5.0; }
    else if (t==='grab'){ performGrab(k); }
  }
  function performGrab(k){
    // simple radial stun (client-side vs bots)
    const R=80,R2=R*R;
    for (const b of world.bots){
      if (!b.alive) continue;
      if (dist2(k.x,k.y,b.x,b.y)<R2){ b.vx*=0.3; b.vy*=0.3; }
    }
  }

  // ---------- Render
  function draw(){
    const W=world.w,H=world.h;
    // background bubbles
    ctx.clearRect(0,0,W,H);
    // obstacles
    ctx.save();
    for (const o of world.obstacles){
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,PI2); ctx.fillStyle='#07252f'; ctx.fill(); ctx.strokeStyle='#0a3a4b'; ctx.stroke();
    }
    // orbs
    for (const o of world.orbs){
      ctx.beginPath(); ctx.arc(o.x,o.y,3,0,PI2); ctx.fillStyle='#7be7ff'; ctx.fill();
    }
    // powerups
    for (const u of world.powerups){
      ctx.beginPath(); ctx.rect(u.x-6,u.y-6,12,12); ctx.fillStyle=(u.type==='turbo'?'#fff38a':u.type==='magnet'?'#aef9a4':u.type==='shield'?'#a6c9ff':u.type==='ink'?'#caa0ff':'#ffd1a6'); ctx.fill();
    }
    // bots
    for (const b of world.bots){ if (!b.alive) continue; drawKraken(b,false); }
    // player
    drawKraken(world.player,true);
    // others (online)
    for (const [id,pl] of world.others){ drawNetPlayer(pl); }
    ctx.restore();
  }
  function drawKraken(k,isMe){
    // segments
    const [c1,c2]=colorFor(k.colorId||'aqua'); const segs=k.segments;
    for (let i=0;i<segs.length;i++){
      const s=segs[i]; const r=6+Math.max(0,(segs.length-i)*0.08);
      const t=i/segs.length; const g=lerpColor(c1,c2,t);
      ctx.beginPath(); ctx.arc(s.x,s.y,r,0,PI2); ctx.fillStyle=g; ctx.fill();
    }
    // head
    ctx.beginPath(); ctx.arc(k.x,k.y,k.radius,0,PI2); ctx.fillStyle=c2; ctx.fill();
    // name
    if (k.name && (!isMe || k.ink<=0)){
      ctx.font='12px system-ui'; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.85)';
      ctx.fillText(k.name, k.x, k.y-18);
    }
    // hat (simple triangle/crown)
    if (k.hat==='crown'){
      ctx.beginPath(); ctx.moveTo(k.x-8,k.y-k.radius-2); ctx.lineTo(k.x,k.y-k.radius-12); ctx.lineTo(k.x+8,k.y-k.radius-2); ctx.closePath(); ctx.fillStyle='#ffd24a'; ctx.fill();
    } else if (k.hat==='pirate'){
      ctx.beginPath(); ctx.arc(k.x,k.y-k.radius+2,10,Math.PI,0); ctx.fillStyle='#111'; ctx.fill();
    } else if (k.hat==='samurai'){
      ctx.beginPath(); ctx.moveTo(k.x-12,k.y-k.radius); ctx.lineTo(k.x+12,k.y-k.radius); ctx.lineTo(k.x,k.y-k.radius-10); ctx.closePath(); ctx.fillStyle='#d14a4a'; ctx.fill();
    }
    // ink invisibility
    if (k.ink>0){ ctx.globalAlpha=0.35; ctx.beginPath(); ctx.arc(k.x,k.y,k.radius+6,0,PI2); ctx.strokeStyle='rgba(160,120,255,.6)'; ctx.stroke(); ctx.globalAlpha=1; }
  }
  function drawNetPlayer(p){
    // render as ghost with segments
    const [c1,c2]=colorFor(p.colorId||'aqua');
    const segs=p.segments||[];
    for (let i=0;i<segs.length;i++){
      const s=segs[i]; const r=5+Math.max(0,(segs.length-i)*0.07);
      const t=i/segs.length; const g=lerpColor(c1,c2,t);
      ctx.beginPath(); ctx.arc(s.x,s.y,r,0,PI2); ctx.fillStyle=g; ctx.globalAlpha=0.9; ctx.fill(); ctx.globalAlpha=1;
    }
    ctx.beginPath(); ctx.arc(p.x,p.y,10,0,PI2); ctx.fillStyle=c2; ctx.fill();
    if (p.name){
      ctx.font='12px system-ui'; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,.85)';
      ctx.fillText(p.name, p.x, p.y-18);
    }
  }
  function lerpColor(a,b,t){
    function hex2rgb(h){ const x=parseInt(h.slice(1),16); return [(x>>16)&255,(x>>8)&255,x&255]; }
    function rgb2hex(r,g,b){ return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
    const A=hex2rgb(a), B=hex2rgb(b);
    const r=Math.round(A[0]+(B[0]-A[0])*t), g=Math.round(A[1]+(B[1]-A[1])*t), b_=Math.round(A[2]+(B[2]-A[2])*t);
    return rgb2hex(r,g,b_);
  }

  // ---------- Online (WebSocket)
  let ws=null, netTimer=0, netId=null;

  function getQueryParam(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }
  function computeWsUrl(){
    const override = getQueryParam('ws');
    if (override) return override; // e.g. ?ws=wss://your-repl-name.username.repl.co/ws
    if (location.protocol==='file:'){
      console.warn('Running from file:// . Online uitzetten óf ?ws=wss://host/ws meegeven.');
      return null;
    }
    const proto = (location.protocol==='https:')?'wss':'ws';
    return `${proto}://${location.host}/ws`;
  }

  function connectOnline(){
    const url = computeWsUrl();
    if (!url){ console.warn('Geen geldige WS URL. Online uitzetten of ?ws= gebruiken.'); return; }
    try{
      ws = new WebSocket(url);
      ws.onopen = () => { console.log('WS open', url);
        world.online = true;
        ws.send(JSON.stringify({t:'join', name: world.player.name, colorId: world.player.colorId, hat: world.player.hat }));
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.t==='hello'){ netId = msg.id; }
        else if (msg.t==='players'){
          // update others map
          const me = netId;
          world.others.clear();
          for (const p of msg.list){
            if (p.id===me) continue;
            world.others.set(p.id, p);
          }
        } else if (msg.t==='die'){
          if (state===GameState.PLAY && msg.id === netId){ dropOrbs(world, world.player); endGame(); }
        }
      };
      ws.onclose = (ev) => { console.warn('WS close', ev.code, ev.reason); world.online=false; };
    } catch (e){ console.warn('WS failed', e); world.online=false; }
  }
  function netUpdate(dt){
    if (!ws || ws.readyState!==1) return;
    netTimer += dt;
    if (netTimer>0.05){ // 20 Hz
      netTimer=0;
      const p=world.player;
      const segs = p.segments.filter((_,i)=>i%3===0).slice(0,40); // downsample
      ws.send(JSON.stringify({t:'state', x:p.x, y:p.y, angle:p.angle, segments:segs, radius:p.radius, colorId:p.colorId, hat:p.hat, name:p.name }));
    }
  }

  // ---------- Main loop
  function frame(t){
    const now=t*0.001; const dt=Math.min(0.033, now - lastTime || 0.016); lastTime=now;
    if (state===GameState.PLAY && world){ update(dt); draw(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);


  // --- Force pristine UI on load
  function forceInitialUI(){
    [HUD, PAUSED, GAMEOVER, SHOP, SETTINGS, SCORES].forEach(el=>el && el.classList.add('hidden'));
    MENU && MENU.classList.remove('hidden');
    state = GameState.MENU;
    world = null;
  }
  window.addEventListener('load', forceInitialUI);

  // ---------- Initialization
  function initUI(){
    [HUD, MENU, SHOP, SETTINGS, SCORES, PAUSED, GAMEOVER].forEach(el=>el && el.classList.add('hidden'));
    state = GameState.MENU;
    show(MENU);
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initUI);
  } else { initUI(); }

})();