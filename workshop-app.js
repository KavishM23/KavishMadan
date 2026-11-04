/* Runs the workshop: the home screen, what each model does when touched, and the walk into each page. */
import * as THREE from 'three';
import {buildScene,lightScene,reflectionsFrom,buildComposer,createMirror,TARGETS,TOYS,CAR} from './workshop.js';

const R=document.documentElement,hero=document.getElementById('hero'),canvas=document.getElementById('workshop3d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone=matchMedia('(max-width: 760px)').matches||!matchMedia('(hover: hover)').matches;
const params=new URLSearchParams(location.search);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),smooth=t=>t*t*(3-2*t);
const V=a=>new THREE.Vector3(...a),frame=()=>new Promise(r=>requestAnimationFrame(r)),home=()=>R.classList.contains('on-home');
const fail=()=>{hero.classList.add('ws-failed');hero.classList.remove('ws-loading');if(wantContact)hero.classList.add('ws-contact');dispatchEvent(new Event('hero3d-failed'))};
const BASE={rest:{p:[.52,2.62,9.35],t:[.15,.95,-.5]},far:{p:[1.1,7.2,19.5],t:[0,1.45,0]}};

/* ---- small sounds, made on the spot; they only ever follow a click ---- */
const Sound=(()=>{
 let ac=null;
 const ctx=()=>{if(window.siteMuted)return null;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume?.();return ac}catch(e){return null}};
 const out=(a,g)=>{const n=a.createGain();n.gain.value=g;n.connect(a.destination);return n};
 function pluck(a,freq,when,gain){
  const rate=a.sampleRate,len=Math.round(rate*2.4),buf=a.createBuffer(1,len,rate),d=buf.getChannelData(0),p=Math.round(rate/freq),line=new Float32Array(p);
  for(let i=0;i<p;i++)line[i]=Math.random()*2-1;
  for(let i=0,k=0;i<len;i++,k=(k+1)%p){const s=line[k];d[i]=s;line[k]=(s+line[(k+1)%p])*.4965}
  const src=a.createBufferSource(),f=a.createBiquadFilter();src.buffer=buf;f.type='lowpass';f.frequency.value=2600;src.connect(f).connect(out(a,gain));src.start(when);
 }
 return {
  strum(){const a=ctx();if(!a)return;[82.41,123.47,164.81,207.65,246.94,329.63].forEach((f,i)=>pluck(a,f,a.currentTime+i*.022,.13))}, // an open E major
  ting(){const a=ctx();if(!a)return;for(const [f,g] of [[1760,.05],[2794,.03],[4186,.012]]){const o=a.createOscillator(),n=out(a,g);o.frequency.value=f;o.connect(n);n.gain.exponentialRampToValueAtTime(.0001,a.currentTime+1.3);o.start();o.stop(a.currentTime+1.3)}},
  thud(){const a=ctx();if(!a)return;const o=a.createOscillator(),n=out(a,.3);o.frequency.setValueAtTime(90,a.currentTime);o.frequency.exponentialRampToValueAtTime(38,a.currentTime+.2);o.connect(n);n.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.26);o.start();o.stop(a.currentTime+.27)},
  rev(){const a=ctx();if(!a)return;const o=a.createOscillator(),f=a.createBiquadFilter(),n=out(a,.075),t=a.currentTime;o.type='sawtooth';f.type='lowpass';f.frequency.setValueAtTime(420,t);f.frequency.linearRampToValueAtTime(1900,t+.5);o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(330,t+.5);o.frequency.exponentialRampToValueAtTime(90,t+1.1);o.connect(f).connect(n);n.gain.setValueAtTime(.075,t+.5);n.gain.exponentialRampToValueAtTime(.0001,t+1.15);o.start();o.stop(t+1.2)},
  tick(){const a=ctx();if(!a)return;const o=a.createOscillator(),n=out(a,.05);o.type='triangle';o.frequency.value=1250;o.connect(n);n.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.09);o.start();o.stop(a.currentTime+.1)}
 };
})();
const VOICE={guitar:'strum',car:'rev',trophy:'ting',tyre:'thud',pencil:'tick',pick:'tick',book:'tick',tablet:'tick',satellite:'tick',research:'tick'};

let started=false;
const EMAIL='kavish.madan6@gmail.com',emailBtn=document.getElementById('ws-email'),linkedinA=document.getElementById('ws-linkedin'),toastEl=document.getElementById('ws-toast');
let wantContact=location.hash==='#contact',toastTimer=0;
function toast(text){toastEl.textContent=text;toastEl.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('on'),3200)}
function copyEmail(){
 const done=()=>toast('Copied '+EMAIL);
 const fallback=()=>{const t=document.createElement('textarea');t.value=EMAIL;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}t.remove();ok?done():toast(EMAIL)};
 try{navigator.clipboard.writeText(EMAIL).then(done,fallback)}catch(e){fallback()}
}
emailBtn.addEventListener('click',()=>{copyEmail();api.pulse?.('email')});
const api={ready:false,enter(){return false},leave(){start();return false},back(){},contact(){wantContact=true;if(hero.classList.contains('ws-failed'))hero.classList.add('ws-contact');else start()},closeContact(){wantContact=false},start};
window.workshopApi=api;

async function start(){
 if(started)return;started=true;
 const firstHome=home();
 if(firstHome)hero.classList.add('ws-loading');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',stencil:false})}catch(e){fail();return}
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 await Promise.race([Promise.all(['800 100px "League Spartan"','700 100px "League Spartan"','500 20px "IBM Plex Mono"'].map(f=>document.fonts.load(f))),new Promise(r=>setTimeout(r,1800))]);
 const bakes={};
 await Promise.all(['floor','back','left','right'].map(n=>new Promise(res=>new THREE.TextureLoader().load(`img/workshop-light-${n}.webp`,t=>{t.colorSpace=THREE.SRGBColorSpace;bakes[n]=t;res()},undefined,res))));
 await frame();
 const {scene,room,items}=await buildScene({renderer,bakes,texScale:phone?.5:1});
 await frame();
 const lights=lightScene(scene,{shadowSize:phone?1024:2048});
 const camera=new THREE.PerspectiveCamera(31,1,.05,90);
 renderer.shadowMap.needsUpdate=true;renderer.setSize(8,8,false);renderer.render(scene,camera);
 scene.environment=reflectionsFrom(renderer,scene,Object.values(items));
 room.ceiling.visible=false;
 const mirror=phone?null:createMirror(renderer,scene,room,camera);
 await frame();

 /* ---- sizing ---- */
 let W=1,H=1,best=null,fast=null,chainKey='',fastScale=.8,ratio=1,ao=!phone&&!params.has('noao'),fastAO=ao,settleAt=0;
 function size(){
  const r=hero.getBoundingClientRect();W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));
  ratio=Math.min(devicePixelRatio||1,phone?1.5:1.6,Math.sqrt(2500000/(W*H)));
  renderer.setPixelRatio(ratio);renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();
  const pw=Math.round(W*ratio),ph=Math.round(H*ratio);
  const fw=Math.round(pw*fastScale),fh=Math.round(ph*fastScale),key=[pw,ph,fw,fh,fastAO].join();
  if(key!==chainKey){
   chainKey=key;best?.dispose();fast?.dispose();
   best=buildComposer(renderer,scene,camera,pw,ph,{ao,samples:2,aoDiv:2,aoSamples:16,denoise:12});
   fast=buildComposer(renderer,scene,camera,fw,fh,{ao:fastAO,samples:0,aoDiv:2.6,aoSamples:6,denoise:4,smaa:true});
  }
  mirror?.size(pw,ph);dirty=true;
 }

 /* ---- what can be touched ---- */
 const labs={};document.querySelectorAll('.ws-lab').forEach(l=>{labs[l.dataset.key]=l});
 const proxies=[],probe=new THREE.MeshBasicMaterial({visible:false});
 const worldBox=o=>new THREE.Box3().setFromObject(o);
 const addProxy=(key,box)=>{const s=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3()),m=new THREE.Mesh(new THREE.BoxGeometry(s.x,s.y,s.z),probe);m.position.copy(c);m.userData.key=key;scene.add(m);proxies.push(m);m.userData.top=new THREE.Vector3(c.x,box.max.y+.12,c.z)};
 for(const key of ['guitar','tablet','satellite','trophy','tyre','crate'])addProxy(key,worldBox(items[key]));
 addProxy('book',worldBox(items.book).expandByVector(new THREE.Vector3(.05,.1,.05)));
 addProxy('research',new THREE.Box3(V([4.3,1.8,-2.2]),V([5.1,2.5,-1.46])));
 addProxy('pencil',worldBox(items.pencil).expandByVector(new THREE.Vector3(.08,.1,.08)));
 addProxy('pick',worldBox(items.pick).expandByVector(new THREE.Vector3(.12,.12,.12)));
 addProxy('plant',worldBox(items.plant));
 addProxy('cases',new THREE.Box3(V([4.35,.2,-3.7]),V([5.2,1.72,-.8])));
 {const m=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.45,6.4),probe);m.position.set(0,.72,-1.72+1.7);items.car.add(m);m.userData.key='car';proxies.push(m);m.userData.top=new THREE.Vector3(CAR.pos[0],1.34,CAR.pos[2])}
 scene.updateMatrixWorld(true);

 /* every model has a hover amount and a clock that starts on a click */
 const {binders,lids}=items.shelving.userData.parts;
 const shelfPlays={
  research:{userData:{playFor:.9,play:(h,p)=>{const kick=p<.9?Math.sin(p/.9*Math.PI)*.04:0;binders.forEach((b,i)=>{b.position.z=smooth(clamp(h*1.5-i*.07))*.1+kick})}}},
  cases:{userData:{playFor:.7,play:(h,p)=>{const k=p<.7?Math.sin(p/.7*Math.PI)*.07:0;lids.forEach((l,i)=>{l.rotation.x=-smooth(clamp(h*1.4-i*.09))*.3-k})}}}
 };
 const models={};
 for(const key of ['car','guitar','tablet','book','satellite','trophy','tyre','crate','pencil','pick','plant'])models[key]={o:items[key],h:0,goal:0,p:99};
 for(const key in shelfPlays)models[key]={o:shelfPlays[key],h:0,goal:0,p:99};
 function react(key){const m=models[key];if(!m)return;m.p=0;m.o.userData.click?.();if(VOICE[key])Sound[VOICE[key]]();wake()}
 function play(dt,time){
  let busy=false;
  for(const key in models){
   const m=models[key],u=m.o.userData;m.h=damp(m.h,m.goal,6.5,dt);if(Math.abs(m.h-m.goal)<.002)m.h=m.goal;m.p+=dt;
   if(stage?.key===key&&stage.m.own)continue;
   const running=u.play?.(m.h,m.p,dt,time);
   if(m.goal>0||m.h>0||m.p<(u.playFor||0)||running===true)busy=true;
  }
  return busy;
 }

 /* ---- camera ---- */
 const pose={p:new THREE.Vector3(),t:new THREE.Vector3()},rest={p:V(BASE.rest.p),t:V(BASE.rest.t)},far={p:V(BASE.far.p),t:V(BASE.far.t)},Y=new THREE.Vector3(0,1,0),tmpP=new THREE.Vector3(),tmpT=new THREE.Vector3(),tmpFollow=new THREE.Vector3(),tmpChase=new THREE.Vector3(),tmpOff=new THREE.Vector3();
 function frameFor(aspect){
  // narrower than the picture: stand further back, so the whole set stays in view
  const need=clamp(1.78/aspect,1,3.3),k=1+(need-1)*.82;
  rest.t.copy(V(BASE.rest.t));rest.p.copy(rest.t).add(V(BASE.rest.p).sub(rest.t).multiplyScalar(k));
  if(aspect<1){const d=rest.p.distanceTo(rest.t);rest.t.y=.62;rest.p.copy(rest.t).add(new THREE.Vector3(-.06,.44,1).normalize().multiplyScalar(d*1.06))}
  far.p.copy(V(BASE.far.t)).add(V(BASE.far.p).sub(V(BASE.far.t)).multiplyScalar(Math.max(1,k*.78)));
 }
 let dirty=true,running=false,last=0,intro=(reduce||!firstHome)?1:0,stage=null,hoverKey=null,focusKey=null,pendingKey=null,pending=null,time=0;
 let leanX=0,leanY=0,px=0,py=0,yaw=0,pitch=0,yawGoal=0,pitchGoal=0,dragging=false;const lean=new THREE.Vector3(),leanGoal=new THREE.Vector3(),offset=new THREE.Vector3();

 function camUpdate(dt){
  pose.p.lerpVectors(far.p,rest.p,reduce?1:ease(clamp(intro)));pose.t.lerpVectors(far.t,rest.t,reduce?1:ease(clamp(intro)));
  yaw=damp(yaw,yawGoal,dragging?10:2.1,dt);pitch=damp(pitch,pitchGoal,dragging?10:2.1,dt);
  if(!dragging){yawGoal=damp(yawGoal,0,1.3,dt);pitchGoal=damp(pitchGoal,0,1.3,dt)}
  offset.copy(pose.p).sub(pose.t).applyAxisAngle(Y,yaw);offset.y+=pitch*offset.length();pose.p.copy(pose.t).add(offset);
  leanX=damp(leanX,px,3.2,dt);leanY=damp(leanY,py,3.2,dt);lean.x=damp(lean.x,leanGoal.x,3,dt);lean.y=damp(lean.y,leanGoal.y,3,dt);lean.z=damp(lean.z,leanGoal.z,3,dt);
  if(stage){
   const e=smooth(stage.v);stage.path.getPoint(e,tmpP);stage.look.getPoint(e,tmpT);stage.m.cam?.(e,tmpP,tmpT);
   const [ua,ub]=stage.m.upAt||[.4,.9];camera.up.copy(Y).lerp(stage.up,smooth(clamp((e-ua)/(ub-ua)))).normalize();camera.position.copy(tmpP);if(contactOn){camera.position.x+=leanX*.07;camera.position.y-=leanY*.04}camera.lookAt(tmpT);return;
  }
  camera.up.copy(Y);camera.position.set(pose.p.x+leanX*.62,pose.p.y-leanY*.26,pose.p.z);camera.lookAt(pose.t.x+lean.x,pose.t.y+lean.y,pose.t.z+lean.z);
 }

 /* ---- pointer ---- */
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 function pick(x,y){const r=hero.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)return null;ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(proxies,false)[0];return hit?hit.object.userData.key:null}
 const v=new THREE.Vector3();
 function place(key){const l=labs[key],m=proxies.find(o=>o.userData.key===key);if(!l||!m)return;v.copy(m.userData.top).project(camera);const r=hero.getBoundingClientRect();l.style.setProperty('--lx',((v.x*.5+.5)*r.width).toFixed(1)+'px');l.style.setProperty('--ly',((-v.y*.5+.5)*r.height).toFixed(1)+'px')}
 function hover(key){
  if(key===hoverKey)return;hoverKey=key;if(key==='satellite')flightData||=buildFlight();
  for(const k in labs)labs[k].classList.toggle('on',k===key);
  for(const k in models)models[k].goal=k===key?1:0;
  leanGoal.set(0,0,0);if(key&&proxies.find(o=>o.userData.key===key)){leanGoal.copy(proxies.find(o=>o.userData.key===key).userData.top).sub(pose.t).multiplyScalar(.035);place(key)}
  canvas.style.cursor=key?'pointer':'';window.portfolioCursor?.setModelLabel?.(key&&TARGETS[key]?TARGETS[key].label:'');wake();
 }
 addEventListener('pointermove',e=>{
  if(!home())return;px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;dirty=true;
  if(down&&!stage){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.hypot(dx,dy)>7){dragging=true;canvas.style.cursor='grabbing';hover(null)}
   if(dragging){yawGoal=clamp(down.yaw-dx*.0036,-.46,.46);pitchGoal=clamp(down.pitch+dy*.0012,-.05,.17)}}
  else if(e.pointerType==='mouse'||!e.pointerType)pending=e.target===canvas?[e.clientX,e.clientY]:null;
  wake();
 },{passive:true});
 let down=null;
 canvas.addEventListener('pointerdown',e=>{if(!home())return;down={x:e.clientX,y:e.clientY,yaw:yawGoal,pitch:pitchGoal};canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointerup',e=>{
  const was=dragging;dragging=false;canvas.style.cursor='';const d=down;down=null;
  if(d&&contactOn){const k=pickChoice(e.clientX,e.clientY);if(k==='email')emailBtn.click();else if(k==='linkedin')linkedinA.click();else closeContact();return}
  if(!d||was||!api.ready||stage)return;
  const k=pick(e.clientX,e.clientY);if(k)activate(k);
 });
 canvas.addEventListener('pointerleave',()=>{pending=null;if(!down)hover(null)});
 canvas.addEventListener('pointercancel',()=>{down=null;dragging=false});

 /* ---- walking into a page ----
    Every object has one move: a camera path and an action, both driven by a single value from 0 to 1.
    Running that value backwards is the way out, so each return is the same move in reverse. */
 const seg=(e,a,b)=>smooth(clamp((e-a)/(b-a)));
 const wipeEl=document.querySelector('.wipe');
 /* a little copy of the page wipe, drawn on the surface of an object */
 function makePanel(parent,w,h,p,r){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d'),tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  const geo=new THREE.PlaneGeometry(w,h);geo.translate(0,h/2,0);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex}));m.position.set(...p);m.rotation.set(...r);m.position.y+=0;m.visible=false;m.renderOrder=3;parent.add(m);
  const P={mesh:m,w,h,
   rise(u){m.visible=u>.001;m.scale.y=Math.max(.001,u);tex.repeat.y=Math.max(.001,u);tex.needsUpdate=false},
   draw(label,px){ // px: the size of the word in canvas pixels
    const t=label.toUpperCase();g.fillStyle='#1e3a40';g.fillRect(0,0,c.width,c.height);g.fillStyle='#efe4d3';g.font=`800 ${px}px "League Spartan",Arial,sans-serif`;g.textBaseline='middle';
    const gap=px*.3;let total=-gap;for(const ch of t)total+=g.measureText(ch).width+gap;let x=(c.width-total)/2;for(const ch of t){g.fillText(ch,x,c.height/2+px*.06);x+=g.measureText(ch).width+gap}
    tex.needsUpdate=true},
   /* where the camera stands for this surface to fill the screen exactly */
   cover(){
    const was=m.scale.y;m.scale.y=1;m.updateWorldMatrix(true,false);
    const e=m.matrixWorld.elements,sx=Math.hypot(e[0],e[1],e[2]),sy=Math.hypot(e[4],e[5],e[6]),up=new THREE.Vector3(e[4],e[5],e[6]).normalize(),n=new THREE.Vector3(e[8],e[9],e[10]).normalize(),c0=new THREE.Vector3(0,h/2,0).applyMatrix4(m.matrixWorld);
    m.scale.y=was;const tan=Math.tan(camera.fov*Math.PI/360),ww=w*sx,hh=h*sy,d=Math.max(.075,Math.min(hh/(2*tan),ww/(2*tan*camera.aspect))*.99);
    return {c:c0,n,up,d,worldH:hh}}};
  return P;
 }
 const P=items;
 const tablet=P.tablet.userData.parts,book=P.book.userData.parts,crate=P.crate.userData.parts,tyre=P.tyre.userData.parts,carParts=P.car.children[0].userData.parts;
 const sat=P.satellite.userData.parts;
 const panels={
  tablet:makePanel(tablet.pivot,tablet.W-.016,tablet.H-.016,[0,.008,.0052],[0,0,0]),
  book:makePanel(P.book,book.W*.94,book.H*.97,[book.W*.5,.0505,book.H*.485],[-Math.PI/2,0,0])
 };
 /* the crate's two choices: invisible hit areas that travel with the letter and the tablet */
 const hitE=new THREE.Mesh(new THREE.BoxGeometry(.44,.3,.04),probe),hitL=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.6,.4),probe);hitE.userData.key='email';hitL.userData.key='linkedin';crate.letter.add(hitE);crate.card.add(hitL);
 const choices=[hitE,hitL],below=[new THREE.Vector3(0,-.19,0),new THREE.Vector3(0,-.98,0)];
 let contactOn=false,choiceKey=null,liftE=0,liftL=0,pulseE=9,slot=[];
 const stacked=()=>camera.aspect<1;
 function slots(){return stacked()?[[0,1.37,.17],[0,.93,.17]]:[[-.238,.98,.17],[.238,.98,.17]]}
 const tablePose=new THREE.Vector3(),carStart=V(CAR.pos);
 const carCurve=new THREE.CubicBezierCurve3(carStart.clone(),V([1.5,0,1.0]),V([1.15,0,5.2]),V([2.5,0,15]));
 const tyreStart=P.tyre.position.clone();
 const surf=(key,pre,pts=[])=>()=>{ // approach a surface square-on, pause, then push until it fills the screen
  const s=panels[key].cover(),a=s.c.clone().addScaledVector(s.n,s.d*pre);
  return {path:[...pts.map(V),a,a.clone().addScaledVector(s.n,-s.d*.12),s.c.clone().addScaledVector(s.n,s.d)],look:[...pts.map((_, i)=>s.c.clone()),s.c,s.c,s.c],up:s.up};
 };
 const moves={
  tablet:{label:'Code',dur:2.7,finish:'cut',panel:'tablet',route:surf('tablet',2.9),
   act(e){panels.tablet.rise(seg(e,.48,.68))}},
  book:{label:'Strata',dur:3,finish:'cut',panel:'book',own:true,upAt:[0,.3],route:surf('book',2.3),
   act(e){const u=seg(e,.36,.66);book.leaf.visible=u>.002;book.leaf.rotation.z=u*Math.PI;panels.book.rise(u>.002?1:0)}},
  crate:{label:'Contact',dur:2.4,finish:'contact',own:true,
   route(from){
    const c=P.crate;c.updateWorldMatrix(true,false);const n=new THREE.Vector3(0,0,1).transformDirection(c.matrixWorld),tan=Math.tan(camera.fov*Math.PI/360);
    const C=c.localToWorld(new THREE.Vector3(0,stacked()?1.13:.98,.17)),a=camera.aspect;
    const d=stacked()?Math.max(.47/.84/(2*tan*a),.8/.62/(2*tan)):Math.max(.92/.66/(2*tan*a),.32/.5/(2*tan));
    const far=C.clone().addScaledVector(n,d*1.9);far.y+=.28;
    return {path:[from.p,far,C.clone().addScaledVector(n,d*1.12),C.clone().addScaledVector(n,d)],look:[from.t,C,C,C],up:Y};
   },
   act(e){
    slot=slots();const up=seg(e,.14,.62),ur=seg(e,.26,.78),lid=crate.lid,l=crate.letter,t=crate.card;
    lid.rotation.x=-seg(e,0,.34)*1.2;
    l.position.set(slot[0][0]*up,.2+(slot[0][1]-.2)*up,slot[0][2]*up);l.rotation.set(-.2*(1-up),0,0);
    t.position.set(slot[1][0]*ur,.2+(slot[1][1]-.2)*ur,-.14+(slot[1][2]+.14)*ur);t.rotation.x=-.5*(1-ur);t.rotation.y=0;
   }},
  car:{label:'Builds',dur:2.5,finish:'sweep',own:true,
   route:from=>({path:[from.p,V([-1.3,1.25,7.2]),V([-.9,.85,6.6]),V([-.5,.8,6.2])],look:[from.t,V([.5,.4,-.3]),V([.9,.5,1.6]),V([2.3,.5,7.4])],up:Y}),
   act(e){
    const pre=seg(e,.05,.42),go=Math.pow(clamp((e-.36)/.64),2.3),rig=P.car;
    rig.position.y=Math.sin(e*90)*.0035*pre*(1-go);rig.rotation.x=-.012*pre*(1-go);
    const q=carCurve.getPoint(go),d=carCurve.getTangent(Math.min(.999,go+.001));rig.position.x=q.x;rig.position.z=q.z;rig.rotation.y=go>0?Math.atan2(d.x,d.z):CAR.rot;
    carParts.spins.forEach(w=>{w.rotation.x=-e*e*170});carParts.fronts.forEach(w=>{w.rotation.y=-.1*go});
    carParts.flap.rotation.x=-seg(e,.3,.5)*.62;
   }},
  tyre:{label:'More',dur:2.6,finish:'iris',own:true,
   route:from=>({path:[from.p,V([2.6,1.25,5.1]),V([2.4,.62,3.9]),V([2.34,.42,3.55])],look:[from.t,V([3.1,.3,1.6]),V([3.05,.34,1.8]),V([2.5,.36,2.6])],up:Y}),
   iris:e=>[3-seg(e,.84,1)*3,0],
   act(e){
    const tip=seg(e,.1,.36),roll=Math.pow(clamp((e-.32)/.68),2),b=tyre.body,s=P.tyre.scale.x,end=[2.36,3.3],dx=end[0]-tyreStart.x,dz=end[1]-tyreStart.z;
    P.tyre.position.x=tyreStart.x+dx*roll;P.tyre.position.z=tyreStart.z+dz*roll;P.tyre.rotation.y=Math.atan2(dx,dz)*tip;
    b.rotation.set(roll*Math.hypot(dx,dz)/(.362*s),0,tip*Math.PI/2);b.position.y=.2+tip*.162+Math.sin(tip*Math.PI)*.05;
   }},
  guitar:{label:'About',dur:3,finish:'iris',hold:true,
   route:from=>{const g=P.guitar.position,o=a=>new THREE.Vector3(g.x+a[0],a[1],g.z+a[2]);return {path:[from.p,o([1.2,1.75,1.55]),o([.68,1.2,.73]),o([.38,.7,.45]),o([.18,.42,.31])],look:[from.t,o([-.05,1.5,-.05]),o([-.03,1.05,-.03]),o([.02,.6,.03]),o([.05,.4,.07])],up:Y}},
   iris:e=>[3-seg(e,.76,1)*3,0],act(){}},
  satellite:{label:'Kessler',dur:4.4,finish:'iris',own:true,dark:true,
   route:from=>({path:[from.p,from.p],look:[from.t,from.t],up:Y}),
   // the camera flies formation with the Concorde as it climbs, then drops back to ride up with the satellite
   cam(e,p,t){
    const a=seg(e,.03,.2),b=seg(e,.55,.72),f=flight;
    f.curve.getPoint(f.fly(e),tmpFollow);p.lerp(tmpChase.copy(tmpFollow).add(tmpOff.set(1.3,-.4,7.4)),a);t.lerp(tmpFollow,a);
    const s=f.alt(e);p.lerp(tmpChase.set(2.95,s-.25,2.5),b);t.lerp(tmpChase.set(2.62,s+.42,-2.3),b);
   },
   iris:e=>[3-seg(e,.95,1)*3,0],
   act(e){
    const fly=flight.fly(e),q=flight.curve.getPoint(fly),t=flight.curve.getTangent(Math.min(.999,fly+.001));
    flight.plane.visible=e>.01&&e<.8;flight.plane.position.copy(q);
    {const L=new THREE.Vector3().crossVectors(Y,t).normalize(),U=new THREE.Vector3().crossVectors(t,L);flight.m.makeBasis(L,U,t);flight.plane.quaternion.setFromRotationMatrix(flight.m).multiply(flight.roll.setFromAxisAngle(flight.z,-.32*seg(e,.1,.4)))}
    const go=flight.go(e),s=P.satellite.scale.x;
    sat.sat.position.y=1.26+(flight.alt(e)-1.41)/s;sat.sat.rotation.y=-.5+go*1.6;
    sat.wings.forEach(w=>{w.rotation.x=.28+seg(e,.62,.86)*1.1});
    flight.flame.visible=go>.001;flight.flame.scale.set(1,1+Math.sin(e*300)*.16,1);flight.trail.visible=go>.001&&e<.72;
    if(flight.trail.visible){const top=sat.sat.position.y-.4;flight.trail.scale.y=Math.max(.01,top);flight.trail.position.y=top/2;flight.trail.material.opacity=.4*(1-seg(e,.5,.72))}
    const sky=seg(e,.07,.22),space=seg(e,.52,.9);flight.dome.visible=sky>.001;flight.dome.position.copy(camera.position);flight.dome.material.uniforms.uSky.value=sky;flight.dome.material.uniforms.uSpace.value=space;
   }},
  trophy:{label:'Awards',dur:2.7,finish:'iris',hold:true,upAt:[.15,.55],
   route:from=>({path:[from.p,V([3.3,1.55,1.0]),V([3.66,1.75,-.42]),V([3.72,1.4,-.8]),V([3.72,.98,-.82])],look:[from.t,V([3.72,.75,-.82]),V([3.72,.85,-.82]),V([3.72,.8,-.83]),V([3.72,.6,-.84])],up:new THREE.Vector3(0,0,-1)}),
   iris:e=>[3-seg(e,.74,1)*3,0],act(){}},
  research:{label:'Research',dur:1.7,finish:'overlay',hold:true,
   route:from=>({path:[from.p,V([2.6,2.2,-.7]),V([3.05,2.15,-1.5])],look:[from.t,V([4.7,2.15,-1.85]),V([4.7,2.15,-1.85])],up:Y}),act(){}}
 };
 /* the Concorde that climbs out of the room, and the sky it climbs into */
 let flightData=null;
 const buildFlight=()=>{
  const f=window.createConcordeFlight({THREE,scene:new THREE.Scene(),camera,sun:new THREE.DirectionalLight(),restoreSun(){},anisotropy:8}),plane=f.plane;
  plane.parent?.remove(plane);plane.scale.setScalar(.078);plane.visible=false;plane.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(plane);
  const curve=new THREE.CubicBezierCurve3(V([-7.5,1.2,12.5]),V([-3.2,1.5,7.2]),V([.2,5,3.6]),V([2.2,27,.6]));
  const dome=new THREE.Mesh(new THREE.SphereGeometry(60,48,32),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,transparent:true,uniforms:{uSky:{value:0},uSpace:{value:0}},
   vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec3 vD;uniform float uSky,uSpace;
   float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
   void main(){vec3 d=normalize(vD);
    vec3 day=mix(vec3(.72,.82,.86),vec3(.36,.58,.76),smoothstep(-.1,.6,d.y));
    vec3 c=mix(day,vec3(.006,.009,.022),uSpace);
    vec3 q=d*120.,g=floor(q),f=fract(q)-.5;float s=step(.985,hash(g))*smoothstep(.22,.02,length(f));c+=s*vec3(.9,.92,1.)*smoothstep(.45,1.,uSpace)*(.4+hash(g+1.)*.9);
    float limb=d.y+.34*d.x*d.x;float earth=smoothstep(.002,-.012,limb-.012);float glow=exp(-max(limb,0.)*16.);
    vec3 ground=mix(vec3(.05,.13,.28),vec3(.16,.34,.5),smoothstep(-.3,0.,limb));
    c=mix(c+vec3(.22,.46,.82)*glow*uSpace*.85,ground,earth*uSpace);
    gl_FragColor=vec4(c,uSky);}`}));
  dome.renderOrder=-10;dome.frustumCulled=false;dome.visible=false;scene.add(dome);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.09,.5,20,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1,.5),transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  flame.rotation.x=Math.PI;flame.position.y=-.56;flame.visible=false;sat.sat.add(flame);
  const trail=new THREE.Mesh(new THREE.CylinderGeometry(.05,.13,1,12,1,true),new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));
  trail.position.set(0,0,0);trail.visible=false;P.satellite.add(trail);
  return {plane,curve,dome,flame,trail,fly:e=>Math.pow(clamp(e/.76),1.25),go:e=>Math.pow(clamp((e-.3)/.7),1.7),alt:e=>1.41+Math.pow(clamp((e-.3)/.7),1.7)*62,m:new THREE.Matrix4(),roll:new THREE.Quaternion(),z:new THREE.Vector3(0,0,1)};
 };
 const flight=new Proxy({},{get:(t,k)=>(flightData||=buildFlight())[k]}); // built the first time the satellite is touched
 const keyFor=hash=>{for(const k in labs)if(labs[k].getAttribute('href')===hash)return k;return 'car'};
 function begin(key,done){
  const m=moves[key];hover(null);m.prep?.();camUpdate(.016);
  if(m.panel){const pn=panels[m.panel],s=pn.cover(),canvasPerWorld=1024/(pn.w*(s.worldH/pn.h));pn.draw(m.label,window.wipeFont(m.label)/innerHeight*(2*s.d*Math.tan(camera.fov*Math.PI/360))*canvasPerWorld)}
  const r=m.route({p:camera.position.clone(),t:pose.t.clone()});
  if(m.panel){r.path.unshift(camera.position.clone());r.look.unshift(pose.t.clone())}
  m.act(0);
  stage={key,m,v:0,dir:1,done,up:r.up.clone(),path:new THREE.CatmullRomCurve3(r.path,false,'centripetal'),look:new THREE.CatmullRomCurve3(r.look,false,'centripetal')};
  if(m.hold)models[key].goal=1;wake();
 }
 /* hand over to the real page: the full-screen wipe takes the place of whatever now fills the view */
 function takeover(m,next){
  window.fitWipe(m.label);wipeEl.className='wipe still '+(m.finish==='sweep'?'sweep':m.finish==='iris'?'dusk':'cut');
  setTimeout(()=>{next();setTimeout(()=>{wipeEl.className='wipe out';setTimeout(()=>{wipeEl.className='wipe'},760)},140)},m.finish==='sweep'?640:m.finish==='iris'?340:190);
 }
 function arrive(){const s=stage,m=s.m;s.dir=0;if(m.finish==='contact'){contactOn=true;hero.classList.add('ws-contact');placeChoices();setTimeout(()=>emailBtn.focus({preventScroll:true}),60);return}if(m.finish==='overlay')window.openResearch?.(innerWidth/2,innerHeight/2);else takeover(m,s.done)}
 function placeChoices(){
  const r=hero.getBoundingClientRect();[[emailBtn,crate.letter,0],[linkedinA,crate.card,1]].forEach(([el,o,i])=>{v.copy(below[i]);o.localToWorld(v);v.project(camera);el.style.setProperty('--lx',((v.x*.5+.5)*r.width).toFixed(1)+'px');el.style.setProperty('--ly',((-v.y*.5+.5)*r.height).toFixed(1)+'px')});
 }
 function pickChoice(x,y){const r=hero.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(choices,false)[0];return hit?hit.object.userData.key:null}
 function setChoice(k){if(k===choiceKey)return;choiceKey=k;emailBtn.classList.toggle('on',k==='email');linkedinA.classList.toggle('on',k==='linkedin');canvas.style.cursor=k?'pointer':'';wake()}
 function closeContact(){
  wantContact=false;
  if(contactOn){contactOn=false;setChoice(null);hero.classList.remove('ws-contact');if(location.hash==='#contact')history.replaceState(null,'','#home');cleanWipe(clearStage)}
  else if(stage?.key==='crate')clearStage();
 }
 api.closeContact=closeContact;
 api.contact=()=>{pendingKey=null;wantContact=true;hover(null);wake()};
 api.pulse=k=>{if(k==='email'){pulseE=0;Sound.tick();wake()}};
 document.getElementById('ws-exit').addEventListener('click',closeContact);
 addEventListener('keydown',e=>{if(e.key==='Escape'&&contactOn)closeContact()});
 function activate(key){
  react(key);
  if(TOYS.includes(key)||!labs[key])return;
  pendingKey=key;
  if(key==='research'){if(reduce)window.openResearch?.(innerWidth/2,innerHeight/2);else begin(key,null);pendingKey=null}
  else labs[key].click();
 }
 labs.research?.addEventListener('click',()=>{if(!stage)activate('research')});
 Object.entries(labs).forEach(([key,l])=>l.addEventListener('focus',()=>{if(!l.matches(':focus-visible'))return;focusKey=key;place(key)}));
 api.enter=(hash,done)=>{
  if(stage?.dir===1&&stage.done){stage.done=done;return true} // a second click mid-flight: the newest choice wins
  if(reduce||!api.ready||stage)return false;
  const key=pendingKey||keyFor(hash);pendingKey=null;if(models[key].p>3)react(key);begin(key,done);return true;
 };
 /* going home is never a replay: one clean wipe, and the room is simply back as it was */
 function clearStage(){if(!stage)return;const m=stage.m;m.act(0);if(m.panel)panels[m.panel].rise(0);if(m.hold)models[stage.key].goal=0;stage=null}
 function cleanWipe(mid){
  if(reduce){mid();camUpdate(.016);wake();return}
  window.fitWipe('Workshop');wipeEl.className='wipe in';let settled=false;
  const half=()=>{if(settled)return;settled=true;mid();wake();camUpdate(.016);draw(fast);dirty=true;wipeEl.className='wipe out';setTimeout(()=>{wipeEl.className='wipe'},760)};
  wipeEl.addEventListener('animationend',half,{once:true});setTimeout(half,620);
 }
 api.leave=done=>{if(!api.ready)return false;cleanWipe(()=>{clearStage();done()});return true};
 api.back=()=>{if(stage&&stage.m.finish==='overlay')cleanWipe(clearStage)};

 /* ---- the loop runs only while the workshop can be seen and something is happening ---- */
 const visible=()=>home()||!!(stage&&stage.dir===1);
 let slow=0,samples=0,frameTime=0,lastDraw=0;
 function draw(chain){if(!chain){size();chain=fast}const night=R.dataset.theme==='dark',g=chain.grade.uniforms;g.uBg.value.setRGB(night?.008:.86,night?.018:.77,night?.022:.65);const [iris,stars]=stage?.m.iris?stage.m.iris(smooth(stage.v)):[3,0];g.uIris.value=iris;g.uStars.value=stars;g.uAspect.value=W/H;g.uDark.value=stage?.m.dark?1:0;mirror?.render(chain.w,chain.h);chain.composer.render()}
 let freeTimer=0;
 function freeChains(){best?.dispose();fast?.dispose();best=fast=null;chainKey='';mirror?.free();renderer.renderLists.dispose()}
 function wake(){clearTimeout(freeTimer);if(!best&&visible())size();dirty=true;if(!running&&visible()&&!document.hidden){running=true;last=performance.now();requestAnimationFrame(tick)}}
 function tick(now){
  if(!visible()||document.hidden){running=false;if(!home())freeTimer=setTimeout(freeChains,1800);return}
  const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;
  const before=intro+(stage?stage.v:0);
  if(intro<1)intro=Math.min(1,intro+dt/3.2);
  if(stage&&stage.dir){
   stage.v=clamp(stage.v+dt/stage.m.dur);
   stage.m.act(smooth(stage.v));
   if(stage.dir>0&&stage.v>=1)arrive();
  }
  let acting=play(dt,time);
  if(contactOn){ // the thing under the pointer leans out towards you; a copied letter gives a small shake
   liftE=damp(liftE,choiceKey==='email'?1:0,9,dt);liftL=damp(liftL,choiceKey==='linkedin'?1:0,9,dt);pulseE+=dt;
   crate.letter.position.z=slot[0][2]+liftE*.035;crate.card.position.z=slot[1][2]+liftL*.035;crate.card.userData.press(liftL);
   crate.letter.position.y=slot[0][1]+Math.sin(time*1.3)*.006;crate.card.position.y=slot[1][1]+Math.sin(time*1.1+1)*.008;crate.card.rotation.y=Math.sin(time*.7)*.035;acting=true;
   crate.letter.rotation.z=pulseE<.5?Math.sin(pulseE*26)*.035*(1-pulseE/.5):0;
   placeChoices();if(choiceKey||Math.abs(liftE)+Math.abs(liftL)>.002||pulseE<.5)acting=true;
  }
  const moved=Math.abs(before-(intro+(stage?stage.v:0)))>1e-5||Math.abs(px-leanX)+Math.abs(py-leanY)>.0015||lean.distanceToSquared(leanGoal)>1e-7||Math.abs(yaw-yawGoal)+Math.abs(pitch-pitchGoal)+Math.abs(yawGoal)+Math.abs(pitchGoal)>.0008||acting;
  if(pending){const [x,y]=pending;pending=null;if(contactOn)setChoice(pickChoice(x,y));else if(!stage&&!dragging)hover(pick(x,y))}
  if(wantContact&&!stage&&home()&&api.ready){wantContact=false;begin('crate',null);if(reduce){stage.v=1;stage.m.act(1);arrive()}}
  if(moved||dirty){
   camUpdate(dt);if(hoverKey)place(hoverKey);if(focusKey)place(focusKey);
   draw(fast);dirty=false;settleAt=now+170;
   // keep it smooth on slower machines: shed detail from the moving frames, never from the still one
   if(++samples>30){samples=0;slow=frameTime/30>30?slow+1:0;frameTime=0;if(slow>=2&&(fastAO||fastScale>.5)){slow=0;if(fastAO)fastAO=false;else fastScale=Math.max(.5,fastScale-.14);size()}}
   frameTime+=(now-lastDraw);lastDraw=now;
  }else if(settleAt&&now>=settleAt){settleAt=0;lastDraw=now;draw(best)}
  hero.classList.toggle('ws-moving',intro<1);
  if(!settleAt&&!moved&&!dirty&&!pending&&!wantContact&&!contactOn&&!stage){running=false;return}
  requestAnimationFrame(tick);
 }
 /* day and night share one scene: the sun goes down, a lamp comes on, and the name catches it */
 const envBase=new Map();scene.traverse(o=>{if(o.material&&o.material.envMapIntensity!==undefined)envBase.set(o.material,o.material.envMapIntensity)});
 function setNight(dark){
  scene.background.set(dark?'#17272b':'#efe4d3');room.shared.tint.value.setRGB(dark?.1:1,dark?.13:1,dark?.2:1);room.shared.lamp.value=dark?.4:0;room.surfaces.back.material.uniforms.uName.value=dark?.62:0;room.view.material.uniforms.uSky.value.setRGB(dark?.05:1,dark?.08:1,dark?.2:1);
  lights.sun.intensity=dark?0:1.7;lights.sky.intensity=dark?.28:1.25;lights.fill.intensity=dark?.4:1.3;lights.lamp.intensity=dark?22:0;envBase.forEach((v,m)=>{m.envMapIntensity=v*(dark?.34:1)});wake();
 }
 addEventListener('site-theme',e=>setNight(e.detail.dark));
 window.__workshop={renderer,scene,camera,models,chains:()=>({best,fast}),state:()=>({intro,v:stage?stage.v:0,dir:stage?stage.dir:0,key:stage?stage.key:null,hoverKey,yaw,running}),scrub(key,v){if(!stage)begin(key,()=>{});stage.dir=0;stage.v=v;stage.m.act(smooth(v))},clear(){if(stage){stage.m.act(0);if(stage.m.panel)panels[stage.m.panel].rise(0);if(stage.m.hold)models[stage.key].goal=0;stage=null}},set(i){if(i!=null)intro=i;camUpdate(1)},play(dt=.016){time+=dt;play(dt,time)},frame(q='best'){camUpdate(1);draw(q==='best'?best:fast)}};

 new ResizeObserver(()=>{if(!visible())return;size();frameFor(W/H);wake()}).observe(hero);size();frameFor(W/H);setNight(R.dataset.theme==='dark');
 document.addEventListener('visibilitychange',wake);
 play(.016,0);camUpdate(.016);draw(best);if(!home())freeChains();
 hero.classList.remove('ws-loading');hero.classList.add('ws-ready');api.ready=true;
 if(location.hash==='#contact'){wantContact=true;intro=1}
 dispatchEvent(new Event('workshop-ready'));wake();
}

if(home())start().catch(e=>{console.error(e);fail()});
else{ // landed straight on a page: get the workshop ready quietly for the way back
 const later=()=>start().catch(e=>{console.error(e);fail()});
 addEventListener('load',()=>setTimeout(()=>(window.requestIdleCallback||setTimeout)(later),1500),{once:true});
 if(document.readyState==='complete')setTimeout(later,1500);
}
