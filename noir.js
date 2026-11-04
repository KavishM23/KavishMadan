/* Big statements fill word by word as they scroll up the screen, dim to full. */
(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.querySelectorAll('[data-fill]').forEach(el=>{
  const wrap=node=>{for(const n of [...node.childNodes]){
   if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.append(w);return}const s=document.createElement('span');s.className='fw';s.textContent=w;f.append(s)});n.replaceWith(f)}
   else if(n.nodeType===1)wrap(n)}};
  wrap(el);
  const words=[...el.querySelectorAll('.fw')];
  // measured live, so it stays right however the page got here (hidden views, route changes, resizes)
  const update=()=>{const r=el.getBoundingClientRect();if(!r.height)return;const vh=innerHeight,p=Math.min(1,Math.max(0,(vh*.88-r.top)/(vh*.46))),lit=Math.round(p*words.length);words.forEach((w,i)=>w.classList.toggle('on',i<lit))};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);addEventListener('hashchange',()=>setTimeout(update,120));update();
 });
})();
