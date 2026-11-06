/* The stairwell as numbers: the helix, its landings, the three alcoves and the camera's route.
   Blender builds from this file and the page animates from it, so the two always agree. */
(function(root){
 const PI=Math.PI,L={colR:.9,stairR:4.2,wallR:11,bridgeW:5,alcoveD:5.2,alcoveW:9.2,alcoveH:9.2,pitch:9,treads:18,landing:1.4,railH:3,top:0,shaftTop:9,thetaEnd:0,floorY:0,
  stops:[{key:'lastbite',theta:3*PI},{key:'tutortime',theta:6*PI},{key:'kungfooled',theta:9*PI}]};
 const k=L.pitch/(2*PI);L.thetaEnd=L.stops[2].theta+2.5*PI;
 // Height along the stair: a steady descent, level across each landing.
 L.flat=theta=>{let f=0;for(const s of L.stops)f+=Math.max(0,Math.min(L.landing,theta-(s.theta-L.landing/2)));return f};
 L.height=theta=>-k*(theta-L.flat(theta));
 for(const s of L.stops)s.y=L.height(s.theta);
 L.floorY=L.height(L.thetaEnd)-.3;
 L.at=(theta,r,y)=>[Math.sin(theta)*r,y,Math.cos(theta)*r];
 /* Alcove space: x to the viewer's right when facing out, y up from the deck, z towards the stair. */
 L.fromStop=(s,x,y,z)=>{const c=Math.cos(s.theta),n=Math.sin(s.theta),r=L.wallR-z;return [n*r-c*x,s.y+y,c*r+n*x]};
 L.shots={
  lastbite:{wide:{eye:[-.6,5.2,5.6],look:[.3,3.6,-2.2]},close:{eye:[-.35,4.35,2.1],look:[.25,3.74,-1.9]}},
  tutortime:{wide:{eye:[-.6,5.2,5.6],look:[.3,3.8,-2.2]},close:{eye:[-.35,4.35,2.1],look:[.25,3.74,-1.9]}},
  kungfooled:{wide:{eye:[-.6,5.4,6.2],look:[.3,4,-2.2]},close:{eye:[-.5,5.2,4.4],look:[.25,4.4,-2]}}
 };
 /* Between stops the camera rides outside the rail, and the drone leads it down the same sightline. */
 L.heli=t=>({eye:L.at(t,7.7,L.height(t)+4.7),look:L.at(t+1.05,3.5,L.height(t+1.05)+1.7),drone:L.at(t+.56,6.7,L.height(t+.56)+3.75)});
 L.hover={lastbite:[1.75,5.15,-.2],tutortime:[1.75,5.15,-.2],kungfooled:[2.35,6.6,.2]};
 /* Scroll timeline. Holds are where the page likes to rest; zones are the moves between them. */
 L.gate={y:62,z:4.5,scale:2.4,x:5.28};
 L.holds=[[.2,.3],[.43,.53],[.66,.76]];
 L.flash=.095;
 L.zones=[[.012,.2],[.3,.43],[.53,.66],[.76,.9]];
 L.anchors=[.25,.48,.71];
 root.codeLayout=L;
 if(typeof module!=='undefined')module.exports=L;
})(typeof window!=='undefined'?window:globalThis);
