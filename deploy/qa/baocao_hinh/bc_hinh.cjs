const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const br=await chromium.launch(); const pg=await br.newPage();
 await pg.goto('http://localhost:8865/magic_physics.html?magicRebuild=1'); await pg.waitForFunction(()=>window.MagicRebuild&&window.MagicRebuild.ready,null,{timeout:60000});
 const r=await pg.evaluate(()=>{const M=window.MagicRebuild,C=256;
  const gear={chest:'ma_thuat',gloves:'ma_thuat',pants:'ma_thuat',boots:'ma_thuat',weapon:6,wing:1,levels:{},level:0};
  const sheet=(rows,cols,fn)=>{const c=document.createElement('canvas');c.width=C*cols;c.height=C*rows;const g=c.getContext('2d');g.fillStyle='#2b2f3a';g.fillRect(0,0,c.width,c.height);
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){g.save();g.translate(k*C,r*C);fn(g,r,k);g.restore();
      g.strokeStyle='#5a6b2a';g.beginPath();g.moveTo(k*C,r*C+216.5);g.lineTo(k*C+C,r*C+216.5);g.stroke();}
    return c.toDataURL('image/png');};
  return {
   huong: sheet(2,8,(g,r,k)=>M.render(g,r?'flyIdle':'idle',k,0,{...gear,wing:r?1:null,weapon:r?6:null},{attackMode:r?'air':'ground',wingPhase:0,vfx:false})),
   dibo: sheet(2,8,(g,r,k)=>M.render(g,'walk',r?6:0,k,{...gear,wing:null,weapon:null},{attackMode:'ground',wingPhase:0,vfx:false})),
  };});
 for(const [k,v] of Object.entries(r)) fs.writeFileSync(`${process.argv[2]}/bc_${k}.png`,Buffer.from(v.split(',')[1],'base64'));
 await br.close();})();
