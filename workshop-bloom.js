import * as THREE from 'three';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
export function workshopBloom(renderer,scene,camera){
 const targets=[0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false}));
 const input=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});
 const blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,vertexShader,
  uniforms:{source:{value:null},stepUV:{value:new THREE.Vector2()}},
  fragmentShader:`varying vec2 vUv;uniform sampler2D source;uniform vec2 stepUV;
    void main(){
     vec3 c=texture2D(source,vUv).rgb*.227027;
     c+=(texture2D(source,vUv+stepUV*1.384615).rgb+texture2D(source,vUv-stepUV*1.384615).rgb)*.316216;
     c+=(texture2D(source,vUv+stepUV*3.230769).rgb+texture2D(source,vUv-stepUV*3.230769).rgb)*.070270;
     gl_FragColor=vec4(c,1.);
    }`});
 const quad=new FullScreenQuad(blur),color=new THREE.Color();
 let w=0,h=0;
 function convolve(source,target,x,y){
  blur.uniforms.source.value=source.texture;blur.uniforms.stepUV.value.set(x,y);
  renderer.setRenderTarget(target);quad.render(renderer);
 }
 return {
  texture:targets[1].texture,
  render(width,height){
   const nextW=Math.max(1,Math.round(width/6)),nextH=Math.max(1,Math.round(height/6));
   if(w!==nextW||h!==nextH){w=nextW;h=nextH;[input,...targets].forEach(t=>t.setSize(w,h))}
   const prev=renderer.getRenderTarget(),bg=scene.background,layers=camera.layers.mask;
   const alpha=renderer.getClearAlpha();renderer.getClearColor(color);
   try{
    camera.layers.set(1);scene.background=null;renderer.setClearColor(0,1);
    renderer.setRenderTarget(input);renderer.clear();renderer.render(scene,camera);
    convolve(input,targets[0],1.6/w,0);
    convolve(targets[0],targets[1],0,1.6/h);
   }finally{
    renderer.setClearColor(color,alpha);scene.background=bg;camera.layers.mask=layers;renderer.setRenderTarget(prev);
   }
  },
  free(){input.dispose();targets.forEach(t=>t.dispose())}
 };
}

export function bloomComposite(){
 return {
  uniforms:{tDiffuse:{value:null},glow:{value:null},strength:{value:.36}},vertexShader,
  fragmentShader:`varying vec2 vUv;uniform sampler2D tDiffuse,glow;uniform float strength;
    void main(){gl_FragColor=vec4(texture2D(tDiffuse,vUv).rgb+texture2D(glow,vUv).rgb*strength,1.);}`
 };
}
