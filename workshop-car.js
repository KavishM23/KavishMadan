/* A late-1980s single-seater inspired by the McLaren MP4/4.
   Coordinates are metres: +z is forward, the front axle is at z=0. */
Workshop.car=function(THREE,kit,tyres=Workshop.carTyres(THREE,kit)){
 const {loft,wing,foil,bar,blade,mesh,box,add,worn,canvasTexture,rng,lerp}=kit;
 const WHITE='#eee9dd',RED='#cf3429',DARK='#17191a';
 const Z0=-3.8,Z1=1.5,XW=1.15,YH=1.4;
 const zx=(z,w)=>(z-Z0)/(Z1-Z0)*w;
 // Paint is projected onto the finished shell, so the graphics follow its curves.
 const side=canvasTexture(4096,1024,(g,w,h)=>{
  const X=z=>zx(z,w),Y=y=>h-y/YH*h;
  g.fillStyle=WHITE;g.fillRect(0,0,w,h);
  const poly=pts=>{g.fillStyle=RED;g.beginPath();pts.forEach(([z,y],i)=>i?g.lineTo(X(z),Y(y)):g.moveTo(X(z),Y(y)));g.closePath();g.fill()};
  poly([[-.7,.65],[-1.14,.65],[-1.48,.08],[-1.05,.08]]);
  poly([[-2.58,.72],[-3.45,.6],[-3.6,.08],[-2.9,.08]]);
  g.fillStyle='#202122';g.textAlign='center';g.font='italic 800 105px Georgia,serif';g.fillText('KAVISH',X(-2.12),Y(.35));
  g.font='700 42px "IBM Plex Mono",monospace';g.fillText('MADAN',X(-2.12),Y(.25));
  g.strokeStyle='rgba(32,32,32,.2)';g.lineWidth=2;for(const z of [-1.18,-2.75]){g.beginPath();g.moveTo(X(z),Y(.53));g.lineTo(X(z),Y(.14));g.stroke()}
 },{scale:.6});
 const top=canvasTexture(4096,1024,(g,w,h)=>{
  const X=z=>zx(z,w),Y=x=>h-x/XW*h;
  g.fillStyle=WHITE;g.fillRect(0,0,w,h);
  const poly=pts=>{g.fillStyle=RED;g.beginPath();pts.forEach(([z,x],i)=>i?g.lineTo(X(z),Y(x)):g.moveTo(X(z),Y(x)));g.closePath();g.fill()};
  poly([[.38,0],[-.16,.33],[-.74,.33],[-.36,0]]);
  poly([[-2.65,0],[-2.8,1.1],[-3.5,1.1],[-3.45,0]]);
 },{scale:.6});
 const body=worn({roughness:.32,clearcoat:.75,clearcoatRoughness:.18,envMapIntensity:1.05},{dirt:.2,scale:.9,top,side,box:[Z0,Z1,XW,YH]});
 const white=worn({color:WHITE,roughness:.35,clearcoat:.65,clearcoatRoughness:.2},{dirt:.18});
 const red=worn({color:RED,roughness:.32,clearcoat:.65,clearcoatRoughness:.2},{dirt:.18});
 const black=new THREE.MeshStandardMaterial({color:'#141617',roughness:.7});
 const carbon=new THREE.MeshStandardMaterial({color:'#282b2c',roughness:.62,metalness:.15});
 const steel=new THREE.MeshPhysicalMaterial({color:'#a8aaab',roughness:.3,metalness:.9});
 const titanium=new THREE.MeshPhysicalMaterial({color:'#777b7c',roughness:.38,metalness:.8});
 const pad=new THREE.MeshStandardMaterial({color:'#242222',roughness:.85});
 const brass=new THREE.MeshPhysicalMaterial({color:'#a98f64',roughness:.3,metalness:.9});
 const mat=(c,r,me=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:me});
 const root=new THREE.Group();

 /* Central monocoque: low nose, deep open cockpit, and a continuous tail. */
 const chassis=[
  {z:1.20,top:.23,bot:.12,w:.11,p:3},{z:.8,top:.29,bot:.12,w:.16,p:3},
  {z:.30,top:.38,bot:.12,w:.21,p:3},{z:-.35,top:.47,bot:.12,w:.26,p:3},
  {z:-.78,top:.54,bot:.12,w:.31,p:3,nd:.02,nw:.16},
  {z:-1.05,top:.57,bot:.12,w:.34,p:3,nd:.19,nw:.22},
  {z:-1.38,top:.59,bot:.12,w:.35,p:3,nd:.27,nw:.24},
  {z:-1.68,top:.64,bot:.12,w:.34,p:3,nd:.25,nw:.23},
  {z:-1.94,top:.79,bot:.12,w:.3,p:3,nd:.09,nw:.19},
  {z:-2.12,top:.98,bot:.12,w:.27,p:3},{z:-2.4,top:1.0,bot:.12,w:.25,p:3},
  {z:-2.8,top:.82,bot:.13,w:.21,p:3},{z:-3.2,top:.58,bot:.15,w:.16,p:3},
  {z:-3.55,top:.42,bot:.17,w:.10,p:3}
 ];
 add(root,mesh(loft(chassis,{steps:100,around:60}),body));
 // Full-width flat floor, with the rounded radiator sidepods connected to it.
 add(root,box(1.65,.045,2.35,carbon,[0,.095,-1.9],.015));
 for(const s of [-1,1]){
  const pod=[
   {z:-.78,top:.47,bot:.13,w:.25,p:4,cx:s*.62},{z:-.88,top:.55,bot:.12,w:.31,p:4,cx:s*.62},
   {z:-1.35,top:.56,bot:.12,w:.33,p:4,cx:s*.62},{z:-2.1,top:.55,bot:.12,w:.33,p:4,cx:s*.61},
   {z:-2.55,top:.50,bot:.12,w:.29,p:4,cx:s*.56},{z:-2.98,top:.39,bot:.13,w:.20,p:3.5,cx:s*.45},
   {z:-3.30,top:.30,bot:.14,w:.09,p:3,cx:s*.28}
  ];
  add(root,mesh(loft(pod,{steps:54,around:40}),body));
  // Radiator mouth and lip are set into the forward face of the sidepod.
  add(root,box(.49,.26,.018,white,[s*.62,.34,-.775],.025));
  add(root,box(.42,.19,.022,black,[s*.62,.34,-.763],.018));
  for(let i=-3;i<=3;i++)add(root,box(.006,.16,.004,titanium,[s*.62+i*.052,.34,-.748],.001));
 }
 // Small integral roll hoop behind the headrest, with no modern halo.
 add(root,bar([-.105,.69,-1.99],[-.095,.99,-2.04],.018,carbon));
 add(root,bar([.105,.69,-1.99],[.095,.99,-2.04],.018,carbon));
 add(root,bar([-.095,.99,-2.04],[.095,.99,-2.04],.018,carbon));

 /* Open cockpit: seat, wheel and a column anchored into the nose. */
 add(root,box(.37,.055,.55,pad,[0,.31,-1.43],.025));
 add(root,box(.36,.28,.075,pad,[0,.47,-1.76],.025,[.16,0,0]));
 const yoke=new THREE.Group();yoke.userData.moving=true;yoke.position.set(0,.48,-1.04);yoke.rotation.x=.24;add(root,yoke);
 add(yoke,mesh(new THREE.TorusGeometry(.12,.014,10,40),black));
 add(yoke,box(.22,.035,.018,black,[0,0,0],.008));
 add(yoke,mesh(new THREE.CylinderGeometry(.025,.025,.018,16),steel,[0,0,0],[Math.PI/2,0,0]));
 add(root,bar([0,.47,-1.025],[0,.40,-.82],.015,titanium));
 // Period mirrors grow from brackets fixed to the side of the monocoque.
 for(const s of [-1,1]){
  add(root,bar([s*.28,.52,-1.05],[s*.47,.59,-1.08],.012,carbon));
  add(root,box(.17,.065,.085,red,[s*.52,.60,-1.08],.018));
 }

 /* Single broad front wing and a two-plane, tall rear wing. */
 const mainWing=wing(s=>({x:s*.97,y:.14,z:1.24,chord:.48,aoa:.08}),{steps:60,outline:foil(18,.1,.025)});
 add(root,mesh(mainWing,white));
 const flapWing=wing(s=>({x:s*.9,y:.205,z:1.035,chord:.17,aoa:.32}),{steps:54,outline:foil(18,.09,.025)});
 add(root,mesh(flapWing,white));
 for(const s of [-1,1]){
  add(root,box(.025,.24,.55,white,[s*.965,.19,1.17],.016));
  // Uprights bridge the nose underside to the centre of the wing.
  add(root,box(.04,.10,.24,carbon,[s*.075,.155,1.05],.008));
  add(root,box(.045,.50,.58,red,[s*.55,.92,-3.56],.015));
  // Each wing support reaches from the gearbox to the rear-wing lower plane.
  add(root,bar([s*.12,.35,-3.40],[s*.12,.77,-3.53],.018,carbon));
 }
 const rear=(y,z,chord,aoa,m)=>mesh(wing(s=>({x:s*.55,y,z,chord,aoa}),{steps:50,outline:foil(20,.1,.025)}),m);
 add(root,rear(.78,-3.55,.30,.12,white));
 // The original car predates DRS; keep the upper rear plane fixed.
 add(root,rear(1.13,-3.60,.30,.16,white));
 const flap=new THREE.Group();flap.userData.moving=true;add(root,flap);
 add(root,box(.24,.17,.60,carbon,[0,.27,-3.27],.025)); // gearbox ties the rear assembly to the chassis
 add(root,box(.08,.04,.02,mat('#9c3029',.4),[0,.34,-3.585],.004));

 /* Wheels, tyres, brakes and suspension */
 const {tyreGeometry,rubber,letteredRubber}=tyres;
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#2a2c31',roughness:.34,metalness:.85,clearcoat:.3});
 const disc=new THREE.MeshStandardMaterial({color:'#25262a',roughness:.55,metalness:.4});

 function wheel(radius,width,sign){
  const outer=new THREE.Group(),g=new THREE.Group(),w=width;outer.add(g);outer.userData.moving=true;g.userData.moving=true;outer.userData.spin=g;
  const tyre=mesh(tyreGeometry(radius,w),letteredRubber(radius,w));tyre.rotation.z=Math.PI/2;g.add(tyre);
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
  // A machined lip makes the rim read as a separate part from the tyre.
  add(g,mesh(new THREE.TorusGeometry(.205,.004,8,64),steel,[face,0,0],[0,Math.PI/2,0]));
  // brake: drum and disc behind the spokes
  const inner=-sign*w*.12;
  add(outer,mesh(new THREE.CylinderGeometry(.17,.17,.03,64),disc,[inner,0,0],[0,0,Math.PI/2]));
  add(outer,mesh(new THREE.CylinderGeometry(.188,.195,w*.42,48,1,true),carbon,[-sign*w*.28,0,0],[0,0,Math.PI/2]));
  add(outer,box(.05,.1,.17,mat('#7d1f1f',.4),[inner,.13,.05],.012));
  return outer;
 }
 const axles=[{z:0,x:.91,r:.356,w:.32,y:.356},{z:-3.0,x:.84,r:.37,w:.46,y:.37}],fronts=[],spins=[];
 for(const a of axles)for(const s of [-1,1]){
  const wheelUnit=wheel(a.r,a.w,s);wheelUnit.position.set(s*a.x,a.y,a.z);if(a.z===0)fronts.push(wheelUnit);spins.push(wheelUnit.userData.spin);add(root,wheelUnit);
  // Each wishbone shares a ball joint on a real upright. The inboard ends
  // terminate on reinforced brackets at the monocoque or gearbox.
  const uprightX=s*(a.x-a.w*.5-.025),upper=[uprightX,a.y+.14,a.z],lower=[uprightX,a.y-.14,a.z];
  add(root,box(.08,.32,.12,titanium,[uprightX,a.y,a.z],.018));
  add(root,bar([uprightX,a.y,a.z],[s*a.x,a.y,a.z],.026,titanium,14));
  const front=a.z===0;
  const upperFront=[s*(front?.18:.15),front?.42:.48,a.z+.28];
  const upperRear=[s*(front?.20:.15),front?.43:.48,a.z-.27];
  const lowerFront=[s*(front?.18:.13),front?.19:.23,a.z+.30];
  const lowerRear=[s*(front?.20:.13),front?.19:.23,a.z-.28];
  for(const [p,j] of [[upperFront,upper],[upperRear,upper],[lowerFront,lower],[lowerRear,lower]]){
   add(root,bar(p,j,.011,carbon,10));
   add(root,mesh(new THREE.SphereGeometry(.018,10,8),titanium,p));
  }
  for(const p of [upper,lower])add(root,mesh(new THREE.SphereGeometry(.021,12,8),titanium,p));
  // A front pullrod or rear pushrod runs between the upright and chassis.
  const inner=[s*(front?.17:.14),front?.25:.41,a.z+.06],outer=front?upper:lower;
  add(root,bar(inner,outer,.009,titanium,10));
  add(root,mesh(new THREE.SphereGeometry(.016,10,8),titanium,inner));
 }
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 root.userData.parts={tyreGeometry,rubber,letteredRubber,fronts,spins,yoke,flap};
 root.userData.playFor=2.6;
 root.userData.play=(h,p,dt)=>{
  const steer=h*.12;fronts.forEach(w=>{w.rotation.y=steer});yoke.rotation.z=-steer*1.8;
  const speed=p<2.6?26*Math.max(0,1-p/2.6):0;spins.forEach(w=>{w.rotation.x-=speed*dt});
 };
 return root;
};

// The spare in the room shares the tyre materials, even when the detailed car loads.
Workshop.carTyres=function(THREE,{canvasTexture,rng}){
 /* Wheels, tyres, brakes and suspension */
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
 // Paint the sidewall lettering in the tyre shader, on the rubber itself.
 // There is no transparent decal plane to cast a rectangular shadow or AO border.
 const tyreInk=canvasTexture(1024,1024,(g,w,h)=>{
  g.clearRect(0,0,w,h);g.translate(w/2,h/2);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#e2dcd0';g.font='700 46px "IBM Plex Mono",monospace';
  const text='KAVISH  •  WORKSHOP  •  RACING  •  ',radius=w*.41;let angle=-Math.PI/2;
  for(const ch of text){const advance=g.measureText(ch).width/radius;g.save();g.rotate(angle+advance/2);g.translate(0,-radius);g.fillText(ch,0,0);g.restore();angle+=advance}
 });
 function letteredRubber(radius,width){
  const material=rubber.clone();
  material.onBeforeCompile=shader=>{
   shader.uniforms.tyreInk={value:tyreInk};shader.uniforms.tyreRadius={value:radius};shader.uniforms.tyreWidth={value:width};
   shader.vertexShader='varying vec3 vTyrePosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTyrePosition = position;');
   shader.fragmentShader='uniform sampler2D tyreInk;\nuniform float tyreRadius;\nuniform float tyreWidth;\nvarying vec3 vTyrePosition;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec2 inkUv = vTyrePosition.xz / (2.0 * tyreRadius) + vec2(0.5);
    vec4 ink = texture2D(tyreInk, inkUv);
    float side = smoothstep(tyreWidth * .37, tyreWidth * .46, abs(vTyrePosition.y));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.78,.75,.69), ink.a * side * .9);`);
  };
  material.customProgramCacheKey=()=> 'workshop-tyre-lettering-v1';
  return material;
 }
 function tyreGeometry(radius,width){
  const r0=.22,w=width/2,pts=[
   [r0,-w*.78],[r0+.012,-w*.82],[r0+.03,-w*.95],[radius*.8,-w*1.0],[radius*.91,-w*.99],[radius*.965,-w*.92],[radius*.992,-w*.78],[radius,-w*.5],[radius*1.002,0],
   [radius,w*.5],[radius*.992,w*.78],[radius*.965,w*.92],[radius*.91,w*.99],[radius*.8,w*1.0],[r0+.03,w*.95],[r0+.012,w*.82],[r0,w*.78]
  ].map(([r,y])=>new THREE.Vector2(r,y));
  const curve=new THREE.SplineCurve(pts);
  return new THREE.LatheGeometry(curve.getPoints(44),72);
 }
 return {tyreGeometry,rubber,letteredRubber};
};
