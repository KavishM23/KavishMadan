/* The project machine: self-contained 3D scene, with ordinary HTML project controls. */
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
let selectScene=()=>false,resetScene=()=>{},wake=()=>{},selected=null,sequence=0;
function showCard(key,token){if(token!==sequence||selected!==key)return;stage.classList.remove('is-dispensing');card.hidden=false;}
function select(key){const p=projects[key];if(!p||selected===key)return;const token=++sequence;selected=key;stage.classList.add('has-selection','is-dispensing');card.hidden=true;document.getElementById('testlab-tag').textContent=p.tag;document.getElementById('testlab-name').textContent=p.name;document.getElementById('testlab-desc').textContent=p.desc;document.getElementById('testlab-link').href=p.href;hint.hidden=true;nav.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lab===key)));const animated=selectScene(key,()=>showCard(key,token));if(!animated)showCard(key,token);wake()}
function reset(){const was=nav.find(b=>b.dataset.lab===selected);++sequence;selected=null;stage.classList.remove('has-selection','is-dispensing');card.hidden=true;hint.hidden=false;nav.forEach(b=>b.setAttribute('aria-pressed','false'));resetScene();wake();return was}
nav.forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(b.dataset.lab))});
document.getElementById('testlab-back').addEventListener('click',()=>reset()?.focus());
stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected)reset()?.focus()});
window.addEventListener('hashchange',()=>{if(location.hash==='#builds'&&selected)reset()});
let initialized=false,visible=false,failed=false;
async function init(){
 if(initialized||failed)return;initialized=true;
 const THREE=await import('three');
 const {RoundedBoxGeometry}=await import('three/addons/geometries/RoundedBoxGeometry.js');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){failed=true;fallback.hidden=false;return}
 const narrow=matchMedia('(max-width:760px)').matches;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,narrow?1.25:1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#172630');scene.fog=new THREE.Fog('#172630',22,42);
 const camera=new THREE.PerspectiveCamera(35,1,.1,60),root=new THREE.Group();scene.add(root);
 const sky=new THREE.HemisphereLight('#d6e8e9','#554333',2);scene.add(sky);
 const key=new THREE.DirectionalLight('#fff0d9',2.5);key.position.set(-5,9,8);key.castShadow=true;key.shadow.mapSize.setScalar(narrow?1024:2048);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
 const fill=new THREE.DirectionalLight('#a5cedf',1.8);fill.position.set(6,5,2);scene.add(fill);
 const mat=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const enamel=(color)=>new THREE.MeshPhysicalMaterial({color,roughness:.42,metalness:.15,clearcoat:.55,clearcoatRoughness:.3});
 const m={wall:mat('#5b625e',.92),floor:mat('#77766b',.84),blue:enamel('#3a5964'),deep:enamel('#162b36'),black:mat('#1b272d',.8),rubber:mat('#282d2c',.92),cream:enamel('#e3d5bc'),silver:mat('#a3b0ac',.32,.78),brass:mat('#c5a16c',.38,.7),wood:mat('#937455',.8),steel:mat('#c0c8c8',.24,.95),interior:mat('#41565a',.74),light:new THREE.MeshBasicMaterial({color:'#fff0c7'}),glass:new THREE.MeshPhysicalMaterial({color:'#c5e0dc',metalness:.05,roughness:.12,transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide}),smoke:new THREE.MeshPhysicalMaterial({color:'#20343c',metalness:.1,roughness:.22,transparent:true,opacity:.58,depthWrite:false,side:THREE.DoubleSide})};
 const box=(p,w,h,d,material,x=0,y=0,z=0,r=.025)=>{const mesh=new THREE.Mesh(r?new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)):new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh};
 const cylinder=(p,r,h,material,x=0,y=0,z=0,seg=28)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),material);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
 const ball=(p,r,material,x=0,y=0,z=0,seg=24)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(12,seg/2)),material);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
 const rod=(p,a,b,r,material)=>{const x=new THREE.Vector3(...a),y=new THREE.Vector3(...b),v=y.clone().sub(x);const o=cylinder(p,r,v.length(),material);o.position.copy(x.add(y).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o};
 const torus=(p,r,t,material,x,y,z)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,64),material);o.position.set(x,y,z);p.add(o);return o};
 function label(text,w,h,{bg='#142c38',fg='#f2e6cd',size=65,border=true}={}){const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,1024,256);if(border){g.strokeStyle='#91afb0';g.lineWidth=5;g.strokeRect(6,6,1012,244)}g.fillStyle=fg;g.font=`700 ${size}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,133,920);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
 function addLabel(parent,text,x,y,z,w,h,opts){const l=label(text,w,h,opts);l.position.set(x,y,z);parent.add(l);return l}
 // Worn workshop floor and wall, generated once as small repeatable textures.
 function noiseTexture(base,seed){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);let n=seed;const rand=()=>((n=n*16807%2147483647)-1)/2147483646;for(let i=0;i<9500;i++){const v=rand()>.5?255:0;ctx.fillStyle=`rgba(${v},${v},${v},${rand()*.085})`;let r=rand()*2;ctx.fillRect(rand()*512,rand()*512,r+1,r+1)}for(let i=0;i<35;i++){ctx.strokeStyle=`rgba(30,30,28,${rand()*.045})`;ctx.beginPath();let y=rand()*512;ctx.moveTo(0,y);ctx.lineTo(512,y+(rand()-.5)*12);ctx.stroke()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
 m.floor.map=noiseTexture('#9a998d',71);m.floor.color.set('#c7c4b5');m.wall.map=noiseTexture('#92958c',17);m.wall.color.set('#c2c5b7');
 box(root,20,.22,14,m.floor,0,-.12,0,.01);box(root,20,8,.2,m.wall,0,3.9,-3.5,.01);
 for(const x of [-7,-3.5,0,3.5,7])box(root,.07,7,.08,m.deep,x,3.5,-3.35,.01);
 box(root,20,.13,.14,m.wood,0,.14,-3.31,.02);box(root,20,.12,.12,m.silver,0,6.7,-3.31,.02);
 // The machine is a hollow cabinet. Everything a product touches exists, so the drop has a real path:
 // twin coils on a shelf, a clear lane behind the glass, a ramp, then a tray door.
 const machine=new THREE.Group();machine.position.set(1.15,0,0);root.add(machine);
 const G=window.projectMachineLayout;
 const {front:F,glass:GZ,bayL,bayR,shelfTops,slots:SLOT}=G;
 const shelfDepth=G.lip-G.back,zMid=(G.lip+G.back)/2;
 box(machine,4.46,.24,3.3,m.black,0,.16,.72,.05);for(const x of [-1.8,1.8])for(const z of [-.5,1.95])box(machine,.42,.1,.42,m.rubber,x,.05,z,.03);
 box(machine,.1,5.42,3.1,m.blue,-2.15,2.97,.72,.03);box(machine,4.3,5.42,.1,m.deep,0,2.97,-.8,.02);box(machine,1.22,5.42,3.1,m.blue,1.59,2.97,.72,.05);
 box(machine,4.4,.62,3.2,m.deep,0,5.85,.72,.09);
 // Interior: back wall, side lining and a soft glow so products read against the dark.
 {const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d'),grad=g.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#8fb0ae');grad.addColorStop(.55,'#5a7a7c');grad.addColorStop(1,'#2d4347');g.fillStyle=grad;g.fillRect(0,0,64,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const b=box(machine,bayR-bayL,3.6,.04,new THREE.MeshStandardMaterial({map:t,roughness:.7}),(bayL+bayR)/2,3.72,-.73,0);b.castShadow=false}
 box(machine,.02,3.6,3,m.interior,bayL+.01,3.72,.7,0);box(machine,.02,3.6,3,m.interior,bayR-.01,3.72,.7,0);
 // Shelves stop short of the glass, leaving the drop lane open in front of them.
 const coils={};
 const coilGeo=(()=>{const pts=[],turns=shelfDepth/G.pitch,n=Math.ceil(turns*22);for(let i=0;i<=n;i++){const a=i/n*turns*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*G.coilR,Math.sin(a)*G.coilR,i/n*shelfDepth))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,.013,6,false)})();
 for(const top of shelfTops){
  box(machine,bayR-bayL-.04,.08,shelfDepth+.02,m.silver,(bayL+bayR)/2,top-.04,zMid,.012);
  box(machine,bayR-bayL-.04,.14,.05,m.brass,(bayL+bayR)/2,top-.07,G.lip,.012);
  const strip=box(machine,bayR-bayL-.2,.02,.04,new THREE.MeshBasicMaterial({color:'#f4ecd2',toneMapped:false}),(bayL+bayR)/2,top+G.gap-.05,G.lip-.1,.004);strip.castShadow=false;
 }
 box(machine,bayR-bayL-.04,.08,shelfDepth+.02,m.silver,(bayL+bayR)/2,G.ceiling,zMid,.012);
 // Below the bay: a baffle, the sloped ramp and the walls of the collection bin.
 box(machine,bayR-bayL,G.binTop-.2,.06,m.interior,(bayL+bayR)/2,(G.binTop+.2)/2,G.lip-.02,.01);
 const ramp=box(machine,bayR-bayL,.05,G.front-G.lip+.04,m.steel,(bayL+bayR)/2,G.rampAt((G.lip+G.front)/2)-.025,(G.lip+G.front)/2,.008);ramp.rotation.x=Math.atan2(G.rampHigh-G.rampLow,G.front-G.lip);
 // Front skin around the glass and the hatch opening.
 const H=G.hatch,skin=m.blue;
 box(machine,bayL+2.2,1.86,.1,skin,(-2.2+H.left)/2-.0,1.13,F,.02);box(machine,bayR-H.right+.02,1.86,.1,skin,(H.right+bayR)/2,1.13,F,.02);
 box(machine,H.right-H.left,G.binTop-H.top+.02,.1,skin,(H.left+H.right)/2,(G.binTop+H.top)/2,F,.02);box(machine,H.right-H.left,H.bottom-.24,.1,skin,(H.left+H.right)/2,(H.bottom+.24)/2,F,.02);
 box(machine,H.right-H.left+.12,.05,.14,m.brass,(H.left+H.right)/2,H.top+.02,F+.02,.012);for(const x of [H.left,H.right])box(machine,.05,H.top-H.bottom+.08,.14,m.brass,x,(H.top+H.bottom)/2,F+.02,.012);
 for(const x of [-1.98,.84])for(const y of [.42,1.86]){const bolt=ball(machine,.034,m.silver,x,y,F+.05,14);bolt.scale.z=.34}
 // Glazing and its brass frame.
 for(const x of [bayL,bayR])box(machine,.09,3.62,.14,m.brass,x,3.75,GZ,.02);for(const y of [G.binTop+.03,5.54])box(machine,bayR-bayL+.09,.08,.14,m.brass,(bayL+bayR)/2,y,GZ,.02);
 const pane=box(machine,bayR-bayL,3.5,.018,m.glass,(bayL+bayR)/2,3.76,GZ,.003);pane.castShadow=false;pane.receiveShadow=false;
 const shine=new THREE.Mesh(new THREE.PlaneGeometry(.06,3),new THREE.MeshBasicMaterial({color:'#e0f5ed',transparent:true,opacity:.13,depthWrite:false}));shine.position.set(bayL+.42,3.8,GZ+.02);shine.rotation.z=-.13;machine.add(shine);
 // The collection door hinges at its foot and drops open into a tray.
 const door=new THREE.Group();door.position.set((H.left+H.right)/2,H.bottom+.015,F+.06);machine.add(door);{const w=H.right-H.left-.06,t=H.top-H.bottom-.05;const pane2=box(door,w,t,.03,m.smoke,0,t/2,0,.01);pane2.castShadow=false;box(door,w,.05,.05,m.deep,0,.025,0,.01);box(door,w,.05,.05,m.deep,0,t-.025,0,.01);for(const x of [-w/2+.025,w/2-.025])box(door,.05,t,.05,m.deep,x,t/2,0,.01);box(door,1.1,.035,.05,m.brass,0,t-.14,.05,.012);addLabel(door,'COLLECT HERE',0,t-.06,.03,.9,.035,{bg:'#182d36',fg:'#b4c8c3',size:80,border:false}).visible=false}
 // Marquee across the head of the cabinet.
 box(machine,3.96,.42,.12,m.cream,0,5.86,F+.03,.05);addLabel(machine,'KAVISH  /  PROJECTS',0,5.86,F+.095,3.6,.32,{bg:'#e2d5bc',fg:'#273e47',size:70,border:false});
 for(const x of [-2.05,2.05])for(const y of [5.68,6.05]){const bolt=ball(machine,.035,m.silver,x,y,F+.03,12);bolt.scale.z=.32}
 // Selector column, push buttons, coin slot and ventilation.
 box(machine,1.04,3.72,.08,m.cream,1.59,3.72,F-.0,.04);box(machine,.8,.56,.035,m.deep,1.59,5.08,F+.05,.02);addLabel(machine,'SELECT 01 – 04',1.59,5.08,F+.075,.68,.31,{bg:'#193a41',fg:'#bee4d7',size:66,border:false});
 const buttonHighlights=[];for(let i=0;i<4;i++){const y=4.48-i*.55;box(machine,.8,.38,.045,m.blue,1.59,y,F+.05,.03);const b=cylinder(machine,.095,.075,i===0?m.brass:m.silver,1.37,y,F+.095,20);b.rotation.x=Math.PI/2;const halo=torus(machine,.128,.012,new THREE.MeshBasicMaterial({color:'#c0e2d7'}),1.37,y,F+.145);halo.visible=false;buttonHighlights.push(halo);addLabel(machine,['01','02','03','04'][i],1.74,y,F+.085,.29,.18,{bg:'#3a5964',fg:'#f3eddf',size:98,border:false})}
 for(const y of [2.48,2.62,2.76])box(machine,.42,.018,.02,m.silver,1.59,y,F+.055,.004);
 box(machine,.7,.2,.035,m.deep,1.59,2.23,F+.05,.02);box(machine,.35,.025,.02,m.black,1.59,2.23,F+.08,.003);
 for(let j=0;j<8;j++)box(machine,.62,.024,.02,m.black,1.59,.56+j*.085,F+.012,.005);
 box(machine,1.04,1.86,.06,m.blue,1.59,1.13,F-.01,.02);for(const y of [.46,1.82])for(const x of [1.2,1.98]){const b=ball(machine,.03,m.silver,x,y,F+.03,12);b.scale.z=.34}
 for(let i=0;i<6;i++)box(machine,.03,.65,.07,m.deep,2.22,3.0+i*.4,-.35,.008);
 const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(2.1,.5,-.8),new THREE.Vector3(2.5,.25,-1.1),new THREE.Vector3(2.7,.06,-2),new THREE.Vector3(3.4,.04,-2.8),new THREE.Vector3(3.8,.5,-3.2)]);machine.add(new THREE.Mesh(new THREE.TubeGeometry(cable,40,.027,8,false),m.rubber));
 box(root,1.4,1.05,.3,m.blue,-3.7,1.5,-3.15,.04);box(root,1.22,.85,.04,m.cream,-3.7,1.5,-2.98,.01);addLabel(root,'PROJECT NOTES',-3.7,1.75,-2.94,1,.22,{bg:'#e3d5bc',fg:'#42545a',size:64,border:false});
 for(let i=0;i<4;i++)box(root,.65,.025,.015,m.blue,-3.65,1.48-i*.12,-2.94,.004);
 box(root,1.6,.12,.8,m.wood,-3.9,1.05,-2.6,.035);for(const x of [-4.5,-3.3])box(root,.09,1,.09,m.deep,x,.5,-2.55,.015);
 for(const x of [-4.28,-3.92,-3.56]){cylinder(root,.13,.24,m.brass,x,1.23,-2.55);cylinder(root,.105,.12,m.silver,x,1.41,-2.55)}
 const lit=new THREE.PointLight('#ffdca4',18,8,2);lit.position.set(1,6.6,5);scene.add(lit);
 const bayA=new THREE.PointLight('#fff0d6',7,5,2),bayB=new THREE.PointLight('#fff0d6',6,5,2);bayA.position.set(.65,5.2,1.65);bayB.position.set(.65,3.62,1.65);scene.add(bayA,bayB);
 // A dark veil hangs between the held product and the room, so the product is what you look at.
 const veil=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#0d1a22',transparent:true,opacity:0,depthWrite:false,fog:false}));veil.position.z=-7.4;veil.visible=false;camera.add(veil);
 // Show lights travel with the camera and only matter for a product held up close.
 const showKey=new THREE.PointLight('#fff1dc',0,9,2),showRim=new THREE.PointLight('#a9d7e6',0,9,2);camera.add(showKey,showRim);showKey.position.set(-1.5,2.6,-1.4);showRim.position.set(2.8,1.4,-6.4);scene.add(camera);
 const stageLights=[[sky,2],[key,2.5],[fill,1.8],[lit,18],[bayA,7],[bayB,6]];
 const NAMES=['strata','drone','orbit','wing'],targets=[];
 for(const [i,name] of NAMES.entries()){const target=box(machine,.84,.43,.07,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),1.59,4.48-i*.55,F+.13,0);target.castShadow=false;target.userData.key=name;targets.push(target)}
 const holders={},springsFor={};
 for(const name of NAMES){
  const [x,top]=SLOT[name],rest=top+G.rest;
  const holder=new THREE.Group();holder.position.set(x,rest,G.back+G.startZ);machine.add(holder);holders[name]=holder;
  const hit=box(machine,1.4,1.2,.1,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x,top+.72,GZ+.1,0);hit.castShadow=false;hit.userData.key=name;targets.push(hit);
  addLabel(machine,{strata:'01 / STRATA',drone:'02 / QUADS',orbit:'03 / ORBIT',wing:'04 / WING'}[name],x,top-.07,G.lip+.03,1.1,.105,{bg:'#203945',fg:'#e8e5d8',size:67,border:false});
  // Two coils turn in opposite directions, so the product is carried straight forward.
  springsFor[name]=[-1,1].map(side=>{const c=new THREE.Group();c.position.set(x+side*G.coilX,top+G.coilY,G.back);c.userData.side=side;const coil=new THREE.Mesh(coilGeo,m.steel);coil.castShadow=true;if(side<0)coil.scale.x=-1;c.add(coil);machine.add(c);box(machine,.26,.26,.06,m.black,x+side*G.coilX,top+G.coilY,G.back-.03,.02);return c});
 }
 // A plain carton stands in until a model loads, and stays if one cannot be fetched.
 const carton=new THREE.Group();box(carton,.92,.62,.78,m.cream,0,.31,0,.03);box(carton,.94,.05,.8,m.blue,0,.62,0,.01);addLabel(carton,'PROJECT PARCEL',0,.31,.395,.66,.13,{bg:'#e3d5bc',fg:'#42545a',size:70,border:false});
 const fits={},objects={};
 function place(name,model,size){const h=holders[name];h.clear();h.add(model);fits[name]={size};objects[name]=model;h.userData.base=G.fit(size)}
 for(const name of NAMES){place(name,carton.clone(true),{w:2.2,h:1.5,d:1.9});holders[name].scale.setScalar(1);holders[name].userData.base=1}
 const loaded={};
 const pmrem=new THREE.PMREMGenerator(renderer);let env=null;
 async function loadModels(){
  const [{GLTFLoader},{MeshoptDecoder},{RoomEnvironment}]=await Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js'),import('three/addons/environments/RoomEnvironment.js')]);
  env=pmrem.fromScene(new RoomEnvironment(renderer),.04).texture;pmrem.dispose();
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),max=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const files={strata:'strata',drone:'quadcopter',orbit:'kessler',wing:'wing'};
  await Promise.all(NAMES.map(async name=>{
   try{
    const gltf=await loader.loadAsync(`assets/models/vending/${files[name]}.glb`),model=gltf.scene,props=[];
    model.traverse(o=>{if(/^mover_prop\d$/.test(o.name))props.push(o);if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=false;const mt=o.material;mt.envMap=env;mt.envMapIntensity=.62;for(const t of [mt.map,mt.aoMap,mt.normalMap])if(t)t.anisotropy=max});
    const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3());
    model.position.y=-b.min.y;model.userData.props=props;
    const group=new THREE.Group();group.add(model);
    const busy=active&&active.name===name;place(name,group,{w:s.x,h:s.y,d:s.z});
    if(!busy)holders[name].scale.setScalar(holders[name].userData.base);
    loaded[name]='ready';
   }catch(e){loaded[name]='failed';console.warn('Project model unavailable',name,e)}
   settle(name);renderer.shadowMap.needsUpdate=true;dirty=true;wake();
  }));
 }
 // Surrounding workshop details: a framed drawing, pegboard, bench and storage.
 box(root,2.1,1.42,.09,m.deep,-4.55,4.35,-3.27,.025);box(root,1.92,1.24,.025,m.cream,-4.55,4.35,-3.20,.01);
 const drawing=label('SKETCH  /  BUILD  /  TEST',1.62,.22,{bg:'#e3d5bc',fg:'#405964',size:60,border:false});drawing.position.set(-4.55,4.73,-3.17);root.add(drawing);
 const drawingMat=new THREE.LineBasicMaterial({color:'#607d84',transparent:true,opacity:.7});for(let k=0;k<3;k++){const points=[];for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;points.push(new THREE.Vector3(-4.55+Math.cos(a)*(.48+k*.12),4.29+Math.sin(a)*(.15+k*.05),-3.16))}root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),drawingMat))}
 box(root,2.45,1.45,.09,m.cream,-4.55,2.78,-3.25,.025);for(let x=-5.65;x<=-3.5;x+=.18)for(let y=2.2;y<=3.34;y+=.18){const dot=ball(root,.012,m.deep,x,y,-3.19,8);dot.scale.z=.3}
 for(let i=0;i<4;i++){const x=-5.35+i*.37;rod(root,[x,3.15,-3.13],[x,2.68-i*.04,-3.13],.025,m.silver);torus(root,.06,.015,m.silver,x,3.13,-3.13)}
 box(root,2.7,.14,.8,m.wood,-4.55,1.9,-2.88,.035);for(const x of [-5.72,-3.38])box(root,.09,1.8,.1,m.deep,x,.95,-2.9,.015);box(root,2.5,.09,.7,m.wood,-4.55,.7,-2.9,.025);
 for(let i=0;i<3;i++){box(root,.64,.34,.46,i===1?m.blue:m.deep,-5.28+i*.72,.92,-2.85,.03);box(root,.21,.035,.025,m.silver,-5.28+i*.72,.99,-2.6,.005)}
 box(root,.56,.19,.36,m.blue,-5.15,2.06,-2.85,.03);box(root,.3,.035,.04,m.silver,-5.15,2.17,-2.63,.006);for(let i=0;i<3;i++)cylinder(root,.075,.27,i===1?m.blue:m.brass,-4.3+i*.22,2.1,-2.9,20);
 // Wall-mounted project photographs and a parts shelf give the room its own history.
 function framedPhoto(url,x,y,w,h){const loader=new THREE.TextureLoader(),texture=loader.load(url,()=>{dirty=true;wake()});texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());box(root,w+.16,h+.16,.08,m.deep,x,y,-3.26,.025);const image=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));image.position.set(x,y,-3.2);root.add(image)}
 framedPhoto('img/strata-2-cad.webp',4.55,4.0,2.05,1.18);framedPhoto('img/strata-4-laser.webp',7.1,4.0,1.65,1.18);
 for(const x of [3.5,7.85])box(root,.1,2.45,.1,m.deep,x,1.35,-3,.015);
 for(const y of [.45,1.26,2.1])box(root,4.5,.1,.55,m.wood,5.68,y,-3,.02);
 for(let i=0;i<4;i++){const x=3.95+i*1.1;box(root,.83,.55,.43,i%2?m.blue:m.deep,x,.75,-2.96,.025);box(root,.3,.04,.02,m.silver,x,.84,-2.73,.005)}
 for(let i=0;i<5;i++){const x=3.95+i*.8;const can=cylinder(root,.12,.36,i%2?m.brass:m.silver,x,1.49,-3,20);cylinder(root,.125,.04,m.deep,x,1.69,-3,20)}
 addLabel(root,'STOCK  /  SPARES',5.6,2.42,-3.17,2.2,.2,{bg:'#203945',fg:'#d4dfd8',size:62,border:false});
 // Rubber mat, floor seams and low task lighting ground the machine in the room.
 box(root,5.3,.025,3.1,m.deep,1.05,.015,.35,.02);for(let i=-4;i<=4;i++){box(root,.018,.006,3,m.blue,1.05+i*.48,.032,.35,.002)}
 for(const x of [-6,0,6])box(root,.016,.007,10,m.black,x,.006,1,.002);
 rod(root,[-2.7,0,-2.8],[-2.7,4.35,-2.8],.035,m.deep);rod(root,[-2.7,4.35,-2.8],[-2.1,4.35,-2.8],.028,m.deep);const shade=cylinder(root,.2,.18,m.brass,-2.1,4.25,-2.8,32);const taskLight=new THREE.PointLight('#ffe4b9',5,4,2);taskLight.position.set(-2.1,4.05,-2.6);scene.add(taskLight);
 const baseCam={pos:new THREE.Vector3(1.9,3.9,14.4),look:new THREE.Vector3(-.9,3.15,.6)},watchCam={pos:new THREE.Vector3(1.5,3.7,11.8),look:new THREE.Vector3(.75,2.85,1.1)};
 const phoneBase={pos:new THREE.Vector3(2,4.9,20.5),look:new THREE.Vector3(1.15,4.05,.6)},phoneWatch={pos:new THREE.Vector3(1.8,3.6,17.5),look:new THREE.Vector3(.95,3.05,1)};
 const desired=baseCam.pos.clone(),look=baseCam.look.clone(),desiredLook=look.clone(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();camera.position.copy(desired);camera.lookAt(look);
 let raf=0,last=0,lastRender=0,dirty=true,hover=null,focusNow=0,focusGoal=0,active=null,restock=null,waiting=null;
 function aim(view){const tall=camera.aspect<1,v=tall?(view===baseCam?phoneBase:phoneWatch):view,fit=tall?1:Math.max(1,1.45/camera.aspect);desired.copy(v.pos).sub(v.look).multiplyScalar(fit).add(v.look);desiredLook.copy(v.look)}
 function size(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();aim(selected?watchCam:baseCam);renderer.shadowMap.needsUpdate=true;dirty=true;wake()}
 const v=new THREE.Vector3();
 function showAt(name){return G.closeUp(camera,fits[name].size)}
 function focusPose(name,out){const p=showAt(name);camera.updateMatrixWorld();machine.updateWorldMatrix(true,false);out.pos.copy(machine.worldToLocal(camera.localToWorld(v.set(p.x,p.y,-p.d))));out.scale=p.scale;return out}
 const pose={pos:new THREE.Vector3(),scale:1};
 const setShadow=(name,on)=>{objects[name]?.traverse(o=>{if(o.isMesh)o.castShadow=on});renderer.shadowMap.needsUpdate=true};
 function settle(name){if(waiting&&waiting.name===name){const w=waiting;waiting=null;start(w.name,w.done)}}
 function park(name){const h=holders[name],[x,top]=SLOT[name];h.position.set(x,top+G.rest,G.back+G.startZ);h.rotation.set(0,0,0);h.scale.setScalar(h.userData.base);springsFor[name].forEach(c=>c.rotation.z=0);objects[name]?.parent&&(objects[name].rotation.y=0);setShadow(name,true)}
 function clearActive(){if(active){const n=active.name;active=null;park(n)}if(restock){const n=restock.name;restock=null;park(n)}door.rotation.x=0;focusGoal=0;dirty=true}
 function start(name,done){buttonHighlights.forEach((h,i)=>h.visible=NAMES[i]===name);active={name,done,begin:performance.now(),phase:'run',spun:0};setShadow(name,false);aim(watchCam);if(reduce){finish();holdNow()}dirty=true;wake()}
 function holdNow(){if(!active)return;focusPose(active.name,pose);const h=holders[active.name];h.position.copy(pose.pos);h.scale.setScalar(pose.scale);h.rotation.set(0,G.yaw[active.name],0);focusNow=1;focusGoal=1;door.rotation.x=0}
 function finish(){if(!active)return;active.phase='show';const d=active.done;active.done=null;focusGoal=1;d&&d()}
 selectScene=(name,done)=>{clearActive();waiting=null;if(!loaded[name]){waiting={name,done};setTimeout(()=>{if(waiting&&waiting.name===name){loaded[name]=loaded[name]||'late';settle(name)}},9000);aim(watchCam);return true}start(name,done);return true};
 resetScene=()=>{waiting=null;const n=active&&active.name;if(active){active=null;restock={name:n,begin:performance.now()};holders[n].position.set(SLOT[n][0],SLOT[n][1]+G.rest,G.back-.35);holders[n].rotation.set(0,0,0);holders[n].scale.setScalar(holders[n].userData.base);objects[n].rotation.y=0;door.rotation.x=0}buttonHighlights.forEach(h=>h.visible=false);focusGoal=0;aim(baseCam);if(reduce&&restock){const r=restock.name;restock=null;park(r)}dirty=true};
 function drive(now){const s=active,h=holders[s.name],t=now-s.begin,p=G.path(t,SLOT[s.name],h.userData.base,fits[s.name].size);
  springsFor[s.name].forEach(c=>c.rotation.z=c.userData.side*p.spin);door.rotation.x=p.door;
  if(p.lift<=0){h.position.set(SLOT[s.name][0],p.y,p.z);h.rotation.set(p.tilt,0,0);h.scale.setScalar(h.userData.base)}
  else{focusPose(s.name,pose);const u=p.lift,c=p.end;h.position.set(THREE.MathUtils.lerp(c.x,pose.pos.x,u),THREE.MathUtils.lerp(c.y,pose.pos.y,u),THREE.MathUtils.lerp(c.z,pose.pos.z,u));h.scale.setScalar(THREE.MathUtils.lerp(h.userData.base,pose.scale,u));h.rotation.set(THREE.MathUtils.lerp(p.tilt,0,u),G.yaw[s.name]*u,0);focusGoal=1}
  dirty=true;if(t>=G.total)finish()}
 function frame(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;const f=reduce?1:1-Math.exp(-4*dt);camera.position.lerp(desired,f);look.lerp(desiredLook,f);camera.lookAt(look);let moving=camera.position.distanceTo(desired)>.008||look.distanceTo(desiredLook)>.008;
  if(Math.abs(focusGoal-focusNow)>.002){focusNow+=(focusGoal-focusNow)*(reduce?1:1-Math.exp(-3*dt));moving=true}else focusNow=focusGoal;
  for(const [l,b] of stageLights)l.intensity=b*(1-.62*focusNow);showKey.intensity=26*focusNow;showRim.intensity=30*focusNow;veil.visible=focusNow>.004;veil.material.opacity=.66*focusNow;{const h=Math.tan(camera.fov*Math.PI/360)*14.8*1.02;veil.scale.set(h*camera.aspect,h,1)}
  if(active&&active.phase==='run')drive(now);
  if(active&&active.phase==='show'){const h=holders[active.name];focusPose(active.name,pose);h.position.copy(pose.pos);h.scale.setScalar(pose.scale);if(!reduce){h.rotation.y+=dt*.42;for(const p of objects[active.name].children[0].userData?.props||[])p.rotation.y+=dt*3.2;dirty=true}}
  if(restock){const u=Math.min(1,(now-restock.begin)/650),e=G.ease(u),n=restock.name;holders[n].position.z=G.back-.35+(G.startZ+.35)*e;springsFor[n].forEach(c=>c.rotation.z=c.userData.side*(1-e)*-2);dirty=true;if(u>=1){const r=n;restock=null;park(r)}}
  const running=moving||(active&&active.phase==='run')||restock||(active&&active.phase==='show'&&!reduce);
  if((moving||dirty)&&(!(active&&active.phase==='show')||moving||now-lastRender>=33)){renderer.render(scene,camera);lastRender=now;dirty=false}
  if(running)raf=requestAnimationFrame(frame);
 }
 wake=()=>{if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
 const tapTarget=e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(targets)[0]?.object.userData.key||null};
 canvas.addEventListener('pointermove',e=>{const key=tapTarget(e);canvas.style.cursor=key?'pointer':'default';if(key!==hover){hover=key;buttonHighlights.forEach((h,i)=>h.visible=NAMES[i]===(key||selected));dirty=true;wake()}});
 canvas.addEventListener('pointerleave',()=>{hover=null;buttonHighlights.forEach((h,i)=>h.visible=NAMES[i]===selected);dirty=true;wake()});
 canvas.addEventListener('click',e=>{if(selected)return;const key=tapTarget(e);if(key)select(key)});
 // The GPU copies are dropped after a while off-screen; three re-uploads them on the next frame.
 let idle=0;releaseGPU=()=>{scene.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();const mt=o.material;for(const t of [mt.map,mt.aoMap,mt.normalMap,mt.roughnessMap])t?.dispose()});key.shadow.map?.dispose();key.shadow.map=null;renderer.renderLists.dispose();renderer.shadowMap.needsUpdate=true};
 window.addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){dirty=true;wake()}});new ResizeObserver(size).observe(stage);size();
 if(/[?&]machinelab\b/.test(location.search))window.__machine={THREE,scene,camera,renderer,machine,holders,objects,fits,G,get active(){return active},get loaded(){return loaded},release(){releaseGPU()},render(){renderer.render(scene,camera)},pose(p,l){camera.position.set(...p);camera.lookAt(...l);renderer.render(scene,camera)}};
 const pending=loadModels().catch(e=>{console.warn('Project models unavailable',e);for(const n of NAMES)if(!loaded[n]){loaded[n]='failed';settle(n)}});
 if(selected)selectScene(selected,()=>showCard(selected,sequence));wake();
}
let releaseGPU=()=>{},offTimer=0;
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);clearTimeout(offTimer);if(visible){if(!initialized)init().catch(()=>{failed=true;fallback.hidden=false});else wake()}else offTimer=setTimeout(()=>releaseGPU(),45000)},{threshold:.01});observer.observe(stage);

})();
