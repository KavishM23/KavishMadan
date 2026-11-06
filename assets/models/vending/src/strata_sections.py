"""Slice the decoded Fusion body of Project Strata into its laser-cut ribs.

Input : car.npz, the display mesh decoded from 4x4CAR223e2.f3d (centimetres).
Output: strata_parts.json, 2D outlines for every laser-cut part.

Body: width 7.93..22.43 cm in CAD X, length 0..34 cm in CAD Y. The Fusion render and
the laser-cut plate both show 22 ribs, so that is the slice count. The car in the
deck records that the team cut 30 mm off the CAD height, so the plate sits 30 mm up
the CAD and everything below it is trimmed. Short legs then carry each rib into its
slot. The leg positions are read from photographs, so they are inferred.
"""
import json,sys,numpy as np
from shapely.geometry import Polygon,MultiLineString,box,Point,MultiPolygon
from shapely.ops import unary_union,polygonize,linemerge
from shapely import affinity
d=np.load(sys.argv[1]);v=d['v'].astype(float);t=d['t']
tri=v[t];keep=~((tri[:,:,2].max(1)<0.06)&(np.ptp(tri[:,:,1],axis=1)>2)) # a stray sketch sheet sits under the body
keep&=tri[:,:,0].max(1)>7.9
t=t[keep]
def section(x):
    a=v[t];d=a[:,:,0]-x+1e-5
    m=(d.min(1)<0)&(d.max(1)>0);segs=[]
    for tr,dd in zip(a[m],d[m]):
        pts=[]
        for i,j in ((0,1),(1,2),(2,0)):
            if dd[i]*dd[j]<0:
                s=dd[i]/(dd[i]-dd[j]);q=tr[i]+(tr[j]-tr[i])*s;pts.append((round(float(q[1]),3),round(float(q[2]),3)))
        if len(pts)==2 and pts[0]!=pts[1]:segs.append(pts)
    return segs
def solid(segs):
    if not segs:return Polygon()
    faces=list(polygonize(unary_union(MultiLineString(segs))))
    # even-odd: count the loop crossings of a ray from each face's interior point
    S=np.array(segs)
    res=[]
    for f in faces:
        p=f.representative_point();y=p.y;xs=S[:,:,0];ys=S[:,:,1]
        c=((ys[:,0]>y)!=(ys[:,1]>y));xi=xs[c,0]+(y-ys[c,0])/(ys[c,1]-ys[c,0])*(xs[c,1]-xs[c,0])
        if (xi>p.x).sum()%2==1:res.append(f)
    return unary_union(res) if res else Polygon()
N=22;x0,x1=7.93+.16,22.43-.16;xs=np.linspace(x0,x1,N);pitch=(x1-x0)/(N-1);T=.3
mid=(7.93+22.43)/2
ribs=[];PLATE=3.0;rake=0.
for k,x in enumerate(xs):
    p=solid(section(x)).buffer(.012).buffer(-.012).simplify(.012)
    ribs.append(p)
all_=unary_union(ribs);print('bounds',all_.bounds)
L0=0.;L1=34.
out=[]
LEGS=(8.6,27.4)
for k,p in enumerate(ribs):
    q=p.intersection(box(-1,PLATE,36,30)).buffer(0)
    gs=[g for g in (q.geoms if q.geom_type!='Polygon' else [q]) if g.area>.02]
    if not gs:continue
    main=max(gs,key=lambda g:g.area)
    # every rib gets feet through the plate; floating pieces get a stay down to the plate
    extras=[]
    for ly in LEGS:
        col=box(ly-.35,PLATE-.45,ly+.35,PLATE+.1)
        hit=unary_union(gs).intersection(box(ly-.35,PLATE,ly+.35,30))
        top=PLATE+.5
        if not hit.is_empty:top=hit.bounds[1]+.15
        extras.append(Polygon([(ly-.35,PLATE-.45),(ly+.35,PLATE-.45),(ly+.35,PLATE),(ly+.75,top),(ly-.75,top),(ly-.35,PLATE)]))
    shape=unary_union(gs+extras).buffer(0)
    parts=list(shape.geoms) if shape.geom_type!='Polygon' else [shape]
    if len(parts)>1:
        main=max(parts,key=lambda g:g.area);fix=[main]
        for g in parts:
            if g is main:continue
            if g.area<.08:continue
            # a short vertical stay joins a loose island to the plate
            m=g.representative_point().x;b=g.bounds[1]
            fix+= [g,box(m-.14,PLATE-.05,m+.14,b+.1)]
        shape=unary_union(fix).buffer(0)
    parts=[shape] if shape.geom_type=='Polygon' else list(shape.geoms)
    for g in parts:
        out.append({'rib':k,'x':float(xs[k]-mid),'outer':[list(c) for c in g.exterior.coords[:-1]],'holes':[[list(c) for c in h.coords[:-1]] for h in g.interiors if Polygon(h).area>.006]})
print('rib parts',len(out),'verts',sum(len(o['outer'])+sum(map(len,o['holes'])) for o in out))
# Base plate from the laser-cut photo: slots run the length, wings fold down at mid-span.
W=14.5+.3;plate=box(.2,-W/2,33.8,W/2)
slots=[box(1.5,(x-mid)-T/2-.015,32.6,(x-mid)+T/2+.015) for x in xs]
plate=plate.difference(unary_union(slots))
def R(a,b,c,d):return box(a,b,c,d)
# side frame: window and two columns of four holes, as in the hero photo (dimensions read from photos)
sw,sh=8.4,6.4
side=R(-sw/2,-sh,sw/2,0).difference(R(-sw/2+1.15,-sh+.95,sw/2-1.15,-.95))
for sx in (-sw/2+.58,sw/2-.58):
    for j in range(4):side=side.difference(Point(sx,-.9-j*1.55).buffer(.2,16))
# grille at the low end of the ribs: uprights hanging from a top bar
gw,gh=W,6.0
gr=R(-gw/2,-1.2,gw/2,0)
gr=unary_union([gr,R(-gw/2,-gh,gw/2,-gh+.8)])
for i in range(10):
    u=-gw/2+.1+i*(gw-.75)/9;gr=unary_union([gr,R(u,-gh,u+.55,0)])
# Strata mark: triangle with stacked strata bars, as on the wheel faces and grille
tri_o=Polygon([(0,1.0),(-.92,-.62),(.92,-.62)]);tri_i=tri_o.buffer(-.2,join_style=2)
mark=tri_o.difference(tri_i)
for y,w in ((.0,.62),(-.32,.82)):
    mark=mark.union(R(-w,y-.07,w,y+.07).intersection(tri_o))
def ser(g):
    gs=list(g.geoms) if g.geom_type!='Polygon' else [g]
    return [{'outer':[list(c) for c in s.exterior.coords[:-1]],'holes':[[list(c) for c in h.coords[:-1]] for h in s.interiors]} for s in gs]
json.dump({'ribs':out,'plate':ser(plate),'side':ser(side),'grille':ser(gr),'mark':ser(mark),'plateZ':PLATE,'T':T,'W':W,'mid':mid,'rake':rake},open(sys.argv[2],'w'))
