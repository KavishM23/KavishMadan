const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function element(){return {hidden:false,textContent:'',href:'',dataset:{},attributes:{},events:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,fn){this.events[k]=fn},focus(){this.focused=true}}}
function setup(){
 const ids=Object.fromEntries(['testlab-stage','testlab-canvas','testlab-card','testlab-hint','testlab-fallback','testlab-tag','testlab-name','testlab-desc','testlab-link','testlab-back'].map(k=>[k,element()]));
 const buttons=['strata','drone','orbit','wing'].map(key=>Object.assign(element(),{dataset:{lab:key}}));
 const document={getElementById:id=>ids[id],querySelectorAll:()=>buttons};
 class IntersectionObserver{constructor(callback){this.callback=callback}observe(){}}
 const window={events:{},addEventListener(k,fn){this.events[k]=fn}},location={hash:'#builds'};
 const source=fs.readFileSync('builds-lab.js','utf8').replace(/^import .*;\s*$/gm,'');
 vm.runInNewContext(source,{document,window,location,matchMedia:()=>({matches:false}),IntersectionObserver});
 return {ids,buttons,window,location};
}
test('each lab station opens its matching project without WebGL',()=>{
 const {ids,buttons}=setup();
 for(const [i,link] of ['#b-4x4','#b-quad','#b-kessler','#b-wing'].entries()){
  buttons[i].events.click();assert.equal(ids['testlab-card'].hidden,false);assert.equal(ids['testlab-link'].href,link);assert.equal(buttons[i].attributes['aria-pressed'],'true');
  assert.equal(buttons.filter(b=>b.attributes['aria-pressed']==='true').length,1);
 }
 ids['testlab-back'].events.click();assert.equal(ids['testlab-card'].hidden,true);assert.equal(ids['testlab-hint'].hidden,false);assert.ok(buttons.every(b=>b.attributes['aria-pressed']==='false'));
});

test('returning to Builds resets a prior selection',()=>{
 const {ids,buttons,window,location}=setup();buttons[2].events.click();assert.equal(ids['testlab-card'].hidden,false);location.hash='#builds';window.events.hashchange();assert.equal(ids['testlab-card'].hidden,true);assert.equal(buttons[2].attributes['aria-pressed'],'false');
});

test('choosing the same project again does not restart it',()=>{
 const {ids,buttons}=setup();buttons[1].events.click();ids['testlab-card'].hidden=true;buttons[1].events.click();assert.equal(ids['testlab-card'].hidden,true);
});

test('going back returns keyboard focus to the project that was open',()=>{
 const {ids,buttons}=setup();buttons[3].events.click();ids['testlab-back'].events.click();assert.equal(buttons[3].focused,true);
});

// The dispense is checked as geometry: nothing a product does may pass through glass, a shelf or the ramp.
const G=require('../builds-lab-layout.js');
const sizes={strata:{w:.385,h:.2229,d:.32},drone:{w:.3491,h:.1827,d:.3491},orbit:{w:.3169,h:.4768,d:.3909},wing:{w:.365,h:.2934,d:.265}}; // measured from the exported models
for(const [name,size] of Object.entries(sizes)){
 const scale=G.fit(size),w=size.w*scale,h=size.h*scale,d=size.d*scale,slot=G.slots[name];
 test(`${name} fits its slot and clears the machine all the way down`,()=>{
  assert.ok(w<=G.maxW+1e-6&&d<=G.maxD+1e-6&&h<=G.maxH+1e-6);
  assert.ok(slot[0]-w/2>=G.bayL+.06&&slot[0]+w/2<=G.bayR-.06,'clear of the bay walls and shelf uprights');
  assert.ok(Math.abs(slot[0]-G.fenceX)>=w/2+.03,'clear of the fence and the neighbouring project');
  const shelfAbove=G.shelfTops.filter(y=>y>slot[1])[0]??G.ceiling;
  assert.ok(slot[1]+G.rest+h<shelfAbove-.06,'clear of the shelf above');
  for(let t=0;t<=G.times.feed+G.times.tip+G.times.fall+G.times.land+G.times.door+G.times.slide;t+=10){
   const p=G.path(t,slot,scale,size);
   const c=Math.cos(p.tilt),s=Math.abs(Math.sin(p.tilt));
   const frontZ=p.z+d/2*c+h*s,backZ=p.z-d/2*c;
   // Before the door opens, the product stays behind the glass and front skin.
   if(p.door<.01)assert.ok(frontZ<G.glass,`front ${frontZ.toFixed(3)} behind glass at ${t}ms`);
   // Once it has dropped below shelf level, its back must be in front of the shelf lips.
   if(p.y<slot[1]-.02)assert.ok(backZ>G.lip,`back ${backZ.toFixed(3)} clear of lip at ${t}ms`);
   // It never sinks into the ramp.
   assert.ok(p.y>=G.rampAt(p.z)-1e-6,`above the ramp at ${t}ms`);
   // It goes through the hatch only inside the opening.
   if(p.z+d/2>G.front-.05){assert.ok(p.door>1.5,'door open as it passes');assert.ok(p.y+h<G.hatch.top+.001,`under the hatch head at ${t}ms`);assert.ok(slot[0]-w/2>G.hatch.left&&slot[0]+w/2<G.hatch.right,'inside the hatch sides')}
  }
 });
}

test('the shelves, coils and motors all sit inside the cabinet',()=>{
 for(const [,[x,top]] of Object.entries(G.slots))for(const s of [-1,1]){
  const cx=x+s*G.coilX;assert.ok(cx-G.coilR>G.bayL+.06&&cx+G.coilR<G.bayR-.06,'coil clear of the walls');assert.ok(Math.abs(cx-G.fenceX)>G.coilR+.03,'coil clear of the fence');assert.ok(top+G.coilY+G.coilR<top+G.rest+.001,'coil tops carry the product')}
 assert.ok(G.lip<G.laneZ-G.maxD/2,'shelf stops short of the drop lane');assert.ok(G.laneZ+G.maxD/2<G.glass,'lane stops short of the glass');
});

test('the coils turn exactly as far as the product advances',()=>{
 const p=G.path(G.times.feed,G.slots.strata,1,sizes.strata),travel=G.lip-.04-(G.back+G.startZ);
 assert.ok(Math.abs(p.spin-travel/G.pitch*Math.PI*2)<1e-9);
});
