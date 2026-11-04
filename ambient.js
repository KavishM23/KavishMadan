/* Henry Heffernan's radio tracks: see audio/henry-radio/LICENSE.txt.
   Playback starts after interaction and pauses for Spotify, muting, or a hidden tab. */
(function(){
 const KEY='km-ambient',VOLUME=.22;
 const tracks=['audio/henry-radio/1.mp3','audio/henry-radio/2.mp3','audio/henry-radio/3.mp3'];
 const store={get(){try{return localStorage.getItem(KEY)}catch(e){return null}},set(v){try{localStorage.setItem(KEY,v)}catch(e){}}};
 let player=null,index=0,spotify=false,muted=store.get()==='off',armed=false;
 window.siteMuted=muted;
 const btn=document.getElementById('ambBtn');
 function show(){if(!btn)return;btn.setAttribute('aria-pressed',String(!muted));btn.classList.toggle('muted',muted);btn.setAttribute('aria-label',muted?'Turn sound on':'Turn sound off')}
 function makePlayer(){
  if(player)return;
  player=new Audio();player.preload='none';player.volume=VOLUME;player.src=tracks[index];
  player.addEventListener('ended',()=>{index=(index+1)%tracks.length;player.src=tracks[index];sync()});
 }
 function sync(){
  if(!player)return;
  if(muted||spotify||document.hidden){player.pause();return}
  const result=player.play();if(result&&result.catch)result.catch(()=>arm());
 }
 function first(){removeEventListener('pointerdown',first);removeEventListener('keydown',first);armed=false;makePlayer();sync()}
 function arm(){if(armed||muted)return;armed=true;addEventListener('pointerdown',first);addEventListener('keydown',first)}
 btn?.addEventListener('click',()=>{muted=!muted;window.siteMuted=muted;store.set(muted?'off':'on');show();if(!muted)makePlayer();sync()});
 addEventListener('site-music',e=>{spotify=e.detail.on;sync()});
 document.addEventListener('visibilitychange',sync);
 show();if(!muted)arm();
 window.siteAmbient={VOLUME,state:()=>({started:!!player,running:!!player&&!player.paused,muted,spotify,track:index})};
})();
