/* A small engineering test lab. Scene loading is deferred until Builds is visible. */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const stage=document.getElementById('testlab-stage'),canvas=document.getElementById('testlab-canvas');
const card=document.getElementById('testlab-card'),hint=document.getElementById('testlab-hint'),fallback=document.getElementById('testlab-fallback');
const nav=[...document.querySelectorAll('[data-lab]')],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const projects={
 strata:{tag:'TERRAIN COURSE / 01',name:'Project Strata',desc:'An off-road 4×4 built by a team of six, from the first sketches to a second-place finish in the UAE.',href:'#b-4x4',x:-6.6},
 drone:{tag:'FLIGHT CAGE / 02',name:'Anti-drone quads',desc:'Arduino prototypes, sensors and C code: four weeks working on anti-drone systems in Chennai.',href:'#b-quad',x:-2.2},
 orbit:{tag:'MISSION CONTROL / 03',name:'Kessler model',desc:'A Python simulation exploring how orbital debris can set off a cascade of collisions.',href:'#b-kessler',x:2.2},
 wing:{tag:'WIND TUNNEL / 04',name:'Dragonfly wing',desc:'A team experiment in biomimicry: a corrugated UAV wing inspired by a dragonfly.',href:'#b-wing',x:6.6}
};
let selectScene=()=>{},resetScene=()=>{},wake=()=>{},selected=null;
function select(key){const p=projects[key];if(!p)return;selected=key;stage.classList.add('has-selection');card.hidden=false;document.getElementById('testlab-tag').textContent=p.tag;document.getElementById('testlab-name').textContent=p.name;document.getElementById('testlab-desc').textContent=p.desc;const a=document.getElementById('testlab-link');a.href=p.href;hint.hidden=true;nav.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lab===key)));selectScene(key);wake()}
function reset(){selected=null;stage.classList.remove('has-selection');card.hidden=true;hint.hidden=false;nav.forEach(b=>b.setAttribute('aria-pressed','false'));resetScene();wake()}
nav.forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(b.dataset.lab))});
document.getElementById('testlab-back').addEventListener('click',reset);
stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){reset();nav[0].focus()}});

let initialized=false,visible=false,failed=false;
async function init(){
 if(initialized||failed)return;initialized=true;
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(e){failed=true;fallback.hidden=false;return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#101e2a');scene.fog=new THREE.Fog('#101e2a',27,47);
 const camera=new THREE.PerspectiveCamera(39,1,.1,90);camera.position.set(0,8.4,23);
 const hemi=new THREE.HemisphereLight('#c6d9db','#382e29',1.55);scene.add(hemi);
 const key=new THREE.DirectionalLight('#ffdfba',2.5);key.position.set(-5,11,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:9,bottom:-9,near:1,far:35});key.shadow.normalBias=.025;scene.add(key);
 const blueLight=new THREE.DirectionalLight('#97c9e1',1.25);blueLight.position.set(7,6,-5);scene.add(blueLight);
 const m=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const mats={wall:m('#273946'),floor:m('#364651',.85),dark:m('#101b22',.56,.45),metal:m('#728a91',.3,.75),brass:m('#c1a16c',.36,.72),wood:m('#84684f',.72),cream:m('#e2d8c5',.58),blue:m('#456b7d',.5,.3),blue2:m('#77a4b4',.45,.3),black:m('#20272a',.8),orange:m('#ce6339',.48,.15),rust:m('#9e7254',.8),screen:new THREE.MeshBasicMaterial({color:'#91c1cd'}),glass:new THREE.MeshPhysicalMaterial({color:'#b1d7dd',transparent:true,opacity:.16,roughness:.15,metalness:0,depthWrite:false,side:THREE.DoubleSide})};
 const root=new THREE.Group();scene.add(root);
 const box=(p,w,h,d,mat,x=0,y=0,z=0,bevel=.035)=>{const mesh=new THREE.Mesh(bevel?new RoundedBoxGeometry(w,h,d,3,Math.min(bevel,w/4,h/4,d/4)):new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh};
 const sphere=(p,r,mat,x,y,z,seg=24)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(12,seg>>1)),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
 const cyl=(p,r,h,mat,x,y,z,r2=r)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r2,h,24),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
 const rod=(p,a,b,r,mat)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),10),mat);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());p.add(o);return o};
 const sign=(parent,text,x,y,z,w=2.4,h=.35)=>{const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#1a303c';ctx.fillRect(0,0,1024,160);ctx.strokeStyle='#9ab1b2';ctx.lineWidth=4;ctx.strokeRect(4,4,1016,152);ctx.fillStyle='#e4dfd3';ctx.font='600 54px system-ui';ctx.letterSpacing='5px';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,82);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);parent.add(mesh)};
 // Room shell, ceiling ribs, skirting and light fixtures.
 box(root,22,.25,12,mats.floor,0,-.15,0,.01);box(root,22,8,.25,mats.wall,0,3.9,-4.6,.01);box(root,.18,7,12,mats.wall,-11,3.4,0,.01);box(root,.18,7,12,mats.wall,11,3.4,0,.01);
 for(let x=-10;x<=10;x+=2){box(root,.08,7,.09,mats.dark,x,3.5,-4.4,.01);box(root,.12,.14,10,mats.dark,x,6.8,.2,.02)}
 box(root,22,.14,.14,mats.wood,0,.15,-4.36,.02);box(root,22,.12,.12,mats.metal,0,5.85,-4.36,.02);
 for(const x of [-7,-2.35,2.35,7]){box(root,2.4,.11,.48,mats.dark,x,6.57,-.6,.04);box(root,2.12,.035,.3,new THREE.MeshBasicMaterial({color:'#e9d6b3'}),x,6.49,-.6,.01);const light=new THREE.PointLight('#ffdfb5',10,7,2);light.position.set(x,5.8,0);scene.add(light)}
 // Low plinths, numbered fascia and actual project photos on a shared back wall.
 const stations={};const active=[];
 for(const [key,p] of Object.entries(projects)){const g=new THREE.Group();g.position.x=p.x;root.add(g);stations[key]=g;
  box(g,3.65,.28,4.25,mats.dark,0,.14,.1,.08);box(g,3.55,.12,4.12,mats.metal,0,.34,.1,.03);box(g,3.42,.16,3.99,mats.wood,0,.47,.1,.025);
  for(const x of [-1.55,1.55])for(const z of [-1.65,1.85]){cyl(g,.055,.14,mats.brass,x,.55,z)}
  sign(g,({strata:'01 / TERRAIN COURSE',drone:'02 / FLIGHT CAGE',orbit:'03 / MISSION CONTROL',wing:'04 / WIND TUNNEL'})[key],0,4.95,-4.32,3.5,.42);
  const hit=box(g,3.8,4.1,4.5,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,2.3,0,0);hit.castShadow=false;hit.receiveShadow=false;hit.userData.station=key;active.push(hit);
  const glow=new THREE.MeshStandardMaterial({color:'#83bdc9',emissive:'#83bdc9',emissiveIntensity:0,roughness:.4,metalness:.5});box(g,3.35,.035,.035,glow,0,.57,2.08,.008);g.userData.glow=glow;
 }
 // Strata: terrain bed, a small representative off-road vehicle, and track markings.
 {const g=stations.strata;box(g,3.08,.12,3.3,mats.rust,0,.64,.1,.05);
  const rock=m('#887d69',.95);for(let i=0;i<18;i++){const o=new THREE.Mesh(new THREE.DodecahedronGeometry(.12+(i%4)*.055,0),rock);o.scale.set(1.5,.48,1);o.position.set(-1.35+(i*1.71)%2.7,.72,-1.3+(i*2.11)%2.9);o.rotation.y=i;g.add(o)}
  const car=new THREE.Group();car.position.set(0,.96,0);car.rotation.y=-.35;g.add(car);box(car,1.72,.18,.85,mats.dark,0,0,0,.06);box(car,1.35,.28,.75,mats.orange,0,.22,0,.04);box(car,.8,.24,.72,mats.orange,-.2,.49,0,.04);
  for(let i=0;i<7;i++)box(car,.028,.35,.8,mats.brass,-.58+i*.17,.35,0,.008);
  for(const x of [-.6,.6])for(const z of [-.48,.48]){const wheel=cyl(car,.27,.19,mats.black,x,-.08,z);wheel.rotation.x=Math.PI/2;const rim=cyl(car,.105,.2,mats.metal,x,-.08,z);rim.rotation.x=Math.PI/2}
  for(const x of [-1.24,1.24]){cyl(g,.06,.55,mats.metal,x,.98,-1.22);sphere(g,.075,mats.brass,x,1.28,-1.22)}sign(g,'STRATA  /  4 × 4',0,.74,1.82,2.6,.24);
 }
 // Flight cage: a framed enclosure with mesh and a suspended multi-rotor.
 {const g=stations.drone;const y=.67;for(const x of [-1.35,1.35])for(const z of [-1.3,1.3])rod(g,[x,y,z],[x,3.6,z],.045,mats.metal);
  for(const h of [y,3.6]){for(const x of [-1.35,1.35])rod(g,[x,h,-1.3],[x,h,1.3],.04,mats.metal);for(const z of [-1.3,1.3])rod(g,[-1.35,h,z],[1.35,h,z],.04,mats.metal)}
  const wire=new THREE.LineBasicMaterial({color:'#8aa7aa',transparent:true,opacity:.25});const pts=[];for(let k=-1.2;k<=1.21;k+=.24){pts.push(new THREE.Vector3(k,y,-1.3),new THREE.Vector3(k,3.6,-1.3));pts.push(new THREE.Vector3(-1.35,y+(k+1.2)*1.18,-1.3),new THREE.Vector3(1.35,y+(k+1.2)*1.18,-1.3))}g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),wire));
  const drone=new THREE.Group();drone.position.set(0,2.05,0);g.add(drone);box(drone,.78,.22,.68,mats.blue,0,0,0,.07);box(drone,.48,.1,.4,mats.dark,0,.18,0,.04);
  const rotors=[];for(const x of [-.9,.9])for(const z of [-.75,.75]){rod(drone,[0,0,0],[x,0,z],.075,mats.dark);cyl(drone,.13,.15,mats.metal,x,.09,z);const rotor=new THREE.Group();rotor.position.set(x,.2,z);drone.add(rotor);box(rotor,.92,.026,.1,mats.cream,0,0,0,.01);box(rotor,.1,.026,.92,mats.cream,0,0,0,.01);cyl(rotor,.07,.08,mats.brass,0,.02,0);rotors.push(rotor)}
  for(const x of [-.3,.3])rod(drone,[x,-.1,-.24],[x,-.52,-.35],.03,mats.metal);g.userData.tick=t=>rotors.forEach((r,i)=>r.rotation.y=t*(i%2?2:-2));sign(g,'PROTOTYPE FLIGHT TEST',0,.74,1.48,2.7,.24);
 }
 // Mission control: a physical console and a suspended globe with three orbital paths.
 {const g=stations.orbit;box(g,2.8,.92,.85,mats.dark,0,1.13,-1,.06);box(g,2.52,.55,.06,mats.blue,0,1.35,-.54,.02);for(let i=0;i<8;i++){const led=sphere(g,.035,i%3?mats.brass:mats.screen,-1.05+i*.3,1.36,-.49,12);led.scale.z=.5}
  box(g,1.2,.85,.09,mats.dark,-.83,2.05,-1.05,.04);box(g,1.05,.69,.015,mats.screen,-.83,2.05,-.99,.005);sign(g,'LOW EARTH ORBIT',-.83,2.08,-.97,.95,.18);
  cyl(g,.11,1.2,mats.metal,.35,1.24,.55);cyl(g,.55,.12,mats.brass,.35,.69,.55);
  const globe=new THREE.Group();globe.position.set(.35,2.2,.55);g.add(globe);sphere(globe,.67,mats.blue,0,0,0,48);
  const lineMat=new THREE.MeshStandardMaterial({color:'#9bc7d3',metalness:.4,roughness:.4});for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.85+i*.18,.012,8,100),i===1?mats.brass:lineMat);ring.rotation.set(.55+i*.36,i*.4,.3+i*.48);globe.add(ring)}
  for(const y of [-.32,0,.32]){const r=Math.sqrt(.67*.67-y*y),ring=new THREE.Mesh(new THREE.TorusGeometry(r,.006,5,64),lineMat);ring.rotation.x=Math.PI/2;ring.position.y=y;globe.add(ring)}g.userData.tick=t=>{globe.rotation.y=t*.13};sign(g,'ORBITAL DEBRIS MODEL',0,.74,1.82,2.7,.24);
 }
 // Wind tunnel: glass chamber with a corrugated wing and directional flow marks.
 {const g=stations.wing;box(g,2.9,.24,1.65,mats.dark,0,1.15,0,.04);for(const x of [-1.45,1.45]){box(g,.16,1.4,1.72,mats.metal,x,1.88,0,.025);for(const z of [-.6,0,.6])box(g,.18,.9,.04,mats.dark,x,1.9,z,.01)}
  box(g,2.65,.035,1.5,mats.metal,0,2.7,0,.01);for(const x of [-1.25,1.25])for(const z of [-.7,.7])rod(g,[x,1.27,z],[x,2.7,z],.025,mats.metal);
  box(g,2.6,1.35,.02,mats.glass,0,1.98,.76,.004);box(g,2.6,1.35,.02,mats.glass,0,1.98,-.76,.004);
  const shape=new THREE.Shape();shape.moveTo(-1,0);for(let i=0;i<=12;i++)shape.lineTo(-1+i/6,i%2?.09:0);shape.lineTo(1,-.045);shape.lineTo(-1,-.045);shape.closePath();const wing=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.52,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2}),mats.cream);wing.rotation.z=.08;wing.position.set(0,1.9,-.26);g.add(wing);
  const lines=new THREE.LineBasicMaterial({color:'#9ac6d3',transparent:true,opacity:.7});for(let j=0;j<4;j++){const p=[];for(let i=0;i<32;i++){let x=-1.23+i*2.46/31;p.push(new THREE.Vector3(x,1.65+j*.2+.04*Math.sin(x*3+j),.42))}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),lines))}sign(g,'CORRUGATED WING',0,.74,1.82,2.6,.24);
 }
 // Peripheral workshop details: wall posters, shelves, instruments and cable runs.
 const picture=new THREE.TextureLoader().load('img/strata-hero.webp',()=>{renderer.shadowMap.needsUpdate=true;wake()});picture.colorSpace=THREE.SRGBColorSpace;
 box(root,2.8,1.7,.1,mats.dark,-8.3,3.5,-4.33,.03);const photo=new THREE.Mesh(new THREE.PlaneGeometry(2.55,1.42),new THREE.MeshBasicMaterial({map:picture}));photo.position.set(-8.3,3.5,-4.26);root.add(photo);
 for(const x of [-10.1,10.1]){box(root,.11,4,.1,mats.dark,x,2.4,-3.9);for(const y of [1,2.1,3.2]){box(root,1.1,.09,.55,mats.wood,x>0?x-.4:x+.4,y,-3.9);for(let j=0;j<3;j++)box(root,.25,.35,.3,j%2?mats.blue:mats.cream,(x>0?x-.7:x+.1)+j*.3,y+.22,-3.9)}}
 const desired=new THREE.Vector3(0,8.4,23),look=new THREE.Vector3(0,1.7,-.2),desiredLook=look.clone(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let t=0,raf=0,last=0,needs=true,hovered=null;
 function size(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;needs=true;wake()}
 selectScene=key=>{const p=projects[key];desired.set(p.x-2.1,4.5,9.4);desiredLook.set(p.x-1,1.9,-.2);needs=true};
 resetScene=()=>{desired.set(0,8.4,23);desiredLook.set(0,1.7,-.2);needs=true};
 function frame(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;const f=reduce?1:1-Math.exp(-3.8*dt);camera.position.lerp(desired,f);look.lerp(desiredLook,f);camera.lookAt(look);const moving=camera.position.distanceTo(desired)>.012||look.distanceTo(desiredLook)>.012;
  if(selected&&!reduce){t+=dt;stations[selected].userData.tick?.(t)}
  if(moving||needs||selected&&!reduce){renderer.render(scene,camera);needs=false}if(moving||selected&&!reduce)raf=requestAnimationFrame(frame);
 }
 wake=()=>{if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(active)[0],key=hit?.object.userData.station||null;canvas.style.cursor=key?'pointer':'default';if(key!==hovered){hovered=key;Object.entries(stations).forEach(([k,g])=>g.userData.glow.emissiveIntensity=k===key?.8:0);needs=true;wake()}});
 canvas.addEventListener('pointerleave',()=>{hovered=null;Object.values(stations).forEach(g=>g.userData.glow.emissiveIntensity=0);needs=true;wake()});
 canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(active)[0];if(hit)select(hit.object.userData.station)});
 window.addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){needs=true;wake()}});
 new ResizeObserver(size).observe(stage);size();if(selected)selectScene(selected);wake();
}
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible){if(!initialized)init().catch(()=>{failed=true;fallback.hidden=false});else wake()}},{threshold:.01});observer.observe(stage);
