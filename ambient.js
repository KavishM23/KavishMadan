/* The room tone: slow chords, a few far-off notes and a faint hum, all made here in the browser.
   Browsers only allow sound after a visitor does something, so it fades in from their first click or key press.
   It steps aside for the Spotify player, rests while the tab is hidden, and the speaker button silences the site. */
(function(){
 const VOLUME=.3,KEY='km-ambient';
 const midi=n=>440*Math.pow(2,(n-69)/12);
 // a calm walk around D: nothing resolves too hard, so it can loop forever without being noticed
 const CHORDS=[[38,45,50,54,57,64],[35,42,47,50,57,61],[43,50,55,59,66,69],[33,40,45,49,52,59]];
 const BELLS=[74,78,81,83,86,88];
 const BAR=15;

 function reverb(ctx){
  const len=Math.round(ctx.sampleRate*3.2),buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const t=i/len;lp+=(Math.random()*2-1-lp)*(.5-.42*t);d[i]=lp*Math.pow(1-t,3.2)}}
  const v=ctx.createConvolver();v.buffer=buf;return v;
 }
 function hum(ctx,out){
  const len=ctx.sampleRate*5,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let b=0;
  for(let i=0;i<len;i++){b=(b+.02*(Math.random()*2-1))/1.02;d[i]=b*3.5}
  // cross-fade the seam so the loop has no click
  const fade=ctx.sampleRate;for(let i=0;i<fade;i++){const k=i/fade;d[i]=d[i]*k+d[len-fade+i]*(1-k)}
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=buf;s.loop=true;s.loopEnd=(len-fade)/ctx.sampleRate;f.type='lowpass';f.frequency.value=280;g.gain.value=.05;s.connect(f).connect(g).connect(out);s.start();
  return s;
 }
 /* one chord: every voice swells in slowly and lets go slowly, overlapping the next */
 function chord(ctx,dest,notes,t){
  const end=t+BAR*1.5;
  notes.forEach((n,i)=>{
   const g=ctx.createGain(),level=(i<2?.1:.062);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level,t+6+i*.5);g.gain.setValueAtTime(level,end-8);g.gain.linearRampToValueAtTime(0,end);g.connect(dest);
   const a=ctx.createOscillator();a.type='sine';a.frequency.value=midi(n);a.detune.value=(i%2?-1:1)*2;a.connect(g);a.start(t);a.stop(end);
   if(i>1){const b=ctx.createOscillator(),bg=ctx.createGain();b.type='triangle';b.frequency.value=midi(n);b.detune.value=(i%2?1:-1)*5;bg.gain.value=.3;b.connect(bg).connect(g);b.start(t);b.stop(end)}
  });
 }
 function bell(ctx,dest,n,t,pan){
  const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();o.frequency.value=midi(n);p.pan.value=pan;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+4);o.connect(g).connect(p).connect(dest);o.start(t);o.stop(t+4.1);
 }
 /* everything before the volume control, written so the same code can also be rendered offline and measured */
 function graph(ctx,out){
  const bus=ctx.createGain(),tone=ctx.createBiquadFilter(),wet=ctx.createGain(),rev=reverb(ctx);
  tone.type='lowpass';tone.frequency.value=720;tone.Q.value=.3;wet.gain.value=.7;
  const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.05;depth.gain.value=220;lfo.connect(depth).connect(tone.frequency);lfo.start();
  bus.connect(tone);tone.connect(out);tone.connect(rev);rev.connect(wet).connect(out);
  const bellBus=ctx.createGain();bellBus.gain.value=.8;bellBus.connect(rev);bellBus.connect(out);
  hum(ctx,out);
  let bar=0;
  const write=(from,to)=>{ // schedule the music between two times
   let t=from;
   while(t<to){
    chord(ctx,bus,CHORDS[bar%CHORDS.length],t);
    let b=t+2+Math.random()*4;while(b<t+BAR){bell(ctx,bellBus,BELLS[Math.floor(Math.random()*BELLS.length)],b,Math.random()*1.2-.6);b+=5+Math.random()*7}
    bar++;t+=BAR;
   }
   return t;
  };
  return {write};
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
