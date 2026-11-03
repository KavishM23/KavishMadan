/* Pointer behaviour stays local: no telemetry, network or per-frame layout reads. */
(()=>{
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const viewer=document.createElement('dialog');viewer.className='media-dialog';viewer.setAttribute('aria-label','Full-size image');viewer.innerHTML='<button class="media-close" type="button" aria-label="Close full-size image">Close ×</button><figure><img alt=""><figcaption></figcaption></figure>';document.body.append(viewer);
const viewerImage=viewer.querySelector('img'),viewerCaption=viewer.querySelector('figcaption');let imageReturn=null,previousOverflow='';
function openImage(image){if(!image?.src)return;imageReturn=document.activeElement;previousOverflow=document.documentElement.style.overflow;viewerImage.src=image.currentSrc||image.src;viewerImage.alt=image.alt;viewerCaption.textContent=image.alt;viewer.showModal();document.documentElement.style.overflow='hidden';viewer.querySelector('button').focus()}
viewer.querySelector('button').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;imageReturn?.focus({preventScroll:true})});
viewer.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation()});
viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
document.querySelectorAll('.print>img,.cs-frame>img').forEach(image=>{const button=document.createElement('button');button.type='button';button.className='photo-open';button.dataset.cur='media';button.setAttribute('aria-label',image.alt?'Enlarge '+image.alt:'Enlarge project screenshot');image.before(button);button.append(image);button.addEventListener('click',()=>openImage(image))});
document.querySelectorAll('.photo-wrap').forEach(frame=>{const image=frame.querySelector(':scope>img');if(!image)return;const button=document.createElement('button');button.type='button';button.className='photo-enlarge';button.dataset.cur='media';button.textContent='View photo ↗';button.setAttribute('aria-label','Enlarge '+image.alt);frame.append(button);button.addEventListener('click',()=>openImage(image))});
const panels=[...document.querySelectorAll('.reveal-panel,[data-image-reveal]')];
for(const panel of panels){
 const toggle=panel.querySelector('.reveal-toggle,.image-reveal-toggle');
 const secret=panel.querySelector('.reveal-secret,.image-secret');
 const image=panel.hasAttribute('data-image-reveal');
 const update=on=>{panel.classList.toggle('revealed',on);toggle.setAttribute('aria-expanded',String(on));toggle.textContent=image?(on?'See the build':'See the sketch'):(on?'Back to the surface':'Another side');secret.setAttribute('aria-hidden',String(!on));if(image){const caption=panel.closest('.peel.photo')?.querySelector('.photo-cap');if(caption)caption.textContent=on?'An early body sketch':'The finished car'}};
 toggle.addEventListener('click',()=>update(!panel.classList.contains('revealed')));
 panel.addEventListener('keydown',e=>{if(e.key==='Escape')update(false)});
 if(fine){
  let rect=null,x=0,y=0,tx=0,ty=0,r=0,targetR=0,last=0,raf=0;
  const draw=now=>{const dt=Math.min(.05,(now-last)/1000||.016);last=now;const k=reduced.matches?1:1-Math.exp(-19*dt);x+=(tx-x)*k;y+=(ty-y)*k;r+=(targetR-r)*k;panel.style.setProperty('--rx',x+'px');panel.style.setProperty('--ry',y+'px');panel.style.setProperty('--rr',r+'px');if(Math.abs(targetR-r)>.2||Math.abs(tx-x)>.2||Math.abs(ty-y)>.2)raf=requestAnimationFrame(draw);else raf=0};
  const start=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(draw)}};
  panel.addEventListener('pointerenter',e=>{rect=panel.getBoundingClientRect();x=tx=e.clientX-rect.left;y=ty=e.clientY-rect.top;targetR=reduced.matches?0:Math.min(155,rect.width*.28);start()});
  panel.addEventListener('pointermove',e=>{if(!rect||panel.classList.contains('revealed'))return;tx=e.clientX-rect.left;ty=e.clientY-rect.top;const speed=Math.min(.15,Math.abs(tx-x)/300);panel.style.setProperty('--lens-x',String(1+speed));panel.style.setProperty('--lens-y',String(1-speed*.5));start()});
  panel.addEventListener('pointerleave',()=>{targetR=0;rect=null;start()});
 }
}
document.querySelectorAll('.photo-wrap').forEach(el=>el.addEventListener('pointermove',e=>{if(!fine||reduced.matches)return;const r=el.getBoundingClientRect();el.style.setProperty('--look-x',(e.clientX-r.left)/r.width*100+'%');el.style.setProperty('--look-y',(e.clientY-r.top)/r.height*100+'%')},{passive:true}));
if(!fine)return;
/* Cursor: a cut-paper plane whose nose is the click point. It steers toward the way the mouse moves,
   leaves a dashed contrail, throws paper confetti on click and swaps to small tools over controls. */
const root=document.documentElement,c=document.createElement('div');c.className='cur';c.setAttribute('aria-hidden','true');
c.innerHTML='<span class="cur-body"><span class="cur-plane"><svg viewBox="0 0 34 30" aria-hidden="true"><path class="pl-top" d="M33 15L1 1L9 15.5Z"/><path class="pl-fold" d="M33 15L9 15.5L5 29Z"/><path class="pl-keel" d="M33 15L9 15.5L12 19.5Z"/></svg></span><svg class="cur-icon cur-hand" viewBox="0 0 26 29" aria-hidden="true"><path d="M9 14V4C9 1.3 13 1.3 13 4V10.5C13 8.7 16 8.7 16 10.5V11.5C16 9.9 19 10 19 11.7V13C19 11.7 22 11.9 22 13.8V18C22 22 19 24 19 26H10C9 23 6 21 4 18L2 15C.5 12.5 3.4 10.9 5 12.5L9 16"/></svg><svg class="cur-icon cur-rotate" viewBox="0 0 28 28" aria-hidden="true"><path d="M22 9A9 9 0 1 0 23 17M22 3V9H16"/></svg><svg class="cur-icon cur-magnify" viewBox="0 0 28 28" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16 16L24 24M8 11H14M11 8V14"/></svg></span><span class="cur-coordinates"></span>';
document.body.append(c);
const fx=document.createElement('canvas');fx.className='cur-fx';fx.setAttribute('aria-hidden','true');document.body.append(fx);const g=fx.getContext('2d');
const coordinates=c.querySelector('.cur-coordinates'),plane=c.querySelector('.cur-plane');
const REST=-135,COLORS=['#F1E6D2','#B5D2DE','#A54F36','#F2C14E'];
let mx=-100,my=-100,pmx=mx,pmy=my,last=performance.now(),shown=false,raf=0,target=null,targetRect=null,baseState='',modelLabel='',magnet=null;
let ang=REST,bank=0,idle=0,dpr=1,trail=[],bits=[];
function sizeFx(){dpr=Math.min(2,devicePixelRatio||1);fx.width=innerWidth*dpr;fx.height=innerHeight*dpr;g.setTransform(dpr,0,0,dpr,0,0)}
sizeFx();addEventListener('resize',sizeFx);
const hide=()=>{shown=false;c.classList.remove('on','pressed');root.classList.remove('cur-on');modelLabel='';trail=[];bits=[];g.clearRect(0,0,innerWidth,innerHeight);if(magnet){magnet.style.removeProperty('--mag-x');magnet.style.removeProperty('--mag-y');magnet=null}if(raf){cancelAnimationFrame(raf);raf=0}};
function applyState(){const next=modelLabel?'model':baseState;if(c.dataset.state!==next){c.dataset.state=next;c.classList.remove('pop');void c.offsetWidth;if(next)c.classList.add('pop')}}
window.portfolioCursor={setModelLabel(value){modelLabel=value;applyState()}};
const wrap=a=>((a+540)%360)-180;
function drawFx(dt,now){
 g.clearRect(0,0,innerWidth,innerHeight);
 for(let i=trail.length-1;i>=0;i--)if(now-trail[i].t>520)trail.splice(0,i+1),i=-1;
 if(trail.length>1){g.lineCap='round';g.setLineDash([5,6]);g.lineDashOffset=-now/28;
  for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i],life=1-(now-b.t)/520;g.strokeStyle=`rgba(241,230,210,${(life*.55).toFixed(3)})`;g.lineWidth=1+life*1.6;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
  g.setLineDash([])}
 for(let i=bits.length-1;i>=0;i--){const p=bits[i];p.life-=dt;if(p.life<=0){bits.splice(i,1);continue}
  p.vy+=900*dt;p.vx*=1-2.2*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;
  g.save();g.translate(p.x,p.y);g.rotate(p.r);g.scale(1,Math.cos(p.r*1.7));g.globalAlpha=Math.min(1,p.life*2.5);g.fillStyle=p.c;
  if(p.tri){g.beginPath();g.moveTo(-p.s,p.s*.7);g.lineTo(p.s,p.s*.7);g.lineTo(0,-p.s);g.fill()}else g.fillRect(-p.s,-p.s*.55,p.s*2,p.s*1.1);g.restore()}
 return trail.length>1||bits.length>0;
}
function frame(now){if(!shown){raf=0;return}const dt=Math.min(.05,(now-last)/1000||.016);last=now;
 if(magnet&&targetRect&&!reduced.matches){const cx=targetRect.left+targetRect.width/2,cy=targetRect.top+targetRect.height/2;magnet.style.setProperty('--mag-x',Math.max(-5,Math.min(5,(mx-cx)*.12))+'px');magnet.style.setProperty('--mag-y',Math.max(-5,Math.min(5,(my-cy)*.12))+'px')}
 c.style.transform=`translate3d(${mx}px,${my}px,0)`;
 const vx=mx-pmx,vy=my-pmy,sp=Math.hypot(vx,vy)/dt;pmx=mx;pmy=my;
 const flying=!c.dataset.state&&!reduced.matches;
 if(flying&&sp>260){idle=0;const want=Math.atan2(vy,vx)*180/Math.PI,turn=wrap(want-ang)*(1-Math.exp(-10*dt));ang+=turn;bank+=(Math.max(-1,Math.min(1,turn/9))-bank)*(1-Math.exp(-12*dt))}
 else{idle+=dt;if(idle>.35||!flying)ang+=wrap(REST-ang)*(1-Math.exp(-(flying?5:30)*dt));bank+=(0-bank)*(1-Math.exp(-8*dt))}
 plane.style.setProperty('--pa',ang.toFixed(2)+'deg');plane.style.setProperty('--pb',(1-Math.abs(bank)*.55).toFixed(3));
 if(flying&&sp>260){const r=ang*Math.PI/180;trail.push({x:mx-Math.cos(r)*26,y:my-Math.sin(r)*26,t:now});if(trail.length>40)trail.shift()}
 const busy=drawFx(dt,now);
 raf=(busy||sp>1||idle<.8||Math.abs(wrap(REST-ang))>.5)?requestAnimationFrame(frame):0}
const wake=()=>{if(!raf&&shown){last=performance.now();raf=requestAnimationFrame(frame)}};
addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;mx=e.clientX;my=e.clientY;
 if(e.target.closest('input,textarea,select,[contenteditable="true"]')){hide();return}
 if(!shown){shown=true;pmx=mx;pmy=my;c.classList.add('on');root.classList.add('cur-on')}
 wake();
 const next=e.target.closest('[data-cur],a,button,.photo-wrap,.cs-open');
 if(next!==target){if(magnet){magnet.style.removeProperty('--mag-x');magnet.style.removeProperty('--mag-y')}target=next;targetRect=target?.getBoundingClientRect();magnet=target?.matches('.top .circ,.top .pill')?target:null;
  baseState=target?(target.dataset.cur||(target.matches('.photo-wrap,.cs-open')?'media':'link')):'';
  applyState();
 }
 if(baseState==='inspect'&&targetRect)coordinates.textContent=`${Math.round((mx-targetRect.left)/targetRect.width*720)} / ${Math.round((my-targetRect.top)/targetRect.height*400)}`;
},{passive:true});
addEventListener('pointerdown',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;c.classList.add('pressed');
 if(!reduced.matches&&shown){for(let i=0;i<9;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=180+Math.random()*260;bits.push({x:mx,y:my,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:Math.random()*6,vr:(Math.random()-.5)*16,s:2.4+Math.random()*2.6,c:COLORS[i%COLORS.length],tri:i%3===0,life:.65+Math.random()*.4})}wake()}
},{passive:true});
addEventListener('pointerup',()=>c.classList.remove('pressed'),{passive:true});
addEventListener('pointercancel',()=>c.classList.remove('pressed'));root.addEventListener('mouseleave',hide);addEventListener('blur',hide);addEventListener('hashchange',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});addEventListener('scroll',()=>{target=null;targetRect=null;modelLabel='';baseState='';applyState()},{passive:true});
})();
