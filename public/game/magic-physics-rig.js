(function(){
 'use strict';
 const F=window.MagicPhysics,{add,sub,mul,len}=F,actors=new WeakMap();
 const rotate=(v,a)=>[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];
 const project=v=>[v[0],-.95*v[1]+.42*v[2],v[2]];
 const unit=v=>mul(v,1/(len(v)||1));
 function create(P,origin,gear,options){
  const world=new F.World(options),nodes={},edges=window.MagicRebuild.bones;
  for(const [name,v] of Object.entries(P.joints))if(Array.isArray(v)&&v.length===3){const mass=name==='spine'?16:name==='pelvis'?12:name==='head'?5:name.startsWith('knee')?5:name.startsWith('hip')?4:name.startsWith('elbow')?2.5:1.2;const radius=['spine','pelvis','head'].includes(name)?9:name.startsWith('toe')?2:4;nodes[name]=world.particle(name,add(rotate(v,P.angle),origin),mass*(options.massScale||1),radius);}
  for(const [,a,b] of edges)world.distance(nodes[a],nodes[b]);
  for(const [a,b] of [['shoulderL','shoulderR'],['hipL','hipR'],['shoulderL','hipR'],['shoulderR','hipL'],['neck','pelvis'],['shoulderL','neck'],['shoulderR','neck'],['hipL','pelvis'],['hipR','pelvis'],['wing','neck'],['wing','spine']])world.distance(nodes[a],nodes[b]);
  for(const side of ['L','R'])for(const [a,b,min,max] of [['shoulder','wrist',10,67.8],['hip','ankle',12,83.8]]){const c=world.distance(nodes[a+side],nodes[b+side]);c.min=min;c.max=max;c.restMin=min;c.deathMin=a==='hip'?72:58;}
  const props={weapons:{},wings:{}};
  for(const side of ['L','R']){
   const wrist=nodes['wrist'+side],elbow=nodes['elbow'+side],axis=unit(sub(wrist.x,elbow.x));
   if(gear.weapon!==null){const town=['idle','walk','run'].includes(P.state),sign=side==='L'?-1:1,mount=town?add(nodes.spine.x,rotate([sign*12,13,-18],P.angle)):wrist.x,initialAxis=town?unit(rotate([-sign*40,-65,0],P.angle)):axis;const points=[0,40,80].map((d,i)=>world.particle('weapon'+side+i,add(mount,mul(initialAxis,d)),[.5,2,.5][i]*(options.massScale||1),2));world.distance(points[0],points[1],40);world.distance(points[1],points[2],40);world.distance(points[0],points[2],80);const grip=world.distance(points[0],wrist,0,1e-7);props.weapons[side]={points,grip,released:false};}
   if(gear.wing!==null){const sign=side==='L'?-1:1,root=nodes.wing.x,points=[root,add(root,rotate([sign*108,0,-30],P.angle)),add(root,rotate([0,70,0],P.angle))].map((v,i)=>world.particle('wing'+side+i,v,[.3,1.1,.6][i]*(options.massScale||1),3));world.distance(points[0],points[1]);world.distance(points[0],points[2]);world.distance(points[1],points[2]);world.distance(points[0],nodes.wing,0,1e-7);props.wings[side]={points,sign};}
  }
  const colliding=[];const segments=[...Object.values(props.weapons).flatMap(w=>[{a:w.points[0],b:w.points[1],radius:2},{a:w.points[1],b:w.points[2],radius:2}]),...Object.values(props.wings).map(w=>({a:w.points[1],b:w.points[2],radius:3}))];
  for(const [a,b,radius] of [['pelvis','spine',10],['spine','neck',9],['neck','head',9],['hipL','kneeL',5],['hipR','kneeR',5]])world.capsules.push({a:nodes[a],b:nodes[b],radius,test:colliding,segments});
  return {world,nodes,props,origin,lastTime:null,gearKey:JSON.stringify([gear.weapon,gear.wing,options.massScale,options.collision,options.gravity]),map:null};
 }
 function filter(motion,gear,settings={}){
  const actor=motion.actor,now=(motion.time??performance.now())/1000,scale=motion.scale||1;
  return function(P){
   const origin=[(actor.x||0)/scale,motion.physicsHeight||settings.height||0,(actor.y||0)/(scale*.42)],key=JSON.stringify([gear.weapon,gear.wing,settings.massScale,settings.collision,settings.gravity]);
   let S=actors.get(actor);if(!S||S.gearKey!==key||S.map!==motion.map||S.scale!==scale||(S.dead&&P.state!=='death')||len(sub(origin,S.origin))>250||now<S.lastTime){S=create(P,origin,gear,settings);S.map=motion.map;S.scale=scale;actors.set(actor,S);}
   const {world,nodes,props}=S,dead=P.state==='death';
   if(dead&&!S.dead&&settings.deathImpulse!==false){const mass=world.particles.reduce((m,p)=>m+p.mass,0),center=world.particles.reduce((sum,p)=>add(sum,mul(p.x,p.mass/mass)),[0,0,0]),net=[0,0,0];for(const p of world.particles){const relative=sub(p.x,center),local=rotate(relative,-P.angle),velocity=rotate([2.2*local[1],-2.2*local[0],0],P.angle),impulse=mul(velocity,p.mass);world.impulse(p,impulse);for(let i=0;i<3;i++)net[i]+=impulse[i];}S.deathKick={netLinearImpulse:net,angularSpeed:2.2};}
   S.dead=dead;for(const c of world.constraints)if(c.restMin!==undefined)c.min=dead?c.deathMin:c.restMin;
   for(const [name,p] of Object.entries(nodes)){const target=add(rotate(P.joints[name],P.angle),origin);world.motor(p,target,dead?0:3000,dead?0:170);if(!dead&&P.air)p.force[1]+=p.mass*981;}
   for(const [side,W] of Object.entries(props.weapons)){
    const wrist=nodes['wrist'+side],elbow=nodes['elbow'+side],town=['idle','walk','run'].includes(P.state),sign=side==='L'?-1:1;
    W.grip.b=town?nodes.spine:wrist;W.grip.offset=town?rotate([sign*12,13,-18],P.angle):[0,0,0];
    if(dead&&P.frame>=3){W.grip.enabled=false;W.released=true;}
    if(W.released)for(const p of W.points)world.motor(p,p.x,0,0);
    else{const axis=town?unit(rotate([-sign*40,-65,0],P.angle)):unit(sub(wrist.x,elbow.x)),mount=add(W.grip.b.x,W.grip.offset);for(let i=1;i<3;i++)world.motor(W.points[i],add(mount,mul(axis,i*40)),500,30);W.carry=town?'back':'hand';}
   }
   const phase=now*Math.PI;
   for(const [side,W] of Object.entries(props.wings)){
    const root=nodes.wing.x,angle=P.angle+W.sign*(.28+Math.sin(phase)*.28);
    world.motor(W.points[1],add(root,rotate([W.sign*108,0,-30],angle)),dead?0:260,dead?0:22);
    world.motor(W.points[2],add(root,rotate([0,70,0],P.angle)),dead?0:260,dead?0:22);
   }
   const dt=S.lastTime===null?1/120:Math.max(0,now-S.lastTime);world.advance(dt);S.lastTime=now;S.origin=origin;
   const screenAt=(worldPoint)=>{const q=project(sub(worldPoint,origin));return q;};
   for(const [name,p] of Object.entries(nodes)){
    const before=project(rotate(P.joints[name],P.angle)),after=screenAt(p.x);
    if(P.screen[name])P.screen[name]=add(P.screen[name],sub(after,before));
    P.joints[name]=rotate(sub(p.x,origin),-P.angle);
   }
   const drawPoint=(point,anchor)=>add(P.screen[anchor],sub(screenAt(point),screenAt(nodes[anchor].x)));
   P.physicsWeapons={};P.physicsWings={};
   for(const [side,W] of Object.entries(props.weapons)){const a=drawPoint(W.points[0].x,'wrist'+side),b=drawPoint(W.points[2].x,'wrist'+side),delta=sub(b,a);P.physicsWeapons[side]={xy:a.slice(0,2),angle:Math.atan2(delta[1],delta[0])+Math.PI/2,length:len(delta.slice(0,2)),depth:a[2],carry:W.released?'dropped':W.carry,grounded:W.points.some(p=>p.x[1]<=p.radius+.05),world:W.points[0].x.slice()};}
   for(const [side,W] of Object.entries(props.wings)){const a=drawPoint(W.points[0].x,'wing'),b=drawPoint(W.points[1].x,'wing'),c=drawPoint(W.points[2].x,'wing'),u=mul(sub(b,a),1/(W.sign*108)),v=mul(sub(c,a),-1/70);P.physicsWings[side]={root:a.slice(0,2),transform:[u[0],u[1],v[0],v[1]],width:112,height:74,pivot:[side==='L'?.96:.04,.94]};}
   for(const side of ['L','R'])P.joints['contact'+side]=nodes['ankle'+side].x[1]<=nodes['ankle'+side].radius+.1;
   P.physics=world.metrics();P.physics.dynamic=true;P.physics.deathKick=S.deathKick;P.physics.release=Object.fromEntries(Object.entries(props.weapons).map(([side,w])=>[side,w.released]));
  };
 }
 window.MagicPhysicsRig={filter,actors,enabled:new URLSearchParams(location.search).has('magicPhysics'),reset:actor=>actors.delete(actor),impulse(actor,name,impulse){const S=actors.get(actor);if(S?.nodes[name])S.world.impulse(S.nodes[name],impulse);}};
})();
