/* Smooth, eased scrolling (Lenis, as on the reference site) with committed transitions.
   Each transition (a paper tear, a cabinet move, a staircase move) is a gate: the page glides up to its edge and holds.
   Scrolling on past the edge only nudges it, until you have scrolled far enough to mean it; then the whole transition
   plays as one eased move. Let go early and it settles back. */
(function(){
 if(!window.Lenis||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=document.documentElement;
 const COMMIT=120,NUDGE=26,GAP=220;   // px of scrolling to commit, max give at the edge, ms of quiet that ends a gesture
 let lenis;

 // scroll ranges that only ever play as a whole
 function zones(){
  const vh=innerHeight,z=[],top=el=>el.getBoundingClientRect().top+scrollY;
  document.querySelectorAll('.view:not([hidden]) .torn').forEach(t=>{const h=t.offsetHeight;if(h>0&&t.offsetParent)z.push([top(t)-vh,top(t)-vh+h])});
  const cab=document.getElementById('cabinet');
  if(root.classList.contains('cabinet-ready')&&cab&&cab.offsetParent){const T=top(cab),D=cab.offsetHeight-vh,N=cab.querySelectorAll('.cab-dots button').length;
   for(let i=0;i<N-1;i++)z.push([T+D*(i+.38)/(N-1),T+D*(i+1)/(N-1)])}
  const cj=document.getElementById('code-journey');
  if(root.classList.contains('spiral-ready')&&cj&&cj.offsetParent){const T=top(cj),D=cj.offsetHeight-vh;[[.02,.15],[.36,.54],[.76,.995]].forEach(([a,b])=>z.push([T+D*a,T+D*b]))}
  return z.map(([a,b])=>[Math.round(Math.max(0,a)),Math.round(b)]).filter(([a,b])=>b-a>40).sort((p,q)=>p[0]-q[0]);
 }
 let zcache=null,zstamp=0;
 const getZones=()=>{const now=performance.now();if(!zcache||now-zstamp>500){zcache=zones();zstamp=now}return zcache};

 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 let gate=null,acc=0,lastWheel=0,spent=false,playing=false,releaseT=0;
 function play(target){
  playing=true;gate=null;acc=0;clearTimeout(releaseT);
  const dist=Math.abs(target-lenis.animatedScroll);
  lenis.scrollTo(target,{duration:Math.min(1.35,.7+dist/1100),easing:ease,lock:true,force:true,onComplete:()=>{playing=false;spent=true;zcache=null}});
 }
 function hold(edge,dir){
  // the edge gives a little as you push, so it feels like resistance, not a wall
  lenis.scrollTo(edge+dir*Math.min(NUDGE,acc*.12),{lerp:.18,force:true});
  clearTimeout(releaseT);releaseT=setTimeout(()=>{if(gate&&!playing){lenis.scrollTo(gate.edge,{duration:.45,easing:ease,force:true});gate=null;acc=0}},GAP+60);
 }
 function onVirtual({deltaY,event}){
  if(!event||!event.type.includes('wheel')||event.ctrlKey)return true;   // touch and pinch-zoom stay native
  if(lenis.isStopped||event.composedPath().some(n=>n instanceof HTMLElement&&n.hasAttribute('data-lenis-prevent')))return true;
  const block=()=>{event.preventDefault();return false};
  const now=performance.now(),fresh=now-lastWheel>GAP;lastWheel=now;
  if(playing)return block();
  if(fresh)spent=false;
  const dir=Math.sign(deltaY);if(!dir)return true;
  const y=lenis.targetScroll,next=y+deltaY;
  if(gate&&gate.dir!==dir){lenis.scrollTo(gate.edge,{duration:.35,easing:ease,force:true});gate=null;acc=0;return block()}
  if(gate){if(spent)return block();acc+=Math.abs(deltaY);if(acc>=COMMIT)play(gate.to);else hold(gate.edge,dir);return block()}
  for(const [a,b] of getZones()){
   const inside=y>a+2&&y<b-2;
   if(inside){play(dir>0?b:a);return block()}                        // already mid-transition: finish it the way you're going
   if(dir>0&&y<=a+2&&next>a){gate={edge:a,to:b,dir};acc=spent?0:next-a;lenis.scrollTo(a,{force:true});if(!spent&&acc>=COMMIT)play(b);return block()}
   if(dir<0&&y>=b-2&&next<b){gate={edge:b,to:a,dir};acc=spent?0:b-next;lenis.scrollTo(b,{force:true});if(!spent&&acc>=COMMIT)play(a);return block()}
  }
  return true;
 }

 lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,virtualScroll:onVirtual});
 window.lenis=lenis;
 if(window.gsap){gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);if(window.ScrollTrigger)lenis.on('scroll',ScrollTrigger.update)}
 else{const f=t=>{lenis.raf(t);requestAnimationFrame(f)};requestAnimationFrame(f)}
 addEventListener('resize',()=>{zcache=null});

 // overlays lock the page by setting overflow:hidden on <html>; pause smoothing while they are open
 new MutationObserver(()=>{root.style.overflow==='hidden'?lenis.stop():lenis.start()}).observe(root,{attributes:true,attributeFilter:['style']});
 window.smoothTo=(target,opts={})=>{gate=null;acc=0;return lenis.scrollTo(target,{duration:1.1,easing:t=>1-Math.pow(1-t,3),force:true,...opts})};

 // touch, keys and the scrollbar scroll natively; if they leave the page mid-transition, finish it once they stop
 let dirN=1,lastY=scrollY,idle=0;
 function settle(){
  if(playing||gate||lenis.isStopped||root.classList.contains('intro'))return;
  const y=scrollY;zcache=null;
  for(const [a,b] of getZones()){const pad=Math.max(6,(b-a)*.04);if(y>a+pad&&y<b-pad){play(dirN>0?b:a);return}}
 }
 addEventListener('scroll',()=>{const y=scrollY;if(!playing&&!gate&&y!==lastY)dirN=y>lastY?1:-1;lastY=y;clearTimeout(idle);idle=setTimeout(settle,200)},{passive:true});
})();
