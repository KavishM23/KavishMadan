import * as THREE from 'three';

export function workshopDust(scene,phone){
 const count=phone?18:44,positions=new Float32Array(count*3);
 const fraction=(i,n)=>(i*n)%1;
 for(let i=0;i<count;i++){
  positions[i*3]=-5.18+fraction(i+1,.38196)*3.5;
  positions[i*3+1]=1+fraction(i+1,.13721)*2.35;
  positions[i*3+2]=-3.35+fraction(i+1,.71931)*2.55;
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,
  uniforms:{phase:{value:0},density:{value:1}},
  vertexShader:`uniform float phase,density;varying float opacity;
   void main(){
    vec3 p=position;
    p.x+=sin(phase*.2+position.z*3.)*.19;
    p.y+=sin(phase*.28+position.x*2.)*.15;
    p.z+=cos(phase*.17+position.y*4.)*.17;
    vec4 v=modelViewMatrix*vec4(p,1.);
    gl_Position=projectionMatrix*v;
    gl_PointSize=clamp(36.*density/-v.z,1.4,5.);
    float distanceFromLight=(p.y-2.18+(p.x+5.1)*.23)/.7;
    opacity=.13*exp(-distanceFromLight*distanceFromLight)*(.8+.2*sin(p.z*4.+phase*.35));
   }`,
  fragmentShader:`varying float opacity;
   void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.91,.73,(1.-smoothstep(.03,.5,d))*opacity);}`
 });
 const dust=new THREE.Points(geometry,material);
 dust.visible=false;dust.userData.noAO=true;scene.add(dust);
 return {
  update(t,dark,density){dust.visible=!dark;material.uniforms.phase.value=t;material.uniforms.density.value=density},
  hide(){dust.visible=false}
 };
}
