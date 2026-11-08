import * as THREE from 'three';

const KEYS=['guitar','tablet','book','satellite','trophy','tyre','shelving','plant','crate','pencil','pick'];
export function propReceivers(items){
 const receivers=[];
 for(const key of KEYS){
  function visit(o,moving,visible){
   moving||=!!o.userData.moving;
   visible&&=o.visible;
   const materials=Array.isArray(o.material)?o.material:[o.material];
   if(o.isMesh&&materials.every(m=>m?.isMeshStandardMaterial&&!m.transparent&&m.visible&&m.colorWrite)){
    const count=o.isInstancedMesh?o.count:o.geometry.attributes.position.count;
    receivers.push({key,o,materials,moving,visible,count});
   }
   for(const child of o.children)visit(child,moving,visible);
  }
  visit(items[key],false,true);
 }
 return receivers;
}

const signatures=new WeakMap();
export function receiverSignature({key,o,count,moving}){
 let hash=signatures.get(o.geometry);
 if(hash===undefined){
  const p=o.geometry.attributes.position.array,step=Math.max(1,Math.floor(p.length/30));
  hash=2166136261;
  for(let i=0;i<p.length;i+=step)hash=Math.imul(hash^Math.round(p[i]*1e6),16777619);
  signatures.set(o.geometry,hash);
 }
 return [key,count,moving?1:0,hash].join('/');
}

export async function readPropLight(url){
 const res=await fetch(url);
 if(!res.ok)throw new Error('Workshop prop lighting is missing');
 return new Uint8Array(await new Response(res.body.pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
}

export function installPropLight(items,spec,day){
 const receivers=propReceivers(items),count=receivers.reduce((n,r)=>n+r.count,0);
 if(spec?.receivers?.length!==receivers.length||day.length!==count*3||
    receivers.some((r,i)=>receiverSignature(r)!==spec.receivers[i])){
  throw new Error('Workshop prop lighting does not match the current models');
 }
 const state=new Map(),attributes=[],shaderMats=new Map(),used=new WeakSet();
 const gain={value:spec.scales.day},enabled={value:1},stationary={value:1};
 let offset=0;
 for(const {key,o,materials,moving,count} of receivers){
  const values=new Uint8Array(count*3);
  values.set(day.subarray(offset,offset+values.length));offset+=values.length;
  const attr=o.isInstancedMesh?new THREE.InstancedBufferAttribute(values,3,true):new THREE.BufferAttribute(values,3,true);
  attributes.push(attr);
  if(used.has(o.geometry))o.geometry=o.geometry.clone();
  used.add(o.geometry);o.geometry.setAttribute('workshopLight',attr);
  if(!state.has(key))state.set(key,{value:1});
  const activity=moving?state.get(key):stationary;
  const travels=key==='tyre'||key==='satellite';
  const mix=moving?(travels?.72:.85):1;
  const baked=materials.map(source=>{
   const id=[source.uuid,key,mix].join('/');
   if(shaderMats.has(id))return shaderMats.get(id);
   const material=source.clone();
   const priorKey=source.customProgramCacheKey();
   material.onBeforeCompile=(shader,renderer)=>{
    source.onBeforeCompile(shader,renderer);
    shader.uniforms.workshopGain=gain;
    shader.uniforms.workshopEnabled=enabled;
    shader.uniforms.workshopBlend=activity;
    shader.vertexShader='attribute vec3 workshopLight; varying vec3 vWorkshopLight;\n'+shader.vertexShader
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvWorkshopLight=workshopLight;');
    shader.fragmentShader='varying vec3 vWorkshopLight; uniform float workshopGain, workshopBlend, workshopEnabled;\n'+shader.fragmentShader
      .replace('#include <lights_fragment_end>',`float bakedBlend=workshopEnabled*workshopBlend*${mix.toFixed(2)};
        vec3 bakedLight=pow(vWorkshopLight,vec3(2.2))*workshopGain*3.14159265;
        irradiance=mix(irradiance,bakedLight,bakedBlend);
        iblIrradiance*=1.-bakedBlend;
        reflectedLight.directDiffuse*=1.-bakedBlend;
        #include <lights_fragment_end>`);
   };
   material.customProgramCacheKey=()=>priorKey+'|workshop-prop-'+mix;
   shaderMats.set(id,material);
   return material;
  });
  o.material=Array.isArray(o.material)?baked:baked[0];
 }
 return {
  theme(name,data){
   if(data.length!==count*3)throw new Error('Workshop prop lighting has an invalid size');
   gain.value=spec.scales[name];
   let start=0;
   for(const attr of attributes){
    attr.array.set(data.subarray(start,start+attr.array.length));
    start+=attr.array.length;attr.needsUpdate=true;
   }
  },
  animate(key,amount){if(state.has(key))state.get(key).value=amount},
  enabled(value){enabled.value=value?1:0}
 };
}
