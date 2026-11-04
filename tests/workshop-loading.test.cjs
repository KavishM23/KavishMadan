const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source=html.match(/<script>\s*(\(function\(\)\{\s*const panel=document\.getElementById\('ws-loader'\)[\s\S]*?\}\)\(\);)\s*<\/script>/)[1];
function setup(home=true){
 const handlers={},timers=new Map(),classes=new Set(),buttons={};let id=0,focus=false;
 const panel={hidden:false,classList:{add:c=>classes.add(c)}},button={disabled:true,firstChild:{textContent:'Enter workshop '},addEventListener:(k,fn)=>buttons[k]=fn},status={textContent:''},hero={classList:{add:c=>classes.add(c)}};
 const elements={'ws-loader':panel,'ws-loader-enter':button,'ws-loader-status':status,hero};
 const env={document:{documentElement:{classList:{contains:()=>home}},getElementById:id=>elements[id],querySelector:()=>({focus:()=>{focus=true}})},location:{hash:home?'#home':'#about'},addEventListener:(k,fn)=>{handlers[k]=fn},setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(source,env);return{panel,button,status,hero,classes,handlers,buttons,timers,get focus(){return focus}};
}
test('workshop entry waits for both readiness and the minimum boot display',()=>{const s=setup();assert.equal(s.button.disabled,true);s.handlers['workshop-ready']();assert.equal(s.button.disabled,true);[...s.timers.values()][1]();assert.equal(s.button.disabled,false);assert.equal(s.status.textContent,'The workshop is ready.');s.buttons.click();assert.equal(s.panel.hidden,true);assert.equal(s.focus,true)});
test('slow loading still waits for the real ready event',()=>{const s=setup();[...s.timers.values()][1]();assert.equal(s.button.disabled,true);s.handlers['workshop-ready']();assert.equal(s.button.disabled,false)});
test('a failed or stalled workshop allows the visitor to continue',()=>{for(const viaTimeout of [false,true]){const s=setup();viaTimeout?[...s.timers.values()][0]():s.handlers['workshop-failed']();assert.equal(s.button.disabled,false);assert.equal(s.classes.has('ws-failed'),true);s.buttons.click();assert.equal(s.panel.hidden,true)}});
test('direct links to other pages do not show the workshop intro',()=>{const s=setup(false);assert.equal(s.panel.hidden,true);assert.equal(s.timers.size,0)});
