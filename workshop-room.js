/* The room: a set with a floor and three walls, standing in the dark like a stage model.
   Floor and walls take their light from baked maps, so their shadows stay soft at any camera angle. */
Workshop.room=function(THREE,kit,{bakes=null}={}){
 const {mesh,box,add,canvasTexture,rng,bar}=kit;
 const RW=10.6,RD=7.6,RH=4.3,HX=RW/2,HZ=RD/2,T=.3;

 const FS=640; // size of the noise fields the plaster and concrete are painted from
 /* tiling fractal noise, in 0..1 */
 function fractal(size,octaves,seed,base=4,falloff=.55){
  const out=new Float32Array(size*size);let amp=1,total=0;const R=rng(seed);
  for(let o=0;o<octaves;o++){
   const g=base*2**o,grid=new Float32Array(g*g);for(let i=0;i<g*g;i++)grid[i]=R();
   for(let y=0;y<size;y++){
    const fy=y/size*g,y0=Math.floor(fy),ty=fy-y0,sy=ty*ty*(3-2*ty),y1=(y0+1)%g;
    for(let x=0;x<size;x++){
     const fx=x/size*g,x0=Math.floor(fx),tx=fx-x0,sx=tx*tx*(3-2*tx),x1=(x0+1)%g;
     const a=grid[y0*g+x0],b=grid[y0*g+x1],c=grid[y1*g+x0],d=grid[y1*g+x1];
     out[y*size+x]+=amp*(a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy);
    }
   }
   total+=amp;amp*=falloff;
  }
  for(let i=0;i<out.length;i++)out[i]/=total;
  return out;
 }
 function paintField(g,w,h,size,field,colour){
  const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),d=x.createImageData(size,size);
  for(let i=0;i<size*size;i++){const [r,gg,b]=colour(field[i],i);d.data[i*4]=r;d.data[i*4+1]=gg;d.data[i*4+2]=b;d.data[i*4+3]=255}
  x.putImageData(d,0,0);g.imageSmoothingQuality='high';g.drawImage(c,0,0,w,h);
 }
 const contrast=(v,k=2.2)=>Math.max(0,Math.min(1,(v-.5)*k+.5));

 /* ---- polished concrete floor ---- */
 const fA=fractal(FS,6,311,5,.56),fB=fractal(FS,5,733,3,.5);
 const cracks=(()=>{const R=rng(19),all=[];
  const walk=(x,y,a,n,w)=>{const pts=[[x,y]];for(let i=0;i<n;i++){a+=(R()-.5)*.7;x+=Math.cos(a)*(16+R()*30);y+=Math.sin(a)*(16+R()*30);pts.push([x,y]);if(R()<.1&&n>8)walk(x,y,a+(R()>.5?1:-1)*.9,Math.floor(n*.5),w*.6)}all.push([pts,w])};
  walk(3200,2200,2.4,20,1.5);walk(760,2500,-.5,12,1.2);walk(3700,300,2.2,14,1.2);
  return all})();
 const floorW=4096,floorH=2836;
 const floorMap=canvasTexture(floorW,floorH,(g,w,h)=>{
  paintField(g,w,h,FS,fA,(v,i)=>{const b=fB[i],k=contrast(v,2.1)*.7+contrast(b,1.5)*.3,l=110+k*40;return [l*1.0,l*.955,l*.885]});
  const R=rng(41);
  // trowel arcs
  g.lineCap='round';for(let i=0;i<460;i++){const x=R()*w,y=R()*h,r=120+R()*520;g.strokeStyle=`rgba(${R()>.5?'238,230,212':'48,44,36'},${.004+R()*.012})`;g.lineWidth=20+R()*90;g.beginPath();g.arc(x,y,r,R()*6,R()*6+.9);g.stroke()}
  // aggregate
  for(let i=0;i<70000;i++){const d=R();g.fillStyle=d>.6?`rgba(40,36,30,${.03+R()*.1})`:`rgba(240,232,216,${.02+R()*.07})`;const s=.8+R()*2.6;g.fillRect(R()*w,R()*h,s,s)}
  // old stains
  for(let i=0;i<42;i++){const x=R()*w,y=R()*h,r=50+R()*340,gr=g.createRadialGradient(x,y,r*.1,x,y,r);const c=R()>.65?'36,32,28':'60,50,38';gr.addColorStop(0,`rgba(${c},${.05+R()*.14})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.save();g.translate(x,y);g.scale(1,.5+R()*.7);g.translate(-x,-y);g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
  // rubber laid down where the car has been pushed about
  for(let i=0;i<9;i++){const x=1100+R()*1900,y=800+R()*1300,a=.7+R()*.5,l=300+R()*600;g.save();g.translate(x,y);g.rotate(a);const gr=g.createLinearGradient(0,0,l,0);gr.addColorStop(0,'rgba(25,23,22,0)');gr.addColorStop(.3,'rgba(25,23,22,.1)');gr.addColorStop(1,'rgba(25,23,22,0)');g.fillStyle=gr;g.fillRect(0,0,l,60);g.fillRect(0,300,l,60);g.restore()}
  // one old saw cut, nearly filled
  g.strokeStyle='rgba(30,27,24,.3)';g.lineWidth=3;g.beginPath();g.moveTo(w*.62,0);g.lineTo(w*.62,h);g.stroke();
  // cracks
  for(const [pts,lw] of cracks){g.strokeStyle='rgba(22,20,18,.34)';g.lineWidth=lw*.8;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}
  // a worn Moroccan rug, because somebody spends a lot of time here
  const X=x=>(x+RW/2)/RW*w,Y=z=>(z+RD/2)/RD*h,rw=X(3.0)-X(0),rh=Y(3.0)-Y(0);
  g.save();g.translate(X(-2.0),Y(1.0));g.rotate(-.05);
  g.fillStyle='rgba(30,22,16,.25)';g.fillRect(-rw/2-5,-rh/2+7,rw+12,rh+6);
  for(let i=0;i<70;i++){g.fillStyle='rgba(228,214,190,.8)';const x=-rw/2+i/69*rw;g.fillRect(x,-rh/2-18,3,18);g.fillRect(x,rh/2,3,18)}
  g.fillStyle='#e6d6bc';g.fillRect(-rw/2,-rh/2,rw,rh);g.fillStyle='#a9593f';g.fillRect(-rw/2+34,-rh/2+34,rw-68,rh-68);g.fillStyle='#e6d6bc';g.fillRect(-rw/2+56,-rh/2+56,rw-112,rh-112);g.fillStyle='#46696b';g.fillRect(-rw/2+66,-rh/2+66,rw-132,rh-132);
  g.save();g.beginPath();g.rect(-rw/2+66,-rh/2+66,rw-132,rh-132);g.clip();const d=132;g.lineWidth=9;
  for(let x=-rw/2-d;x<rw/2+d;x+=d)for(let y=-rh/2-d,row=0;y<rh/2+d;y+=d,row++){const cx=x+(row%2?d/2:0);g.strokeStyle='#e6d6bc';g.beginPath();g.moveTo(cx,y-d*.62);g.lineTo(cx+d*.5,y);g.lineTo(cx,y+d*.62);g.lineTo(cx-d*.5,y);g.closePath();g.stroke();g.fillStyle=row%2?'#c98a5a':'#e0b84c';g.beginPath();g.moveTo(cx,y-d*.16);g.lineTo(cx+d*.13,y);g.lineTo(cx,y+d*.16);g.lineTo(cx-d*.13,y);g.closePath();g.fill()}
  g.restore();
  const WR=rng(909);for(let i=0;i<5200;i++){g.fillStyle=WR()>.5?`rgba(255,246,228,${.05*WR()})`:`rgba(30,22,16,${.07*WR()})`;g.fillRect(-rw/2+WR()*rw,-rh/2+WR()*rh,2+WR()*5,1+WR()*2)}
  g.restore();
 },{scale:.66});
 const floorBump=canvasTexture(2048,1418,(g,w,h)=>{
  paintField(g,w,h,FS,fB,v=>{const l=128+(contrast(v,1.6)-.5)*36;return [l,l,l]});
  const R=rng(83);for(let i=0;i<60000;i++){const v=R()>.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${.05*R()})`;g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2)}
  g.save();g.scale(.5,.5);for(const [pts,lw] of cracks){g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=lw;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}g.restore();
 },{srgb:false,scale:.5});
 const floorRough=canvasTexture(1024,710,(g,w,h)=>{
  paintField(g,w,h,FS,fA,(v,i)=>{const l=112+contrast(fB[i],2.6)*92+(v-.5)*40;return [l,l,l]});
 },{srgb:false});

 /* ---- old lime plaster ---- */
 const fP=fractal(FS,6,523,4,.58),fQ=fractal(FS,5,127,3,.5);
 function plaster(w,h,seed,extra){
  return canvasTexture(w,h,(g)=>{
   paintField(g,w,h,FS,fP,(v,i)=>{const q=fQ[i],k=contrast(v,2.4)*.6+contrast(q,1.8)*.4,l=176+k*44;return [l*1.0,l*.95,l*.865]});
   const R=rng(seed);
   // patched repairs
   for(let i=0;i<34;i++){const x=R()*w,y=R()*h,r=60+R()*240;const gr=g.createRadialGradient(x,y,r*.2,x,y,r);const c=R()>.5?'246,238,222':'150,134,112';gr.addColorStop(0,`rgba(${c},${.05+R()*.13})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.save();g.translate(x,y);g.scale(1+R(),.5+R()*.6);g.translate(-x,-y);g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
   // damp rising from the floor, and streaks running down
   const damp=g.createLinearGradient(0,h,0,h*.72);damp.addColorStop(0,'rgba(88,74,58,.42)');damp.addColorStop(1,'rgba(88,74,58,0)');g.fillStyle=damp;g.fillRect(0,0,w,h);
   for(let i=0;i<120;i++){const x=R()*w,l=80+R()*R()*h*.7,y=R()*h*.35;const gr=g.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(90,76,60,.09)');gr.addColorStop(1,'rgba(90,76,60,0)');g.fillStyle=gr;g.fillRect(x,y,1.5+R()*7,l)}
   // hairline cracks
   for(let i=0;i<9;i++){let x=R()*w,y=R()*h,a=R()*6.28;g.strokeStyle=`rgba(70,60,48,${.08+R()*.14})`;g.lineWidth=.6+R()*.6;g.beginPath();g.moveTo(x,y);for(let k=0;k<22;k++){a+=(R()-.5)*.7;x+=Math.cos(a)*16;y+=Math.sin(a)*16;g.lineTo(x,y)}g.stroke()}
   for(let i=0;i<40000;i++){g.fillStyle=R()>.5?`rgba(255,250,236,${.05*R()})`:`rgba(70,60,48,${.05*R()})`;g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2)}
   extra&&extra(g,w,h,R);
  },{scale:.7});
 }
 const backMap=plaster(4096,1544,601,(g,w,h,R)=>{
  // the name, stencilled straight onto the wall
  const size=h*.175,cx=w*.515,cy=h*.245;
  const c=document.createElement('canvas');c.width=w;c.height=Math.round(size*1.5);const x=c.getContext('2d');
  x.font=`800 ${size}px "League Spartan",Arial,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#1E3A40';
  try{x.letterSpacing=`${-size*.012}px`}catch(e){}
  x.fillText('KAVISH MADAN',cx,c.height/2+size*.05);
  x.globalCompositeOperation='destination-out';
  for(let i=0;i<18000;i++){x.fillStyle=`rgba(0,0,0,${R()*.2})`;x.fillRect(R()*w,R()*c.height,1+R()*3,1+R()*2)}
  g.globalAlpha=.96;g.drawImage(c,0,cy-c.height/2);g.globalAlpha=1;
 });
 const sideMap=plaster(2840,1544,877);
 const plasterBump=canvasTexture(1024,512,(g,w,h)=>{
  paintField(g,w,h,FS,fP,v=>{const l=128+(contrast(v,1.7)-.5)*90;return [l,l,l]});
  const R=rng(5);for(let i=0;i<9000;i++){const v=R()>.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${.06*R()})`;g.fillRect(R()*w,R()*h,1+R()*2,1+R()*2)}
 },{srgb:false});


 const shared={tint:{value:new THREE.Color(1,1,1)},lamp:{value:0}};
 const white=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);white.needsUpdate=true;
 function baked(map,bump,name,floor=false){
  const mat=new THREE.ShaderMaterial({
   defines:floor?{FLOOR:1}:{},
   uniforms:{tMap:{value:map},tLight:{value:(bakes&&bakes[name])||white},tBump:{value:bump},tRough:{value:floor?floorRough:null},tMirror:{value:null},uMirror:{value:0},uRes:{value:new THREE.Vector2(1,1)},uGain:{value:bakes&&bakes[name]?1/.4*.8:1},uTexel:{value:floor?.0016:.0022},uTint:shared.tint,uLamp:shared.lamp,uName:{value:0}},
   vertexShader:'varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
   fragmentShader:`varying vec2 vUv;varying vec3 vW;uniform sampler2D tMap,tLight,tBump;uniform float uGain,uTexel,uName,uLamp;uniform vec3 uTint;
   #ifdef FLOOR
   uniform sampler2D tRough,tMirror;uniform float uMirror;uniform vec2 uRes;
   #endif
   void main(){
    vec3 c=texture2D(tMap,vUv).rgb,alb=c;
    float b=texture2D(tBump,vUv).r,bx=texture2D(tBump,vUv+vec2(uTexel,0.)).r,by=texture2D(tBump,vUv+vec2(0.,uTexel)).r;
    float relief=1.+(bx-b)*1.5+(b-by)*.9;
    c*=(texture2D(tLight,vUv).rgb*uGain+vec3(.38,.355,.31))*relief*uTint;
    if(uLamp>0.){vec3 L=vec3(.2,3.6,.4)-vW;c+=alb*relief*vec3(1.,.8,.56)*uLamp/(1.+dot(L,L)*.1);}
    if(uName>0.){float l=dot(alb,vec3(.3,.59,.11));c=mix(c,vec3(.8,.62,.4),uName*(1.-smoothstep(.05,.22,l)));}
    #ifdef FLOOR
    if(uMirror>0.){
     vec3 V=normalize(cameraPosition-vW);float f=.05+.95*pow(1.-max(V.y,0.),5.);
     float rough=texture2D(tRough,vUv).r;
     vec2 s=gl_FragCoord.xy/uRes;s.y=1.-s.y;s+=vec2(bx-b,by-b)*.05;
     float edge=smoothstep(0.,.018,s.x)*smoothstep(0.,.018,s.y)*smoothstep(0.,.018,1.-s.x)*smoothstep(0.,.018,1.-s.y);
     vec3 m=textureLod(tMirror,clamp(s,vec2(.001),vec2(.999)),1.2+rough*3.2).rgb;
     float k=clamp(f*(1.25-rough)*uMirror*edge,0.,.6);c=c*(1.-k*.45)+m*k;
    }
    #endif
    gl_FragColor=vec4(c,1.);
   }`});
  mat.userData.bake=name;return mat;
 }

 const root=new THREE.Group(),surfaces={};
 const floorMat=baked(floorMap,floorBump,'floor',true);
 const floor=mesh(new THREE.PlaneGeometry(RW,RD),floorMat,[0,0,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;add(root,floor);surfaces.floor=floor;
 const wall=(name,map,w,p,r,geo)=>{const m=mesh(geo||new THREE.PlaneGeometry(w,RH),baked(map,plasterBump,name),p,r);m.receiveShadow=true;add(root,m);surfaces[name]=m;return m};
 wall('back',backMap,RW,[0,RH/2,-HZ],[0,0,0]);
 wall('right',sideMap,RD,[HX,RH/2,0],[0,-Math.PI/2,0]);
 // the window wall is a sheet with a hole
 const WZ0=-3.45,WZ1=-.35,WY0=.8,WY1=3.75;
 const sheet=new THREE.Shape();sheet.moveTo(-HZ,-RH/2);sheet.lineTo(HZ,-RH/2);sheet.lineTo(HZ,RH/2);sheet.lineTo(-HZ,RH/2);sheet.closePath();
 const hole=new THREE.Path();hole.moveTo(-WZ1,WY0-RH/2);hole.lineTo(-WZ1,WY1-RH/2);hole.lineTo(-WZ0,WY1-RH/2);hole.lineTo(-WZ0,WY0-RH/2);hole.closePath();sheet.holes.push(hole);
 const leftGeo=new THREE.ShapeGeometry(sheet,1);{const p=leftGeo.attributes.position,uv=leftGeo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+HZ)/RD,(p.getY(i)+RH/2)/RH)}
 wall('left',sideMap,RD,[-HX,RH/2,0],[0,Math.PI/2,0],leftGeo);

 /* ---- the outside of the set: walls with thickness, on a concrete slab ---- */
 const shell=new THREE.MeshStandardMaterial({color:'#c9b49a',roughness:.92});
 const cap=new THREE.MeshStandardMaterial({color:'#f1e6d2',roughness:.9});
 const edgeBox=(w,h,d,m,p)=>{const b=mesh(new THREE.BoxGeometry(w,h,d),m,p);b.castShadow=true;b.receiveShadow=true;add(root,b);return b};
 const slab=edgeBox(RW+T*2,.42,RD+T,new THREE.MeshStandardMaterial({color:'#c9b49a',roughness:.92}),[0,-.21-.002,-T/2]);
 edgeBox(RW+T*2,RH,T,shell,[0,RH/2,-HZ-T/2-.002]);
 edgeBox(T,RH,RD,shell,[HX+T/2+.002,RH/2,0]);
 edgeBox(RW+T*2,.012,T,cap,[0,RH+.006,-HZ-T/2]);edgeBox(T,.012,RD,cap,[HX+T/2,RH+.006,0]);edgeBox(T,.012,RD,cap,[-HX-T/2,RH+.006,0]);
 // window wall, in four pieces around the opening
 const lx=-HX-T/2-.002;
 edgeBox(T,WY0,RD,shell,[lx,WY0/2,0]);edgeBox(T,RH-WY1,RD,shell,[lx,(RH+WY1)/2,0]);
 edgeBox(T,WY1-WY0,WZ0+HZ,shell,[lx,(WY0+WY1)/2,(WZ0-HZ)/2]);edgeBox(T,WY1-WY0,HZ-WZ1,shell,[lx,(WY0+WY1)/2,(WZ1+HZ)/2]);
 // sill and reveals in plaster
 const reveal=new THREE.MeshStandardMaterial({color:'#b3a48c',roughness:.86});
 edgeBox(.42,.07,WZ1-WZ0+.22,new THREE.MeshStandardMaterial({color:'#a4957e',roughness:.8}),[-HX+.04,WY0-.03,(WZ0+WZ1)/2]);
 edgeBox(T+.02,.02,WZ1-WZ0,reveal,[lx,WY1-.012,(WZ0+WZ1)/2]);
 edgeBox(T+.02,WY1-WY0,.02,reveal,[lx,(WY0+WY1)/2,WZ0-.003]);edgeBox(T+.02,WY1-WY0,.02,reveal,[lx,(WY0+WY1)/2,WZ1+.003]);

 /* ---- steel window, four lights across and four up, with trees beyond ---- */
 const frame=new THREE.MeshStandardMaterial({color:'#17191c',roughness:.5,metalness:.55});
 const wx=-HX-.2,nz=5,ny=4,zs=(WZ1-WZ0)/nz,ys=(WY1-WY0)/ny;
 for(let i=0;i<=nz;i++)edgeBox(.05,WY1-WY0,i%nz?.04:.07,frame,[wx,(WY0+WY1)/2,WZ0+i*zs]);
 for(let j=0;j<=ny;j++)edgeBox(.05,j%ny?.04:.07,WZ1-WZ0,frame,[wx,WY0+j*ys,(WZ0+WZ1)/2]);
 const glass=mesh(new THREE.PlaneGeometry(WZ1-WZ0,WY1-WY0),new THREE.MeshPhysicalMaterial({color:'#dfe9e6',roughness:.12,transparent:true,opacity:.1,envMapIntensity:.9}),[wx-.01,(WY0+WY1)/2,(WZ0+WZ1)/2],[0,Math.PI/2,0]);add(root,glass);
 const outside=canvasTexture(1400,1100,(g,w,h)=>{
  const R=rng(66),sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#f6fbf7');sky.addColorStop(.6,'#e7f0e0');sky.addColorStop(1,'#b9c79a');g.fillStyle=sky;g.fillRect(0,0,w,h);
  for(let i=0;i<620;i++){const x=R()*w,y=h*(.08+R()*R()*.96),r=26+R()*104,l=R(),c=l>.6?'142,172,86':l>.3?'98,132,62':'186,202,126',a=.07+R()*.17;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},${a})`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
  g.fillStyle='rgba(120,108,88,.55)';g.filter='blur(14px)';g.fillRect(0,h*.86,w,h*.14);g.filter='none';
 });
 const view=mesh(new THREE.PlaneGeometry(WZ1-WZ0,WY1-WY0),new THREE.ShaderMaterial({
  uniforms:{tMap:{value:outside},uBack:{value:-HX-5},uBox:{value:new THREE.Vector4(-8,6,-1.6,7.6)},uGain:{value:1.5},uSky:{value:new THREE.Color(1,1,1)}},
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`varying vec3 vW;uniform sampler2D tMap;uniform float uBack,uGain;uniform vec4 uBox;uniform vec3 uSky;
  void main(){vec3 d=normalize(vW-cameraPosition);vec3 p=vW+d*((uBack-vW.x)/d.x);
   vec2 uv=vec2((p.z-uBox.x)/(uBox.y-uBox.x),(p.y-uBox.z)/(uBox.w-uBox.z));
   gl_FragColor=vec4(texture2D(tMap,uv).rgb*uGain*uSky,1.);}`}),[-HX-T-.01,(WY0+WY1)/2,(WZ0+WZ1)/2],[0,Math.PI/2,0]);add(root,view);

 /* a ceiling that nobody sees: it only keeps the sun and the sky out while the shadows are made */
 const ceiling=mesh(new THREE.BoxGeometry(RW+4,.1,RD+4),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}),[0,RH+.08,0]);ceiling.castShadow=true;add(root,ceiling);

 return {root,surfaces,ceiling,view,slab,shared,dims:{RW,RD,RH,HX,HZ,WZ0,WZ1,WY0,WY1}};
};
