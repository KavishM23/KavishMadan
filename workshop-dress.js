/* The dressed Workshop from Blender: benches, shelving, window, wall kit and set dressing, with day and
   night light baked into one atlas. Baked surfaces ignore the live lights; metals still pick up the
   room's reflections. If anything here fails to load, workshop.js builds the older procedural room. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from './assets/vendor/meshopt-decoder.mjs';
import {installPropLight,readPropLight} from './workshop-prop-light.js';

const BASE='assets/models/workshop/workshop/';
/* Overall level for baked light, and how much ambient the painted room planes keep on top of it. */
export const LIGHT={dress:.92,surface:.92,night:.91,amb:[.05,.048,.044]};

// Baked surfaces take no direct or ambient light from the scene: only the lightmap, plus reflections.
const quiet=s=>{s.fragmentShader=s.fragmentShader
 .replace('#include <lights_fragment_maps>','irradiance=vec3(0.);\n#include <lights_fragment_maps>')
 .replace('#include <lights_fragment_end>','iblIrradiance=vec3(0.);\n#include <lights_fragment_end>\nreflectedLight.directDiffuse=vec3(0.);reflectedLight.directSpecular=vec3(0.);')};

export async function loadDressing(renderer,{phone=false}={}){
 const response=await fetch(BASE+'manifest.json');
 if(!response.ok)throw new Error('Workshop manifest unavailable');
 const manifest=await response.json();
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),tl=new THREE.TextureLoader();
 const aniso=Math.min(phone?4:8,renderer.capabilities.getMaxAnisotropy());
 const tex=(file,{srgb=false,repeat=true,channel=0}={})=>new Promise((res,rej)=>tl.load(BASE+file,t=>{
  t.flipY=false;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=aniso;t.channel=channel;if(srgb)t.colorSpace=THREE.SRGBColorSpace;res(t)},undefined,rej));
 const suffix=phone?'-mobile':'';
 const maps={},T={};
 const propMaps={};
 const propSpec=manifest.propLight;
 const propBytes=propSpec?.receivers.reduce((n,s)=>n+Number(s.split('/')[1])*3,0);
 const propMap=theme=>propSpec?(propMaps[theme]||=readPropLight(BASE+`props-${theme}.bin`).then(data=>{
  if(data.length!==propBytes||!(propSpec.scales[theme]>0))throw new Error('Workshop prop lighting is incomplete');
  return data;
 })):null;
 const lightmap=theme=>maps[theme]||=tex(`light-${theme}-dress${suffix}.webp`,{srgb:true,repeat:false,channel:1});
 const [gltf,dayProps]=await Promise.all([
  loader.loadAsync(BASE+'dress.glb'),
  propMap('day'),
  lightmap('day'),
  ...manifest.textures.map(async n=>{T[n]=await tex(n==='prints'?`prints${suffix}.webp`:n+'.webp',{srgb:/_a$|^prints$/.test(n)})})
 ]);
 const day=await maps.day,mats=[],glowMats=[];
 let propLights=null,themeTicket=0;
 const make=name=>{
  const r=manifest.materials[name]||{};
  const m=new THREE.MeshStandardMaterial({color:new THREE.Color(r.color||'#ffffff'),roughness:r.rough??.6,metalness:r.metal??0});
  if(r.tex)m.map=r.tex==='prints'?T.prints:T[r.tex+'_a']||null;
  if(r.tex&&T[r.tex+'_r']){m.roughnessMap=T[r.tex+'_r'];m.roughness=Math.min(1,(r.rough??.6)*1.6)}
  if(r.vc){m.vertexColors=true;m.color.multiplyScalar(1.3)}
  // Prints and labels sit millimetres in front of their boards; pull them forward in depth so they never flicker.
  if(name==='prints'){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-6}
  if(r.glow){m.emissive=new THREE.Color(r.emit||'#ffd9a0');m.emissiveIntensity=name==='neon_tube'?.24:0;glowMats.push(m)}
  m.lightMap=day;m.lightMapIntensity=Math.PI*manifest.lightmaps.day.dress*LIGHT.dress;
  m.envMapIntensity=(r.metal??0)>.5?1.1:.25;
  m.onBeforeCompile=quiet;m.customProgramCacheKey=()=>'baked';m.name=name;m.userData.dress=true;mats.push(m);return m;
 };
 const cache={},root=gltf.scene;
 root.traverse(o=>{if(!o.isMesh)return;const n=o.material.name;o.material=cache[n]||=make(n);o.castShadow=false;o.receiveShadow=false;o.matrixAutoUpdate=false;o.updateMatrix()});
 root.updateMatrixWorld(true);
 // Copies on the glow layer feed the bloom mask without lighting any other surface.
 const emitters=[];
 root.traverse(o=>{
  if(!o.isMesh||!o.material.emissive||!manifest.materials[o.material.name]?.glow)return;
  const source=new THREE.Mesh(o.geometry,new THREE.MeshBasicMaterial({color:o.material.emissive,toneMapped:false}));
  source.layers.set(1);source.name=o.material.name;
  emitters.push([o,source]);
 });
 for(const [o,source] of emitters)o.add(source);
 function glow(dark){
  for(const m of glowMats){
   m.emissiveIntensity=m.name==='neon_tube'?(dark?1.65:.24):(dark?1.75:0);
  }
  for(const [o,source] of emitters){
   source.visible=o.material.emissiveIntensity>0;
   source.material.color.copy(o.material.emissive).multiplyScalar(o.material.emissiveIntensity);
  }
 }
 async function setTheme(dark,ready){
  const ticket=++themeTicket,theme=dark?'night':'day';
  let map=day,props=dayProps,valid=true;
  try{[map,props]=await Promise.all([lightmap(theme),propMap(theme),ready])}
  catch(e){console.warn('Workshop theme bake unavailable.',e);valid=false}
  if(ticket!==themeTicket)return false;
  const scale=(map===day?manifest.lightmaps.day:manifest.lightmaps[theme]).dress;
  for(const m of mats){m.lightMap=map;m.lightMapIntensity=Math.PI*scale*LIGHT.dress*(dark?(valid?LIGHT.night:.32):1)}
  if(propLights){
   propLights.enabled(valid);
   if(valid)propLights.theme(theme,props);
  }
  glow(dark);
  return valid;
 }
 glow(false);
 return {root,manifest,setTheme,materials:mats,
  attachProps(items){
   if(!dayProps)return null;
   const mounts={mounted_crate:items.crate.userData.parts.lid,mounted_trophy:items.trophy.userData.parts.cup,
    mounted_tyre:items.tyre.userData.parts.body};
   const parts=[];
   root.traverse(o=>{
    const mount=mounts[o.name.split('__')[0]];
    if(o.isMesh&&mount)parts.push([mount,o]);
   });
   if(Object.values(mounts).some(mount=>!parts.some(([parent])=>parent===mount)))throw new Error('Workshop attachment is missing');
   propLights=installPropLight(items,propSpec,dayProps);
   for(const [mount,mesh] of parts){
    mesh.matrixAutoUpdate=true;mount.attach(mesh);mesh.updateMatrix();
   }
   return propLights;
  },
  surfaceGain:(theme,name)=>(manifest.lightmaps[theme]?.[name]??manifest.lightmaps.day[name])*LIGHT.surface*(theme==='night'?LIGHT.night:1)};
}
