/* The workshop: builds the scene, lights it, renders it through a soft post chain, and moves the camera. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { installMP44 } from './workshop-mp44.js';
import { loadDressing } from './workshop-dress.js';

const Grade={
 uniforms:{tDiffuse:{value:null},uTime:{value:0},uVignette:{value:.2},uGrain:{value:.024},uLift:{value:1},uIris:{value:3},uStars:{value:0},uAspect:{value:1.6},uDark:{value:0},uBg:{value:new THREE.Color(.86,.77,.65)}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`
 #ifdef WORKSHOP_OUTPUT
 #include <tonemapping_pars_fragment>
 #include <colorspace_pars_fragment>
 #ifdef WORKSHOP_BLOOM
 uniform sampler2D glow;uniform float strength;
 #endif
 #endif
 varying vec2 vUv;uniform sampler2D tDiffuse;uniform float uTime,uVignette,uGrain,uLift,uIris,uStars,uAspect,uDark;uniform vec3 uBg;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;
  #ifdef WORKSHOP_OUTPUT
  #ifdef WORKSHOP_BLOOM
  c+=texture2D(glow,vUv).rgb*strength;
  #endif
  c=sRGBTransferOETF(vec4(ACESFilmicToneMapping(c),1.)).rgb;
  #endif
  vec2 d=vUv-.5;c*=1.-uVignette*smoothstep(.28,.95,length(d*vec2(1.08,1.)));
  float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,1.05);c=mix(c,c*vec3(1.02,1.,.965),.5);
  c+=(hash(vUv*vec2(1731.,977.)+uTime)-.5)*uGrain*(1.-l*.55);
  if(uIris<2.5){
   float r=length((vUv-.5)*vec2(uAspect,1.)),m=1.-smoothstep(uIris*.42,max(.0001,uIris),r);
   vec3 bg=uDark>.5?vec3(.012,.016,.03):uBg;
   if(uStars>0.){vec2 g=(vUv-.5)*vec2(uAspect,1.)*46.,id=floor(g);float s=step(.93,hash(id)),d=length(fract(g)-.5-(vec2(hash(id+3.),hash(id+7.))-.5)*.6);bg+=uStars*s*(1.-smoothstep(0.,.1,d))*(.5+hash(id+1.)*.8)*vec3(.9,.92,1.);}
   c=mix(bg,c,m);
  }
  gl_FragColor=vec4(c*uLift,1.);}`
};

const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const LOAD=url=>new Promise(res=>new THREE.TextureLoader().load(url,res,undefined,()=>res(null)));

export const CAR={scale:.8,pos:[.25,0,-.42],rot:.87};
/* everything in the room, in metres from the centre of the floor */
/* small things that react but open nothing */
export const TOYS=['pencil','pick','plant','cases'];
export const PLACES={
 workbench:{p:[-3.7,0,-3.36],r:[0,0,0],s:1},
 stool:{p:[-4.2,0,-1.55],r:[0,.4,0],s:1.05},
 sillPot:{p:[-5.1,.8,-1.1],r:[0,0,0],s:1.3},
 guitar:{p:[-3.1,0,-1.95],r:[0,.6,0],s:1.72},
 tablet:{p:[-2.45,0,.3],r:[0,.5,0],s:2.05},
 book:{p:[-1.72,0,2.0],r:[0,.1,0],s:1.5},
 pencil:{p:[-.2,0,2.02],r:[0,1.08,0],s:1.9},
 pick:{p:[.02,0,2.56],r:[0,.5,0],s:2.2},
 satellite:{p:[2.62,0,-2.3],r:[0,-.2,0],s:1.12},
 trophy:{p:[3.72,0,-.82],r:[0,-.3,0],s:1.5},
 tyre:{p:[3.2,0,1.5],r:[0,0,0],s:1.06},
 shelving:{p:[4.86,0,-2.2],r:[0,-Math.PI/2,0],s:.96},
 plant:{p:[4.72,2.66,-3.12],r:[0,Math.PI,0],s:.98},
 crate:{p:[4.3,0,.42],r:[0,-1.28,0],s:1}
};
/* what each clickable thing opens, and where the camera goes to look at it */
export const TARGETS={
 car:{label:'Builds',close:[[-.6,1.6,3.3],[.55,.5,-.45]]},
 guitar:{label:'About me',close:[[-2.55,1.5,-.1],[-4.1,.95,-2.45]]},
 tablet:{label:'Code',close:[[-2.2,1.05,1.1],[-3.0,.32,-.12]]},
 book:{label:'Project Strata',close:[[-1.86,2.5,3.5],[-1.98,.05,2.08]]},
 satellite:{label:'Kessler model',close:[[2.1,1.95,.3],[2.62,1.45,-2.3]]},
 trophy:{label:'Awards',close:[[3.1,1.2,1.2],[3.72,.62,-.82]]},
 research:{label:'Research papers',close:[[2.9,2.3,-1.2],[4.7,2.1,-2.1]]},
 crate:{label:'Contact',close:[[2.9,1.5,2.1],[4.3,.5,.42]]},
 tyre:{label:'More builds',close:[[2.5,1.7,3.2],[3.2,.2,1.5]]}
};

/* One object per material: hundreds of small parts become a handful of draws. */
export function flatten(root){
 root.updateMatrixWorld(true);
 const inverse=root.matrixWorld.clone().invert(),groups=new Map(),movers=[];
 (function walk(o){for(const c of o.children){
  if(c.userData.moving){movers.push(c);continue}
  if(c.isMesh&&!c.isInstancedMesh&&c.visible&&!Array.isArray(c.material)&&!c.material.transparent&&!c.material.isShaderMaterial&&!c.material.userData?.noMerge&&c.material.colorWrite!==false){
   const key=c.material.uuid+c.castShadow+c.receiveShadow;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);
  }
  walk(c);
 }})(root);
 for(const list of groups.values()){
  if(list.length<2)continue;
  const parts=list.map(o=>{
   const g=o.geometry.clone();for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);
   if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
   g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
   if(g.index)return g;
   const indexed=mergeVertices(g,1e-6);g.dispose();return indexed;
  });
  const merged=mergeGeometries(parts,false);if(!merged)continue;parts.forEach(p=>p.dispose());
  const first=list[0],m=new THREE.Mesh(merged,first.material);m.castShadow=first.castShadow;m.receiveShadow=first.receiveShadow;root.add(m);
  list.forEach(o=>o.parent.remove(o));
 }
 movers.forEach(flatten);
 return root;
}

/* The floor's reflection: the room drawn upside down, small, and blurred by its mipmaps. */
export function createMirror(renderer,scene,room,camera){
 const rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter});
 const cam=camera.clone(),dir=new THREE.Vector3(),u=room.surfaces.floor.material.uniforms;
 u.tMirror.value=rt.texture;u.uMirror.value=1;
 return {
  size(w,h){rt.setSize(Math.round(w/2.4),Math.round(h/2.4))},
  free(){rt.dispose()},
  render(){
   cam.fov=camera.fov;cam.aspect=camera.aspect;cam.projectionMatrix.copy(camera.projectionMatrix);cam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
   camera.getWorldDirection(dir);cam.position.set(camera.position.x,-camera.position.y,camera.position.z);cam.up.set(0,1,0);cam.lookAt(cam.position.x+dir.x,cam.position.y-dir.y,cam.position.z+dir.z);cam.updateMatrixWorld();
   u.uMirrorProjection.value.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
   room.surfaces.floor.visible=room.slab.visible=false;
   const before=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);renderer.setRenderTarget(before);
   room.surfaces.floor.visible=room.slab.visible=true;
  }
 };
}

/* A soft shadow drawn from the car's own low parts and carried by its rig, so it drives away with the car
   and nothing is left behind on the baked floor. Wheels get a darker, tighter contact patch. */
function contactShadow(rig){
 rig.updateMatrixWorld(true);
 const inv=rig.matrixWorld.clone().invert(),v=new THREE.Vector3(),pts=[],wheels=[];
 rig.traverse(o=>{
  if(!o.isMesh||!o.visible||o.material?.visible===false)return;
  const pa=o.geometry.attributes.position,idx=o.geometry.index,n=idx?idx.count:pa.count,step=Math.max(1,Math.floor(n/900));
  for(let i=0;i<n;i+=step){v.fromBufferAttribute(pa,idx?idx.getX(i):i).applyMatrix4(o.matrixWorld);if(v.y>.42)continue;const h=v.y;v.applyMatrix4(inv);pts.push([v.x,v.z,h])}
 });
 rig.traverse(o=>{if(o.userData.moving&&o.children.length&&o.parent&&!o.isMesh&&o.position.lengthSq()>.01&&o.children[0]?.userData?.moving){o.getWorldPosition(v);if(v.y<.5){v.applyMatrix4(inv);wheels.push([v.x,v.z])}}});
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
 const pad=.35;x0-=pad;x1+=pad;z0-=pad;z1+=pad;
 const W=256,H=Math.round(256*(z1-z0)/(x1-x0)),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;const t=tmp.getContext('2d');
 const px=x=>(x-x0)/(x1-x0)*W,pz=z=>(z-z0)/(z1-z0)*H;
 for(const [x,z,h] of pts){t.fillStyle=`rgba(0,0,0,${.1*(1-h/.42)})`;t.beginPath();t.arc(px(x),pz(z),5,0,7);t.fill()}
 g.filter='blur(9px)';g.drawImage(tmp,0,0);g.filter='blur(3px)';
 for(const [x,z] of wheels){g.fillStyle='rgba(0,0,0,.7)';g.beginPath();g.ellipse(px(x),pz(z),W*.07,H*.04,0,0,7);g.fill()}
 g.filter='none';
 const tex=new THREE.CanvasTexture(c);
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));
 plane.rotation.x=-Math.PI/2;plane.position.set((x0+x1)/2,.006/Math.max(.001,rig.scale.y),(z0+z1)/2);plane.renderOrder=-1;plane.userData.noAO=true;
 return plane;
}

export async function buildScene({renderer,bakes,texScale=1,useDressing=true,carRequest}){
 const anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 const kit=Workshop.kit(THREE,RoundedBoxGeometry,{anisotropy,texScale});
 const scene=new THREE.Scene();scene.background=new THREE.Color('#efe4d3');
 const sketchbook=LOAD('img/workshop-sketchbook.webp');
 // The dressed room comes from the Blender source with its light baked in. If it fails to load, the
 // older procedural bench, stool, window and shelving are built instead, so the room stays usable.
 let dress=null;
 try{if(useDressing)dress=await loadDressing(renderer,{phone:texScale<1})}catch(error){console.warn('Could not load the Workshop dressing; using the procedural room.',error)}
 const room=Workshop.room(THREE,kit,{bakes,dressed:!!dress});scene.add(room.root);
 flatten(room.root);
 if(dress)scene.add(dress.root);
 let car=new THREE.Group();const carRig=new THREE.Group(),tyres=Workshop.carTyres(THREE,kit);
 car.userData.parts=tyres;
 try{await installMP44(car,{anisotropy,request:carRequest})}catch(error){console.warn('Could not load the MP4/4 model; using the workshop car instead.',error);car=Workshop.car(THREE,kit,tyres)}
 car.position.z=1.7;carRig.add(car);carRig.scale.setScalar(CAR.scale);carRig.position.set(...CAR.pos);carRig.rotation.y=CAR.rot;scene.add(carRig);
 const props=Workshop.props(THREE,kit,car.userData.parts,{dressed:!!dress});
 const pages=await sketchbook;
 if(pages){pages.colorSpace=THREE.SRGBColorSpace;pages.anisotropy=anisotropy}
 const items={};
 for(const [key,make] of Object.entries({...(dress?{}:{workbench:()=>props.workbench(),stool:()=>props.stool(),sillPot:()=>props.sillPot()}),guitar:()=>props.guitar(),tablet:()=>props.tablet(),book:()=>props.sketchbook(pages),pencil:()=>props.pencil(),pick:()=>props.pick(),satellite:()=>props.satellite(),trophy:()=>props.trophy(),tyre:()=>props.tyre(),shelving:()=>props.shelving(),plant:()=>props.plant(),crate:()=>props.crate()})){
  const o=make(),L=PLACES[key];o.position.set(...L.p);o.rotation.set(...L.r);o.scale.setScalar(L.s);scene.add(o);items[key]=o;
 }
 for(const o of Object.values(items))flatten(o);
 let propLights=null;
 try{propLights=dress?.attachProps(items)}catch(error){
  console.warn('Workshop prop bake unavailable; using the procedural room.',error);
  return buildScene({renderer,bakes,texScale,useDressing:false});
 }
 flatten(car);
 carRig.userData.play=car.userData.play;carRig.userData.playFor=car.userData.playFor;
 carRig.add(contactShadow(carRig));
 items.car=carRig;
 return {scene,room,items,kit,dress,propLights};
}

/* light the objects: a soft key from the window and a tighter shaft of sun */
export function lightScene(scene,{shadowSize=2048}={}){
 const sun=new THREE.DirectionalLight('#ffe9cc',1.7);sun.position.set(-9.5,6.1,-3.1);sun.target.position.set(.2,0,-.6);
 const sky=new THREE.DirectionalLight('#e6ecff',1.25);sky.position.set(-9,8,3);sky.target.position.set(0,0,-.6);
 for(const [l,size,ext] of [[sun,shadowSize,9],[sky,shadowSize/2,9]]){
  l.castShadow=true;l.shadow.mapSize.set(size,size);Object.assign(l.shadow.camera,{left:-ext,right:ext,top:ext,bottom:-ext,near:.5,far:26});l.shadow.camera.updateProjectionMatrix();l.shadow.bias=-.00025;l.shadow.normalBias=.012;l.shadow.radius=5;l.shadow.blurSamples=16;scene.add(l,l.target);
 }
 const fill=new THREE.HemisphereLight('#f4ecdd','#8a7f6e',1.3);scene.add(fill);
 const lamp=new THREE.PointLight('#ffd9a8',0,16,1.4);lamp.position.set(.2,3.97,-.1);scene.add(lamp);
 return {sun,sky,fill,lamp};
}

/* photograph the empty room from the car, so reflections show the real window */
export function reflectionsFrom(renderer,scene,hide,{size=512}={}){
 const target=new THREE.WebGLCubeRenderTarget(size,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
 const cam=new THREE.CubeCamera(.1,40,target);cam.position.set(.2,1.1,-.2);hide.forEach(o=>o.visible=false);
 const tone=renderer.toneMapping;renderer.toneMapping=THREE.NoToneMapping;cam.update(renderer,scene);renderer.toneMapping=tone;hide.forEach(o=>o.visible=true);
 const pm=new THREE.PMREMGenerator(renderer),env=pm.fromCubemap(target.texture).texture;pm.dispose();target.dispose();
 return env;
}

/* The baked room needs no AO pass. Resolve the same MSAA scene once, then
   combine bloom, tone mapping, colour grading and the iris on the way to the screen. */
export function buildBakedOutput(renderer,scene,camera,w,h,{samples,bloom}){
 const target=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples});
 const uniforms=THREE.UniformsUtils.clone(Grade.uniforms);
 uniforms.tDiffuse.value=target.texture;
 uniforms.toneMappingExposure={value:1};
 const glow=bloom?{uniforms:{glow:{value:bloom.texture},strength:{value:0}}}:null;
 const defines={WORKSHOP_OUTPUT:1};
 if(glow){defines.WORKSHOP_BLOOM=1;Object.assign(uniforms,glow.uniforms)}
 const material=new THREE.RawShaderMaterial({uniforms,defines,depthTest:false,depthWrite:false,
  vertexShader:'precision highp float;attribute vec3 position;attribute vec2 uv;'+Grade.vertexShader,
  fragmentShader:'precision highp float;\n'+Grade.fragmentShader});
 const quad=new FullScreenQuad(material);
 return {w,h,grade:{uniforms},glow,render(){
  uniforms.toneMappingExposure.value=renderer.toneMappingExposure;
  const previous=renderer.getRenderTarget();
  try{renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);quad.render(renderer)}
  finally{renderer.setRenderTarget(previous)}
 },dispose(){target.dispose();material.dispose();quad.dispose()}};
}

/* Two sets of the same chain: a light one while the camera moves, and a full one for the frame it stops on. */
export function buildComposer(renderer,scene,camera,w,h,{ao=true,samples=4,aoDiv=2,aoSamples=12,denoise=8,smaa=false}={}){
 const rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples});
 // w and h are already physical pixels; applying the renderer's pixel ratio a
 // second time misaligns the reflection and makes moving frames unnecessarily large.
 const composer=new EffectComposer(renderer,rt);composer.setPixelRatio(1);composer.setSize(w,h);
 composer.addPass(new RenderPass(scene,camera));
 let gtao=null;
 if(ao){
  gtao=new GTAOPass(scene,camera,Math.round(w/aoDiv),Math.round(h/aoDiv));
  const full=gtao.setSize.bind(gtao);gtao.setSize=(a,b)=>full(Math.round(a/aoDiv),Math.round(b/aoDiv)); // soft contact shadows don't need every pixel
  gtao.updateGtaoMaterial({radius:.34,distanceExponent:1.5,thickness:.7,scale:1.25,samples:aoSamples,distanceFallOff:1,screenSpaceRadius:false});
  gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:3,radiusExponent:1.1,rings:2,samples:denoise});
  gtao.blendIntensity=.7;composer.addPass(gtao);
  // Soft transparent cards (the car's contact shadow, lamp glows) must not enter the AO normal pass, or they leave a dark rectangle.
  const aoRender=gtao.render.bind(gtao);
  gtao.render=(...args)=>{
   const skip=[];
   scene.traverse(o=>{if(o.visible&&(o.userData.noAO||o.isSprite)){o.visible=false;skip.push(o)}});
   try{aoRender(...args)}
   finally{skip.forEach(o=>o.visible=true)}
  };
 }
 composer.addPass(new OutputPass());
 if(smaa)composer.addPass(new SMAAPass(w,h));
 const grade=new ShaderPass(Grade);composer.addPass(grade);
 return {render:()=>composer.render(),gtao,grade,w,h,dispose(){composer.dispose();for(const p of composer.passes)p.dispose?.()}};
}
