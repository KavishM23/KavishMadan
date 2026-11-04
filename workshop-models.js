/* Modelled workshop objects. Dimensions are in miniature scene units. */
window.createWorkshopModels=function({THREE,Round,texture}){
 const mat=(color,roughness=.55,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const navy=mat('#253449'),ivory=mat('#e5dfd1'),wine=mat('#74464e'),rubber=mat('#23252a',.93),carbon=mat('#252b33',.65),metal=mat('#aeb5bb',.32,.8),black=mat('#141a21');
 function mesh(parent,geo,material,p=[0,0,0]){const m=new THREE.Mesh(geo,material);m.position.set(...p);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
 const box=(p,w,h,d,m,xyz,r=.025)=>mesh(p,new Round(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m,xyz);
 function rod(p,a,b,r=.025,m=metal){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(p,new THREE.CylinderGeometry(r,r,v.length(),10),m,av.add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o}
 function tube(p,points,r,m){return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a))),48,r,10,false),m)}
 function shell(parent,sections,material){const vertices=[],indices=[],n=32;for(const [z,y,w,h] of sections)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;vertices.push(Math.cos(a)*w,y+Math.sin(a)*h,z)}for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return mesh(parent,g,material)}
 function wheel(parent,x,z,rear=false){const g=new THREE.Group();g.position.set(x,.47,z);parent.add(g);const w=rear?.49:.4;
  const profile=[[.25,-w/2],[.38,-w/2],[.445,-w*.43],[.465,-w*.26],[.465,w*.26],[.445,w*.43],[.38,w/2],[.25,w/2]].map(([r,y])=>new THREE.Vector2(r,y));
  const tyre=mesh(g,new THREE.LatheGeometry(profile,64),rubber);tyre.rotation.z=Math.PI/2;
  const hub=mesh(g,new THREE.CylinderGeometry(.27,.27,w+.015,48),black);hub.rotation.z=Math.PI/2;
  for(const side of [-1,1]){const ring=mesh(g,new THREE.TorusGeometry(.29,.012,8,64),metal,[side*(w/2+.008),0,0]);ring.rotation.y=Math.PI/2;
   const brake=mesh(g,new THREE.CylinderGeometry(.205,.205,.015,40),metal,[side*w*.39,0,0]);brake.rotation.z=Math.PI/2;
   for(let i=0;i<10;i++){const a=i*Math.PI/5;rod(g,[side*(w/2+.012),Math.cos(a)*.06,Math.sin(a)*.06],[side*(w/2+.012),Math.cos(a+.16)*.26,Math.sin(a+.16)*.26],.014,carbon)}
   const nut=mesh(g,new THREE.CylinderGeometry(.055,.055,.04,6),metal,[side*(w/2+.03),0,0]);nut.rotation.z=Math.PI/2;
   const decal=texture(512,512,c=>{c.clearRect(0,0,512,512);c.strokeStyle='#b5afa1';c.lineWidth=2;c.beginPath();c.arc(256,256,212,.24,1.05);c.stroke();c.font='500 25px monospace';c.fillStyle='#aca99f';c.textAlign='center';c.save();c.translate(256,256);for(let j=0;j<5;j++){c.save();c.rotate((j-2)*.14);c.fillText('SLICK'[j],0,-181);c.restore()}c.restore()});
   const face=mesh(g,new THREE.PlaneGeometry(.92,.92),new THREE.MeshStandardMaterial({map:decal,transparent:true,roughness:1,depthWrite:false}),[side*(w/2+.012),0,0]);face.rotation.y=side*Math.PI/2;
  }return g;
 }
 function wing(g,z,y,width,rear=false){for(let j=0;j<(rear?2:4);j++){const blade=box(g,width,.035,rear?.24:.16,j===0?ivory:navy,[0,y+j*(rear?.13:.055),z+j*(rear?.13:.12)]);blade.rotation.x=rear?-.22:-.14}for(const s of [-1,1]){box(g,.035,rear?.53:.25,rear?.6:.64,wine,[s*width/2,y+(rear?.12:.07),z+.14],.01)}}
 function car(){const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  box(body,1.52,.065,4.8,carbon,[0,.18,0]);
  shell(body,[[-2.5,.39,.1,.065],[-2.1,.45,.16,.09],[-1.45,.56,.22,.12],[-.7,.66,.35,.22],[0,.68,.43,.24],[.5,.65,.38,.22],[1.2,.53,.24,.22],[1.9,.4,.12,.12]],navy);
  shell(body,[[-2.52,.395,.09,.067],[-2.15,.455,.15,.09],[-1.8,.51,.18,.1]],ivory);
  for(const s of [-1,1]){
   const pod=shell(body,[[-.65,.45,.13,.14],[-.35,.49,.34,.21],[.15,.47,.33,.2],[.8,.38,.26,.13],[1.38,.3,.09,.06]],navy);pod.position.x=s*.48;
   const inlet=box(body,.32,.16,.055,black,[s*.53,.53,-.6]);inlet.rotation.x=-.12;
   box(body,.07,.025,1.15,wine,[s*.78,.23,.3]);
   for(let j=0;j<4;j++){const vent=box(body,.19,.01,.025,black,[s*.55,.64,.28+j*.095]);vent.rotation.z=s*-.2}
   for(const z of [-1.65,1.55]){for(const h of [.26,.49]){rod(body,[s*.27,h,z-.27],[s*.91,.45,z],.022,carbon);rod(body,[s*.29,h,z+.29],[s*.91,.45,z],.022,carbon)}rod(body,[s*.24,.73,z+.2],[s*.84,.41,z],.019,metal)}
   rod(body,[s*.3,.78,-.55],[s*.67,.8,-.73],.015);box(body,.2,.08,.1,wine,[s*.72,.8,-.74]);
   box(body,.022,.18,.6,carbon,[s*.7,.3,1.76]);
  }
  const cockpit=mesh(body,new THREE.SphereGeometry(1,40,24),black,[0,.817,-.03]);cockpit.scale.set(.285,.055,.49);
  const seat=box(body,.22,.13,.22,black,[0,.84,.28]);seat.rotation.x=-.3;
  tube(body,[[-.3,.84,-.42],[-.34,1.03,-.18],[-.29,1.06,.36],[0,1.08,.49],[.29,1.06,.36],[.34,1.03,-.18],[.3,.84,-.42]],.035,navy);
  rod(body,[0,.8,-.52],[0,1.04,-.22],.031,navy);
  const steer=mesh(body,new THREE.TorusGeometry(.13,.025,8,24),black,[0,.86,-.26]);steer.rotation.x=-.35;
  shell(body,[[.48,.85,.16,.14],[.68,1.13,.14,.15],[.95,.96,.13,.12],[1.4,.63,.08,.1]],navy);
  const scoop=mesh(body,new THREE.TorusGeometry(.11,.025,10,32),wine,[0,1.17,.65]);const hole=mesh(body,new THREE.CircleGeometry(.105,32),black,[0,1.17,.655]);hole.rotation.y=Math.PI;scoop.rotation.y=Math.PI;
  wing(body,-2.38,.24,1.95);wing(body,1.96,1.04,1.68,true);
  for(const s of [-1,1])rod(body,[s*.19,.43,1.7],[s*.32,1.08,1.98],.025,carbon);
  for(let i=-2;i<=2;i++)box(body,.025,.16,.47,carbon,[i*.19,.19,1.96]);
  const livery=texture(512,512,c=>{c.fillStyle='#e5dfd1';c.fillRect(0,0,512,512);c.fillStyle='#253449';c.font='600 155px sans-serif';c.textAlign='center';c.fillText('KM',256,310)});
  const badge=mesh(body,new THREE.PlaneGeometry(.24,.36),new THREE.MeshStandardMaterial({map:livery,roughness:.65}),[0,.568,-1.68]);badge.rotation.x=-Math.PI/2;
  for(const s of [-1,1]){wheel(g,s*1.02,-1.65);wheel(g,s*1.02,1.55,true)}
  g.userData.labelY=1.35;g.userData.tick=(dt,h,t)=>{body.position.y=Math.sin(t*1.6)*.0015*(1+h)};return g;
 }
 function guitar(){const g=new THREE.Group(),instrument=new THREE.Group();g.add(instrument);
  const sh=new THREE.Shape();sh.moveTo(0,1.08);sh.bezierCurveTo(-.19,1.16,-.49,1.17,-.55,.87);sh.bezierCurveTo(-.62,.52,-.32,.39,-.59,.09);sh.bezierCurveTo(-1,-.29,-.87,-1.08,-.08,-1.18);sh.bezierCurveTo(.79,-1.28,1.03,-.48,.65,-.02);sh.bezierCurveTo(.42,.23,.27,.39,.43,.66);sh.bezierCurveTo(.58,.91,.35,1.03,.16,.84);sh.lineTo(.14,1.08);sh.closePath();
  const sun=texture(1024,1024,c=>{const gr=c.createRadialGradient(510,460,70,512,512,530);gr.addColorStop(0,'#c28b43');gr.addColorStop(.48,'#a86730');gr.addColorStop(.8,'#6e3024');gr.addColorStop(1,'#311c1a');c.fillStyle=gr;c.fillRect(0,0,1024,1024);for(let i=0;i<240;i++){c.strokeStyle=`rgba(40,20,8,${.015+(i%4)*.006})`;c.beginPath();c.moveTo(0,i*5);c.bezierCurveTo(340,i*5-15,620,i*5+18,1024,i*5-3);c.stroke()}});
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:true,bevelSegments:5,bevelSize:.045,bevelThickness:.05,curveSegments:40});geo.computeBoundingBox();const uv=geo.attributes.uv,p=geo.attributes.position;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+1)/2,(p.getY(i)+1.25)/2.5);
  mesh(instrument,geo,new THREE.MeshStandardMaterial({map:sun,roughness:.34}),[0,1.25,0]);
  box(instrument,.2,2.12,.13,mat('#653f28'),[0,3.19,.03]);box(instrument,.18,2.08,.027,mat('#39291f'),[0,3.19,.115]);
  for(let i=0;i<20;i++){const y=2.22+1.96*(1-Math.pow(.91,i+1));box(instrument,.185,.008,.012,metal,[0,y,.134]);if([2,4,6,8,11,14,16,18].includes(i))box(instrument,.1,.045,.006,ivory,[0,y-.04,.143])}
  const head=box(instrument,.29,.58,.1,black,[0,4.5,.025]);head.rotation.z=-.055;
  const logo=texture(256,512,c=>{c.clearRect(0,0,256,512);c.fillStyle='#e5dfd1';c.font='italic 48px serif';c.textAlign='center';c.fillText('Gibson',128,160);c.font='24px serif';c.fillText('Les Paul',128,300)});
  mesh(instrument,new THREE.PlaneGeometry(.26,.5),new THREE.MeshStandardMaterial({map:logo,transparent:true}),[0,4.5,.081]);
  for(let i=0;i<3;i++)for(const s of [-1,1]){rod(instrument,[s*.11,4.35+i*.16,.03],[s*.22,4.35+i*.16,.03],.015);box(instrument,.085,.055,.04,ivory,[s*.23,4.35+i*.16,.03])}
  const guard=new THREE.Shape();guard.moveTo(.15,2.18);guard.lineTo(.53,1.53);guard.lineTo(.17,1.45);guard.closePath();mesh(instrument,new THREE.ShapeGeometry(guard),ivory,[0,0,.225]);
  for(const y of [1.44,1.91]){box(instrument,.4,.19,.035,ivory,[0,y,.214]);box(instrument,.32,.13,.045,metal,[0,y,.235]);for(let i=0;i<6;i++)mesh(instrument,new THREE.SphereGeometry(.009,6,6),black,[-.13+i*.052,y,.262])}
  box(instrument,.39,.09,.075,metal,[0,.89,.24]);box(instrument,.4,.08,.06,metal,[0,.69,.24]);
  for(let i=0;i<6;i++)rod(instrument,[-.065+i*.026,.68,.281],[-.065+i*.026,4.39,.13],.0018,metal);
  for(const [x,y] of [[.42,.8],[.62,.66],[.38,1.02],[.6,.91]]){const k=mesh(instrument,new THREE.CylinderGeometry(.052,.066,.045,20),mat('#b18748',.38),[x,y,.255]);k.rotation.x=Math.PI/2}
  instrument.rotation.x=-.13;instrument.position.z=.12;
  rod(g,[0,.1,-.24],[0,2,-.36],.035,black);for(const s of [-1,1]){rod(g,[0,.12,-.22],[s*.63,.06,.4],.035,black);rod(g,[s*.33,.12,.2],[s*.34,.48,.21],.025,black)}
  g.userData.labelY=4.9;g.userData.tick=()=>{};return g;
 }
 function sketchbook(){const g=new THREE.Group();box(g,2.7,.09,1.84,navy,[0,.055,0]);box(g,2.6,.065,1.76,ivory,[0,.125,0]);
  const map=texture(1600,1100,c=>{c.fillStyle='#eee8d9';c.fillRect(0,0,1600,1100);c.strokeStyle='#d4cfc3';c.lineWidth=1;for(let x=40;x<1600;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,1100);c.stroke()}for(let y=20;y<1100;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(1600,y);c.stroke()}c.fillStyle='#253449';c.font='42px monospace';c.fillText('PROJECT STRATA',80,100);c.font='23px monospace';c.fillText('4 × 4 IN SCHOOLS / BODY STUDIES',80,146);
   function path(points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
   function car(x,y,scale){c.save();c.translate(x,y);c.scale(scale,scale);c.strokeStyle='#394452';c.lineWidth=3;path([[0,170],[0,100],[90,82],[155,10],[390,10],[430,85],[500,105],[505,178],[453,178],[425,148],[370,148],[347,178],[145,178],[120,148],[64,148],[38,178],[0,178]]);path([[112,79],[166,25],[245,25],[245,81],[112,79]]);path([[262,25],[369,25],[399,82],[262,82],[262,25]]);path([[253,90],[253,168]]);path([[331,90],[331,166]]);path([[10,111],[83,105],[89,133],[10,139]]);path([[8,151],[490,151]]);for(const wx of [91,401]){for(const r of [48,32,13]){c.beginPath();c.arc(wx,181,r,0,Math.PI*2);c.stroke()}for(let i=0;i<12;i++){const a=i*Math.PI/6;path([[wx+Math.cos(a)*39,181+Math.sin(a)*39],[wx+Math.cos(a)*48,181+Math.sin(a)*48]])}}path([[154,102],[179,102]]);path([[272,102],[292,102]]);c.restore()}
   car(75,275,1.27);car(900,330,1.1);c.strokeStyle='#74464e';c.lineWidth=2;path([[80,640],[700,640]]);path([[80,628],[80,652]]);path([[700,628],[700,652]]);c.font='22px monospace';c.fillText('wheelbase / clearance / approach',80,700);
   c.strokeStyle='#394452';c.lineWidth=3;path([[100,830],[670,830],[670,920],[100,920],[100,830]]);for(let i=0;i<5;i++)path([[100+i*114,830],[214+i*114,920],[214+i*114,830]]);c.font='24px monospace';c.fillText('CHASSIS / ITERATION 04',90,1000);c.fillStyle='#74464e';c.fillText('Sketch. Build. Try again.',910,930);
   const gr=c.createLinearGradient(760,0,850,0);gr.addColorStop(0,'rgba(55,45,30,0)');gr.addColorStop(.48,'rgba(55,45,30,.16)');gr.addColorStop(.55,'rgba(55,45,30,.12)');gr.addColorStop(1,'rgba(55,45,30,0)');c.fillStyle=gr;c.fillRect(760,0,90,1100);
  });
  const page=mesh(g,new THREE.PlaneGeometry(2.57,1.74),new THREE.MeshStandardMaterial({map,roughness:.95}),[0,.165,0]);page.rotation.x=-Math.PI/2;
  for(let i=0;i<9;i++){const ring=mesh(g,new THREE.TorusGeometry(.045,.008,6,16),metal,[0,.16,-.7+i*.175]);ring.rotation.y=Math.PI/2}
  rod(g,[1.53,.06,-.65],[1.53,.06,.65],.024,wine);g.userData.labelY=.5;g.userData.tick=()=>{};return g;
 }
 function trophy(){const g=new THREE.Group();box(g,.67,.16,.58,navy,[0,.08,0]);mesh(g,new THREE.LatheGeometry([[.0,.16],[.2,.16],[.2,.2],[.07,.3],[.07,.55],[.24,.66],[.35,.91],[.38,1.16]].map(p=>new THREE.Vector2(...p)),48),metal);for(const s of [-1,1]){const h=mesh(g,new THREE.TorusGeometry(.23,.025,8,32,Math.PI*1.6),metal,[s*.32,.88,0]);h.rotation.z=s>0?-.9:2.2}box(g,.3,.07,.012,ivory,[0,.08,.298]);g.userData.labelY=1.4;g.userData.tick=()=>{};return g}
 function floor(){const g=new THREE.Group();const map=texture(512,512,c=>{c.fillStyle='#d8d5cd';c.fillRect(0,0,512,512);let seed=17;for(let i=0;i<18000;i++){seed=seed*16807%2147483647;const x=seed%512;seed=seed*16807%2147483647;const y=seed%512;c.fillStyle=i%2?'rgba(255,255,255,.09)':'rgba(60,65,72,.055)';c.fillRect(x,y,1,1)}});map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(5,4);const material=new THREE.MeshStandardMaterial({map,color:0xb1ada5,roughness:.96});box(g,12,.12,7.3,material,[0,-.08,0],.05);rod(g,[3.85,0,-1.25],[3.85,1.48,-1.25],.025,metal);box(g,.6,.05,.5,metal,[3.85,.015,-1.25]);for(const x of [-2.4,2.4]){box(g,.65,.035,.45,metal,[x,.015,-1.9]);rod(g,[x,0,-1.9],[x,.5,-1.9],.03,metal)}return g}
 return {car,guitar,sketchbook,trophy,floor};
};

