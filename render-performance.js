/* Shared rendering optimizations. The geometry and artwork stay at their authored detail. */
window.PortfolioRender={
 // Keep animating while a hover is settling, a click is playing, or the
 // hovered model has a continuous animation of its own.
 modelNeedsFrame({before,after,goal,animated,elapsed,duration,running}){
  return before!==after||((goal>0||after>0)&&animated)||elapsed<duration||running===true;
 },
 createFrameGate(interval){
  let last=-Infinity;
  return{due(now,force=false){if(!force&&now-last<interval)return false;last=now;return true},reset(){last=-Infinity}};
 },
 batchStatic(root,THREE,merge){
  const parents=[];root.traverse(o=>{if(o.isGroup)parents.push(o)});
  for(const parent of parents){
   const groups=new Map();
   for(const mesh of parent.children){
    if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible||mesh.children.length||Array.isArray(mesh.material)||mesh.material.transparent||mesh.userData.keepSeparate||Object.keys(mesh.geometry.morphAttributes).length||mesh.geometry.drawRange.count!==Infinity)continue;
    mesh.updateMatrix();if(mesh.matrix.determinant()<0)continue;
    const attributes=Object.keys(mesh.geometry.attributes).sort().map(k=>{const a=mesh.geometry.attributes[k];return k+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name}).join(',');
    const key=[mesh.material.uuid,mesh.castShadow,mesh.receiveShadow,mesh.renderOrder,mesh.layers.mask,attributes].join('|');
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
   }
   for(const meshes of groups.values()){
    if(meshes.length<2)continue;
    const parts=meshes.map(mesh=>{mesh.updateMatrix();const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();return geometry.applyMatrix4(mesh.matrix)});
    const geometry=merge(parts,false);parts.forEach(p=>p.dispose());if(!geometry)continue;
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const first=meshes[0],batch=new THREE.Mesh(geometry,first.material);batch.name='Static details';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.renderOrder=first.renderOrder;batch.layers.mask=first.layers.mask;
    meshes.forEach(mesh=>parent.remove(mesh));parent.add(batch);
   }
  }
  return root;
 },
 localBounds(root,THREE){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),matrix=new THREE.Matrix4(),box=new THREE.Box3(),part=new THREE.Box3();
  root.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.isInstancedMesh){mesh.computeBoundingBox();part.copy(mesh.boundingBox)}else{if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();part.copy(mesh.geometry.boundingBox)}matrix.multiplyMatrices(inverse,mesh.matrixWorld);box.union(part.applyMatrix4(matrix))});
  return box;
 },
 createLoop(draw,{raf=requestAnimationFrame,caf=cancelAnimationFrame,timer=setTimeout,clearTimer=clearTimeout,now=()=>performance.now()}={}){
  let running=false,handle=0,watchdog=0,generation=0,useTimer=false;
  function schedule(ticket){
   if(!running||ticket!==generation)return;
   const callback=time=>{if(!running||ticket!==generation)return;handle=0;if(watchdog){clearTimer(watchdog);watchdog=0}draw(time);schedule(ticket)};
   handle=useTimer?timer(()=>callback(now()),16):raf(callback);
  }
  return{
   start(){if(running)return;running=true;const ticket=++generation;schedule(ticket);
    if(!useTimer)watchdog=timer(()=>{watchdog=0;if(!running||ticket!==generation)return;caf(handle);handle=0;useTimer=true;schedule(++generation)},500)},
   stop(){running=false;++generation;if(handle){useTimer?clearTimer(handle):caf(handle);handle=0}if(watchdog){clearTimer(watchdog);watchdog=0}},
   get running(){return running}
  };
 },
 createQuality(max){
  let density=max,samples=[],start=0,lastChange=0,good=0;
  return{get density(){return density},sample(interval,now){
   if(!start)start=now;if(now-start<1500||interval<5||interval>120)return null;
   samples.push(interval);if(samples.length<90)return null;
   const sorted=samples.sort((a,b)=>a-b),slow=sorted[Math.floor(sorted.length*.75)]>23,fast=sorted[Math.floor(sorted.length*.9)]<18.5;samples=[];
   if(now-lastChange<3000)return null;
   if(slow&&density>1){density=Math.max(1,density-.25);lastChange=now;good=0;return density}
   good=fast?good+1:0;if(good>=4&&density<max){density=Math.min(max,density+.25);lastChange=now;good=0;return density}
   return null;
  }};
 }
};

/* Opt-in development measurements: ?profile=1. No profiling buffers or reports on normal visits. */
window.PortfolioRender.createProbe=function(canvas,renderer){
 if(!new URLSearchParams(location.search).has('profile'))return null;
 let frames=[],last=0,reportAt=performance.now(),totalFrames=0;
 return{resume(){frames=[];last=0;reportAt=performance.now()},record(now,updateMs,renderMs){
  const interval=last?now-last:0;last=now;++totalFrames;
  frames.push({interval,updateMs,renderMs,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
  if(now-reportAt<3000)return;reportAt=now;
  const samples=frames.slice(10);frames=[];if(!samples.length)return;
  const avg=k=>+(samples.reduce((sum,f)=>sum+f[k],0)/samples.length).toFixed(2);
  const times=samples.map(f=>f.interval).sort((a,b)=>a-b);
  canvas.dataset.performance=JSON.stringify({view:document.querySelector('.view:not([hidden])')?.id,totalFrames,frames:samples.length,intervalMs:avg('interval'),p95Ms:+times[Math.floor(times.length*.95)].toFixed(2),updateMs:avg('updateMs'),renderMs:avg('renderMs'),drawCalls:avg('calls'),triangles:avg('triangles'),pixels:canvas.width*canvas.height});
 }};
};
