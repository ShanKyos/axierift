(() => {
  'use strict';

  const CELL = 256;
  const GAME_CELL = 148;
  const DIRECTIONS = ['south','southwest','west','northwest','north','northeast','east','southeast'];
  const LABELS = ['S','SW','W','NW','N','NE','E','SE'];
  const FPS = { idle:5, walk:7, run:11, attack:10 };
  const SPEED = { walk:72, run:136 };
  const ASSET_ROOT = 'assets/magic-runtime/';
  const MAP_FILES = {
    grass:'assets/iso/nen_co1.png', road:'assets/iso/nen_duong1.png', tree:'assets/iso/cay_to2.png',
    bush:'assets/iso/buicay1.png', rock:'assets/iso/da2.png'
  };

  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const stateButtons = [...document.querySelectorAll('[data-state]')];
  const directionBar = document.querySelector('#directions');
  const armorSelect = document.querySelector('#armor-select');
  const weaponSelect = document.querySelector('#weapon-select');
  const weaponToggle = document.querySelector('#weapon');
  const socketToggle = document.querySelector('#sockets');
  const safeZoneToggle = document.querySelector('#safe-zone');
  const randomGearButton = document.querySelector('#random-gear');
  const gearInfo = document.querySelector('#gear-info');
  const status = document.querySelector('#status');
  const images = {};
  const keys = new Set();
  let manifest;
  let sockets;
  let mode = 'walk';
  let direction = 0;
  let selectedArmor = null;
  let selectedWeapon = null;
  let frameClock = 0;
  let last = performance.now();
  let dpr = 1;
  const player = { x:0, y:0 };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Không tải được ${src}`));
      image.src = src;
    });
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    if (!player.x) { player.x = innerWidth * .58; player.y = innerHeight * .58; }
  }

  function directionFromVector(dx, dy) {
    if (!dx && !dy) return direction;
    const octant = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
    return ({ 2:0, 3:1, 4:2, '-4':2, '-3':3, '-2':4, '-1':5, 0:6, 1:7 })[octant];
  }

  function vectorForDirection(index) {
    return [[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]][index];
  }

  function currentInput() {
    let dx=0, dy=0;
    if (keys.has('arrowleft') || keys.has('a')) dx--;
    if (keys.has('arrowright') || keys.has('d')) dx++;
    if (keys.has('arrowup') || keys.has('w')) dy--;
    if (keys.has('arrowdown') || keys.has('s')) dy++;
    return [dx,dy];
  }

  function activeState(dx,dy) {
    if (mode !== 'control') return mode;
    if (!dx && !dy) return 'idle';
    return keys.has('shift') ? 'run' : 'walk';
  }

  function drawMap() {
    const w=innerWidth, h=innerHeight, tw=256, th=128;
    ctx.fillStyle='#6b813c'; ctx.fillRect(0,0,w,h);
    for (let y=-th; y<h+th; y+=th) for (let x=-tw; x<w+tw; x+=tw) {
      const roadBand = Math.abs((y+h*.15)-(x*.28+h*.35)) < 105;
      ctx.drawImage(images[roadBand ? 'road' : 'grass'],x,y,tw,th);
    }
    const props=[
      [images.tree,w*.08,h*.10,190,210],[images.tree,w*.82,h*.08,205,225],
      [images.tree,w*.9,h*.48,180,200],[images.bush,w*.23,h*.18,100,99],
      [images.bush,w*.72,h*.3,92,91],[images.bush,w*.13,h*.68,112,111],
      [images.rock,w*.34,h*.24,58,51],[images.rock,w*.76,h*.72,70,61]
    ];
    props.filter(p=>p[2]<player.y).forEach(p=>ctx.drawImage(p[0],p[1],p[2],p[3],p[4]));
    return props.filter(p=>p[2]>=player.y);
  }

  function drawShadow() {
    ctx.save(); ctx.translate(player.x,player.y+4);
    ctx.fillStyle='rgba(16,10,5,.17)'; ctx.beginPath(); ctx.ellipse(0,0,24,8,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(205,155,66,.72)'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.ellipse(0,0,29,10,0,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  function appearanceKey(state) {
    return selectedArmor ? `armor:${selectedArmor.id}:${state}` : `body:${state}`;
  }

  function drawAppearance(state,dir,frame) {
    const x=player.x-GAME_CELL/2, y=player.y-GAME_CELL*(244/256);
    ctx.drawImage(images[appearanceKey(state)],frame*CELL,dir*CELL,CELL,CELL,x,y,GAME_CELL,GAME_CELL);
  }

  function drawWeapon(state,dir,frame,z) {
    if (!weaponToggle.checked || !selectedWeapon || safeZoneToggle.checked) return;
    const pose=sockets.states[state][DIRECTIONS[dir]][frame];
    const scale=GAME_CELL/CELL;
    ['hand_left','hand_right'].forEach((key,index) => {
      const hand=pose[key];
      if (hand.z !== z) return;
      const x=player.x-GAME_CELL/2+hand.xy[0]*scale;
      const y=player.y-GAME_CELL*(244/256)+hand.xy[1]*scale;
      ctx.save(); ctx.translate(x,y); ctx.rotate(hand.rotationDeg*Math.PI/180);
      if (index===0) ctx.scale(-1,1);
      const size=selectedWeapon.displayPx;
      ctx.drawImage(images[`weapon:${selectedWeapon.id}`],-size/2,-size*selectedWeapon.gripRatio,size,size);
      ctx.restore();
    });
  }

  function redrawPalm(state,dir,frame) {
    if (!weaponToggle.checked || !selectedWeapon || safeZoneToggle.checked) return;
    const pose=sockets.states[state][DIRECTIONS[dir]][frame];
    const atlas=images[appearanceKey(state)];
    const scale=GAME_CELL/CELL;
    ['hand_left','hand_right'].forEach(key => {
      const hand=pose[key];
      if (hand.z !== 'front') return;
      const radius=state==='attack' ? 7 : 6;
      const sx=frame*CELL+hand.xy[0]-radius;
      const sy=dir*CELL+hand.xy[1]-radius;
      const dx=player.x-GAME_CELL/2+(hand.xy[0]-radius)*scale;
      const dy=player.y-GAME_CELL*(244/256)+(hand.xy[1]-radius)*scale;
      ctx.save();
      ctx.beginPath(); ctx.arc(dx+radius*scale,dy+radius*scale,radius*scale,0,Math.PI*2); ctx.clip();
      ctx.drawImage(atlas,sx,sy,radius*2,radius*2,dx,dy,radius*2*scale,radius*2*scale);
      ctx.restore();
    });
  }

  function drawBackCarry(state,dir,frame,z) {
    if (!weaponToggle.checked || !selectedWeapon || !safeZoneToggle.checked) return;
    const visibleLayer=(dir>=3 && dir<=5) ? 'front' : 'back';
    if (z!==visibleLayer) return;
    const size=selectedWeapon.displayPx*1.22;
    const bob=(state==='idle' ? .5 : 1.2)*Math.sin(frame/8*Math.PI*2);
    [[-18,-39,false],[18,39,true]].forEach(([offset,angle,mirror]) => {
      ctx.save(); ctx.translate(player.x+offset,player.y-GAME_CELL*.70+bob); ctx.rotate(angle*Math.PI/180);
      if (mirror) ctx.scale(-1,1);
      ctx.drawImage(images[`weapon:${selectedWeapon.id}`],-size/2,-size*.12,size,size); ctx.restore();
    });
  }

  function drawSockets(state,dir,frame) {
    if (!socketToggle.checked) return;
    const scale=GAME_CELL/CELL;
    const pose=sockets.states[state][DIRECTIONS[dir]][frame];
    ['hand_left','hand_right'].forEach((key,index) => {
      const hand=pose[key];
      const x=player.x-GAME_CELL/2+hand.xy[0]*scale;
      const y=player.y-GAME_CELL*(244/256)+hand.xy[1]*scale;
      ctx.fillStyle=index ? '#50d7ff' : '#ffdf5c'; ctx.beginPath(); ctx.arc(x,y,3.2,0,Math.PI*2); ctx.fill();
    });
  }

  function drawPlayer(state,dir,frame) {
    drawShadow();
    drawBackCarry(state,dir,frame,'back');
    drawWeapon(state,dir,frame,'back');
    drawAppearance(state,dir,frame);
    drawBackCarry(state,dir,frame,'front');
    drawWeapon(state,dir,frame,'front');
    redrawPalm(state,dir,frame);
    drawSockets(state,dir,frame);
  }

  function update(dt) {
    let [dx,dy]=currentInput();
    const state=activeState(dx,dy);
    if (mode!=='control') [dx,dy]=['walk','run'].includes(state) ? vectorForDirection(direction) : [0,0];
    if (dx||dy) {
      direction=directionFromVector(dx,dy);
      const length=Math.hypot(dx,dy), speed=SPEED[state]||0;
      player.x+=dx/length*speed*dt; player.y+=dy/length*speed*.55*dt;
      const margin=95;
      if (player.x<margin) player.x=innerWidth-margin; if (player.x>innerWidth-margin) player.x=margin;
      if (player.y<margin) player.y=innerHeight-margin; if (player.y>innerHeight-margin) player.y=margin;
    }
    frameClock+=dt*FPS[state];
    return state;
  }

  function render(now) {
    const dt=Math.min(.05,(now-last)/1000); last=now;
    const state=update(dt), frame=Math.floor(frameClock)%8;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,innerWidth,innerHeight);
    const foreground=drawMap(); drawPlayer(state,direction,frame);
    foreground.forEach(p=>ctx.drawImage(p[0],p[1],p[2],p[3],p[4]));
    const gear=selectedArmor ? selectedArmor.name : 'Body base';
    const item=!weaponToggle.checked || !selectedWeapon ? 'Không vũ khí' : safeZoneToggle.checked ? `${selectedWeapon.name} · vắt lưng` : selectedWeapon.name;
    status.textContent=`${state.toUpperCase()} · ${DIRECTIONS[direction].toUpperCase()} · ${FPS[state]} FPS · ${gear} · ${item}`;
    requestAnimationFrame(render);
  }

  function chooseMode(next) {
    mode=next; frameClock=0;
    stateButtons.forEach(button=>button.classList.toggle('on',button.dataset.state===mode));
  }

  function updateGearInfo() {
    gearInfo.textContent=`Giáp: ${selectedArmor ? selectedArmor.name : 'Body base'} · Vũ khí: ${selectedWeapon ? selectedWeapon.name : 'Không có'}`;
  }

  function fillSelectors() {
    armorSelect.innerHTML='<option value="">Body base</option>'+manifest.armors.map(a=>`<option value="${a.id}">T${a.tier} · ${a.name}</option>`).join('');
    weaponSelect.innerHTML='<option value="">Không vũ khí</option>'+manifest.weapons.map(w=>`<option value="${w.id}">T${w.tier} · ${w.name}</option>`).join('');
    armorSelect.value='ma_thuat'; weaponSelect.value='song_dao_co_ban';
    selectedArmor=manifest.armors.find(a=>a.id===armorSelect.value);
    selectedWeapon=manifest.weapons.find(w=>w.id===weaponSelect.value);
    updateGearInfo();
  }

  function bindControls() {
    DIRECTIONS.forEach((name,index) => {
      const button=document.createElement('button'); button.textContent=LABELS[index]; button.title=name; button.classList.toggle('on',index===direction);
      button.addEventListener('click',()=>{ direction=index; frameClock=0; directionBar.querySelectorAll('button').forEach((node,j)=>node.classList.toggle('on',j===index)); });
      directionBar.appendChild(button);
    });
    stateButtons.forEach(button=>button.addEventListener('click',()=>chooseMode(button.dataset.state)));
    armorSelect.addEventListener('change',()=>{ selectedArmor=manifest.armors.find(a=>a.id===armorSelect.value)||null; updateGearInfo(); });
    weaponSelect.addEventListener('change',()=>{ selectedWeapon=manifest.weapons.find(w=>w.id===weaponSelect.value)||null; weaponToggle.checked=Boolean(selectedWeapon); updateGearInfo(); });
    randomGearButton.addEventListener('click',()=>{
      selectedArmor=manifest.armors[Math.floor(Math.random()*manifest.armors.length)];
      selectedWeapon=manifest.weapons[Math.floor(Math.random()*manifest.weapons.length)];
      armorSelect.value=selectedArmor.id; weaponSelect.value=selectedWeapon.id; weaponToggle.checked=true; updateGearInfo();
    });
    addEventListener('keydown',event=>{
      const key=event.key.toLowerCase(); keys.add(key);
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) event.preventDefault();
      if (key==='v') weaponToggle.checked=!weaponToggle.checked;
      if (key==='z') safeZoneToggle.checked=!safeZoneToggle.checked;
      if ('wasd'.includes(key)||key.startsWith('arrow')) chooseMode('control');
    });
    addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
    addEventListener('resize',resize);
  }

  async function boot() {
    manifest=await fetch(`${ASSET_ROOT}manifest.json`).then(response=>{
      if (!response.ok) throw new Error('Không đọc được manifest runtime');
      return response.json();
    });
    sockets=await fetch(`${ASSET_ROOT}${manifest.sockets}`).then(response=>response.json());
    fillSelectors(); bindControls();
    const loads=[];
    Object.entries(MAP_FILES).forEach(([key,path])=>loads.push(loadImage(path).then(image=>{ images[key]=image; })));
    Object.entries(manifest.bodyBase).forEach(([state,path])=>loads.push(loadImage(ASSET_ROOT+path).then(image=>{ images[`body:${state}`]=image; })));
    manifest.armors.forEach(armor=>Object.entries(armor.states).forEach(([state,path])=>loads.push(loadImage(ASSET_ROOT+path).then(image=>{ images[`armor:${armor.id}:${state}`]=image; }))));
    manifest.weapons.forEach(weapon=>loads.push(loadImage(ASSET_ROOT+weapon.master).then(image=>{ images[`weapon:${weapon.id}`]=image; })));
    await Promise.all(loads);
    resize(); requestAnimationFrame(render);
  }

  boot().catch(error=>{
    console.error(error);
    status.textContent='Không tải được asset. Hãy mở demo qua dev server, không mở HTML bằng file://';
  });
})();
