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
function select(key){const p=projects[key];if(!p)return;const token=++sequence;selected=key;stage.classList.add('has-selection','is-dispensing');card.hidden=true;document.getElementById('testlab-tag').textContent=p.tag;document.getElementById('testlab-name').textContent=p.name;document.getElementById('testlab-desc').textContent=p.desc;document.getElementById('testlab-link').href=p.href;hint.hidden=true;nav.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lab===key)));const animated=selectScene(key,()=>showCard(key,token));if(!animated)showCard(key,token);wake()}
function reset(){++sequence;selected=null;stage.classList.remove('has-selection','is-dispensing');card.hidden=true;hint.hidden=false;nav.forEach(b=>b.setAttribute('aria-pressed','false'));resetScene();wake()}
nav.forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>select(b.dataset.lab))});
document.getElementById('testlab-back').addEventListener('click',reset);
stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){reset();nav[0].focus()}});
window.addEventListener('hashchange',()=>{if(location.hash==='#builds'&&selected)reset()});
let initialized=false,visible=false,failed=false;
async function init(){
 if(initialized||failed)return;initialized=true;
 const THREE=await import('three');
 const {RoundedBoxGeometry}=await import('three/addons/geometries/RoundedBoxGeometry.js');
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){failed=true;fallback.hidden=false;return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#172630');scene.fog=new THREE.Fog('#172630',22,42);
 const camera=new THREE.PerspectiveCamera(35,1,.1,60),root=new THREE.Group();scene.add(root);
 const sky=new THREE.HemisphereLight('#d6e8e9','#554333',2);scene.add(sky);
 const key=new THREE.DirectionalLight('#fff0d9',2.5);key.position.set(-5,9,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
 const fill=new THREE.DirectionalLight('#a5cedf',1.8);fill.position.set(6,5,2);scene.add(fill);
 const mat=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const m={wall:mat('#5b625e',.92),floor:mat('#77766b',.84),blue:mat('#3a5964',.43,.45),deep:mat('#162b36',.45,.52),black:mat('#1b272d',.8),rubber:mat('#282d2c',.92),cream:mat('#e3d5bc',.65),silver:mat('#a3b0ac',.32,.78),brass:mat('#c5a16c',.38,.7),wood:mat('#937455',.8),orange:mat('#d3602a',.4,.12),light:new THREE.MeshBasicMaterial({color:'#fff0c7'}),glow:new THREE.MeshBasicMaterial({color:'#a9e4e3',toneMapped:false}),glass:new THREE.MeshPhysicalMaterial({color:'#c5e0dc',metalness:.05,roughness:.12,transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide})};
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
 // The machine casing: bevelled enamel shell, metal edge, cabinet back and base.
 const machine=new THREE.Group();machine.position.set(1.15,0,0);root.add(machine);
 box(machine,4.35,6.05,1.6,m.deep,0,3.13,-.03,.14);box(machine,4.2,5.9,1.53,m.blue,0,3.17,.08,.1);
 box(machine,3.18,3.7,.12,m.black,-.42,3.72,.48,.03);box(machine,2.98,3.43,.08,m.deep,-.42,3.72,.55,.025);
 // Lit back of the display and solid shelves establish depth behind the glass.
 box(machine,2.88,3.32,.05,mat('#6d8988',.75),-.42,3.73,.61,.01);
 for(const y of [2.23,3.45,4.68]){box(machine,2.96,.1,.44,m.silver,-.42,y,.83,.025);box(machine,2.88,.04,.42,m.cream,-.42,y+.07,.83,.01)}
 for(const x of [-1.81,.97])box(machine,.085,3.61,.13,m.brass,x,3.73,1.94,.015);
 for(const y of [2.05,5.53])box(machine,2.88,.075,.12,m.brass,-.42,y,1.94,.015);
 // Acrylic glass is slightly reflective and intentionally does not cast shadows.
 const pane=box(machine,2.82,3.35,.018,m.glass,-.42,3.74,1.96,.003);pane.castShadow=false;pane.receiveShadow=false;
 const shine=new THREE.Mesh(new THREE.PlaneGeometry(.055,2.7),new THREE.MeshBasicMaterial({color:'#e0f5ed',transparent:true,opacity:.16,depthWrite:false}));shine.position.set(-1.47,3.74,1.98);shine.rotation.z=-.13;machine.add(shine);
 // Backlit marquee, screws, ventilation slits and lower dispensing hatch.
 box(machine,3.9,.62,.16,m.cream,-.02,5.93,.9,.065);addLabel(machine,'KAVISH  /  PROJECTS',-.02,5.93,1.0,3.65,.43,{bg:'#e2d5bc',fg:'#273e47',size:70,border:false});
 for(const x of [-1.92,1.88])for(const y of [.34,5.82]){const bolt=ball(machine,.042,m.silver,x,y,.92,16);bolt.scale.z=.32}
 box(machine,2.55,.77,.16,m.black,-.45,1.08,.89,.08);box(machine,2.28,.48,.07,m.deep,-.45,1.08,.99,.05);box(machine,2.2,.045,.12,m.brass,-.45,.81,1.03,.015);
 addLabel(machine,'COLLECT HERE',-.45,1.08,1.04,1.72,.25,{bg:'#182d36',fg:'#b4c8c3',size:68,border:false});
 for(let j=0;j<7;j++)box(machine,.48,.026,.02,m.black,1.53,.73+j*.07,.91,.005);
 box(machine,4.34,.22,1.75,m.black,0,.16,.02,.05);for(const x of [-1.65,1.65])box(machine,.37,.15,.6,m.rubber,x,.06,.05,.04);
 // Selector panel, physical push buttons, payment slot, access door and fasteners.
 box(machine,1.02,3.7,.18,m.cream,1.42,3.72,.9,.05);box(machine,.78,.56,.035,m.deep,1.42,5.08,1.01,.02);addLabel(machine,'SELECT 01 – 04',1.42,5.08,1.035,.68,.31,{bg:'#193a41',fg:'#bee4d7',size:66,border:false});
 const buttonHighlights=[];for(let i=0;i<4;i++){const y=4.48-i*.55;box(machine,.78,.38,.045,m.blue,1.42,y,1.01,.03);const b=cylinder(machine,.095,.075,i===0?m.brass:m.silver,1.2,y,1.06,20);b.rotation.x=Math.PI/2;const halo=torus(machine,.128,.012,new THREE.MeshBasicMaterial({color:'#c0e2d7'}),1.2,y,1.105);halo.visible=false;buttonHighlights.push(halo);addLabel(machine,['01','02','03','04'][i],1.57,y,1.045,.29,.18,{bg:'#3a5964',fg:'#f3eddf',size:98,border:false})}
 box(machine,.68,.2,.035,m.deep,1.42,2.23,1.01,.02);box(machine,.35,.025,.02,m.black,1.42,2.23,1.04,.003);addLabel(machine,'PROJECTS',1.42,1.91,1.035,.64,.16,{bg:'#e3d5bc',fg:'#536b70',size:65,border:false});
 // Small industrial details and lighting around the cabinet.
 for(let i=0;i<6;i++)box(machine,.03,.65,.07,m.deep,2.07,3.0+i*.4,-.35,.008);
 const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(2.1,.5,-.5),new THREE.Vector3(2.5,.25,-1),new THREE.Vector3(2.7,.06,-2),new THREE.Vector3(3.4,.04,-2.8),new THREE.Vector3(3.8,.5,-3.2)]);machine.add(new THREE.Mesh(new THREE.TubeGeometry(cable,40,.027,8,false),m.rubber));
 box(root,1.4,1.05,.3,m.blue,-3.7,1.5,-3.15,.04);box(root,1.22,.85,.04,m.cream,-3.7,1.5,-2.98,.01);addLabel(root,'PROJECT NOTES',-3.7,1.75,-2.94,1,.22,{bg:'#e3d5bc',fg:'#42545a',size:64,border:false});
 for(let i=0;i<4;i++)box(root,.65,.025,.015,m.blue,-3.65,1.48-i*.12,-2.94,.004);
 box(root,1.6,.12,.8,m.wood,-3.9,1.05,-2.6,.035);for(const x of [-4.5,-3.3])box(root,.09,1,.09,m.deep,x,.5,-2.55,.015);
 for(const x of [-4.28,-3.92,-3.56]){cylinder(root,.13,.24,m.brass,x,1.23,-2.55);cylinder(root,.105,.12,m.silver,x,1.41,-2.55)}
 const lit=new THREE.PointLight('#ffdca4',18,8,2);lit.position.set(1,6,4);scene.add(lit);const glow=new THREE.PointLight('#a7d9e1',5,4,2);glow.position.set(1,4,1.6);scene.add(glow);
 // Four recognisable miniature project objects, each modelled as a coherent assembly.
 const models={},springs={},targets=[],slots={strata:[-1.14,4.77],drone:[.3,4.77],orbit:[-1.14,3.55],wing:[.3,3.55]};
 for(const [i,name] of ['strata','drone','orbit','wing'].entries()){const target=box(machine,.82,.43,.07,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),1.42,4.48-i*.55,1.11,0);target.castShadow=false;target.userData.key=name;targets.push(target)}
 for(const [name,[x,y]] of Object.entries(slots)){
  const holder=new THREE.Group();holder.position.set(x,y,.92);machine.add(holder);models[name]=holder;
  const hit=box(machine,1.26,1.05,.18,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x,y+.34,1.48,0);hit.castShadow=false;hit.userData.key=name;targets.push(hit);
  const number={strata:'01 / STRATA',drone:'02 / QUADS',orbit:'03 / ORBIT',wing:'04 / WING'}[name];addLabel(machine,number,x,y-.02,1.945,1.22,.13,{bg:'#203945',fg:'#e8e5d8',size:67,border:false});
  const springPoints=[];for(let i=0;i<100;i++){const t=i/99*4*Math.PI;springPoints.push(new THREE.Vector3(Math.cos(t)*.27,Math.sin(t)*.20,i/99*.48))}const spring=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPoints),100,.013,8,false),m.silver);spring.position.set(x,y+.22,.61);machine.add(spring);springs[name]=spring;
 }
 // Strata is based on the photographs: a ladder frame, sliced acrylic roof,
 // open sides, vertical rear grille and orange triangular wheel centres.
 {const g=models.strata;const truck=new THREE.Group();truck.position.y=.22;truck.rotation.y=-.28;g.add(truck);
  const acrylic=new THREE.MeshPhysicalMaterial({color:'#f86618',roughness:.28,metalness:.06,clearcoat:.8});
  const orangeDark=mat('#b7330b',.43), tyreMat=mat('#202322',.94);
  for(const z of [-.15,.15])box(truck,.96,.045,.035,m.black,0,.06,z,.007);
  for(const x of [-.38,-.12,.16,.39])box(truck,.035,.035,.34,m.black,x,.06,0,.004);
  box(truck,.55,.055,.28,m.deep,0,.115,0,.01);
  // Individual laser-cut ribs follow the stepped body profile, with open windows.
  const rib=new THREE.Shape();rib.moveTo(-.46,.22);rib.lineTo(-.33,.25);rib.lineTo(-.2,.39);rib.lineTo(.14,.42);rib.lineTo(.32,.31);rib.lineTo(.47,.27);rib.lineTo(.47,.245);rib.lineTo(.3,.27);rib.lineTo(.13,.37);rib.lineTo(-.18,.35);rib.lineTo(-.31,.21);rib.closePath();
  const ribGeo=new THREE.ExtrudeGeometry(rib,{depth:.012,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:1});
  for(let i=0;i<10;i++){const mesh=new THREE.Mesh(ribGeo,acrylic);mesh.position.z=-.18+i*.04;truck.add(mesh)}
  for(const z of [-.19,.19]){rod(truck,[-.45,.21,z],[.46,.26,z],.009,m.black);for(const x of [-.39,-.1,.2,.43])rod(truck,[x,.07,z],[x,.25,z],.01,m.black)}
  for(let i=0;i<7;i++)rod(truck,[.46,.10,-.17+i*.057],[.46,.27,-.17+i*.057],.009,m.black);
  for(const x of [-.31,.31])for(const z of [-.25,.25]){const tyre=cylinder(truck,.175,.14,tyreMat,x,.09,z,40);tyre.rotation.x=Math.PI/2;const face=z>0?z+.073:z-.073;const hub=cylinder(truck,.108,.012,acrylic,x,.09,face,32);hub.rotation.x=Math.PI/2;const rim=torus(truck,.126,.012,m.silver,x,.09,face+(z>0?.009:-.009));for(let n=0;n<20;n++){const angle=n*Math.PI*2/20;const tread=box(truck,.04,.02,.145,m.black,x+Math.sin(angle)*.171,.09+Math.cos(angle)*.171,z,.003);tread.rotation.z=-angle}const tri=new THREE.Shape();tri.moveTo(0,.067);tri.lineTo(-.052,-.037);tri.lineTo(.052,-.037);tri.closePath();const inset=new THREE.Mesh(new THREE.ShapeGeometry(tri),orangeDark);inset.position.set(x,.09,face+(z>0?.01:-.01));if(z<0)inset.rotation.y=Math.PI;truck.add(inset)}
  for(const x of [-.31,.31]){rod(truck,[x,.09,-.22],[x,.09,.22],.018,m.silver);for(const z of [-.16,.16]){rod(truck,[x,.08,z],[x+(x<0?.12:-.12),.2,z],.012,m.silver);rod(truck,[x,.1,z],[x+(x<0?.1:-.1),.23,z],.016,m.black)}}
  box(truck,.22,.06,.16,m.blue,-.02,.17,0,.008);for(let i=0;i<3;i++)rod(truck,[-.12+i*.07,.2,0],[.02+i*.06,.23,.1],.005,i===1?acrylic:m.silver);
 }
 // The drone is supported on a stand and has four connected arms, motors and propellers.
 {const g=models.drone;const drone=new THREE.Group();drone.position.y=.38;drone.rotation.y=.25;g.add(drone);box(drone,.28,.09,.24,m.blue,0,0,0,.025);box(drone,.16,.035,.16,m.black,0,.07,0,.01);
  for(const x of [-.27,.27])for(const z of [-.22,.22]){rod(drone,[0,0,0],[x,0,z],.018,m.deep);cylinder(drone,.045,.055,m.silver,x,.03,z,18);const prop=new THREE.Group();prop.position.set(x,.07,z);drone.add(prop);box(prop,.30,.009,.04,m.cream,0,0,0,.004);cylinder(prop,.02,.02,m.brass,0,.012,0,14)}
  for(const x of [-.27,.27])for(const z of [-.22,.22]){const cap=cylinder(drone,.026,.035,m.black,x,.073,z,16);const stripe=torus(drone,.052,.005,m.brass,x,.035,z);stripe.rotation.x=Math.PI/2}box(drone,.12,.035,.1,m.silver,0,.095,0,.006);box(drone,.18,.012,.14,m.deep,0,.12,0,.004);for(const x of [-.06,.06])for(const z of [-.045,.045]){const screw=cylinder(drone,.008,.008,m.brass,x,.129,z,8)}box(drone,.08,.05,.06,m.black,0,-.045,.13,.008);ball(drone,.022,m.glow,0,-.045,.168,12);for(const x of [-.08,.08])rod(drone,[x,.06,.05],[x,.13,.12],.006,m.orange);for(const x of [-.09,.09]){rod(drone,[x,-.05,-.08],[x,-.15,-.12],.009,m.silver);rod(drone,[x,-.15,-.12],[x,-.15,.13],.009,m.silver)}
  cylinder(g,.025,.2,m.silver,0,.17,0,12);cylinder(g,.18,.025,m.deep,0,.07,0,24);
 }
 // Globe with three distinct conceptual orbital paths and visible satellite markers.
 {const g=models.orbit;const globe=new THREE.Group();globe.position.y=.38;g.add(globe);const ocean=mat('#447f96',.5,.12);ball(globe,.22,ocean,0,0,0,32);
  const land=mat('#b7c8b1',.8);for(const [x,y,z,sx,sy] of [[-.14,.07,.16,.09,.07],[.03,.1,.2,.1,.055],[.12,-.05,.17,.07,.1],[-.08,-.12,.17,.05,.09]]){const c=ball(globe,.075,land,x,y,z,12);c.scale.set(sx/.075,sy/.075,.18)}
  for(let i=0;i<3;i++){const ring=torus(globe,.29+i*.045,.008,i===1?m.brass:m.silver,0,0,0);ring.rotation.set(.75+i*.33,.2+i*.5,i*.37);const sat=ball(ring,.025,m.cream,.29+i*.045,0,0,12);sat.scale.set(1,.7,.7)}
  for(let i=0;i<8;i++){const a=i*2.4;const dot=ball(globe,.009,i%2?m.orange:m.cream,Math.cos(a)*.34,Math.sin(a*.7)*.19,Math.sin(a)*.25,8)}rod(g,[0,.06,0],[0,.16,0],.023,m.silver);cylinder(g,.16,.035,m.deep,0,.05,0,24);
 }
 // Corrugated wing, held on a real stand, with a small flow direction marker.
 {const g=models.wing;const profile=new THREE.Shape();profile.moveTo(-.34,0);for(let i=0;i<=10;i++)profile.lineTo(-.34+i*.068,i%2?.045:0);profile.lineTo(.34,-.03);profile.lineTo(-.34,-.03);profile.closePath();const wing=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{depth:.26,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2}),m.cream);wing.position.set(0,.38,-.13);wing.rotation.z=.08;g.add(wing);for(let i=0;i<6;i++){const x=-.29+i*.115;rod(g,[x,.43,-.12],[x,.43,.13],.004,m.brass)}for(const z of [-.14,.14]){rod(g,[-.35,.39,z],[.35,.39,z],.006,m.silver);for(let i=0;i<5;i++)ball(g,.009,m.brass,-.28+i*.14,.39,z,8)}rod(g,[0,.08,0],[0,.37,0],.02,m.silver);cylinder(g,.16,.035,m.deep,0,.05,0,24);}
 // Collection flap is below the glass; the hidden delivery channel is behind
 // the display back, so a model never has to pass through the front pane.
 const hatch=new THREE.Group();hatch.position.set(-.45,1.34,1.06);machine.add(hatch);box(hatch,2.08,.4,.05,m.blue,0,-.2,0,.03);box(hatch,1.8,.025,.035,m.brass,0,-.34,.04,.005);
 // The lower compartment holds a set of engineering notes and material samples.
 box(machine,1.03,.075,.42,m.deep,-1.02,2.35,.94,.014);box(machine,.94,.035,.39,m.cream,-1.02,2.41,.94,.01);
 for(let i=0;i<4;i++)box(machine,.73,.012,.012,m.blue,-1.02,2.435,1.07-i*.065,.002);
 box(machine,.68,.075,.4,m.blue,.14,2.35,.93,.02);box(machine,.58,.035,.32,m.cream,.14,2.41,.93,.01);cylinder(machine,.085,.03,m.brass,.14,2.44,.93,20);
 addLabel(machine,'SKETCHES  /  MATERIALS',-.42,2.18,1.41,2.1,.12,{bg:'#203945',fg:'#d4dfd8',size:65,border:false});
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
 const desired=new THREE.Vector3(6,4.5,13.2),look=new THREE.Vector3(.5,3.1,.2),desiredLook=look.clone(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();camera.position.copy(desired);camera.lookAt(look);
 let raf=0,last=0,dirty=true,dispense=null,hover=null;
 function size(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;dirty=true;wake()}
 // A selected object is retained for the close-up until the user leaves.
 let presentation=null;
 function clearPresentation(){if(presentation){machine.remove(presentation.copy);presentation.original.visible=true;presentation.spring.rotation.z=0;presentation=null}if(dispense){machine.remove(dispense.copy);dispense.original.visible=true;dispense.spring.rotation.z=0;dispense=null}hatch.rotation.x=0;dirty=true}
 function focusPosition(){camera.updateMatrixWorld();machine.updateWorldMatrix(true,false);const distance=4.35;const x=Math.min(.9,Math.max(.35,camera.aspect*.53));return machine.worldToLocal(camera.localToWorld(new THREE.Vector3(x,-.42,-distance)))}
 function finishDispense(){if(!dispense)return;presentation=dispense;dispense=null;presentation.original.visible=true;presentation.copy.visible=true;presentation.copy.position.copy(focusPosition());presentation.copy.scale.setScalar(1.48);const done=presentation.done;dirty=true;done?.()}
 function cancelDispense(){clearPresentation()}
 const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 selectScene=(name,done)=>{cancelDispense();buttonHighlights.forEach((h,i)=>h.visible=['strata','drone','orbit','wing'][i]===name);desired.set(4.2,4.1,10.2);desiredLook.set(.6,3,.1);const original=models[name],copy=original.clone(true);copy.position.copy(original.position);machine.add(copy);dispense={copy,original,spring:springs[name],start:performance.now(),done};if(reduce){finishDispense();return true}dirty=true;return true};
 resetScene=()=>{cancelDispense();buttonHighlights.forEach(h=>h.visible=false);desired.set(6,4.5,13.2);desiredLook.set(.5,3.1,.2);dirty=true};
 function frame(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min(.05,(now-(last||now))/1000);last=now;const f=reduce?1:1-Math.exp(-4*dt);camera.position.lerp(desired,f);look.lerp(desiredLook,f);camera.lookAt(look);let moving=camera.position.distanceTo(desired)>.008||look.distanceTo(desiredLook)>.008;
  if(dispense){const elapsed=now-dispense.start,start=dispense.original.position;const feed=ease(elapsed/1500),fall=ease((elapsed-1500)/1150),open=ease((elapsed-2650)/400),emerge=ease((elapsed-3050)/600),focus=ease((elapsed-3650)/1050);dispense.original.visible=false;dispense.spring.rotation.z=-feed*Math.PI*4;
   if(elapsed<1500){dispense.copy.visible=true;dispense.copy.position.set(start.x,start.y,THREE.MathUtils.lerp(start.z,1.5,feed));dispense.copy.scale.setScalar(1)}
   else if(elapsed<2650){dispense.copy.visible=true;dispense.copy.position.set(start.x,THREE.MathUtils.lerp(start.y,1.82,fall),1.5);dispense.copy.scale.setScalar(1);dispense.copy.rotation.z=fall*.35;}
   else if(elapsed<3050){dispense.copy.visible=false;}
   else {dispense.copy.visible=true;const end=focusPosition();dispense.copy.rotation.z=0;dispense.copy.position.set(THREE.MathUtils.lerp(-.45,end.x,focus),THREE.MathUtils.lerp(1.04,end.y,focus),THREE.MathUtils.lerp(THREE.MathUtils.lerp(1.0,1.5,emerge),end.z,focus));dispense.copy.scale.setScalar(1+.48*focus)}
   hatch.rotation.x=-open*.8;dirty=true;if(elapsed>=4700)finishDispense()}
  if(presentation){presentation.copy.position.copy(focusPosition());if(!reduce){presentation.copy.rotation.y+=dt*.42;dirty=true}}
  if(moving||dirty){renderer.render(scene,camera);dirty=false}if(moving||dispense||(presentation&&!reduce))raf=requestAnimationFrame(frame);
 }
 wake=()=>{if(visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame)}};
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const key=ray.intersectObjects(targets)[0]?.object.userData.key||null;canvas.style.cursor=key?'pointer':'default';if(key!==hover){hover=key;buttonHighlights.forEach((h,i)=>h.visible=['strata','drone','orbit','wing'][i]===(key||selected));dirty=true;wake()}});
 canvas.addEventListener('pointerleave',()=>{hover=null;buttonHighlights.forEach((h,i)=>h.visible=['strata','drone','orbit','wing'][i]===selected);dirty=true;wake()});
 canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets)[0];if(hit)select(hit.object.userData.key)});
 window.addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){dirty=true;wake()}});new ResizeObserver(size).observe(stage);size();if(selected)selectScene(selected,()=>showCard(selected,sequence));wake();
}
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible){if(!initialized)init().catch(()=>{failed=true;fallback.hidden=false});else wake()}},{threshold:.01});observer.observe(stage);

})();
