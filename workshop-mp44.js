/* MP4/4 by Flamestroke, CC BY 4.0. See assets/models/ATTRIBUTION.md. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { wheelForTriangle } from './workshop-mp44-rig.mjs';

// Preserve the original paint atlas and replace its two small, baked-in body
// wordmarks with vector artwork at a higher texture resolution.
function sharpenBodyDecals(material,wordmark,anisotropy){
 const original=material.map;if(!original?.image||!wordmark)return;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=3072;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.scale(1.5,1.5);ctx.drawImage(original.image,0,0,2048,2048);
 ctx.fillStyle='#fff';ctx.fillRect(500,1560,310,90);ctx.fillRect(500,1680,310,95);
 ctx.drawImage(wordmark,510,1684,285,84);
 ctx.save();ctx.translate(795,1646);ctx.rotate(Math.PI);ctx.drawImage(wordmark,0,0,285,84);ctx.restore();
 const map=new THREE.CanvasTexture(canvas);map.flipY=original.flipY;map.colorSpace=original.colorSpace;
 map.wrapS=original.wrapS;map.wrapT=original.wrapT;map.magFilter=original.magFilter;map.minFilter=original.minFilter;
 map.offset.copy(original.offset);map.repeat.copy(original.repeat);map.rotation=original.rotation;map.center.copy(original.center);
 map.anisotropy=anisotropy;map.needsUpdate=true;material.map=map;material.needsUpdate=true;original.dispose();
}

// The tyre mesh contains exactly four tyres. The hub material also contains
// chassis details, so only triangles fully inside a tyre volume are rigged.
function rigWheels(scene){
 let tyre;scene.traverse(o=>{if(o.isMesh&&o.material?.name==='blinn7')tyre=o});
 if(!tyre?.geometry.index)return null;
 const centerX=4.88, bounds=Array.from({length:4},()=>({min:new THREE.Vector3(Infinity,Infinity,Infinity),max:new THREE.Vector3(-Infinity,-Infinity,-Infinity)}));
 const groupFor=(x,z)=>(x>centerX?1:0)+(z>0?2:0);
 const pos=tyre.geometry.attributes.position,ix=tyre.geometry.index;
 for(let i=0;i<ix.count;i+=3){let x=0,z=0;for(let j=0;j<3;j++){const n=ix.getX(i+j);x+=pos.getX(n);z+=pos.getZ(n)}const b=bounds[groupFor(x/3,z/3)];for(let j=0;j<3;j++){const n=ix.getX(i+j),v=new THREE.Vector3(pos.getX(n),pos.getY(n),pos.getZ(n));b.min.min(v);b.max.max(v)}}
 if(bounds.some(b=>!Number.isFinite(b.min.x)))return null;
 const parent=tyre.parent,spins=[],fronts=[];
 for(const b of bounds){const pivot=b.min.clone().add(b.max).multiplyScalar(.5),steer=new THREE.Group(),spin=new THREE.Group();steer.position.copy(pivot);steer.userData.moving=true;spin.userData.moving=true;steer.add(spin);parent.add(steer);spins.push(spin);if(pivot.z<0)fronts.push(steer)}
 const meshes=[];scene.traverse(o=>{if(o.isMesh&&['blinn7','blinn9'].includes(o.material?.name))meshes.push(o)});
 for(const mesh of meshes){const geo=mesh.geometry,p=geo.attributes.position,idx=geo.index;if(!idx||mesh.parent!==parent)continue;const indices=[[],[],[],[],[]];
  for(let i=0;i<idx.count;i+=3){const verts=[];for(let j=0;j<3;j++){const n=idx.getX(i+j);verts.push({x:p.getX(n),y:p.getY(n),z:p.getZ(n)})}const wheel=wheelForTriangle(verts,bounds);indices[wheel<0?4:wheel].push(idx.getX(i),idx.getX(i+1),idx.getX(i+2))}
  indices.forEach((arr,i)=>{if(!arr.length)return;const part=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(geo.attributes))part.setAttribute(name,attribute);part.setIndex(arr);const piece=new THREE.Mesh(part,mesh.material);piece.castShadow=true;piece.receiveShadow=true;if(i===4){parent.add(piece)}else{piece.position.copy(spins[i].parent.position).negate();spins[i].add(piece)}});parent.remove(mesh);
 }
 return {spins,fronts};
}

// The source windscreen is very opaque from this viewpoint, obscuring its
// steering wheel. Fit a clearly defined wheel at the original wheel's centre.
function cockpitDetails(model){
 let originalWheel=null,screen=null;
 model.traverse(o=>{if(!o.isMesh)return;if(o.material?.name==='lambert5')originalWheel=o;if(o.material?.name==='blinn10')screen=o});
 if(screen){screen.material=screen.material.clone();screen.material.map=null;screen.material.color.set('#aab6b6');screen.material.opacity=.13;screen.material.transparent=true;screen.material.depthWrite=false;screen.material.roughness=.18;screen.material.needsUpdate=true}
 if(!originalWheel)return new THREE.Group();
 originalWheel.geometry.computeBoundingBox();const center=originalWheel.geometry.boundingBox.getCenter(new THREE.Vector3());
 const wheel=new THREE.Group();wheel.name='Steering wheel';wheel.position.copy(center);wheel.rotation.x=-.22;wheel.userData.moving=true;
 const leather=new THREE.MeshStandardMaterial({color:'#17191b',roughness:.78}),metal=new THREE.MeshStandardMaterial({color:'#8d9292',metalness:.75,roughness:.38});
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.105,.011,12,64),leather);wheel.add(rim);
 for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){const spoke=new THREE.Mesh(new THREE.BoxGeometry(.085,.013,.007),metal);spoke.position.set(Math.cos(angle)*.048,Math.sin(angle)*.048,0);spoke.rotation.z=angle;wheel.add(spoke)}
 const boss=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.018,28),leather);boss.rotation.x=Math.PI/2;wheel.add(boss);
 const column=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.15,16),metal);column.rotation.x=Math.PI/2;column.position.z=-.08;wheel.add(column);
 wheel.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});originalWheel.visible=false;originalWheel.parent.add(wheel);return wheel;
}

export async function installMP44(car,{anisotropy=1}={}){
 const [gltf,wordmark]=await Promise.all([new GLTFLoader().loadAsync('assets/models/mp44-flamestroke.glb'),new THREE.ImageLoader().loadAsync('assets/models/decals/marlboro-wordmark.svg').catch(()=>null)]);const model=gltf.scene;
 const sharpened=new Set();model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const materials=Array.isArray(o.material)?o.material:[o.material];for(const material of materials){for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(material[key])material[key].anisotropy=anisotropy;if(material.name==='blinn2'&&!sharpened.has(material)){sharpened.add(material);sharpenBodyDecals(material,wordmark,anisotropy)}}});
 const wheels=rigWheels(model);if(!wheels)throw new Error('MP4/4 wheel geometry is missing');const yoke=cockpitDetails(model);
 model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),scale=4.4/size.z;
 model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
 const orientation=new THREE.Group();orientation.rotation.y=Math.PI;orientation.position.z=-1.15;orientation.add(model);
 const {tyreGeometry,rubber}=car.userData.parts,flap=new THREE.Group();
 car.clear();car.add(orientation);car.userData.parts={tyreGeometry,rubber,...wheels,flap,yoke};
 car.userData.playFor=2.6;car.userData.play=(h,p,dt)=>{wheels.fronts.forEach(w=>{w.rotation.y=h*.08});yoke.rotation.z=-h*.14;const speed=p<2.6?26*Math.max(0,1-p/2.6):0;wheels.spins.forEach(w=>{w.rotation.x-=speed*dt})};
}
