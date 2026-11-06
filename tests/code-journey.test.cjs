const {test}=require('node:test');
const assert=require('node:assert/strict');
const L=require('../code-layout.js');
const r=p=>Math.hypot(p[0],p[2]);
const samples=[];for(let i=0;i<3;i++){const a=(i?L.stops[i-1].theta+.95:.05),b=L.stops[i].theta-1.15;for(let u=0;u<=1;u+=.01)samples.push(a+(b-a)*u)}for(let u=0;u<=1;u+=.01)samples.push(L.stops[2].theta+.95+(L.thetaEnd-1.2-L.stops[2].theta-.95)*u);
test('the camera and drone stay clear of the stair and the shaft wall between stops',()=>{
 for(const t of samples){const h=L.heli(t);
  assert.ok(r(h.eye)>L.stairR+2&&r(h.eye)<L.wallR-1,'camera between rail and wall');
  assert.ok(r(h.drone)>L.stairR+1.5&&r(h.drone)<L.wallR-2,'drone between rail and wall');
  assert.ok(h.drone[1]>L.floorY+.5,'drone above the floor')}
});
test('the camera and drone never pass through a bridge',()=>{
 for(const t of samples){const h=L.heli(t);for(const key of ['eye','drone'])for(const s of L.stops){
  const n=Math.sin(s.theta),c=Math.cos(s.theta),p=h[key],along=p[0]*n+p[2]*c,across=Math.abs(-p[0]*c+p[2]*n);
  const inBridge=along>L.stairR&&along<L.wallR&&across<L.bridgeW/2+.5;
  if(inBridge)assert.ok(p[1]>s.y+L.railH+.4||p[1]<s.y-1.2,`${key} clear of the ${s.key} bridge`)}}
});
test('every scroll hold sits between the moves, and each stop link lands inside its hold',()=>{
 L.holds.forEach(([a,b],i)=>{assert.ok(a<L.anchors[i]&&L.anchors[i]<b);for(const [x,y] of L.zones)assert.ok(y<=a||x>=b,'no move inside a hold')});
 for(let i=1;i<L.zones.length;i++)assert.ok(L.zones[i][0]>L.zones[i-1][1],'moves stay in order');
});
test('stops alternate sides of the shaft so no alcove sits under another',()=>{
 for(let i=1;i<L.stops.length;i++)assert.ok(Math.abs(Math.cos(L.stops[i].theta-L.stops[i-1].theta)+1)<1e-9);
 assert.ok(L.floorY<L.stops[2].y-5,'the shaft continues below the last stop');
});
test('the alcove hover point is inside the arch and above the worktop',()=>{
 for(const s of L.stops){const [x,y]=L.hover[s.key];assert.ok(Math.abs(x)<L.alcoveW/2-1);assert.ok(y>3.4&&y<L.alcoveH-1.2)}
});
