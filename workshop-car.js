/* The Formula One car at the centre of the workshop. Modelled in metres at full size.
   z runs forward: the front axle is at z=0 and the rear axle at z=-3.6. */
Workshop.car=function(THREE,kit){
 const {loft,skin,wing,foil,bar,blade,tube,mesh,box,add,worn,canvasTexture,rng,smooth,lerp}=kit;
 const NAVY='#2a4068',IVORY='#e3dac6',WINE='#6d2530',DARK='#10141b';
 const Z0=-4.7,Z1=1.5,XW=1.2,YH=1.5;

 /* ---- livery, painted from the side and from above ---- */
 const zx=(z,w)=>(z-Z0)/(Z1-Z0)*w;
 const side=canvasTexture(4096,1024,(g,w,h)=>{
  const X=z=>zx(z,w),Y=y=>h-y/YH*h;
  g.fillStyle=NAVY;g.fillRect(0,0,w,h);
  const shade=g.createLinearGradient(0,Y(1.1),0,Y(.1));shade.addColorStop(0,'rgba(255,255,255,.035)');shade.addColorStop(1,'rgba(0,0,0,.2)');g.fillStyle=shade;g.fillRect(0,0,w,h);
  const poly=(pts,fill)=>{g.fillStyle=fill;g.beginPath();pts.forEach(([z,y],i)=>i?g.lineTo(X(z),Y(y)):g.moveTo(X(z),Y(y)));g.closePath();g.fill()};
  // sidepod: an ivory flash behind the inlet, led by a wine blade
  poly([[-1.0,.75],[-1.42,.75],[-2.32,.08],[-1.62,.08]],IVORY);
  poly([[-1.46,.75],[-1.62,.75],[-2.52,.08],[-2.36,.08]],WINE);
  // nose: ivory tip that closes to a point on the chassis
  poly([[1.6,.6],[.42,.6],[-.05,.1],[1.6,.1]],IVORY);
  poly([[.42,.6],[.24,.6],[-.2,.1],[-.05,.1]],WINE);
 },{scale:.6});
 const top=canvasTexture(4096,1024,(g,w,h)=>{
  const X=z=>zx(z,w),Y=x=>h-x/XW*h;
  g.fillStyle=NAVY;g.fillRect(0,0,w,h);
  const poly=(pts,fill)=>{g.fillStyle=fill;g.beginPath();pts.forEach(([z,x],i)=>i?g.lineTo(X(z),Y(x)):g.moveTo(X(z),Y(x)));g.closePath();g.fill()};
  poly([[1.6,0],[1.6,.3],[.42,.3],[-.05,.0]],IVORY);
  poly([[.42,.3],[.24,.3],[-.22,0],[-.05,0]],WINE);
    // the driver's tub is dark inside
  g.fillStyle='#07090c';g.beginPath();g.ellipse(X(-1.62),Y(0),X(-1.08)-X(-1.62),h*.218,0,0,7);g.fill();
 },{scale:.6});
 // panel seams, stored in alpha so they catch the light
 const seams=(t,draw)=>{
  const c=t.image,g=c.getContext('2d'),s=c.width/4096;g.save();g.scale(s,s);
  g.globalCompositeOperation='destination-out';g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=2;draw(g);
  g.globalCompositeOperation='source-over';g.restore();t.needsUpdate=true;
 };
 seams(side,g=>{
  const X=z=>zx(z,4096),Y=y=>1024-y/YH*1024;
  const line=(a,b,c,d)=>{g.beginPath();g.moveTo(X(a),Y(b));g.lineTo(X(c),Y(d));g.stroke()};
  line(-.95,.72,-3.2,.46);line(-.95,.3,-3.2,.3);line(-1.5,.74,-1.5,.2);line(-2.5,.6,-2.5,.2);line(0,.6,.0,.15);line(-.75,.72,-.75,.12);line(-2.15,1,-2.15,.5);line(-3.35,.78,-3.35,.3);
  for(let i=0;i<34;i++){g.beginPath();g.arc(X(-1+i*-.065),Y(.3),2.4,0,7);g.stroke()}
 });
 seams(top,g=>{
  const X=z=>zx(z,4096),Y=x=>1024-x/XW*1024;
  const line=(a,b,c,d)=>{g.beginPath();g.moveTo(X(a),Y(b));g.lineTo(X(c),Y(d));g.stroke()};
  line(-1,.33,-3.2,.17);line(-2.5,.15,-2.5,.8);line(-.75,0,-.75,.26);line(0,0,0,.19);line(-2.15,0,-2.15,.3);
 });

 const box6=[Z0,Z1,XW,YH];
 const body=worn({roughness:.46,clearcoat:.55,clearcoatRoughness:.3,envMapIntensity:1.15},{dirt:.62,scale:.9,top,side,box:box6,inject:'float tub=step(abs(vOP.x),.268)*step(vOP.z,-1.08)*step(-2.14,vOP.z)*step(vOP.y,.712);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.012),tub);'});
 const paintNavy=worn({color:NAVY,roughness:.44,clearcoat:.5,clearcoatRoughness:.3},{dirt:.55});
 const paintIvory=worn({color:IVORY,roughness:.5,clearcoat:.4,clearcoatRoughness:.3},{dirt:.72,chip:'#8d8473'});
 const paintWine=worn({color:WINE,roughness:.42,clearcoat:.5,clearcoatRoughness:.3},{dirt:.5});
 const weave=canvasTexture(256,256,(g,w,h)=>{g.fillStyle='#16191f';g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const on=(x+y)%4<2;g.fillStyle=on?'#262b33':'#0e1014';g.fillRect(x*16,y*16,on?16:15,on?15:16)}},{repeat:true});
 weave.repeat.set(30,30);
 const carbon=new THREE.MeshPhysicalMaterial({map:weave,color:'#8a8a8a',bumpMap:weave,bumpScale:.0012,roughness:.5,clearcoat:.2,clearcoatRoughness:.4,envMapIntensity:.5});
 const carbonBare=worn({color:'#14171c',roughness:.5,clearcoat:.4,clearcoatRoughness:.35},{dirt:.62});
 const steel=new THREE.MeshPhysicalMaterial({color:'#c6cacf',roughness:.24,metalness:1});
 const titanium=new THREE.MeshPhysicalMaterial({color:'#8c8880',roughness:.34,metalness:1});
 const black=new THREE.MeshStandardMaterial({color:'#07080a',roughness:.75});
 const pad=new THREE.MeshStandardMaterial({color:'#17171a',roughness:.9});
 const brass=new THREE.MeshPhysicalMaterial({color:'#c07a2a',roughness:.3,metalness:1});

 const root=new THREE.Group();

 /* ---- chassis, nose and engine cover ---- */
 const chassis=[
  {z:1.27,top:.222,bot:.165,w:.04,p:2.2},
  {z:1.19,top:.262,bot:.15,w:.078,p:2.3},
  {z:.92,top:.335,bot:.145,w:.112,p:2.6},
  {z:.48,top:.455,bot:.15,w:.145,p:2.8},
  {z:.05,top:.545,bot:.16,w:.172,p:3},
  {z:-.4,top:.615,bot:.15,w:.206,p:3.1},
  {z:-.74,top:.66,bot:.13,w:.255,p:3.2},
  {z:-1.02,top:.695,bot:.11,w:.3,p:3.4,nd:.015,nw:.2},
  {z:-1.16,top:.705,bot:.11,w:.318,p:3.5,nd:.14,nw:.225},
  {z:-1.34,top:.715,bot:.105,w:.33,p:3.6,nd:.27,nw:.245},
  {z:-1.7,top:.722,bot:.105,w:.335,p:3.6,nd:.31,nw:.255},
  {z:-1.98,top:.74,bot:.105,w:.33,p:3.5,nd:.31,nw:.25},
  {z:-2.08,top:.8,bot:.11,w:.315,p:3.3,nd:.16,nw:.23},
  {z:-2.2,top:1.0,bot:.12,w:.285,p:3,tw:.56},
  {z:-2.3,top:1.045,bot:.125,w:.26,p:2.9,tw:.46},
  {z:-2.52,top:1.03,bot:.135,w:.23,p:2.7,tw:.42},
  {z:-2.85,top:.94,bot:.16,w:.195,p:2.6,tw:.46},
  {z:-3.2,top:.81,bot:.2,w:.145,p:2.4,tw:.55},
  {z:-3.65,top:.67,bot:.24,w:.102,p:2.3},
  {z:-4.08,top:.54,bot:.28,w:.058,p:2.2},
  {z:-4.2,top:.47,bot:.31,w:.035,p:2.2},
 ];
 add(root,mesh(loft(chassis,{steps:120,around:72}),body));

 /* ---- sidepods: inlet, undercut, and a long ramp down to the floor ---- */
 for(const s of [-1,1]){
  const pod=[
   {z:-.94,top:.6,bot:.3,w:.285,p:5,cx:s*.585,bf:.96},
   {z:-1.04,top:.625,bot:.25,w:.315,p:5,cx:s*.59,bf:.9},
   {z:-1.3,top:.635,bot:.2,w:.335,p:4.4,cx:s*.585,bf:.74},
   {z:-1.8,top:.615,bot:.17,w:.335,p:3.8,cx:s*.57,bf:.62},
   {z:-2.3,top:.555,bot:.16,w:.3,p:3.2,cx:s*.525,bf:.66},
   {z:-2.75,top:.47,bot:.16,w:.235,p:2.8,cx:s*.44,bf:.74},
   {z:-3.15,top:.38,bot:.17,w:.15,p:2.5,cx:s*.31,bf:.84},
   {z:-3.5,top:.31,bot:.19,w:.065,p:2.3,cx:s*.19},
  ];
  add(root,mesh(loft(pod,{steps:70,around:44}),body));
  // the inlet: a dark throat behind a sharp lip
  add(root,box(.555,.29,.02,paintNavy,[s*.585,.452,-.935],.06));
  add(root,box(.5,.24,.03,black,[s*.585,.452,-.93],.045));
  // louvres cut into the top of the pod
  for(let i=0;i<7;i++){const v=box(.25,.012,.03,black,[s*.56,.598-i*.0068,-1.72-i*.085],.005,[.18,0,s*-.14]);add(root,v)}
  // cooling exit
  add(root,box(.02,.08,.5,black,[s*.33,.41,-2.92],.01,[0,s*.24,0]));
 }

 /* ---- floor: one carbon plate with a raised, scalloped edge ---- */
 const fl=new THREE.Shape();
 fl.moveTo(-.16,.72);fl.bezierCurveTo(-.3,.6,-.5,-.42,-.62,-.62);fl.lineTo(-.86,-.98);fl.bezierCurveTo(-.98,-1.2,-.99,-1.6,-.98,-2.05);fl.lineTo(-.97,-2.86);fl.bezierCurveTo(-.96,-3.0,-.86,-3.1,-.72,-3.16);fl.lineTo(-.7,-3.58);fl.lineTo(-.46,-4.08);
 fl.lineTo(.46,-4.08);fl.lineTo(.7,-3.58);fl.lineTo(.72,-3.16);fl.bezierCurveTo(.86,-3.1,.96,-3.0,.97,-2.86);fl.lineTo(.98,-2.05);fl.bezierCurveTo(.99,-1.6,.98,-1.2,.86,-.98);fl.lineTo(.62,-.62);fl.bezierCurveTo(.5,-.42,.3,.6,.16,.72);fl.closePath();
 const flGeo=new THREE.ExtrudeGeometry(fl,{depth:.022,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2,curveSegments:32});
 flGeo.rotateX(Math.PI/2);flGeo.translate(0,.085,0);
 add(root,mesh(flGeo,carbon));
 const edge=[[-.62,.11,-.62],[-.88,.13,-1.0],[-.975,.135,-1.5],[-.985,.135,-2.1],[-.975,.12,-2.86]];
 for(const s of [-1,1]){
  const rings=[];
  const curve=new THREE.CatmullRomCurve3(edge.map(p=>new THREE.Vector3(s*Math.abs(p[0]),p[1],p[2])));
  for(let i=0;i<=80;i++){
   const t=i/80,p=curve.getPoint(t),scallop=0;
   const h=.012+.034*Math.sin(Math.PI*t);
   rings.push([[p.x+s*.006,p.y-.05,p.z],[p.x+s*.006,p.y+h+scallop,p.z],[p.x-s*.006,p.y+h+scallop,p.z],[p.x-s*.006,p.y-.05,p.z]]);
  }
  add(root,mesh(skin(s>0?rings:rings.reverse()),carbonBare));
  // a floor stay, thin and taut
  add(root,bar([s*.86,.11,-1.42],[s*.46,.44,-1.26],.006,titanium,8));
 }
 // floor fences ahead of the tunnels
 for(const s of [-1,1])for(const i of [0,1]){
  const x=s*(.14+i*.07),r=[];
  for(let j=0;j<=24;j++){const t=j/24,z=lerp(.42,-.72,t),y=.09,h=.09*Math.sin(Math.PI*Math.pow(t,.7))+.012;r.push([[x+.004,y,z],[x+.004,y+h,z],[x-.004,y+h,z],[x-.004,y,z]])}
  add(root,mesh(skin(r),carbonBare));
 }
 // plank and diffuser
 add(root,box(.3,.012,3.6,mat('#7a6a4f',.8),[0,.052,-1.95],.004));
 function mat(c,r,me=0){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:me})}
 const dif=new THREE.Shape();dif.moveTo(-.46,0);dif.lineTo(.46,0);dif.lineTo(.5,.26);dif.lineTo(-.5,.26);dif.closePath();
 const difMesh=mesh(new THREE.ExtrudeGeometry(dif,{depth:.012,bevelEnabled:false}),carbonBare,[0,.09,-3.98],[Math.PI/2+.32,0,0]);add(root,difMesh);
 for(const x of [-.46,-.3,-.12,.12,.3,.46])add(root,box(.01,.1,.27,carbonBare,[x,.135,-4.08],.004,[.32,0,0]));

 /* ---- front wing ---- */
 const sw=(s,a,b,p=2)=>lerp(a,b,Math.pow(Math.abs(s),p));
 const elements=[
  {y:s=>sw(s,.118,.112),z:s=>sw(s,1.34,1.29,2)-.0,c:s=>sw(s,.34,.25),a:s=>sw(s,.05,.13),m:paintNavy},
  {y:s=>sw(s,.17,.15)+.035*Math.pow(1-Math.abs(s),3)*2,z:s=>sw(s,1.12,1.05,1.6),c:s=>sw(s,.15,.15),a:s=>sw(s,.3,.36),m:paintIvory},
  {y:s=>sw(s,.22,.19)+.05*Math.pow(1-Math.abs(s),3)*2,z:s=>sw(s,1.0,.93,1.5),c:s=>sw(s,.13,.14),a:s=>sw(s,.5,.52),m:paintNavy},
  {y:s=>sw(s,.28,.235)+.05*Math.pow(1-Math.abs(s),3)*2,z:s=>sw(s,.91,.82,1.4),c:s=>sw(s,.11,.13),a:s=>sw(s,.72,.72),m:paintWine},
 ];
 const FW=.985;
 for(const e of elements){
  add(root,mesh(wing(s=>({x:s*FW,y:e.y(s),z:e.z(s),chord:e.c(s),aoa:e.a(s)}),{steps:96,outline:foil(22,.1,.05)}),e.m));
 }
 for(const s of [-1,1]){
  // endplate, a single swept sheet
  const r=[];const prof=[[1.42,.15,.075],[1.36,.255,.05],[1.2,.3,.045],[1.0,.315,.05],[.86,.28,.06],[.8,.16,.07]];
  const curve=new THREE.CatmullRomCurve3(prof.map(p=>new THREE.Vector3(0,p[1],p[0])));
  const lower=new THREE.CatmullRomCurve3(prof.map(p=>new THREE.Vector3(0,p[2],p[0])));
  for(let i=0;i<=48;i++){
   const t=i/48,a=curve.getPoint(t),b=lower.getPoint(t),x=s*(FW+.008*Math.sin(t*3.14));
   r.push([[x+.007,b.y,a.z],[x+.007,a.y,a.z],[x-.007,a.y,a.z],[x-.007,b.y,a.z]]);
  }
  add(root,mesh(skin(s>0?r:r.reverse()),s?carbonBare:carbonBare));
  add(root,box(.017,.13,.17,paintWine,[s*FW,.2,1.31],.008,[.1,0,0]));
  // underside strake
  add(root,box(.014,.065,.38,carbonBare,[s*.72,.075,1.1],.005));
  // pylons from the nose down to the wing
  add(root,box(.018,.12,.34,carbonBare,[s*.05,.13,1.08],.005,[.08,0,0]));
 }

 /* ---- rear wing and beam wing ---- */
 const rearWing=(y,z,chord,aoa,m)=>mesh(wing(s=>({x:s*.5,y:y+.018*(1-s*s),z,chord,aoa}),{steps:48,outline:foil(24,.11,.07)}),m);
 const rear=(y,z,chord,aoa,m)=>add(root,rearWing(y,z,chord,aoa,m));
 rear(.83,-4.2,.3,.12,paintIvory);
 // the top flap hinges at its leading edge: this is the drag-reduction system
 const flap=new THREE.Group();flap.position.set(0,.965,-4.33);flap.userData.moving=true;add(root,flap);
 {const m=rearWing(.925,-4.42,.19,.62,paintIvory);m.position.set(0,-.965,4.33);add(flap,m)}
 rear(.48,-4.26,.15,.28,carbonBare);rear(.545,-4.38,.13,.5,carbonBare);
 for(const s of [-1,1]){
  const plate=new THREE.Shape();plate.moveTo(0,0);plate.lineTo(.5,0);plate.bezierCurveTo(.57,.16,.59,.34,.58,.52);plate.lineTo(.17,.55);plate.bezierCurveTo(.08,.5,.03,.25,0,0);
  const geo=new THREE.ExtrudeGeometry(plate,{depth:.012,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:1,curveSegments:24});geo.rotateY(Math.PI/2);geo.translate(-.006,0,0);
  add(root,mesh(geo,carbonBare,[s*.505,.5,-4.02]));
  add(root,box(.016,.05,.5,paintWine,[s*.505,1.038,-4.36],.006));
  // pillars
  add(root,blade([s*.08,.56,-3.98],[s*.1,.86,-4.14],.03,.008,carbonBare));
 }
 add(root,bar([0,.46,-4.25],[0,.3,-4.32],.014,steel));

 /* ---- crash structure, rain light, exhaust ---- */
 add(root,mesh(loft([{z:-3.9,top:.5,bot:.28,w:.09,p:3},{z:-4.25,top:.4,bot:.31,w:.06,p:3},{z:-4.38,top:.365,bot:.325,w:.038,p:2.6}],{steps:30,around:32}),carbonBare));
 add(root,box(.1,.05,.012,mat('#6c1414',.3),[0,.345,-4.395],.006));
 const pipe=mesh(new THREE.CylinderGeometry(.052,.044,.28,32,1,true),titanium,[0,.59,-4.0],[Math.PI/2-.08,0,0]);pipe.material=titanium.clone();pipe.material.side=THREE.DoubleSide;add(root,pipe);
 add(root,mesh(new THREE.CylinderGeometry(.04,.04,.01,32),black,[0,.585,-3.93],[Math.PI/2,0,0]));

 /* ---- airbox, camera pod and fin ---- */
 const inlet=new THREE.Group();inlet.position.set(0,.965,-2.205);inlet.rotation.x=-.26;inlet.scale.set(1.18,1,1);add(root,inlet);
 add(inlet,mesh(new THREE.TorusGeometry(.075,.017,20,64),paintWine));
 add(inlet,mesh(new THREE.CircleGeometry(.075,48),black,[0,0,.002]));
 add(root,bar([0,1.03,-2.3],[0,1.1,-2.3],.012,carbonBare,10));
 add(root,box(.19,.04,.12,carbonBare,[0,1.112,-2.3],.018));
 add(root,bar([-.095,1.112,-2.3],[.095,1.112,-2.3],.021,carbonBare,16));
 // engine cover fin
 const fin=new THREE.Shape();fin.moveTo(0,0);fin.lineTo(1.25,0);fin.lineTo(1.38,.2);fin.lineTo(.65,.17);fin.closePath();
 const finGeo=new THREE.ExtrudeGeometry(fin,{depth:.006,bevelEnabled:false});finGeo.rotateY(Math.PI/2);finGeo.translate(-.003,0,0);
 add(root,mesh(finGeo,paintNavy,[0,.76,-2.56],[-.25,0,0]));

 /* ---- cockpit ---- */
 const seat=mesh(loft([{z:-1.62,top:.47,bot:.28,w:.205,p:3},{z:-1.86,top:.56,bot:.28,w:.225,p:3.2},{z:-2.02,top:.72,bot:.3,w:.235,p:3.2}],{steps:16,around:40}),pad);add(root,seat);
 add(root,box(.26,.2,.1,pad,[0,.76,-2.03],.04));
 for(const s of [-1,1])add(root,box(.09,.16,.34,pad,[s*.2,.69,-1.92],.035));
 const yoke=new THREE.Group();yoke.position.set(0,.61,-1.42);yoke.rotation.x=.42;yoke.userData.moving=true;add(root,yoke);
 add(yoke,box(.27,.1,.03,carbonBare,[0,0,0],.018));
 for(const s of [-1,1])add(yoke,box(.05,.13,.042,pad,[s*.145,.01,0],.018));
 add(yoke,box(.11,.05,.008,mat('#0d1a22',.2),[0,.014,-.018],.004));
 // Coloured rotary switches and shift lights give the wheel a readable cockpit face.
 const switchRed=mat('#bf4d3f',.4),switchBlue=mat('#65a8ad',.4),switchGold=mat('#d7aa5f',.4);
 for(const [x,y,m] of [[-.092,.02,switchRed],[.092,.02,switchBlue],[-.075,-.027,switchGold],[.075,-.027,switchRed]])
  add(yoke,mesh(new THREE.SphereGeometry(.008,10,8),m,[x,y,-.024]));
 for(let i=0;i<5;i++)add(yoke,box(.012,.005,.004,i<3?switchBlue:switchRed,[-.036+i*.018,.049,-.024],.002));
 add(root,bar([0,.57,-1.36],[0,.5,-1.12],.016,titanium));
 // halo
 add(root,tube([[-.285,.745,-2.13],[-.31,.86,-1.95],[-.305,.945,-1.66],[-.235,.985,-1.34],[0,1.005,-1.17],[.235,.985,-1.34],[.305,.945,-1.66],[.31,.86,-1.95],[.285,.745,-2.13]],.034,paintNavy,{segments:90,sides:14}));
 add(root,tube([[0,1.005,-1.17],[0,.93,-1.09],[0,.8,-1.02],[0,.69,-.98]],.033,paintNavy,{segments:40,sides:20}));

 /* ---- mirrors ---- */
 for(const s of [-1,1]){
  add(root,blade([s*.3,.66,-1.0],[s*.5,.73,-1.09],.022,.006,carbonBare));
  add(root,box(.2,.075,.07,paintWine,[s*.56,.735,-1.1],.026,[0,s*.1,0]));
  const glass=mesh(new THREE.PlaneGeometry(.17,.058),new THREE.MeshPhysicalMaterial({color:'#9ca6ad',metalness:1,roughness:.08}),[s*.56,.735,-1.138],[0,Math.PI+s*.1,0]);add(root,glass);
 }

 /* ---- wheels, brakes and suspension ---- */
 const rubberMap=canvasTexture(2048,512,(g,w,h)=>{
  const R=rng(5150);g.fillStyle='#2b2a2a';g.fillRect(0,0,w,h);
  for(let i=0;i<34000;i++){const l=R();g.fillStyle=l>.7?`rgba(150,136,116,${.1+R()*.3})`:`rgba(0,0,0,${.2*R()})`;g.fillRect(R()*w,R()*h,1+R()*3.4,1+R()*2.2)}
  // the rubbed-in band of the tread
  const tr=g.createLinearGradient(0,h*.28,0,h*.72);tr.addColorStop(0,'rgba(0,0,0,0)');tr.addColorStop(.5,'rgba(70,64,56,.42)');tr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=tr;g.fillRect(0,0,w,h);
  for(let i=0;i<420;i++){const x=R()*w,y=h*(.2+R()*.6),l=10+R()*60;g.strokeStyle=`rgba(${R()>.5?'165,150,126':'8,8,8'},${.1+R()*.3})`;g.lineWidth=1+R()*3;g.beginPath();g.moveTo(x,y);g.lineTo(x+R()*6,y+l*.3);g.stroke()}
  // crazing and dust down each shoulder
  for(const band of [.12,.88])for(let i=0;i<300;i++){const x=R()*w,y=h*(band+(R()-.5)*.19);g.strokeStyle=`rgba(190,174,148,${.08+R()*.28})`;g.lineWidth=.7+R()*1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*44,y+(R()-.5)*24);g.stroke()}
 });
 const rubberBump=canvasTexture(1024,256,(g,w,h)=>{const R=rng(77);g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const v=R()>.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${.14*R()})`;g.fillRect(R()*w,R()*h,1+R()*3,1+R()*2)}},{srgb:false});
 const rubber=new THREE.MeshStandardMaterial({map:rubberMap,bumpMap:rubberBump,bumpScale:.012,roughness:.78,envMapIntensity:.8});
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#2a2c31',roughness:.34,metalness:.85,clearcoat:.3});
 const disc=new THREE.MeshStandardMaterial({color:'#25262a',roughness:.55,metalness:.4});

 function tyreGeometry(radius,width){
  const r0=.22,w=width/2,pts=[
   [r0,-w*.78],[r0+.012,-w*.82],[r0+.03,-w*.95],[radius*.8,-w*1.0],[radius*.91,-w*.99],[radius*.965,-w*.92],[radius*.992,-w*.78],[radius,-w*.5],[radius*1.002,0],
   [radius,w*.5],[radius*.992,w*.78],[radius*.965,w*.92],[radius*.91,w*.99],[radius*.8,w*1.0],[r0+.03,w*.95],[r0+.012,w*.82],[r0,w*.78]
  ].map(([r,y])=>new THREE.Vector2(r,y));
  const curve=new THREE.SplineCurve(pts);
  return new THREE.LatheGeometry(curve.getPoints(44),72);
 }
 function wheel(radius,width,sign){
  const outer=new THREE.Group(),g=new THREE.Group(),w=width;outer.add(g);outer.userData.moving=true;g.userData.moving=true;outer.userData.spin=g;
  const tyre=mesh(tyreGeometry(radius,w),rubber);tyre.rotation.z=Math.PI/2;g.add(tyre);
  // rim barrel
  const barrel=mesh(new THREE.LatheGeometry([[.222,-w*.42],[.226,-w*.46],[.214,-w*.48],[.2,-w*.42],[.196,w*.1],[.2,w*.42],[.214,w*.48],[.226,w*.46],[.222,w*.42]].map(([r,y])=>new THREE.Vector2(r,y)),96),rimMat);barrel.rotation.z=Math.PI/2;barrel.material=rimMat.clone();barrel.material.side=THREE.DoubleSide;g.add(barrel);
  // ten spokes, slightly dished, on the outer face
  const face=sign*w*.36,hub=sign*w*.22;
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;
   const spoke=blade([face-sign*.012,Math.cos(a)*.205,Math.sin(a)*.205],[hub,Math.cos(a+.06)*.06,Math.sin(a+.06)*.06],.019,.008,rimMat);g.add(spoke);
  }
  const hubM=mesh(new THREE.CylinderGeometry(.068,.08,.08,32),rimMat,[hub-sign*.02,0,0],[0,0,sign*Math.PI/2]);g.add(hubM);
  const nut=mesh(new THREE.CylinderGeometry(.031,.036,.05,6),brass,[hub+sign*.035,0,0],[0,0,Math.PI/2]);g.add(nut);
  add(g,mesh(new THREE.CylinderGeometry(.012,.012,.056,12),steel,[hub+sign*.04,0,0],[0,0,Math.PI/2]));
  // brake: drum and disc behind the spokes
  const inner=-sign*w*.12;
  add(outer,mesh(new THREE.CylinderGeometry(.17,.17,.03,64),disc,[inner,0,0],[0,0,Math.PI/2]));
  add(outer,mesh(new THREE.CylinderGeometry(.188,.195,w*.42,48,1,true),carbonBare,[-sign*w*.28,0,0],[0,0,Math.PI/2]));
  add(outer,box(.05,.1,.17,mat('#7d1f1f',.4),[inner,.13,.05],.012));
  return outer;
 }
 const axles=[{z:0,x:.82,r:.356,w:.305,y:.356},{z:-3.6,x:.8,r:.362,w:.405,y:.362}],fronts=[],spins=[];
 for(const a of axles)for(const s of [-1,1]){
  const w=wheel(a.r,a.w,s);w.position.set(s*a.x,a.y,a.z);if(a.z===0)fronts.push(w);spins.push(w.userData.spin);add(root,w);
  const out=s*(a.x-a.w*.5+.01);
  const wish=(y,inFront,inBack,chord)=>{add(root,blade([s*Math.abs(inFront[0]),inFront[1],inFront[2]],[out,y,a.z+.015],chord,.0085,steel));add(root,blade([s*Math.abs(inBack[0]),inBack[1],inBack[2]],[out,y,a.z-.015],chord,.0085,steel))};
  if(a.z===0){
   wish(.5,[.16,.47,.28],[.16,.5,-.32],.016);wish(.2,[.13,.22,.34],[.14,.22,-.34],.016);
   add(root,bar([out,.22,a.z],[s*.17,.5,a.z-.03],.0115,steel,12));
   add(root,bar([out,.33,a.z+.09],[s*.15,.3,a.z+.14],.0095,titanium,12));
   // brake duct
   add(root,mesh(new THREE.CylinderGeometry(.13,.11,.1,32),carbonBare,[s*(a.x-a.w*.5-.05),.356,a.z],[0,0,Math.PI/2]));
  }else{
   wish(.56,[.13,.52,-3.3],[.1,.52,-3.92],.015);wish(.22,[.13,.27,-3.25],[.1,.27,-3.95],.015);
   add(root,bar([out,.54,a.z],[s*.12,.25,a.z+.14],.0115,steel,12));
   add(root,bar([s*.09,.34,-3.6],[out,.34,-3.6],.021,titanium,16));
   add(root,mesh(new THREE.CylinderGeometry(.14,.12,.12,32),carbonBare,[s*(a.x-a.w*.5-.05),.362,a.z],[0,0,Math.PI/2]));
  }
  // upright
  add(root,box(.06,.36,.09,titanium,[s*(a.x-a.w*.5-.03),a.y,a.z],.018));
 }
 // gearbox behind the engine
 add(root,mesh(loft([{z:-3.1,top:.45,bot:.2,w:.14,p:3},{z:-3.7,top:.42,bot:.22,w:.1,p:3},{z:-4.0,top:.4,bot:.26,w:.07,p:3}],{steps:20,around:32}),titanium));

 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 root.userData.parts={tyreGeometry,rubber,fronts,spins,yoke,flap};
 root.userData.playFor=2.6;
 /* hover: the front wheels turn in and the rear flap opens. Click: the wheels spin up. */
 root.userData.play=(h,p,dt)=>{
  const steer=h*.25;fronts.forEach(w=>{w.rotation.y=steer});yoke.rotation.z=-steer*1.8;flap.rotation.x=-h*.62;
  const speed=p<2.6?26*Math.max(0,1-p/2.6):0;spins.forEach(w=>{w.rotation.x-=speed*dt});
 };
 return root;
};
