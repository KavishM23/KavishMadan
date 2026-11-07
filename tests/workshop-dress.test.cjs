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
 assert.match(scene,/try\{dress=await loadDressing/);
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
