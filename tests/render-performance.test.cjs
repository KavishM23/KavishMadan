const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../render-performance.js'),'utf8'),scope);
const {createLoop,createQuality,modelNeedsFrame,createFrameGate}=scope.window.PortfolioRender;
function clock(){
 let id=0,time=0;const frames=new Map(),timers=new Map(),draws=[];
 const options={raf:fn=>{frames.set(++id,fn);return id},caf:key=>frames.delete(key),timer:(fn,delay)=>{timers.set(++id,{fn,at:time+delay});return id},clearTimer:key=>timers.delete(key),now:()=>time};
 const loop=createLoop(t=>draws.push(t),options);
 return{loop,frames,timers,draws,frame(){time+=16.67;const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(time))},advance(ms){time+=ms;for(const [key,t]of [...timers])if(t.at<=time){timers.delete(key);t.fn()}}};
}
test('repeated visibility events start exactly one animation chain',()=>{
 const c=clock();c.loop.start();c.loop.start();assert.equal(c.frames.size,1);c.frame();assert.equal(c.draws.length,1);assert.equal(c.frames.size,1);
});
test('stopping cancels pending work and prevents offscreen rendering',()=>{
 const c=clock();c.loop.start();c.loop.stop();assert.equal(c.frames.size,0);assert.equal(c.timers.size,0);c.frame();c.advance(600);assert.equal(c.draws.length,0);
});
test('an old queued frame cannot restart or duplicate a new loop',()=>{
 const c=clock();c.loop.start();const stale=[...c.frames.values()][0];c.loop.stop();c.loop.start();stale(20);assert.equal(c.draws.length,0);assert.equal(c.frames.size,1);c.loop.stop();assert.equal(c.frames.size,0);
});
test('fallback cancels the delayed RAF before switching to a timer',()=>{
 const c=clock();c.loop.start();const stale=[...c.frames.values()][0];c.advance(501);assert.equal(c.frames.size,0);stale(510); // native RAF is cancelled, but simulate a callback already dispatched
 c.advance(17);assert.equal(c.draws.length,1);assert.equal(c.timers.size,1);c.loop.stop();assert.equal(c.timers.size,0);
});
test('a normal first frame clears the fallback watchdog',()=>{
 const c=clock();c.loop.start();c.frame();assert.equal(c.timers.size,0);c.advance(1000);assert.equal(c.draws.length,1);
});
test('steady 60 Hz rendering retains full authored density',()=>{
 const q=createQuality(2);for(let i=0;i<900;i++)q.sample(16.67,i*16.67);assert.equal(q.density,2);
});
test('a sustained slow device gets a smaller framebuffer without dropping below native 1x',()=>{
 const q=createQuality(2);for(let i=0;i<1200;i++)q.sample(33.33,i*33.33);assert.equal(q.density,1);
});
test('startup and a single compilation stall do not lower image quality',()=>{
 const q=createQuality(2);for(let i=0;i<50;i++)q.sample(80,i*20);for(let i=0;i<200;i++)q.sample(i===100?100:16.67,2000+i*16.67);assert.equal(q.density,2);
});
test('sustained recovery restores density gradually, within its viewport ceiling',()=>{
 const q=createQuality(1.7);let now=0;for(let i=0;i<600;i++)q.sample(33.33,now+=33.33);assert.equal(q.density,1);for(let i=0;i<2000;i++)q.sample(16.67,now+=16.67);assert.equal(q.density,1.7);
});
test('stationary hover rests while moving and animated models keep updating',()=>{
 const state={before:1,after:1,goal:1,animated:false,elapsed:3,duration:1,running:false};
 assert.equal(modelNeedsFrame(state),false);
 assert.equal(modelNeedsFrame({...state,animated:true}),true);
 assert.equal(modelNeedsFrame({...state,before:.8}),true);
 assert.equal(modelNeedsFrame({...state,goal:0,after:0,before:0,elapsed:.5}),true);
 assert.equal(modelNeedsFrame({...state,goal:0,after:0,before:0,running:true}),true);
});
test('reflection updates are rate-limited but final frames and resets refresh them',()=>{
 const gate=createFrameGate(42);
 assert.equal(gate.due(0),true);assert.equal(gate.due(16),false);assert.equal(gate.due(42),true);
 assert.equal(gate.due(43,true),true);assert.equal(gate.due(44),false);
 gate.reset();assert.equal(gate.due(45),true);
});
