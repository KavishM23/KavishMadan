/* The Code journey: a baked stairwell with its own renderer. Everything here is an enhancement.
   Without WebGL, or with reduced motion, the same HTML reads as an ordinary page. */
(function(){
const journey=document.getElementById('code-journey');if(!journey)return;
const root=document.documentElement,L=window.codeLayout,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sticky=journey.querySelector('.journey-sticky'),canvas=document.getElementById('journey-canvas'),flash=journey.querySelector('.journey-flash'),loadBar=journey.querySelector('.journey-load i');
const panels=[...journey.querySelectorAll('.journey-project')],intro=journey.querySelector('.journey-heading'),stops=[...journey.querySelectorAll('[data-journey-stop]')];
const KEYS=['lastbite','tutortime','kungfooled'],markers=KEYS.map(k=>document.getElementById({lastbite:'b-lastbite',tutortime:'b-tutortime',kungfooled:'b-kungfooled'}[k]));
/* Each tab or feature picks a real screen. box marks the part of the screen the text is about. */
const SCREENS={
 lastbite:{what:[{src:'img/code/lb-list.webp',box:[.01,.28,.98,.48]},{src:'img/code/lb-list.webp',box:[.405,.875,.19,.09]},{src:'img/code/lb-donate.webp',box:[.54,.17,.45,.8]}],why:{src:'img/code/lb-home.webp'},mine:{src:'img/code/lb-visual.webp'}},
 tutortime:{what:[{src:'img/code/tt-match.webp',box:[.19,.1,.72,.54]},{src:'img/code/tt-calendar.webp',box:[.19,.1,.76,.86]},{src:'img/code/tt-scores.webp',box:[.19,.42,.72,.56]}],why:{src:'img/code/tt-dashboard.webp'},mine:{src:'img/code/tt-payments.webp'}},
 kungfooled:{what:[{src:'img/kf-arcade.webp'},{cycle:['img/kf-retro.webp','img/kf-woodblock.webp','img/kf-cyber.webp']},{src:'img/kf-map.webp'}],why:{src:'img/kf-title.webp'},mine:{src:'img/kf-title.webp'}}
};
let showScreen=()=>{},setHover=()=>{};
/* Tabs and features work with or without the 3D scene. */
panels.forEach(panel=>{
 const key=panel.dataset.project,tabs=[...panel.querySelectorAll('[role=tab]')],bodies=[...panel.querySelectorAll('[role=tabpanel]')],features=[...panel.querySelectorAll('.stop-feature')],img=panel.querySelector('.journey-image'),box=panel.querySelector('.shot-box');
 const pick=shot=>{const s=shot.cycle?{src:shot.cycle[0]}:shot;if(img)img.src=s.src;if(box){box.hidden=!shot.box;if(shot.box){const [x,y,w,h]=shot.box;box.style.cssText=`left:${x*100}%;top:${y*100}%;width:${w*100}%;height:${h*100}%`}}showScreen(key,shot)};
 panel._current=SCREENS[key].what[0];
 const select=i=>{tabs.forEach((t,k)=>{t.setAttribute('aria-selected',String(k===i));t.tabIndex=k===i?0:-1;bodies[k].hidden=k!==i});const name=['what','why','mine'][i];let shot=SCREENS[key][name];if(i===0){const on=Math.max(0,features.findIndex(f=>f.getAttribute('aria-pressed')==='true'));shot=SCREENS[key].what[on]}panel._current=shot;pick(shot)};
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();const n=(i+d+tabs.length)%tabs.length;select(n);tabs[n].focus({preventScroll:true})})});
 const feature=i=>{features.forEach((f,k)=>f.setAttribute('aria-pressed',String(k===i)));panel._current=SCREENS[key].what[i];pick(panel._current)};
 features.forEach((f,i)=>{f.addEventListener('click',()=>feature(i));f.addEventListener('pointerenter',()=>feature(i));f.addEventListener('focus',()=>feature(i))});
 pick(panel._current);
});
function canUseGL(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}}
let live=false,failed=false,lastActive=-2,lastNear=-2,p=0;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),smooth=t=>t*t*(3-2*t),smoother=t=>t*t*t*(t*(6*t-15)+10);
function distance(){return Math.max(1,journey.offsetHeight-innerHeight)}
function measure(){
 live=!reduced&&!failed&&innerHeight>=560&&canUseGL();root.classList.toggle('spiral-ready',live);
 const d=distance();
 markers.forEach((m,i)=>{if(!m)return;if(live)journey.insertBefore(m,journey.firstChild);else panels[i].before(m);m.style.top=live?(d*L.anchors[i])+'px':''});
 if(!live){intro.inert=false;journey.classList.remove('departed','arrived','at-stop');lastActive=-2;panels.forEach(q=>{q.inert=false;q.removeAttribute('aria-hidden');q.classList.remove('is-current')});stops.forEach(a=>a.removeAttribute('aria-current'))}
}
function states(){
 journey.classList.toggle('departed',p>.02);journey.classList.toggle('arrived',p>.93);
 let active=-1;L.holds.forEach(([a,b],i)=>{if(p>=a-.012&&p<=b+.012)active=i});
 journey.classList.toggle('at-stop',active>=0);
 if(active!==lastActive){lastActive=active;panels.forEach((q,i)=>{q.classList.toggle('is-current',i===active);q.inert=i!==active;q.setAttribute('aria-hidden',String(i!==active))});intro.inert=p>.02;
}
 const near=p>.9?3:p>.6?2:p>.36?1:p>.1?0:-1;if(near!==lastNear){lastNear=near;stops.forEach((a,i)=>{if(i===near)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}
 flash.style.opacity=String(Math.max(0,1-Math.abs(p-L.flash)/.011));
}
async function boot(){
 const THREE=await import('three');
 const narrow=()=>innerWidth<=760;
 journey.classList.add('is-loading');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})}catch(e){throw e}
 let ratio=Math.min(devicePixelRatio||1,narrow()?1.25:1.5);renderer.setPixelRatio(ratio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0b161d');
 const camera=new THREE.PerspectiveCamera(40,1,.1,190);scene.add(camera);
 // Live lights reach only the drone and the gate. Everything baked ignores them.
 scene.add(new THREE.HemisphereLight('#d8e4ec','#54463a',.9));const key=new THREE.DirectionalLight('#fff0dc',1.5);key.position.set(-6,14,9);scene.add(key);const rim=new THREE.DirectionalLight('#9ac6e8',.9);rim.position.set(7,4,-8);scene.add(rim);
 const base='assets/models/code/',shared='assets/models/vending/workshop/',loader=new THREE.TextureLoader(),maxAniso=Math.min(narrow()?4:8,renderer.capabilities.getMaxAnisotropy());
 const texture=(file,srgb)=>new Promise((res,rej)=>loader.load(file,t=>{t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=maxAniso;if(srgb)t.colorSpace=THREE.SRGBColorSpace;res(t)},undefined,rej));
 const [{GLTFLoader},{MeshoptDecoder},{RoundedBoxGeometry}]=await Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),import('three/addons/geometries/RoundedBoxGeometry.js')]);
 const gltf=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 const manifest=await (await fetch(base+'manifest.json')).json();let done=0;const total=manifest.textures.length+manifest.shared.length+Object.keys(manifest.lightmaps).length+3,step=v=>{loadBar.style.setProperty('--load',Math.round(++done/total*100)+'%');return v};
 const tex={},maps={},isColour=n=>/_a$|prints$/.test(n);
 const [world,movers,droneFile]=await Promise.all([gltf.loadAsync(base+'world.glb').then(step),gltf.loadAsync(base+'movers.glb').then(step),gltf.loadAsync(base+'drone.glb').then(step),
  ...manifest.textures.map(async n=>{tex[n]=step(await texture(`${base}${n}.webp`,isColour(n)))}),...manifest.shared.map(async n=>{tex[n]=step(await texture(`${shared}${n}.webp`,isColour(n)))}),
  ...Object.entries(manifest.lightmaps).map(async ([g,l])=>{const t=await texture(`${base}lm-${g}${narrow()?'-sm':''}.webp`,true);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.channel=1;maps[g]={t,scale:l.scale};step()})]);
 const quiet=s=>{s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_maps>','irradiance=vec3(0.);\n#include <lights_fragment_maps>').replace('#include <lights_fragment_end>','iblIrradiance=vec3(0.);\n#include <lights_fragment_end>\nreflectedLight.directDiffuse=vec3(0.);reflectedLight.directSpecular=vec3(0.);')};
 const mats={};
 function material(name,group){
  const id=name+'|'+group;if(mats[id])return mats[id];const r=manifest.materials[name]||{};let m;
  const map=r.tex==='code_prints'?tex.code_prints:r.tex?tex[r.tex+'_a']:null;
  if(r.glow){m=new THREE.MeshBasicMaterial({color:new THREE.Color(r.emit||'#fff').multiplyScalar(Math.min(2.4,Math.max(1,r.emit_str||1))),map,toneMapped:false})}
  else{m=new THREE.MeshStandardMaterial({color:r.color,roughness:r.rough??.6,metalness:(r.metal??0)*.62,map});if(r.tex&&tex[r.tex+'_r']){m.roughnessMap=tex[r.tex+'_r'];m.roughness=1}
   if(maps[group]){m.lightMap=maps[group].t;m.lightMapIntensity=Math.PI*maps[group].scale;m.onBeforeCompile=quiet;m.customProgramCacheKey=()=>'baked'}m.envMapIntensity=r.metal>.5?1.4:.3}
  m.name=name;return mats[id]=m;
 }
 const named={};
 world.scene.traverse(o=>{if(!o.isMesh)return;const [g,n]=o.name.includes('__')?o.name.split('__'):[null,o.material.name];o.material=material(n,g);named[o.name]=o});scene.add(world.scene);scene.add(movers.scene);
 // The gate keeps its own model and lights, standing in the brick lobby above the stairwell.
 const entrance=new THREE.Group();entrance.position.set(L.gate.x,L.gate.y,L.gate.z);entrance.scale.setScalar(L.gate.scale);scene.add(entrance);
 const masonry=window.createMasonry({THREE,anisotropy:maxAniso});const gate=window.createMoroccanGate({THREE,Round:RoundedBoxGeometry,parent:entrance,wallLeft:-7.2,wallRight:2.8,wallHeight:3.5,masonry,anisotropy:maxAniso});gate.swing(0);
 // Reflections are captured from the baked rooms.
 const pmrem=new THREE.PMREMGenerator(renderer),capture=(x,y,z)=>{const rt=new THREE.WebGLCubeRenderTarget(96,{type:THREE.HalfFloatType}),cc=new THREE.CubeCamera(.1,60,rt);cc.position.set(x,y,z);cc.update(renderer,scene);const e=pmrem.fromCubemap(rt.texture).texture;rt.dispose();return e};
 const envShaft=capture(...L.at(L.stops[0].theta,7,L.stops[0].y+4)),envHall=capture(0,L.gate.y+5,14);pmrem.dispose();
 for(const m of Object.values(mats))if(m.isMeshStandardMaterial){m.envMap=envShaft;m.needsUpdate=true}
 entrance.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial){o.material.envMap=envHall}});
 // Physical screens: a canvas per stop, with the annotation drawn on it.
 const screens={};
 for(const k of KEYS){const c=document.createElement('canvas');c.width=1280;c.height=800;const t=new THREE.CanvasTexture(c);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;const mesh=movers.scene.getObjectByName('mover_screen_'+k);mesh.material=new THREE.MeshBasicMaterial({map:t,toneMapped:false});screens[k]={c,g:c.getContext('2d'),t,mesh,shot:null,img:null,fade:1,prev:null,cycle:0,hover:0}}
 const images={},image=src=>images[src]||(images[src]=new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src}));
 function paint(k){const s=screens[k],g=s.g,W=1280,H=800;if(s.prev)g.drawImage(s.prev,0,0,W,H);if(s.img){g.globalAlpha=s.prev?s.fade:1;g.drawImage(s.img,0,0,W,H);g.globalAlpha=1}
  const b=s.shot?.box;if(b&&s.fade>=1){const x=b[0]*W,y=b[1]*H,w=b[2]*W,h=b[3]*H;g.fillStyle='rgba(8,16,22,.34)';g.beginPath();g.rect(0,0,W,H);g.roundRect(x,y,w,h,14);g.fill('evenodd');g.strokeStyle='#d9b37a';g.lineWidth=5;g.beginPath();g.roundRect(x,y,w,h,14);g.stroke()}
  s.t.needsUpdate=true;dirty=true}
 showScreen=async(k,shot)=>{const s=screens[k];if(!s)return;s.shot=shot;const src=shot.cycle?shot.cycle[s.cycle%shot.cycle.length]:shot.src,i=await image(src);if(s.shot!==shot&&!shot.cycle)return;s.prev=s.img;s.img=i;s.fade=s.prev&&!reduced?0:1;paint(k);wake()};
 panels.forEach(q=>showScreen(q.dataset.project,q._current));
 let attract=0;
 // The route: spans of scroll, each a list of camera and drone points.
 const V=(...a)=>new THREE.Vector3(...a),H=L.height,AT=(t,r,y)=>V(...L.at(t,r,y)),stopAt=(i,a)=>V(...L.fromStop(L.stops[i],...a));
 const heli=t=>{const h=L.heli(t);return{e:V(...h.eye),l:V(...h.look),d:V(...h.drone),f:44}};
 const shot=(i,w)=>{const v=L.shots[KEYS[i]][w];return{e:stopAt(i,v.eye),l:stopAt(i,v.look),d:stopAt(i,L.hover[KEYS[i]]),f:w==='close'?30:40}};
 const span=(a,b,pts)=>({a,b,pts});const G=L.gate,sweep=(t0,t1,n)=>Array.from({length:n+1},(_,i)=>heli(t0+(t1-t0)*i/n));
 const padA=L.thetaEnd-.1,padP=AT(padA,7.4,L.floorY+.62);
 const tracks=[
  span(.0,.03,[{e:V(0,G.y+5.2,27),l:V(0,G.y+4.5,0),d:V(5.4,G.y+6.8,10),f:36}]),
  span(.03,.095,[{e:V(0,G.y+5.2,27),l:V(0,G.y+4.5,0),d:V(5.4,G.y+6.8,10),f:36},{e:V(0,G.y+4.2,10.2),l:V(0,G.y+3.8,0),d:V(.2,G.y+4.6,6.4),f:38}]),
  span(.095,.2,[...sweep(.05,L.stops[0].theta-1.15,5),shot(0,'wide'),shot(0,'close')]),
  span(.2,.3,[shot(0,'close')]),
  span(.3,.43,[shot(0,'close'),shot(0,'wide'),...sweep(L.stops[0].theta+.95,L.stops[1].theta-1.15,5),shot(1,'wide'),shot(1,'close')]),
  span(.43,.53,[shot(1,'close')]),
  span(.53,.66,[shot(1,'close'),shot(1,'wide'),...sweep(L.stops[1].theta+.95,L.stops[2].theta-1.15,5),shot(2,'wide'),shot(2,'close')]),
  span(.66,.76,[shot(2,'close')]),
  span(.76,.9,[shot(2,'close'),shot(2,'wide'),...sweep(L.stops[2].theta+.95,L.thetaEnd-1.2,4),{e:AT(L.thetaEnd-1.05,9.6,L.floorY+9.6),l:AT(padA-.28,5.6,L.floorY+.8),d:padP.clone().add(V(0,2.4,0)),f:46}]),
  span(.9,1,[{e:AT(L.thetaEnd-1.05,9.6,L.floorY+9.6),l:AT(padA-.28,5.6,L.floorY+.8),d:padP,f:46}])
 ];
 const cat=(a,b,c,d,u,o)=>{const u2=u*u,u3=u2*u;return o.set(.5*(2*b.x+(c.x-a.x)*u+(2*a.x-5*b.x+4*c.x-d.x)*u2+(3*b.x-a.x-3*c.x+d.x)*u3),.5*(2*b.y+(c.y-a.y)*u+(2*a.y-5*b.y+4*c.y-d.y)*u2+(3*b.y-a.y-3*c.y+d.y)*u3),.5*(2*b.z+(c.z-a.z)*u+(2*a.z-5*b.z+4*c.z-d.z)*u2+(3*b.z-a.z-3*c.z+d.z)*u3))};
 const eye=V(),look=V(),aim=V();let fov=36;
 function route(q){const s=tracks.find(x=>q<=x.b)||tracks[tracks.length-1],n=s.pts.length-1;let f;if(n===0){const o=s.pts[0];eye.copy(o.e);look.copy(o.l);aim.copy(o.d);fov=o.f;return}
  const u=smoother(clamp((q-s.a)/(s.b-s.a)))*n,i=Math.min(n-1,Math.floor(u)),t=u-i,P=k=>s.pts[clamp(k,0,n)];
  cat(P(i-1).e,P(i).e,P(i+1).e,P(i+2).e,t,eye);cat(P(i-1).l,P(i).l,P(i+1).l,P(i+2).l,t,look);cat(P(i-1).d,P(i).d,P(i+1).d,P(i+2).d,t,aim);fov=P(i).f+(P(i+1).f-P(i).f)*t}
 const droneRoot=droneFile.scene,props=[];droneRoot.traverse(o=>{if(/^mover_prop\d$/.test(o.name))props.push(o);if(o.isMesh){o.material.envMap=envShaft;o.material.envMapIntensity=.9}});
 const dbox=new THREE.Box3().setFromObject(droneRoot),dc=dbox.getCenter(V());droneRoot.position.sub(dc);const drone=new THREE.Group();drone.add(droneRoot);drone.scale.setScalar(3.5);scene.add(drone);
 route(0);drone.position.copy(aim);
 const vel=V(),prev=V(),push=V(),pointer=new THREE.Vector2(9,9),ndc=V(),right=V(),up=V(),ray=new THREE.Raycaster();ray.layers.enableAll();
 let visible=false,raf=0,last=0,lastRender=0,dirty=true,qShown=0,camShift=0,rollNow=0,pitchNow=0,yawNow=0,slow=0,count=0,sum=0,lastTrack=0,hot=null,doorShown=-1;
 function size(){const r=sticky.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();dirty=true;wake()}
 function adapt(dt){sum+=dt;if(++count<50)return;const ms=sum/count*1000;count=0;sum=0;if(ms>30&&slow<2){slow++;ratio=Math.max(.85,ratio*.82);renderer.setPixelRatio(ratio);size()}}
 function frame(now){raf=0;if(!live||!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);if(last)adapt((now-last)/1000);last=now;
  const rect=journey.getBoundingClientRect();p=clamp(-rect.top/distance());
  const before=qShown;qShown+=(p-qShown)*(1-Math.exp(-7*dt));if(Math.abs(p-qShown)<.00002)qShown=p;
  // Crossing the threshold is a cut hidden by the flash, so the drone must not streak between rooms.
  const side=qShown<L.flash?0:1;route(qShown);if(side!==lastTrack){lastTrack=side;drone.position.copy(aim);vel.set(0,0,0)}
  camera.position.copy(eye);camera.fov=fov;
  camera.lookAt(look);
  // Keep the subject clear of the text: left of the frame on desktop, top of the frame on phones.
  const holdW=L.holds.reduce((m,[a,b])=>Math.max(m,smooth(clamp(1-Math.max(a-qShown,qShown-b,0)/.03))),0),gateW=1-smooth(clamp(qShown/.03));camShift+=((Math.max(holdW,gateW))-camShift)*(1-Math.exp(-6*dt));
  const w=renderer.domElement.width,h=renderer.domElement.height;if(narrow())camera.setViewOffset(w,h,0,h*.2*camShift,w,h);else camera.setViewOffset(w,h,-w*.17*camShift,0,w,h);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  // At a stop the drone holds station in the top corner of the frame, clear of the screen and the text.
  if(holdW>.001){const near=narrow(),dist=near?7.5:4.4,ht=Math.tan(camera.fov*Math.PI/360)*dist;prev.setFromMatrixColumn(camera.matrixWorld,2).multiplyScalar(-dist).add(eye);prev.addScaledVector(right.setFromMatrixColumn(camera.matrixWorld,0),(near?.5:.44)*ht*camera.aspect).addScaledVector(up.setFromMatrixColumn(camera.matrixWorld,1),(near?.3:.46)*ht);aim.lerp(prev,holdW)}
  // The door opens with scroll, then the camera goes through it into the light.
  const door=smooth(clamp((qShown-.022)/.05));if(Math.abs(door-doorShown)>.001){gate.swing(door,0);doorShown=door}
  entrance.visible=qShown<L.flash+.004;
  // Drone: a weighted follower. It leans into its motion and keeps clear of the pointer.
  right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);ndc.copy(drone.position).project(camera);const dx=(ndc.x-pointer.x)*camera.aspect,dy=ndc.y-pointer.y,dist=Math.hypot(dx,dy),away=dist<.34?(1-dist/.34):0;push.lerp(prev.copy(right).multiplyScalar(dx/(dist||1)).addScaledVector(up,dy/(dist||1)).multiplyScalar(away*1.1),1-Math.exp(-5*dt));
  const stiff=narrow()?9:11,target=prev.copy(aim).add(push);target.y+=Math.sin(now*.0016)*.06+Math.sin(now*.0007)*.04;
  vel.addScaledVector(prev.sub(drone.position).multiplyScalar(stiff).addScaledVector(vel,-6.2),dt);drone.position.addScaledVector(vel,dt);
  const speed=vel.length(),land=clamp((qShown-.9)/.08);
  const yawGoal=speed>.5?Math.atan2(vel.x,vel.z):yawNow;let dy2=yawGoal-yawNow;dy2=Math.atan2(Math.sin(dy2),Math.cos(dy2));yawNow+=dy2*(1-Math.exp(-3*dt));
  pitchNow+=(clamp(speed*.05,0,.32)-pitchNow)*(1-Math.exp(-4*dt));rollNow+=(clamp(dy2*.5,-.34,.34)-rollNow)*(1-Math.exp(-4*dt));drone.rotation.set(pitchNow*(1-land),yawNow,rollNow*(1-land),'YXZ');
  const spin=(16+speed*3)*(1-land*.97);props.forEach((q,i)=>q.rotation.y+=spin*dt*(i%2?1:-1));
  // cross-fading screens and the realm cycle on the arcade
  for(const k of KEYS){const s=screens[k];if(s.fade<1){s.fade=Math.min(1,s.fade+dt*3.4);paint(k)}}
  if(s3cycle(now))dirty=true;
  states();
  if(now-lastRender>=(narrow()?40:30)){renderer.render(scene,camera);lastRender=now;dirty=false}
  raf=requestAnimationFrame(frame);
 }
 function s3cycle(now){const k='kungfooled',s=screens[k];if(!s.shot?.cycle||lastActive!==2||now-attract<2400)return false;attract=now;s.cycle++;showScreen(k,s.shot);return true}
 const wake=()=>{if(live&&visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
 // The physical screens open the same story as the button beside them.
 const screenAt=e=>{if(lastActive<0)return null;const r=canvas.getBoundingClientRect();const n=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);const s=screens[KEYS[lastActive]];ray.setFromCamera(n,camera);return ray.intersectObject(s.mesh).length?KEYS[lastActive]:null};
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);hot=screenAt(e);canvas.classList.toggle('is-hot',!!hot)});
 canvas.addEventListener('pointerleave',()=>{pointer.set(9,9);hot=null;canvas.classList.remove('is-hot')});
 canvas.addEventListener('click',e=>{const k=screenAt(e);if(k)panels[KEYS.indexOf(k)].querySelector('.cs-open').click()});
 new IntersectionObserver(es=>{visible=es.some(x=>x.isIntersecting);if(visible)wake()},{threshold:.01}).observe(sticky);
 document.addEventListener('visibilitychange',wake);new ResizeObserver(size).observe(sticky);size();
 if(/[?&]journeylab\b/.test(location.search))window.__journey={THREE,scene,camera,renderer,drone,screens,tracks,L,named,get q(){return qShown},route(q){route(q);return{eye:eye.toArray(),look:look.toArray(),aim:aim.toArray(),fov}},fps(ms){return new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;performance.now()-t0<ms?requestAnimationFrame(f):r(+(n/(ms/1000)).toFixed(1))};requestAnimationFrame(f)})},get droneNdc(){const v=drone.position.clone().project(camera);return [+v.x.toFixed(2),+v.y.toFixed(2)]}};
 journey.classList.remove('is-loading');journey.classList.add('is-ready');wake();
}
measure();addEventListener('resize',measure);
let started=false;const start=()=>{if(started||!live)return;started=true;boot().catch(e=>{console.warn('Code stairwell unavailable',e);failed=true;journey.classList.remove('is-loading');measure()})};
new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting))start()},{rootMargin:'300px'}).observe(journey);
window.addEventListener('scroll',()=>{if(!live)return;p=clamp(-journey.getBoundingClientRect().top/distance());if(started)states()},{passive:true});
if(live){states();requestAnimationFrame(()=>{const i=['#b-lastbite','#b-tutortime','#b-kungfooled'].indexOf(location.hash);if(i>=0)markers[i].scrollIntoView({behavior:'instant'})})}
})();
