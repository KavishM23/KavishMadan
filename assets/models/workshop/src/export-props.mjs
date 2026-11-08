// Record the exact geometry the page builds, in the rest pose, for Cycles.
// Canvas painting is skipped here. The browser keeps all authored textures.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {registerHooks} from 'node:module';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const packagePath=process.env.WORKSHOP_THREE||path.resolve(path.dirname(require.resolve('three')), '..');
const root=fileURLToPath(new URL('../../../../',import.meta.url));
registerHooks({resolve(specifier,context,next){
 if(specifier==='three')return next(path.join(packagePath,'build/three.module.js'),context);
 if(specifier.startsWith('three/addons/'))return next(path.join(packagePath,'examples/jsm',specifier.slice(13)),context);
 return next(specifier,context);
}});

globalThis.window=globalThis;
for(const file of ['workshop-kit.js','workshop-car.js','workshop-props.js'])await import(path.join(root,file));
const THREE=await import('three');
if(THREE.REVISION!=='160')throw new Error('Install three@0.160.0 to match the Workshop runtime');
const {RoundedBoxGeometry}=await import('three/addons/geometries/RoundedBoxGeometry.js');
const {PLACES,flatten}=await import(path.join(root,'workshop.js'));
const {propReceivers,receiverSignature}=await import(path.join(root,'workshop-prop-light.js'));

globalThis.document={createElement(){return {getContext(){return context}}}};
const gradient={addColorStop(){}};
const context=new Proxy({measureText:()=>({width:0}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
 createLinearGradient:()=>gradient,createRadialGradient:()=>gradient}, {get:(o,k)=>o[k]||(()=>{})});

const kit=Workshop.kit(THREE,RoundedBoxGeometry,{anisotropy:1,texScale:.5});
const car=Workshop.car(THREE,kit),props=Workshop.props(THREE,kit,car.userData.parts,{dressed:true});
const items={};
for(const [key,method] of Object.entries({guitar:'guitar',tablet:'tablet',book:'sketchbook',satellite:'satellite',trophy:'trophy',tyre:'tyre',shelving:'shelving',plant:'plant',crate:'crate',pencil:'pencil',pick:'pick'})){
 const o=props[method](key==='book'?new THREE.Texture():undefined),L=PLACES[key];
 o.position.set(...L.p);o.rotation.set(...L.r);o.scale.setScalar(L.s);
 items[key]=flatten(o);
}
const point=new THREE.Vector3(),n=new THREE.Vector3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4(),normal=new THREE.Matrix3();
const finishes={guitar:[.33,.13,.038],tablet:[.045,.055,.065],book:[.68,.57,.38],trophy:[.13,.055,.04],crate:[.125,.03,.038],tyre:[.015,.016,.018]};
const data=propReceivers(items).map(r=>{
 const {o,materials,count,key,moving,visible}=r;
 const g=o.geometry,p=g.attributes.position,ns=g.attributes.normal;
 const verts=[],normals=[],indices=[],groups=[];
 const copies=o.isInstancedMesh?count:1;
 for(let k=0;k<copies;k++){
  matrix.copy(o.matrixWorld);
  if(o.isInstancedMesh){o.getMatrixAt(k,instance);matrix.multiply(instance)}
  normal.getNormalMatrix(matrix);
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(matrix);
   n.fromBufferAttribute(ns,i).applyMatrix3(normal).normalize();
   verts.push(point.x,-point.z,point.y);normals.push(n.x,-n.z,n.y);
  }
  const first=indices.length,num=g.index?.count||p.count;
  for(let i=0;i<num;i++)indices.push(k*p.count+(g.index?g.index.getX(i):i));
  for(const {start,count,materialIndex} of g.groups)groups.push([start+first,count,materialIndex]);
 }
 return {signature:receiverSignature(r),key,moving,visible,count,verts,normals,indices,groups,
  colors:materials.map(m=>m.map&&finishes[key]?finishes[key]:m.color.toArray()),instanceVertices:o.isInstancedMesh?p.count:0};
});
fs.writeFileSync(process.argv[2],JSON.stringify(data));
console.log('Prop bake geometry',data.length,'meshes;',data.reduce((n,r)=>n+r.count,0),'receivers');
