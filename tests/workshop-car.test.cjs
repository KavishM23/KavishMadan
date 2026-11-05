const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');

// Build the model with lightweight geometry doubles so the assembly can be
// checked without a GPU or a browser. The actual renderer still uses Three.js.
function buildCar(){
 const rods=[];
 class Object3D{constructor(){this.children=[];this.userData={};this.position={set(){}};this.rotation={set(){}};this.scale={set(){}}}add(o){this.children.push(o)}}
 class Material{constructor(opts={}){Object.assign(this,opts);this.userData={}}clone(){return Object.assign(new Material(),this)}}
 class Geometry{constructor(...args){this.args=args}}
 class Mesh extends Object3D{constructor(geometry,material){super();this.isMesh=true;this.geometry=geometry;this.material=material}}
 Object3D.prototype.traverse=function(fn){fn(this);for(const c of this.children)c.traverse(fn)};
 const THREE={Group:Object3D,Mesh,MeshPhysicalMaterial:Material,MeshStandardMaterial:Material,Vector2:class{constructor(x,y){this.x=x;this.y=y}},SplineCurve:class{constructor(points){this.points=points}getPoints(){return this.points}},DoubleSide:2};
 for(const name of ['TorusGeometry','CylinderGeometry','SphereGeometry','LatheGeometry'])THREE[name]=class extends Geometry{};
 const make=(g,m)=>new Mesh(g,m),kit={
  loft:()=>new Geometry(),wing:()=>new Geometry(),foil:()=>[],
  bar:(a,b,r,m)=>{rods.push([a,b]);return make(new Geometry(),m)},
  blade:(a,b,w,t,m)=>make(new Geometry(),m),mesh:make,box:(w,h,d,m)=>make(new Geometry(),m),
  add:(parent,...children)=>{children.forEach(child=>parent.add(child));return children[0]},
  worn:()=>new Material(),canvasTexture:()=>({}),rng:()=>()=>.5,lerp:(a,b,t)=>a+(b-a)*t
 };
 const context={Workshop:{},Math};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../workshop-car.js'),'utf8'),context);
 return {car:context.Workshop.car(THREE,kit),rods};
}
const same=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-8);
test('car constructs four wheels and retains the workshop animation contract',()=>{
 const {car}=buildCar(),parts=car.userData.parts;
 assert.equal(parts.spins.length,4);assert.equal(parts.fronts.length,2);
 assert.ok(parts.yoke&&parts.flap&&parts.tyreGeometry&&parts.rubber);
 assert.doesNotThrow(()=>car.userData.play(1,0,.016));
});
test('every wheel upright has a hub connection and paired upper and lower links',()=>{
 const {rods}=buildCar();
 for(const [z,x,width,y] of [[0,.91,.32,.356],[-3,.84,.46,.37]])for(const side of [-1,1]){
  const upright=side*(x-width*.5-.025),upper=[upright,y+.14,z],lower=[upright,y-.14,z],hub=[upright,y,z];
  assert.ok(rods.some(([a,b])=>same(a,hub)&&same(b,[side*x,y,z])),'upright connects to wheel hub');
  assert.ok(rods.filter(([,b])=>same(b,upper)).length>=2,'upper upright has wishbone links');
  assert.ok(rods.filter(([,b])=>same(b,lower)).length>=2,'lower upright has wishbone links');
 }
});
