/* Where things sit inside the project machine, and how a product moves through it.
   Plain numbers, no 3D library, so the path can be checked by the tests. */
(function(root){
 const G={
  machineX:1.15,fenceX:-.54,front:2.3,glass:2.24,back:-.62,lip:1.06,bayL:-2.04,bayR:.96,
  shelfTops:[3.9,2.34],gap:1.6,ceiling:5.5,binTop:2.02,
  rampHigh:.74,rampLow:.6,hatch:{left:-1.96,right:.9,top:1.9,bottom:.55},
  pitch:.34,coilR:.17,coilX:.34,coilY:.19,rest:.36,startZ:.92,
  laneZ:1.585,trayZ:2.84,maxW:1.3,maxD:.96,maxH:1.08,
  slots:{strata:[-1.27,3.9],drone:[.19,3.9],orbit:[-1.27,2.34],wing:[.19,2.34]},
  yaw:{strata:-.55,drone:.5,orbit:.2,wing:-.5}
 };
 G.rampAt=z=>G.rampHigh+(G.rampLow-G.rampHigh)*Math.min(1,Math.max(0,(z-G.lip)/(G.front-G.lip)));
 G.fit=s=>Math.min(G.maxW/s.w,G.maxD/s.d,G.maxH/s.h);
 const clamp=t=>Math.min(1,Math.max(0,t));
 G.ease=t=>{t=clamp(t);return t*t*(3-2*t)};
 const T={feed:1800,tip:460,fall:520,land:240,door:560,slide:640,lift:1250};
 G.times=T;G.total=T.feed+T.tip+T.fall+T.land+T.door+T.slide+T.lift;
 /* One product at time t (ms): position, tilt, coil angle, door angle, and how far it has lifted towards the viewer. */
 G.path=(t,slot,scale,size)=>{
  const top=slot[1],y0=top+G.rest,z0=G.back+G.startZ,zLip=G.lip-.04,drop=.2,tiltMax=.17,slope=Math.atan2(G.rampHigh-G.rampLow,G.front-G.lip);
  const a=T.feed,b=a+T.tip,c=b+T.fall,d=c+T.land,e=d+T.door,f=e+T.slide;
  const u0=clamp(t/T.feed),feed=u0*u0*u0*(u0*(6*u0-15)+10),z1=z0+(zLip-z0)*feed;
  const out={x:slot[0],y:y0,z:z1,tilt:0,spin:(z1-z0)/G.pitch*Math.PI*2,door:0,lift:0,end:null};
  const groundZ=G.laneZ,yLand=G.rampAt(groundZ);
  if(t>a){const u=clamp((t-a)/T.tip);out.z=zLip+(groundZ-zLip)*u;out.y=y0-drop*u*u;out.tilt=tiltMax*u*u}
  if(t>b){const u=clamp((t-b)/T.fall);out.z=groundZ;out.y=(y0-drop)+(yLand-(y0-drop))*u*u;out.tilt=tiltMax+(slope-tiltMax)*u}
  if(t>c){const u=clamp((t-c)/T.land);out.y=yLand;out.tilt=slope;out.door=.03*Math.sin(Math.PI*u)}
  if(t>d){const u=clamp((t-d)/T.door);out.door=(1-(1-u)*(1-u)*(1-u))*1.62}
  if(t>e){const u=G.ease((t-e)/T.slide);out.z=groundZ+(G.trayZ-groundZ)*u;out.y=G.rampAt(out.z);out.tilt=slope*(1-u);out.door=1.62}
  if(t>f){const u=G.ease((t-f)/T.lift);out.end={x:slot[0],y:G.rampLow,z:G.trayZ};out.lift=Math.max(.0001,u);out.tilt=0;out.door=1.62*(1-G.ease((t-f-250)/700))}
  return out;
 };
 /* The close-up, measured against the visible frame so it clears the text on any screen. */
 G.closeUp=(camera,size)=>{
  const wide=camera.aspect>=1.1,d=4.6,halfH=Math.tan(camera.fov*Math.PI/360)*d,halfW=halfH*camera.aspect;
  const span=Math.hypot(size.w,size.d);
  const maxFrac=wide?Math.min(.68,.5*camera.aspect):Math.min(.36,.8*camera.aspect);
  const scale=(halfH*2*maxFrac)/Math.max(span,size.h);
  const nx=wide?.34:0,ny=wide?.03:.4;
  return {x:nx*halfW,y:ny*halfH-size.h*scale*.5,d,scale};
 };
 root.projectMachineLayout=G;
 if(typeof module!=='undefined')module.exports=G;
})(typeof window!=='undefined'?window:globalThis);
