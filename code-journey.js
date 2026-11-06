/* Two real projects, one physical helix. The camera and drone follow scroll in both directions. */
window.createCodeStaircase=function({THREE,Round,environment,makeDrone,reduced,el,anisotropy=4,batch=root=>root}){
 const masonry=window.createMasonry({THREE,anisotropy});
 const journey=document.getElementById('code-journey');
 const scene=new THREE.Scene();scene.environment=environment;scene.fog=new THREE.Fog(0xefe4d3,22,46);
 const sky=new THREE.HemisphereLight(0xf4eadb,0x9a8a78,1.05);scene.add(sky);
 const night=dark=>{scene.fog.color.set(dark?0x17272b:0xefe4d3);sky.intensity=dark?.55:1.05};night(document.documentElement.dataset.theme==='dark');addEventListener('site-theme',e=>night(e.detail.dark));
 const key=new THREE.DirectionalLight(0xfff0dc,2.8);key.position.set(-7,10,9);key.target.position.set(0,-3.4,0);scene.add(key,key.target);
 // Real shadows from one light. The stairs never move, so the map is drawn once and redrawn only while the doors swing.
 key.castShadow=true;{const shadowSize=innerWidth<=650?1024:2048;key.shadow.mapSize.set(shadowSize,shadowSize)}key.shadow.bias=-.0004;key.shadow.normalBias=.025;key.shadow.autoUpdate=false;key.shadow.needsUpdate=true;
 {const c=key.shadow.camera;c.left=-8.5;c.right=8.5;c.top=9.5;c.bottom=-9.5;c.near=1;c.far=46}
 const fill=new THREE.DirectionalLight(0xeb5939,1.5);fill.position.set(8,3,-7);scene.add(fill);
 const camera=new THREE.PerspectiveCamera(43,1,.1,80);
 const treadTexture={map:masonry.limestone.map,bumpMap:masonry.limestone.bumpMap,bumpScale:1.5};
 const stone=new THREE.MeshStandardMaterial({...treadTexture,color:0x665f56,roughness:.78,metalness:0,envMapIntensity:.55});
 const edge=new THREE.MeshStandardMaterial({...treadTexture,color:0x9c9284,roughness:.7,metalness:0,envMapIntensity:.55});
 const metal=new THREE.MeshStandardMaterial({color:0x1e1c1a,roughness:.3,metalness:.75});
 const copper=new THREE.MeshStandardMaterial({color:0xeb5939,roughness:.35,metalness:.6});
 const brass=new THREE.MeshStandardMaterial({color:0xc9a45c,metalness:1,roughness:.34,envMapIntensity:.8});
 const columnStone=new THREE.MeshStandardMaterial({map:masonry.limestone.map,bumpMap:masonry.limestone.bumpMap,bumpScale:1.6,color:0x5a544c,roughness:.72,envMapIntensity:.45});
 const accent=new THREE.MeshStandardMaterial({color:0xb7ab98,roughness:.4,emissive:0x6a6054,emissiveIntensity:.25});
 const world=new THREE.Group();scene.add(world);
 const start=-.4,total=Math.PI*3.2,drop=11.3,steps=90,outer=3.45;
 const at=(q,r,lift=0)=>new THREE.Vector3(Math.sin(start+q*total)*r,-q*drop+lift,Math.cos(start+q*total)*r);
 const add=(geometry,material,parent,position)=>{const m=new THREE.Mesh(geometry,material);if(position)m.position.copy(position);parent.add(m);return m};
 function wedge(span,inner,radius,curve=5){const s=new THREE.Shape(),a=-Math.PI/2;s.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);s.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);s.absarc(0,0,radius,a,a+span,false);s.lineTo(Math.cos(a+span)*inner,Math.sin(a+span)*inner);s.absarc(0,0,inner,a+span,a,true);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.105,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:1,curveSegments:curve});g.rotateX(-Math.PI/2);return g}
 const tread=wedge(total/steps*.98,.33,outer,6);
 const ordinary=new THREE.InstancedMesh(tread,stone,80),marked=new THREE.InstancedMesh(tread,edge,10),stepTransform=new THREE.Object3D();let ordinaryIndex=0,markedIndex=0;
 const treadTint=new THREE.Color(),treads=[];let treadSeed=7;
 for(let i=0;i<steps;i++){stepTransform.position.set(0,-i/steps*drop,0);stepTransform.rotation.y=start+i/steps*total;stepTransform.updateMatrix();treadSeed=(treadSeed*16807)%2147483647;const tone=.86+(treadSeed/2147483647)*.28;treadTint.setRGB(tone,tone*.985,tone*.96);treads.push({mesh:i%9===0?marked:ordinary,slot:i%9===0?markedIndex:ordinaryIndex,i});if(i%9===0){marked.setColorAt(markedIndex,treadTint);marked.setMatrixAt(markedIndex++,stepTransform.matrix)}else{ordinary.setColorAt(ordinaryIndex,treadTint);ordinary.setMatrixAt(ordinaryIndex++,stepTransform.matrix)}}
 ordinary.computeBoundingSphere();marked.computeBoundingSphere();world.add(ordinary,marked);
 const columnUv=(g,long)=>{const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*2.26,u.getY(i)*long);return g};
 const core=add(columnUv(new THREE.CylinderGeometry(.36,.36,drop+1,48),drop+1),columnStone,world,new THREE.Vector3(0,-drop/2+.15,0));
 const bandCount=8,bands=new THREE.InstancedMesh(new THREE.CylinderGeometry(.385,.385,.07,48),brass,bandCount);
 const points=[];for(let i=0;i<=240;i++)points.push(at(i/240,outer-.06,1.0));
 const outerRail=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),300,.035,7,false),metal,world);
 const innerRadius=.62,innerPoints=[];for(let i=0;i<=160;i++)innerPoints.push(at(i/160,innerRadius,.85));const innerRail=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(innerPoints),220,.024,6,false),copper,world);
 const posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.018,1.02,7),metal,31);stepTransform.rotation.set(0,0,0);
 for(let i=0;i<=steps;i+=3){stepTransform.position.copy(at(i/steps,outer-.06,.5));stepTransform.updateMatrix();posts.setMatrixAt(i/3,stepTransform.matrix)}posts.computeBoundingSphere();world.add(posts);
 const innerPosts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.014,.014,.87,7),copper,31);
 for(let i=0;i<=steps;i+=3){stepTransform.position.copy(at(i/steps,innerRadius,.43));stepTransform.updateMatrix();innerPosts.setMatrixAt(i/3,stepTransform.matrix)}innerPosts.computeBoundingSphere();world.add(innerPosts);
 for(let i=0;i<bandCount;i++){stepTransform.position.set(0,-.2-i*1.56,0);stepTransform.updateMatrix();bands.setMatrixAt(i,stepTransform.matrix)}bands.computeBoundingSphere();world.add(bands);

 // The top of the stairs: a walled landing with a lit doorway, so the descent starts somewhere.
 const entry=new THREE.MeshStandardMaterial({map:masonry.flagstone.map,bumpMap:masonry.flagstone.bumpMap,bumpScale:2,roughness:.82,metalness:0,envMapIntensity:.35}),deck=1.3,back=start-deck,wallAngle=back+.03,wallH=3.45;
 const onDeck=(a,r,y)=>new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r);
 const deckTop=add(wedge(deck,.3,outer+.27,48),entry,world);
 const deckSlab=add(wedge(deck+1.08,.3,outer+.24,72),stone,world,new THREE.Vector3(0,-.25,0));deckSlab.scale.y=3;
 deckTop.rotation.y=back;deckSlab.rotation.y=back-1.08;
 add(columnUv(new THREE.CylinderGeometry(.36,.36,wallH,48,1,true),wallH),columnStone,world,new THREE.Vector3(0,.65+wallH/2,0));
 add(new THREE.CylinderGeometry(.385,.385,.07,48),brass,world,new THREE.Vector3(0,.65+wallH-.1,0));
 add(new THREE.CylinderGeometry(.47,.47,.07,48),edge,world,new THREE.Vector3(0,.65+wallH,0));add(new THREE.ConeGeometry(.47,.17,48),columnStone,world,new THREE.Vector3(0,.65+wallH+.12,0));add(new THREE.SphereGeometry(.05,18,14),brass,world,new THREE.Vector3(0,.65+wallH+.22,0));
 const entrance=new THREE.Group();entrance.rotation.y=wallAngle+Math.PI/2;world.add(entrance);
 const gate=window.createMoroccanGate({THREE,Round,parent:entrance,wallLeft:-outer-.27,wallRight:-.2,wallHeight:wallH,masonry,anisotropy,batch});
 const deckRail=(r,y,radius,material)=>{const line=[];for(let i=0;i<=32;i++)line.push(onDeck(start-i/32*deck,r,y));add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(line),48,radius,7,false),material,world)};
 deckRail(outer-.06,1.0,.035,metal);deckRail(innerRadius,.85,.024,copper);
 const deckPosts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.018,.018,1.02,7),metal,6);
 for(let i=0;i<6;i++){stepTransform.position.copy(onDeck(start-(i+.5)/6*deck,outer-.06,.5));stepTransform.updateMatrix();deckPosts.setMatrixAt(i,stepTransform.matrix)}deckPosts.computeBoundingSphere();world.add(deckPosts);
 const innerDeckPosts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.014,.014,.87,7),copper,3);
 for(let i=0;i<3;i++){stepTransform.position.copy(onDeck(start-(i+.5)/3*deck,innerRadius,.53));stepTransform.updateMatrix();innerDeckPosts.setMatrixAt(i,stepTransform.matrix)}innerDeckPosts.computeBoundingSphere();world.add(innerDeckPosts);
 // turned newel posts where the rails finish, each on a stone foot and capped in brass
 for(const [r,h] of [[outer-.06,1.02],[innerRadius,.86]]){const turned=[[.085,0],[.085,.06],[.06,.09],[.052,.16],[.04,.34],[.038,h-.2],[.05,h-.17],[.04,h-.13],[.056,h-.09],[.056,h-.05],[0,h-.05]].map(([x,y])=>new THREE.Vector2(x,y));add(new THREE.LatheGeometry(turned,24),edge,world,onDeck(start,r,.1));add(new THREE.SphereGeometry(.05,20,14),brass,world,onDeck(start,r,h+.08))}
 const screenSources={kungfooled:'img/kf-title.webp',lastbite:'img/code/lb-list.webp',tutortime:'img/code/tt-match.webp'};
 const projects=[{key:'lastbite',q:.2,title:'LastBite',ratio:1.6},{key:'tutortime',q:.5,title:'TutorTime',ratio:620/290},{key:'kungfooled',q:.8,title:'Kung Fooled',ratio:16/9}];
 const loader=new THREE.TextureLoader(),reveals=[];
 for(const project of projects){
  const angle=start+project.q*total;
  const landing=add(wedge(.62,.33,4.7,28),edge,world,new THREE.Vector3(0,-project.q*drop-.1,0));landing.rotation.y=angle-.31;reveals.push({object:landing,flat:true,at:project.q*.86-.04});
  // Each project stands on its own set: a real screen on a modelled desk or cabinet, bracketed off the landing.
  const set=new THREE.Group();set.position.copy(at(project.q,3.9,-.1));set.rotation.y=angle;world.add(set);reveals.push({object:set,at:project.q*.86});project.set=set;
 }
 const screenTexture=src=>{const t=loader.load(src);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t};
 // If a set cannot load, the project still gets its plain screen.
 function plainScreen(project){const screen=new THREE.Group();screen.position.y=1.65;project.set.add(screen);add(new Round(4.1,2.62,.14,3,.06),metal,screen);const t=screenTexture(screenSources[project.key]);add(new THREE.PlaneGeometry(3.91,3.91/project.ratio),new THREE.MeshBasicMaterial({map:t,color:0xbdb8ae,toneMapped:false}),screen,new THREE.Vector3(0,0,.08));for(const x of [-1.6,1.6])add(new THREE.CylinderGeometry(.027,.027,.35,8),metal,screen,new THREE.Vector3(x,-1.46,0))}
 (async()=>{
  const [{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import('three/addons/loaders/GLTFLoader.js'),import('three/addons/libs/meshopt_decoder.module.js')]);
  const gltf=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  await Promise.all(projects.map(async project=>{
   try{const model=(await gltf.loadAsync(`assets/models/code/set-${project.key}.glb`)).scene;
    model.traverse(o=>{if(!o.isMesh)return;if(o.name.startsWith('mover_screen')){const t=screenTexture(screenSources[project.key]);t.flipY=false;o.material=new THREE.MeshBasicMaterial({map:t,color:0xf2efe8,toneMapped:false})}else{o.castShadow=o.receiveShadow=true;o.material.envMapIntensity=.7}});
    project.set.add(model)}catch(e){console.warn('Project set unavailable',project.key,e);plainScreen(project)}
   key.shadow.needsUpdate=true}));
  try{const model=(await gltf.loadAsync('assets/models/code/drone.glb')).scene,props=[];model.traverse(o=>{if(/^mover_prop\d$/.test(o.name))props.push(o);if(o.isMesh){o.castShadow=true;o.material.envMapIntensity=.9}});
   const box=new THREE.Box3().setFromObject(model);model.position.sub(box.getCenter(new THREE.Vector3()));const inner=new THREE.Group();inner.add(model);inner.scale.setScalar(14);
   drone.clear();drone.rotation.x=0;drone.add(inner);drone.userData.tick=(t,h)=>props.forEach((p,i)=>p.rotation.y=reduced?i:t*(2+h*12)*(i%2?1:-1))}catch(e){console.warn('Detailed drone unavailable, keeping the simple one',e)}
 })();
 world.traverse(o=>{if(!o.isMesh||o.material.isMeshBasicMaterial)return;o.castShadow=o.receiveShadow=true});
 const drone=makeDrone();drone.scale.setScalar(.32);world.add(drone);
 const ground=add(wedge(Math.PI*2-.002,.3,5.6,96),entry,world,new THREE.Vector3(0,-drop-.2,0));reveals.push({object:ground,flat:true,at:.72});
 const groundFoot=new THREE.Group();groundFoot.position.set(0,-drop-.09,0);world.add(groundFoot);reveals.push({object:groundFoot,flat:true,at:.72});
 add(new THREE.CylinderGeometry(.5,.66,.22,48),columnStone,groundFoot);add(new THREE.CylinderGeometry(.45,.45,.05,48),brass,groundFoot,new THREE.Vector3(0,.13,0));
 const pad=add(new THREE.CylinderGeometry(.8,.8,.08,48),metal,world,at(.995,4.1,.1));
 const padRing=add(new THREE.TorusGeometry(.6,.025,6,64),accent,pad);padRing.rotation.x=Math.PI/2;padRing.position.y=.05;reveals.push({object:pad,at:.82});
 // The closed door. Scrolling opens it; once open, the staircase slides out of the hall through the doorway as one rigid
 // ribbon, crosses the landing and corkscrews down the column, so every tread reaches its place in the same instant.
 // It plays on a clock so it never holds the page, and runs backwards when the door closes again.
 const smooth=t=>t*t*(3-2*t),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,span=total/steps/2,treadRadius=1.89,treadMiddle=new THREE.Vector3(Math.sin(span)*treadRadius,.06,Math.cos(span)*treadRadius),restQ=-.05;
 world.updateMatrixWorld(true);
 const doorMouth=entrance.localToWorld(new THREE.Vector3(-2.2,.42,.12)),droneDoor=entrance.localToWorld(new THREE.Vector3(-2.2,1.2,.3)),gateFocus=entrance.localToWorld(new THREE.Vector3(-1.75,1.5,.9));
 const up=new THREE.Vector3(0,1,0),turn=new THREE.Quaternion(),along=new THREE.Vector3(),middle=new THREE.Vector3(),seat=new THREE.Vector3(),size=new THREE.Vector3(),pose=new THREE.Matrix4();
 const outerCount=outerRail.geometry.index.count,innerCount=innerRail.geometry.index.count,coreLength=drop+1;
 const inHall=wallAngle-.4,lead=start-inHall,gap=total/steps,headEnd=lead+gap*(steps-1);
 function pour(b){
  const head=ease(b)*headEnd;
  for(const t of treads){
   const d=head-gap*(steps-1-t.i);
   if(d<=0||b<=0){size.setScalar(.0001);pose.compose(doorMouth,turn.identity(),size);t.mesh.setMatrixAt(t.slot,pose);continue}
   const angle=inHall+d,f=Math.min(1,d/lead),past=Math.max(0,d-lead),scale=f<.85?.33+.47*smooth(f/.85):.8+.2*smooth((f-.85)/.15),path=2.2+(treadRadius-2.2)*f;
   along.set(Math.sin(angle+span)*path,-past/total*drop+.06+.36*(1-f*f),Math.cos(angle+span)*path);turn.setFromAxisAngle(up,angle);
   seat.copy(treadMiddle).multiplyScalar(scale).applyQuaternion(turn);size.setScalar(scale);pose.compose(middle.copy(along).sub(seat),turn,size);t.mesh.setMatrixAt(t.slot,pose)}
  ordinary.instanceMatrix.needsUpdate=marked.instanceMatrix.needsUpdate=true;
  const run=clamp((head-lead)/(headEnd-lead));
  outerRail.geometry.setDrawRange(0,Math.floor(outerCount*run/6)*6);innerRail.geometry.setDrawRange(0,Math.floor(innerCount*run/6)*6);posts.count=innerPosts.count=Math.ceil(run*31);bands.count=Math.ceil(run*bandCount);
  core.scale.y=Math.max(run,.001);core.position.y=.65-coreLength*core.scale.y/2;
  for(const part of reveals){const k=smooth(clamp((run-part.at)/.14));part.object.visible=k>0;part.flat?part.object.scale.set(Math.max(k,.001),1,Math.max(k,.001)):part.object.scale.setScalar(Math.max(k,.001))}
 }
 const slot={el,scene,camera,models:[],group:world,visible:false,progress:0,q:-.05};
 const framing=journey.querySelector('.journey-scene');let frame=null,doorOpen=0,doorShown=-1,burst=0,burstShown=-1,pouring=false;const caption=journey.querySelector('[data-flight-status]');
 const panels=[...journey.querySelectorAll('.journey-project')],intro=journey.querySelector('.journey-heading'),stops=[...journey.querySelectorAll('[data-journey-stop]')];
 const markers=[document.getElementById('b-lastbite'),document.getElementById('b-tutortime'),document.getElementById('b-kungfooled')];
 let live=false,lastActive=-2,lastProgress=-1;
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 function measure(){
  lastProgress=-1;
  live=!reduced&&innerHeight>=620;
  document.documentElement.classList.toggle('spiral-ready',live);
  const distance=Math.max(1,journey.offsetHeight-innerHeight);
  markers.forEach((m,i)=>{if(!m)return;if(live)journey.insertBefore(m,journey.firstChild);else panels[i].before(m);m.style.top=live?(distance*[.17,.44,.71][i])+'px':''});
  if(!live){intro.inert=false;journey.classList.remove('departed','arrived');lastActive=-2;}
  panels.forEach(p=>{if(!live){p.inert=false;p.removeAttribute('aria-hidden');p.classList.remove('is-current')}});
 }
 function mapped(p){const keys=[[0,-.05],[.075,-.05],[.16,.2],[.24,.2],[.38,.5],[.51,.5],[.65,.8],[.78,.8],[1,1]];for(let i=1;i<keys.length;i++)if(p<=keys[i][0]){let f=(p-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);f=f*f*(3-2*f);return keys[i-1][1]+(keys[i][1]-keys[i-1][1])*f}return 1}
 function states(p){
  if(Math.abs(p-lastProgress)<.0001)return;lastProgress=p;
  journey.classList.toggle('departed',p>.08);journey.classList.toggle('arrived',p>.93);
  const active=p<.08||p>.93?-1:p<.31?0:p<.58?1:2;
  if(active!==lastActive){lastActive=active;panels.forEach((panel,i)=>{panel.classList.toggle('is-current',i===active);panel.inert=i!==active;panel.setAttribute('aria-hidden',String(i!==active))});stops.forEach((a,i)=>{if(i===active&&active>=0)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});intro.inert=p>.08;const label=journey.querySelector('[data-flight-status]');if(label)label.textContent=active<0?(p>.93?'The code behind the builds':'Three projects. One descent.'):projects[active].title;}
  if(caption&&p<=.08){const text=p<.03?'Scroll to open the door':'Three projects. One descent.';if(caption.textContent!==text)caption.textContent=text}
  const spine=journey.querySelector('.journey-spine');if(spine)spine.style.setProperty('--flight-progress',String(p*(spine.clientHeight-20)));
 }
 // The doorway is a real button laid over the door, so hover, click and focus all match the object you see.
 const doorHit=journey.querySelector('.journey-door'),openButton=journey.querySelector('.journey-open');let hoverDoor=false,hitAt='';
 const corner=new THREE.Vector3();
 function placeDoorHit(){if(!doorHit)return;const d=gate.doorway,r=slot.rect||el.getBoundingClientRect(),pts=[[d.cx-d.half,d.bottom],[d.cx+d.half,d.bottom],[d.cx-d.half,d.top],[d.cx+d.half,d.top]].map(([x,y])=>{corner.set(x,y,0);entrance.localToWorld(corner);corner.project(camera);return[r.left+(corner.x+1)/2*r.width,r.top+(1-corner.y)/2*r.height]}),xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]),box=sticky.getBoundingClientRect(),l=Math.min(...xs)-box.left,t=Math.min(...ys)-box.top,w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys),key=[l,t,w,h].map(Math.round).join();if(key!==hitAt){hitAt=key;doorHit.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px`}}
 const openDoor=()=>{const y=journey.getBoundingClientRect().top+scrollY+Math.max(1,journey.offsetHeight-innerHeight)*.17;window.lenis?window.lenis.scrollTo(y,{duration:2.8}):scrollTo({top:y,behavior:'smooth'})};
 const sticky=journey.querySelector('.journey-sticky');
 if(doorHit){doorHit.addEventListener('pointerenter',()=>hoverDoor=true);doorHit.addEventListener('pointerleave',()=>hoverDoor=false);doorHit.addEventListener('click',openDoor)}
 if(openButton){openButton.addEventListener('click',openDoor);openButton.addEventListener('pointerenter',()=>hoverDoor=true);openButton.addEventListener('pointerleave',()=>hoverDoor=false);openButton.addEventListener('focus',()=>hoverDoor=true);openButton.addEventListener('blur',()=>hoverDoor=false)}
 slot.customUpdate=(dt,t)=>{
  if(!live)return;
  const rect=journey.getBoundingClientRect(),distance=Math.max(1,journey.offsetHeight-innerHeight),p=clamp(-rect.top/distance),stage=slot.rect||el.getBoundingClientRect();slot.progress=p;
  const door=smooth(clamp((p-.012)/.046));if(door>=.95&&doorOpen>.82)pouring=true;else if(door<.7)pouring=false;
  burst=clamp(burst+(pouring?dt/1.7:-dt/.8));const out=ease(burst);
  // going back up, the doors stay open until the last tread is inside, and only then close
  const ajar=hoverDoor&&!journey.classList.contains('departed')?.2:0,doorWanted=burst>0?1:Math.max(door,ajar);doorOpen=Math.abs(doorWanted-doorOpen)<.002?doorWanted:damp(doorOpen,doorWanted,5.5,dt);
  // the camera waits for the stairs to come out, then scrolling drives it as normal
  const old=slot.q;slot.q=damp(slot.q,restQ+(mapped(p)-restQ)*out,9,dt);const q=slot.q,angle=start+q*total;
  // The scene fills the viewport, so nothing is cut at a box edge; .journey-scene only says where the stairs sit in it.
  const box=framing.getBoundingClientRect(),goal={x:box.left+box.width/2-stage.left-stage.width/2,y:box.top+box.height/2-stage.top-stage.height/2,h:Math.max(1,box.height),w:box.width};
  if(!frame)frame={...goal};else for(const k in goal)frame[k]=damp(frame[k],goal[k],7,dt);
  const mobile=innerWidth<=650,compact=innerWidth>650&&innerWidth<=1100,aspect=Math.max(.45,frame.w/frame.h),r=mobile?12.0:compact?Math.max(11.8,4.1+7*(1.1/aspect)):10.2,baseFov=mobile?48:43;
  camera.fov=2*Math.atan(Math.tan(baseFov*Math.PI/360)*stage.height/frame.h)*180/Math.PI;camera.setViewOffset(stage.width,stage.height,-frame.x,-frame.y,stage.width,stage.height);
  const near=mobile?10.8:compact?9.9:8.9,shut=1-out;
  camera.position.copy(at(q,r+(near-r)*shut,4.6-1.9*shut));camera.lookAt(at(q+.025,1.8,.8).lerp(gateFocus,shut));
  if(doorOpen!==doorShown||burst!==burstShown){if(burst!==burstShown)pour(burst);doorShown=doorOpen;burstShown=burst;gate.swing(doorOpen,Math.sin(Math.PI*clamp(burst/.7)));key.shadow.needsUpdate=true}
  gate.tick(dt);placeDoorHit();
  const dq=clamp((q-old)/Math.max(dt,.001),-1,1);
  const droneQ=Math.min(.995,q+.055),land=clamp((p-.91)/.09),position=at(droneQ,5.1*(1-land)+4.1*land,4.55*(1-land)+.42*land);
  position.y+=Math.sin(t*2)*.045*(1-land);const flown=ease(clamp(burst/.6));drone.visible=burst>0;drone.position.lerpVectors(droneDoor,position,flown);drone.scale.setScalar(.32*Math.max(flown,.02));drone.rotation.set(.16+Math.abs(dq)*.12,start+droneQ*total+Math.PI*.55,-dq*.35);drone.userData.tick?.(t,1-land);
  states(p);
 };
 addEventListener('resize',measure);new ResizeObserver(measure).observe(journey);measure();if(live)states(0);
 if(live){requestAnimationFrame(()=>{const i=['#b-lastbite','#b-tutortime','#b-kungfooled'].indexOf(location.hash);if(i>=0)markers[i].scrollIntoView({behavior:'instant'})})}
 return slot;
};
