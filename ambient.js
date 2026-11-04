/* One shared switch for workshop sound effects. No background audio plays. */
(function(){
 const KEY='km-ambient';
 const store={get(){try{return localStorage.getItem(KEY)}catch(e){return null}},set(v){try{localStorage.setItem(KEY,v)}catch(e){}}};
 let muted=store.get()==='off';window.siteMuted=muted;
 const btn=document.getElementById('ambBtn');
 function show(){if(!btn)return;btn.setAttribute('aria-pressed',String(!muted));btn.classList.toggle('muted',muted);btn.setAttribute('aria-label',muted?'Turn sound effects on':'Turn sound effects off')}
 btn?.addEventListener('click',()=>{muted=!muted;window.siteMuted=muted;store.set(muted?'off':'on');show()});
 show();
})();
