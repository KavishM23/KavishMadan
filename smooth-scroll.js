/* Smooth, eased scrolling (Lenis, as on the reference site), plus a commit rule: if you stop partway through a
   transition (a paper tear, a cabinet move or a staircase move) it finishes in the direction you were going. */
(function(){
 if(!window.Lenis||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=document.documentElement;
 const lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false});
 window.lenis=lenis;
 if(window.gsap){gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);if(window.ScrollTrigger)lenis.on('scroll',ScrollTrigger.update)}
 else{const f=t=>{lenis.raf(t);requestAnimationFrame(f)};requestAnimationFrame(f)}

 // overlays lock the page by setting overflow:hidden on <html>; pause smoothing while they are open
 new MutationObserver(()=>{root.style.overflow==='hidden'?lenis.stop():lenis.start()}).observe(root,{attributes:true,attributeFilter:['style']});

 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 window.smoothTo=(target,opts={})=>lenis.scrollTo(target,{duration:1.1,easing:t=>1-Math.pow(1-t,3),...opts});

 // scroll ranges you are not allowed to rest inside
 function zones(){
  const vh=innerHeight,z=[],top=el=>el.getBoundingClientRect().top+scrollY;
  document.querySelectorAll('.view:not([hidden]) .torn').forEach(t=>{const h=t.offsetHeight;if(h>0&&t.offsetParent)z.push([top(t)-vh,top(t)-vh+h])});
  const cab=document.getElementById('cabinet');
  if(root.classList.contains('cabinet-ready')&&cab&&cab.offsetParent){const T=top(cab),D=cab.offsetHeight-vh,N=cab.querySelectorAll('.cab-dots button').length;
   for(let i=0;i<N-1;i++)z.push([T+D*(i+.38)/(N-1),T+D*(i+1)/(N-1)])}
  const cj=document.getElementById('code-journey');
  if(root.classList.contains('spiral-ready')&&cj&&cj.offsetParent){const T=top(cj),D=cj.offsetHeight-vh;[[.02,.15],[.36,.54],[.76,.995]].forEach(([a,b])=>z.push([T+D*a,T+D*b]))}
  return z.sort((a,b)=>a[0]-b[0]);
 }
 let dir=1,last=scrollY,idle=0,snapping=false;
 function check(){
  if(snapping||lenis.isStopped||root.classList.contains('intro'))return;
  const y=scrollY;
  for(const [a,b] of zones()){const pad=(b-a)*.06;
   if(y>a+pad&&y<b-pad){const target=dir>0?b:a;snapping=true;
    lenis.scrollTo(target,{duration:Math.min(1.15,.5+Math.abs(target-y)/1000),easing:ease,onComplete:()=>{snapping=false;last=scrollY}});
    setTimeout(()=>{snapping=false},1500);return}}
 }
 addEventListener('scroll',()=>{const y=scrollY;if(!snapping&&y!==last)dir=y>last?1:-1;last=y;clearTimeout(idle);idle=setTimeout(check,180)},{passive:true});
})();
