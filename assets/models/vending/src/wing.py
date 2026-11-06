"""Conceptual reconstruction of the YYGS test wing: a NACA 0009 section with dragonfly-inspired ridges
along the leading edge and mid-chord, as described in the team's slides. The spar, end plates and stand
are display details, not the team's hardware. The quadrant covers the slides' -2 to 18 degree sweep."""
import sys,os
sys.path.insert(0,os.path.dirname(__file__))
from lib import *
a=sys.argv[sys.argv.index('--')+1:];out=a[0];mode=a[1] if len(a)>1 else 'view'
reset()
M=dict(
 skin=mat('wing_skin','#7fa9ba',.38,.05,coat=.4),
 ridge=mat('wing_ridge','#b9d2d6',.34,.05,coat=.4),
 brass=mat('brass','#c5a16c',.32,1),
 steel=mat('steel','#c3c9cb',.26,1),
 dark=mat('alu_dark','#23272a',.42,.8),
 cream=mat('cream','#e6dcc4',.5),
 tick=mat('tick','#1c2428',.5),
 orange=mat('pointer','#e8571c',.4,.3),
 enamel=mat('enamel_blue','#1d3a48',.34,.1,coat=.5),engr=mat('engraved','#2a2418',.5,.3),
)
CH=17.;SP=25.
def naca(x):return 5*.09*(.2969*math.sqrt(x)-.126*x-.3516*x*x+.2843*x**3-.1036*x**4)
def teeth(x):
    """Ridges are triangular, fading in and out: a leading-edge band and a mid-chord band."""
    h=0
    for c0,c1,n,amp in ((.035,.30,7,.027),(.42,.60,5,.022)):
        if c0<=x<=c1:
            u=(x-c0)/(c1-c0);tri=1-abs(((u*n)%1)*2-1)
            env=math.sin(math.pi*u)**.5;h+=amp*tri*env
    return h
xs=[]
for i in range(120):
    xs.append(.5*(1-math.cos(math.pi*i/119)))
xs=sorted(set(xs+[.035+(.30-.035)*i/56 for i in range(57)]+[.42+.18*i/40 for i in range(41)]))
up=[(x,naca(x)+teeth(x)) for x in xs]
lo=[(x,-naca(x)) for x in xs[::-1]][1:-1]
prof=up+lo
isr=[(teeth(p[0])>1e-5 and p[1]>0) for p in prof]
PN=len(prof);NS=30
bm=bmesh.new();rings=[]
def section(t):
    y=SP*(t-.5);tp=1-.1*abs(2*t-1)**2 # slight taper out to the plates
    return [bm.verts.new(((p[0]-.32)*CH*tp,y,p[1]*CH*tp)) for p in prof]
rings=[section(j/NS) for j in range(NS+1)]
for j in range(NS):
    for i in range(PN):
        f=bm.faces.new((rings[j][i],rings[j+1][i],rings[j+1][(i+1)%PN],rings[j][(i+1)%PN]))
        f.material_index=1 if isr[i] and isr[(i+1)%PN] else 0
bm.faces.new(rings[0]);bm.faces.new(rings[-1][::-1])
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
me=from_bm(bm,'wing',[M['skin'],M['ridge']],smooth=32)
AOA=math.radians(8)
PZ=17.5
w=bpy.data.objects.new('wingassy',None);coll().objects.link(w);w.location=(0,0,PZ);w.rotation_euler=(0,AOA,0)
obj('wing',me,w)
# internal ribs show as fine lines of fasteners; a brass spar passes through at quarter chord
sp=obj('spar',cyl(.42,SP+7.5,M['brass'],seg=20),w,(0,0,0),(math.pi/2,0,0))
for s in (-1,1):
    outline=[((p[0]-.32)*CH*1.0,p[1]*CH*1.0) for p in prof[::3]]
    # brass end rib in the true section, so the aerofoil and its ridges always read from the side
    cap=[((p[0]-.32)*CH*.92,p[1]*CH*.92) for p in prof]
    ep=obj('endrib',poly_mesh([{'outer':cap[::-1]}],.36,'endrib',M['brass'],M['brass']),w,(0,s*(SP/2+.14),0),(math.pi/2,0,0))
    # boss clamps the spar to the plate
    obj('boss',cyl(.95,.6,M['dark'],seg=24,bevel=.06),w,(0,s*(SP/2+.72),0),(math.pi/2,0,0))
# chord-wise tie rods behind the ridges keep the plates square
for x in (-4.5,9.6):
    rod((x,-SP/2,-.0),(x,SP/2,0),.0,M['steel']) if False else None
# fork stand: two uprights carrying the spar
for s in (-1,1):
    Y=s*(SP/2+2.0)
    obj('fork',box(3.2,.8,PZ,M['dark'],bevel=.12),None,(0,Y,PZ/2),(0,0,0)).scale=(1,1,1)
    obj('bearing',cyl(1.45,1.1,M['brass'],seg=30,bevel=.1),None,(0,Y,PZ),(math.pi/2,0,0))
    obj('capnut',cyl(.62,.5,M['steel'],seg=6),None,(0,Y+s*.75,PZ),(math.pi/2,0,0))
    obj('footplate',box(11,3.2,.6,M['dark'],bevel=.1),None,(0,Y,.3))
    for x in (-4.4,4.4):obj('bolt',cyl(.32,.2,M['steel'],seg=6),None,(x,Y,.68))
obj('crossbar',box(1.8,SP+3.9,1.2,M['dark'],bevel=.1),None,(0,0,3.1))
# Brass quadrant on the near fork, scaled -2 to 18 degrees as in the XFOIL sweep
Yq=-(SP/2+2.0)-.75
R0,R1=1.3,9.6
def pol(r,d):t=math.radians(d);return (r*math.sin(t),r*math.cos(t))
ang=[-5+i*(26/40) for i in range(41)]
q=[pol(R1,d) for d in ang]+[pol(R1-2.2,d) for d in ang[::-1]]+[(.45,1.1),(.45,-.2),(-.45,-.2),(-.45,1.1)]+[pol(R1-2.2,-5)]
qd=obj('quadrant',poly_mesh([{'outer':q}],.22,'quadrant',M['brass'],M['brass']),None,(0,Yq-.08,PZ),(math.pi/2,0,math.pi))
qd.rotation_euler=(math.pi/2,0,0)
for i,d in enumerate(range(-2,19,2)):
    t=math.radians(d-90+90)
    # the scale reads along the wing's nose-up sweep
    th=math.radians(d)
    p0=(-(R1-.08)*math.sin(-th-math.radians(0)),0);
    u=Vector((math.cos(th-math.pi/2+math.pi/2),0,0))
    ax=Vector((math.sin(th),0,math.cos(th)))
    a0=Vector((0,Yq-.21,PZ))+ax*(R1-(1.0 if d%10==0 else .55)-.1);a1=Vector((0,Yq-.21,PZ))+ax*(R1-.1)
    obj('tick',box(.09,.05,(a1-a0).length,M['tick'],seg=1),None,(a0+a1)/2,(0,th,0))
pv=Vector((math.sin(AOA),0,math.cos(AOA)))
pz=Vector((0,Yq-.34,PZ))
obj('pointer',tube([pz,pz+pv*(R1-.2)],.09,M['orange'],seg=6,res=1),None)
obj('pivot',cyl(.5,.3,M['steel'],seg=18),None,(0,Yq-.26,PZ),(math.pi/2,0,0))
turn=bpy.data.objects.new('turn',None);coll().objects.link(turn);turn.rotation_euler=(0,0,math.pi/2)
for o in list(bpy.data.objects):
    if o.parent is None and o is not turn:o.parent=turn
bpy.context.view_layer.update()
plinth(36,26,M['enamel'],M['brass'])
plaque('CORRUGATED AEROFOIL','NACA 0009 WITH DRAGONFLY RIDGES / CONCEPT MODEL',0,-13.09,-.75,M['brass'],M['engr'],w=11.5,h=1.25)
print('objects',len(bpy.data.objects),'tris',tris_of())
if mode=='view':
    render(out,{'iso':(-.8,-1,.4),'end':(0,-1,.12),'top':(-1,-.25,.5),'back':(.9,1,.2)},cx=(0,0,13),dist=118,size=(900,640),samples=20)
if mode=='final':
    bake_keep=('tyre','mover')
    join_static(keep=bake_keep);bake_ao(out+'_ao.png',size=1024,distance=4)
    bpy.ops.wm.save_as_mainfile(filepath=out+'.blend')
    export(out+'_raw.glb');print('tris final',tris_of())
