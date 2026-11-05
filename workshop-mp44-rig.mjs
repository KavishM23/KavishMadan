// Only geometry fully inside the measured tyre volume belongs to a wheel.
// A shared hub material also contains chassis parts and must not all rotate.
export function wheelForTriangle(vertices, wheels, margin=.035){
 for(let i=0;i<wheels.length;i++){
  const {min,max}=wheels[i];
  if(vertices.every(v=>v.x>=min.x-margin&&v.x<=max.x+margin&&v.y>=min.y-margin&&v.y<=max.y+margin&&v.z>=min.z-margin&&v.z<=max.z+margin))return i;
 }
 return -1;
}
