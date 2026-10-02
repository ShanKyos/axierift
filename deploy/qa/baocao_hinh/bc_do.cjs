const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const br=await chromium.launch(); const pg=await br.newPage();
 await pg.goto('http://localhost:8865/magic_physics.html?magicRebuild=1'); await pg.waitForFunction(()=>window.MagicRebuild&&window.MagicRebuild.ready,null,{timeout:60000});
 const r=await pg.evaluate(()=>{const M=window.MagicRebuild,C=256; const ro=M.spec.rowOrder;
  const gear={chest:'ma_thuat',gloves:'ma_thuat',pants:'ma_thuat',boots:'ma_thuat',weapon:6,wing:1,levels:{},level:0};
  const bb=(st,row,f,opt,mode)=>{const c=document.createElement('canvas');c.width=C;c.height=C;const g=c.getContext('2d');
    const P=M.render(g,st,row,f,{...gear,...(opt.gear||{})},{attackMode:mode,wingPhase:0,vfx:false,props:opt.props,onlySlot:opt.only});
    const d=g.getImageData(0,0,C,C).data; let x0=C,y0=C,x1=-1,y1=-1,n=0;
    for(let y=0;y<C;y++)for(let x=0;x<C;x++)if(d[(y*C+x)*4+3]>40){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    return {w:x1-x0+1,h:y1-y0+1,day:y1,n, chanL:P&&P.screen&&P.screen.ankleL, chanR:P&&P.screen&&P.screen.ankleR};};
  const out=[];
  for(let row=0;row<8;row++){
    const than=bb('idle',row,0,{props:false,gear:{wing:null,weapon:null}},'ground');
    const canhL=bb('flyIdle',row,0,{only:'wingL'},'air'), canhR=bb('flyIdle',row,0,{only:'wingR'},'air');
    const canh=bb('flyIdle',row,0,{props:true},'air'), canhKhong=bb('flyIdle',row,0,{props:true,gear:{wing:null}},'air');
    const walk=[0,1,2,3,4,5,6,7].map(f=>bb('walk',row,f,{props:false,gear:{wing:null,weapon:null}},'ground').day);
    out.push({huong:ro[row],thanW:than.w,thanH:than.h,thanDay:than.day,thanN:than.n,wingW:canh.w,noWingW:canhKhong.w,wingL:canhL.n,wingR:canhR.n,walkDay:walk});
  }
  return out;});
 console.log(JSON.stringify(r)); await br.close();})();
