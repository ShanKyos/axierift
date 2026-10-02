const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const br=await chromium.launch(); const pg=await br.newPage({viewport:{width:1280,height:800}});
 const loi=[]; pg.on('pageerror',e=>loi.push(String(e)));
 await pg.goto('http://localhost:8865/index.html?test=1&magicRebuild=1'); await pg.waitForFunction(()=>window.__gameReady&&window.MagicRebuild.ready,null,{timeout:60000});
 const kq=await pg.evaluate(async()=>{window.TEST_MODE=true; startGame('minhgiao',null); applyTestBoost(); travelTo('corran'); player.reflect=0;
   for(const m of mobs){m.x=-9999;m.y=-9999;}
   const ids=['a','tp','mg_powerslash','mg_powerwave','mg_twistingslash','mg_giganticstorm','mg_fireball', ...(player.skillBar||[])].filter((v,i,a)=>v&&a.indexOf(v)===i);
   const out={};
   for(const cv of [true,false]){ if(!cv){window.__canh=player.equip.canh; player.equip.canh=null; calcDerived();}
    for(const id of ids){ if(!SKILL_DEFS[id]){out[id]='không có SKILL_DEFS';continue;}
     player.cd={}; player.qi=1e7; player.castT=0; await new Promise(r=>setTimeout(r,300));
     const seen={}; let stop=false; const t=()=>{const r=window.__magicRebuildRender; if(r){const k=r.state+'|'+r.attackMode; seen[k]=(seen[k]||0)+1;} window.__magicRebuildRender=null; if(!stop)requestAnimationFrame(t);};
     requestAnimationFrame(t); try{castSkill(id);}catch(e){seen.err=String(e);} await new Promise(r=>setTimeout(r,600)); stop=true;
     out[(cv?'canh ':'khongcanh ')+id]={ms:player._magicCastState, seen};}
    if(!cv){player.equip.canh=window.__canh; calcDerived();} }
   return {bar:player.skillBar, out};});
 console.log(JSON.stringify({kq,loi},null,1)); await br.close();})();
