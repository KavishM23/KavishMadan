/* The dressed Workshop from Blender: benches, shelving, window, wall kit and set dressing, with day and
   night light baked into one atlas. Baked surfaces ignore the live lights; metals still pick up the
   room's reflections. If anything here fails to load, workshop.js builds the older procedural room. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const BASE='assets/models/workshop/workshop/';
/* Overall level for baked light, and how much ambient the painted room planes keep on top of it. */
export const LIGHT={dress:.92,surface:.9,night:.85,amb:[.05,.048,.044]};

// Baked surfaces take no direct or ambient light from the scene: only the lightmap, plus reflections.
const quiet=s=>{s.fragmentShader=s.fragmentShader
 .replace('#include <lights_fragment_maps>','irradiance=vec3(0.);\n#include <lights_fragment_maps>')
 .replace('#include <lights_fragment_end>','iblIrradiance=vec3(0.);\n#include <lights_fragment_end>\nreflectedLight.directDiffuse=vec3(0.);reflectedLight.directSpecular=vec3(0.);')};

export async function loadDressing(renderer,{phone=false}={}){
 const manifest=await (await fetch(BASE+'manifest.json')).json();
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),tl=new THREE.TextureLoader();
 const aniso=Math.min(phone?4:8,renderer.capabilities.getMaxAnisotropy());
 const tex=(file,{srgb=false,repeat=true,channel=0}={})=>new Promise((res,rej)=>tl.load(BASE+file,t=>{
  t.flipY=false;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=aniso;t.channel=channel;if(srgb)t.colorSpace=THREE.SRGBColorSpace;res(t)},undefined,rej));
 const suffix=phone?'-mobile':'';
 const maps={},T={};
 const lightmap=theme=>maps[theme]||=tex(`light-${theme}-dress${suffix}.webp`,{srgb:true,repeat:false,channel:1});
 const [gltf]=await Promise.all([
  loader.loadAsync(BASE+'dress.glb'),
  lightmap('day'),
  ...manifest.textures.map(async n=>{T[n]=await tex(n==='prints'?`prints${suffix}.webp`:n+'.webp',{srgb:/_a$|^prints$/.test(n)})})
 ]);
 const day=await maps.day,mats=[],glowMats=[];
 const make=name=>{
  const r=manifest.materials[name]||{};
  const m=new THREE.MeshStandardMaterial({color:new THREE.Color(r.color||'#ffffff'),roughness:r.rough??.6,metalness:r.metal??0});
  if(r.tex)m.map=r.tex==='prints'?T.prints:T[r.tex+'_a']||null;
  if(r.tex&&T[r.tex+'_r']){m.roughnessMap=T[r.tex+'_r'];m.roughness=Math.min(1,(r.rough??.6)*1.6)}
  if(r.vc){m.vertexColors=true;m.color.multiplyScalar(1.3)}
  if(r.glow){m.emissive=new THREE.Color(r.emit||'#ffd9a0');m.emissiveIntensity=0;glowMats.push(m)}
  m.lightMap=day;m.lightMapIntensity=Math.PI*manifest.lightmaps.day.dress*LIGHT.dress;
  m.envMapIntensity=(r.metal??0)>.5?1.1:.25;
  m.onBeforeCompile=quiet;m.customProgramCacheKey=()=>'baked';m.name=name;m.userData.dress=true;mats.push(m);return m;
 };
 const cache={},root=gltf.scene;
 root.traverse(o=>{if(!o.isMesh)return;const n=o.material.name;o.material=cache[n]||=make(n);o.castShadow=false;o.receiveShadow=false;o.matrixAutoUpdate=false;o.updateMatrix()});
 root.updateMatrixWorld(true);
 // The lamp bulbs glow at night as soft additive cards, so no bloom pass is needed.
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.2,'rgba(255,255,255,.32)');r.addColorStop(.55,'rgba(255,255,255,.07)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
 const glows=(manifest.glows||[]).map(([x,y,z,s,col])=>{const p=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0}));p.position.set(x,y,z);p.scale.setScalar(s);p.visible=false;root.add(p);return p});
 async function setTheme(dark){
  const theme=dark?'night':'day';let map;
  try{map=await lightmap(theme)}catch(e){console.warn('Night lighting unavailable for the Workshop dressing.',e);map=day}
  const scale=(map===day?manifest.lightmaps.day:manifest.lightmaps[theme]).dress;
  for(const m of mats){m.lightMap=map;m.lightMapIntensity=Math.PI*scale*LIGHT.dress*(map===day?1:LIGHT.night)}
  for(const m of glowMats)m.emissiveIntensity=dark?3.2:0;
  for(const p of glows){p.visible=dark;p.material.opacity=dark?.55:0}
 }
 return {root,manifest,setTheme,materials:mats,
  surfaceGain:(theme,name)=>(manifest.lightmaps[theme]?.[name]??manifest.lightmaps.day[name])*LIGHT.surface*(theme==='night'?LIGHT.night:1)};
}
