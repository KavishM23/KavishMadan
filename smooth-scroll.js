/* Smooth, eased scrolling (Lenis, as on the reference site). Scrolling always moves the page straight away.
   Transitions (a paper tear, a cabinet move, a staircase move) are never left half-done: once you stop inside one,
   it eases on in the direction you were going. Any new input cancels that immediately; input is never held or blocked. */
(function(){
 if(!window.Lenis||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=document.documentElement;
 const WAIT=240;   // ms of quiet before a stopped transition settles
 let lenis;

 // scroll ranges the page should not come to rest inside
 function zones(){
  const vh=innerHeight,z=[],top=el=>el.getBoundingClientRect().top+scrollY;
  document.querySelectorAll('.view:not([hidden]) .torn').forEach(t=>{const h=t.offsetHeight;if(h>0&&t.offsetParent)z.push([top(t)-vh,top(t)-vh+h])});
  const cab=document.getElementById('cabinet');
  if(root.classList.contains('cabinet-ready')&&cab&&cab.offsetParent){const T=top(cab),D=cab.offsetHeight-vh,N=cab.querySelectorAll('.cab-dots button').length;
   for(let i=0;i<N-1;i++)z.push([T+D*(i+.38)/(N-1),T+D*(i+1)/(N-1)])}
  const cj=document.getElementById('code-journey');
  if(root.classList.contains('spiral-ready')&&cj&&cj.offsetParent){const T=top(cj),D=cj.offsetHeight-vh;[[.02,.11],[.24,.38],[.51,.65],[.78,.995]].forEach(([a,b])=>z.push([T+D*a,T+D*b]))}
  const limit=Math.max(0,root.scrollHeight-vh);
  return z.map(([a,b])=>[Math.round(Math.max(0,Math.min(limit,a))),Math.round(Math.max(0,Math.min(limit,b)))]).filter(([a,b])=>b-a>40).sort((p,q)=>p[0]-q[0]);
 }
 let zcache=null,zstamp=0;
 const getZones=()=>{const now=performance.now();if(!zcache||now-zstamp>500){zcache=zones();zstamp=now}return zcache};

 const ease=t=>1-Math.pow(1-t,3);
 let settling=false,idle=0,dir=1,lastY=scrollY;
 // Input always wins: it moves the page at once, cancels any settle and starts the wait again.
 function onInput({deltaY}){if(deltaY)dir=Math.sign(deltaY);settling=false;clearTimeout(idle);idle=setTimeout(settle,WAIT);return true}
 function settle(){
  if(settling||lenis.isStopped||lenis.isTouching||root.classList.contains('intro'))return;
  const y=scrollY;zcache=null;
  for(const [a,b] of getZones()){const pad=Math.max(6,(b-a)*.04);
   if(y>a+pad&&y<b-pad){const target=dir>0?b:a;settling=true;
    lenis.scrollTo(target,{duration:Math.min(.9,.35+Math.abs(target-y)/1200),easing:ease,onComplete:()=>{settling=false;zcache=null}});return}}
 }

 lenis=new Lenis({lerp:.11,smoothWheel:true,syncTouch:false,virtualScroll:onInput});
 window.lenis=lenis;
 if(window.gsap){gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);if(window.ScrollTrigger)lenis.on('scroll',ScrollTrigger.update)}
 else{const f=t=>{lenis.raf(t);requestAnimationFrame(f)};requestAnimationFrame(f)}
 addEventListener('resize',()=>{zcache=null});

 // overlays lock the page by setting overflow:hidden on <html>; pause smoothing while they are open
 let overlayLocked=root.style.overflow==='hidden';
 new MutationObserver(()=>{
  const locked=root.style.overflow==='hidden';if(locked===overlayLocked)return;overlayLocked=locked;reset();
  if(locked)lenis.stop();else{lenis.start();idle=setTimeout(settle,WAIT)}
 }).observe(root,{attributes:true,attributeFilter:['style']});
 function reset(){settling=false;zcache=null;clearTimeout(idle)}
 window.resetPortfolioScroll=y=>{reset();lenis.resize();lenis.scrollTo(y,{immediate:true,force:true})};
 window.smoothTo=(target,opts={})=>{
  reset();settling=true;
  return lenis.scrollTo(target,{duration:1.1,easing:ease,force:true,...opts,onComplete:l=>{settling=false;zcache=null;opts.onComplete?.(l)}});
 };

 // Touch, keys and the scrollbar scroll natively; the same settle applies once they stop.
 addEventListener('scroll',()=>{const y=scrollY;if(!settling&&y!==lastY)dir=y>lastY?1:-1;lastY=y;if(!settling){clearTimeout(idle);idle=setTimeout(settle,WAIT)}},{passive:true});
})();
