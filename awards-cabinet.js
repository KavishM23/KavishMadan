/* Ten honours, one lit display cabinet. Scrolling glides the camera along the bays; each award turns under its spotlight. */
window.createTrophyCabinet=function({THREE,Round,environment,reduced,el,anisotropy=4,batch=root=>root}){
 const host=document.getElementById('cabinet');
 const items=[...document.querySelectorAll('#honors .aw-grid .peel.aw')].map(c=>({cat:c.querySelector('.cat')?.textContent||'',fig:c.querySelector('.fig')?.textContent||'',title:c.querySelector('h4')?.textContent||'',text:c.querySelector('p')?.textContent||'',lvl:c.querySelector('.lvl')?.textContent||''}));
 const N=items.length,BW=3.3,H=3.7,D=1.9,L=N*BW;
 const scene=new THREE.Scene();scene.environment=environment;
 scene.add(new THREE.HemisphereLight(0xb7ab98,0x1c130e,.3));
 const key=new THREE.DirectionalLight(0xfff0dc,.85);key.position.set(-4,6,9);scene.add(key);
 const spot=new THREE.SpotLight(0xffe9c8,64,14,.38,.8,1.4);scene.add(spot,spot.target);
 const camera=new THREE.PerspectiveCamera(36,1,.1,90);
 const world=new THREE.Group();scene.add(world);
 const canvasOf=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const tex=(c,srgb=true)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t};
 const add=(geometry,material,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m};
 const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(17);

 // ---------- materials ----------
 const woodC=canvasOf(1024,256,(g,w,h)=>{g.fillStyle='#2a1e16';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){const y=rng()*h,a=.04+rng()*.12;g.strokeStyle=rng()<.5?`rgba(30,15,6,${a})`:`rgba(150,95,55,${a})`;g.lineWidth=1+rng()*3;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x/(60+rng()*40)+i)*4);g.stroke()}});
 const woodT=tex(woodC);woodT.wrapS=woodT.wrapT=THREE.RepeatWrapping;woodT.repeat.set(N*1.2,1);
 const wood=new THREE.MeshPhysicalMaterial({map:woodT,roughness:.42,clearcoat:.6,clearcoatRoughness:.25});
 const woodEnd=new THREE.MeshPhysicalMaterial({color:0x1e1510,roughness:.5,clearcoat:.4});
 const brass=new THREE.MeshPhysicalMaterial({color:0xd2a94e,metalness:1,roughness:.28});
 const gold=new THREE.MeshPhysicalMaterial({color:0xc9a45c,metalness:1,roughness:.2});
 const silver=new THREE.MeshPhysicalMaterial({color:0xd9dde4,metalness:1,roughness:.2});
 const bronze=new THREE.MeshPhysicalMaterial({color:0xb86b3c,metalness:1,roughness:.3});
 const marbleC=canvasOf(512,512,(g,w,h)=>{g.fillStyle='#2b2926';g.fillRect(0,0,w,h);for(let i=0;i<34;i++){const x=rng()*w,y=rng()*h;g.strokeStyle=`rgba(91,102,105,${.025+rng()*.09})`;g.lineWidth=.5+rng()*2;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+40,y-50,x+105,y+65,x+190,y-25);g.stroke()}for(let i=0;i<7000;i++){const c=rng()<.5?'255,255,255':'94,85,72';g.fillStyle=`rgba(${c},${rng()*.04})`;g.fillRect(rng()*w,rng()*h,2,2)}});
 const marble=new THREE.MeshPhysicalMaterial({map:tex(marbleC),roughness:.3,clearcoat:.8,clearcoatRoughness:.15});
 const darkWood=new THREE.MeshPhysicalMaterial({color:0x281b16,roughness:.46,clearcoat:.3});
 const insetC=canvasOf(512,512,(g,w,h)=>{g.fillStyle='#151412';g.fillRect(0,0,w,h);const gr=g.createRadialGradient(w/2,65,12,w/2,160,330);gr.addColorStop(0,'rgba(247,225,187,.45)');gr.addColorStop(.5,'rgba(185,184,164,.12)');gr.addColorStop(1,'rgba(185,184,164,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<8000;i++){g.fillStyle=`rgba(0,0,0,${rng()*.1})`;g.fillRect(rng()*w,rng()*h,1,1)}});
 const insetMat=new THREE.MeshStandardMaterial({map:tex(insetC),roughness:.96});
 const shadowC=canvasOf(256,256,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,6,w/2,h/2,w*.49);gr.addColorStop(0,'rgba(8,18,23,.42)');gr.addColorStop(.45,'rgba(8,18,23,.2)');gr.addColorStop(1,'rgba(8,18,23,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
 const contactShadow=new THREE.MeshBasicMaterial({map:tex(shadowC),transparent:true,depthWrite:false,opacity:.72});
 // the felt back wall carries a soft pool of light above every bay
 const backC=canvasOf(256*N,256,(g,w,h)=>{g.fillStyle='#151412';g.fillRect(0,0,w,h);for(let i=0;i<N;i++){const cx=(i+.5)*256,gr=g.createRadialGradient(cx,40,6,cx,120,170);gr.addColorStop(0,'rgba(255,236,200,.55)');gr.addColorStop(.45,'rgba(255,226,180,.18)');gr.addColorStop(1,'rgba(255,226,180,0)');g.fillStyle=gr;g.fillRect(cx-128,0,256,h)}for(let i=0;i<9000;i++){g.fillStyle=`rgba(0,0,0,${rng()*.08})`;g.fillRect(rng()*w,rng()*h,1.5,1.5)}});
 const felt=new THREE.MeshStandardMaterial({map:tex(backC),roughness:.95});
 const streakC=canvasOf(256,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.save();g.translate(w/2,h/2);g.rotate(-.5);[[-60,26,.5],[10,10,.35],[48,4,.6]].forEach(([x,bw,a])=>{const gr=g.createLinearGradient(x-bw,0,x+bw,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,`rgba(255,255,255,${a})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-bw,-h,bw*2,h*2)});g.restore()});
 const glass=new THREE.MeshBasicMaterial({map:tex(streakC),transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
 const glassTint=new THREE.MeshPhysicalMaterial({color:0xb7ab98,transparent:true,opacity:.03,roughness:.05,metalness:0,depthWrite:false,envMapIntensity:.5});

 // ---------- the cabinet ----------
 add(new Round(L+.5,.32,D+.3,3,.05),wood,world,L/2,-H/2-.16,0);
 add(new Round(L+.5,.36,D+.35,3,.05),wood,world,L/2,H/2+.18,.02);
 add(new THREE.PlaneGeometry(L,H),felt,world,L/2,0,-D/2);
 add(new Round(.3,H+.7,D+.3,2,.04),woodEnd,world,-.15,0,0);add(new Round(.3,H+.7,D+.3,2,.04),woodEnd,world,L+.15,0,0);
 const lampMat=new THREE.MeshBasicMaterial({color:0xfff3d6,toneMapped:false});
 for(let i=0;i<N;i++){const cx=(i+.5)*BW;
  // Layered recess, shelf and mouldings give each bay physical depth without extra lights.
  const trim=new THREE.Group();trim.position.x=cx;world.add(trim);
  add(new Round(BW-.22,H-.24,.08,2,.025),darkWood,trim,0,0,-D/2+.08);
  add(new Round(BW-.4,H-.42,.04,2,.018),insetMat,trim,0,0,-D/2+.13);
  [-1,1].forEach(s=>{add(new Round(.07,H-.14,.13,2,.018),woodEnd,trim,s*(BW/2-.13),0,-D/2+.18);add(new Round(.018,H-.23,.03,1,.006),brass,trim,s*(BW/2-.2),0,-D/2+.26)});
  add(new Round(BW-.14,.1,D-.12,2,.025),wood,trim,0,-H/2+.06,0);
  add(new Round(BW-.18,.045,.065,2,.012),brass,trim,0,-H/2+.12,D/2-.04);
  add(new Round(BW-.18,.11,.16,2,.025),woodEnd,trim,0,H/2-.09,-D/2+.18);
  batch(trim);
  const housing=add(new THREE.CylinderGeometry(.22,.18,.11,32),darkWood,world,cx,H/2-.09,.2);housing.rotation.z=Math.PI;
  add(new THREE.CylinderGeometry(.13,.13,.04,28),lampMat,world,cx,H/2-.02,.2);
  const ring=add(new THREE.TorusGeometry(.14,.02,8,28),brass,world,cx,H/2-.03,.2);ring.rotation.x=Math.PI/2;
  if(i>0){add(new Round(.05,H,.06,1,.015),brass,world,i*BW,0,D/2+.02);add(new Round(.12,H,.12,1,.02),woodEnd,world,i*BW,0,-D/2+.06)}
  const pane=add(new THREE.PlaneGeometry(BW-.08,H-.04),glassTint,world,cx,0,D/2+.04);pane.renderOrder=2;
  const st=add(new THREE.PlaneGeometry(BW-.08,H-.04),glass,world,cx,0,D/2+.05);st.renderOrder=3;st.material=glass.clone();st.material.map=glass.map.clone();st.material.map.offset.x=rng();st.material.map.needsUpdate=true;
 }
 add(new Round(L,.05,.06,1,.02),brass,world,L/2,-H/2+.02,D/2+.03);add(new Round(L,.05,.06,1,.02),brass,world,L/2,H/2-.03,D/2+.03);

 // ---------- engraved plaques ----------
 function plaqueTex(it){return tex(canvasOf(768,240,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#E9C977');gr.addColorStop(.5,'#C99E45');gr.addColorStop(1,'#E2BF6A');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(70,45,10,.55)';g.lineWidth=6;g.strokeRect(14,14,w-28,h-28);g.fillStyle='rgba(55,35,8,.92)';g.textAlign='center';
  g.font='800 74px "League Spartan", sans-serif';g.fillText(it.fig,w/2,112);g.font='600 30px "IBM Plex Mono", monospace';
  let t=it.title.toUpperCase();while(g.measureText(t).width>w-70&&t.length>4)t=t.slice(0,-2);if(t!==it.title.toUpperCase())t=t.replace(/.$/,'…');g.fillText(t,w/2,172)}))}
 const textTex=(w,h,draw)=>tex(canvasOf(w,h,draw));

 // ---------- the awards ----------
 function medalDisc(mat,face,r=.42){const g=new THREE.Group();
  add(new THREE.CylinderGeometry(r,r,.07,64),mat,g).rotation.x=Math.PI/2;
  const rim=add(new THREE.TorusGeometry(r-.012,.028,12,64),mat,g);rim.position.z=.035;
  const f=add(new THREE.CircleGeometry(r-.05,64),new THREE.MeshPhysicalMaterial({map:face,metalness:.85,roughness:.32,color:0xffffff}),g,0,0,.037);
  const f2=f.clone();f2.position.z=-.037;f2.rotation.y=Math.PI;g.add(f2);return g}
 const faceTex=(label,sub,tone)=>textTex(512,512,(g,w,h)=>{const gr=g.createRadialGradient(w*.4,h*.35,20,w/2,h/2,w/2);gr.addColorStop(0,tone[0]);gr.addColorStop(1,tone[1]);g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(60,40,10,.45)';g.lineWidth=8;g.beginPath();g.arc(w/2,h/2,w/2-34,0,Math.PI*2);g.stroke();
  for(let i=0;i<48;i++){g.save();g.translate(w/2,h/2);g.rotate(i/48*Math.PI*2);g.fillStyle='rgba(60,40,10,.35)';g.fillRect(-3,-w/2+14,6,14);g.restore()}
  g.fillStyle='rgba(50,32,8,.9)';g.textAlign='center';g.textBaseline='middle';g.font=`800 ${label.length>3?120:170}px "League Spartan", sans-serif`;g.fillText(label,w/2,h/2-12);g.font='600 40px "IBM Plex Mono", monospace';g.fillText(sub,w/2,h/2+100)});
 const GOLD=['#FBE39A','#C9962E'],SILV=['#F4F6F9','#9DA4AE'],BRON=['#E9A877','#8D4D27'];
 function ribbon(colA,colB,len=.9){const g=new THREE.Group(),c=textTex(64,256,(x,w,h)=>{const s=w/5;for(let i=0;i<5;i++){x.fillStyle=i%2?colB:colA;x.fillRect(i*s,0,s,h)}});
  const m=new THREE.MeshStandardMaterial({map:c,roughness:.8,side:THREE.DoubleSide});
  [-1,1].forEach(sd=>{const r=add(new THREE.PlaneGeometry(.24,len),m,g,sd*.12,len/2,0);r.rotation.z=sd*-.28});return g}
 function stand(){const g=new THREE.Group();add(new Round(.07,1.9,.07,1,.02),woodEnd,g,0,.95,-.25);add(new Round(.9,.06,.07,1,.02),woodEnd,g,0,1.86,-.25);add(new Round(.7,.08,.5,2,.03),woodEnd,g,0,.04,-.12);return g}
 function hungMedal(mat,face,cols){const g=new THREE.Group(),s=stand();g.add(s);const m=new THREE.Group();g.add(m);m.position.set(0,1.0,-.18);
  const rb=ribbon(cols[0],cols[1],.8);rb.position.y=0;m.add(rb);const d=medalDisc(mat,face);d.position.y=-.02;m.add(d);
  const clasp=add(new Round(.5,.08,.05,1,.02),mat,m,0,.82,0);g.userData.swing=m;return g}
 function cup(mat,label,scale=1){const g=new THREE.Group();
  const pts=[[0,0],[.46,0],[.47,.1],[.2,.2],[.13,.34],[.12,.66],[.3,.8],[.55,1.06],[.69,1.5],[.72,1.82],[.68,1.84],[.64,1.52],[.5,1.12],[.0,1.1]].map(([x,y])=>new THREE.Vector2(x,y));
  add(new THREE.LatheGeometry(pts,72),mat,g,0,.42,0);
  [-1,1].forEach(sd=>{const path=new THREE.CubicBezierCurve3(new THREE.Vector3(sd*.64,2.07,0),new THREE.Vector3(sd*1.26,2.12,0),new THREE.Vector3(sd*1.19,1.38,0),new THREE.Vector3(sd*.55,1.47,0));add(new THREE.TubeGeometry(path,48,.05,12,false),mat,g)});
  add(new Round(1.0,.42,.9,3,.05),woodEnd,g,0,.21,0);
  const lt=textTex(384,128,(x,w,h)=>{x.fillStyle='#d8b464';x.fillRect(0,0,w,h);x.fillStyle='rgba(55,35,8,.9)';x.textAlign='center';x.textBaseline='middle';x.font='800 78px "League Spartan", sans-serif';x.fillText(label,w/2,h/2+4)});
  add(new THREE.PlaneGeometry(.6,.2),new THREE.MeshPhysicalMaterial({map:lt,metalness:.8,roughness:.3}),g,0,.22,.452);
  const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.09:.2;i?star.lineTo(Math.cos(a)*r,Math.sin(a)*r):star.moveTo(Math.cos(a)*r,Math.sin(a)*r)}star.closePath();
  add(new THREE.ExtrudeGeometry(star,{depth:.04,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2}),mat,g,0,1.5,.6);
  g.scale.setScalar(scale);return g}
 function certificate(it){const g=new THREE.Group();
  const ct=textTex(600,440,(x,w,h)=>{x.fillStyle='#d4c9b7';x.fillRect(0,0,w,h);x.strokeStyle='#eb5939';x.lineWidth=10;x.strokeRect(22,22,w-44,h-44);x.strokeStyle='rgba(165,79,54,.4)';x.lineWidth=3;x.strokeRect(38,38,w-76,h-76);
   x.textAlign='center';x.fillStyle='#0d0d0d';x.font='700 54px Caveat, cursive';x.fillText('Certificate of Achievement',w/2,112);x.font='600 24px "IBM Plex Mono", monospace';x.fillText(it.title.toUpperCase(),w/2,170);
   x.font='800 86px "League Spartan", sans-serif';x.fillText(it.fig,w/2,278);x.font='600 22px "IBM Plex Mono", monospace';x.fillStyle='#7f766a';x.fillText('K. MADAN',w/2,350);
   x.fillStyle='#C9962E';x.beginPath();x.arc(w-110,h-100,36,0,Math.PI*2);x.fill();x.fillStyle='#eb5939';x.beginPath();x.moveTo(w-130,h-70);x.lineTo(w-120,h-30);x.lineTo(w-110,h-60);x.lineTo(w-100,h-30);x.lineTo(w-90,h-70);x.fill()});
  const fr=new THREE.Group();g.add(fr);fr.position.set(0,1.05,0);fr.rotation.x=-.08;
  add(new Round(1.62,1.24,.08,2,.03),brass,fr);add(new THREE.PlaneGeometry(1.44,1.06),new THREE.MeshStandardMaterial({map:ct,roughness:.85}),fr,0,0,.045);
  const leg=add(new Round(.06,1.1,.05,1,.02),woodEnd,g,0,.55,-.38);leg.rotation.x=.35;return g}
 function crystal(label){const g=new THREE.Group(),s=new THREE.Shape();s.moveTo(-.42,0);s.lineTo(.42,0);s.lineTo(.3,1.55);s.lineTo(0,1.85);s.lineTo(-.3,1.55);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:.34,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3});geo.translate(0,0,-.17);
  const cm=new THREE.MeshPhysicalMaterial({color:0xe8f3f7,transparent:true,opacity:.42,roughness:.02,metalness:0,clearcoat:1,iridescence:.8,iridescenceIOR:1.5,envMapIntensity:2.4,depthWrite:false,side:THREE.DoubleSide});
  const body=add(geo,cm,g,0,.34,0);body.renderOrder=4;
  const lt=textTex(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(20,45,67,.85)';x.textAlign='center';x.textBaseline='middle';x.font='800 150px "League Spartan", sans-serif';x.fillText(label,w/2,h/2)});
  const tp=add(new THREE.PlaneGeometry(.66,.33),new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false}),g,0,1.1,0);tp.renderOrder=3;
  add(new Round(1.0,.34,.6,3,.05),new THREE.MeshPhysicalMaterial({color:0x0d0d0d,roughness:.3,clearcoat:1}),g,0,.17,0);return g}
 function scoreBlock(label){const g=new THREE.Group();
  const lt=textTex(640,360,(x,w,h)=>{x.fillStyle='#0d0d0d';x.fillRect(0,0,w,h);x.fillStyle='#b7ab98';x.textAlign='center';x.textBaseline='middle';x.font='800 150px "League Spartan", sans-serif';x.fillText(label,w/2,h/2-20);x.font='600 30px "IBM Plex Mono", monospace';x.fillStyle='#b7ab98';x.fillText('SENIOR MATHS CHALLENGE',w/2,h-60)});
  const flip=add(new Round(1.5,.86,.24,3,.04),new THREE.MeshPhysicalMaterial({color:0x080808,roughness:.4,clearcoat:.6}),g,0,.95,0);flip.rotation.x=-.12;
  const face=add(new THREE.PlaneGeometry(1.4,.78),new THREE.MeshBasicMaterial({map:lt,toneMapped:false}),flip,0,0,.125);
  [-.55,.55].forEach(x=>add(new Round(.07,.55,.07,1,.02),brass,g,x,.3,0));add(new Round(1.3,.08,.5,2,.03),woodEnd,g,0,.04,0);return g}
 function laptop(){const g=new THREE.Group(),alu=new THREE.MeshPhysicalMaterial({color:0xc8ccd4,metalness:.9,roughness:.32});
  // Keep the lid in front of the recessed backing at every display angle.
  add(new Round(1.5,.06,.75,3,.03),alu,g,0,.03,.1);const lid=new THREE.Group();lid.position.set(0,.06,-.245);lid.rotation.x=-.1;g.add(lid);
  add(new Round(1.5,.98,.05,3,.03),alu,lid,0,.49,0);
  const img=new THREE.TextureLoader().load('img/lb-landing.webp');img.colorSpace=THREE.SRGBColorSpace;img.anisotropy=anisotropy;
  add(new THREE.PlaneGeometry(1.38,.86),new THREE.MeshBasicMaterial({map:img,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),lid,0,.49,.045);
  const ros=rosette('#eb5939','#b7ab98','TOP 7');ros.position.set(.62,.42,.48);ros.scale.setScalar(.55);g.add(ros);g.scale.setScalar(1.3);return g}
 function rosette(c1,c2,label){const g=new THREE.Group(),m1=new THREE.MeshStandardMaterial({color:c1,roughness:.7,side:THREE.DoubleSide});
  for(let i=0;i<24;i++){const p=add(new THREE.PlaneGeometry(.16,.5),m1,g,0,0,0);p.rotation.z=i/24*Math.PI*2;p.translateY(.22);p.rotation.x=.05}
  const ct=textTex(256,256,(x,w,h)=>{x.fillStyle=c2;x.beginPath();x.arc(w/2,h/2,w/2,0,Math.PI*2);x.fill();x.fillStyle='#0d0d0d';x.textAlign='center';x.textBaseline='middle';x.font='800 64px "League Spartan", sans-serif';x.fillText(label,w/2,h/2+4)});
  add(new THREE.CircleGeometry(.24,40),new THREE.MeshStandardMaterial({map:ct,roughness:.6}),g,0,0,.08);
  [-1,1].forEach(sd=>{const t=add(new THREE.PlaneGeometry(.16,.6),m1,g,sd*.09,-.48,-.01);t.rotation.z=sd*.18});return g}
 function pennant(){const g=new THREE.Group();add(new THREE.CylinderGeometry(.025,.025,2.1,12),brass,g,-.55,1.05,0);add(new THREE.SphereGeometry(.05,16,12),brass,g,-.55,2.12,0);
  const ft=textTex(512,256,(x,w,h)=>{x.fillStyle='#141312';x.beginPath();x.moveTo(0,0);x.lineTo(w,h/2);x.lineTo(0,h);x.closePath();x.fill();x.fillStyle='#fff';x.font='800 70px "League Spartan", sans-serif';x.textBaseline='middle';x.fillText('YYGS',30,h/2+4);x.font='600 22px "IBM Plex Mono", monospace';x.fillText('YALE',34,h/2+52)});
  const geo=new THREE.PlaneGeometry(1.4,.7,24,1);const flag=add(geo,new THREE.MeshStandardMaterial({map:ft,roughness:.75,side:THREE.DoubleSide,transparent:true,alphaTest:.5}),g,.15,1.6,0);
  const base=geo.attributes.position.array.slice();g.userData.wave=t=>{const a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=base[i*3]+.7;a.array[i*3+2]=Math.sin(x*3.2-t*2.4)*.05*x}a.needsUpdate=true};
  add(new Round(.6,.1,.5,2,.03),woodEnd,g,-.55,.05,0);return g}
 function medalPair(){const g=new THREE.Group(),s=stand();g.add(s);[-.42,-.14,.14,.42].forEach((x,i)=>{const m=new THREE.Group();m.position.set(x,1.12-Math.abs(x)*.25,-.18+i*.01);m.rotation.z=x*-.35;g.add(m);
   const rb=ribbon('#0d0d0d','#b7ab98',.7);m.add(rb);const d=medalDisc(gold,faceTex(['J','I','S','★'][i],'UKMT',GOLD),.24);d.position.y=-.02;m.add(d)});g.userData.swing=g.children[1];return g}
 const kinds=[
  ()=>certificate(items[0]),
  ()=>medalPair(),
  ()=>scoreBlock(items[2].fig),
  ()=>cup(gold,'RANK 1',1.05),
  ()=>crystal(items[4].fig),
  ()=>hungMedal(gold,faceTex('11','CHALLENGEME',GOLD),['#eb5939','#b7ab98']),
  ()=>cup(bronze,'3RD',.82),
  ()=>laptop(),
  ()=>pennant(),
  ()=>hungMedal(silver,faceTex('DofE','SILVER',SILV),['#3a3733','#b7ab98'])
 ];
 const bays=items.map((it,i)=>{const cx=(i+.5)*BW,bay=new THREE.Group();bay.position.set(cx,-H/2,0);world.add(bay);
  const plinth=new THREE.Group();bay.add(plinth);
  const shade=add(new THREE.PlaneGeometry(2.25,1.55),contactShadow,plinth,0,.115,.1);shade.rotation.x=-Math.PI/2;
  add(new Round(1.84,.09,1.29,3,.025),darkWood,plinth,0,.165,.1);
  add(new Round(1.76,.055,1.21,3,.014),brass,plinth,0,.235,.1);
  add(new Round(1.7,.42,1.15,3,.05),marble,plinth,0,.46,.1);
  add(new Round(1.78,.045,1.23,3,.012),brass,plinth,0,.685,.1);
  add(new Round(1.86,.08,1.31,3,.025),marble,plinth,0,.745,.1);
  add(new Round(1.13,.38,.035,3,.018),darkWood,plinth,0,.46,.69);
  add(new THREE.PlaneGeometry(1.05,.33),new THREE.MeshPhysicalMaterial({map:plaqueTex(it),metalness:.85,roughness:.3}),plinth,0,.46,.711);
  const screwGeo=new THREE.SphereGeometry(.018,10,8);[-.51,.51].forEach(x=>{const screw=add(screwGeo,brass,plinth,x,.46,.735);screw.scale.z=.4});
  batch(plinth);
  const holder=new THREE.Group();holder.position.set(0,.79,.05);bay.add(holder);const obj=batch((kinds[i]||kinds[0])());holder.add(obj);
  return{bay,holder,obj,emph:0,spin:0}});
 // low-key room: surfaces barely pick up the studio reflections, polished metal keeps its glow
 scene.traverse(o=>{const m=o.material;if(!m||m.isMeshBasicMaterial||Array.isArray(m))return;m.envMapIntensity=(m.envMapIntensity??1)*(m.metalness>.5?.9:.3)});
 world.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});

 // ---------- scroll ----------
 const card=host.querySelector('.cab-card'),counter=host.querySelector('[data-cab-count]'),dotWrap=host.querySelector('.cab-dots');
 items.forEach(it=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',it.fig+', '+it.title);dotWrap.append(b)});
 const dots=[...dotWrap.querySelectorAll('button')];
 const slot={el,scene,camera,models:[],group:world,visible:false};
 let live=false,q=0,active=-1;
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 function measure(){live=!reduced&&innerHeight>=560;document.documentElement.classList.toggle('cabinet-ready',live)}
 function mapped(p){const t=p*(N-1),i=Math.min(N-2,Math.floor(t));let f=clamp((t-i-.38)/.62);f=f*f*(3-2*f);return i+f}
 function show(i){if(i===active)return;active=i;const it=items[i];
  card.classList.remove('in');void card.offsetWidth;
  card.querySelector('.cab-cat').textContent=it.cat;card.querySelector('.cab-fig').textContent=it.fig;card.querySelector('.cab-title').textContent=it.title;card.querySelector('.cab-text').textContent=it.text;card.querySelector('.cab-lvl').textContent=it.lvl;
  if(counter)counter.textContent=String(i+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');
  dots.forEach((d,k)=>d.setAttribute('aria-current',String(k===i)));card.classList.add('in')}
 dots.forEach((d,k)=>d.addEventListener('click',()=>{const top=host.getBoundingClientRect().top+scrollY,dist=Math.max(1,host.offsetHeight-innerHeight);(window.smoothTo?smoothTo(top+dist*(k/(N-1))+2):scrollTo({top:top+dist*(k/(N-1))+2,behavior:reduced?'auto':'smooth'}))}));
 slot.customUpdate=(dt,t)=>{
  if(!live)return;
  const r=host.getBoundingClientRect(),dist=Math.max(1,host.offsetHeight-innerHeight),p=clamp(-r.top/dist);
  q=damp(q,mapped(p),7,dt);show(Math.round(q));
  const stage=slot.rect||el.getBoundingClientRect(),narrow=stage.width/Math.max(1,stage.height)<1,cx=(q+.5)*BW;
  camera.fov=narrow?44:36;camera.position.set(cx-(narrow?.3:1.05),narrow?.05:.35,narrow?6.3:7.4);camera.lookAt(cx+(narrow?0:.15),narrow?-.75:-.55,0);
  spot.position.set(cx,H/2+.6,2.6);spot.target.position.set(cx,-H/2+.9,0);
  const reach=Math.max(2.5,Math.ceil(Math.tan(camera.fov*Math.PI/360)*camera.position.z*stage.width/Math.max(1,stage.height)/BW)+1.5);
  bays.forEach((b,i)=>{b.bay.visible=Math.abs(q-i)<reach;if(!b.bay.visible)return;const on=Math.max(0,1-Math.abs(q-i));b.emph=damp(b.emph,on,6,dt);b.spin+=dt*(.25+b.emph*.35);
   b.holder.rotation.y=Math.sin(b.spin)*.35*b.emph+(1-b.emph)*-.25;
   const sw=b.obj.userData.swing;if(sw)sw.rotation.z=Math.sin(t*1.6+i)*.05*b.emph;b.obj.userData.wave?.(t)});
 };
 addEventListener('resize',measure);measure();if(live)show(0);
 return slot;
};
