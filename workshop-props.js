/* Everything around the car: each prop is modelled at its real size, in metres, and stands on y=0. */
Workshop.props=function(THREE,kit,carParts){
 const {loft,skin,bar,blade,tube,mesh,box,add,worn,canvasTexture,rng,lerp,smooth}=kit;
 const std=(color,roughness=.5,metalness=0,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness,metalness,...extra});
 const chrome=std('#d8dadc',.13,1),nickel=std('#b9b6ae',.22,1),gold=std('#c9a257',.26,1),blackPlastic=std('#0f1012',.42),rubberFoot=std('#111',.85);
 const shadow=root=>{root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return root};

 /* ---------- guitar: a single-cut, sunburst, on its own stand ---------- */
 function guitar(){
  const root=new THREE.Group(),inst=new THREE.Group(),strs=new THREE.Group();root.add(inst);inst.userData.moving=true;strs.userData.moving=true;
  const S=.165,sh=new THREE.Shape();
  const P=(x,y)=>[x*S,y*S];
  sh.moveTo(...P(0,1.08));
  sh.bezierCurveTo(...P(-.19,1.16),...P(-.49,1.17),...P(-.55,.87));
  sh.bezierCurveTo(...P(-.62,.52),...P(-.32,.39),...P(-.59,.09));
  sh.bezierCurveTo(...P(-1,-.29),...P(-.87,-1.08),...P(-.08,-1.18));
  sh.bezierCurveTo(...P(.79,-1.28),...P(1.03,-.48),...P(.65,-.02));
  sh.bezierCurveTo(...P(.42,.23),...P(.27,.39),...P(.43,.66));
  sh.bezierCurveTo(...P(.58,.91),...P(.35,1.03),...P(.16,.84));
  sh.lineTo(...P(.14,1.08));sh.closePath();
  const burst=canvasTexture(2048,2048,(g,w,h)=>{
   g.save();g.scale(w/1024,h/1024);w=1024;h=1024;
   const R=rng(61);const gr=g.createRadialGradient(505,560,50,512,520,500);
   gr.addColorStop(0,'#e0a84c');gr.addColorStop(.42,'#c9812f');gr.addColorStop(.66,'#8a3c1a');gr.addColorStop(.86,'#3a1610');gr.addColorStop(1,'#180a08');g.fillStyle=gr;g.fillRect(0,0,w,h);
   // flame figure across the maple
   g.globalCompositeOperation='overlay';
   for(let i=0;i<120;i++){
    const y=i*9-30,a=6+R()*14;g.strokeStyle=`rgba(${i%2?'255,214,150':'40,14,4'},${.08+R()*.13})`;g.lineWidth=3+R()*10;g.beginPath();
    for(let x=0;x<=w;x+=34){const yy=y+Math.sin(x*.012+i*.7)*a+Math.sin(x*.041+i)*a*.45;x?g.lineTo(x,yy):g.moveTo(x,yy)}
    g.stroke();
   }
   g.globalCompositeOperation='source-over';g.restore();
  });
  const bodyGeo=new THREE.ExtrudeGeometry(sh,{depth:.024,bevelEnabled:true,bevelSegments:7,bevelSize:.014,bevelThickness:.014,curveSegments:60});
  {const uv=bodyGeo.attributes.uv,p=bodyGeo.attributes.position;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+.19)/.38,(p.getY(i)+.21)/.42)}
  const lacquer=new THREE.MeshPhysicalMaterial({map:burst,roughness:.2,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.1});
  add(inst,mesh(bodyGeo,lacquer,[0,.205,0]));
  const backGeo=new THREE.ExtrudeGeometry(sh,{depth:.024,bevelEnabled:false,curveSegments:60});
  add(inst,mesh(backGeo,std('#2b140c',.3,0,{clearcoat:.8}),[0,.205,-.026]));
  const bindGeo=new THREE.ExtrudeGeometry(sh,{depth:.003,bevelEnabled:true,bevelSegments:1,bevelSize:.0165,bevelThickness:.001,curveSegments:60});
  add(inst,mesh(bindGeo,std('#e3d4b0',.4),[0,.205,.0118]));
  const cream=std('#e4d6b4',.36),mahog=std('#5b2e18',.28,0,{clearcoat:.7}),rose=std('#20120c',.5);
  const Y0=.205+.86*S; // the neck joins near the top of the body
  add(inst,box(.046,.47,.022,mahog,[0,Y0+.2,.012],.009));
  add(inst,box(.044,.45,.0065,rose,[0,Y0+.2,.0263],.002));
  for(let i=0;i<22;i++){
   const y=Y0+.42-.42*(1-Math.pow(.945,i+1))*1.4;
   if(y<Y0-.02)continue;
   add(inst,box(.0452,.0016,.0024,nickel,[0,y,.0303],.0006));
   if([2,4,6,8,11,14,16,18,20].includes(i))add(inst,box(.026,.008,.0012,std('#efe6cf',.25),[0,y-.009,.0298],.0004));
  }
  const nut=box(.046,.004,.005,cream,[0,Y0+.426,.03],.001);add(inst,nut);
  // headstock
  const hs=new THREE.Shape();hs.moveTo(-.024,0);hs.bezierCurveTo(-.05,.03,-.062,.1,-.054,.165);hs.lineTo(-.02,.18);hs.lineTo(0,.172);hs.lineTo(.02,.18);hs.lineTo(.054,.165);hs.bezierCurveTo(.062,.1,.05,.03,.024,0);hs.closePath();
  const headGeo=new THREE.ExtrudeGeometry(hs,{depth:.012,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,curveSegments:24});
  const head=mesh(headGeo,std('#0d0a0a',.24,0,{clearcoat:1}),[0,Y0+.43,.01],[-.2,0,0]);add(inst,head);
  const logo=canvasTexture(256,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#e7dcc0';g.font='italic 700 62px Georgia,serif';g.textAlign='center';g.fillText('Gibson',w/2,150);g.beginPath();g.moveTo(w/2,190);g.bezierCurveTo(w/2+40,240,w/2+30,290,w/2,320);g.bezierCurveTo(w/2-30,290,w/2-40,240,w/2,190);g.fill()});
  const face=mesh(new THREE.PlaneGeometry(.09,.18),new THREE.MeshStandardMaterial({map:logo,transparent:true,roughness:.4}),[0,.09,.0145]);head.add(face);
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const y=.05+i*.042;head.add(bar([side*.03,y,.0],[side*.074,y,.0],.0033,chrome,10));
   const tip=box(.016,.012,.006,cream,[side*.082,y,.0],.003);head.add(tip);
   head.add(mesh(new THREE.CylinderGeometry(.0034,.0034,.018,12),chrome,[side*.03,y,.022],[Math.PI/2,0,0]));
  }
  // pickups, bridge, tailpiece and controls
  const PY=.205;
  for(const y of [.075,.022*-1+.145]){}
  for(const [y] of [[.125],[.04]]){
   add(inst,box(.09,.044,.006,cream,[0,PY+y,.042],.008));
   add(inst,box(.072,.034,.012,nickel,[0,PY+y,.046],.004));
   for(let i=0;i<6;i++)add(inst,mesh(new THREE.CylinderGeometry(.002,.002,.002,8),chrome,[-.027+i*.0108,PY+y,.0526],[Math.PI/2,0,0]));
  }
  add(inst,box(.082,.016,.012,nickel,[0,PY-.018,.044],.004));
  add(inst,box(.086,.016,.012,nickel,[0,PY-.06,.044],.005));
  for(const [x,y] of [[.075,-.03],[.115,-.06],[.075,-.085],[.118,-.1]]){
   add(inst,mesh(new THREE.CylinderGeometry(.0105,.0132,.018,24),gold,[x,PY+y,.046],[Math.PI/2,0,0]));
   add(inst,mesh(new THREE.TorusGeometry(.008,.0008,6,20),nickel,[x,PY+y,.056]));
  }
  // Selector switch, washer and mounting screws on the cream pickguard.
  add(inst,mesh(new THREE.CylinderGeometry(.009,.009,.003,24),cream,[-.095,PY+.09,.043],[Math.PI/2,0,0]));
  add(inst,bar([-.095,PY+.09,.045],[-.087,PY+.103,.06],.0022,nickel,8));
  for(const [x,y] of [[.038,.174],[.056,.095]])add(inst,mesh(new THREE.SphereGeometry(.002,10,8),chrome,[x,PY+y,.053]));
  const guard=new THREE.Shape();guard.moveTo(.024,.18);guard.lineTo(.078,.18);guard.bezierCurveTo(.1,.14,.085,.1,.052,.085);guard.lineTo(.03,.09);guard.closePath();
  add(inst,mesh(new THREE.ExtrudeGeometry(guard,{depth:.002,bevelEnabled:false,curveSegments:16}),cream,[0,PY,.05]));
  // strings
  const sMat=std('#d5d3cc',.22,1);
  add(inst,strs);for(let i=0;i<6;i++){const a=-.0165+i*.0066,b=-.02+i*.008;add(strs,bar([b,PY-.06,.0515],[a,Y0+.428,.034],.0005+.00016*(5-i),sMat,5))}
  // A pick passes across the strings when the guitar is selected.
  const pickShape=new THREE.Shape();pickShape.moveTo(0,.018);pickShape.bezierCurveTo(.018,.02,.023,.009,.017,-.003);pickShape.quadraticCurveTo(.008,-.017,0,-.023);pickShape.quadraticCurveTo(-.008,-.017,-.017,-.003);pickShape.bezierCurveTo(-.023,.009,-.018,.02,0,.018);
  const pick=mesh(new THREE.ExtrudeGeometry(pickShape,{depth:.002,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:16}),std('#ad5a40',.32,0,{clearcoat:.65}),[-.08,PY+.076,.063]);pick.userData.moving=true;pick.visible=false;add(inst,pick);
  inst.position.set(0,.115,.035);inst.rotation.x=-.145;
  // stand
  const steel=std('#101114',.42,.5),foam=std('#191919',.9);
  add(root,bar([0,.09,-.1],[0,.64,-.2],.011,steel));
  add(root,bar([0,.3,-.135],[0,.3,.05],.009,steel));
  for(const s of [-1,1]){
   add(root,bar([0,.1,-.1],[s*.21,.012,.11],.011,steel));
   add(root,bar([0,.1,-.1],[s*.04,.012,-.33],.011,steel));
   add(root,bar([0,.098,-.04],[s*.12,.098,.04],.011,steel));
   add(root,bar([s*.12,.098,.04],[s*.13,.125,.09],.011,foam));
   add(root,bar([s*.022,.64,-.2],[s*.03,.72,-.19],.008,foam));
   add(root,mesh(new THREE.SphereGeometry(.018,16,12),rubberFoot,[s*.21,.012,.11]));
  }
  // leans forward when you reach for it; a strum rocks it on the stand and blurs the strings
  root.userData.playFor=2.4;
  root.userData.play=(h,p,dt,t)=>{
   const ring=p<2.4?Math.exp(-Math.max(0,p-.7)*1.7):0;
   inst.rotation.x=-.145+h*.06;inst.rotation.z=Math.sin(p*7)*.02*ring;
   strs.scale.x=1+Math.sin(t*92)*(.02*h+.09*ring);strs.position.z=Math.sin(t*71)*.0006*(h+3*ring);
   pick.visible=p>=.45&&p<1.6;const stroke=Math.max(0,Math.min(1,(p-.6)/.7));pick.position.x=-.08+stroke*.16;pick.rotation.z=-.3+stroke*.45;
  };
  return shadow(root);
 }

 /* ---------- open sketchbook, real Project Strata sketches on the pages ---------- */
 function sketchbook(pageMap){
  const root=new THREE.Group(),W=.46,H=.62,thick=.03;
  const leather=canvasTexture(512,512,(g,w,h)=>{const R=rng(91);g.fillStyle='#402018';g.fillRect(0,0,w,h);for(let i=0;i<9000;i++){g.fillStyle=`rgba(${R()>.5?'110,70,50':'12,6,4'},${.1*R()})`;g.fillRect(R()*w,R()*h,1+R()*3,1+R()*3)}},{repeat:true});
  add(root,box(W*2+.05,.011,H+.03,new THREE.MeshPhysicalMaterial({map:leather,bumpMap:leather,bumpScale:.4,roughness:.56}),[0,.006,0],.005));
  // the pages rise from the gutter and fall away towards the edge
  const prof=x=>{const d=Math.abs(x)/W;return .012+thick*(.3+.7*Math.sin(Math.min(1,d*5.5)*Math.PI/2))*(1-.42*d*d)};
  const uvOffset=s=>s<0?0:.5;
  const paper=new THREE.MeshStandardMaterial({map:pageMap,roughness:.92,envMapIntensity:.45});
  const edges=canvasTexture(16,128,(g,w,h)=>{for(let y=0;y<h;y++){const v=196+(y*37%3)*18;g.fillStyle=`rgb(${v},${v-8},${v-22})`;g.fillRect(0,y,w,1)}},{repeat:true});
  const edgeMat=new THREE.MeshStandardMaterial({map:edges,roughness:.95});
  const top=new THREE.PlaneGeometry(W*2,H,120,4);top.rotateX(-Math.PI/2);{const p=top.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,prof(p.getX(i)));top.computeVertexNormals()}
  add(root,mesh(top,paper));
  for(const s of [-1,1]){
   const steps=30,rings=[];
   for(const z of [-H/2+.0001,H/2-.0001]){const r=[];for(let i=0;i<=steps;i++){const x=s*W*(i/steps);r.push([x,prof(x)-.0008,z])}r.push([s*W,.012,z],[0,.012,z]);rings.push(s>0?r:r.slice().reverse())}
   const m=mesh(skin(rings,{caps:true}),edgeMat);add(root,m);
  }
  // one loose leaf: it lifts under the pointer and turns over on a click
  const leaf=new THREE.Group();leaf.position.set(0,.048,0);leaf.userData.moving=true;leaf.visible=false;add(root,leaf);
  const sheetGeo=new THREE.PlaneGeometry(W*.98,H*.985,28,1);sheetGeo.rotateX(-Math.PI/2);sheetGeo.translate(W*.49,0,0);
  {const q=sheetGeo.attributes.position;for(let i=0;i<q.count;i++){const x=q.getX(i)/W;q.setY(i,Math.sin(x*Math.PI)*.012)}sheetGeo.computeVertexNormals()}
  const leafMap=pageMap?pageMap.clone():null;if(leafMap){leafMap.repeat.set(.49,1);leafMap.offset.set(.505,0);leafMap.needsUpdate=true}
  add(leaf,mesh(sheetGeo,new THREE.MeshStandardMaterial({map:leafMap,roughness:.92,envMapIntensity:.45})));
  const backGeo=sheetGeo.clone();backGeo.scale(1,-1,1);backGeo.translate(0,-.0006,0);backGeo.index.array.reverse();backGeo.computeVertexNormals();
  add(leaf,mesh(backGeo,new THREE.MeshStandardMaterial({color:'#e6dfca',roughness:.95,envMapIntensity:.45})));
  root.userData.parts={leaf,W,H};
  root.userData.playFor=1.5;
  root.userData.play=(h,p)=>{
   const u=Math.min(1,p/1.1),turn=u*u*(3-2*u)*Math.PI*(p<1.5?1:0);
   const a=Math.max(h*.5,turn);leaf.visible=a>.01;leaf.rotation.z=a;
  };
  // ribbon marker
  add(root,tube([[.0,.05,H/2-.05],[.008,.044,H/2],[.03,.012,H/2+.07],[.02,.004,H/2+.15],[.05,.003,H/2+.2]],.0045,std('#5c1c26',.7),{segments:36,sides:6}));
  return shadow(root);
 }
 function pencil(){
  const root=new THREE.Group(),roll=new THREE.Group(),body=std('#6d2530',.34,0,{clearcoat:.6});
  roll.position.y=.006;roll.userData.moving=true;root.add(roll);
  const shaft=mesh(new THREE.CylinderGeometry(.0058,.0058,.3,6),body,[0,0,0],[0,0,Math.PI/2]);add(roll,shaft);
  add(roll,mesh(new THREE.ConeGeometry(.0058,.022,6),std('#c9a877',.6),[-.161,0,0],[0,0,Math.PI/2]));
  add(roll,mesh(new THREE.ConeGeometry(.0026,.009,8),std('#1c1c20',.4),[-.1695,0,0],[0,0,Math.PI/2]));
  add(roll,mesh(new THREE.CylinderGeometry(.0062,.0062,.014,12),gold,[.156,0,0],[0,0,Math.PI/2]));
  add(roll,mesh(new THREE.CylinderGeometry(.0056,.0056,.013,12),std('#c99',.8),[.169,0,0],[0,0,Math.PI/2]));
  // rolls away from a click, and back on the next one
  let far=0,angle=0;root.userData.click=()=>{far=far?0:30};root.userData.playFor=2.4;
  root.userData.play=(h,p,dt)=>{const goal=far+h*3;angle+=(goal-angle)*(1-Math.exp(-3.2*dt));roll.rotation.x=angle;roll.position.z=angle*.0058;return Math.abs(goal-angle)>.01};
  return shadow(root);
 }
 function pick(){
  const sh=new THREE.Shape();sh.moveTo(0,.016);sh.bezierCurveTo(.016,.017,.022,.01,.018,0);sh.bezierCurveTo(.012,-.012,.004,-.02,0,-.024);sh.bezierCurveTo(-.004,-.02,-.012,-.012,-.018,0);sh.bezierCurveTo(-.022,.01,-.016,.017,0,.016);
  const g=new THREE.ExtrudeGeometry(sh,{depth:.0007,bevelEnabled:true,bevelSize:.0005,bevelThickness:.0004,bevelSegments:2,curveSegments:24});g.rotateX(-Math.PI/2);
  const m=mesh(g,std('#1d2c47',.24,0,{clearcoat:.8}),[0,.0015,0]);m.castShadow=true;m.receiveShadow=true;const r=new THREE.Group(),flip=new THREE.Group();flip.userData.moving=true;flip.add(m);r.add(flip);
  // flicked like a coin
  r.userData.playFor=.9;r.userData.play=(h,p)=>{const u=Math.min(1,p/.9),air=4*u*(1-u);flip.position.y=air*.14+h*.012;flip.rotation.x=(p<.9?u*Math.PI*4:0);flip.rotation.z=h*.25};return r;
 }

 /* ---------- tablet on a folding stand, code on the screen ---------- */
 function tablet(){
  const root=new THREE.Group(),W=.28,H=.2,tilt=.62;
  const screen=canvasTexture(1400,1000,(g,w,h)=>{
   g.fillStyle='#0d1016';g.fillRect(0,0,w,h);g.fillStyle='#161a22';g.fillRect(0,0,w,46);g.fillRect(0,46,250,h);
   for(const [i,c] of [[0,'#ee6a5e'],[1,'#f5bd4f'],[2,'#61c554']].map((a,i)=>[i,a[1]])){g.fillStyle=c;g.beginPath();g.arc(28+i*26,23,8,0,7);g.fill()}
   g.font='500 19px "IBM Plex Mono",Menlo,monospace';
   ['tutortime/','  app.py','  scheduler.py','  matching.py','lastbite/','  pantry.ts','  donate.ts','kungfooled/','  game.js','kessler/','  model.py','  debris.py'].forEach((t,i)=>{g.fillStyle=i===2?'#e8e3d8':'#79808c';g.fillText(t,22,92+i*31)});
   const lines=[['#c586c0','def ','#dcdcaa','collision_rate','#d4d4d4','(shell, n):'],['#6a9955','    # where collisions start feeding themselves'],['#d4d4d4','    cross = ','#9cdcfe','shell','#d4d4d4','.sigma * ','#9cdcfe','shell','#d4d4d4','.v_rel'],['#c586c0','    return ','#d4d4d4','0.5 * ','#9cdcfe','n','#d4d4d4','**2 * cross / ','#9cdcfe','shell','#d4d4d4','.volume'],[''],['#c586c0','def ','#dcdcaa','step','#d4d4d4','(state, dt):'],['#c586c0','    for ','#9cdcfe','shell','#c586c0',' in ','#9cdcfe','state','#d4d4d4','.shells:'],['#d4d4d4','        hits = ','#dcdcaa','collision_rate','#d4d4d4','(shell, shell.n)'],['#d4d4d4','        shell.n += (launches - decay + ','#b5cea8','40','#d4d4d4',' * hits) * dt'],['#c586c0','    return ','#9cdcfe','state'],[''],['#c586c0','if ','#d4d4d4','critical(state):'],['#d4d4d4','    ','#dcdcaa','print','#d4d4d4','(','#ce9178','"runaway begins"','#d4d4d4',')']];
   g.font='500 24px "IBM Plex Mono",Menlo,monospace';
   lines.forEach((parts,i)=>{let x=330;g.fillStyle='#4b5361';g.fillText(String(i+1),276,102+i*44);for(let j=0;j<parts.length;j+=2){if(!parts[j+1]&&!parts[j])continue;const col=parts.length===1?'#000':parts[j],txt=parts[j+1]||'';g.fillStyle=col;g.fillText(txt,x,102+i*44);x+=g.measureText(txt).width}});
  });
  const pivot=new THREE.Group();pivot.position.set(0,.014,.07);pivot.rotation.x=-tilt;pivot.userData.moving=true;add(root,pivot);
  add(pivot,box(W,H,.0065,std('#2a2c30',.4,.8),[0,H/2,0],.012));
  add(pivot,box(W-.002,H-.002,.002,std('#050507',.25),[0,H/2,.0029],.011));
  const scr=mesh(new THREE.PlaneGeometry(W-.016,H-.016),new THREE.MeshBasicMaterial({map:screen,toneMapped:true,color:'#f2f2f2'}),[0,H/2,.0042]);add(pivot,scr);
  const smudge=canvasTexture(512,384,(g,w,h)=>{const R=rng(13);g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let i=0;i<46;i++){g.fillStyle=`rgba(90,90,90,${.04+R()*.1})`;g.beginPath();g.ellipse(R()*w,R()*h,16+R()*20,20+R()*26,R()*3,0,7);g.fill()}},{srgb:false});
  const glass=mesh(new THREE.PlaneGeometry(W-.004,H-.004),new THREE.MeshPhysicalMaterial({color:'#000',roughness:.09,roughnessMap:smudge,metalness:0,transparent:true,opacity:.22,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.5}),[0,H/2,.0048]);add(pivot,glass);
  root.userData.parts={pivot,W,H};
  // the code scrolls and the screen wakes up
  const tail=canvasTexture(1100,1100,(g,w,h)=>{
   const R=rng(419),cols=['#c586c0','#dcdcaa','#9cdcfe','#d4d4d4','#b5cea8','#6a9955'];g.fillStyle='#0d1016';g.fillRect(0,0,w,h);
   for(let y=0;y<26;y++){let x=16+(Math.floor(R()*4)*30);const n=2+Math.floor(R()*5);if(R()<.14)continue;for(let i=0;i<n;i++){const l=30+R()*120;g.fillStyle=cols[Math.floor(R()*cols.length)];g.fillRect(x,14+y*42,l,15);x+=l+14}}
  },{repeat:true});
  const scroller=mesh(new THREE.PlaneGeometry((W-.016)*.82,(H-.016)*.95),new THREE.MeshBasicMaterial({map:tail,transparent:true,opacity:0,toneMapped:true}),[(W-.016)*.09,H/2-(H-.016)*.025,.00445]);add(pivot,scroller);
  root.userData.playFor=1.4;
  root.userData.play=(h,p,dt)=>{
   const on=Math.max(h,p<1.4?1-p/1.4:0);
   scroller.material.opacity=on;tail.offset.y=(tail.offset.y+dt*(.09+on*.5)*on)%1;
   scr.material.color.setScalar(.82+.24*on);pivot.rotation.x=-tilt+h*.05;
  };
  // folio: one leaf behind the tablet, one flat on the floor
  const folio=std('#1b1d21',.7);
  const back=box(W-.02,H*.6,.003,folio,[0,H*.34,-.0052],.002);add(pivot,back);
  const leg=new THREE.Group();leg.position.set(0,.002+Math.cos(tilt)*H*.55,.07-Math.sin(tilt)*H*.55);add(root,leg);
  leg.rotation.x=.46;add(leg,box(W-.02,.003,.14,folio,[0,-.03,-.075],.001,[Math.PI/2-.5,0,0]));
  add(root,box(W-.02,.003,.16,folio,[0,.002,-.06],.001));
  return shadow(root);
 }

 /* ---------- satellite on a display stand ---------- */
 function satellite(){
  const root=new THREE.Group(),sat=new THREE.Group(),wings=[];root.add(sat);sat.userData.moving=true;
  const foil=canvasTexture(512,512,(g,w,h)=>{
   const R=rng(203);g.fillStyle='#808080';g.fillRect(0,0,w,h);
   for(let i=0;i<520;i++){const x=R()*w,y=R()*h,s=14+R()*46,v=Math.floor(70+R()*130);g.fillStyle=`rgb(${v},${v},${v})`;g.beginPath();g.moveTo(x,y);g.lineTo(x+s*(R()-.5)*2,y+s*(R()-.3));g.lineTo(x+s*(R()-.3),y+s*(R()-.5)*2);g.closePath();g.fill()}
  },{srgb:false,repeat:true});
  const silver=std('#b8b7b0',.34,1,{bumpMap:foil,bumpScale:.22,roughnessMap:foil}),goldFoil=std('#b98a3a',.3,1,{bumpMap:foil,bumpScale:.26,roughnessMap:foil}),frame=std('#3b3c40',.42,.7);
  add(sat,box(.44,.38,.36,silver,[0,0,0],.012));
  for(const y of [-.19,.19])add(sat,box(.452,.012,.372,frame,[0,y,0],.003));
  for(const x of [-.22,.22])for(const z of [-.18,.18])add(sat,box(.012,.39,.012,frame,[x,0,z],.003));
  add(sat,box(.3,.16,.008,goldFoil,[0,-.05,.183],.003));
  add(sat,box(.13,.09,.012,frame,[-.08,.095,.184],.003));
  for(let i=0;i<4;i++)add(sat,box(.022,.03,.01,goldFoil,[.05+i*.032,.1,.186],.002));
  // instrument boxes and cabling on the faces
  add(sat,box(.1,.07,.1,goldFoil,[.1,-.225,.05],.006));add(sat,box(.09,.05,.08,frame,[-.1,-.215,-.06],.006));
  add(sat,mesh(new THREE.CylinderGeometry(.05,.075,.1,28),goldFoil,[0,-.25,-.06]));
  add(sat,tube([[-.2,.19,.18],[-.26,.15,.21],[-.25,.03,.2],[-.222,-.02,.17]],.004,goldFoil,{segments:24,sides:6}));
  add(sat,tube([[.21,-.02,.19],[.26,-.1,.2],[.22,-.17,.19]],.004,std('#7d1f1f',.5),{segments:24,sides:6}));
  // dish on a mast
  add(sat,bar([.04,.19,0],[.08,.3,-.03],.01,frame));
  const dishG=new THREE.LatheGeometry(Array.from({length:18},(_, i)=>{const r=.14*i/17;return new THREE.Vector2(r,r*r*2.6)}),48);
  const dish=mesh(dishG,std('#d8d4c8',.45,.2,{side:THREE.DoubleSide}),[.085,.31,-.03],[.5,.2,-.6]);dish.userData.moving=true;add(sat,dish);
  add(dish,bar([0,.0,0],[0,.095,0],.0035,frame));add(dish,mesh(new THREE.ConeGeometry(.016,.03,16),gold,[0,.1,0]));
  for(let i=0;i<3;i++){const a=i/3*6.28;add(dish,bar([Math.cos(a)*.12,.038,Math.sin(a)*.12],[0,.09,0],.0014,frame,6))}
  add(sat,bar([-.14,.19,.08],[-.2,.34,.12],.0035,chrome,8));
  add(sat,bar([-.1,.19,-.1],[-.1,.3,-.14],.0035,chrome,8));
  // solar arrays
  const cells=canvasTexture(1024,512,(g,w,h)=>{
   const R=rng(301);g.fillStyle='#0a1228';g.fillRect(0,0,w,h);
   const cx=16,cy=8;for(let y=0;y<cy;y++)for(let x=0;x<cx;x++){
    const v=R()*.12,cw=w/cx,ch=h/cy;g.fillStyle=`rgb(${22+v*80|0},${40+v*90|0},${98+v*120|0})`;g.fillRect(x*cw+2,y*ch+2,cw-4,ch-4);
    g.strokeStyle='rgba(190,205,230,.5)';g.lineWidth=1;for(let i=1;i<5;i++){g.beginPath();g.moveTo(x*cw+i*cw/5,y*ch+2);g.lineTo(x*cw+i*cw/5,y*ch+ch-2);g.stroke()}
    g.strokeStyle='rgba(205,210,220,.9)';g.lineWidth=1.8;g.beginPath();g.moveTo(x*cw,y*ch+ch*.5);g.lineTo(x*cw+cw,y*ch+ch*.5);g.stroke();
   }
  });
  const panel=new THREE.MeshPhysicalMaterial({map:cells,metalness:.75,roughness:.28,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.3});
  for(const s of [-1,1]){
   const wing=new THREE.Group();wing.position.set(s*.22,.0,0);wing.rotation.x=.28;wing.userData.moving=true;wings.push(wing);add(sat,wing);
   add(wing,bar([0,0,0],[s*.12,0,0],.0075,frame));
   for(const k of [0,1]){
    const cx=s*(.42+k*.56);
    add(wing,box(.54,.008,.3,frame,[cx,0,0],.002));
    add(wing,mesh(new THREE.PlaneGeometry(.525,.285),panel,[cx,.0045,0],[-Math.PI/2,0,0]));
    add(wing,mesh(new THREE.PlaneGeometry(.525,.285),std('#5d5a52',.5,.8),[cx,-.0045,0],[Math.PI/2,0,0]));
   }
   add(wing,box(.02,.012,.08,chrome,[s*.14,0,0],.004));
   add(wing,box(.02,.012,.3,gold,[s*.7,0,0],.003));
  }
  sat.scale.setScalar(.78);sat.position.y=1.26;sat.rotation.set(.1,-.5,.2);
  // stand: pole, collar and a cast plinth
  add(root,bar([0,.07,0],[0,1.0,0],.013,chrome,20));
  add(root,mesh(new THREE.CylinderGeometry(.03,.042,.05,28),nickel,[0,.09,0]));
  add(root,mesh(new THREE.CylinderGeometry(.025,.025,.03,24),nickel,[0,.99,0]));
  add(root,bar([0,1.0,0],[.0,1.15,0],.01,chrome,14));
  add(root,box(.62,.055,.46,std('#2a2926',.5,.35),[0,.03,0],.012));
  const plaque=canvasTexture(512,128,(g,w,h)=>{g.fillStyle='#b99a5d';g.fillRect(0,0,w,h);g.fillStyle='#2b2415';g.font='600 42px "IBM Plex Mono",Menlo,monospace';g.textAlign='center';g.fillText('KESSLER MODEL',w/2,78)});
  add(root,mesh(new THREE.PlaneGeometry(.26,.065),std('#fff',.3,.7,{map:plaque}),[0,.031,.2311],[-.0,0,0]));
  // a beacon that only wakes when you look at it
  const beacon=mesh(new THREE.SphereGeometry(.012,12,10),new THREE.MeshBasicMaterial({color:'#401008'}),[-.2,.345,.12]);add(sat,beacon);
  // the arrays track round, the dish scans, and a click sends it through a full turn
  root.userData.parts={sat,wings,dish};
  let drift=0;root.userData.playFor=2.2;
  root.userData.play=(h,p,dt,t)=>{
   drift+=dt*h*.32;const u=Math.min(1,p/2.2),spin=p<2.2?u*u*(3-2*u)*Math.PI*2:0;
   sat.rotation.y=-.5+drift+spin;wings.forEach(w=>{w.rotation.x=.28+h*1.1});dish.rotation.y+=dt*h*1.4;
   beacon.material.color.set(h>.05&&Math.sin(t*5)>.1?'#ff5a30':'#401008');
  };
  return shadow(root);
 }

 /* ---------- trophy ---------- */
 function trophy(){
  const root=new THREE.Group(),silver=std('#d6d6d2',.13,1);
  const wood=canvasTexture(512,256,(g,w,h)=>{const R=rng(42);g.fillStyle='#4a1a1e';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){g.strokeStyle=`rgba(${R()>.5?'110,44,44':'24,8,8'},${.1+R()*.25})`;g.lineWidth=.7+R()*2;g.beginPath();const y=R()*h;g.moveTo(0,y);g.bezierCurveTo(170,y+R()*14-7,340,y+R()*14-7,w,y);g.stroke()}},{repeat:true});
  const base=new THREE.MeshPhysicalMaterial({map:wood,roughness:.28,clearcoat:.9,clearcoatRoughness:.12});
  add(root,box(.2,.04,.2,base,[0,.02,0],.006));
  add(root,box(.16,.11,.16,base,[0,.095,0],.004));
  add(root,box(.13,.022,.13,base,[0,.16,0],.004));
  const plate=canvasTexture(512,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#dfd0a4');gr.addColorStop(.5,'#b89f62');gr.addColorStop(1,'#d7c592');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#2a2110';g.textAlign='center';g.font='700 58px "League Spartan",Arial,sans-serif';g.fillText('2ND IN THE UAE',w/2,108);g.font='500 34px "IBM Plex Mono",Menlo,monospace';g.fillText('4×4 IN SCHOOLS',w/2,170)});
  add(root,mesh(new THREE.PlaneGeometry(.11,.058),std('#fff',.3,.75,{map:plate}),[0,.095,.0805]));
  const prof=[[0,.171],[.052,.171],[.056,.178],[.05,.19],[.024,.2],[.016,.222],[.0135,.28],[.016,.31],[.03,.322],[.028,.334],[.014,.342],[.018,.352],[.05,.37],[.082,.41],[.102,.47],[.11,.54],[.114,.6],[.122,.615],[.118,.622],[.106,.6],[.1,.54],[.092,.47],[.072,.41],[.04,.375],[0,.36]];
  const curve=new THREE.SplineCurve(prof.map(p=>new THREE.Vector2(...p)));
  const cup=new THREE.Group();cup.userData.moving=true;add(root,cup);
  add(cup,mesh(new THREE.LatheGeometry(curve.getPoints(90),64),silver));
  for(const s of [-1,1]){
   add(cup,tube([[s*.1,.575,0],[s*.165,.585,0],[s*.19,.525,0],[s*.155,.46,0],[s*.1,.44,0],[s*.085,.42,0]],.0075,silver,{segments:64,sides:12}));
  }
  // turns on its base under the pointer; a click gives it a proper spin
  root.userData.playFor=1.8;
  root.userData.play=(h,p,dt)=>{const kick=p<1.8?(1-p/1.8):0;cup.rotation.y+=dt*(h*1.1+kick*kick*16);const u=Math.min(1,p/.5);cup.position.y=h*.008+(p<.5?Math.sin(u*Math.PI)*.022:0)};
  return shadow(root);
 }

 /* ---------- a spare slick lying on the floor ---------- */
 function tyre(){
  const root=new THREE.Group();
  const body=new THREE.Group();body.userData.moving=true;body.position.y=.2;add(root,body);
  const t=mesh(carParts.tyreGeometry(.362,.405),carParts.rubber,[0,0,0]);add(body,t);
  add(body,mesh(new THREE.CylinderGeometry(.228,.228,.012,64),std('#070707',.9,0,{envMapIntensity:.1}),[0,-.14,0]));
  // the bore, so nobody can see through the carcass
  add(body,mesh(new THREE.CylinderGeometry(.222,.222,.32,64,1,true),std('#141414',.8,0,{side:THREE.DoubleSide,envMapIntensity:.3}),[0,0,0]));
  // settles like a dropped coin: a slow rocking circle that dies away
  root.userData.playFor=2.6;
  root.userData.play=(h,p,dt,t2)=>{
   const hop=p<.42?Math.sin(p/.42*Math.PI)*.16:0,a=h*.03+(p<2.6?.11*Math.exp(-p*1.5):0),w=t2*(7+4*(1-Math.min(1,p/2.6)));
   body.rotation.x=Math.cos(w)*a;body.rotation.z=Math.sin(w)*a;body.position.y=.2+hop+a*.36;
  };
  root.userData.parts={body};
  return shadow(root);
 }

 /* ---------- steel shelving with cases, binders and a trailing plant ---------- */
 function shelving(){
  const root=new THREE.Group(),W=3.1,D=.62,H=2.9,steel=std('#2a2c2e',.46,.75),binderRoot=new THREE.Group(),lids=[],binders=[];
  const plank=canvasTexture(1024,128,(g,w,h)=>{const R=rng(7);g.fillStyle='#6a4426';g.fillRect(0,0,w,h);for(let i=0;i<200;i++){g.strokeStyle=`rgba(${R()>.5?'150,104,62':'36,20,10'},${.08+R()*.25})`;g.lineWidth=.6+R()*2;const y=R()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(340,y+R()*10-5,680,y+R()*10-5,w,y);g.stroke()}});
  const timber=new THREE.MeshStandardMaterial({map:plank,roughness:.6});
  for(const x of [-W/2,W/2,0])for(const z of [-D/2,D/2]){
   add(root,box(.05,H,.05,steel,[x,H/2,z],.004));
  }
  const levels=[.24,1.06,1.92,2.76];
  for(const y of levels){
   add(root,box(W+.04,.05,D+.03,timber,[0,y,0],.006));
   add(root,box(W+.05,.04,.012,steel,[0,y-.05,D/2+.012],.002));
  }
  for(const x of [-W/2,W/2])for(const y of [.6,1.5,2.3]){add(root,bar([x,y,-D/2],[x,y+.4,D/2],.008,steel,8));add(root,bar([x,y+.4,-D/2],[x,y,D/2],.008,steel,8))}
  // aluminium flight cases
  const alu=std('#8b8d8e',.42,.9),trim=std('#3c3d3f',.5,.6);
  function fcase(w,h,d,p,c=alu,opens=true){
   const g=new THREE.Group();g.position.set(...p);add(root,g);add(g,box(w,h*.62,d,c,[0,h*.31,0],.012));
   const lid=new THREE.Group();lid.position.set(0,h*.62,-d/2);if(opens){lid.userData.moving=true;lids.push(lid)}add(g,lid);
   add(lid,box(w,h*.38,d,c,[0,h*.19,d/2],.012));add(lid,box(w+.012,.016,d+.012,trim,[0,.006,d/2],.004));
   add(lid,box(w*.3,.018,.022,blackPlastic,[0,h*.2,d+.012],.008));
   for(const x of [-.32,.32]){add(g,box(.06,.05,.012,chrome,[x*w,h*.6,d/2+.008],.004));add(g,box(.018,.03,.008,trim,[x*w,h*.6,d/2+.016],.002))}
   for(const sx of [-1,1])for(const sy of [0,1])add(g,mesh(new THREE.SphereGeometry(.024,12,10),trim,[sx*(w/2-.006),sy*h*.62,d/2-.006]));
   return g;
  }
  fcase(.86,.38,.5,[-1.02,.265,0]);fcase(.6,.3,.48,[.39,.265,.0],std('#6f7473',.5,.85));fcase(.72,.38,.5,[-1.05,1.085,.0],std('#5c5f60',.48,.8),false);fcase(.62,.28,.46,[-.92,1.465,.0],alu,false);
  fcase(.7,.28,.46,[1.08,.265,0],std('#6f7473',.5,.85));
  // research binders: picked out so they can be clicked
  const colours=['#1f2d47','#e0d6c2','#5c1f29','#2a2a2a','#e0d6c2','#1f2d47','#3c3f3e','#d6cbb4'];
  const spine=(label,c)=>canvasTexture(128,512,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);const dark=c.startsWith('#e')||c.startsWith('#d');g.fillStyle=dark?'#efe9db':'#efe9db';g.fillRect(16,50,w-32,150);g.fillStyle='#1b1b1b';g.font='600 22px "IBM Plex Mono",Menlo,monospace';g.textAlign='center';g.save();g.translate(w/2,125);g.rotate(-Math.PI/2);g.fillText(label,0,8);g.restore();g.fillStyle='#111';g.beginPath();g.arc(w/2,h-90,17,0,7);g.fill()});
  const labels=['KESSLER','AR TRAIN','DRAGONFLY','LEO DATA','REFS','EPQ','NOTES','PAPERS'];
  let x=0;binderRoot.position.set(.08,1.948,0);add(root,binderRoot);
  colours.forEach((c,i)=>{const w=.065+((i*7)%3)*.012,h=.52+((i*5)%4)*.03,slide=new THREE.Group();slide.userData.moving=true;binders.push(slide);add(binderRoot,slide);add(slide,box(w,h,.36,std(c,.55),[x+w/2,h/2,-.03],.006));add(slide,mesh(new THREE.PlaneGeometry(w*.92,h*.97),new THREE.MeshStandardMaterial({map:spine(labels[i],c),roughness:.6}),[x+w/2,h/2,.1505]));x+=w+.008});
  add(root,box(.05,.5,.28,std('#2a2c2e',.5,.7),[.08+x+.05,2.198,-.03],.005));
  // books lying flat, a lamp of sorts
  for(let i=0;i<4;i++)add(root,box(.42-.03*i,.05,.3,std(['#3a2a22','#8c8069','#1f2d47','#d0c6ae'][i],.7),[1.0,1.11+i*.05,.0],.006,[0,.1*i-.1,0]));
  // two things to reach for: the binders walk out one by one, and the cases open
  root.userData.parts={binders,lids};
  return shadow(root);
 }
 function plant(){
  const outer=new THREE.Group(),root=new THREE.Group(),stem=std('#3e5a2c',.7);root.userData.moving=true;root.position.set(.3,.1,0);outer.add(root);
  const leaf=new THREE.Shape();leaf.moveTo(0,0);leaf.bezierCurveTo(.055,.028,.07,.085,0,.13);leaf.bezierCurveTo(-.07,.085,-.055,.028,0,0);
  const lg=new THREE.ShapeGeometry(leaf,12);{const p=lg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.abs(x)*.55-y*.14)}lg.computeVertexNormals()}
  const greens=['#3f6b2f','#4d7d36','#2f5526','#5a8a3d'];
  const R=rng(89);
  // the pot; +x is out over the front edge of the shelf
  add(outer,mesh(new THREE.CylinderGeometry(.12,.085,.19,32),std('#8a5a3c',.72),[0,.095,0]));
  add(outer,mesh(new THREE.CylinderGeometry(.106,.106,.01,32),std('#2b2118',.95),[0,.178,0]));
  const fall=(z,reach,drop,a)=>[[-.3,.08,z*.4],[-.16,.15,z*.7],[reach-.3,.12,z],[reach-.28,-.08,z+a*.3],[reach-.26,-drop*.42,z+a],[reach-.28,-drop,z+a*1.6]];
  const strands=[fall(-.1,.3,1.25,.05),fall(.02,.33,1.85,-.04),fall(.12,.31,.82,.03),fall(-.2,.29,.55,-.04),fall(.22,.3,1.4,.05)];
  const leafMat=new THREE.MeshPhysicalMaterial({color:'#fff',roughness:.5,side:THREE.DoubleSide,sheen:.4,sheenColor:new THREE.Color('#a8c98c')});
  const all=[];
  for(const s of strands){
   add(root,tube(s,.0042,stem,{segments:60,sides:6}));
   const c=new THREE.CatmullRomCurve3(s.map(p=>new THREE.Vector3(...p))),n=Math.round(c.getLength()*26);
   for(let i=1;i<n;i++)all.push([c.getPoint(i/n),R()*6.28,(.72+R()*.62)*(1-.25*i/n),greens[Math.floor(R()*4)],R()]);
  }
  const inst=new THREE.InstancedMesh(lg,leafMat,all.length),d=new THREE.Object3D();
  all.forEach(([p,a,sc,col,k],i)=>{d.position.copy(p);d.rotation.set(1.3+k*1.2,a,(k-.5)*1.5);d.scale.setScalar(sc);d.updateMatrix();inst.setMatrixAt(i,d.matrix);inst.setColorAt(i,new THREE.Color(col))});
  add(root,inst);
  let swing=0;outer.userData.play=(h,p,dt,t)=>{swing+=(h-swing)*(1-Math.exp(-2.4*dt));root.rotation.z=Math.sin(t*1.5)*.045*swing;root.rotation.x=Math.sin(t*1.1+1)*.03*swing};
  return shadow(outer);
 }
 function crate(){
  const root=new THREE.Group(),w=.92,h=.62,d=.72;
  const tex=canvasTexture(1024,256,(g,W,H)=>{const R=rng(73);g.fillStyle='#4f1c22';g.fillRect(0,0,W,H);for(let i=0;i<170;i++){g.strokeStyle=`rgba(${R()>.5?'120,48,50':'20,6,8'},${.08+R()*.22})`;g.lineWidth=.7+R()*2;const y=R()*H;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(340,y+R()*10-5,680,y+R()*10-5,W,y);g.stroke()}});
  const board=new THREE.MeshStandardMaterial({map:tex,roughness:.62});
  for(let i=0;i<4;i++){
   const y=.075+i*.155;
   add(root,box(w,.14,.022,board,[0,y,d/2],.004));add(root,box(w,.14,.022,board,[0,y,-d/2],.004));
   add(root,box(.022,.14,d,board,[w/2,y,0],.004));add(root,box(.022,.14,d,board,[-w/2,y,0],.004));
  }
  add(root,box(w-.03,.02,d-.03,board,[0,.03,0],.004));
  for(const x of [-.42,.42])add(root,box(.07,h,.03,board,[x,h/2,d/2+.016],.005));
  add(root,box(w,.075,.03,board,[0,h-.04,d/2+.016],.005));
  // a hinged lid, and a letter inside
  const lid=new THREE.Group();lid.position.set(0,h+.002,-d/2-.01);lid.userData.moving=true;add(root,lid);
  for(let i=0;i<5;i++)add(lid,box(w+.02,.022,.15,board,[0,.012,.075+i*.152],.004));
  for(const x of [-.34,.34])add(lid,box(.07,.02,d,board,[x,.032,d/2+.01],.004));
  const letter=new THREE.Group();letter.userData.moving=true;letter.position.set(0,.2,0);letter.rotation.x=-.2;add(root,letter);
  const env=canvasTexture(1024,680,(g,W,H)=>{
   g.fillStyle='#e8dfc9';g.fillRect(0,0,W,H);g.strokeStyle='rgba(120,100,70,.5)';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(W/2,H*.44);g.lineTo(W,0);g.stroke();
   g.fillStyle='#6d2530';g.beginPath();g.arc(W/2,H*.42,58,0,7);g.fill();g.fillStyle='#e8dfc9';g.font='700 56px "League Spartan",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('KM',W/2,H*.43);
   g.fillStyle='#2c3038';g.font='500 46px "IBM Plex Mono",Menlo,monospace';g.fillText('kavish.madan6@gmail.com',W/2,H*.73);
   g.fillStyle='#7a6f5c';g.font='500 28px "IBM Plex Mono",Menlo,monospace';g.fillText('click to copy',W/2,H*.85);
  });
  add(letter,box(.42,.28,.012,new THREE.MeshStandardMaterial({map:env,roughness:.8}),[0,0,0],.003));
  // the LinkedIn tablet that used to float out of the portrait, lying in the crate until it's wanted
  const card=new THREE.Group();card.userData.moving=true;card.position.set(0,.2,-.14);card.rotation.x=-.5;card.scale.setScalar(.2);add(root,card);
  {
   const BW=2.1,BH=1.5,BD=.22,phys=o=>new THREE.MeshPhysicalMaterial(o);
   add(card,box(BW,BH,BD,phys({color:'#3a4a56',roughness:.34,clearcoat:.9,clearcoatRoughness:.18}),[0,0,0],.17));
   add(card,box(1.88,1.28,.04,phys({color:'#0a0a0a',roughness:.25,clearcoat:1}),[0,0,BD/2-.006],.08));
   const ui=canvasTexture(1600,1080,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#17324a');gr.addColorStop(1,'#0c2233');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=2;for(let x=0;x<w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
    g.fillStyle='#537e9a';g.fillRect(0,0,w,250);
    g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=5;g.beginPath();g.ellipse(w*.72,125,330,70,-.12,0,Math.PI*2);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(w*.72+300,98,14,0,Math.PI*2);g.fill();
    g.fillStyle='#f1e6d2';g.beginPath();g.arc(190,260,112,0,Math.PI*2);g.fill();g.strokeStyle='#0c2233';g.lineWidth=12;g.stroke();
    g.fillStyle='#142d43';g.font='800 96px "League Spartan", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('KM',190,266);
    g.textAlign='left';g.textBaseline='alphabetic';
    g.fillStyle='#fff';g.font='800 62px "League Spartan", sans-serif';g.fillText('Kavish',70,470);g.fillText('Madan',70,540);
    g.fillStyle='#b5d2de';g.font='500 30px "IBM Plex Mono", monospace';['Aero/Astro','hopeful','Dubai, UAE'].forEach((t,i)=>g.fillText(t,72,610+i*44));
    g.textAlign='right';g.fillStyle='#fff';g.font='800 64px "League Spartan", sans-serif';g.fillText('500+',w-70,470);
    g.fillStyle='#b5d2de';g.font='500 30px "IBM Plex Mono", monospace';g.fillText('connections',w-70,520);
    g.fillStyle='#f1e6d2';g.beginPath();g.roundRect(w-330,580,260,76,38);g.fill();g.fillStyle='#142d43';g.font='700 34px "League Spartan", sans-serif';g.textAlign='center';g.fillText('Connect',w-200,630);
    g.fillStyle='rgba(255,255,255,.1)';for(let i=0;i<3;i++){g.beginPath();g.roundRect(70+i*500,h-150,440,110,18);g.fill()}
    g.fillStyle='rgba(255,255,255,.28)';for(let i=0;i<3;i++){g.fillRect(100+i*500,h-118,260,14);g.fillRect(100+i*500,h-88,180,14)}
   });
   add(card,mesh(new THREE.PlaneGeometry(1.8,1.2),new THREE.MeshBasicMaterial({map:ui}),[0,0,BD/2+.016]));
   const btn=new THREE.Group();btn.position.set(0,.08,BD/2+.02);btn.userData.moving=true;add(card,btn);
   add(btn,box(.86,.64,.2,phys({color:'#2f6f9f',roughness:.2,clearcoat:1,clearcoatRoughness:.04}),[0,0,.1],.13));
   const inT=canvasTexture(1024,768,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='800 580px "League Spartan", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('in',w/2,h/2+30)});
   add(btn,mesh(new THREE.PlaneGeometry(.6,.45),new THREE.MeshBasicMaterial({map:inT,transparent:true}),[0,0,.201]));
   add(card,box(1.4,.05,.03,phys({color:'#6a7c88',roughness:.4}),[0,-.43,BD/2+.03],.015));
   const bar=new THREE.Group();bar.userData.moving=true;bar.position.set(-.7,-.43,BD/2+.034);add(card,bar);
   add(bar,box(.56,.055,.035,phys({color:'#2f6f9f',roughness:.3,clearcoat:1}),[.28,0,0],.017));
   const knob=mesh(new THREE.SphereGeometry(.075,32,20),phys({color:'#f1e6d2',roughness:.35}),[.56,-.43,BD/2+.07]);knob.userData.moving=true;add(card,knob);
   add(card,mesh(new THREE.TorusGeometry(.14,.036,20,56),gold,[BW/2+.08,.3,0],[0,Math.PI/2,0]));
   add(card,box(.05,.34,.2,gold,[BW/2+.1,.04,0],.02,[.15,0,0]));
   for(const [x,len] of [[.55,.2],[.8,.12]])add(card,box(len,.035,.07,phys({color:'#8a8378',metalness:.6,roughness:.3}),[x,BH/2+.008,0],.016));
   card.userData.press=h=>{btn.position.z=BD/2+.02-h*.07;const k=1+h*.55;bar.scale.x=k;knob.position.x=-.14+h*.3};
  }
  root.userData.parts={lid,letter,card};
  root.userData.playFor=.8;
  root.userData.play=(hv,p)=>{const k=p<.8?Math.sin(p/.8*Math.PI):0;lid.rotation.x=-(hv*1.05+k*.2);letter.position.y=.2+hv*.5+k*.16;letter.rotation.x=-.2+hv*.14};
  // rope handles
  for(const s of [-1,1])add(root,tube([[s*(w/2+.014),.5,-.11],[s*(w/2+.05),.46,-.05],[s*(w/2+.05),.46,.05],[s*(w/2+.014),.5,.11]],.011,std('#a58c62',.9),{segments:20,sides:8}));
  // stencil
  const stencil=canvasTexture(512,256,(g,W,H)=>{g.clearRect(0,0,W,H);g.fillStyle='rgba(232,224,206,.92)';g.font='700 82px "League Spartan",Arial,sans-serif';g.textAlign='center';g.fillText('CONTACT',W/2,110);g.font='500 34px "IBM Plex Mono",Menlo,monospace';g.fillText('KM / THIS WAY UP',W/2,170);g.globalCompositeOperation='destination-out';const R=rng(29);for(let i=0;i<1300;i++){g.fillStyle=`rgba(0,0,0,${R()*.7})`;g.fillRect(R()*W,R()*H,1+R()*5,1+R()*3)}});
  add(root,mesh(new THREE.PlaneGeometry(.64,.32),new THREE.MeshStandardMaterial({map:stencil,transparent:true,roughness:.8}),[.0,.3,d/2+.0125]));
  return shadow(root);
 }
 /* ---------- the bench against the wall: what makes it a place where things get made ---------- */
 function workbench(){
  const root=new THREE.Group(),W=2.75,D=.78,H=.92,steel=std('#2f3336',.5,.7);
  const oak=canvasTexture(1024,256,(g,w,h)=>{const R=rng(211);g.fillStyle='#a8784c';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.strokeStyle=`rgba(${R()>.5?'214,170,120':'70,42,22'},${.08+R()*.2})`;g.lineWidth=.7+R()*2.2;const y=R()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(340,y+R()*14-7,680,y+R()*14-7,w,y);g.stroke()}for(let i=0;i<5;i++){g.fillStyle='rgba(60,36,18,.55)';g.fillRect(0,(i+1)*h/5.2,w,1.6)}for(let i=0;i<34;i++){g.strokeStyle=`rgba(40,28,20,${.1+R()*.2})`;g.lineWidth=1+R()*2;const x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*90,y+(R()-.5)*24);g.stroke()}},{scale:.75});
  const top=new THREE.MeshStandardMaterial({map:oak,roughness:.55});
  add(root,box(W,.075,D,top,[0,H,0],.012));
  for(const x of [-W/2+.08,W/2-.08])for(const z of [-D/2+.07,D/2-.07])add(root,box(.07,H-.03,.07,steel,[x,(H-.03)/2,z],.008));
  add(root,box(W-.2,.05,D-.12,top,[0,.28,0],.008));
  add(root,box(W-.16,.05,.04,steel,[0,H-.1,D/2-.07],.006));
  const front=std('#5f7f80',.5,.25);for(let i=0;i<3;i++){add(root,box(.62,.17,.5,front,[W/2-.46,H-.2-i*.185,.0],.01));add(root,bar([W/2-.58,H-.2-i*.185,.262],[W/2-.34,H-.2-i*.185,.262],.008,chrome,8))}
  add(root,box(.56,.3,.42,std('#b5563a',.55,.1),[-.8,.47,.03],.012));add(root,box(.44,.22,.4,std('#d9c8b0',.8),[-.2,.42,.0],.01));
  const red=std('#a5513a',.38,.35,{clearcoat:.4});add(root,box(.58,.2,.3,red,[-.82,H+.14,-.14],.012));add(root,box(.6,.09,.32,red,[-.82,H+.285,-.14],.02));add(root,bar([-.95,H+.35,-.14],[-.69,H+.35,-.14],.012,chrome,10));for(const x of [-1.02,-.62])add(root,box(.05,.04,.012,chrome,[x,H+.22,.016],.004));
  const v=std('#3f6a70',.45,.5);add(root,box(.2,.1,.2,v,[1.14,H+.09,.24],.012));add(root,box(.18,.1,.05,v,[1.14,H+.17,.34],.008));add(root,box(.18,.1,.05,v,[1.14,H+.17,.18],.008));add(root,bar([1.14,H+.11,.36],[1.14,H+.11,.52],.011,chrome,10));add(root,bar([1.06,H+.11,.52],[1.22,H+.11,.52],.007,chrome,8));
  const jar=new THREE.MeshPhysicalMaterial({color:'#d8e4e0',roughness:.1,transparent:true,opacity:.35,clearcoat:1});add(root,mesh(new THREE.CylinderGeometry(.06,.06,.15,20),jar,[.28,H+.114,-.2]));add(root,mesh(new THREE.CylinderGeometry(.055,.055,.09,16),std('#8f8a80',.6,.7),[.28,H+.085,-.2]));add(root,mesh(new THREE.CylinderGeometry(.065,.065,.02,20),std('#b8964a',.35,.8),[.28,H+.2,-.2]));
  add(root,mesh(new THREE.CylinderGeometry(.05,.044,.1,20),std('#2f6a70',.4),[.02,H+.09,.14]));for(const [a,c] of [[.2,'#a5513a'],[-.18,'#e0b84c'],[.05,'#1e3a40']])add(root,bar([.02,H+.08,.14],[.02+a*.3,H+.27,.14+a*.1],.0055,std(c,.5),6));
  for(const [z,c] of [[.05,'#e9e0cc'],[.1,'#d9cdb4'],[0,'#cfd9d4']])add(root,mesh(new THREE.CylinderGeometry(.028,.028,.72,14),std(c,.8),[.52,H+.066,z+.12],[0,.5,Math.PI/2]));
  const lampC=std('#2f6a70',.4,.3);add(root,mesh(new THREE.CylinderGeometry(.09,.1,.025,24),lampC,[.86,H+.05,-.2]));add(root,bar([.86,H+.06,-.2],[.72,H+.42,-.22],.011,steel,10));add(root,bar([.72,H+.42,-.22],[.96,H+.68,-.16],.011,steel,10));add(root,mesh(new THREE.ConeGeometry(.095,.14,24,1,true),std('#2f6a70',.4,.3,{side:THREE.DoubleSide}),[1.0,H+.62,-.14],[.1,0,-.55]));add(root,mesh(new THREE.SphereGeometry(.036,14,10),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,1.3,.9)}),[.985,H+.595,-.14]));
  const pegT=canvasTexture(1024,448,(g,w,h)=>{g.fillStyle='#c9d4cc';g.fillRect(0,0,w,h);g.fillStyle='rgba(30,44,44,.42)';for(let y=14;y<h;y+=25)for(let x=14;x<w;x+=25){g.beginPath();g.arc(x,y,3.2,0,7);g.fill()}});
  add(root,box(2.5,1.1,.022,new THREE.MeshStandardMaterial({map:pegT,roughness:.8}),[0,1.86,-.425],.004));
  add(root,box(2.56,.03,.03,top,[0,2.42,-.42],.004));add(root,box(2.56,.03,.03,top,[0,1.3,-.42],.004));
  // A pair of framed workshop sketches above the tools adds depth to the left wall.
  const sketch=canvasTexture(1024,512,(g,w,h)=>{
   g.fillStyle='#e9dfcc';g.fillRect(0,0,w,h);g.strokeStyle='rgba(66,104,113,.18)';g.lineWidth=1;
   for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}
   for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
   g.strokeStyle='#46636a';g.lineWidth=4;g.lineCap='round';
   g.beginPath();g.ellipse(300,260,168,74,-.13,0,Math.PI*2);g.ellipse(300,260,110,43,-.13,0,Math.PI*2);g.moveTo(125,328);g.lineTo(450,192);g.moveTo(155,165);g.lineTo(443,350);g.stroke();
   g.lineWidth=2;g.strokeStyle='rgba(67,90,95,.6)';g.strokeRect(540,120,305,240);g.beginPath();g.moveTo(570,320);g.lineTo(625,250);g.lineTo(685,280);g.lineTo(742,170);g.lineTo(817,215);g.stroke();
   g.fillStyle='#a65c44';for(let i=0;i<3;i++)g.fillRect(560,398+i*16,180-i*34,4);
  },{scale:.6});
  const frameMat=std('#6b5140',.68),paperMat=new THREE.MeshStandardMaterial({map:sketch,roughness:.92});
  add(root,box(1.42,.62,.035,frameMat,[-.38,2.85,-.415],.008));
  add(root,mesh(new THREE.PlaneGeometry(1.34,.54),paperMat,[-.38,2.85,-.394]));
  // Small shelf and labelled storage tins, all tucked behind the bench.
  add(root,box(.66,.035,.19,top,[.84,2.65,-.34],.006));
  const tins=[std('#6a8580',.62,.2),std('#bc7755',.66,.15),std('#c5b18f',.7,.15)];
  tins.forEach((m,i)=>{const x=.63+i*.21;add(root,mesh(new THREE.CylinderGeometry(.075,.075,.18,16),m,[x,2.755,-.34]));add(root,mesh(new THREE.CylinderGeometry(.078,.078,.014,16),steel,[x,2.851,-.34]));add(root,box(.085,.035,.003,std('#e9dfcc',.9),[x,2.76,-.263],.002))});
  const metal=std('#a9adb0',.32,.95),grip=std('#a5513a',.5),gripT=std('#2f6a70',.5),wood=std('#a8784c',.6);const hz=-.395;
  [.4,.34,.28,.23,.18].forEach((l,i)=>{const x=-1.08+i*.1;add(root,box(.022,l,.008,metal,[x,2.26-l/2,hz],.003));add(root,mesh(new THREE.TorusGeometry(.027-.002*i,.009,8,16,4.6),metal,[x,2.27,hz],[0,0,1.1]))});
  add(root,box(.03,.34,.02,wood,[-.36,1.99,hz],.006));add(root,box(.14,.05,.04,metal,[-.36,2.17,hz],.008));
  {const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.5,.02);sh.lineTo(.5,.1);sh.lineTo(0,.14);sh.closePath();add(root,mesh(new THREE.ExtrudeGeometry(sh,{depth:.003,bevelEnabled:false}),metal,[.03,1.62,hz-.002]));add(root,box(.12,.14,.022,wood,[.02,1.69,hz],.03))}
  [[.25,gripT],[.34,grip],[.43,gripT],[.52,grip]].forEach(([x,m],i)=>{add(root,box(.03,.11,.03,m,[x,2.22,hz],.012));add(root,bar([x,2.16,hz],[x,1.98+i*.02,hz],.005,metal,8))});
  add(root,bar([.82,2.25,hz],[.76,1.96,hz],.009,grip,8));add(root,bar([.86,2.25,hz],[.92,1.96,hz],.009,grip,8));add(root,box(.05,.1,.012,metal,[.84,2.27,hz],.006));
  add(root,mesh(new THREE.TorusGeometry(.085,.02,10,28),std('#b8703a',.4,.8),[.92,1.62,hz]));
  add(root,mesh(new THREE.TorusGeometry(.14,.012,8,30),std('#2b2b2b',.7),[.58,1.58,hz]));
  return shadow(root);
 }
 function stool(){const root=new THREE.Group(),steel=std('#2f3336',.5,.7);add(root,mesh(new THREE.CylinderGeometry(.19,.19,.05,28),std('#a8784c',.55),[0,.68,0]));for(let i=0;i<3;i++){const a=i/3*6.283+.4;add(root,bar([Math.cos(a)*.1,.66,Math.sin(a)*.1],[Math.cos(a)*.24,.01,Math.sin(a)*.24],.014,steel,10))}add(root,mesh(new THREE.TorusGeometry(.155,.008,8,32),steel,[0,.28,0],[Math.PI/2,0,0]));return shadow(root)}
 function sillPot(){const root=new THREE.Group();add(root,mesh(new THREE.CylinderGeometry(.1,.075,.15,24),std('#b5563a',.6),[0,.075,0]));const leaf=std('#4d7d36',.5,0,{side:THREE.DoubleSide});for(let i=0;i<14;i++){const a=i*2.4,h=.2+(i%4)*.08,r=.05+(i%3)*.05;add(root,bar([Math.cos(a)*.02,.14,Math.sin(a)*.02],[Math.cos(a)*r,.14+h,Math.sin(a)*r],.018-.002*(i%3),leaf,6))}return shadow(root)}
 return {guitar,sketchbook,pencil,pick,tablet,satellite,trophy,tyre,shelving,plant,crate,workbench,stool,sillPot};
};
