/* Checkpoint 14: centimetres, kilograms, seconds. Fixed-step XPBD dynamics.
 * Animation supplies motor targets, never overwrites simulated positions.
 * Reduced particle/rigid-segment colliders; no aerodynamic or mesh simulation. */
(function(root){
 'use strict';
 const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),len=a=>Math.hypot(...a);
 const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t),clamp=x=>Math.max(0,Math.min(1,x));
 // Exact closest points of two finite line segments, including parallel and
 // zero-length cases. Interior stationary point + four boundary minima.
 function closest(a,b,c,d){
  const u=sub(b,a),v=sub(d,c),w=sub(a,c),A=dot(u,u),B=dot(u,v),C=dot(v,v),D=dot(u,w),E=dot(v,w),den=A*C-B*B;
  const candidates=[[0,clamp(E/(C||1))],[1,clamp((E+B)/(C||1))],[clamp(-D/(A||1)),0],[clamp((B-D)/(A||1)),1]];
  if(den>1e-10){const s=(B*E-C*D)/den,t=(A*E-B*D)/den;if(s>=0&&s<=1&&t>=0&&t<=1)candidates.push([s,t]);}
  let best=null;for(const [s,t] of candidates){const delta=sub(mix(a,b,s),mix(c,d,t)),length=len(delta);if(!best||length<best.length)best={s,t,delta,length};}return best;
 }
 function separated(a,b,c,d,radius){for(let i=0;i<3;i++)if(Math.min(a[i],b[i])>Math.max(c[i],d[i])+radius||Math.max(a[i],b[i])<Math.min(c[i],d[i])-radius)return true;return false;}
 // Conservative advancement uses a bound on relative endpoint travel.
 // Fast crossings are detected even if both endpoints finish outside.
 function sweep(a,b,c,d,radius){
  for(let i=0;i<3;i++){const amin=Math.min(a.old[i],a.x[i],b.old[i],b.x[i]),amax=Math.max(a.old[i],a.x[i],b.old[i],b.x[i]),cmin=Math.min(c.old[i],c.x[i],d.old[i],d.x[i]),cmax=Math.max(c.old[i],c.x[i],d.old[i],d.x[i]);if(amin>cmax+radius||amax<cmin-radius)return null;}
  const speed=Math.max(len(sub(a.x,a.old)),len(sub(b.x,b.old)))+Math.max(len(sub(c.x,c.old)),len(sub(d.x,d.old)));
  if(speed<radius*.2)return null;
  let time=0;const start=closest(a.old,b.old,c.old,d.old);if(start.length<=radius+.001)return null;
  for(let i=0;i<48&&time<=1;i++){
   const hit=closest(mix(a.old,a.x,time),mix(b.old,b.x,time),mix(c.old,c.x,time),mix(d.old,d.x,time));
   const gap=hit.length-radius;if(gap<.002){return {...hit,normal:mul(hit.delta,1/(hit.length||1)),toi:time};}
   time+=Math.max(1e-7,gap/speed*.95);
  }return null;
 }
 class World {
  constructor(options={}){this.options=Object.assign({gravity:[0,-981,0],step:1/120,iterations:12,collision:true,ccd:true,friction:.7,restitution:.08},options);this.particles=[];this.constraints=[];this.capsules=[];this.contacts=[];this.time=0;this.accumulator=0;this.steps=0;this.discardedTime=0;this.ccdHits=0;}
  particle(name,position,mass=1,radius=3){const p={name,x:position.slice(),v:[0,0,0],force:[0,0,0],mass,w:mass>0?1/mass:0,radius,target:null,stiffness:0,damping:0};this.particles.push(p);return p;}
  distance(a,b,length=len(sub(a.x,b.x)),compliance=0){const c={a,b,length,compliance,lambda:0,enabled:true};this.constraints.push(c);return c;}
  motor(p,target,stiffness=900,damping=60){p.target=target.slice();p.stiffness=stiffness;p.damping=damping;}
  impulse(p,j){if(p.w)p.v=add(p.v,mul(j,p.w));}
  advance(dt){if(!Number.isFinite(dt)||dt<0)return 0;const accepted=Math.min(dt,.1);this.discardedTime+=dt-accepted;this.accumulator+=accepted;let n=0;while(this.accumulator+1e-10>=this.options.step){this.tick(this.options.step);this.accumulator-=this.options.step;n++;}return n;}
  tick(h){
   const o=this.options;this.contacts=[];
   for(const p of this.particles){p.old=p.x.slice();if(!p.w)continue;
    const k=p.target?p.stiffness:0,d=p.target?p.damping:.15,den=1+h*d*p.w+h*h*k*p.w;
    p.v=p.v.map((v,i)=>(v+h*(o.gravity[i]+p.force[i]*p.w)+h*k*p.w*((p.target?.[i]??p.x[i])-p.x[i]))/den);
    p.predictedVelocity=p.v.slice();p.x=add(p.x,mul(p.v,h));p.force=[0,0,0];
   }
   for(const c of this.constraints)c.lambda=0;
   const touched=new Map();
   const swept=[];
   if(o.collision&&o.ccd)for(const cap of this.capsules){if(cap.enabled===false)continue;for(const segment of (cap.segments||[]).concat((cap.test||[]).map(p=>({a:p,b:p,radius:p.radius})))){const hit=sweep(segment.a,segment.b,cap.a,cap.b,segment.radius+cap.radius);if(hit){swept.push({segment,cap,hit});this.ccdHits++;}}}
   const resolve=(segment,cap,hit,depth,kind)=>{
    if(depth<=0)return;const a=segment.a,b=segment.b,c=cap.a,d=cap.b,s=hit.s,t=hit.t,n=hit.normal||(hit.length>1e-8?mul(hit.delta,1/hit.length):[0,0,1]);
    // A point is represented by the same endpoint twice; combine its weight.
    const weights=a===b?[a.w,0,c.w*(1-t),d.w*t]:[a.w*(1-s),b.w*s,c.w*(1-t),d.w*t];
    const den=a===b?a.w+c.w*(1-t)**2+d.w*t*t:a.w*(1-s)**2+b.w*s*s+c.w*(1-t)**2+d.w*t*t;if(!den)return;const dl=depth/den;
    for(const [p,w,sign] of [[a,weights[0],1],[b,weights[1],1],[c,weights[2],-1],[d,weights[3],-1]])for(let i=0;i<3;i++)p.x[i]+=n[i]*w*sign*dl;
    touched.set(a,{p:a,q:b,s:a===b?0:s,a:c,b:d,t,normal:n,depth,kind});
   };
   for(let iteration=0;iteration<o.iterations;iteration++){
    for(const c of this.constraints){if(!c.enabled)continue;const a=c.a,b=c.b,offset=c.offset,dx=a.x[0]-b.x[0]-(offset?offset[0]:0),dy=a.x[1]-b.x[1]-(offset?offset[1]:0),dz=a.x[2]-b.x[2]-(offset?offset[2]:0),L=Math.hypot(dx,dy,dz),w=a.w+b.w;if(L<1e-9||!w)continue;const target=c.min!==undefined?Math.max(c.min,Math.min(c.max,L)):c.length;if(c.min!==undefined&&target===L){c.lambda=0;continue;}const alpha=c.compliance/(h*h),dl=(-(L-target)-alpha*c.lambda)/(w+alpha),wa=a.w*dl/L,wb=b.w*dl/L;c.lambda+=dl;a.x[0]+=dx*wa;a.x[1]+=dy*wa;a.x[2]+=dz*wa;b.x[0]-=dx*wb;b.x[1]-=dy*wb;b.x[2]-=dz*wb;}
    if(o.collision){
     for(const p of this.particles)if(p.w&&p.x[1]<p.radius){const depth=p.radius-p.x[1];p.x[1]=p.radius;touched.set(p,{p,normal:[0,1,0],depth,kind:'floor'});}
     for(const cap of this.capsules){if(cap.enabled===false)continue;const ab=sub(cap.b.x,cap.a.x),ab2=dot(ab,ab);
      for(const p of cap.test||[]){if(!p.w||p===cap.a||p===cap.b||separated(p.x,p.x,cap.a.x,cap.b.x,p.radius+cap.radius))continue;const t=Math.max(0,Math.min(1,dot(sub(p.x,cap.a.x),ab)/(ab2||1))),near=add(cap.a.x,mul(ab,t)),delta=sub(p.x,near),L=len(delta),depth=p.radius+cap.radius-L;if(depth<=0)continue;
       const n=L>1e-8?mul(delta,1/L):[0,0,1],wa=cap.a.w*(1-t),wb=cap.b.w*t,den=p.w+wa*(1-t)+wb*t;if(!den)continue;const dl=depth/den;p.x=add(p.x,mul(n,p.w*dl));cap.a.x=sub(cap.a.x,mul(n,wa*dl));cap.b.x=sub(cap.b.x,mul(n,wb*dl));touched.set(p,{p,a:cap.a,b:cap.b,t,normal:n,depth,kind:'capsule'});
      }
      for(const segment of cap.segments||[]){if(separated(segment.a.x,segment.b.x,cap.a.x,cap.b.x,segment.radius+cap.radius))continue;const hit=closest(segment.a.x,segment.b.x,cap.a.x,cap.b.x);resolve(segment,cap,hit,segment.radius+cap.radius-hit.length,'segment');}
     }
     for(const {segment,cap,hit} of swept){const delta=sub(mix(segment.a.x,segment.b.x,hit.s),mix(cap.a.x,cap.b.x,hit.t));resolve(segment,cap,hit,segment.radius+cap.radius-dot(delta,hit.normal),'swept');}
    }
   }
   for(const p of this.particles)if(p.w)p.v=mul(sub(p.x,p.old),1/h);
   for(const c of touched.values()){
    const p=c.p,q=c.q||p,s=c.s||0,other=c.a?add(mul(c.a.v,1-c.t),mul(c.b.v,c.t)):[0,0,0],rel=sub(mix(p.v,q.v,s),other),vn=dot(rel,c.normal);
    const pre=mix(p.predictedVelocity||p.v,q.predictedVelocity||q.v,s),preN=dot(sub(pre,other),c.normal),bounce=preN< -20?-o.restitution*preN:0;
    const inverseMass=p.w*(1-s)**2+(q===p?0:q.w*s*s)+(c.a?c.a.w*(1-c.t)**2+c.b.w*c.t**2:0),normalChange=Math.max(0,bounce-vn),normalImpulse=normalChange/inverseMass,projectionImpulse=Math.max(0,vn-preN)/inverseMass;
    const applyImpulse=(axis,impulse)=>{for(const [node,weight,sign] of [[p,p.w*(1-s),1],[q,q===p?0:q.w*s,1],...(c.a?[[c.a,c.a.w*(1-c.t),-1],[c.b,c.b.w*c.t,-1]]:[])])for(let i=0;i<3;i++)node.v[i]+=axis[i]*impulse*weight*sign;};
    applyImpulse(c.normal,normalImpulse);
    const tangent=sub(rel,mul(c.normal,vn)),speed=len(tangent),support=normalImpulse+projectionImpulse,frictionImpulse=Math.min(speed/inverseMass,o.friction*support);
    if(speed>1e-9)applyImpulse(mul(tangent,1/speed),-frictionImpulse);
    this.contacts.push({particle:p.name,kind:c.kind,normal:c.normal,normalImpulse:normalImpulse+projectionImpulse,depth:c.depth});
   }
   this.time+=h;this.steps++;
  }
  metrics(){return {steps:this.steps,time:this.time,discardedTime:this.discardedTime,ccdHits:this.ccdHits,particles:this.particles.length,constraints:this.constraints.filter(c=>c.enabled).length,contacts:this.contacts.slice(),maxLengthError:Math.max(0,...this.constraints.filter(c=>c.enabled).map(c=>(()=>{const L=len(sub(sub(c.a.x,c.b.x),c.offset||[0,0,0]));return c.min!==undefined?Math.max(0,c.min-L,L-c.max):Math.abs(L-c.length)})()))};}
 }
 root.MagicPhysics={World,add,sub,mul,dot,len,closest,sweep,version:'14-A'};
})(typeof window==='undefined'?globalThis:window);
