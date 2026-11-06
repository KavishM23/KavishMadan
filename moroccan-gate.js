/* The gateway at the top of the staircase, built like a Moroccan bab: a horseshoe arch of alternating voussoirs inside a
   carved plaster frame, zellige tile below, a cedar canopy with a glazed tile roof, and two studded cedar doors that swing
   into a lantern-lit hall. Everything is modelled or drawn here; no image files. */
/* Procedural masonry shared by the gate and the staircase: each returns a colour map and a matching height map. */
window.createMasonry=function({THREE,anisotropy=4}){
 const seeded=n=>()=>(n=(n*16807)%2147483647)/2147483647;
 const sheet=size=>{const c=document.createElement('canvas');c.width=c.height=size;return[c,c.getContext('2d')]};
 const tex=(c,color)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=anisotropy;if(color)t.colorSpace=THREE.SRGBColorSpace;return t};
 const grain=(g,size,rand,amount)=>{const d=g.getImageData(0,0,size,size),p=d.data;for(let i=0;i<p.length;i+=4){const v=(rand()-.5)*amount;p[i]+=v;p[i+1]+=v;p[i+2]+=v}g.putImageData(d,0,0)};
 const blotches=(g,size,rand,count,ink)=>{for(let i=0;i<count;i++){const x=rand()*size,y=rand()*size,r=size*(.04+rand()*.16);for(const [ox,oy] of [[0,0],[size,0],[-size,0],[0,size],[0,-size]]){const f=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,r);f.addColorStop(0,ink(rand()));f.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=f;g.fillRect(x+ox-r,y+oy-r,2*r,2*r)}}};
 // Handmade Moroccan brick: long, thin, uneven, in thick recessed lime mortar. One sheet is 1.6 units square.
 function brick(){
  const size=1024,rows=16,perRow=4,rh=size/rows,rand=seeded(90317),[c,g]=sheet(size),[h,e]=sheet(size);
  g.fillStyle='#6d6152';g.fillRect(0,0,size,size);e.fillStyle='#2a2a2a';e.fillRect(0,0,size,size);
  const edge=(ctx,x,y,bw,bh,jit)=>{const n=7,p=[];for(let i=0;i<=n;i++)p.push([x+bw*i/n,y+(rand()-.5)*jit]);for(let i=1;i<=3;i++)p.push([x+bw+(rand()-.5)*jit,y+bh*i/3]);for(let i=n-1;i>=0;i--)p.push([x+bw*i/n,y+bh+(rand()-.5)*jit]);for(let i=2;i>0;i--)p.push([x+(rand()-.5)*jit,y+bh*i/3]);ctx.beginPath();p.forEach(([a,b],i)=>ctx[i?'lineTo':'moveTo'](a,b));ctx.closePath()};
  for(let r=0;r<rows;r++){const offset=(r%2?.5:0)*size/perRow+(rand()-.5)*20,joints=[];for(let i=0;i<perRow;i++)joints.push(offset+(i+(rand()-.5)*.16)*size/perRow);
   for(let i=0;i<perRow;i++){const x=joints[i],next=i<perRow-1?joints[i+1]:joints[0]+size,bw=next-x-9,y=r*rh+4,bh=rh-9,tone=rand(),burnt=tone<.2,pale=tone>.86,base=burnt?[58,35,26]:pale?[136,102,72]:[92+rand()*26,58+rand()*16,40+rand()*10],seedPath=rand()*1e9|0;
    for(const dx of [0,-size,size]){if(x+dx>size||x+dx+bw<0)continue;
     const keep=rand;edge(g,x+dx,y,bw,bh,5);g.fillStyle=`rgb(${base.map(v=>v|0)})`;g.fill();
     g.save();g.clip();for(let k=0;k<9;k++){g.fillStyle=`rgba(${keep()>.5?'20,12,8':'170,130,95'},${.05+keep()*.1})`;g.beginPath();g.ellipse(x+dx+keep()*bw,y+keep()*bh,14+keep()*50,5+keep()*14,keep(),0,7);g.fill()}g.fillStyle='rgba(20,12,8,.32)';g.fillRect(x+dx,y+bh-5,bw,6);g.restore();
     edge(e,x+dx,y,bw,bh,5);const lift=150+rand()*55|0;e.fillStyle=`rgb(${lift},${lift},${lift})`;e.fill();e.lineWidth=5;e.strokeStyle='#5a5a5a';e.stroke();
    }}}
  for(let i=0;i<1500;i++){const x=rand()*size,y=rand()*size,r=.8+rand()*2.6;e.fillStyle=`rgba(0,0,0,${.3+rand()*.5})`;e.beginPath();e.arc(x,y,r,0,7);e.fill();g.fillStyle='rgba(16,10,7,.5)';g.beginPath();g.arc(x,y,r*.8,0,7);g.fill()}
  blotches(g,size,rand,18,t=>t>.5?'rgba(14,10,8,.28)':'rgba(170,150,120,.1)');grain(g,size,rand,20);grain(e,size,rand,26);
  return{map:tex(c,true),bumpMap:tex(h,false),size:1.6}}
 // Worn limestone for the treads, with cloudy patches, pits and hairline cracks. One sheet is 2.4 units square.
 function limestone(){
  const size=1024,rand=seeded(51421),[c,g]=sheet(size),[h,e]=sheet(size);g.fillStyle='#b4ac9f';g.fillRect(0,0,size,size);e.fillStyle='#909090';e.fillRect(0,0,size,size);
  blotches(g,size,rand,70,t=>t>.5?'rgba(84,76,66,.2)':'rgba(226,218,204,.16)');blotches(e,size,rand,40,t=>t>.5?'rgba(40,40,40,.22)':'rgba(200,200,200,.18)');
  for(let i=0;i<9;i++){let x=rand()*size,y=rand()*size,a=rand()*7;g.strokeStyle='rgba(50,44,38,.42)';e.strokeStyle='rgba(20,20,20,.75)';g.lineWidth=e.lineWidth=1+rand()*1.4;g.beginPath();e.beginPath();g.moveTo(x,y);e.moveTo(x,y);for(let k=0;k<22;k++){a+=(rand()-.5)*.8;x+=Math.cos(a)*16;y+=Math.sin(a)*16;g.lineTo(x,y);e.lineTo(x,y)}g.stroke();e.stroke()}
  for(let i=0;i<5000;i++){const x=rand()*size,y=rand()*size,r=.5+rand()*rand()*3.4;g.fillStyle=`rgba(46,40,34,${.14+rand()*.3})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();e.fillStyle=`rgba(0,0,0,${.3+rand()*.5})`;e.beginPath();e.arc(x,y,r,0,7);e.fill()}
  grain(g,size,rand,16);grain(e,size,rand,30);return{map:tex(c,true),bumpMap:tex(h,false),size:2.4}}
 // Flagstones for the landing floor, each laid slightly differently. One sheet is 2.1 units square.
 function flagstone(){
  const size=1024,n=4,s=size/n,rand=seeded(23977),[c,g]=sheet(size),[h,e]=sheet(size);g.fillStyle='#17140f';g.fillRect(0,0,size,size);e.fillStyle='#161616';e.fillRect(0,0,size,size);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=46+rand()*26|0,l=150+rand()*60|0;g.fillStyle=`rgb(${v+8},${v+3},${v-3})`;g.fillRect(x*s+4,y*s+4,s-8,s-8);e.fillStyle=`rgb(${l},${l},${l})`;e.fillRect(x*s+4,y*s+4,s-8,s-8)}
  blotches(g,size,rand,34,t=>t>.5?'rgba(0,0,0,.22)':'rgba(190,170,140,.08)');for(let i=0;i<2600;i++){const x=rand()*size,y=rand()*size,r=.5+rand()*2.2;e.fillStyle=`rgba(0,0,0,${.3+rand()*.4})`;e.beginPath();e.arc(x,y,r,0,7);e.fill()}
  grain(g,size,rand,14);grain(e,size,rand,24);return{map:tex(c,true),bumpMap:tex(h,false),size:2.1}}
 const tune=(set,rx=1,ry=rx)=>{for(const t of [set.map,set.bumpMap])t.repeat.set(rx/set.size,ry/set.size);return set};
 return{brick:tune(brick()),limestone:tune(limestone()),flagstone:tune(flagstone())};
};

window.createMoroccanGate=function({THREE,Round,parent,wallLeft,wallRight,wallHeight,masonry,anisotropy=4,batch=root=>root}){
 const cx=-2.2,w=1.3,turn=.44,R=w/2/Math.cos(turn),archTop=2.5,cy=archTop-R,spring=cy-R*Math.sin(turn),floor=.117,base=floor+.013;
 const sand='#D9C8B0',hot='#B5563A',brassInk='#C9A45C',night='#141312';
 const add=(geometry,material,at=[0,0,0],host=parent)=>{const m=new THREE.Mesh(geometry,material);m.position.set(...at);host.add(m);return m};
 const canvas=(cw,ch)=>{const c=document.createElement('canvas');c.width=cw;c.height=ch;return[c,c.getContext('2d')]};
 const texture=(c,rx=1,ry=1,color=true)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=anisotropy;if(color)t.colorSpace=THREE.SRGBColorSpace;return t};
 const star=(g,x,y,r)=>{g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,q=i%2?r*.765:r;g[i?'lineTo':'moveTo'](x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath()};
 const seed=(n=>()=>(n=(n*16807)%2147483647)/2147483647)(4217);

 // Zellige: eight-pointed stars cut from glazed tile, set in dark grout
 function zelligeCanvas(){
  const size=1024,cells=4,s=size/cells,[c,g]=canvas(size,size),[h,e]=canvas(size,size);g.fillStyle='#2a241e';g.fillRect(0,0,size,size);e.fillStyle='#9a9a9a';e.fillRect(0,0,size,size);
  const inks=[[sand,hot],[hot,night],[night,brassInk],[brassInk,hot]];
  for(let y=0;y<cells;y++)for(let x=0;x<cells;x++){
   const X=(x+.5)*s,Y=(y+.5)*s,[a,b]=inks[(x+2*y)%4];
   star(g,X,Y,s*.5);g.fillStyle=a;g.fill();g.lineWidth=6;g.strokeStyle='#0b0a09';g.stroke();
   star(e,X,Y,s*.5);e.fillStyle='#e0e0e0';e.fill();e.lineWidth=11;e.strokeStyle='#141414';e.stroke();star(e,X,Y,s*.25);e.fillStyle='#f4f4f4';e.fill();e.lineWidth=7;e.stroke();
   star(g,X,Y,s*.25);g.fillStyle=b;g.fill();g.lineWidth=4;g.stroke();
   g.globalAlpha=.1+seed()*.14;star(g,X-s*.05,Y-s*.06,s*.3);g.fillStyle='#fff';g.fill();g.globalAlpha=1;
  }
  return[c,h]}
 // Gebs: a sebka lattice of lozenges carved into plaster; light from above, shadow below
 function plasterCanvas(){
  const size=512,n=2,s=size/n,[c,g]=canvas(size,size);g.fillStyle='#d3c4a6';g.fillRect(0,0,size,size);
  const lattice=(ink,dy,width)=>{g.strokeStyle=ink;g.lineWidth=width;g.lineJoin='round';
   for(let y=-1;y<=n;y++)for(let x=-1;x<=n;x++){const X=x*s+s/2,Y=y*s+s/2+dy;g.beginPath();g.moveTo(X,Y-s/2);g.quadraticCurveTo(X+s*.14,Y-s*.14,X+s/2,Y);g.quadraticCurveTo(X+s*.14,Y+s*.14,X,Y+s/2);g.quadraticCurveTo(X-s*.14,Y+s*.14,X-s/2,Y);g.quadraticCurveTo(X-s*.14,Y-s*.14,X,Y-s/2);g.stroke()}};
  lattice('#8d7c60',5,15);lattice('#efe4cc',0,11);
  for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)for(const [ox,oy] of [[0,0],[s/2,s/2]]){const X=x*s+ox,Y=y*s+oy;g.fillStyle='#8d7c60';star(g,X,Y+3,s*.11);g.fill();g.fillStyle='#efe4cc';star(g,X,Y,s*.1);g.fill();g.fillStyle='#a8966f';g.beginPath();g.arc(X,Y,s*.03,0,7);g.fill()}
  return c}
 // Door paint: deep blue over cedar, thin along the grain, rubbed back where hands and feet reach it
 function doorCanvas(){
  const cw=512,ch=1024,[c,g]=canvas(cw,ch),[h,e]=canvas(cw,ch);g.fillStyle='#1c4158';g.fillRect(0,0,cw,ch);e.fillStyle='#808080';e.fillRect(0,0,cw,ch);
  for(let i=0;i<900;i++){const x=seed()*cw,y=seed()*ch,l=40+seed()*300,dark=seed()>.45;g.strokeStyle=dark?`rgba(9,28,41,${.05+seed()*.12})`:`rgba(92,136,158,${.03+seed()*.09})`;g.lineWidth=.6+seed()*1.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+(seed()-.5)*7,y+l);g.stroke();e.strokeStyle=dark?'rgba(70,70,70,.5)':'rgba(170,170,170,.4)';e.lineWidth=g.lineWidth;e.beginPath();e.moveTo(x,y);e.lineTo(x+(seed()-.5)*7,y+l);e.stroke()}
  // cedar showing through at the kick rail, the meeting stile and around the pull, in fine brushed flecks
  const rub=(x,y,rx,ry,n)=>{for(let i=0;i<n;i++){const a=seed()*6.28,d=Math.pow(seed(),1.7),px=x+Math.cos(a)*d*rx,py=y+Math.sin(a)*d*ry;g.fillStyle=`rgba(${120+seed()*40|0},${78+seed()*30|0},${48+seed()*22|0},${.07+seed()*.18})`;g.fillRect(px,py,1+seed()*2,5+seed()*26)}};
  rub(cw/2,ch-26,cw*.55,36,520);rub(cw-14,ch*.56,18,ch*.16,260);rub(cw-90,ch*.56,62,70,150);rub(16,ch*.5,10,ch*.4,120);
  return[c,h]}
 // Mashrabiya: warm light behind a carved screen at the end of the hall
 function screenCanvas(){
  const cw=512,ch=768,[c,g]=canvas(cw,ch),glow=g.createRadialGradient(cw/2,ch*.56,20,cw/2,ch*.56,ch*.62);glow.addColorStop(0,'#ffe4bd');glow.addColorStop(.5,'#f9944f');glow.addColorStop(1,'#a83218');g.fillStyle=glow;g.fillRect(0,0,cw,ch);
  const s=cw/5;g.strokeStyle='#1a0e08';g.lineWidth=13;g.lineJoin='round';for(let y=-1;y<8;y++)for(let x=-1;x<6;x++){star(g,(x+.5)*s,(y+.5)*s,s*.52);g.stroke();star(g,(x+1)*s,(y+1)*s,s*.18);g.stroke()}
  g.lineWidth=30;g.strokeRect(0,0,cw,ch);return c}

 const [zelligeArt,zelligeHeight]=zelligeCanvas(),plasterArt=plasterCanvas(),[doorArt,doorGrain]=doorCanvas(),screenArt=screenCanvas();
 const tile=(rx,ry)=>new THREE.MeshPhysicalMaterial({map:texture(zelligeArt,rx,ry),bumpMap:texture(zelligeHeight,rx,ry,false),bumpScale:1.5,roughness:.26,metalness:.02,clearcoat:.6,clearcoatRoughness:.2,envMapIntensity:.5});
 const plasterMap=texture(plasterArt,2.1,2.1),plasterBump=texture(plasterArt,2.1,2.1,false);
 const plaster=new THREE.MeshStandardMaterial({map:plasterMap,bumpMap:plasterBump,bumpScale:2.4,roughness:.9,envMapIntensity:.35});
 const wallMat=new THREE.MeshStandardMaterial({map:masonry.brick.map,bumpMap:masonry.brick.bumpMap,bumpScale:2.6,color:0xd8cdbe,roughness:.92,envMapIntensity:.22});
 const dressed=new THREE.MeshStandardMaterial({map:masonry.limestone.map,bumpMap:masonry.limestone.bumpMap,bumpScale:1.4,color:0x9c9284,roughness:.8,envMapIntensity:.25});
 const brass=new THREE.MeshStandardMaterial({color:0xc9a45c,metalness:1,roughness:.32,envMapIntensity:.9});
 const iron=new THREE.MeshStandardMaterial({color:0x151412,metalness:.7,roughness:.42});
 const cedar=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.62,envMapIntensity:.35});
 const copper=new THREE.MeshStandardMaterial({color:0xeb5939,metalness:.55,roughness:.36});
 const stoneSand=new THREE.MeshStandardMaterial({color:0xb7ab98,roughness:.48,envMapIntensity:.4});
 const glazed=new THREE.MeshPhysicalMaterial({color:0xa83a1f,roughness:.3,clearcoat:.8,clearcoatRoughness:.2,side:THREE.DoubleSide,envMapIntensity:.6});

 const archPoints=(grow=0,bottom=.06)=>{const half=w/2+grow,r=R+grow,a=Math.acos(half/r),p=[new THREE.Vector2(cx-half,bottom)];for(let i=0;i<=56;i++){const t=Math.PI+a-(Math.PI+2*a)*i/56;p.push(new THREE.Vector2(cx+Math.cos(t)*r,cy+Math.sin(t)*r))}p.push(new THREE.Vector2(cx+half,bottom));return p};
 const archHole=(grow=0,bottom=.06)=>new THREE.Path(archPoints(grow,bottom));
 const rect=(x0,y0,x1,y1)=>{const s=new THREE.Shape();s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();return s};
 const worldUv=g=>{const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));if(x>=y&&x>=z)u.setXY(i,p.getZ(i),p.getY(i));else if(y>=z)u.setXY(i,p.getX(i),p.getZ(i));else u.setXY(i,p.getX(i),p.getY(i))}return g};
 const extrude=(shape,depth)=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});

 // wall and carved frame
 const wallShape=rect(wallLeft,0,wallRight,wallHeight);wallShape.holes.push(archHole());add(extrude(wallShape,.3),wallMat,[0,0,-.3]);
 const half=1.35,frameTop=3,frameShape=rect(cx-half,.02,cx+half,frameTop);frameShape.holes.push(archHole());add(extrude(frameShape,.05),[plaster,wallMat],[0,0,0]);
 for(const [x,y,sw,sh] of [[cx,frameTop-.02,2*half+.08,.05],[cx-half,1.5,.05,3],[cx+half,1.5,.05,3]])add(new Round(sw,sh,.09,2,.012),brass,[x,y,.04]);

 // zellige dado along the wall, with a brass rail above it
 const dadoH=.98,leftEnd=cx-.83,rightEnd=cx+.83;
 for(const [x0,x1] of [[wallLeft,leftEnd],[rightEnd,wallRight]]){const dw=x1-x0;add(new THREE.BoxGeometry(dw,dadoH,.07),tile(dw/.8,dadoH/.8),[(x0+x1)/2,dadoH/2+.03,.035]);add(new Round(dw,.035,.095,2,.012),brass,[(x0+x1)/2,dadoH+.04,.045])}

 // horseshoe arch: alternating voussoirs, a reveal, and a thin brass line outside them
 const count=33,span=Math.PI+2*turn,voussoir=new THREE.BoxGeometry(.15,(R+.09)*span/count*.93,.06),terra=new THREE.MeshStandardMaterial({color:0xa4563c,roughness:.62,envMapIntensity:.35}),rings=[new THREE.InstancedMesh(voussoir,stoneSand,17),new THREE.InstancedMesh(voussoir,terra,16)],place=new THREE.Object3D(),seen=[0,0];
 for(let i=0;i<count;i++){const t=Math.PI+turn-span*(i+.5)/count,k=i%2;place.position.set(cx+Math.cos(t)*(R+.095),cy+Math.sin(t)*(R+.095),.075);place.rotation.set(0,0,t);place.updateMatrix();rings[k].setMatrixAt(seen[k]++,place.matrix)}
 rings.forEach(r=>parent.add(r));
 // the brass line is an open band that follows the arc and stops at the springing, so nothing crosses the doorway
 const bandPoints=[];for(let i=0;i<=56;i++){const t=Math.PI+turn-span*i/56;bandPoints.push(new THREE.Vector2(cx+Math.cos(t)*(R+.2),cy+Math.sin(t)*(R+.2)))}for(let i=56;i>=0;i--){const t=Math.PI+turn-span*i/56;bandPoints.push(new THREE.Vector2(cx+Math.cos(t)*(R+.175),cy+Math.sin(t)*(R+.175)))}
 add(extrude(new THREE.Shape(bandPoints),.09),brass,[0,0,.02]);
 // A timber frame fills the wall opening: the arch is the outer edge, and a planted stop gives the leaves something to close against.
 const frameW=.05,stopW=.018,sill=floor+.042,openHalf=w/2-frameW;
 const ring=(outer,inner,bottom,innerBottom=bottom)=>{const shape=new THREE.Shape(archPoints(outer,bottom));shape.holes.push(archHole(inner,innerBottom));return shape};
 const frameWood=new THREE.MeshStandardMaterial({map:masonry.limestone.map,color:0x4a2c19,roughness:.58,envMapIntensity:.35});
 const seal=new THREE.MeshStandardMaterial({color:0x0c0d0e,roughness:.85});
 add(new THREE.ExtrudeGeometry(ring(.012,-frameW,floor),{depth:.296,bevelEnabled:true,bevelSize:.005,bevelThickness:.005,bevelSegments:1,curveSegments:24}),frameWood,[0,0,-.306]);
 add(extrude(ring(-frameW+.002,-frameW-stopW,sill-.02),.022),frameWood,[0,0,-.086]);
 add(extrude(ring(-frameW-.004,-frameW-.012,sill-.02),.008),seal,[0,0,-.094]);
 add(extrude(ring(.014,.002,floor),.012),brass,[0,0,-.004]);

 // jambs: tile strips and slim columns with carved capitals
 for(const side of [-1,1]){
  const x=cx+side*(w/2+.095);add(new THREE.BoxGeometry(.15,spring-.04,.06),tile(.19,(spring-.04)/.8),[x,(spring+.04)/2,.075]);
  const columnX=cx+side*.775,pedestal=.17,imposts=1.33,tall=imposts-(floor+pedestal);
  add(new Round(.22,pedestal,.21,2,.015),stoneSand,[columnX,floor+pedestal/2,.15]);add(new Round(.25,.03,.24,2,.01),stoneSand,[columnX,floor+pedestal+.012,.15]);
  const shaft=[[.075,0],[.078,.02],[.056,.055],[.062,.08],[.047,.12],[.042,.5],[.04,tall-.3],[.052,tall-.27],[.042,tall-.24],[.052,tall-.21],[.044,tall-.18],[.062,tall-.13],[.082,tall-.07],[.1,tall-.02],[.1,tall]].map(([r,y])=>new THREE.Vector2(r,y));
  add(new THREE.LatheGeometry(shaft,28),stoneSand,[columnX,floor+pedestal+.02,.15]);
  add(new Round(.29,.09,.26,2,.012),stoneSand,[columnX,imposts+.045,.15]);add(new Round(.31,.016,.28,1,.006),brass,[columnX,imposts+.095,.15]);
  // brass rosette in each spandrel
  const rose=new THREE.Group();rose.position.set(cx+side*.98,2.42,.05);parent.add(rose);
  add(new THREE.CylinderGeometry(.17,.17,.018,32).rotateX(Math.PI/2),iron,[0,0,.01],rose);
  add(new THREE.SphereGeometry(.05,18,12),brass,[0,0,.03],rose).scale.z=.7;
  for(let i=0;i<8;i++){const a=i*Math.PI/4,petal=add(new THREE.SphereGeometry(.05,14,10),brass,[Math.cos(a)*.105,Math.sin(a)*.105,.024],rose);petal.scale.set(1.3,.52,.5);petal.rotation.z=a}
 }

 // frieze with the START sign
 add(new Round(2*half-.1,.22,.03,2,.01),iron,[cx,2.84,.062]);
 const [signArt,sign]=canvas(768,96),signMap=texture(signArt);
 const drawSign=()=>{sign.clearRect(0,0,768,96);sign.fillStyle='#C9A45C';sign.font='600 54px "League Spartan","Avenir Next",sans-serif';sign.textAlign='center';sign.textBaseline='middle';if('letterSpacing' in sign)sign.letterSpacing='20px';sign.fillText('START',384,54);for(const x of [150,618]){star(sign,x,48,22);sign.fill()}signMap.needsUpdate=true};
 drawSign();document.fonts?.load('600 54px "League Spartan"').then(drawSign).catch(()=>{});
 add(new THREE.PlaneGeometry(1.76,.22),new THREE.MeshBasicMaterial({map:signMap,transparent:true,toneMapped:false}),[cx,2.84,.08]);

 // cedar canopy: stepped corbels under an eave, glazed barrel tiles above
 const canopyW=3,corbels=15,tier=[new THREE.BoxGeometry(.11,.055,.2),new THREE.BoxGeometry(.11,.055,.33),new THREE.BoxGeometry(.11,.055,.46)];
 tier.forEach((g,n)=>{const m=new THREE.InstancedMesh(g,cedar,corbels);for(let i=0;i<corbels;i++){place.position.set(cx+(i-(corbels-1)/2)*canopyW/corbels,3.06+n*.055,[.1,.165,.23][n]);place.rotation.set(0,0,0);place.updateMatrix();m.setMatrixAt(i,place.matrix)}parent.add(m)});
 add(new Round(canopyW+.08,.07,.1,2,.02),cedar,[cx,3,.05]);add(new Round(canopyW+.08,.06,.09,2,.02),cedar,[cx,3.22,.46]);
 function tileRoof(width,length,origin,pitch,up){
  const group=new THREE.Group();group.position.set(...origin);group.rotation.x=pitch;parent.add(group);
  add(new THREE.BoxGeometry(width+.1,length,.03),cedar,[0,length/2,-up*.03],group);
  const across=Math.round(width/.158),rows=Math.max(2,Math.round(length/.3)),long=length/rows+.05,count=across*rows,tiles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.084,.1,long,10,1,true,up<0?Math.PI/2:-Math.PI/2,Math.PI),glazed,count),tint=new THREE.Color();
  for(let i=0,n=0;i<rows;i++)for(let k=0;k<across;k++,n++){place.position.set((k-(across-1)/2)*width/across,(i+.5)*length/rows,-up*.015);place.rotation.set(0,0,0);place.updateMatrix();tiles.setMatrixAt(n,place.matrix);const v=.74+seed()*.34;tint.setRGB(v,v*(.92+seed()*.1),v*(.88+seed()*.12));tiles.setColorAt(n,tint)}
  group.add(tiles);add(new THREE.CylinderGeometry(.06,.06,width+.12,12),glazed,[0,.02,up*.02],group).rotation.z=Math.PI/2;return group}
 tileRoof(canopyW,.62,[cx,wallHeight-.01,.01],Math.PI/2+.34,-1);

 // the hall behind the doors
 const hallW=1.56,hallH=2.75,hallD=1.25,hallZ=-.3-hallD/2,hallY=floor+hallH/2,hide=new THREE.MeshBasicMaterial({visible:false});
 const hallWall=new THREE.MeshStandardMaterial({color:0x8a5f42,roughness:.8,side:THREE.BackSide,envMapIntensity:.15});
 const hallRoof=new THREE.MeshStandardMaterial({color:0x2b1a11,roughness:.7,side:THREE.BackSide});
 const hallFloor=tile(1.9,1.56);hallFloor.side=THREE.BackSide;
 const hallEnd=new THREE.MeshBasicMaterial({map:texture(screenArt),side:THREE.BackSide,toneMapped:false,fog:false});
 add(new THREE.BoxGeometry(hallW,hallH,hallD),[hallWall,hallWall,hallRoof,hallFloor,hide,hallEnd],[cx,hallY,hallZ]);
 const outerW=hallW+.12,outerD=hallD+.08,rearZ=hallZ-.03-outerD/2;
 add(worldUv(new THREE.BoxGeometry(outerW,hallH+.1,outerD)),[wallMat,wallMat,wallMat,wallMat,hide,wallMat],[cx,hallY,hallZ-.03]);
 // stone plinth, a tile roof falling away from the wall, coping and stepped merlons along the top of the wall
 for(const side of [-1,1])add(new Round(.1,.34,outerD,2,.015),dressed,[cx+side*(outerW/2+.03),floor+.17,hallZ-.03]);
 add(new Round(outerW+.16,.34,.1,2,.015),dressed,[cx,floor+.17,rearZ-.03]);
 for(const side of [-1,1])add(new Round(.06,.06,outerD,2,.012),dressed,[cx+side*(outerW/2+.015),floor+1.55,hallZ-.03]);
 add(new Round(outerW+.09,.06,.06,2,.012),dressed,[cx,floor+1.55,rearZ-.015]);
 tileRoof(outerW+.16,outerD+.2,[cx,wallHeight-.2,-.3],-(Math.PI/2+.18),1);
 add(new Round(wallRight-wallLeft+.08,.07,.38,2,.02),dressed,[(wallLeft+wallRight)/2,wallHeight+.03,-.15]);
 const merlonShape=new THREE.Shape();[[-.17,0],[.17,0],[.17,.12],[.09,.12],[.09,.22],[0,.32],[-.09,.22],[-.09,.12],[-.17,.12]].forEach(([x,y],i)=>merlonShape[i?'lineTo':'moveTo'](x,y));merlonShape.closePath();
 const merlonGeometry=new THREE.ExtrudeGeometry(merlonShape,{depth:.22,bevelEnabled:false}),merlonCount=Math.floor((wallRight-wallLeft)/.5),merlons=new THREE.InstancedMesh(merlonGeometry,wallMat,merlonCount);
 for(let i=0;i<merlonCount;i++){place.position.set(wallLeft+(i+.5)*(wallRight-wallLeft)/merlonCount,wallHeight+.06,-.26);place.rotation.set(0,0,0);place.updateMatrix();merlons.setMatrixAt(i,place.matrix)}parent.add(merlons);
 // a small lit window in the back of the hall, behind an iron grille
 const rear=new THREE.Group();rear.position.set(cx,0,rearZ-.002);rear.rotation.y=Math.PI;parent.add(rear);
 const smallArch=(halfW,top,bottom)=>{const r=halfW/Math.cos(.44),mid=top-r,p=[new THREE.Vector2(-halfW,bottom)];for(let i=0;i<=30;i++){const t=Math.PI+.44-(Math.PI+.88)*i/30;p.push(new THREE.Vector2(Math.cos(t)*r,mid+Math.sin(t)*r))}p.push(new THREE.Vector2(halfW,bottom));return p};
 add(new THREE.ShapeGeometry(new THREE.Shape(smallArch(.26,2.24,1.72))),new THREE.MeshBasicMaterial({map:texture(screenArt,1.4,1),toneMapped:false,fog:false}),[0,0,.005],rear);
 const trim=new THREE.Shape(smallArch(.33,2.31,1.66));trim.holes.push(new THREE.Path(smallArch(.26,2.24,1.72)));add(extrude(trim,.05),dressed,[0,0,0],rear);
 add(new Round(.82,.05,.1,2,.012),dressed,[0,1.64,.03],rear);
 for(const x of [-.13,0,.13])add(new Round(.016,.56,.016,1,.004),iron,[x,1.98,.03],rear);add(new Round(.54,.016,.016,1,.004),iron,[0,1.98,.03],rear);
 for(const side of [-1,1]){const dado=add(new THREE.PlaneGeometry(hallD,.86),tile(1.56,1.07),[cx+side*(hallW/2-.012),floor+.44,hallZ]);dado.rotation.y=-side*Math.PI/2}
 // sill: a worn stone step with a brass weather bar under the closed leaves
 add(new Round(w+.2,.05,.62,3,.016),stoneSand,[cx,floor+.017,-.04]);add(new Round(w-.12,.012,.05,2,.005),brass,[cx,sill+.003,-.14]);

 // a pierced brass lantern
 const lantern=new THREE.Group();lantern.position.set(cx,2.08,hallZ+.1);parent.add(lantern);
 add(new THREE.CylinderGeometry(.008,.008,.56,6),brass,[0,.52,0],lantern);
 add(new THREE.CylinderGeometry(.095,.14,.3,8,1,true),new THREE.MeshBasicMaterial({map:texture(screenArt,.7,.5),side:THREE.DoubleSide,toneMapped:false,fog:false}),[0,0,0],lantern);
 add(new THREE.ConeGeometry(.125,.13,8),brass,[0,.215,0],lantern);add(new THREE.SphereGeometry(.03,12,10),brass,[0,.29,0],lantern);add(new THREE.CylinderGeometry(.15,.115,.04,8),brass,[0,-.17,0],lantern);

 // the doors: framed joinery on real hinges. Each leaf hangs from an axis at its back corner, so it swings clear of the frame into the hall.
 const leafT=.085,gap=.006,leafFront=-.098,axisZ=leafFront-leafT-.002,base2=sill+.012,leafW=openHalf-gap,leafR=R-frameW-gap,leafH=cy-base2+leafR;
 const leafTop=x=>{const d=openHalf-x;return cy-base2+Math.sqrt(Math.max(0,leafR*leafR-d*d))};   // x runs from the hinge
 const doorBump=texture(doorGrain,1,1,false),paintOf=(flip,tint=0xffffff)=>{const t=texture(doorArt,(flip?-1:1)/leafW,1/leafH);return new THREE.MeshStandardMaterial({map:t,bumpMap:doorBump,bumpScale:.7,color:tint,roughness:.46,metalness:.02,envMapIntensity:.55})};
 const creamInlay=new THREE.MeshStandardMaterial({color:0xcbb88f,roughness:.42,metalness:.15,envMapIntensity:.5});
 const edge=new THREE.MeshStandardMaterial({color:0x4d3423,roughness:.6}),hingeIron=new THREE.MeshStandardMaterial({color:0x1b1c1e,metalness:.75,roughness:.46,envMapIntensity:.6});
 const studGeo=new THREE.SphereGeometry(.015,10,6),boltGeo=new THREE.CylinderGeometry(.009,.009,.008,6).rotateX(Math.PI/2);
 const shapeOf=pts=>{const q=new THREE.Shape();pts.forEach(([x,y],i)=>q[i?'lineTo':'moveTo'](x,y));q.closePath();return q};
 const panels=(dir)=>{const rail=.075,mid=.05,sx=.07,ex=leafW-.07,y0=rail+.05,y1=.72,y2=y1+mid+.06,y3=1.32,y4=y3+mid+.06,list=[[[sx,y0],[ex,y0],[ex,y1],[sx,y1]],[[sx,y2],[ex,y2],[ex,y3],[sx,y3]]];
  const top=[[sx,y4],[ex,y4]];for(let i=0;i<=14;i++){const x=ex-(ex-sx)*i/14;top.push([x,leafTop(x)-.075])}top.push([sx,y4]);list.push(top);return list.map(p=>p.map(([x,y])=>[dir*x,y]))};
 const spade=(dir,len)=>shapeOf([[0,-.02],[len-.05,-.016],[len-.03,-.034],[len,0],[len-.03,.034],[len-.05,.016],[0,.02]].map(([x,y])=>[dir*x,y]));
 const hingeY=[.105,.79,1.39];  // hinges sit on the rails, where the joinery is strongest
 const pivots=[-1,1].map(side=>{
  const dir=-side,pivot=new THREE.Group();pivot.position.set(cx+side*openHalf,base2,axisZ);parent.add(pivot);
  const outline=[[gap,.002],[leafW,.002]];for(let i=0;i<=22;i++){const x=leafW-(leafW-gap)*i/22;outline.push([x,leafTop(x)])}
  const body=shapeOf(outline.map(([x,y])=>[dir*x,y])),holes=panels(dir);holes.forEach(h=>body.holes.push(new THREE.Path(h.map(([x,y])=>new THREE.Vector2(x,y)))));
  const paint=paintOf(dir<0),deep=paintOf(dir<0,0xc7d6df);
  add(new THREE.ExtrudeGeometry(body,{depth:leafT-.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1,curveSegments:8}),[paint,edge],[0,0,.004],pivot);
  // raised and fielded panels, seen from both faces, each with a cream star and brass boss
  holes.forEach((h,i)=>{
   add(new THREE.ExtrudeGeometry(shapeOf(h),{depth:.03,bevelEnabled:true,bevelSize:.016,bevelThickness:.014,bevelOffset:-.018,bevelSegments:1,curveSegments:6}),[deep,deep],[0,0,leafT/2-.015],pivot);
   const xs=h.map(p=>p[0]),ys=h.map(p=>p[1]),X=(Math.min(...xs)+Math.max(...xs))/2,Y=i<2?(Math.min(...ys)+Math.max(...ys))/2:Math.min(...ys)+.3,r=i===1?.075:.095;
   const pts=[];for(let k=0;k<16;k++){const a=k*Math.PI/8,q=k%2?r*.74:r;pts.push([X+Math.cos(a)*q,Y+Math.sin(a)*q])}
   for(const z of [leafT/2+.03,leafT/2-.042])add(new THREE.ExtrudeGeometry(shapeOf(pts),{depth:.012,bevelEnabled:false,curveSegments:1}),creamInlay,[0,0,z],pivot);
   for(const z of [leafT/2+.046,leafT/2-.046])add(new THREE.SphereGeometry(.024,12,8),brass,[X,Y,z],pivot).scale.z=.6;
  });
  // studs on the outer face only, tracing the stiles and rails
  const spots=[];for(let y=.06;y<leafTop(.03)-.04;y+=.13)spots.push([.03,y]);for(let y=.06;y<leafTop(leafW-.035)-.04;y+=.13)spots.push([leafW-.035,y]);for(const y of [.72+.03,.72+.1,1.32+.03,1.32+.1])for(let x=.34;x<leafW-.06;x+=.1)spots.push([x,y]);
  const studs=new THREE.InstancedMesh(studGeo,brass,spots.length);spots.forEach(([x,y],i)=>{place.position.set(dir*x,y,leafT+.002);place.rotation.set(0,0,0);place.scale.set(1,1,.6);place.updateMatrix();studs.setMatrixAt(i,place.matrix)});place.scale.set(1,1,1);pivot.add(studs);
  // strap hinges wrap the hinge stile, and the leaf side of each hinge barrel turns with it
  const bolts=new THREE.InstancedMesh(boltGeo,brass,hingeY.length*6);let bi=0;
  for(const y of hingeY){const len=.3;for(const z of [leafT+.002,-.006]){add(new THREE.ExtrudeGeometry(spade(dir,len),{depth:.006,bevelEnabled:false,curveSegments:1}),hingeIron,[0,y,z],pivot);for(const x of [.06,.15,.24]){place.position.set(dir*x,y,z<0?z-.001:z+.008);place.rotation.set(0,0,0);place.updateMatrix();bolts.setMatrixAt(bi++,place.matrix)}}
   add(new THREE.CylinderGeometry(.015,.015,.05,12),hingeIron,[0,y,0],pivot)}
  pivot.add(bolts);
  // a door pull on each face, the ring free to swing as the leaf moves
  const px=leafW-.085,py=1.02,rings=[];
  for(const [z,flip] of [[leafT,1],[0,-1]]){const plate=[];for(let k=0;k<16;k++){const a=k*Math.PI/8,q=k%2?.042:.056;plate.push([dir*px+Math.cos(a)*q,py+Math.sin(a)*q])}
   add(new THREE.ExtrudeGeometry(shapeOf(plate),{depth:.007,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1,curveSegments:1}),brass,[0,0,z-(flip<0?.009:0)],pivot);
   add(new THREE.SphereGeometry(.014,10,8),brass,[dir*px,py,z+flip*.012],pivot);
   const hang=new THREE.Group();hang.position.set(dir*px,py+.004,z+flip*.02);pivot.add(hang);add(new THREE.TorusGeometry(.045,.0075,8,24),brass,[0,-.046,0],hang).rotation.y=Math.PI/2*0;rings.push(hang)}
  // the bottom of the leaf: a brass kick strip and a dark brush seal against the weather bar
  add(new Round(leafW-.05,.075,.006,1,.002),brass,[dir*(leafW/2+.015),.042,leafT+.002],pivot);add(new Round(leafW-.03,.012,.03,1,.003),seal,[dir*(leafW/2+.008),.002,leafT/2],pivot);
  batch(pivot);
  return{pivot,side,rings}});
 // fixed halves of the hinge barrels, on the frame above and below each leaf knuckle
 for(const side of [-1,1])for(const y of hingeY)for(const dy of [-.042,.042]){add(new THREE.CylinderGeometry(.015,.015,.03,12),hingeIron,[cx+side*openHalf,base2+y+dy,axisZ]);add(new Round(.012,.03,.05,1,.003),hingeIron,[cx+side*(openHalf+.008),base2+y+dy,axisZ+.02])}
 const closer=pivots[1],latchX=-leafW-.004;
 // the meeting edge: an astragal on the right leaf closes the gap, with the lock case and keyhole below the pull
 add(new Round(.03,leafTop(leafW)-.05,.008,1,.003),brass,[latchX,(leafTop(leafW)-.05)/2+.015,leafT+.004],closer.pivot);
 add(new Round(.05,.13,.008,1,.004),brass,[-leafW+.05,.86,leafT+.003],closer.pivot);add(new THREE.CylinderGeometry(.008,.008,.004,10).rotateX(Math.PI/2),seal,[-leafW+.05,.875,leafT+.009],closer.pivot);add(new Round(.006,.018,.003,1,.001),seal,[-leafW+.05,.861,leafT+.008],closer.pivot);
 // flush bolts on the back of the left leaf hold it to the sill and the head of the frame
 for(const y of [.14,1.72])add(new Round(.014,.16,.012,1,.004),brass,[leafW-.03,y,-.008],pivots[0].pivot);

 // Contact shading the shadow map is too soft to give: the door sits back in its frame, and the wall meets the ground.
 const [shadeArt,shadeInk]=canvas(256,512);shadeInk.filter='blur(14px)';shadeInk.strokeStyle='rgba(6,8,10,.86)';shadeInk.lineWidth=46;const toUv=([x,y])=>[(x-(cx-.7))/1.4*256,512-(y/2.6)*512];shadeInk.beginPath();archPoints(-frameW-stopW,.1).forEach((p,i)=>{const [u,v]=toUv([p.x,p.y]);shadeInk[i?'lineTo':'moveTo'](u,v)});shadeInk.stroke();
 const recess=add(new THREE.PlaneGeometry(1.4,2.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadeArt),transparent:true,depthWrite:false,toneMapped:false,color:0xffffff}),[cx,1.3,leafFront+.004]);
 const [footArt,footInk]=canvas(8,64),foot=footInk.createLinearGradient(0,0,0,64);foot.addColorStop(0,'rgba(10,8,6,.62)');foot.addColorStop(1,'rgba(10,8,6,0)');footInk.fillStyle=foot;footInk.fillRect(0,0,8,64);
 for(const [x0,x1] of [[wallLeft,cx-w/2-.1],[cx+w/2+.1,wallRight]]){const f=add(new THREE.PlaneGeometry(x1-x0,.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(footArt),transparent:true,depthWrite:false,toneMapped:false}),[(x0+x1)/2,floor+.006,.23]);f.rotation.x=-Math.PI/2}

 // a pair of wall lamps give the door its own light, stronger at night
 const lampGlass=new THREE.MeshBasicMaterial({color:0xffc27e,toneMapped:false});
 for(const s of [-1,1]){const x=cx+s*1.13,y=1.72;add(new THREE.CylinderGeometry(.05,.05,.012,16).rotateX(Math.PI/2),brass,[x,y+.13,.06]);add(new Round(.012,.012,.14,1,.003),brass,[x,y+.13,.12]);add(new THREE.CylinderGeometry(.07,.05,.13,8),lampGlass,[x,y,.19]);add(new THREE.ConeGeometry(.095,.07,8),brass,[x,y+.1,.19]);add(new THREE.CylinderGeometry(.052,.04,.024,8),brass,[x,y-.075,.19]);for(let k=0;k<4;k++){const a=k*Math.PI/2+.39;add(new THREE.CylinderGeometry(.004,.004,.14,5),brass,[x+Math.cos(a)*.062,y,.19+Math.sin(a)*.062])}}
 const doorLamp=new THREE.PointLight(0xffd3a0,1.6,4.2,2);doorLamp.position.set(cx,2.1,1.05);parent.add(doorLamp);
 const theme=dark=>{doorLamp.intensity=dark?3.4:1.5;lampGlass.color.set(dark?0xffdca8:0xffc27e)};theme(document.documentElement.dataset.theme==='dark');addEventListener('site-theme',e=>theme(e.detail.dark));

 // what the open doors let out: a star medallion on the floor, a pool of light, warm lamps
 const medallion=add(new THREE.CircleGeometry(.72,48),tile(.9,.9),[cx,floor+.004,1.02]);medallion.rotation.x=-Math.PI/2;
 add(new THREE.RingGeometry(.72,.75,64).rotateX(-Math.PI/2),brass,[cx,floor+.005,1.02]);
 const [spillArt,spillInk]=canvas(128,128),fade=spillInk.createRadialGradient(64,128,0,64,128,64);fade.addColorStop(0,'rgba(255,195,135,.5)');fade.addColorStop(.55,'rgba(235,110,70,.16)');fade.addColorStop(1,'rgba(235,89,57,0)');spillInk.fillStyle=fade;spillInk.fillRect(0,0,128,128);
 const spill=add(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(spillArt),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),[cx,floor+.012,.95]);spill.rotation.x=-Math.PI/2;
 const hallLight=new THREE.PointLight(0xffb37a,3,4,2);hallLight.position.set(cx,1.75,hallZ+.1);parent.add(hallLight);
 const porchLight=new THREE.PointLight(0xffb37a,0,6,2);porchLight.position.set(cx,1.15,.8);parent.add(porchLight);

 // Heavy timber: the right leaf unlatches and leads, the left follows a beat behind, and both come to rest gently at the hall walls.
 const OPEN=1.6,eased=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)};let last=0,ringV=0,ringA=0;
 const swing=(open,flare=0)=>{pivots[1].pivot.rotation.y=-OPEN*eased(open*1.04);pivots[0].pivot.rotation.y=OPEN*eased((open-.06)/.94);ringV+=(open-last)*9;last=open;recess.material.opacity=1-eased(open*7);recess.visible=open<.15;spill.material.opacity=Math.min(1,open+flare*.6);porchLight.intensity=open*3.6+flare*10;hallLight.intensity=3+open*2.6+flare*5};
 const tick=dt=>{if(Math.abs(ringV)<.002&&Math.abs(ringA)<.002)return false;ringV+=(-ringA*38-ringV*5.5)*dt;ringA+=ringV*dt;for(const {rings} of pivots)for(const r of rings)r.rotation.x=ringA;return true};
 swing(0);
 batch(parent);
 return{swing,tick,doorway:{cx,top:archTop,bottom:base2,half:w/2}};
};
