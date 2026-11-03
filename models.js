/* Extra scenes share the hero's renderer, environment map and animation clock. */
window.createPortfolioAtelier=function({THREE,Round,environment,reduced,anisotropy=4}){
 const mat=(colour,roughness=.4,metalness=0)=>new THREE.MeshPhysicalMaterial({color:colour,roughness,metalness,clearcoat:metalness?0:.45});
 const ink=mat(0x142d43),paper=mat(0xf1e6d2,.7),copper=mat(0xa86e51,.27,.65),blue=mat(0x537e9a,.27,.5),silver=mat(0xcbd7dc,.24,.85),wood=mat(0x55382c,.47),dark=mat(0x121c22,.55),glass=mat(0xb5d2de,.14,.35);
 const mesh=(g,m,parent,pos=[0,0,0])=>{const o=new THREE.Mesh(g,m);o.position.set(...pos);parent.add(o);return o};
 const box=(parent,w,h,d,m,pos,r=.04)=>mesh(new Round(w,h,d,3,r),m,parent,pos);
 function line(parent,points,material){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Line(g,material);parent.add(o);return o}
 const stringMat=new THREE.LineBasicMaterial({color:0xd6dedc,transparent:true,opacity:.8});
 function guitar(){
  const g=new THREE.Group(),shape=new THREE.Shape();shape.moveTo(0,1.05);shape.bezierCurveTo(-.15,1.18,-.5,1.5,-.58,1.1);shape.bezierCurveTo(-.65,.7,-.3,.5,-.66,.16);shape.bezierCurveTo(-1.25,-.35,-1.0,-1.22,0,-1.32);shape.bezierCurveTo(1.0,-1.22,1.25,-.35,.66,.16);shape.bezierCurveTo(.3,.5,.65,.7,.58,1.1);shape.bezierCurveTo(.5,1.5,.15,1.18,0,1.05);
  const body=mesh(new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSegments:5,bevelThickness:.1,bevelSize:.09,steps:1,curveSegments:36}),wood,g);body.position.z=-.12;
  const pg=shape.clone();const guard=mesh(new THREE.ShapeGeometry(pg,32),paper,g,[0,-.08,.245]);guard.scale.set(.72,.7,1);
  box(g,.28,2.85,.17,wood,[0,2.15,0]);box(g,.22,2.7,.035,dark,[0,2.08,.105],.01);
  const head=box(g,.4,.78,.16,wood,[.05,3.8,0],.08);head.rotation.z=-.1;
  for(let i=0;i<19;i++){const y=.7+2.6*(1-Math.pow(.91,i+1));box(g,.23,.015,.02,silver,[0,y,.132],.005);if([2,4,6,8,11,14].includes(i))mesh(new THREE.SphereGeometry(.025,12,8),paper,g,[0,y-.055,.14])}
  [-.3,.22].forEach(y=>{box(g,.48,.16,.07,dark,[0,y,.29]);for(let i=0;i<6;i++)mesh(new THREE.SphereGeometry(.024,10,8),silver,g,[-.15+i*.06,y,.335])});box(g,.54,.16,.08,silver,[0,-.68,.28]);
  for(let i=0;i<6;i++){const x=-.085+i*.034;line(g,[[x,-.73,.34],[x,3.65,.16]],stringMat);const peg=mesh(new THREE.CylinderGeometry(.06,.06,.16,12),silver,g,[i<3?-.25:.3,3.55+(i%3)*.18,0]);peg.rotation.z=Math.PI/2}
  [.3,.45,.58].forEach((x,i)=>{const knob=mesh(new THREE.CylinderGeometry(.065,.075,.06,20),copper,g,[x,-.65+i*.16,.28]);knob.rotation.x=Math.PI/2});g.userData.tick=(t,h)=>{guard.material=paper};return g;
 }
 function sketchbook(){
  const g=new THREE.Group();box(g,2.15,2.85,.2,ink,[0,0,0]);box(g,2.02,2.68,.14,paper,[.025,0,.12],.02);
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;const c=canvas.getContext('2d');c.fillStyle='#f1e6d2';c.fillRect(0,0,768,1024);c.strokeStyle='#537e9a33';c.lineWidth=1;
  for(let y=100;y<1024;y+=42){c.beginPath();c.moveTo(40,y);c.lineTo(728,y);c.stroke()}c.fillStyle='#142d43';c.font='600 84px Caveat,cursive';c.fillText('Sketch. Build.',70,140);c.font='600 70px Caveat,cursive';c.fillText('Try again.',70,220);c.font='500 24px "IBM Plex Mono",monospace';c.fillText('PROJECT STRATA / BODY STUDIES',65,940);
  c.save();c.translate(85,430);c.rotate(-.04);c.strokeStyle='#142d43';c.lineWidth=6;c.beginPath();c.moveTo(20,230);c.lineTo(30,105);c.lineTo(150,80);c.lineTo(205,0);c.lineTo(400,0);c.lineTo(480,95);c.lineTo(545,120);c.lineTo(558,228);c.closePath();c.stroke();for(let i=0;i<9;i++){c.beginPath();c.moveTo(70+i*48,96);c.lineTo(60+i*48,225);c.stroke()}[130,440].forEach(x=>{c.beginPath();c.arc(x,235,65,0,Math.PI*2);c.stroke();c.beginPath();c.arc(x,235,30,0,Math.PI*2);c.stroke()});c.restore();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=anisotropy;mesh(new THREE.PlaneGeometry(1.94,2.59),new THREE.MeshStandardMaterial({map:texture,roughness:.9}),g,[.025,0,.196]);
  for(let y=-1.13;y<1.2;y+=.34){const ring=mesh(new THREE.TorusGeometry(.1,.019,8,22),silver,g,[-1.02,y,.08]);ring.rotation.y=Math.PI/2}
  const pencil=new THREE.Group();const shaft=mesh(new THREE.CylinderGeometry(.055,.055,2.5,6),blue,pencil);const tip=mesh(new THREE.ConeGeometry(.055,.25,6),wood,pencil,[0,-1.375,0]);tip.rotation.z=Math.PI;mesh(new THREE.CylinderGeometry(.06,.06,.14,12),silver,pencil,[0,1.24,0]);pencil.rotation.z=-.16;pencil.position.set(1.27,.08,.1);g.add(pencil);return g;
 }
 function orbit(){
  const g=new THREE.Group(),globe=mesh(new THREE.SphereGeometry(.72,48,32),blue,g);const longitude=new THREE.LineBasicMaterial({color:0xb5d2de,transparent:true,opacity:.55});
  for(let i=0;i<6;i++){const ring=mesh(new THREE.TorusGeometry(.728,.007,4,80),glass,g);ring.rotation.y=i*Math.PI/6}
  [-.4,0,.4].forEach(y=>{const rr=Math.sqrt(.73*.73-y*y),ring=mesh(new THREE.TorusGeometry(rr,.008,5,80),glass,g,[0,y,0]);ring.rotation.x=Math.PI/2});
  const tracks=[];for(let i=0;i<3;i++){const track=new THREE.Group();track.rotation.set(.7+i*.35,.2+i*.4,i*.55);mesh(new THREE.TorusGeometry(1.05+i*.21,.018,8,100),i===1?copper:silver,track);const satellite=box(track,.15,.15,.15,paper,[1.05+i*.21,0,0],.025);box(satellite,.47,.12,.025,blue,[0,0,.1],.01);g.add(track);tracks.push(track)}
  g.userData.tick=(t,h)=>tracks.forEach((o,i)=>o.rotation.z=i*.55+(reduced?0:t*(.07+i*.03)));return g;
 }
 function drone(){
  const g=new THREE.Group();box(g,1.0,.34,1.4,paper,[0,0,0],.16);box(g,.74,.12,.84,ink,[0,.21,0],.08);const lens=mesh(new THREE.CylinderGeometry(.2,.2,.27,32),dark,g,[0,-.02,.76]);lens.rotation.x=Math.PI/2;const lensGlass=mesh(new THREE.SphereGeometry(.16,24,16),glass,g,[0,-.02,.88]);lensGlass.scale.z=.35;const props=[];
  for(const x of [-1,1])for(const z of [-1,1]){const arm=box(g,.13,.13,1.7,blue,[x*.65,-.02,z*.57]);arm.rotation.y=x*z*.8;const motor=mesh(new THREE.CylinderGeometry(.17,.17,.25,24),dark,g,[x*1.23,.04,z*1.12]);const rotor=new THREE.Group();rotor.position.set(x*1.23,.21,z*1.12);const blade=box(rotor,1.35,.035,.13,copper,[0,0,0],.03);g.add(rotor);props.push(rotor);const leg=box(g,.07,.45,.07,silver,[x*.43,-.33,z*.5]);}
  g.userData.tick=(t,h)=>props.forEach((p,i)=>p.rotation.y=reduced?i:t*(2+h*10)*(i%2?1:-1));g.rotation.x=.4;return g;
 }
 function trophy(){
  const g=new THREE.Group();const pts=[[0,0],[.46,0],[.47,.1],[.18,.2],[.12,.32],[.12,.65],[.3,.78],[.55,1.05],[.69,1.48],[.72,1.8]].map(([x,y])=>new THREE.Vector2(x,y));mesh(new THREE.LatheGeometry(pts,64),copper,g,[0,-.7,0]);box(g,1.35,.28,1.15,ink,[0,-.86,0],.06);box(g,.76,.23,.035,paper,[0,-.82,.6],.02);
  [-1,1].forEach(s=>{const handle=mesh(new THREE.TorusGeometry(.44,.055,12,48,Math.PI*1.6),copper,g,[s*.67,.5,0]);handle.rotation.z=s<0?Math.PI*.7:-Math.PI*.3});
  const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.16:.35;i?star.lineTo(Math.cos(a)*r,Math.sin(a)*r):star.moveTo(Math.cos(a)*r,Math.sin(a)*r)}star.closePath();mesh(new THREE.ExtrudeGeometry(star,{depth:.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2}),paper,g,[0,.54,.65]);return g;
 }
 const factories={guitar,sketch:sketchbook,orbit,drone,trophy};
 const descriptions={guitar:'Guitar / Trinity Grade 8',sketch:'Sketchbook / Project Strata body studies',orbit:'Orbit / 450, 550 and 850 km',drone:'Anti-drone quadcopter study',trophy:'Awards & olympiads'};
 const slots=[...document.querySelectorAll('[data-scene]')].map(el=>{
  if(el.dataset.scene==='staircase')return window.createCodeStaircase({THREE,Round,environment,makeDrone:drone,reduced,el,anisotropy});
  if(el.dataset.scene==='cabinet')return window.createTrophyCabinet({THREE,Round,environment,reduced,el,anisotropy});
  const scene=new THREE.Scene();scene.environment=environment;scene.add(new THREE.HemisphereLight(0xf1e6d2,0x244b63,1.8));const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-4,6,8);scene.add(key);const rim=new THREE.DirectionalLight(0xb5d2de,1.9);rim.position.set(5,2,-5);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.15,el.dataset.scene==='about'?13.6:9.8);camera.lookAt(0,0,0);const group=new THREE.Group();scene.add(group);const keys=el.dataset.scene==='about'?['guitar','sketch','orbit']:[el.dataset.scene];
  const models=keys.map((k,i)=>{const obj=factories[k]();group.add(obj);let base=keys.length===1?new THREE.Vector3(0,0,0):[new THREE.Vector3(-1.1,-.45,.4),new THREE.Vector3(1.36,-.85,-.25),new THREE.Vector3(1.5,1.5,-.8)][i];const scale=keys.length===1?(k==='drone'?1.28:1.35):[.83,.92,.74][i];const rotation=keys.length===1?new THREE.Euler(.05,-.3,-.15):[new THREE.Euler(.08,.12,-.22),new THREE.Euler(-.32,-.32,.21),new THREE.Euler(.2,0,-.2)][i];return{key:k,obj,base,scale,rotation,emphasis:0}});
  const slot={el,scene,camera,group,models,selected:null,visible:false,rotation:0,targetRotation:0,pitch:0,targetPitch:0,hover:false,dragging:false};el.classList.add('ready');
  const select=k=>{slot.selected=k;el.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===k)));document.querySelectorAll(`.interest-row[data-model]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===k)));const status=el.querySelector('[data-model-status]');if(status)status.textContent=descriptions[k]||'A few things from the workbench.'};
  el.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>select(slot.selected===b.dataset.model?null:b.dataset.model)));
  if(el.dataset.scene==='about')document.querySelectorAll('.interest-row[data-model]').forEach(b=>b.addEventListener('click',()=>select(slot.selected===b.dataset.model?null:b.dataset.model)));
  el.querySelector('.stage-reset')?.addEventListener('click',()=>{slot.targetRotation=slot.targetPitch=0;select(null)});
  let pointer=null;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,id:e.pointerId};slot.dragging=true});
  el.addEventListener('pointermove',e=>{slot.hover=true;if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;slot.targetRotation+=dx*.008;slot.targetPitch=THREE.MathUtils.clamp(slot.targetPitch+dy*.004,-.3,.3);pointer.x=e.clientX;pointer.y=e.clientY;if(Math.abs(e.clientX-pointer.startX)>8&&e.pointerType==='mouse')el.setPointerCapture(e.pointerId)});
  const release=()=>{pointer=null;slot.dragging=false};el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);el.addEventListener('pointerleave',()=>{slot.hover=false;if(!el.hasPointerCapture(pointer?.id||-1))release()});
  el.addEventListener('keydown',e=>{if(e.target!==el)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();slot.targetRotation+=e.key==='ArrowLeft'?-.22:.22}else if(e.key==='Home'){e.preventDefault();slot.targetRotation=slot.targetPitch=0}});
  return slot;
 });
 const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 return{slots,update(dt,t){for(const slot of slots){if(!slot.visible)continue;if(slot.customUpdate){slot.customUpdate(dt,t);continue}slot.rotation=damp(slot.rotation,slot.targetRotation,10,dt);slot.pitch=damp(slot.pitch,slot.targetPitch,10,dt);slot.group.rotation.y=slot.rotation+(reduced?0:Math.sin(t*.28)*.08);slot.group.rotation.x=slot.pitch;for(const [i,m] of slot.models.entries()){m.emphasis=damp(m.emphasis,slot.selected===m.key?1:0,7,dt);m.obj.position.copy(m.base);m.obj.position.z+=m.emphasis*.85;m.obj.position.y+=(reduced?0:Math.sin(t*.8+i*1.4)*.055)+m.emphasis*.12;m.obj.rotation.copy(m.rotation);m.obj.rotation.y+=m.emphasis*.15;m.obj.scale.setScalar(m.scale*(1+m.emphasis*.13));m.obj.userData.tick?.(t,slot.hover?1:0)}}}};
};
