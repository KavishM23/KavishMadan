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

test('small swipes stay at a finished tear; a firm swipe completes it',()=>{
 const h=setup();h.at(470);h.wheel(40);
 assert.equal(h.last().to,480);assert.equal(h.last().options.lock,undefined);
 h.wheel(40);assert.equal(h.last().to,480);
 h.wheel(120);assert.equal(h.last().to,880);assert.equal(h.last().options.lock,true);
 h.complete(h.last());assert.equal(h.env.scrollY,880);
});
test('a partial gesture expires instead of accumulating across separate swipes',()=>{
 const h=setup();h.at(480);h.wheel(100);h.advance(400);h.wheel(100);
 assert.equal(h.last().to,480);assert.equal(h.last().options.lock,undefined);
});
test('reversing at a gate releases it without tearing halfway',()=>{
 const h=setup();h.at(470);h.wheel(40);h.wheel(-50);
 assert.equal(h.last().to,480);assert.equal(h.last().options.lock,undefined);
 assert.equal(h.wheel(-50).result,true);
});
test('one gesture cannot spill into the next transition',()=>{
 const h=setup();h.at(480);h.wheel(200);h.complete(h.last());
 h.wheel(700);assert.equal(h.last().to,1280);assert.equal(h.last().options.lock,undefined);
 h.wheel(400);assert.equal(h.last().to,1280);
 h.advance(300);h.wheel(200);assert.equal(h.last().to,1680);assert.equal(h.last().options.lock,true);
});
test('native scrolling settles a half tear in either direction',()=>{
 const h=setup();h.at(650);h.emit('scroll');h.advance(210);assert.equal(h.last().to,880);
 h.complete(h.last());h.at(700);h.emit('scroll');h.advance(210);assert.equal(h.last().to,480);
});
test('route resets discard an old gate and stale completion callbacks',()=>{
 const h=setup();h.at(480);h.wheel(200);const previous=h.last();
 h.env.resetPortfolioScroll(0);assert.equal(h.env.scrollY,0);assert.equal(h.env.lenis.resizeCount,1);
 previous.options.onComplete();h.at(480);h.wheel(200);assert.equal(h.last().options.lock,true);
});
test('navigation owns its animation until completion, then wheel gates resume',()=>{
 const h=setup();h.env.smoothTo(800);const navigation=h.last();
 assert.equal(h.wheel(40).blocked,true);assert.equal(h.last(),navigation);
 h.complete(navigation);h.wheel(40);assert.equal(h.last().to,880);
});
test('overlay scrolling is left to the overlay and reduced motion stays native',()=>{
 const h=setup();h.at(480);h.env.lenis.isStopped=true;assert.equal(h.wheel(200).result,true);
 assert.equal(setup({reduced:true}).env.lenis,undefined);
});
test('opening an overlay during a transition does not leave scrolling locked after closing',()=>{
 const h=setup();h.at(480);h.wheel(200);h.at(600);h.overlay(true);
 assert.equal(h.env.lenis.isStopped,true);h.overlay(false);h.advance(210);
 assert.equal(h.env.lenis.isStopped,false);assert.equal(h.last().to,880);
});
test('a navigation to the current position does not block the next scroll',()=>{
 const h=setup();h.env.smoothTo(0);assert.equal(h.wheel(40).result,true);
});
test('a transition near the document end clamps to a reachable finished position',()=>{
 const h=setup({positions:[1600],height:600,limit:1000});h.at(880);h.wheel(200);assert.equal(h.last().to,1000);
});
