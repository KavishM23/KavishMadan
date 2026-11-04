/* Shared modelling tools for the workshop: skinned surfaces, wing sections and painted materials. */
window.Workshop=window.Workshop||{};
Workshop.kit=function(THREE,Round,opts={}){
 const anisotropy=opts.anisotropy||8,texScale=opts.texScale||1;
 const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};

 /* A surface through rings of points. Each ring has the same point count and closes on itself. */
 function skin(rings,{closed=true,caps=true}={}){
  const m=rings[0].length,n=rings.length,pos=[],uv=[],idx=[];
  rings.forEach((ring,j)=>ring.forEach((p,i)=>{pos.push(p[0],p[1],p[2]);uv.push(j/(n-1),i/(closed?m:m-1))}));
  for(let j=0;j<n-1;j++)for(let i=0;i<(closed?m:m-1);i++){
   const a=j*m+i,b=j*m+(i+1)%m,c=(j+1)*m+i,d=(j+1)*m+(i+1)%m;idx.push(a,c,b,b,c,d);
  }
  if(caps&&closed)for(const [ring,flip] of [[0,true],[n-1,false]]){
   const base=pos.length/3,c=[0,0,0];rings[ring].forEach(p=>{c[0]+=p[0]/m;c[1]+=p[1]/m;c[2]+=p[2]/m});
   rings[ring].forEach(p=>{pos.push(p[0],p[1],p[2]);uv.push(ring?1:0,0)});pos.push(...c);uv.push(ring?1:0,0);
   for(let i=0;i<m;i++){const a=base+i,b=base+(i+1)%m;flip?idx.push(a,b,base+m):idx.push(b,a,base+m)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  return g;
 }

 /* Catmull-Rom through a table of numeric sections, giving steps+1 smooth sections. */
 function spline(sections,steps){
  const keys=Object.keys(sections[0]),out=[],n=sections.length;
  const cr=(a,b,c,d,t)=>.5*((2*b)+(c-a)*t+(2*a-5*b+4*c-d)*t*t+(3*b-a-3*c+d)*t*t*t);
  for(let s=0;s<=steps;s++){
   const f=s/steps*(n-1),i=Math.min(n-2,Math.floor(f)),t=f-i,o={};
   for(const k of keys){
    const a=sections[Math.max(0,i-1)][k]??0,b=sections[i][k]??0,c=sections[i+1][k]??0,d=sections[Math.min(n-1,i+2)][k]??0;
    o[k]=cr(a,b,c,d,t);
   }
   out.push(o);
  }
  return out;
 }

 /* A body loft: superellipse sections with optional scooped top (a cockpit) and undercut. */
 function loft(table,{steps=96,around=72,xc=0}={}){
  const rows=table.map(r=>({nd:0,nw:.1,tw:1,bf:1,cx:xc,...r}));
  const rings=spline(rows,steps).map(s=>{
   const ring=[],mid=(s.top+s.bot)/2,half=(s.top-s.bot)/2,e=2/Math.max(1.2,s.p);
   for(let i=0;i<around;i++){
    const a=i/around*Math.PI*2,c=Math.cos(a),n=Math.sin(a);
    let x=Math.sign(c)*Math.pow(Math.abs(c),e)*s.w,y=Math.sign(n)*Math.pow(Math.abs(n),e);
    x*=y>0?lerp(1,s.tw,y):lerp(1,s.bf,-y);
    let py=mid+y*half;
    if(s.nd>.001&&y>0){const inside=smooth(s.nw,s.nw*.8,Math.abs(x));py-=s.nd*inside}
    ring.push([s.cx+x,py,s.z]);
   }
   return ring;
  });
  return skin(rings);
 }

 /* An aerofoil outline: x along the chord 0..1, y across it. */
 function foil(n=20,t=.12,camber=.05){
  const pts=[];
  for(let i=0;i<n;i++){
   const a=i/n*Math.PI*2,x=.5*(1+Math.cos(a)),side=Math.sign(Math.sin(a))||1;
   const yt=5*t*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
   pts.push([x,side*yt+camber*Math.sin(Math.PI*x)]);
  }
  return pts;
 }

 /* A wing across the span: at(s) gives {x,y,z,chord,aoa} for s from -1 to 1. */
 function wing(at,{steps=64,outline=foil()}={}){
  const rings=[];
  for(let j=0;j<=steps;j++){
   const s=-1+2*j/steps,c=at(s),ca=Math.cos(c.aoa),sa=Math.sin(c.aoa),ring=[];
   for(const [u,v] of outline){
    const dz=(.25-u)*c.chord,dy=v*c.chord;
    ring.push([c.x,c.y+dy*ca-dz*sa*-1*-1,c.z+dz*ca+dy*sa]);
   }
   rings.push(ring);
  }
  return skin(rings);
 }

 /* A round bar between two points. */
 function bar(a,b,r,material,sides=12){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),sides),material);
  m.position.copy(A).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  return m;
 }
 /* A flattened aero bar: wider than it is thick, as a wishbone is. */
 function blade(a,b,w,t,material){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length();
  const shape=[];for(let i=0;i<14;i++){const u=i/14*Math.PI*2;shape.push([Math.cos(u)*w,Math.sin(u)*t])}
  const rings=[];for(let j=0;j<=1;j++)rings.push(shape.map(([x,z])=>[x,j*len-len/2,z]));
  const m=new THREE.Mesh(skin(rings),material);
  m.position.copy(A).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  return m;
 }
 function tube(points,r,material,{segments=96,sides=12,closed=false}={}){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);
  return new THREE.Mesh(new THREE.TubeGeometry(curve,segments,r,sides,closed),material);
 }
 const mesh=(geo,material,p=[0,0,0],r=[0,0,0])=>{const o=new THREE.Mesh(geo,material);o.position.set(...p);o.rotation.set(...r);return o};
 const box=(w,h,d,material,p=[0,0,0],r=.008,rot=[0,0,0])=>mesh(new Round(w,h,d,3,Math.min(r,w/2.01,h/2.01,d/2.01)),material,p,rot);
 const add=(parent,...objs)=>{objs.forEach(o=>parent.add(o));return objs[0]};

 function canvasTexture(w,h,draw,{srgb=true,repeat=false,flipY=true,scale=1,keep=false}={}){
  const k=texScale*scale,c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
  const g=c.getContext('2d');g.scale(k,k);draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.anisotropy=anisotropy;t.flipY=flipY;
  // once it's on the graphics card, the copy in ordinary memory is only waste
  if(!keep)t.onUpdate=()=>{t.onUpdate=null;c.width=c.height=1};
  if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
 }

 /* Seeded random, so the textures come out the same on every visit. */
 function rng(seed=1){return()=>(seed=seed*16807%2147483647)/2147483647}

 /* Tiling grime: R speckle, G broad staining, B fine scratches. Used by every painted surface. */
 const grime=canvasTexture(1024,1024,(g,w,h)=>{
  const R=rng(977);g.fillStyle='#000';g.fillRect(0,0,w,h);
  g.globalCompositeOperation='lighter';
  for(let i=0;i<26000;i++){const v=Math.floor(R()*R()*190);g.fillStyle=`rgb(${v},0,0)`;const s=.6+R()*2.2;g.fillRect(R()*w,R()*h,s,s)}
  for(let i=0;i<190;i++){
   const x=R()*w,y=R()*h,r=50+R()*210,a=R()*.13,gr=g.createRadialGradient(x,y,0,x,y,r);
   gr.addColorStop(0,`rgba(0,255,0,${a})`);gr.addColorStop(1,'rgba(0,255,0,0)');g.fillStyle=gr;
   for(const [dx,dy] of [[0,0],[w,0],[-w,0],[0,h],[0,-h]]){g.save();g.translate(dx,dy);g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
  }
  g.lineCap='round';
  for(let i=0;i<620;i++){
   const x=R()*w,y=R()*h,a=R()*6.28,l=6+R()*R()*90;g.strokeStyle=`rgba(0,0,255,${.15+R()*.6})`;g.lineWidth=.5+R()*.9;
   g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();
  }
 },{srgb:false,repeat:true});

 /* Worn paint. Grime sits on the surface in object space, so no part needs its own unwrapped texture.
    Pass top and side canvases to paint a livery straight onto the shape from above and from the side. */
 function worn(params={},{dirt=.5,scale=1.1,top=null,side=null,box:b=null,dust='#b9ab94',chip='#d9d0bf',inject=''}={}){
  const material=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.5,...params});
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,{tGrime:{value:grime},uDirt:{value:dirt},uScale:{value:scale},uDust:{value:new THREE.Color(dust)},uChip:{value:new THREE.Color(chip)},tTop:{value:top},tSide:{value:side},uBox:{value:b?new THREE.Vector4(...b):new THREE.Vector4()}});
   shader.vertexShader='varying vec3 vOP;varying vec3 vON;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvOP=(instanceMatrix*vec4(position,1.)).xyz;\n#else\nvOP=position;\n#endif\nvON=normal;');
   shader.fragmentShader=`varying vec3 vOP;varying vec3 vON;uniform sampler2D tGrime;uniform float uDirt,uScale;uniform vec3 uDust,uChip;
${top?'uniform sampler2D tTop,tSide;uniform vec4 uBox;':''}
vec4 tri(vec3 p,vec3 w){p*=uScale;return texture2D(tGrime,p.zy)*w.x+texture2D(tGrime,p.xz)*w.y+texture2D(tGrime,p.xy)*w.z;}
float gHeight;
`+shader.fragmentShader
   .replace('#include <map_fragment>',`
    vec3 nW=pow(abs(normalize(vON)),vec3(4.));nW/=nW.x+nW.y+nW.z;
    vec4 gA=tri(vOP,nW),gB=tri(vOP*3.1+vec3(.37),nW);
    float panel=1.;
    ${top?`
    vec2 uvS=vec2((vOP.z-uBox.x)/(uBox.y-uBox.x),vOP.y/uBox.w),uvT=vec2(uvS.x,abs(vOP.x)/uBox.z);
    vec4 cS=texture2D(tSide,uvS),cT=texture2D(tTop,uvT);
    vec4 liv=mix(cS,cT,smoothstep(.5,.56,abs(normalize(vON).y)));
    diffuseColor.rgb*=liv.rgb*mix(.42,1.,smoothstep(.62,.93,liv.a));panel=liv.a;`:''}
    ${inject}
    float staining=smoothstep(.34,.86,gA.g)*uDirt;
    float underside=smoothstep(.25,-.5,normalize(vON).y);
    float dust=clamp(staining*.4+underside*uDirt*.1,0.,.5);
    diffuseColor.rgb=mix(diffuseColor.rgb,uDust,dust*.34);
    float flecks=smoothstep(.3,.6,gB.r)*smoothstep(.3,.6,gA.g)*uDirt;
    diffuseColor.rgb=mix(diffuseColor.rgb,uDust*.72,flecks*.5);
    float chipped=smoothstep(.45,.8,gB.b)*smoothstep(.36,.62,gA.g)*min(1.,uDirt*1.4);
    diffuseColor.rgb=mix(diffuseColor.rgb,uChip,chipped*.7);
    gHeight=(gB.r*.25-chipped*.6)*.0009+panel*.0034;
   `)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+dust*.4+flecks*.25+(gA.r-.1)*.14+chipped*.25,.04,1.);`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    {vec3 pos=-vViewPosition;vec3 sx=dFdx(pos),sy=dFdy(pos);float dx=dFdx(gHeight),dy=dFdy(gHeight);
     vec3 r1=cross(sy,normal),r2=cross(normal,sx);float det=dot(sx,r1);
     vec3 grad=sign(det)*(dx*r1+dy*r2);normal=normalize(abs(det)*normal-grad);}`);
   material.userData.shader=shader;
  };
  material.customProgramCacheKey=()=>`worn-${top?'liv':'plain'}`;
  return material;
 }
 return {lerp,clamp,smooth,skin,spline,loft,foil,wing,bar,blade,tube,mesh,box,add,canvasTexture,rng,grime,worn};
};
