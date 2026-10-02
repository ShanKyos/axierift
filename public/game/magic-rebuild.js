/* Editable multiview cutout authoring renderer. Production gated by QA manifest. */
(() => {
  'use strict';
  const ROOT = 'assets/magic-rebuild-v1/';
  const TAU = Math.PI * 2;
  // Cờ URL: có mặt mà giá trị là 0/false/off/no thì là TẮT. `has()` trơn coi `?magicPhysics=0`
  // là bật. Một cửa cho cả ba cờ (magicRebuild · magicAuthor · magicPhysics); physics-rig đọc lại.
  const magicCo = name => { const q = new URLSearchParams(location.search); if (!q.has(name)) return false; return !/^(0|false|off|no)$/i.test(q.get(name).trim()); };
  window.magicCo = magicCo;
  const M = {ready:false, enabled:magicCo('magicRebuild')};
  const parts = {}, images = {}, props = {}, concealedArt = {}, highlight = new Map();
  let spec, promise;
  const bones = [
    ['torsoUpper','neck','spine','chest',19],['torsoLower','spine','pelvis','chest',19],
    ['hip','pelvis','hipEnd','pants',21],['head','neck','head','body',19],
    ...['L','R'].flatMap(s=>[
      ['upper'+s,'shoulder'+s,'elbow'+s,'chest',9],
      ['lower'+s,'elbow'+s,'wrist'+s,'gloves',8],
      ['thigh'+s,'hip'+s,'knee'+s,'pants',11],
      ['shin'+s,'knee'+s,'ankle'+s,'boots',9],
      ['foot'+s,'ankle'+s,'toe'+s,'boots',9]])
  ];
  const canvas=(w=256,h=256)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const mul=(a,n)=>a.map(v=>v*n);
  const len=a=>Math.hypot(...a);
  const lerp=(a,b,t)=>a+(b-a)*t;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rotateX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
  const rotateY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
  function project(p,angle){const a=rotateY(p,angle);return [128+a[0],230-a[1]*.95+a[2]*.42,a[2]];}
  function ik(hip,ankle,bend=[0,0,1]){
    const delta=sub(ankle,hip), d=clamp(len(delta),.01,83.9), unit=mul(delta,1/len(delta));
    const dot=bend.reduce((n,v,i)=>n+v*unit[i],0);
    let normal=sub(bend,mul(unit,dot));normal=mul(normal,1/Math.max(.001,len(normal)));
    return add(add(hip,mul(unit,d/2)),mul(normal,Math.sqrt(42*42-d*d/4)));
  }
  function footTrajectory(frame,side,run){
    const t=((frame/8)+(side==='R'?.5:0))%1, stance=run?.375:.625, stride=run?38:23;
    if(t<stance)return {z:lerp(stride/2,-stride/2,t/stance),y:6,grounded:true};
    const u=(t-stance)/(1-stance);
    return {z:lerp(-stride/2,stride/2,u),y:6+Math.sin(u*Math.PI)*(run?19:9),grounded:false};
  }
  const attackProfiles={
    dualSlash:{height:[84,80,77,75,77,81,84,84],lean:[0,-6,-10,15,20,10,3,0],twist:[0,-12,-24,28,36,18,5,0],drive:[0,-2,-4,6,9,5,1,0]},
    horizontalSlash:{height:[84,81,78,76,77,81,84,84],lean:[0,-3,-6,10,13,6,2,0],twist:[0,-20,-36,32,45,24,8,0],drive:[0,-1,-2,3,5,2,0,0]},
    spinSlash:{height:[84,80,78,77,78,80,83,84],lean:[0,-4,3,6,6,3,1,0],twist:[0,-12,-18,14,18,10,3,0],drive:[0,0,0,0,0,0,0,0]},
    thrust:{height:[84,80,77,75,75,79,83,84],lean:[0,-9,-15,22,24,13,4,0],twist:[0,-6,-10,8,10,5,1,0],drive:[0,-3,-5,9,12,6,2,0]},
    risingSlash:{height:[84,78,72,74,81,85,84,84],lean:[0,7,12,4,-8,-13,-3,0],twist:[0,-8,-16,12,20,12,3,0],drive:[0,-2,-3,3,5,3,1,0]},
    fireDashSlash:{height:[84,78,74,72,74,78,82,84],lean:[0,-8,-13,25,30,18,5,0],twist:[0,-12,-22,26,34,18,4,0],drive:[0,-3,-5,9,12,7,2,0]},
    lightStorm:{height:[84,78,73,74,77,82,84,84],lean:[0,5,10,7,-10,-6,-2,0],twist:[0,-4,-8,-5,8,4,1,0],drive:[0,-1,-2,-1,3,2,0,0]}
  };
  function pose(state,row,frame,mode='air'){
    frame=['walk','run'].includes(state)?((Number(frame)%8)+8)%8:clamp(frame|0,0,7);row=((row|0)%8+8)%8;
    const attack=attackProfiles[state],groundAttack=!!attack&&mode==='ground';
    const t=frame/7, ph=frame/8*TAU, air=!['idle','walk','run','death'].includes(state)&&!groundAttack;
    let rootY=air?99+Math.sin(ph)*1.2:88+Math.sin(ph)*.4, rootZ=0, lean=0, arch=0;
    if(state==='walk')rootY=86+Math.cos(ph*2)*1.1;
    if(state==='run'){rootY=80+Math.cos(ph*2)*3.2;lean=8*Math.PI/180;}
    if(state==='flyMove')lean=13*Math.PI/180;
    if(state==='hit'){const pulse=Math.sin(t*Math.PI);lean=-8*Math.PI/180*pulse;arch=-18*Math.PI/180*pulse;rootY-=3*pulse;}
    let fall=0;
    if(state==='death'){
      const descent=[13,7,0,0,0,0,0,0][frame];fall=[0,0,0,.12,.36,.70,1,1][frame];
      rootY=88+descent-fall*73;lean=fall*Math.PI/2;
    }
    if(state==='fireDashSlash')rootZ=[0,-2,-5,2,15,9,3,0][frame];
    let twist=0;
    if(attack){rootY=groundAttack?attack.height[frame]:attack.height[frame]+19;lean=attack.lean[frame]*Math.PI/180*(state==='thrust'?.18:groundAttack?.60:.4);twist=attack.twist[frame]*Math.PI/180;rootZ=attack.drive[frame]*(state==='thrust'?.15:.6);}
    const angle=-row*Math.PI/4+(state==='spinSlash'?[0,-.10,.4,1.65,3.5,5.2,6.1,TAU][frame]:0);
    const root=[0,rootY,rootZ], local=p=>add(root,rotateY(rotateX(p,lean),twist*.3));
    const j={pelvis:root,hipEnd:local([0,-14,0]),spine:local([0,36,0])};
    const upperVector=p=>rotateY(rotateX(p,lean+arch),twist);
    const upperLocal=p=>add(j.spine,upperVector(p));
    j.neck=upperLocal([0,34,0]);j.head=upperLocal([0,58,0]);j.wing=upperLocal([0,28,-7]);
    for(const [side,sign] of [['L',-1],['R',1]]){
      j['shoulder'+side]=upperLocal([sign*20,24,0]);
      let ax=.08, az=sign*.40, bend=.03;
      if(state==='walk'||state==='run'){ax=Math.cos(ph+(side==='R'?Math.PI:0))*(state==='run'?.7:.32);bend=state==='run'?.75:.12;}
      if(air){ax=-.16;bend=.20;}
      const sweep=Math.sin(t*Math.PI), slash=['dualSlash','horizontalSlash','spinSlash','risingSlash','fireDashSlash'].includes(state);
      if(slash){ax=[-.16,-.7,-1.1,.4,1.0,.6,.1,-.16][frame];az=sign*(.4+1.1*sweep);bend=.2+.5*sweep;}
      if(state==='horizontalSlash'){ax=.6*sweep-.16;az=sign*[.4,.9,1.2,-.2,-.5,-.2,.25,.4][frame];bend=.2+.25*sweep;}
      if(state==='spinSlash'){ax=lerp(-.16,.5,sweep);az=sign*lerp(.4,1.45,sweep);bend=.20-.10*sweep;}
      if(state==='thrust'){ax=[-.2,-.7,-1.1,-1.28,-1.3,-1.1,-.6,-.2][frame];az=sign*.15;bend=.18+.52*(1-sweep);}
      if(state==='risingSlash'){ax=[.4,.7,.4,-.5,-1.7,-2.2,-.7,-.16][frame];az=sign*.55;bend=.15;}
      if(state==='lightStorm'){ax=-2.3*sweep;az=sign*(.4+.3*sweep);bend=.20;}
      if(state==='hit'){ax=.4;az=sign*.65;bend=.45;}
      if(state==='death'){ax=-.15;az=sign*lerp(.4,.20,fall);bend=-.08*fall;}
      const armVector=(a,z)=>[Math.sin(z)*34,-Math.cos(z)*Math.cos(a)*34,-Math.cos(z)*Math.sin(a)*34];
      j['elbow'+side]=add(j['shoulder'+side],upperVector(armVector(ax,az)));
      j['wrist'+side]=add(j['elbow'+side],upperVector(armVector(ax-bend,az)));
      j['hip'+side]=local([sign*12,0,0]);
      let ankle=[sign*21,6,rootZ], grounded=true;
      if(state==='walk'||state==='run'){
        const foot=footTrajectory(frame,side,state==='run');ankle=[sign*19,foot.y,foot.z];grounded=foot.grounded;
      } else if(air) {ankle=[sign*18,rootY-80,rootZ-15];grounded=false;}
      if(groundAttack){
        ankle=[sign*18,6,sign*9];
        if(state==='spinSlash'){
          grounded=frame===0||frame===7||(side==='L'?frame<4:frame>=4);
          if(grounded)ankle=rotateY(ankle,-(angle+row*Math.PI/4));
          else ankle[1]=14;
        }
        // Push, release both soles for the dash, then land. Ground mode does
        // not imply that both feet must remain planted throughout a lunge.
        if(state==='fireDashSlash'&&frame>=3&&frame<=5){ankle[1]=14;grounded=false;}
      }
      if(attack&&air)ankle=[sign*18,rootY-76+Math.sin(t*Math.PI)*4,rootZ-17-sign*Math.sin(t*Math.PI)*4];
      if(state==='death'){ankle=[sign*21,6+Math.max(0,13-frame*6)*(1-fall),rootZ-fall*82];grounded=ankle[1]<=6.01;}
      j['ankle'+side]=ankle;
      j['knee'+side]=ik(j['hip'+side],ankle,state==='death'?[0,1,0]:[0,0,1]);
      j['toe'+side]=add(ankle,state==='spinSlash'&&groundAttack&&grounded?rotateY([sign*2,-3,8],-(angle+row*Math.PI/4)):[sign*2,-3,8]);
      j['contact'+side]=grounded;
    }
    const screen={};for(const [k,v] of Object.entries(j))if(Array.isArray(v))screen[k]=project(v,angle);
    return {joints:j,screen,angle,state,row,frame,air,fall,lean,arch,twist,attackMode:attack?(groundAttack?'ground':'air'):null,view:((Math.round(-angle/(Math.PI/4))%8)+8)%8};
  }
  function landmarks(row){
    if(spec?.bindLandmarks?.[row])return spec.bindLandmarks[row];
    let p={neck:[128,79],head:[128,56],spine:[128,114],pelvis:[128,151],hipEnd:[128,165],
      shoulderL:[108,88],shoulderR:[148,88],elbowL:[98,118],elbowR:[158,118],wristL:[84,149],wristR:[172,149],
      hipL:[117,151],hipR:[139,151],kneeL:[110,184],kneeR:[146,184],ankleL:[106,222],ankleR:[150,222],toeL:[102,230],toeR:[154,230]};
    const r=row>4?8-row:row;
    if(r===1||r===3){p.shoulderL=[117,88];p.shoulderR=[146,89];p.elbowL=[105,118];p.elbowR=[154,117];p.wristL=[96,149];p.wristR=[158,149];p.hipL=[122,151];p.hipR=[137,151];p.kneeL=[112,183];p.kneeR=[145,184];p.ankleL=[106,220];p.ankleR=[150,222];p.toeL=[99,228];p.toeR=[154,230];}
    if(r===2){p.neck=[128,79];p.head=[129,56];p.shoulderL=[130,88];p.shoulderR=[121,89];p.elbowL=[124,118];p.elbowR=[116,117];p.wristL=[117,149];p.wristR=[109,146];p.hipL=[134,151];p.hipR=[120,151];p.kneeL=[136,184];p.kneeR=[125,181];p.ankleL=[138,222];p.ankleR=[126,213];p.toeL=[127,230];p.toeR=[115,220];}
    if(row>4){const original=JSON.parse(JSON.stringify(p));for(const key of Object.keys(p)){const swap=key.endsWith('L')?key.slice(0,-1)+'R':key.endsWith('R')?key.slice(0,-1)+'L':key;p[key]=[256-original[swap][0],original[swap][1]];}}
    if(row>=3&&row<=5){for(const root of ['shoulder','elbow','wrist','hip','knee','ankle','toe'])[p[root+'L'],p[root+'R']]=[p[root+'R'],p[root+'L']];}
    return p;
  }
  function distance(point,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy);}
  function bounds(ctx,w,h,threshold=96){
    const d=ctx.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>threshold){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    return x1<0?null:[x0,y0,x1-x0+1,y1-y0+1];
  }
  function cut(image,row){
    const sw=image.width/4,sh=image.height/2,cell=canvas(Math.ceil(sw),Math.ceil(sh)),c=cell.getContext('2d');
    c.drawImage(image,(row%4)*sw,Math.floor(row/4)*sh,sw,sh,0,0,sw,sh);
    const bb=bounds(c,cell.width,cell.height);if(!bb)throw Error('Empty source view '+row);
    const normalized=canvas(),g=normalized.getContext('2d'),height=184,width=bb[2]/bb[3]*height;
    g.drawImage(cell,...bb,128-width/2,46,width,height);
    const raw=g.getImageData(0,0,256,256),bind=landmarks(row),outputs={};
    const layers=bones.map(()=>g.createImageData(256,256));
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const i=(y*256+x)*4;if(!raw.data[i+3])continue;
      const scores=bones.map(([,a,b,slot,widthBone])=>(slot==='body')===(y<79)?distance([x,y],bind[a],bind[b])/widthBone:Infinity);
      const best=Math.min(...scores);
      scores.forEach((score,n)=>{if(score<=best+.13)for(let z=0;z<4;z++)layers[n].data[i+z]=raw.data[i+z];});
    }
    for(const [n,[name,,,slot]] of bones.entries()){
      const out=canvas(),og=out.getContext('2d'),data=layers[n];
      og.putImageData(data,0,0);const rect=bounds(og,256,256,0);
      if(!rect){outputs[name]={image:canvas(1,1),offset:[0,0],bind,slot};continue;}
      const trimmed=canvas(rect[2],rect[3]);trimmed.getContext('2d').drawImage(out,...rect,0,0,rect[2],rect[3]);
      outputs[name]={image:trimmed,offset:rect.slice(0,2),bind,slot};
    }
    return outputs;
  }
  function completePart(part,bone,master){
    const [name,a,b]=bone,bind=part.bind,A=bind[a],B=bind[b];
    const cfg=spec.concealedArt.bones[name];if(!cfg)return part;
    const paint=master[cfg.cell],c=canvas(),g=c.getContext('2d');
    const angle=Math.atan2(B[1]-A[1],B[0]-A[0])-Math.PI/2,length=Math.hypot(B[0]-A[0],B[1]-A[1]);
    g.save();g.translate(A[0],A[1]);g.rotate(angle);
    const region=cfg.region||[0,0,1,1];g.drawImage(paint,region[0]*paint.width,region[1]*paint.height,region[2]*paint.width,region[3]*paint.height,-cfg.width/2,-cfg.overlap,cfg.width,length+cfg.overlap*2);g.restore();
    if(name.startsWith('upper')){const shoulder=master[7];g.drawImage(shoulder,A[0]-4.5,A[1]-4,9,8);}
    g.drawImage(part.image,...part.offset);const rect=bounds(g,256,256,0);if(!rect)throw Error('Empty completed part');
    const image=canvas(rect[2],rect[3]);image.getContext('2d').drawImage(c,...rect,0,0,rect[2],rect[3]);
    return {...part,visibleImage:part.image,visibleOffset:part.offset,image,offset:rect.slice(0,2),completed:true};
  }
  async function loadImage(path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Image missing '+path));im.src=ROOT+path;});}
  function extractProp(image,col,row,columns,rows){
    const w=image.width/columns,h=image.height/rows,c=canvas(Math.ceil(w),Math.ceil(h)),g=c.getContext('2d');
    g.drawImage(image,col*w,row*h,w,h,0,0,w,h);const b=bounds(g,c.width,c.height,16);if(!b)throw Error('Empty prop');
    const out=canvas(b[2],b[3]);out.getContext('2d').drawImage(c,...b,0,0,b[2],b[3]);return out;
  }
  function load(){
    if(promise)return promise;
    promise=(async()=>{
      const response=await fetch(ROOT+'rig.json');if(!response.ok)throw Error('Missing rig.json');spec=await response.json();
      if(spec.boneDefinitions){bones.splice(0,bones.length,...spec.boneDefinitions);}
      if(spec.bindLandmarks){
        if(spec.bindLandmarks.length!==8)throw Error('Rig requires eight bind views');
        for(const view of spec.bindLandmarks)for(const [,a,b] of bones)for(const key of [a,b])if(!view[key]?.every(Number.isFinite))throw Error('Invalid bind landmark '+key);
      }
      const compiled=await fetch(ROOT+'compiled.json').then(r=>r.ok?r.json():null).catch(()=>null);
      if(compiled&&!magicCo('magicAuthor')){
        for(const [key,views] of Object.entries(compiled.parts)){
          const atlas=await loadImage(compiled.atlases[key]),visible=compiled.visibleAtlases?.[key]?await loadImage(compiled.visibleAtlases[key]):null;parts[key]=views.map((view,row)=>Object.fromEntries(Object.entries(view).map(([name,item])=>{
            const image=canvas(item.rect[2],item.rect[3]);image.getContext('2d').drawImage(atlas,...item.rect,0,0,item.rect[2],item.rect[3]);const original=visible&&item.visibleRect?canvas(item.visibleRect[2],item.visibleRect[3]):null;if(original)original.getContext('2d').drawImage(visible,...item.visibleRect,0,0,item.visibleRect[2],item.visibleRect[3]);return [name,{image,offset:item.offset,slot:item.slot,bind:landmarks(row),visibleImage:original,visibleOffset:item.visibleOffset,completed:!!original}];
          })));
        }
      }else for(const [key,path] of Object.entries(spec.art)){images[key]=await loadImage(path);parts[key]=Array.from({length:8},(_,row)=>cut(images[key],row));}
      if(spec.concealedArt){
        for(const [asset,file] of Object.entries(spec.concealedArt.sources)){
          const im=await loadImage(file);concealedArt[asset]=Array.from({length:16},(_,cell)=>extractProp(im,cell%4,Math.floor(cell/4),4,4));
          if(!compiled||magicCo('magicAuthor'))parts[asset]=parts[asset].map((view,row)=>Object.fromEntries(Object.entries(view).map(([name,p])=>{
            const back=row>=3&&row<=5,masters=concealedArt[asset].slice(back?8:0,back?16:8);return [name,completePart(p,bones.find(b=>b[0]===name),masters)];
          })));
        }
      }
      for(const [asset,views] of Object.entries(parts))for(const view of views)for(const part of Object.values(view))part.asset=asset;
      for(const key of ['weapons','wings','effects'])if(spec[key+'Art'])images[key]=await loadImage(spec[key+'Art']);
      if(images.weapons){
        props.weapons=Array.from({length:7},(_,i)=>extractProp(images.weapons,i,0,7,1));
        // Locate the solid handle cross-section rather than guessing palm offsets.
        spec.weaponGripRatio=props.weapons.map(im=>{
          const data=im.getContext('2d').getImageData(0,0,im.width,im.height).data,y=Math.floor(im.height*.85),xs=[];
          for(let x=0;x<im.width;x++)if(data[(y*im.width+x)*4+3]>180)xs.push(x);
          if(!xs.length)throw Error('Weapon handle has no solid grip row');
          return [(xs[0]+xs.at(-1))/2/im.width,.85];
        });
      }
      if(images.wings)props.wings=Array.from({length:4},(_,i)=>extractProp(images.wings,i%2,Math.floor(i/2),2,2));
      if(spec.jointUnderpaint){const cfg=spec.jointUnderpaint;images.underpaint=await loadImage(cfg.source);props.underpaint=cfg.patches.map(p=>extractProp(images.underpaint,p.cell%cfg.columns,Math.floor(p.cell/cfg.columns),cfg.columns,cfg.rows));}
      if(images.effects)props.effects=Array.from({length:7},(_,i)=>extractProp(images.effects,i%4,Math.floor(i/4),4,2));
      Object.assign(M,{ready:true,spec,parts});return M;
    })();return promise;
  }
  function enhanced(image,level,part=null,bone=null){
    if(level<9)return image;const key=level+':'+(bone?bone[0]:'prop');
    let levels=highlight.get(image);if(!levels){levels=new Map();highlight.set(image,levels);}if(levels.has(key))return levels.get(key);
    const out=canvas(image.width,image.height),g=out.getContext('2d');g.drawImage(image,0,0);
    const d=g.getImageData(0,0,out.width,out.height),power=level===9?.18:level===10?.3:.44;
    for(let i=0;i<d.data.length;i+=4)if(d.data[i+3]&&Math.max(...d.data.slice(i,i+3))>100){
      if(bone?.[0].startsWith('upper')){
        const r=d.data[i],green=d.data[i+1],b=d.data[i+2],a=part.bind[bone[1]],end=part.bind[bone[2]];
        const x=(i/4)%image.width+part.offset[0],y=Math.floor(i/4/image.width)+part.offset[1],dx=end[0]-a[0],dy=end[1]-a[1];
        const t=((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy);
        // Exposed upper arm skin below the shoulder plate keeps its base material.
        if(t>(part.asset==='vai_tho'?0:.4)&&r>green+12&&green>b+8&&b>green*.65&&r<green*1.75)continue;
      }
      for(let k=0;k<3;k++)d.data[i+k]=Math.min(255,d.data[i+k]+(255-d.data[i+k])*power);
    }
    g.putImageData(d,0,0);levels.set(key,out);return out;
  }
  function drawBone(g,part,bone,screen,level){
    const [,ak,bk]=bone,a=part.bind[ak],b=part.bind[bk],A=screen[ak],B=screen[bk];
    const sourceAngle=Math.atan2(b[1]-a[1],b[0]-a[0]),destAngle=Math.atan2(B[1]-A[1],B[0]-A[0]);
    const ratio=Math.hypot(B[0]-A[0],B[1]-A[1])/Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1]));
    g.save();g.translate(A[0],A[1]);g.rotate(destAngle);g.scale(ratio,1);g.rotate(-sourceAngle);
    g.drawImage(enhanced(part.image,level,part,bone),part.offset[0]-a[0],part.offset[1]-a[1]);g.restore();
  }
  function drawJointUnderpaint(g,P,patch,index,side){
    const key=patch.joint+side,at=P.screen[key],im=props.underpaint[index];
    const next={shoulder:'elbow',elbow:'wrist',wrist:'elbow',hip:'knee',knee:'ankle',ankle:'knee'}[patch.joint]+side;
    const to=P.screen[next],angle=Math.atan2(to[1]-at[1],to[0]-at[0])-Math.PI/2;
    g.save();g.translate(at[0],at[1]);g.rotate(angle);
    g.drawImage(im,-patch.size[0]/2,-patch.size[1]/2,...patch.size);g.restore();
  }
  function wingPose(P,side,phase){
    if(P.physicsWings?.[side])return P.physicsWings[side];
    const sign=side==='L'?-1:1;
    // Stop flapping during the fall and fold into a resting silhouette.
    const flap=P.state==='death'?lerp(phase,0,clamp(P.fall*2,0,1)):phase;
    const angle=P.angle+(P.twist||0)+sign*(.28+Math.sin(flap)*.28),lean=P.lean+P.arch;
    // A curved wing retains a narrow silhouette when viewed edge-on. Keep
    // the camera-facing sign stable throughout a flap, rather than mirror
    // the painted surface as cos(angle) crosses zero.
    const facing=Math.cos(P.angle)<-.1?-1:1;
    const span=facing*(.18+.82*Math.abs(Math.cos(angle)));
    const offset=project(rotateX([sign*5,0,0],lean),P.angle),origin=project([0,0,0],P.angle);
    return {root:[P.screen.wing[0]+offset[0]-origin[0],P.screen.wing[1]+offset[1]-origin[1]],
      transform:[span,-Math.sin(angle)*.42,0,P.state==='death'?Math.max(.24,.95*Math.cos(lean)-.42*Math.sin(lean)):.95*Math.cos(lean)-.42*Math.sin(lean)],
      width:112,height:74,pivot:[side==='L'?.96:.04,.94]};
  }
  function drawWing(g,P,side,index,phase){
    const im=props.wings[index*2+(side==='L'?0:1)],W=wingPose(P,side,phase);
    g.save();g.translate(...W.root);g.transform(...W.transform,0,0);
    g.drawImage(im,-W.pivot[0]*W.width,-W.pivot[1]*W.height,W.width,W.height);g.restore();
  }
  function weaponPose(P,side){
    if(P.physicsWeapons?.[side])return P.physicsWeapons[side];
    const sign=side==='L'?-1:1,town=['idle','walk','run'].includes(P.state),wrist=P.screen['wrist'+side],elbow=P.screen['elbow'+side];
    if(town){
      // Backpack mounts and blade axes belong to the torso's local space.
      // Retarget around the painted spine after projecting the world points.
      const local=v=>add(P.joints.spine,rotateX(v,P.lean+P.arch));
      const mount=project(local([sign*12,13,-8]),P.angle),tip=project(local([-sign*28,-52,-8]),P.angle);
      const spine=project(P.joints.spine,P.angle),dx=tip[0]-mount[0],dy=tip[1]-mount[1];
      return {xy:[P.screen.spine[0]+mount[0]-spine[0],P.screen.spine[1]+mount[1]-spine[1]],
        angle:Math.atan2(dy,dx)+Math.PI/2,length:Math.hypot(dx,dy),depth:mount[2],carry:'back'};
    }
    if(P.state==='death'&&P.frame>=4){
      // Sample release once in model/world space, never from the falling
      // pelvis. An analytic gravity arc stops at the floor and holds still.
      const release=pose('death',P.row,3),rest=pose('idle',P.row,0),key='wrist'+side;
      const start=release.joints[key],dt=[0,.16,.32,.32][P.frame-4],ground=6;
      const hitTime=Math.sqrt(Math.max(0,2*(start[1]-ground)/2200)),time=Math.min(dt,hitTime);
      const point=add(start,[sign*14*time,-1100*time*time,12*time]);point[1]=Math.max(ground,point[1]);
      const at=project(point,P.angle),neutral=project(rest.joints[key],P.angle),bind=landmarks(P.row)[key];
      const tip=project(add(point,[-sign*60,0,25]),P.angle),dx=tip[0]-at[0],dy=tip[1]-at[1];
      const delta=sub(release.joints[key],release.joints['elbow'+side]);
      const initialTip=project(add(start,mul(delta,80/34)),P.angle),initial=project(start,P.angle);
      const initialAngle=Math.atan2(initialTip[1]-initial[1],initialTip[0]-initial[0])+Math.PI/2;
      const endAngle=Math.atan2(dy,dx)+Math.PI/2,blend=clamp(time/Math.max(.001,hitTime),0,1);
      const shortest=Math.atan2(Math.sin(endAngle-initialAngle),Math.cos(endAngle-initialAngle));
      return {xy:[bind[0]+at[0]-neutral[0]+(P.weaponShift?.[0]||0),bind[1]+at[1]-neutral[1]+(P.weaponShift?.[1]||0)],angle:initialAngle+shortest*blend,
        length:lerp(Math.max(28,Math.hypot(initialTip[0]-initial[0],initialTip[1]-initial[1])),Math.hypot(dx,dy),blend),
        depth:-99,carry:'dropped',world:point,grounded:dt>=hitTime};
    }
    const delta=sub(P.joints['wrist'+side],P.joints['elbow'+side]),tip=project(add(P.joints['wrist'+side],mul(delta,80/34)),P.angle),rawWrist=project(P.joints['wrist'+side],P.angle);
    const dx=tip[0]-rawWrist[0],dy=tip[1]-rawWrist[1];
    return {xy:wrist.slice(0,2),angle:Math.atan2(dy,dx)+Math.PI/2,length:Math.max(28,Math.hypot(dx,dy)),depth:(wrist[2]+elbow[2])/2,carry:'hand'};
  }
  function drawWeapon(g,P,side,index,level){
    const im=enhanced(props.weapons[index],level),W=weaponPose(P,side),ratio=spec.weaponGripRatio?.[index]||[.5,.88],height=W.length,width=Math.min(43,im.width/im.height*height);
    g.save();g.translate(...W.xy);g.rotate(W.angle);g.drawImage(im,-width*ratio[0],-height*ratio[1],width,height);g.restore();
    // Paint the genuine glove texels over the hilt at the exact palm socket.
    if(W.carry==='hand'&&!P.only){
      const armor=P.equip.gloves??P.equip.armor??'ma_thuat',part=(parts[armor]||parts.body)[P.view]['lower'+side];
      g.save();g.beginPath();g.arc(...W.xy,4.2,0,TAU);g.clip();drawBone(g,part,bones.find(b=>b[0]==='lower'+side),P.screen,P.equip.levels?.gloves??P.equip.level??0);g.restore();
    }
    return W;
  }
  function drawVfx(g,P){
    if(!props.effects)return;const index=spec.states.indexOf(P.state)-7;if(index<0)return;
    const intensity=[0,.25,.8,1,.9,.65,.25,0][P.frame];if(!intensity)return;
    const im=props.effects[index],size=(P.state==='lightStorm'?184:145)*(.6+.4*intensity),center=P.state==='lightStorm'?P.screen.pelvis:P.screen.spine;
    const scale=size/Math.max(im.width,im.height),w=im.width*scale,h=im.height*scale;
    const forward=rotateY([0,0,1],P.angle),direction=Math.atan2(forward[2]*.42,forward[0]);
    g.save();g.globalAlpha=intensity;g.translate(center[0],center[1]);
    g.rotate(P.state==='thrust'?direction+Math.PI/2:P.state==='fireDashSlash'?direction:Math.sin(P.angle)*.35);
    g.drawImage(im,-w/2,-h/2,w,h);g.restore();
  }
  function render(g,state,row,frame,equip={},options={}){
    if(!M.ready)return null;
    const mode=options.attackMode??equip.attackMode??(equip.wing===null?'ground':'air');
    const P=pose(state,row,frame,mode),only=options.onlySlot;
    // Retarget each painted camera view to its own measured bind landmarks.
    // World joint lengths remain fixed; neutral art reconstructs without camera drift.
    const rest=pose('idle',P.view,0),bind=landmarks(P.view),projected={};
    for(const [key,point] of Object.entries(P.screen)){
      if(bind[key]){const neutral=project(rest.joints[key],P.angle);projected[key]=[bind[key][0]+point[0]-neutral[0],bind[key][1]+point[1]-neutral[1],point[2]];}
      else projected[key]=point;
    }
    // Retarget locomotion to the game's flat XY ground plane. Camera depth's .42
    // foreshortening must not change the stride with direction. This is cutout
    // screen-space retargeting, not a new 3D projection or rigid-body simulation.
    if(state==='walk'||state==='run'){
      const heading=Number.isFinite(options.gaitHeading)?options.gaitHeading:Math.PI/2+row*Math.PI/4;
      const forward=[Math.cos(heading),Math.sin(heading)];
      for(const side of ['L','R']){
        const z=P.joints['ankle'+side][2],raw=[Math.sin(P.angle)*z,.42*Math.cos(P.angle)*z];
        const correction=forward.map((v,i)=>v*z*M.gait.groundScale-raw[i]);
        for(const [joint,weight] of [['ankle',1],['toe',1],['knee',.5]])for(let i=0;i<2;i++)projected[joint+side][i]+=correction[i]*weight;
      }
    }
    if(state==='spinSlash'&&mode==='ground'){
      const base=landmarks(row),baseRest=pose('idle',row,0);
      for(const side of ['L','R'])if(P.joints['contact'+side]){
        const neutral=project(baseRest.joints['ankle'+side],-row*Math.PI/4),at=project(P.joints['ankle'+side],P.angle);
        const target=base['ankle'+side].map((v,i)=>v+at[i]-neutral[i]),delta=target.map((v,i)=>v-projected['ankle'+side][i]);
        for(const [joint,weight] of [['ankle',1],['toe',1],['knee',.5]])for(let i=0;i<2;i++)projected[joint+side][i]+=delta[i]*weight;
      }
    }
    P.screen=projected;
    // Game may resolve a planted sole against actor translation before any
    // layer is drawn. Offline exports use the authored local contact poses.
    if(options.poseFilter)options.poseFilter(P);
    P.equip=equip;P.only=only;
    const defaultArmor=equip.armor||'ma_thuat',levels=equip.levels||{},pieces=[];
    for(const bone of bones){
      const [name,a,b,slot]=bone,depth=(P.screen[a][2]+P.screen[b][2])/2;
      if(!only||only==='body')pieces.push({bone,part:parts.body[P.view][name],level:0,depth,order:0});
      const armor=Object.hasOwn(equip,slot)?equip[slot]:defaultArmor;
      if(slot!=='body'&&parts[armor]&&(!only||only===slot))pieces.push({bone,part:options.concealed===false&&parts[armor][P.view][name].visibleImage?{...parts[armor][P.view][name],image:parts[armor][P.view][name].visibleImage,offset:parts[armor][P.view][name].visibleOffset}:parts[armor][P.view][name],level:levels[slot]??equip.level??0,depth,order:1});
    }
    // Painted, complete joint surfaces sit behind their adjoining body segments.
    // Body ownership is independent of equipment, so gear swaps cannot alter it.
    if(options.underpaint!==false&&props.underpaint&&(!only||only==='body')){
      const underpaintDepth=Math.min(...pieces.map(piece=>piece.depth))-.001;
      spec.jointUnderpaint.patches.forEach((patch,index)=>{
        for(const side of ['L','R'])pieces.push({depth:underpaintDepth,order:-2,draw:ctx=>drawJointUnderpaint(ctx,P,patch,index,side)});
      });
    }
    const wing=Object.hasOwn(equip,'wing')?equip.wing:1,weapon=Object.hasOwn(equip,'weapon')?equip.weapon:2;
    const phase=options.wingPhase??M.wingPhase(options.timeMs??P.frame*250);
    if(options.props!==false&&props.wings&&wing!==null)for(const side of ['L','R'])if(!only||only==='wing'||only==='wing'+side)pieces.push({depth:P.screen.wing[2],order:-1,draw:ctx=>drawWing(ctx,P,side,wing,phase)});
    if(options.props!==false&&props.weapons&&weapon!==null)for(const side of ['L','R'])if(!only||only==='weapon'+side){const W=weaponPose(P,side);pieces.push({depth:W.depth,order:2,draw:ctx=>drawWeapon(ctx,P,side,weapon,equip.level??0)});}
    pieces.sort((a,b)=>a.depth-b.depth||a.order-b.order);
    g.save();if(!options.raw){g.translate(...spec.camera.offset);g.scale(spec.camera.scale,spec.camera.scale);}
    for(const piece of pieces)if(piece.draw)piece.draw(g);else drawBone(g,piece.part,piece.bone,P.screen,piece.level);
    if(options.vfx!==false&&(!only||only==='vfx'))drawVfx(g,P);
    g.restore();
    const toScreen=p=>[spec.camera.offset[0]+p[0]*spec.camera.scale,spec.camera.offset[1]+p[1]*spec.camera.scale];
    P.underpaintJoints=props.underpaint?spec.jointUnderpaint.patches.flatMap(p=>['L','R'].map(side=>p.joint+side)):[];
    P.handSockets={left:toScreen(P.screen.wristL),right:toScreen(P.screen.wristR)};P.wingSocket=toScreen(P.screen.wing);
    P.weapons={};for(const side of ['L','R']){const W=weaponPose(P,side);P.weapons[side]={...W,xy:toScreen(W.xy)};}
    delete P.equip;delete P.only;
    return P;
  }
  function compile(){
    const result={version:1,parts:{},atlases:{},images:{},enhancements:{},weaponSprites:{},visibleAtlases:{},concealedMasters:{}};
    for(const [key,views] of Object.entries(parts)){
      let x=2,y=2,lineHeight=0;const records=[];
      for(let row=0;row<8;row++)for(const [name,p] of Object.entries(views[row])){
        if(x+p.image.width+2>512){x=2;y+=lineHeight+2;lineHeight=0;}
        records.push({row,name,part:p,rect:[x,y,p.image.width,p.image.height]});x+=p.image.width+2;lineHeight=Math.max(lineHeight,p.image.height);
      }
      const height=2**Math.ceil(Math.log2(y+lineHeight+2)),atlas=canvas(512,height),g=atlas.getContext('2d');result.parts[key]=Array.from({length:8},()=>({}));
      for(const {row,name,part,rect} of records){g.drawImage(part.image,rect[0],rect[1]);result.parts[key][row][name]={rect,offset:part.offset,slot:part.slot};}
      result.atlases[key]='parts/'+key+'.png';result.images[key]=atlas.toDataURL('image/png');
      if(views[0].torsoUpper.visibleImage){
        let vx=2,vy=2,vh=0;const originals=[];
        for(let row=0;row<8;row++)for(const [name,p] of Object.entries(views[row]))if(p.visibleImage){
          const im=p.visibleImage;if(vx+im.width+2>512){vx=2;vy+=vh+2;vh=0;}const rect=[vx,vy,im.width,im.height];originals.push({row,name,part:p,rect});vx+=im.width+2;vh=Math.max(vh,im.height);
        }
        const originalAtlas=canvas(512,2**Math.ceil(Math.log2(vy+vh+2))),og=originalAtlas.getContext('2d');
        for(const {row,name,part,rect} of originals){og.drawImage(part.visibleImage,rect[0],rect[1]);Object.assign(result.parts[key][row][name],{visibleRect:rect,visibleOffset:part.visibleOffset});}
        const id=key+'_visible';result.visibleAtlases[key]='parts/'+id+'.png';result.atlases[id]=result.visibleAtlases[key];result.images[id]=originalAtlas.toDataURL('image/png');
      }
      if(key!=='body'){
        result.enhancements[key]={0:result.atlases[key]};
        for(const level of [9,10,11]){
          g.clearRect(0,0,atlas.width,atlas.height);
          for(const {name,part,rect} of records)g.drawImage(enhanced(part.image,name==='head'?0:level,part,bones.find(b=>b[0]===name)),rect[0],rect[1]);
          const id=key+'_plus'+level;result.atlases[id]='parts/'+id+'.png';result.images[id]=atlas.toDataURL('image/png');result.enhancements[key][level]=result.atlases[id];
        }
      }
    }
    if(props.weapons)for(let index=0;index<7;index++){
      const id=spec.weapons[index],im=props.weapons[index],w=Math.round(im.width/im.height*256);result.weaponSprites[id]={gripRatio:spec.weaponGripRatio[index],levels:{}};
      for(const level of [0,9,10,11]){
        const c=canvas(w,256);c.getContext('2d').drawImage(enhanced(im,level),0,0,w,256);
        const key=id+'_master_plus'+level;result.atlases[key]='weapon-master/'+key+'.png';result.images[key]=c.toDataURL('image/png');result.weaponSprites[id].levels[level]=result.atlases[key];
      }
    }
    for(const [asset,masters] of Object.entries(concealedArt)){
      result.concealedMasters[asset]=[];masters.forEach((im,cell)=>{const key='concealed_'+asset+'_'+cell,file='concealed-master/'+asset+'/'+String(cell).padStart(2,'0')+'.png';result.atlases[key]=file;result.images[key]=im.toDataURL('image/png');result.concealedMasters[asset].push(file);});
    }
    if(props.underpaint){result.underpaintSprites={};spec.jointUnderpaint.patches.forEach((patch,index)=>{
      const key='joint_'+patch.joint;result.atlases[key]='joint-underpaint/'+patch.joint+'.png';result.images[key]=props.underpaint[index].toDataURL('image/png');result.underpaintSprites[patch.joint]={file:result.atlases[key],size:patch.size};
    });}
    return result;
  }
  M.wingPhase=timeMs=>((Math.floor(timeMs/250)%8+8)%8)/8*TAU;
  M.timing={wingCycleMs:2000,wingStepMs:250};
  M.gait={groundScale:1.8,stride:{walk:23,run:38},stance:{walk:.625,run:.375}};M.load=load;M.render=render;M.pose=pose;M.wingPose=wingPose;M.bones=bones;M.landmarks=landmarks;M.compile=compile;
  window.MagicRebuild=M;if(M.enabled)load().catch(error=>{M.error=error.message;console.error(error);});
})();
