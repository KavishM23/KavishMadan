/* MP4/4 by Flamestroke, CC BY 4.0. See assets/models/ATTRIBUTION.md. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// The source is a texture atlas. Repaint only its sponsor areas, retaining the
// original red/white shapes and the small surface details elsewhere.
function personalLivery(material){
 const map=material.map;if(!map?.image)return;
 const im=map.image,c=document.createElement('canvas');c.width=im.width;c.height=im.height;
 const g=c.getContext('2d');g.drawImage(im,0,0);g.save();g.scale(c.width/2048,c.height/2048);
 const white=(x,y,w,h)=>{g.fillStyle='#fff';g.fillRect(x,y,w,h)};
 if(material.name==='blinn2'){
  white(955,475,200,80);white(1400,450,120,120);white(980,900,200,90);white(1420,875,120,120);
  white(485,1490,330,180);white(485,1670,330,170);white(1630,1560,390,225);
  g.fillStyle='#101820';g.font='bold 90px Georgia, serif';g.textAlign='center';g.fillText('KAVISH',650,1750);
  g.save();g.translate(650,1595);g.rotate(Math.PI);g.fillText('KAVISH',0,0);g.restore();
 }else if(material.name==='blinn4'){
  // The small wing atlas is 256px; its dimensions are scaled above.
  white(0,0,2048,265);white(0,1440,2048,608);
  white(710,650,580,360);
  g.fillStyle='#ed1128';g.fillRect(390,1010,290,135);g.fillRect(1360,650,300,125);
 }else if(material.name==='blinn6'){
  white(500,950,1430,650);
 }else if(material.name==='blinn10'){
  g.fillStyle='#b9b9b9';g.fillRect(0,0,2048,2048);
 }else if(material.name==='blinn7'){
  // Darken the pale original tyre branding while retaining the rubber map.
  g.restore();const pixels=g.getImageData(0,0,c.width,c.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const r=d[i],v=d[i+1],b=d[i+2];if(r>95&&v>90&&b<v*.88&&Math.abs(r-v)<45){d[i]=Math.round(r*.25);d[i+1]=Math.round(v*.25);d[i+2]=Math.round(b*.25)}}
  g.putImageData(pixels,0,0);g.save();
 }
 g.restore();const texture=new THREE.CanvasTexture(c);texture.flipY=map.flipY;texture.colorSpace=map.colorSpace;texture.wrapS=map.wrapS;texture.wrapT=map.wrapT;texture.anisotropy=map.anisotropy;texture.needsUpdate=true;material.map=texture;material.needsUpdate=true;
}

// The download combines the four tyres and hubs by material. Split their
// triangles into four pivoted assemblies so the existing drive can turn them.
function rigWheels(scene){
 let tyre;scene.traverse(o=>{if(o.isMesh&&o.material?.name==='blinn7')tyre=o});
 if(!tyre?.geometry.index)return null;
 const centerX=4.88, buckets=Array.from({length:4},()=>({min:new THREE.Vector3(Infinity,Infinity,Infinity),max:new THREE.Vector3(-Infinity,-Infinity,-Infinity)}));
 const groupFor=(x,z)=>(x>centerX?1:0)+(z>0?2:0);
 const pos=tyre.geometry.attributes.position,ix=tyre.geometry.index;
 for(let i=0;i<ix.count;i+=3){let x=0,z=0;for(let j=0;j<3;j++){let n=ix.getX(i+j);x+=pos.getX(n);z+=pos.getZ(n)}const b=buckets[groupFor(x/3,z/3)];for(let j=0;j<3;j++){let n=ix.getX(i+j),v=new THREE.Vector3(pos.getX(n),pos.getY(n),pos.getZ(n));b.min.min(v);b.max.max(v)}}
 const parent=tyre.parent,spins=[],fronts=[];
 for(const b of buckets){if(!Number.isFinite(b.min.x))return null;const pivot=b.min.clone().add(b.max).multiplyScalar(.5),steer=new THREE.Group(),spin=new THREE.Group();steer.position.copy(pivot);steer.userData.moving=true;spin.userData.moving=true;steer.add(spin);parent.add(steer);spins.push(spin);if(pivot.z<0)fronts.push(steer)}
 const meshes=[];scene.traverse(o=>{if(o.isMesh&&['blinn7','blinn9'].includes(o.material?.name))meshes.push(o)});
 for(const mesh of meshes){const geo=mesh.geometry,p=geo.attributes.position,idx=geo.index;if(!idx||mesh.parent!==parent)continue;const indices=[[],[],[],[]];
  for(let i=0;i<idx.count;i+=3){let x=0,z=0;for(let j=0;j<3;j++){const n=idx.getX(i+j);x+=p.getX(n);z+=p.getZ(n)}indices[groupFor(x/3,z/3)].push(idx.getX(i),idx.getX(i+1),idx.getX(i+2))}
  indices.forEach((arr,i)=>{const part=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(geo.attributes))part.setAttribute(name,attribute);part.setIndex(arr);const piece=new THREE.Mesh(part,mesh.material);piece.position.copy(spins[i].parent.position).negate();piece.castShadow=true;piece.receiveShadow=true;spins[i].add(piece)});parent.remove(mesh);
 }
 return {spins,fronts};
}

export async function installMP44(car){
 const gltf=await new GLTFLoader().loadAsync('assets/models/mp44-flamestroke.glb');const model=gltf.scene;
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(['blinn2','blinn4','blinn6','blinn7','blinn10'].includes(o.material?.name))personalLivery(o.material)});
 const wheels=rigWheels(model);if(!wheels)throw new Error('MP4/4 wheel geometry is missing');
 model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),scale=4.4/size.z;
 // The original model points toward -Z; rotate it to match the workshop rig.
 model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
 const orientation=new THREE.Group();orientation.rotation.y=Math.PI;orientation.position.z=-1.15;orientation.add(model);
 const {tyreGeometry,rubber}=car.userData.parts,flap=new THREE.Group(),yoke=new THREE.Group();
 car.clear();car.add(orientation);car.userData.parts={tyreGeometry,rubber,...wheels,flap,yoke};
 car.userData.playFor=2.6;car.userData.play=(h,p,dt)=>{wheels.fronts.forEach(w=>{w.rotation.y=h*.12});const speed=p<2.6?26*Math.max(0,1-p/2.6):0;wheels.spins.forEach(w=>{w.rotation.x-=speed*dt})};
}
