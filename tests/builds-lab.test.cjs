const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function element(){return {hidden:false,textContent:'',href:'',dataset:{},attributes:{},events:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,fn){this.events[k]=fn},focus(){this.focused=true}}}
function setup(){
 const ids=Object.fromEntries(['testlab-stage','testlab-canvas','testlab-card','testlab-hint','testlab-fallback','testlab-tag','testlab-name','testlab-desc','testlab-link','testlab-back'].map(k=>[k,element()]));
 const buttons=['strata','drone','orbit','wing'].map(key=>Object.assign(element(),{dataset:{lab:key}}));
 const document={getElementById:id=>ids[id],querySelectorAll:()=>buttons};
 class IntersectionObserver{constructor(callback){this.callback=callback}observe(){}}
 const source=fs.readFileSync('builds-lab.js','utf8').replace(/^import .*;\s*$/gm,'');
 vm.runInNewContext(source,{document,matchMedia:()=>({matches:false}),IntersectionObserver});
 return {ids,buttons};
}
test('each lab station opens its matching project without WebGL',()=>{
 const {ids,buttons}=setup();
 for(const [i,link] of ['#b-4x4','#b-quad','#b-kessler','#b-wing'].entries()){
  buttons[i].events.click();assert.equal(ids['testlab-card'].hidden,false);assert.equal(ids['testlab-link'].href,link);assert.equal(buttons[i].attributes['aria-pressed'],'true');
  assert.equal(buttons.filter(b=>b.attributes['aria-pressed']==='true').length,1);
 }
 ids['testlab-back'].events.click();assert.equal(ids['testlab-card'].hidden,true);assert.equal(ids['testlab-hint'].hidden,false);assert.ok(buttons.every(b=>b.attributes['aria-pressed']==='false'));
});
