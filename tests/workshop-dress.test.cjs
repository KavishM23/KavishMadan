const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),dir=path.join(root,'assets/models/workshop/workshop');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));

test('every file the dressed Workshop loads is present, for desktop and phones',()=>{
 const files=['dress.glb','prints-mobile.webp',...manifest.textures.map(n=>n+'.webp')];
 for(const theme of ['day','night'])for(const g of ['dress','floor','back','left','right'])files.push(`light-${theme}-${g}.webp`,`light-${theme}-${g}-mobile.webp`);
 for(const f of files)assert.ok(fs.existsSync(path.join(dir,f)),`missing ${f}`);
});

test('each lightmap has a positive scale so the page can restore its light level',()=>{
 for(const theme of ['day','night'])for(const g of ['dress','floor','back','left','right']){
  const s=manifest.lightmaps[theme][g];assert.ok(s>0&&Number.isFinite(s),`${theme} ${g}`);
 }
});

test('merged material classes carry their colour in vertex colours',()=>{
 for(const c of ['plastic','metal','paint'])assert.equal(manifest.materials[c].vc,true,c);
});

test('the procedural room is still built when the dressing cannot load',()=>{
 const scene=fs.readFileSync(path.join(root,'workshop.js'),'utf8');
 assert.match(scene,/if\(useDressing\)dress=await loadDressing/);
 assert.match(scene,/\.\.\.\(dress\?\{\}:\{workbench:/);
 const room=fs.readFileSync(path.join(root,'workshop-room.js'),'utf8');
 assert.match(room,/if\(!dressed\)\{/);
});

test('the Blender build checks the car path before it saves',()=>{
 const zone=JSON.parse(fs.readFileSync(path.join(root,'assets/models/workshop/src/carzone.json'),'utf8'));
 assert.ok(zone.sweep.length>20&&zone.rest.length>8);
 const scene=fs.readFileSync(path.join(root,'assets/models/workshop/src/scene.py'),'utf8');
 assert.match(scene,/Dressing in the car path/);
});

test('the Blender attachments keep their three named mounting points',()=>{
 const glb=fs.readFileSync(path.join(dir,'dress.glb'));
 const doc=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());
 for(const key of ['crate','trophy','tyre']){
  assert.ok(doc.nodes.some(n=>n.name?.startsWith(`mounted_${key}__`)),key);
 }
});

test('day and night prop bakes have the same topology and a complete RGB payload',()=>{
 const {receivers,scales}=manifest.propLight;
 assert.ok(receivers.length>100);
 const vertices=receivers.reduce((n,s)=>n+Number(s.split('/')[1]),0);
 const {inflateSync}=require('node:zlib');
 for(const theme of ['day','night']){
  const data=inflateSync(fs.readFileSync(path.join(dir,`props-${theme}.bin`)));
  assert.equal(data.length,vertices*3);
  assert.ok(scales[theme]>0&&Number.isFinite(scales[theme]));
  assert.ok(data.some(n=>n>0));
 }
});

test('missing or corrupt prop light files are rejected before any model is changed',async()=>{
 const vm=require('node:vm');
 const source=fs.readFileSync(path.join(root,'workshop-prop-light.js'),'utf8')
  .replace(/^import .*$/m,'').replaceAll('export ','');
 let result;
 const {readPropLight,installPropLight}=vm.runInNewContext(source+'\n({readPropLight,installPropLight})',{
  fetch:()=>result,Response,DecompressionStream
 });
 result=new Response(null,{status:404});
 await assert.rejects(readPropLight('missing.bin'),/missing/);
 result=new Response('invalid compressed payload');
 await assert.rejects(readPropLight('corrupt.bin'));
 const mesh={isMesh:true,visible:true,userData:{},children:[],material:{isMeshStandardMaterial:true,visible:true,colorWrite:true},
  geometry:{attributes:{position:{count:1,array:[0,0,0]}}}};
 const items=Object.fromEntries(['guitar','tablet','book','satellite','trophy','tyre','shelving','plant','crate','pencil','pick'].map(k=>[k,mesh]));
 assert.throws(()=>installPropLight(items,{receivers:[],scales:{day:1}},new Uint8Array(3)),/does not match/);
 assert.equal(mesh.geometry.attributes.workshopLight,undefined);
});
