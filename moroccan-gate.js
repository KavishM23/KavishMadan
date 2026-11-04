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

window.createMoroccanGate=function({THREE,Round,parent,wallLeft,wallRight,wallHeight,masonry,anisotropy=4}){
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
  const size=512,n=2,s=size/n,[c,g]=canvas(size,size);g.fillStyle='#3a342c';g.fillRect(0,0,size,size);
  const lattice=(ink,dy,width)=>{g.strokeStyle=ink;g.lineWidth=width;g.lineJoin='round';
   for(let y=-1;y<=n;y++)for(let x=-1;x<=n;x++){const X=x*s+s/2,Y=y*s+s/2+dy;g.beginPath();g.moveTo(X,Y-s/2);g.quadraticCurveTo(X+s*.14,Y-s*.14,X+s/2,Y);g.quadraticCurveTo(X+s*.14,Y+s*.14,X,Y+s/2);g.quadraticCurveTo(X-s*.14,Y+s*.14,X-s/2,Y);g.quadraticCurveTo(X-s*.14,Y-s*.14,X,Y-s/2);g.stroke()}};
  lattice('#1e1a15',5,15);lattice('#71675a',0,11);
  for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)for(const [ox,oy] of [[0,0],[s/2,s/2]]){const X=x*s+ox,Y=y*s+oy;g.fillStyle='#1e1a15';star(g,X,Y+3,s*.11);g.fill();g.fillStyle='#71675a';star(g,X,Y,s*.1);g.fill();g.fillStyle='#2a251f';g.beginPath();g.arc(X,Y,s*.03,0,7);g.fill()}
  return c}
 // Cedar door leaf: a grained board with raised strapwork panels and a carved star
 function cedarCanvas(){
  const cw=512,ch=1024,[c,g]=canvas(cw,ch);g.fillStyle='#2b1a11';g.fillRect(0,0,cw,ch);
  for(let i=0;i<420;i++){const x=seed()*cw,l=60+seed()*260,y=seed()*ch;g.strokeStyle=`rgba(${seed()>.5?'96,62,38':'12,7,4'},${.08+seed()*.2})`;g.lineWidth=1+seed()*2;g.beginPath();g.moveTo(x,y);g.lineTo(x+(seed()-.5)*8,y+l);g.stroke()}
  const panel=(x,y,pw,ph)=>{g.strokeStyle='#0e0805';g.lineWidth=20;g.strokeRect(x+3,y+4,pw,ph);g.strokeStyle='#6b452b';g.lineWidth=14;g.strokeRect(x,y,pw,ph);g.strokeStyle='#8c5d39';g.lineWidth=3;g.strokeRect(x-2,y-2,pw,ph)};
  panel(36,36,cw-72,ch-72);const rows=[[70,300],[390,250],[660,300]];
  rows.forEach(([y,ph])=>{panel(70,y,cw-140,ph);const X=cw/2,Y=y+ph/2,r=Math.min(cw-140,ph)*.42;
   star(g,X+3,Y+4,r);g.strokeStyle='#0e0805';g.lineWidth=14;g.stroke();star(g,X,Y,r);g.strokeStyle='#8c5d39';g.lineWidth=9;g.stroke();star(g,X,Y,r*.52);g.fillStyle='#4a2f1d';g.fill();g.strokeStyle='#6b452b';g.lineWidth=6;g.stroke()});
  return c}
 // Mashrabiya: warm light behind a carved screen at the end of the hall
 function screenCanvas(){
  const cw=512,ch=768,[c,g]=canvas(cw,ch),glow=g.createRadialGradient(cw/2,ch*.56,20,cw/2,ch*.56,ch*.62);glow.addColorStop(0,'#ffe4bd');glow.addColorStop(.5,'#f9944f');glow.addColorStop(1,'#a83218');g.fillStyle=glow;g.fillRect(0,0,cw,ch);
  const s=cw/5;g.strokeStyle='#1a0e08';g.lineWidth=13;g.lineJoin='round';for(let y=-1;y<8;y++)for(let x=-1;x<6;x++){star(g,(x+.5)*s,(y+.5)*s,s*.52);g.stroke();star(g,(x+1)*s,(y+1)*s,s*.18);g.stroke()}
  g.lineWidth=30;g.strokeRect(0,0,cw,ch);return c}

 const [zelligeArt,zelligeHeight]=zelligeCanvas(),plasterArt=plasterCanvas(),cedarArt=cedarCanvas(),screenArt=screenCanvas();
 const tile=(rx,ry)=>new THREE.MeshPhysicalMaterial({map:texture(zelligeArt,rx,ry),bumpMap:texture(zelligeHeight,rx,ry,false),bumpScale:1.5,roughness:.26,metalness:.02,clearcoat:.6,clearcoatRoughness:.2,envMapIntensity:.5});
 const plasterMap=texture(plasterArt,2.1,2.1),plasterBump=texture(plasterArt,2.1,2.1,false);
 const plaster=new THREE.MeshStandardMaterial({map:plasterMap,bumpMap:plasterBump,bumpScale:3,roughness:.88,envMapIntensity:.3});
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
 const count=33,span=Math.PI+2*turn,voussoir=new THREE.BoxGeometry(.15,(R+.09)*span/count*.93,.06),rings=[new THREE.InstancedMesh(voussoir,stoneSand,17),new THREE.InstancedMesh(voussoir,copper,16)],place=new THREE.Object3D(),seen=[0,0];
 for(let i=0;i<count;i++){const t=Math.PI+turn-span*(i+.5)/count,k=i%2;place.position.set(cx+Math.cos(t)*(R+.095),cy+Math.sin(t)*(R+.095),.075);place.rotation.set(0,0,t);place.updateMatrix();rings[k].setMatrixAt(seen[k]++,place.matrix)}
 rings.forEach(r=>parent.add(r));
 // the brass line is an open band that follows the arc and stops at the springing, so nothing crosses the doorway
 const bandPoints=[];for(let i=0;i<=56;i++){const t=Math.PI+turn-span*i/56;bandPoints.push(new THREE.Vector2(cx+Math.cos(t)*(R+.2),cy+Math.sin(t)*(R+.2)))}for(let i=56;i>=0;i--){const t=Math.PI+turn-span*i/56;bandPoints.push(new THREE.Vector2(cx+Math.cos(t)*(R+.175),cy+Math.sin(t)*(R+.175)))}
 add(extrude(new THREE.Shape(bandPoints),.09),brass,[0,0,.02]);
 const revealShape=new THREE.Shape(archPoints(.018));revealShape.holes.push(archHole());add(extrude(revealShape,.33),copper,[0,0,-.31]);

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
 add(new Round(w+.12,.05,.44,2,.015),stoneSand,[cx,floor+.016,-.14]);

 // a pierced brass lantern
 const lantern=new THREE.Group();lantern.position.set(cx,2.08,hallZ+.1);parent.add(lantern);
 add(new THREE.CylinderGeometry(.008,.008,.56,6),brass,[0,.52,0],lantern);
 add(new THREE.CylinderGeometry(.095,.14,.3,8,1,true),new THREE.MeshBasicMaterial({map:texture(screenArt,.7,.5),side:THREE.DoubleSide,toneMapped:false,fog:false}),[0,0,0],lantern);
 add(new THREE.ConeGeometry(.125,.13,8),brass,[0,.215,0],lantern);add(new THREE.SphereGeometry(.03,12,10),brass,[0,.29,0],lantern);add(new THREE.CylinderGeometry(.15,.115,.04,8),brass,[0,-.17,0],lantern);

 // the doors
 const leafW=w/2-.01,leafH=archTop-base-.012,hinge=-.15,leafTop=d=>cy-base+Math.sqrt(R*R-d*d)-.012;
 const faceMap=(flip)=>{const t=texture(cedarArt,(flip?-1:1)/leafW,1/leafH);return new THREE.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:1.6,roughness:.62,envMapIntensity:.3})};
 const pivots=[-1,1].map(side=>{
  // side -1 is the left leaf, whose x runs from its hinge towards the centre
  const dir=-side,pivot=new THREE.Group();pivot.position.set(cx+side*w/2,base,hinge);parent.add(pivot);
  const outline=new THREE.Shape();outline.moveTo(0,0);outline.lineTo(dir*leafW,0);for(let i=0;i<=22;i++){const x=leafW*(1-i/22);outline.lineTo(dir*x,leafTop(w/2-x))}outline.closePath();
  add(new THREE.ExtrudeGeometry(outline,{depth:.065,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:1}),[faceMap(dir<0),cedar],[0,0,0],pivot);
  const spots=[];for(const x of [.045,leafW-.045])for(let y=.05;y<leafTop(w/2-x)-.04;y+=.104)spots.push([x,y]);
  for(const y of [.05,.68,1.2,leafTop(w/2-.34)-.05])for(let x=.1;x<leafW-.08;x+=.098)spots.push([x,y]);
  const studs=new THREE.InstancedMesh(new THREE.SphereGeometry(.017,10,8),brass,spots.length);spots.forEach(([x,y],i)=>{place.position.set(dir*x,y,.074);place.rotation.set(0,0,0);place.scale.set(1,1,.7);place.updateMatrix();studs.setMatrixAt(i,place.matrix)});place.scale.set(1,1,1);pivot.add(studs);
  for(const y of [.32,1.02,1.72]){add(new Round(.26,.04,.015,2,.006),iron,[dir*.13,y,.076],pivot);add(new THREE.SphereGeometry(.024,10,8),brass,[dir*.25,y,.082],pivot)}
  add(new THREE.CylinderGeometry(.045,.045,.018,20).rotateX(Math.PI/2),brass,[dir*(leafW-.1),1.02,.08],pivot);
  const knocker=add(new THREE.TorusGeometry(.052,.01,10,30),brass,[dir*(leafW-.1),.97,.095],pivot);knocker.rotation.x=-.12;
  return{pivot,side}});

 // what the open doors let out: a star medallion on the floor, a pool of light, warm lamps
 const medallion=add(new THREE.CircleGeometry(.72,48),tile(.9,.9),[cx,floor+.004,1.02]);medallion.rotation.x=-Math.PI/2;
 add(new THREE.RingGeometry(.72,.75,64).rotateX(-Math.PI/2),brass,[cx,floor+.005,1.02]);
 const [spillArt,spillInk]=canvas(128,128),fade=spillInk.createRadialGradient(64,128,0,64,128,64);fade.addColorStop(0,'rgba(255,195,135,.5)');fade.addColorStop(.55,'rgba(235,110,70,.16)');fade.addColorStop(1,'rgba(235,89,57,0)');spillInk.fillStyle=fade;spillInk.fillRect(0,0,128,128);
 const spill=add(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(spillArt),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),[cx,floor+.012,.95]);spill.rotation.x=-Math.PI/2;
 const hallLight=new THREE.PointLight(0xffb37a,3,4,2);hallLight.position.set(cx,1.75,hallZ+.1);parent.add(hallLight);
 const porchLight=new THREE.PointLight(0xffb37a,0,6,2);porchLight.position.set(cx,1.15,.8);parent.add(porchLight);

 const swing=(open,flare=0)=>{const a=open*1.72;for(const {pivot,side} of pivots)pivot.rotation.y=-side*a;spill.material.opacity=Math.min(1,open+flare*.6);porchLight.intensity=open*3.6+flare*10;hallLight.intensity=3+open*2.6+flare*5};
 swing(0);
 return{swing};
};
