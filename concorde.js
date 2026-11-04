/* The intro: a Concorde flies one smooth sweeping curve past the viewer. Its attitude comes from the path, as a real
   aeroplane's does: the nose follows the direction of travel and the bank comes from how hard it is turning.
   Dimensions are in metres, nose along +Z, port wing along +X. Everything is removed once it has flown. */
window.createConcordeFlight=function({THREE,scene,camera,sun,restoreSun,anisotropy=4}){
 const canvasOf=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const tex=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t};
 const seeded=s=>()=>(s=(s*16807)%2147483647)/2147483647;
 const NAVY='#0d0d0d',CLAY='#eb5939',SHELL='#d9cfbf',GLASS='#0a0a0a';
 const FONT='"League Spartan", Arial, sans-serif';

 // ---------- paint ----------
 const ZN=31,ZT=-31,LEN=ZN-ZT,uOf=z=>(z-ZT)/LEN;
 const bodyMap=()=>canvasOf(4096,1024,(g,w,h)=>{
  const U=z=>uOf(z)*w,rand=seeded(23);g.fillStyle=SHELL;g.fillRect(0,0,w,h);
  for(let i=0;i<7000;i++){g.fillStyle=`rgba(40,50,60,${rand()*.02})`;g.fillRect(rand()*w,rand()*h,3,3)}
  // panel lines
  g.strokeStyle='rgba(40,52,64,.16)';g.lineWidth=2;for(let z=-28;z<28;z+=4){g.beginPath();g.moveTo(U(z),h*.04);g.lineTo(U(z),h*.96);g.stroke()}
  // the long rows either side: a thin cheatline, the cabin windows and the name above them.
  // Seen from outside the port side (+X) reads mirrored and the starboard side upside down.
  for(const s of [{y:.693,port:true},{y:.307,port:false}]){const Y=f=>h*(s.port?f:1-f);
   g.fillStyle=NAVY;g.fillRect(U(-24),Y(.76)-5,U(22)-U(-24),10);g.fillStyle=CLAY;g.fillRect(U(-24),Y(.782)-3,U(22)-U(-24),6);
   g.fillStyle=GLASS;for(let z=-15;z<19.5;z+=.52)if(Math.abs(z+1.5)>.7)g.fillRect(U(z),Y(.693)-8,8,17);
   const label=(txt,z,size,f,fill,spread=0)=>{g.save();g.translate(U(z),Y(f));g.scale(s.port?-.59:.59,s.port?1:-1);g.font=`800 ${size}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=fill;if('letterSpacing' in g)g.letterSpacing=spread+'px';g.fillText(txt,0,0);g.restore()};
   label('KAVISH MADAN',3,104,.625,NAVY,10);label('G-KMAD',-19.5,50,.625,'#7f766a',4)}
  // flight deck glazing and the black radome tip
  g.fillStyle=GLASS;g.fillRect(U(21.6),h*.38,U(23.4)-U(21.6),h*.24);
  g.fillStyle=SHELL;for(const y of [.46,.54])g.fillRect(U(21.6),h*y-5,U(23.4)-U(21.6),10);g.fillRect(U(22.4)-3,h*.38,6,h*.24);
  g.fillStyle='#22282e';g.fillRect(U(29.7),0,w-U(29.7),h);
 });
 const wingMap=()=>canvasOf(2048,1024,(g,w,h)=>{g.fillStyle=SHELL;g.fillRect(0,0,w,h);const r=seeded(5);for(let i=0;i<3000;i++){g.fillStyle=`rgba(40,50,60,${r()*.02})`;g.fillRect(r()*w,r()*h,3,3)}
  g.strokeStyle='rgba(40,52,64,.17)';g.lineWidth=2;for(let f=.12;f<1;f+=.11){g.beginPath();g.moveTo(w*f,0);g.lineTo(w*f,h);g.stroke()}for(let f=.1;f<1;f+=.13){g.beginPath();g.moveTo(0,h*f);g.lineTo(w,h*f);g.stroke()}
  // elevon hinge line and the breaks between them
  g.strokeStyle='rgba(20,45,67,.5)';g.lineWidth=4;g.beginPath();g.moveTo(0,h*.905);g.lineTo(w,h*.905);g.stroke();[.3,.62].forEach(f=>{g.beginPath();g.moveTo(w*f,h*.905);g.lineTo(w*f,h);g.stroke()})});
 const finMap=()=>canvasOf(512,512,(g,w,h)=>{g.fillStyle=NAVY;g.fillRect(0,0,w,h);g.fillStyle=SHELL;g.beginPath();g.moveTo(0,h*.26);g.quadraticCurveTo(w*.5,h*.46,w,h*.1);g.lineTo(w,h*.2);g.quadraticCurveTo(w*.5,h*.58,0,h*.4);g.closePath();g.fill();g.fillStyle=CLAY;g.beginPath();g.moveTo(0,h*.42);g.quadraticCurveTo(w*.5,h*.6,w,h*.22);g.lineTo(w,h*.27);g.quadraticCurveTo(w*.5,h*.68,0,h*.5);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=2;g.beginPath();g.moveTo(0,h*.72);g.lineTo(w,h*.72);g.stroke()});

 // ---------- geometry helpers ----------
 function surface(rows,cols,at,uv){const p=[],t=[],idx=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const v=at(i/rows,j/cols);p.push(v.x,v.y,v.z);const q=uv(i/rows,j/cols,v);t.push(q[0],q[1])}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(t,2));g.setIndex(idx);g.computeVertexNormals();return g}
 const naca=x=>5*(.2969*Math.sqrt(Math.max(0,x))-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
 const skins=make=>{const top=make(1),bottom=make(-1);bottom.index.array.reverse();bottom.computeVertexNormals();return{top,bottom}};
 const table=pts=>x=>{for(let i=1;i<pts.length;i++)if(x<=pts[i][0]){const f=(x-pts[i-1][0])/(pts[i][0]-pts[i-1][0]),q=f*f*(3-2*f)*.35+f*.65;return pts[i-1][1]+(pts[i][1]-pts[i-1][1])*q}return pts[pts.length-1][1]};

 // ---------- the aeroplane ----------
 const plane=new THREE.Group();
 const skin=m=>new THREE.MeshPhysicalMaterial({color:0xcfcdc6,roughness:.4,metalness:.02,clearcoat:.4,clearcoatRoughness:.3,envMapIntensity:.42,side:THREE.DoubleSide,...m});
 const dark=new THREE.MeshStandardMaterial({color:0x0d1014,roughness:.6,metalness:.4});
 const nozzle=new THREE.MeshStandardMaterial({color:0x4a4e54,roughness:.34,metalness:.95,side:THREE.DoubleSide});
 const add=(g,m,p=plane,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};

 // fuselage: a slim circular tube, drawn out to a needle at the nose and a cone at the tail
 const radius=table([[-31,.04],[-28.5,.5],[-25,1.02],[-20,1.36],[-14,1.45],[14,1.45],[19,1.36],[22,1.17],[25,.88],[28,.5],[30,.2],[31,.02]]);
 const centre=table([[-31,.62],[-22,.14],[-12,0],[16,0],[24,-.07],[31,-.2]]);
 const body=surface(150,64,(u,v)=>{const z=ZT+u*LEN,r=radius(z),a=v*Math.PI*2;return new THREE.Vector3(r*Math.sin(a),centre(z)-r*Math.cos(a),z)},(u,v)=>[u,v]);
 {const n=body.attributes.normal,cols=65;for(let i=0;i*cols<n.count;i++){const a=i*cols,b=a+64,x=n.getX(a)+n.getX(b),y=n.getY(a)+n.getY(b),z=n.getZ(a)+n.getZ(b),l=Math.hypot(x,y,z)||1;n.setXYZ(a,x/l,y/l,z/l);n.setXYZ(b,x/l,y/l,z/l)}}
 add(body,skin({map:tex(bodyMap())}));

 // ogival delta wing: the leading edge runs out in that long S-curve; the trailing edge is nearly straight
 const B=12.8,le=table([[0,16],[1.4,13.2],[3,7.4],[5,-.8],[7,-7],[9,-12.4],[11,-17.8],[12.3,-21.4],[12.8,-23.4]]),te=x=>-24.2+x*.07,ZMAX=16,ZMIN=-24.2;
 const wy=x=>-.92-.0075*x*x;                                                           // a slight droop out to the tips
 const wing=skins(sign=>surface(70,30,(u,v)=>{const x=B*Math.pow(u,1.1)*.9995,lead=le(x),trail=te(x),c=Math.max(.02,lead-trail),f=(1-Math.cos(v*Math.PI))/2,th=.032-.012*(x/B);
   const camber=-.022*c*Math.max(0,1-f*3.2)*Math.pow(x/B,.6);                          // the leading edge droops, more towards the tip
   return new THREE.Vector3(x,wy(x)+camber+sign*c*th*naca(f)*.5,lead-f*c)},(u,v,p)=>[p.x/B,(p.z-ZMIN)/(ZMAX-ZMIN)]));
 const wingMat=skin({map:tex(wingMap())});

 // twin-engine nacelle: a rounded box slung under the wing, with the slanted intake wedge at the front
 const nacY=table([[0,-2.72],[.45,-2.74],[1,-2.2]]),NW=1.72,NZ=-3.2,NE=-24;
 const nacelle=surface(40,40,(u,v)=>{const a=v*Math.PI*2,sx=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.38),cy=Math.sign(-Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.38);
   const top=-.95,bot=nacY(u),y=(top+bot)/2+(top-bot)/2*cy,front=NZ-(y-top)*-1.5;return new THREE.Vector3(NW*sx,y,front+(NE-front)*u)},(u,v)=>[u,v]);
 const nacMat=skin({color:0xbfbdb7,roughness:.46});
 for(const sd of [1,-1]){const h=new THREE.Group();h.scale.x=sd;plane.add(h);add(wing.top,wingMat,h);add(wing.bottom,wingMat,h);
  const n=new THREE.Group();n.position.x=4.5;h.add(n);add(nacelle,nacMat,n);
  // intake mouths and the splitter between them, slanted with the wedge
  const mouth=new THREE.PlaneGeometry(1.5,1.62);for(const x of [-.84,.84]){const m=add(mouth,dark,n,x,-1.85,-4.36);m.rotation.x=.59}
  const split=add(new THREE.BoxGeometry(.1,1.8,.1),nacMat,n,0,-1.85,-4.3);split.rotation.x=.59;
  for(const x of [-.86,.86]){const noz=add(new THREE.CylinderGeometry(.68,.8,2.5,36,1,true),nozzle,n,x,-1.56,-25);noz.rotation.x=Math.PI/2;add(new THREE.CircleGeometry(.7,36),dark,n,x,-1.56,-25.6).rotation.y=Math.PI}}

 // the tall swept fin
 const fin=skins(sign=>surface(30,18,(u,v)=>{const y=1.15+u*6.5,lead=-15.2-u*11.8,trail=-28.7-u*.5,c=lead-trail,f=(1-Math.cos(v*Math.PI))/2;return new THREE.Vector3(sign*c*.04*naca(f)*.5,y,lead-f*c)},(u,v)=>[u,v]));
 const finMat=skin({map:tex(finMap())});add(fin.top,finMat);add(fin.bottom,finMat);

 plane.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});

 // ---------- contrails: two ribbons drawn from the path itself ----------
 const TRAIL=44,trailMat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const makeTrail=()=>{const g=new THREE.BufferGeometry(),n=TRAIL*2;g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(n*4),4));const idx=[];for(let i=0;i<TRAIL-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(idx);const m=new THREE.Mesh(g,trailMat);m.frustumCulled=false;m.renderOrder=1;scene.add(m);return m};
 const trails=[makeTrail(),makeTrail()];

 // ---------- clouds: they stay where they are, as clouds do, with a very slow drift ----------
 const cloudMat=new THREE.MeshStandardMaterial({color:0x4a453e,roughness:1,envMapIntensity:.45,transparent:true,opacity:.5,depthWrite:false});
 const cloudDepth=new THREE.MeshBasicMaterial({colorWrite:false});   // one soft shape rather than overlapping bubbles
 function cloud(seed){const r=seeded(seed),g=new THREE.Group();for(let i=0;i<9;i++){const geo=new THREE.SphereGeometry(.5+r()*.6,24,16),x=(i-4)*.62+r()*.2,y=(r()-.5)*.5,z=(r()-.5)*.6;for(const m of [cloudDepth,cloudMat]){const s=new THREE.Mesh(geo,m);s.position.set(x,y,z);s.scale.y=.7;g.add(s)}}return g}
 const clouds=[[-15,-9,-60,1.9],[17,11,-70,2.2],[8,-12,-80,2.6]].map(([x,y,z,s],i)=>{const c=cloud(11+i*7);c.position.set(x,y,z);c.scale.setScalar(s);c.userData.x=x;scene.add(c);return c});

 // ---------- the flight: one S-curve. It rolls through level as it crosses, side-on to the viewer, then banks its top towards them ----------
 const P=[[-18,9,-100],[-40,2.6,-2],[10,-2,-22],[25,-1.6,9]];
 const DUR=3.3,REVEAL=2.35,SUN_BACK=2.75,END=4.05,SCALE=.16,G=50;          // G sets how much bank a given turn takes
 const fitOf=()=>Math.min(1,(camera.aspect||1.6)/1.55);
 const curve=new THREE.CubicBezierCurve3(...P.map(p=>new THREE.Vector3(...p)));curve.arcLengthDivisions=400;curve.updateArcLengths();
 const pathAt=(u,target)=>curve.getPointAt(Math.min(1,Math.max(0,u)),target);
 const tangentAt=(u,target)=>curve.getTangentAt(Math.min(.9999,Math.max(.0001,u)),target);
 // Distance flown: it covers the long approach quickly and eases as it comes close, without ever slowing to a stop.
 const flown=t=>{const f=Math.min(1,t/DUR),a=.7;return a*(1-(1-f)*(1-f))+(1-a)*f};
 const F=new THREE.Vector3(),F2=new THREE.Vector3(),L=new THREE.Vector3(),U=new THREE.Vector3(),K=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),ROLL=new THREE.Vector3(0,0,1),AOA=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.07);
 const SUN=new THREE.Vector3(-6,9,14).normalize().multiplyScalar(26);
 function attitude(u,out){
  tangentAt(u,F);tangentAt(u+.012,F2);K.subVectors(F2,F);L.crossVectors(UP,F).normalize();U.crossVectors(F,L);
  const lateral=K.dot(L)/(.012*curve.getLength()),bank=Math.atan(lateral*G)*.9;   // tan(bank) = lateral acceleration / g, as in a coordinated turn
  M.makeBasis(L,U,F);out.setFromRotationMatrix(M).multiply(Q.setFromAxisAngle(ROLL,-Math.max(-.85,Math.min(.85,bank)))).multiply(AOA);return bank}
 const A=new THREE.Vector3(),B2=new THREE.Vector3(),TO=new THREE.Vector3(),SIDE=new THREE.Vector3(),T1=new THREE.Vector3(),VIEW=new THREE.Vector3();
 function ribbon(m,sign,time,opacity,fit,s){
  const pos=m.geometry.attributes.position,col=m.geometry.attributes.color;
  for(let i=0;i<TRAIL;i++){const age=i/(TRAIL-1),tt=time-age*1.5,u=flown(Math.max(0,tt));pathAt(u,A);tangentAt(u,T1);L.crossVectors(UP,T1).normalize();
   A.addScaledVector(L,sign*5.4*s).addScaledVector(T1,-27*s);A.x*=fit;
   VIEW.subVectors(camera.position,A).normalize();SIDE.crossVectors(T1,VIEW).normalize();const w=(.016+age*.1)*(1+Math.max(0,A.z)*.02);
   pos.setXYZ(i*2,A.x+SIDE.x*w,A.y+SIDE.y*w,A.z+SIDE.z*w);pos.setXYZ(i*2+1,A.x-SIDE.x*w,A.y-SIDE.y*w,A.z-SIDE.z*w);
   const a=opacity*.34*Math.pow(1-age,1.5)*Math.min(1,age*16)*(tt>0?1:0);col.setXYZW(i*2,1,1,1,a);col.setXYZW(i*2+1,1,1,1,a)}
  pos.needsUpdate=true;col.needsUpdate=true}
 plane.visible=false;scene.add(plane);
 // Fill light is turned down while it flies, so the sun models the shape and its shadows read; the hero gets it back after.
 const fill=scene.children.find(o=>o.isHemisphereLight),fillLevel=fill?.intensity??0;if(fill)fill.intensity=fillLevel*.34;
 const giveSunBack=()=>{sunHeld=false;restoreSun();if(fill)fill.intensity=fillLevel};
 let t=0,fired=false,onReveal=null,onDone=null,finished=false,sunHeld=true;
 const smooth=f=>f*f*(3-2*f);
 function pose(time){
  const fit=fitOf(),s=SCALE*Math.max(.46,fit),u=flown(time);
  pathAt(u,plane.position);plane.position.x*=fit;attitude(u,plane.quaternion);plane.scale.setScalar(s);
  const fade=smooth(Math.min(1,Math.max(0,(time-REVEAL)/.55)));
  trails.forEach((m,i)=>ribbon(m,i?1:-1,time,1-fade,fit,s));
  cloudMat.opacity=.5*(1-fade);clouds.forEach(c=>{c.visible=fade<1;c.position.x=(c.userData.x-time*.35)*Math.max(.6,fit)});
  if(sunHeld){ // keep the sun's shadow on the aeroplane; only the light's aim moves, never its direction
   sun.target.position.copy(plane.position);sun.position.copy(plane.position).add(SUN);const c=sun.shadow.camera,e=62*s*.62;c.left=-e;c.right=e;c.top=e;c.bottom=-e;c.near=.5;c.far=60;c.updateProjectionMatrix();sun.shadow.needsUpdate=true}
 }
 function dispose(){
  const mats=new Set(),geos=new Set(),take=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material)};
  plane.traverse(take);trails.forEach(m=>{take(m);scene.remove(m)});clouds.forEach(c=>{c.traverse(take);scene.remove(c)});scene.remove(plane);
  geos.forEach(g=>g.dispose());mats.forEach(m=>{m.map?.dispose();m.dispose()});
 }
 return{
  fly(reveal,done){onReveal=reveal;onDone=done;plane.visible=true;pose(0)},
  tick(dt){if(finished||!plane.visible)return;t+=dt;if(!fired&&t>=REVEAL){fired=true;onReveal?.()}if(sunHeld&&t>=SUN_BACK)giveSunBack();pose(Math.min(t,END));if(t>=END){finished=true;onDone?.()}},
  seek(time){t=time;pose(time)},
  dispose(){finished=true;if(sunHeld)giveSunBack();dispose()}
 };
};
