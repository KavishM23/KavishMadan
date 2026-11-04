/* The intro: a Spitfire flies in, passes close with Kavish in the open cockpit, then climbs away.
   Dimensions are in metres, nose along +Z, port wing along +X. Everything is removed from the scene once it has flown. */
window.createSpitfireFlight=function({THREE,scene,camera,anisotropy=4,pilot}){
 const canvasOf=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c};
 const tex=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t};
 const seeded=s=>()=>(s=(s*16807)%2147483647)/2147483647;
 const GREEN='#3d4a36',GREY='#6c7377',UNDER='#b3b9b7',SKY='#cfd6bb',RED='#a8302c',BLUE='#27386b',WHITE='#ece6d6';

 // ---------- paint ----------
 const LEN=8.9,ZT=-5,uOf=z=>(z-ZT)/LEN;              // fuselage texture runs tail to nose
 function camo(g,w,h,rand,n,size){g.fillStyle=GREY;g.fillRect(0,0,w,h);g.fillStyle=GREEN;
  for(let i=0;i<n;i++){const x=rand()*w,y=rand()*h,r=size*(.6+rand());g.beginPath();for(let k=0;k<=14;k++){const a=k/14*Math.PI*2,q=r*(.72+.42*Math.sin(a*3+i)*rand()+.2);k?g.lineTo(x+Math.cos(a)*q*1.5,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q*1.5,y+Math.sin(a)*q)}g.closePath();g.fill()}}
 function wear(g,w,h,rand){for(let i=0;i<9000;i++){g.fillStyle=`rgba(${rand()<.5?'255,255,245':'10,12,10'},${rand()*.05})`;g.fillRect(rand()*w,rand()*h,2,2)}}
 function roundel(g,x,y,rx,ry,white=true){[[1,BLUE],white?[.66,WHITE]:null,[.4,RED]].forEach(p=>{if(!p)return;g.fillStyle=p[1];g.beginPath();g.ellipse(x,y,rx*p[0],ry*p[0],0,0,Math.PI*2);g.fill()});}
 function bodyMap(){return canvasOf(2048,1024,(g,w,h)=>{
  const rand=seeded(41),U=z=>uOf(z)*w;camo(g,w,h,rand,26,120);
  // medium sea grey underside with a soft wavy demarcation
  g.fillStyle=UNDER;for(const top of [true,false]){g.beginPath();g.moveTo(0,top?0:h);for(let x=0;x<=w;x+=24){const q=Math.sin(x*.012)*14+Math.sin(x*.031)*6;g.lineTo(x,top?h*.13+q:h*.87+q)}g.lineTo(w,top?0:h);g.closePath();g.fill()}
  // sky fuselage band
  g.fillStyle=SKY;g.fillRect(U(-3.75),0,U(-3.35)-U(-3.75),h);
  // cockpit tub, painted under the raised rim
  g.fillStyle='#14171a';g.beginPath();g.ellipse(U(-.1),h*.5,U(.72)-U(-.1),h*.105,0,0,Math.PI*2);g.fill();
  // exhaust staining along both sides of the cowling
  for(const y of [.27,.73]){const gr=g.createLinearGradient(U(1.2),0,U(-.9),0);gr.addColorStop(0,'rgba(12,12,12,.5)');gr.addColorStop(1,'rgba(12,12,12,0)');g.fillStyle=gr;g.fillRect(U(-.9),h*y-26,U(1.2)-U(-.9),52)}
  wear(g,w,h,rand);
  // panel lines and rivets
  g.strokeStyle='rgba(8,10,10,.42)';g.lineWidth=2;[-4.3,-3.2,-2.2,-1.3,-.5,.7,1.6,2.5,3.3].forEach(z=>{g.beginPath();g.moveTo(U(z),h*.04);g.lineTo(U(z),h*.96);g.stroke()});
  [.2,.36,.64,.8].forEach(f=>{g.beginPath();g.moveTo(0,h*f);g.lineTo(w,h*f);g.stroke()});
  g.fillStyle='rgba(8,10,10,.3)';[-4.3,-3.2,-2.2,-1.3,.7,1.6,2.5].forEach(z=>{for(let y=40;y<h-40;y+=16)g.fillRect(U(z)+6,y,2,2)});
  // national markings. Viewed from outside, the port side (+X) reads mirrored and the starboard side upside down.
  const sides=[{y:h*.75,port:true},{y:h*.25,port:false}];
  for(const s of sides){roundel(g,U(-2.15),s.y,88,106);
   g.save();g.font='800 170px "Schibsted Grotesk", Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=SKY;
   const put=(txt,z)=>{g.save();g.translate(U(z),s.y);g.scale(s.port?-1:1,s.port?1.15:-1.15);g.fillText(txt,0,4);g.restore()};
   s.port?(put('K',-1.1),put('M',-3.1)):(put('K',-3.1),put('M',-1.1));g.restore()}
 })}
 function wingMap(top){return canvasOf(1024,512,(g,w,h)=>{
  const rand=seeded(top?7:19);if(top)camo(g,w,h,rand,11,62);else{g.fillStyle=UNDER;g.fillRect(0,0,w,h)}
  if(top){const y=h*.1;g.fillStyle='#d9a93a';g.fillRect(w*.42,0,w*.4,y*.7)}   // yellow leading-edge strip
  g.strokeStyle='rgba(8,10,10,.34)';g.lineWidth=1.5;[.2,.36,.52,.68,.84].forEach(f=>{g.beginPath();g.moveTo(w*f,0);g.lineTo(w*f,h);g.stroke()});[.3,.62].forEach(f=>{g.beginPath();g.moveTo(0,h*f);g.lineTo(w,h*f);g.stroke()});
  wear(g,w,h,rand);roundel(g,w*.66,h*.44,w*.082,h*.17,!top);
 })}
 function finMap(){return canvasOf(512,512,(g,w,h)=>{camo(g,w,h,seeded(3),6,60);
  const span=[w*.12,w*.62];[[RED,.03],[WHITE,.13],[BLUE,.23]].forEach(([c,f])=>{g.fillStyle=c;g.fillRect(span[0],h*f,span[1]-span[0],h*.11)});
  g.strokeStyle='rgba(8,10,10,.45)';g.lineWidth=2;g.beginPath();g.moveTo(0,h*.6);g.lineTo(w,h*.6);g.stroke();wear(g,w,h,seeded(9))})}

 // ---------- geometry helpers ----------
 function surface(rows,cols,at,uv){const p=[],t=[],idx=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const v=at(i/rows,j/cols);p.push(v.x,v.y,v.z);const q=uv(i/rows,j/cols,v);t.push(q[0],q[1])}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(t,2));g.setIndex(idx);g.computeVertexNormals();return g}
 const naca=x=>5*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
 // An elliptical lifting surface: both skins, spanning +X, swept about a chord line 30% back from the leading edge.
 function foil({b,c0,zr,y0=0,dih=0,t0,t1}){
  const chord=x=>c0*Math.sqrt(Math.max(1e-4,1-(x/b)*(x/b))),zMax=zr+.3*c0,zMin=zr-.7*c0;
  const make=sign=>surface(36,26,(u,v)=>{const x=b*Math.sin(u*Math.PI/2)*.999,c=chord(x),f=(1-Math.cos(v*Math.PI))/2,th=t0+(t1-t0)*(x/b);
    return new THREE.Vector3(x,y0+x*dih+sign*c*th*naca(f)*.5,zr+.3*c-f*c)},(u,v,p)=>[p.x/b,(p.z-zMin)/(zMax-zMin)]);
  const top=make(1),bottom=make(-1);bottom.index.array.reverse();bottom.computeVertexNormals();return{top,bottom}}

 // ---------- the aeroplane ----------
 const plane=new THREE.Group();
 const paint=m=>new THREE.MeshStandardMaterial({roughness:.62,metalness:.12,envMapIntensity:.9,side:THREE.DoubleSide,...m});
 const metal=new THREE.MeshStandardMaterial({color:0x26282c,roughness:.42,metalness:.85});
 const steel=new THREE.MeshStandardMaterial({color:0xaab0b4,roughness:.3,metalness:.95});
 const add=(g,m,p=plane,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};

 // fuselage: lofted through stations of [z, half width, top, bottom]
 const ST=[[-5,.02,.64,.46],[-4.3,.13,.64,.24],[-3.1,.29,.63,-.05],[-1.9,.41,.64,-.32],[-1,.47,.7,-.48],[-.2,.5,.74,-.58],[.6,.5,.62,-.62],[1.6,.48,.56,-.58],[2.6,.44,.47,-.47],[3.4,.37,.37,-.35],[3.85,.3,.29,-.29]];
 const curveA=new THREE.CatmullRomCurve3(ST.map(s=>new THREE.Vector3(s[0],s[1],s[2]))),curveB=new THREE.CatmullRomCurve3(ST.map(s=>new THREE.Vector3(s[0],s[3],0)));
 const N=2.35,pw=(a,e)=>Math.sign(a)*Math.pow(Math.abs(a),e);
 const station=s=>{const p=curveA.getPoint(s),q=curveB.getPoint(s);return{z:p.x,w:Math.max(.004,p.y),top:p.z,bot:q.y}};
 const body=surface(110,64,(u,v)=>{const s=station(u),a=v*Math.PI*2,sx=pw(Math.sin(a),2/N),cy=pw(-Math.cos(a),2/N),yc=(s.top+s.bot)/2;
   return new THREE.Vector3(s.w*sx,yc+(s.top-yc)*cy,s.z)},(u,v,p)=>[uOf(p.z),v]);
 // weld the normals along the seam under the belly
 {const n=body.attributes.normal,cols=65;for(let i=0;i*cols<n.count;i++){const a=i*cols,b=a+64,x=n.getX(a)+n.getX(b),y=n.getY(a)+n.getY(b),z=n.getZ(a)+n.getZ(b),l=Math.hypot(x,y,z)||1;n.setXYZ(a,x/l,y/l,z/l);n.setXYZ(b,x/l,y/l,z/l)}}
 add(body,paint({map:tex(bodyMap())}));
 // the height of the skin at a point on top of the fuselage, for parts that sit on it
 function skinY(x,z){let s=0;for(let lo=0,hi=1,i=0;i<24;i++){s=(lo+hi)/2;curveA.getPoint(s).x<z?lo=s:hi=s}const c=station(s),yc=(c.top+c.bot)/2,f=Math.min(1,Math.abs(x)/c.w);return yc+(c.top-yc)*Math.pow(1-Math.pow(f,N),1/N)}

 // wings, tailplane, fin
 const wing=foil({b:5.65,c0:2.55,zr:.6,y0:-.42,dih:.105,t0:.13,t1:.06}),wingTop=paint({map:tex(wingMap(true))}),wingBot=paint({map:tex(wingMap(false))});
 const tail=foil({b:1.7,c0:1.1,zr:-4.05,y0:.5,t0:.1,t1:.06});
 for(const sd of [1,-1]){const h=new THREE.Group();h.scale.x=sd;plane.add(h);add(wing.top,wingTop,h);add(wing.bottom,wingBot,h);add(tail.top,wingTop,h);add(tail.bottom,wingBot,h)}
 const fin=foil({b:1.6,c0:1.5,zr:-4.3,t0:.1,t1:.06}),finMat=paint({map:tex(finMap())}),finG=new THREE.Group();finG.rotation.z=Math.PI/2;finG.position.y=.5;plane.add(finG);add(fin.top,finMat,finG);add(fin.bottom,finMat,finG);

 // nose: spinner, four-blade propeller, blur disc
 const prop=new THREE.Group();prop.position.z=3.84;plane.add(prop);
 const spinPts=[];for(let i=0;i<=24;i++){const f=i/24;spinPts.push(new THREE.Vector2(.3*Math.pow(Math.max(0,1-f*f),.62)+.0001,f*1.05))}
 const sp=new THREE.LatheGeometry(spinPts,48);sp.rotateX(Math.PI/2);add(sp,new THREE.MeshStandardMaterial({color:0xcfd6bb,roughness:.4,metalness:.2}),prop);
 const bladeGeo=surface(18,8,(u,v)=>{const r=.22+u*1.42,c=.26*Math.sin(Math.min(1,u*1.2+.25)*Math.PI*.82)+.04,tw=.75-u*.62,o=(v-.5)*c;return new THREE.Vector3(Math.cos(tw)*o,r,Math.sin(tw)*o+.14)},(u,v)=>[v,u]);
 const bladeTex=tex(canvasOf(32,256,(g,w,h)=>{g.fillStyle='#17181a';g.fillRect(0,0,w,h);g.fillStyle='#e6b93e';g.fillRect(0,0,w,h*.1)}));
 const bladeMat=paint({map:bladeTex,roughness:.5});for(let i=0;i<4;i++){const b=add(bladeGeo,bladeMat,prop);b.rotation.z=i*Math.PI/2}
 const blurTex=tex(canvasOf(512,512,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,40,w/2,h/2,w/2);r.addColorStop(0,'rgba(30,32,34,.05)');r.addColorStop(.8,'rgba(30,32,34,.13)');r.addColorStop(.95,'rgba(230,185,62,.13)');r.addColorStop(1,'rgba(230,185,62,0)');g.fillStyle=r;g.fillRect(0,0,w,h)}));
 add(new THREE.CircleGeometry(1.66,64),new THREE.MeshBasicMaterial({map:blurTex,transparent:true,depthWrite:false,side:THREE.DoubleSide}),plane,0,0,3.98).renderOrder=3;

 // Merlin exhaust stubs, wing cannon, radiators, mast
 for(const sd of [1,-1]){for(let i=0;i<6;i++){const z=1.15+i*.33,o=add(new THREE.CylinderGeometry(.05,.065,.2,12),metal,plane,sd*(.5-.02*i),.14,z);o.rotation.z=-sd*Math.PI/2+sd*.2;o.rotation.y=sd*.3}
  const c=add(new THREE.CylinderGeometry(.036,.042,.72,16),metal,plane,sd*2.35,-.2,1.42);c.rotation.x=Math.PI/2;
  const f=add(new THREE.CylinderGeometry(.052,.052,.2,16),metal,plane,sd*2.35,-.2,1.2);f.rotation.x=Math.PI/2}
 const rad=(x,len)=>{const s=new THREE.Shape();s.moveTo(-.3,0);s.lineTo(.3,0);s.quadraticCurveTo(.3,-.26,.1,-.27);s.lineTo(-.1,-.27);s.quadraticCurveTo(-.3,-.26,-.3,0);const g=new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,curveSegments:10});add(g,paint({color:0x8d9493}),plane,x,-.5,-.5);add(new THREE.PlaneGeometry(.52,.21),new THREE.MeshBasicMaterial({color:0x101214}),plane,x,-.63,-.5+len+.03)};
 rad(1.75,1.0);rad(-1.75,.72);
 const mast=add(new THREE.CylinderGeometry(.012,.045,.72,10),metal,plane,0,skinY(0,-1.75)+.3,-1.75);mast.rotation.x=-.22;

 // cockpit: a raised rim that follows the skin, windscreen, and the hood slid right back
 const rimPts=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2,x=Math.sin(a)*.34,z=-.1+Math.cos(a)*.76;rimPts.push(new THREE.Vector3(x,skinY(x,z)+.02,z))}
 add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts,true),160,.028,10,true),metal);
 const glass=new THREE.MeshPhysicalMaterial({color:0xdcebf0,transparent:true,opacity:.2,roughness:.04,metalness:.1,envMapIntensity:2.2,depthWrite:false,side:THREE.DoubleSide});
 const dome=new THREE.SphereGeometry(1,40,22,0,Math.PI*2,0,Math.PI/2);
 const shield=add(dome,glass,plane,0,.58,.74);shield.scale.set(.36,.34,.5);shield.renderOrder=4;
 const hood=add(dome,glass,plane,0,.62,-1.2);hood.scale.set(.37,.47,.74);hood.renderOrder=4;
 for(const [z,y,sx,sy] of [[.82,.58,.34,.24],[.56,.58,.36,.33],[-.95,.62,.36,.46],[-1.45,.62,.33,.42]]){const a=add(new THREE.TorusGeometry(1,.02,8,40,Math.PI),metal,plane,0,y,z);a.scale.set(sx,sy,1)}

 // ---------- the pilot: the paper cutout, turned to the viewer ----------
 const HEAD=1.62,AR=pilot.width/pilot.height;
 const headMat=new THREE.MeshBasicMaterial({map:pilot,transparent:true,alphaTest:.04,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const head=new THREE.Group();head.position.set(0,skinY(0,-.12)+HEAD*.43,-.12);plane.add(head);
 const sticker=add(new THREE.PlaneGeometry(HEAD*AR,HEAD),headMat,head);sticker.renderOrder=2;
 // a scarf streaming from the collar
 const scarfGeo=new THREE.PlaneGeometry(.26,2.1,1,24);scarfGeo.translate(0,-1.05,0);scarfGeo.rotateX(-Math.PI/2+.12);
 const scarfBase=scarfGeo.attributes.position.array.slice();
 const scarfMat=new THREE.MeshStandardMaterial({color:0xa54f36,roughness:.72,side:THREE.DoubleSide});
 add(scarfGeo,scarfMat,plane,.22,skinY(0,-.5)+.1,-.5);

 // ---------- clouds drifting past for speed ----------
 const cloudMat=new THREE.MeshStandardMaterial({color:0x8fa6b4,roughness:1,envMapIntensity:.45,transparent:true,opacity:.55,depthWrite:false});
 // a depth pass first, so the see-through puffs read as one soft shape rather than overlapping bubbles
 const cloudDepth=new THREE.MeshBasicMaterial({colorWrite:false});
 function cloud(seed){const r=seeded(seed),g=new THREE.Group();for(let i=0;i<9;i++){const geo=new THREE.SphereGeometry(.5+r()*.6,24,16),x=(i-4)*.62+r()*.2,y=(r()-.5)*.5,z=(r()-.5)*.6;for(const m of [cloudDepth,cloudMat]){const s=new THREE.Mesh(geo,m);s.position.set(x,y,z);s.scale.y=.7;g.add(s)}}return g}
 const clouds=[[6,-5.4,-26,1.5,10],[20,6.2,-34,1.8,8],[31,-2,-40,2,7]].map(([x,y,z,s,v],i)=>{const c=cloud(11+i*7);c.position.set(x,y,z);c.scale.setScalar(s);c.userData.v=v;scene.add(c);return c});

 // ---------- the flight: position, then yaw (0 = at the viewer), pitch, roll ----------
 const KEYS=[
  [0,   [-30,-9.5,-44],[.92,.12,-.72]],
  [.9,  [-11.5,-4,-12],[.98,.18,-.62]],
  [1.65,[-2.6,-.6,7],[.74,.26,-.34]],
  [2.45,[.3,.05,9.2],[.6,.22,-.12]],
  [3.05,[5.2,2,5.6],[.92,-.3,.6]],
  [3.75,[17,10.5,-9],[1.3,-.7,.95]]];
 const END=KEYS[KEYS.length-1][0],REVEAL=2.72;
 const quats=KEYS.map(k=>new THREE.Quaternion().setFromEuler(new THREE.Euler(k[2][1],k[2][0],k[2][2],'YXZ')));
 const path=new THREE.CatmullRomCurve3(KEYS.map(k=>new THREE.Vector3(...k[1])),false,'centripetal');
 plane.visible=false;scene.add(plane);
 let t=0,fired=false,onReveal=null,onDone=null,finished=false;
 const inv=new THREE.Quaternion(),smooth=f=>f*f*(3-2*f);
 function pose(time){
  let i=0;while(i<KEYS.length-2&&time>=KEYS[i+1][0])i++;
  const f=Math.min(1,Math.max(0,(time-KEYS[i][0])/(KEYS[i+1][0]-KEYS[i][0])));
  const aspect=camera.aspect||1.6,fit=Math.min(1,aspect/1.55);
  path.getPoint((i+f)/(KEYS.length-1),plane.position);
  plane.position.x*=fit;plane.position.y+=Math.sin(time*2.3)*.05;
  plane.quaternion.slerpQuaternions(quats[i],quats[i+1],smooth(f));
  plane.scale.setScalar(.62*Math.max(.44,fit));
  prop.rotation.z=-time*38;
  // the wing waves hello on the close pass
  if(time>1.7&&time<2.65)plane.rotateZ(Math.sin((time-1.7)/.95*Math.PI*2)*.14);
  plane.updateMatrixWorld(true);
  plane.getWorldQuaternion(inv).invert();head.quaternion.copy(inv).multiply(camera.quaternion);
  const a=scarfGeo.attributes.position;for(let k=0;k<a.count;k++){const z=scarfBase[k*3+2],d=Math.abs(z);a.setY(k,scarfBase[k*3+1]+Math.sin(d*3.4-time*13)*.11*Math.min(1,d));a.setX(k,scarfBase[k*3]+Math.sin(d*2.3-time*9)*.08*Math.min(1,d))}a.needsUpdate=true;
  clouds.forEach(c=>{c.userData.x??=c.position.x;c.position.x=(c.userData.x-time*c.userData.v)*Math.max(.6,fit)});
  const fade=smooth(Math.min(1,Math.max(0,(time-REVEAL)/.55)));cloudMat.opacity=.55*(1-fade);clouds.forEach(c=>{c.visible=fade<1});
 }
 function dispose(){
  const mats=new Set(),geos=new Set();
  const take=o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material)};
  plane.traverse(take);clouds.forEach(c=>{c.traverse(take);scene.remove(c)});scene.remove(plane);
  geos.forEach(g=>g.dispose());mats.forEach(m=>{m.map?.dispose();m.dispose()});
 }
 return{
  fly(reveal,done){onReveal=reveal;onDone=done;plane.visible=true;pose(0)},
  tick(dt){if(finished||!plane.visible)return;t+=dt;pose(Math.min(t,END));if(!fired&&t>=REVEAL){fired=true;onReveal?.()}if(t>=END+.45){finished=true;onDone?.()}},
  seek(time){t=time;pose(Math.min(t,END))},
  dispose(){finished=true;dispose()}
 };
};
