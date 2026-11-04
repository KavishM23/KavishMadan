/* A quiet workshop atmosphere, generated locally in the browser.
   It starts after a visitor interacts, yields to Spotify, and follows the sound switch. */
(function(){
 const VOLUME=.22,KEY='km-ambient',BAR=15;
 function graph(ctx,out){
  // A long, softly filtered noise loop suggests air circulating through the room.
  const length=ctx.sampleRate*12,fade=ctx.sampleRate*2;
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
  let low=0;
  for(let i=0;i<length;i++){low+=(Math.random()*2-1-low)*.025;data[i]=low*.65}
  for(let i=0;i<fade;i++){const t=i/fade;data[i]=data[i]*t+data[length-fade+i]*(1-t)}
  const air=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),airLevel=ctx.createGain();
  air.buffer=buffer;air.loop=true;air.loopEnd=(length-fade)/ctx.sampleRate;
  filter.type='lowpass';filter.frequency.value=520;airLevel.gain.value=.26;
  air.connect(filter).connect(airLevel).connect(out);air.start();
  // A very soft electrical hum sits underneath the air; no melody or repeated notes.
  const hum=ctx.createOscillator(),humLevel=ctx.createGain();hum.type='sine';hum.frequency.value=60;humLevel.gain.value=.022;hum.connect(humLevel).connect(out);hum.start();
  const overtone=ctx.createOscillator(),overtoneLevel=ctx.createGain();overtone.type='sine';overtone.frequency.value=120;overtoneLevel.gain.value=.006;overtone.connect(overtoneLevel).connect(out);overtone.start();
  return {write:(from,to)=>to};
 }
 const R=window,store={get(){try{return localStorage.getItem(KEY)}catch(e){return null}},set(v){try{localStorage.setItem(KEY,v)}catch(e){}}};
 let ctx=null,master=null,ahead=0,timer=0,armed=false,spotify=false,muted=store.get()==='off';
 R.siteMuted=muted;
 const btn=document.getElementById('ambBtn');
 function target(){return muted||spotify?0:VOLUME}
 function level(sec){if(!master)return;const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(target(),t+sec)}
 function pump(){if(ctx&&ctx.state==='running'&&ahead-ctx.currentTime<BAR*1.2)ahead=score.write(ahead,ahead+BAR)}
 let score=null;
 function begin(){
  if(ctx||muted)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{ctx=new AC({latencyHint:'playback'})}catch(e){return}
  master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  score=graph(ctx,master);ahead=ctx.currentTime+.1;ahead=score.write(ahead,ahead+BAR);
  ctx.resume?.();level(5);timer=setInterval(pump,4000);
 }
 function first(){removeEventListener('pointerdown',first);removeEventListener('keydown',first);armed=false;begin()}
 function arm(){if(armed||ctx)return;armed=true;addEventListener('pointerdown',first);addEventListener('keydown',first)}
 function show(){if(!btn)return;btn.setAttribute('aria-pressed',String(!muted));btn.classList.toggle('muted',muted);btn.setAttribute('aria-label',muted?'Turn sound on':'Turn sound off')}
 btn?.addEventListener('click',()=>{muted=!muted;R.siteMuted=muted;store.set(muted?'off':'on');show();if(muted){level(.6)}else if(ctx){ctx.resume?.();level(2.5)}else begin()});
 addEventListener('site-music',e=>{spotify=e.detail.on;level(spotify?1.2:4)});
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;document.hidden?ctx.suspend?.():ctx.resume?.()});
 show();if(!muted)arm();
 R.siteAmbient={graph,VOLUME,BAR,state:()=>({started:!!ctx,running:ctx?.state,gain:master?.gain.value,muted,spotify})};
})();
