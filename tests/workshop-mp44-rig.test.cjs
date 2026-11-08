const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('MP4/4 rig leaves shared chassis geometry still and assigns all four tyres',async()=>{
 const {wheelForTriangle}=await import('../workshop-mp44-rig.mjs');
 const {MeshoptDecoder}=await import('../assets/vendor/meshopt-decoder.mjs');await MeshoptDecoder.ready;
 const b=fs.readFileSync(path.join(__dirname,'../assets/models/mp44-flamestroke.glb'));
 const n=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+n)),bin=28+n;
 const sizes={5121:1,5123:2,5125:4,5126:4},components={SCALAR:1,VEC2:2,VEC3:3};
 const decoded=new Map();
 function bytes(i){if(decoded.has(i))return decoded.get(i);const v=doc.bufferViews[i],e=v.extensions?.EXT_meshopt_compression;
  if(!e)return b.subarray(bin+(v.byteOffset||0),bin+(v.byteOffset||0)+v.byteLength);
  const out=Buffer.alloc(v.byteLength),at=bin+(e.byteOffset||0);
  MeshoptDecoder.decodeGltfBuffer(out,e.count,e.byteStride,b.subarray(at,at+e.byteLength),e.mode,e.filter);
  decoded.set(i,out);return out}
 function attribute(i){const a=doc.accessors[i],v=doc.bufferViews[a.bufferView],size=sizes[a.componentType],num=components[a.type],data=bytes(a.bufferView),start=a.byteOffset||0,stride=v.byteStride||size*num;
  return {count:a.count,get(index,component=0){const at=start+index*stride+component*size;return a.componentType===5126?data.readFloatLE(at):a.componentType===5125?data.readUInt32LE(at):a.componentType===5123?data.readUInt16LE(at):data.readUInt8(at)}}}
 function triangles(mat){const mesh=doc.meshes.find(m=>doc.materials[m.primitives[0].material].name===mat),p=mesh.primitives[0],pos=attribute(p.attributes.POSITION),ix=attribute(p.indices),result=[];
  for(let i=0;i<ix.count;i+=3)result.push([0,1,2].map(j=>{const v=ix.get(i+j);return{x:pos.get(v,0),y:pos.get(v,1),z:pos.get(v,2)}}));return result}
 const tyres=triangles('blinn7'),bounds=Array.from({length:4},()=>({min:{x:Infinity,y:Infinity,z:Infinity},max:{x:-Infinity,y:-Infinity,z:-Infinity}}));
 for(const tri of tyres){const x=tri.reduce((a,v)=>a+v.x,0)/3,z=tri.reduce((a,v)=>a+v.z,0)/3,box=bounds[(x>4.88?1:0)+(z>0?2:0)];for(const v of tri)for(const axis of ['x','y','z']){box.min[axis]=Math.min(box.min[axis],v[axis]);box.max[axis]=Math.max(box.max[axis],v[axis])}}
 const assigned=[0,0,0,0],stationary=[];
 for(const tri of tyres.concat(triangles('blinn9'))){const i=wheelForTriangle(tri,bounds);if(i===-1)stationary.push(tri);else assigned[i]++}
 for(const count of assigned)assert.ok(count>5000,`expected tyre and hub geometry for each wheel: ${assigned}`);
 assert.ok(stationary.length>0,'shared chassis geometry must remain attached to the car');
 assert.ok(stationary.some(tri=>tri.some(v=>v.z>-.9&&v.z<-.65&&v.x>4.7&&v.x<5.1)),'cockpit-area geometry must remain stationary');
});
