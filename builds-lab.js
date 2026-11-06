/* The project machine: a baked workshop scene, with ordinary HTML project controls.
   All room light comes from lightmaps, so the only live lights are for the products. */
(function(){
const stage=document.getElementById('testlab-stage'),canvas=document.getElementById('testlab-canvas');
const card=document.getElementById('testlab-card'),hint=document.getElementById('testlab-hint'),fallback=document.getElementById('testlab-fallback');
const nav=[...document.querySelectorAll('[data-lab]')],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const projects={
 strata:{tag:'PROJECT 01 / ENGINEERING',name:'Project Strata',desc:'A 4×4 designed, built and tested by a team of six. Second in the UAE.',href:'#b-4x4'},
 drone:{tag:'PROJECT 02 / PROTOTYPING',name:'Anti-drone quads',desc:'Circuits, sensors and C code for quadcopter prototypes in Chennai.',href:'#b-quad'},
 orbit:{tag:'PROJECT 03 / RESEARCH',name:'Kessler model',desc:'A Python simulation exploring collision cascades in low Earth orbit.',href:'#b-kessler'},
 wing:{tag:'PROJECT 04 / BIOMIMICRY',name:'Dragonfly wing',desc:'A team experiment investigating a corrugated UAV wing inspired by nature.',href:'#b-wing'}
};
let selectScene=()=>false,resetScene=()=>{},wake=()=>{},hoverScene=()=>{},selected=null,sequence=0;
function showCard(key,token){if(token!==sequence||selected!==key)return;stage.classList.remove('is-dispensing');card.hidden=false;}
function select(key){const p=projects[key];if(!p||selected===key)return;const token=++sequence;selected=key;stage.classList.add('has-selection','is-dispensing');card.hidden=true;document.getElementById('testlab-tag').textContent=p.tag;document.getElementById('testlab-name').textContent=p.name;document.getElementById('testlab-desc').textContent=p.desc;document.getElementById('testlab-link').href=p.href;hint.hidden=true;nav.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lab===key)));const animated=selectScene(key,()=>showCard(key,token));if(!animated)showCard(key,token);wake()}
function reset(){const was=nav.find(b=>b.dataset.lab===selected);++sequence;selected=null;stage.classList.remove('has-selection','is-dispensing');card.hidden=true;hint.hidden=false;nav.forEach(b=>b.setAttribute('aria-pressed','false'));resetScene();wake();return was}
nav.forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(b.dataset.lab));for(const k of ['pointerenter','focus'])b.addEventListener(k,()=>hoverScene(b.dataset.lab));for(const k of ['pointerleave','blur'])b.addEventListener(k,()=>hoverScene(null))});
document.getElementById('testlab-back').addEventListener('click',()=>reset()?.focus());
stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected)reset()?.focus()});
window.addEventListener('hashchange',()=>{if(location.hash==='#builds'&&selected)reset()});
let initialized=false,visible=false,failed=false;
const BASE='assets/models/vending/';
async function init(){
 if(initialized||failed)return;initialized=true;
 const THREE=await import('three');
 const narrow=matchMedia('(max-width:760px)').matches,G=window.projectMachineLayout,loadBar=document.getElementById('testlab-load');
 const progress=f=>{if(loadBar)loadBar.style.setProperty('--load',Math.round(f*100)+'%')};
 stage.classList.add('is-loading');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){return noScene()}
 function noScene(){failed=true;stage.classList.remove('is-loading');stage.classList.add('no-scene');fallback.hidden=false}
 let ratio=Math.min(devicePixelRatio||1,narrow?1.25:1.5);renderer.setPixelRatio(ratio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#0d171d');
 const camera=new THREE.PerspectiveCamera(35,1,.1,70);camera.layers.enable(1);scene.add(camera);
 const machine=new THREE.Group();machine.position.x=G.machineX;scene.add(machine);
 // Live lights touch only the products, coils and moving parts. Baked surfaces ignore them.
 const key=new THREE.DirectionalLight('#ffe9cf',1.5);key.position.set(-2.4,9,7.5);key.target.position.set(.6,3,.4);key.castShadow=true;key.shadow.mapSize.setScalar(narrow?512:1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:5,bottom:-4,near:1,far:18});key.shadow.bias=-.0006;key.shadow.radius=5;scene.add(key,key.target);
 const fill=new THREE.DirectionalLight('#9cc6de',.55);fill.position.set(7,4,4);scene.add(fill);
 const bay=new THREE.PointLight('#ffe9c8',9,6,2);bay.position.set(.65,5.2,1.55);scene.add(bay);
 const showKey=new THREE.PointLight('#fff1dc',0,9,2),showRim=new THREE.PointLight('#a9d7e6',0,9,2);camera.add(showKey,showRim);showKey.position.set(-1.5,2.6,-1.4);showRim.position.set(2.8,1.4,-6.4);
 const veil=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#0b161d',transparent:true,opacity:0,depthWrite:false,toneMapped:false}));veil.position.z=-7.4;veil.visible=false;veil.layers.set(1);camera.add(veil);
 const [{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js')]);
 const gltfLoader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),texLoader=new THREE.TextureLoader(),maxAniso=Math.min(narrow?4:8,renderer.capabilities.getMaxAnisotropy());
 const texture=(file,srgb)=>new Promise((res,rej)=>texLoader.load(file,t=>{t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=maxAniso;if(srgb)t.colorSpace=THREE.SRGBColorSpace;res(t)},undefined,rej));
 let manifest,room,tex={},maps={};
 try{
  manifest=await (await fetch(BASE+'workshop/manifest.json')).json();const suffix=narrow?'-1k':'';
  const names=manifest.textures,total=names.length+4;let done=0;const step=p=>{progress(++done/total);return p};
  await Promise.all([...names.map(async n=>{tex[n]=step(await texture(`${BASE}workshop/${n}.webp`,/_a$|^prints$/.test(n)))}),
   ...Object.entries(manifest.lightmaps).map(async ([g,l])=>{const t=await texture(`${BASE}workshop/lm-${g}${suffix}.webp`,true);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.channel=1;maps[g]={t,scale:l.scale};step()}),
   Promise.all([gltfLoader.loadAsync(BASE+'workshop/workshop.glb'),gltfLoader.loadAsync(BASE+'workshop/movers.glb')]).then(([a,b])=>{room=a.scene;room.add(b.scene);step()})]);
 }catch(e){console.warn('Workshop scene unavailable',e);renderer.dispose();return noScene()}
 const reflect={rt:new THREE.WebGLRenderTarget(narrow?320:640,narrow?200:400,{depthBuffer:true,type:THREE.HalfFloatType}),matrix:new THREE.Matrix4(),on:!narrow,dirty:true,cam:new THREE.PerspectiveCamera()};
 const quiet=s=>{s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_maps>','irradiance=vec3(0.);\n#include <lights_fragment_maps>').replace('#include <lights_fragment_end>','iblIrradiance=vec3(0.);\n#include <lights_fragment_end>\nreflectedLight.directDiffuse=vec3(0.);reflectedLight.directSpecular=vec3(0.);')};
 const mats={},bakedMats=[];
 function material(name,group){
  const id=name+'|'+group;if(mats[id])return mats[id];const r=manifest.materials[name]||{};let m;
  const map=r.tex==='prints'?tex.prints:r.tex?tex[r.tex+'_a']:null;
  if(r.glow||r.emit&&!group){m=new THREE.MeshBasicMaterial({color:new THREE.Color(r.emit||'#fff').multiplyScalar(r.emit_str>6?2.4:Math.max(1,r.emit_str||1)),map,toneMapped:false})}
  else if(r.glass){m=new THREE.MeshPhysicalMaterial({color:r.color,roughness:.05,metalness:0,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide})}
  else if(name==='flap_smoke'){m=new THREE.MeshPhysicalMaterial({color:r.color,roughness:.2,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide})}
  else{
   m=new THREE.MeshStandardMaterial({color:r.color,roughness:r.rough??.6,metalness:(r.metal??0)*(group?.62:1),map});
   if(r.tex&&tex[r.tex+'_r']){m.roughnessMap=tex[r.tex+'_r'];m.roughness=1}
   if(group&&maps[group]){m.lightMap=maps[group].t;m.lightMapIntensity=Math.PI*maps[group].scale;m.onBeforeCompile=name==='floor'?floorShader:quiet;m.customProgramCacheKey=()=>name==='floor'?'floor':'baked';bakedMats.push(m)}
   m.envMapIntensity=r.metal>.5?1.5:.3;if(r.emit){m.emissive=new THREE.Color(r.emit);m.emissiveIntensity=r.emit_str||1}
  }
  m.name=name;return mats[id]=m;
 }
 const floorU={tReflect:{value:reflect.rt.texture},uMirror:{value:reflect.matrix},uAmount:{value:reflect.on?1:0}};
 function floorShader(s){quiet(s);Object.assign(s.uniforms,floorU);
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform mat4 uMirror;varying vec4 vMirror;varying vec3 vFloorW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 fw=modelMatrix*vec4(position,1.);vMirror=uMirror*fw;vFloorW=fw.xyz;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tReflect;uniform float uAmount;varying vec4 vMirror;varying vec3 vFloorW;')
  .replace('#include <opaque_fragment>',`if(uAmount>0.){vec2 uvR=vMirror.xy/vMirror.w;vec3 sum=vec3(0.);float w=0.;float gloss=clamp(1.15-roughnessFactor*1.2,0.,1.);for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){float k=exp(-float(i*i+j*j)*.35);sum+=texture2D(tReflect,uvR+vec2(float(i)*.0028,float(j)*.0052)).rgb*k;w+=k;}sum/=w;vec3 toCam=normalize(cameraPosition-vFloorW);float fres=pow(1.-clamp(toCam.y,0.,1.),2.6);outgoingLight+=sum*(.05+.5*fres)*gloss*uAmount;}\n#include <opaque_fragment>`)}
 const named={};
 room.traverse(o=>{if(!o.isMesh)return;const [group,name]=o.name.includes('__')?o.name.split('__'):[null,o.material?.name];o.material=material(name||o.material.name,group);o.matrixAutoUpdate=!!o.name.startsWith('mover');named[o.name]=o;if(!o.name.startsWith('mover')){o.updateMatrix()}});
 scene.add(room);room.updateMatrixWorld(true);
 // Glows and light pools, drawn cheaply as additive cards so no bloom pass is needed.
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.18,'rgba(255,255,255,.34)');r.addColorStop(.5,'rgba(255,255,255,.08)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
 for(const [x,y,z,s,col,op] of manifest.glows){const p=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op}));p.position.set(x,y,z);p.scale.setScalar(s);scene.add(p)}
 for(const [x,y,z] of manifest.pendants.slice(0,2)){const cone=new THREE.Mesh(new THREE.CylinderGeometry(.42,2.1,5.2,28,1,true),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{},vertexShader:'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying float vY;varying vec3 vN;varying vec3 vV;void main(){float e=pow(abs(dot(vN,vV)),2.2);gl_FragColor=vec4(vec3(1.,.82,.58)*e*vY*vY*.1,1.);}'}));cone.position.set(x,y-2.7,z);scene.add(cone)}
 // Reflections come from a capture of the baked room itself.
 const pmrem=new THREE.PMREMGenerator(renderer);const cubeRT=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType});const cubeCam=new THREE.CubeCamera(.1,40,cubeRT);cubeCam.position.set(.6,3.6,5.5);cubeCam.update(renderer,scene);const env=pmrem.fromCubemap(cubeRT.texture).texture;pmrem.dispose();cubeRT.dispose();
 for(const m of Object.values(mats))if(m.isMeshStandardMaterial){m.envMap=env;m.needsUpdate=true}
 // Status display, drawn like a small dot-matrix screen.
 const scr=document.createElement('canvas');scr.width=512;scr.height=276;const sg=scr.getContext('2d'),scrTex=new THREE.CanvasTexture(scr);scrTex.colorSpace=THREE.SRGBColorSpace;
 named.mover_screen.material=new THREE.MeshBasicMaterial({map:scrTex,toneMapped:false});{const uv=named.mover_screen.geometry.attributes.uv;uv.setXY(0,0,0);for(const [i,u,v] of [[0,0,0],[1,1,0],[2,1,1],[3,0,1]])uv.setXY(i,u,v);uv.needsUpdate=true;scrTex.flipY=true}
 let screen={a:'',b:'',bar:-1},tick=0;
 function draw(){sg.fillStyle='#07130f';sg.fillRect(0,0,512,276);sg.fillStyle='#0d2019';for(let y=0;y<276;y+=4)sg.fillRect(0,y,512,1);sg.textBaseline='middle';sg.fillStyle='#c7f2d2';sg.font='700 64px "IBM Plex Mono",ui-monospace,monospace';sg.fillText(screen.a,28,90,456);sg.fillStyle='#7fc7a0';sg.font='500 38px "IBM Plex Mono",ui-monospace,monospace';sg.fillText(screen.b,30,176,452);if(screen.bar>=0){sg.strokeStyle='#7fc7a0';sg.lineWidth=3;sg.strokeRect(30,216,452,26);sg.fillStyle='#c7f2d2';sg.fillRect(34,220,444*screen.bar,18)}scrTex.needsUpdate=true;dirty=true}
 const LAB={strata:['01','STRATA 4X4'],drone:['02','QUADCOPTER'],orbit:['03','KESSLER'],wing:['04','DRAGONFLY WING']};
 function status(a,b,bar=-1){if(screen.a===a&&screen.b===b&&Math.abs(screen.bar-bar)<.01)return;screen={a,b,bar};draw()}
 const rings=[0,1,2,3].map(i=>named['mover_ring'+i]),caps=[0,1,2,3].map(i=>named['mover_btn'+i]);
 const ringOff=new THREE.MeshBasicMaterial({color:'#3c5a55'}),ringIdle=new THREE.MeshBasicMaterial({color:'#6fbfa0',toneMapped:false}),ringHot=new THREE.MeshBasicMaterial({color:'#d9fbe6',toneMapped:false}),ringOn=new THREE.MeshBasicMaterial({color:'#ffc27a',toneMapped:false});
 const capZ=caps.map(c=>c.position.z);
 const NAMES=['strata','drone','orbit','wing'],targets=[],F=G.front;
 function paintKeys(){NAMES.forEach((n,i)=>{const on=selected===n,hot=hover===n;rings[i].material=on?ringOn:hot?ringHot:(!selected&&!reduce&&tick%4===i)?ringIdle:ringOff;caps[i].position.z=capZ[i]-(on?.022:0)});dirty=true}
 const door=new THREE.Group();door.position.copy(named.mover_flap.position);scene.add(door);for(const n of ['mover_flap','mover_flap_pane','mover_flap_pull'])door.attach(named[n]);
 const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});
 const hitBox=(w,h,d,x,y,z,k)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),hitMat);b.position.set(x,y,z);b.userData.key=k;b.layers.set(1);machine.add(b);targets.push(b)};
 NAMES.forEach((n,i)=>hitBox(.88,.42,.1,1.6,4.48-i*.55,F+.1,n));
 // The coils, built to the same pitch the layout uses to move the product.
 const coilMat=new THREE.MeshStandardMaterial({color:'#c6ccce',metalness:1,roughness:.26,envMap:env}),shelfDepth=G.lip-G.back;
 const coilGeo=(()=>{const pts=[],turns=shelfDepth/G.pitch,n=Math.ceil(turns*22);for(let i=0;i<=n;i++){const a=i/n*turns*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*G.coilR,Math.sin(a)*G.coilR,i/n*shelfDepth))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,.016,6,false)})();
 const holders={},coils={},fits={},objects={},SLOT=G.slots,cartons={};
 const catcher=new THREE.ShadowMaterial({opacity:.34});
 for(const top of G.shelfTops){const p=new THREE.Mesh(new THREE.PlaneGeometry(G.bayR-G.bayL-.12,G.lip-G.back),catcher);p.rotation.x=-Math.PI/2;p.position.set((G.bayL+G.bayR)/2,top+.004,(G.lip+G.back)/2);p.receiveShadow=true;p.layers.set(1);machine.add(p)}
 const cartonMat=new THREE.MeshStandardMaterial({color:'#cdbd9d',roughness:.8,envMap:env}),bandMat=new THREE.MeshStandardMaterial({color:'#1f4152',roughness:.5,envMap:env});
 for(const name of NAMES){
  const [x,top]=SLOT[name],h=new THREE.Group();h.position.set(x,top+G.rest,G.back+G.startZ);machine.add(h);holders[name]=h;
  hitBox(1.36,1.3,.1,x,top+.72,G.glass+.1,name);
  coils[name]=[-1,1].map(s=>{const c=new THREE.Group();c.position.set(x+s*G.coilX,top+G.coilY,G.back);c.userData.side=s;const m=new THREE.Mesh(coilGeo,coilMat);if(s<0)m.scale.x=-1;c.add(m);machine.add(c);return c});
  const c=new THREE.Group(),a=new THREE.Mesh(new THREE.BoxGeometry(.92,.62,.78),cartonMat),b=new THREE.Mesh(new THREE.BoxGeometry(.94,.06,.8),bandMat);a.position.y=.31;b.position.y=.6;c.add(a,b);c.traverse(o=>o.layers.set(1));h.add(c);objects[name]=c;fits[name]={size:{w:2.2,h:1.5,d:1.9}};h.userData.base=1;
 }
 const pos=new THREE.Vector3();
 function focusPose(name,out){const p=G.closeUp(camera,fits[name].size);camera.updateMatrixWorld();machine.updateWorldMatrix(true,false);out.pos.copy(machine.worldToLocal(camera.localToWorld(pos.set(p.x,p.y,-p.d))));out.scale=p.scale;return out}
 const baseCam={pos:new THREE.Vector3(1.9,3.9,14.4),look:new THREE.Vector3(-.9,3.15,.6)},watchCam={pos:new THREE.Vector3(1.5,3.7,11.8),look:new THREE.Vector3(.75,2.85,1.1)},phoneBase={pos:new THREE.Vector3(2,4.9,20.5),look:new THREE.Vector3(1.15,4.05,.6)},phoneWatch={pos:new THREE.Vector3(1.8,3.6,17.5),look:new THREE.Vector3(.95,3.05,1)};
 const desired=baseCam.pos.clone(),look=baseCam.look.clone(),desiredLook=look.clone(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),drift=new THREE.Vector2(),driftNow=new THREE.Vector2();ray.layers.set(1);camera.position.copy(desired);camera.lookAt(look);
 let labFreeze=false,raf=0,last=0,lastRender=0,dirty=true,hover=null,focusNow=0,focusGoal=0,active=null,restock=null,waiting=null,slow=0,frames=0,sum=0;
 function aim(view){const tall=camera.aspect<1,v=tall?(view===baseCam?phoneBase:phoneWatch):view,fit=tall?1:Math.max(1,1.45/camera.aspect);desired.copy(v.pos).sub(v.look).multiplyScalar(fit).add(v.look);desiredLook.copy(v.look)}
 function size(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();aim(selected?watchCam:baseCam);reflect.dirty=true;renderer.shadowMap.needsUpdate=true;dirty=true;wake()}
 const pose={pos:new THREE.Vector3(),scale:1};
 const setShadow=(name,on)=>{objects[name]?.traverse(o=>{if(o.isMesh)o.castShadow=on});renderer.shadowMap.needsUpdate=true};
 function settle(name){if(waiting&&waiting.name===name){const w=waiting;waiting=null;start(w.name,w.done)}}
 function park(name){const h=holders[name],[x,top]=SLOT[name];h.position.set(x,top+G.rest,G.back+G.startZ);h.rotation.set(0,0,0);h.scale.setScalar(h.userData.base);coils[name].forEach(c=>c.rotation.z=0);setShadow(name,true)}
 function clearActive(){if(active){const n=active.name;active=null;park(n)}if(restock){const n=restock.name;restock=null;park(n)}door.rotation.x=0;focusGoal=0;dirty=true}
 function start(name,done){active={name,done,begin:performance.now(),phase:'run'};setShadow(name,false);aim(watchCam);paintKeys();if(reduce){finish();holdNow()}dirty=true;wake()}
 function holdNow(){if(!active)return;focusPose(active.name,pose);const h=holders[active.name];h.position.copy(pose.pos);h.scale.setScalar(pose.scale);h.rotation.set(0,G.yaw[active.name],0);focusNow=1;focusGoal=1;door.rotation.x=0}
 function finish(){if(!active)return;active.phase='show';const d=active.done;active.done=null;focusGoal=1;status(LAB[active.name][0],LAB[active.name][1]);d&&d()}
 selectScene=(name,done)=>{clearActive();waiting=null;status(LAB[name][0],LAB[name][1]);paintKeys();if(!loaded[name]){waiting={name,done};setTimeout(()=>{if(waiting&&waiting.name===name){loaded[name]=loaded[name]||'late';settle(name)}},9000);aim(watchCam);return true}start(name,done);return true};
 resetScene=()=>{waiting=null;const n=active&&active.name;if(active){active=null;restock={name:n,begin:performance.now()};const h=holders[n];h.position.set(SLOT[n][0],SLOT[n][1]+G.rest,G.back+G.startZ-.5);h.rotation.set(0,0,0);h.scale.setScalar(h.userData.base);door.rotation.x=0;status('RESTOCKING','PLEASE WAIT')}else idle();focusGoal=0;aim(baseCam);paintKeys();if(reduce&&restock){const r=restock.name;restock=null;park(r);idle()}dirty=true};
 function idle(){status('SELECT','01 02 03 04')}
 hoverScene=key=>{hover=key;if(!selected)key?status(LAB[key][0],LAB[key][1]):idle();paintKeys();wake()};
 function drive(now){const s=active,h=holders[s.name],t=now-s.begin,p=G.path(t,SLOT[s.name],h.userData.base,fits[s.name].size),T=G.times;
  coils[s.name].forEach(c=>c.rotation.z=c.userData.side*p.spin);door.rotation.x=p.door;
  if(t<T.feed)status('VENDING',LAB[s.name][1],t/T.feed);else if(p.door<1&&t<G.total-T.lift)status('VENDING',LAB[s.name][1],1);else if(p.lift<=0)status('COLLECT','BELOW');
  if(p.lift<=0){h.position.set(SLOT[s.name][0],p.y,p.z);h.rotation.set(p.tilt,0,0);h.scale.setScalar(h.userData.base)}
  else{focusPose(s.name,pose);const u=p.lift,c=p.end;h.position.set(THREE.MathUtils.lerp(c.x,pose.pos.x,u),THREE.MathUtils.lerp(c.y,pose.pos.y,u),THREE.MathUtils.lerp(c.z,pose.pos.z,u));h.scale.setScalar(THREE.MathUtils.lerp(h.userData.base,pose.scale,u));h.rotation.set(0,G.yaw[s.name]*u,0);focusGoal=1}
  dirty=true;if(t>=G.total)finish()}
 const tmpN=new THREE.Vector3(),tmpV=new THREE.Vector3();
 function mirror(){const c=reflect.cam;c.projectionMatrix.copy(camera.projectionMatrix);c.projectionMatrixInverse.copy(camera.projectionMatrixInverse);tmpV.setFromMatrixPosition(camera.matrixWorld);c.position.set(tmpV.x,-tmpV.y,tmpV.z);camera.getWorldDirection(tmpN);c.up.set(0,-1,0);c.lookAt(tmpV.x+tmpN.x,-tmpV.y-tmpN.y,tmpV.z+tmpN.z);c.updateMatrixWorld();
  reflect.matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
  const floor=named.shell__floor,prev=renderer.getRenderTarget();floor.visible=false;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(reflect.rt);renderer.clear();renderer.render(scene,c);renderer.setRenderTarget(prev);floor.visible=true;reflect.dirty=false}
 function adapt(dt){if(active?.phase!=='run'||slow>1)return;sum+=dt;if(++frames<36)return;const ms=sum/frames*1000;frames=0;sum=0;if(ms>30){slow++;if(reflect.on){reflect.on=false;floorU.uAmount.value=0}else{ratio=Math.max(1,ratio*.8);renderer.setPixelRatio(ratio);size()}}}
 function frame(now){raf=0;if(!visible||document.hidden||labFreeze)return;const dt=Math.min(.05,(now-(last||now))/1000);adapt((now-(last||now))/1000);last=now;const f=reduce?1:1-Math.exp(-4*dt);
  driftNow.lerp(selected||reduce?pos0:drift,1-Math.exp(-5*dt));const before=camera.position.clone();camera.position.lerp(desired,f);look.lerp(desiredLook,f);camera.position.x+=0;
  const shown=camera.position.clone();shown.x+=driftNow.x*.32;shown.y+=driftNow.y*.14;const hold=camera.position.clone();camera.position.copy(shown);camera.lookAt(look);
  let moving=hold.distanceTo(desired)>.008||look.distanceTo(desiredLook)>.008||driftNow.distanceTo(selected||reduce?pos0:drift)>.004;
  if(moving)reflect.dirty=true;
  if(Math.abs(focusGoal-focusNow)>.002){focusNow+=(focusGoal-focusNow)*(reduce?1:1-Math.exp(-3*dt));moving=true}else focusNow=focusGoal;
  key.intensity=1.5;showKey.intensity=26*focusNow;showRim.intensity=30*focusNow;veil.visible=focusNow>.004;veil.material.opacity=.74*focusNow;{const h=Math.tan(camera.fov*Math.PI/360)*14.8*1.02;veil.scale.set(h*camera.aspect,h,1)}
  if(active&&active.phase==='run')drive(now);
  if(active&&active.phase==='show'){const h=holders[active.name];focusPose(active.name,pose);h.position.copy(pose.pos);h.scale.setScalar(pose.scale);if(!reduce){h.rotation.y+=dt*.42;for(const p of objects[active.name].userData.props||[])p.rotation.y+=dt*3.2;dirty=true}}
  if(restock){const u=Math.min(1,(now-restock.begin)/700),e=G.ease(u),n=restock.name;holders[n].position.z=G.back+G.startZ-.5*(1-e);coils[n].forEach(c=>c.rotation.z=c.userData.side*(1-e)*-.5/G.pitch*Math.PI*2);dirty=true;if(u>=1){const r=n;restock=null;park(r);idle()}}
  const running=moving||(active&&active.phase==='run')||restock||(active&&active.phase==='show'&&!reduce);
  if((moving||dirty)&&(!(active&&active.phase==='show')||moving||now-lastRender>=33)){if(reflect.on&&reflect.dirty&&focusNow<.6)mirror();renderer.render(scene,camera);lastRender=now;dirty=false}
  camera.position.copy(hold);
  if(running)raf=requestAnimationFrame(frame);
 }
 const pos0=new THREE.Vector2();
 wake=()=>{if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
 const tapTarget=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(targets)[0]?.object.userData.key||null};
 canvas.addEventListener('pointermove',e=>{const k=tapTarget(e);canvas.style.cursor=k&&!selected?'pointer':'default';if(!narrow&&!reduce)drift.set(pointer.x,pointer.y);if(k!==hover)hoverScene(k);wake()});
 canvas.addEventListener('pointerleave',()=>{drift.set(0,0);hoverScene(null);wake()});
 canvas.addEventListener('click',e=>{if(selected)return;const k=tapTarget(e);if(k)select(k)});
 // Gentle attract: the keys take turns glowing, about once a second, only while the scene is on screen.
 if(!reduce)setInterval(()=>{if(visible&&!document.hidden&&!selected&&!hover){tick++;paintKeys();wake()}},1100);
 // GPU copies are dropped after a while off-screen; three re-uploads them on the next frame.
 releaseGPU=()=>{scene.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();const mt=o.material;for(const t of [mt.map,mt.aoMap,mt.normalMap,mt.roughnessMap,mt.lightMap])t?.dispose()});key.shadow.map?.dispose();key.shadow.map=null;renderer.renderLists.dispose();renderer.shadowMap.needsUpdate=true;reflect.dirty=true};
 window.addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){dirty=true;wake()}});new ResizeObserver(size).observe(stage);size();
 const loaded={};
 async function loadModels(){
  const files={strata:'strata',drone:'quadcopter',orbit:'kessler',wing:'wing'};
  await Promise.all(NAMES.map(async name=>{
   try{
    const gltf=await gltfLoader.loadAsync(`${BASE}${files[name]}.glb`),model=gltf.scene,props=[];
    model.traverse(o=>{if(/^mover_prop\d$/.test(o.name))props.push(o);o.layers.set(1);if(!o.isMesh)return;o.castShadow=true;const mt=o.material;mt.envMap=env;mt.envMapIntensity=.7;if(mt.name==='acrylic'){mt.color.set('#ff4f08');mt.emissive.set('#ff3a00');mt.emissiveIntensity=.08}if(mt.name==='acrylic_edge'){mt.color.set('#ff6410');mt.emissive.set('#ff4a00');mt.emissiveIntensity=.42}for(const t of [mt.map,mt.aoMap,mt.normalMap])if(t)t.anisotropy=maxAniso});
    const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3());model.position.y=-b.min.y;
    const group=new THREE.Group();group.add(model);group.userData.props=props;group.traverse(o=>o.layers.set(1));
    const h=holders[name],busy=active&&active.name===name;h.clear();h.add(group);objects[name]=group;fits[name]={size:{w:s.x,h:s.y,d:s.z}};h.userData.base=G.fit(fits[name].size);if(!busy)h.scale.setScalar(h.userData.base);setShadow(name,!busy);
    loaded[name]='ready';
   }catch(e){loaded[name]='failed';console.warn('Project model unavailable',name,e)}
   settle(name);renderer.shadowMap.needsUpdate=true;dirty=true;wake();
  }));
 }
 idle();paintKeys();
 if(/[?&]machinelab\b/.test(location.search))window.__machine={THREE,scene,camera,renderer,machine,holders,objects,fits,G,door,named,get active(){return active},get loaded(){return loaded},release(){releaseGPU()},render(){renderer.render(scene,camera)},pose(p,l){labFreeze=true;camera.position.set(...p);camera.lookAt(...l);if(reflect.on)mirror();renderer.render(scene,camera)},seek(t){labFreeze=true;const n=performance.now();active.begin=n-t;active.phase='run';drive(n);renderer.render(scene,camera)},thaw(){labFreeze=false;wake()},clip(x){renderer.clippingPlanes=x==null?[]:[new THREE.Plane(new THREE.Vector3(1,0,0),-x)];renderer.render(scene,camera)}};
 renderer.render(scene,camera);stage.classList.remove('is-loading');stage.classList.add('is-ready');
 loadModels().catch(e=>{console.warn('Project models unavailable',e);for(const n of NAMES)if(!loaded[n]){loaded[n]='failed';settle(n)}});
 if(selected)selectScene(selected,()=>showCard(selected,sequence));wake();
}
let releaseGPU=()=>{},offTimer=0;
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);clearTimeout(offTimer);if(visible){if(!initialized)init().catch(e=>{console.warn(e);failed=true;stage.classList.remove('is-loading');stage.classList.add('no-scene');fallback.hidden=false});else wake()}else offTimer=setTimeout(()=>releaseGPU(),45000)},{threshold:.01,rootMargin:'200px'});observer.observe(stage);

})();
