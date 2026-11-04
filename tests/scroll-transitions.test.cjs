const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../smooth-scroll.js'),'utf8');

// Exercise the scroll controller's input boundaries with a deterministic animation clock.
function setup({reduced=false,positions=[1200,2000],height=400,limit=5000}={}){
 let now=1000,nextTimer=0,observer;const timers=new Map(),listeners={},calls=[];
 const classes=new Set();const root={scrollHeight:limit+720,style:{},classList:{contains:x=>classes.has(x)}};
 class Element{hasAttribute(){return false}}
 const env={innerHeight:720,scrollY:0,HTMLElement:Element,performance:{now:()=>now},
  matchMedia:()=>({matches:reduced}),requestAnimationFrame:()=>{},
  setTimeout:(fn,delay)=>{timers.set(++nextTimer,{fn,at:now+delay});return nextTimer},clearTimeout:id=>timers.delete(id),
  addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn),
  MutationObserver:class{constructor(fn){observer=fn}observe(){}},
  document:{documentElement:root,getElementById:()=>null,querySelectorAll:()=>positions.map(top=>({offsetHeight:height,offsetParent:{},getBoundingClientRect:()=>({top:top-env.scrollY})}))}};
 class Lenis{
  constructor(options){this.options=options;this.targetScroll=0;this.animatedScroll=0;this.isStopped=false;this.resizeCount=0}
  scrollTo(to,options){calls.push({to,options});this.targetScroll=to;if(options.immediate){this.animatedScroll=to;env.scrollY=to}}
  resize(){this.resizeCount++}stop(){this.isStopped=true}start(){this.isStopped=false}
 }
 env.Lenis=Lenis;env.window=env;vm.runInNewContext(source,env);
 const emit=name=>(listeners[name]||[]).forEach(fn=>fn());
 const advance=ms=>{now+=ms;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.fn()}};
 const at=y=>{env.scrollY=y;env.lenis.targetScroll=y;env.lenis.animatedScroll=y};
 const wheel=(dy,path=[])=>{let blocked=false;const result=env.lenis.options.virtualScroll({deltaY:dy,event:{type:'wheel',ctrlKey:false,composedPath:()=>path,preventDefault:()=>blocked=true}});return{blocked,result}};
 const complete=call=>{at(call.to);emit('scroll');call.options.onComplete?.(env.lenis)};
 return{env,calls,at,wheel,advance,complete,emit,overlay:locked=>{root.style.overflow=locked?'hidden':'';observer()},last:()=>calls.at(-1)};
}

test('a wheel scroll always reaches the page, even at the edge of a transition',()=>{
 const h=setup();
 for(const y of [100,480,650,880]){h.at(y);const before=h.calls.length,r=h.wheel(40);
  assert.equal(r.result,true);assert.equal(r.blocked,false);assert.equal(h.calls.length,before)}
});
test('stopping inside a transition finishes it the way you were going, without locking input',()=>{
 const h=setup();h.at(480);h.emit('scroll');h.at(650);h.emit('scroll');h.advance(250);
 assert.equal(h.last().to,880);assert.equal(h.last().options.lock,undefined);
 h.complete(h.last());h.at(700);h.emit('scroll');h.advance(250);assert.equal(h.last().to,480);
});
test('nothing settles while you are still scrolling',()=>{
 const h=setup();h.at(600);h.emit('scroll');
 for(let i=0;i<6;i++){h.advance(100);h.wheel(20)}
 assert.equal(h.calls.length,0);
});
test('new input cancels a settle at once, and direction follows the new scroll',()=>{
 const h=setup();h.at(480);h.emit('scroll');h.at(650);h.emit('scroll');h.advance(250);assert.equal(h.last().to,880);
 assert.equal(h.wheel(-60).result,true);h.at(620);h.emit('scroll');h.advance(250);assert.equal(h.last().to,480);
});
test('direction comes from the input itself, before any scroll event arrives',()=>{
 const h=setup();h.at(700);h.wheel(-40);h.advance(250);assert.equal(h.last().to,480);
 h.complete(h.last());h.at(700);h.wheel(40);h.advance(250);assert.equal(h.last().to,880);
});
test('resting outside a transition never moves the page',()=>{
 const h=setup();h.at(100);h.emit('scroll');h.advance(1000);assert.equal(h.calls.length,0);
});
test('a route reset drops a pending settle',()=>{
 const h=setup();h.at(650);h.emit('scroll');h.env.resetPortfolioScroll(0);h.advance(1000);
 assert.equal(h.env.scrollY,0);assert.equal(h.env.lenis.resizeCount,1);assert.equal(h.last().to,0);
});
test('a link scroll does not block the wheel and is not settled mid-flight',()=>{
 const h=setup();h.env.smoothTo(800);const nav=h.last();h.at(650);h.emit('scroll');h.advance(1000);
 assert.equal(h.last(),nav);assert.equal(h.wheel(40).result,true);
});
test('overlay scrolling is left alone and reduced motion stays native',()=>{
 const h=setup();h.at(600);h.env.lenis.isStopped=true;assert.equal(h.wheel(200).result,true);h.advance(1000);assert.equal(h.calls.length,0);
 assert.equal(setup({reduced:true}).env.lenis,undefined);
});
test('closing an overlay mid-transition still settles it',()=>{
 const h=setup();h.at(480);h.emit('scroll');h.at(600);h.overlay(true);assert.equal(h.env.lenis.isStopped,true);
 h.overlay(false);h.advance(250);assert.equal(h.env.lenis.isStopped,false);assert.equal(h.last().to,880);
});
test('a transition near the document end settles to a reachable position',()=>{
 const h=setup({positions:[1600],height:600,limit:1000});h.at(800);h.emit('scroll');h.at(900);h.emit('scroll');h.advance(250);assert.equal(h.last().to,1000);
});
