"""The Kessler model as a desk sculpture. Three shells at 450, 550 and 850 km, spread out for
legibility. Every fragment orbit passes back through the collision point, which is the mechanism
the paper studies: one impact seeds orbits that cross many others."""
import sys,os,random
sys.path.insert(0,os.path.dirname(__file__))
from lib import *
a=sys.argv[sys.argv.index('--')+1:];tex=a[0];out=a[1];mode=a[2] if len(a)>2 else 'view'
reset();random.seed(11)
M=dict(
 brass=mat('brass','#c5a16c',.32,1),
 dark=mat('alu_dark','#23272a',.42,.8),
 steel=mat('steel','#c3c9cb',.26,1),
 wire=mat('wire_steel','#9fb0b2',.34,1),
 wire2=mat('wire_brass','#d0ad74',.3,1),
 frag=mat('fragment_wire','#d9673a',.42,.7),
 cream=mat('sat_cream','#e6dcc4',.45),
 panel=mat('sat_panel','#1a4560',.3,.4,coat=.5),
 hot=mat('impact','#ff5a1c',.4,0,emit='#ff4a10',emit_str=2.4),
 shard=mat('shard','#a7adaa',.5,.8),
 shard2=mat('shard_hot','#d9673a',.45,.5),
 enamel=mat('enamel_blue','#1d3a48',.34,.1,coat=.5),engr=mat('engraved','#2a2418',.5,.3),
)
Rg=10.;C=Vector((0,0,24.5));TILT=math.radians(23.4)
shells=[(13.2,'450'),(15.8,'550'),(19.0,'850')]
# globe with painted, raised continents
gm=bpy.data.materials.new('earth');gm.use_nodes=True;t=gm.node_tree;b=t.nodes['Principled BSDF']
im=lambda f,cs:(lambda n:(setattr(n,'image',bpy.data.images.load(f)),setattr(n.image.colorspace_settings,'name',cs),n)[2])(t.nodes.new('ShaderNodeTexImage'))
A=im(tex+'_albedo.png','sRGB');Nm=im(tex+'_normal.png','Non-Color');O=im(tex+'_orm.png','Non-Color')
t.links.new(A.outputs[0],b.inputs['Base Color']);nmap=t.nodes.new('ShaderNodeNormalMap');t.links.new(Nm.outputs[0],nmap.inputs[1]);t.links.new(nmap.outputs[0],b.inputs['Normal'])
sc=t.nodes.new('ShaderNodeSeparateColor');t.links.new(O.outputs[0],sc.inputs[0]);t.links.new(sc.outputs[1],b.inputs['Roughness']);t.links.new(sc.outputs[2],b.inputs['Metallic'])
bm=bmesh.new();uv=bm.loops.layers.uv.new('UVMap');NU,NV=96,64;rings=[]
for j in range(NV+1):
    th=math.pi*j/NV;rg=[]
    for i in range(NU+1):
        ph=TAU*i/NU;rg.append(bm.verts.new((Rg*math.sin(th)*math.cos(ph),Rg*math.sin(th)*math.sin(ph),Rg*math.cos(th))))
    rings.append(rg)
for j in range(NV):
    for i in range(NU):
        q=[rings[j][i],rings[j+1][i],rings[j+1][i+1],rings[j][i+1]]
        if j==0:q=[rings[0][i],rings[1][i],rings[1][i+1]]
        elif j==NV-1:q=[rings[j][i],rings[j+1][i],rings[j][i+1]]
        f=bm.faces.new(q)
        for l in f.loops:
            for jj in range(NV+1):
                pass
uvs={}
for j in range(NV+1):
    for i in range(NU+1):uvs[rings[j][i].index if False else rings[j][i]]=(i/NU,1-j/NV)
for f in bm.faces:
    for l in f.loops:l[uv].uv=uvs[l.vert]
bmesh.ops.remove_doubles(bm,verts=[],dist=0)
bm.normal_update()
me=from_bm(bm,'globe',gm,smooth=180)
# the globe turns about its own tilted axis in the page, so it stays a separate node
gl=bpy.data.objects.new('mover_globe',None);coll().objects.link(gl);gl.location=C;gl.rotation_euler=(TILT,0,0)
obj('mover_globe_mesh',me,gl)
ax=Vector((0,-math.sin(TILT),math.cos(TILT)))
# polar axis, half-meridian frame and pedestal
rod(C-ax*(Rg+1.6),C+ax*(Rg+1.6),.22,M['steel'],seg=14)
for s in (-1,1):obj('pin',cyl(.7,.5,M['brass'],seg=20,bevel=.06),None,C+ax*s*(Rg+.25),rot_to(ax))
ROut=shells[-1][0]+1.6
def arc(R,a0,a1,n=46):
    pts=[]
    for i in range(n+1):
        t=math.radians(a0+(a1-a0)*i/n);pts.append((R*math.sin(t),R*math.cos(t)))
    return pts
ORING=[(p[0],p[1]) for p in arc(ROut+.42,-8,188)]+[(p[0],p[1]) for p in arc(ROut-.42,188,-8)]
fr=obj('meridian',poly_mesh([{'outer':ORING}],.75,'meridian',M['brass'],M['dark']),None,C,(TILT+math.pi/2,0,math.pi/2))
fr.rotation_euler=(0,-TILT,math.pi/2)
fr.rotation_euler=(math.pi/2-TILT*0,0,0)
# meridian lies in the plane holding the axis: build it from the axis directly
bpy.data.objects.remove(fr)
perp=Vector((0,math.cos(TILT),math.sin(TILT)));pts=[]
for i in range(73):
    t=math.radians(-4+188*i/72);pts.append(C+(ax*math.cos(t)+perp*math.sin(t))*ROut)
obj('meridian',tube(pts,.34,M['brass'],seg=10,res=1),None)
for s in (-1,1):
    rod(C+ax*s*(Rg+.5),C+ax*s*(ROut+.1),.2,M['steel'],seg=10)
    obj('collar',cyl(.55,.7,M['dark'],seg=16,bevel=.05),None,C+ax*s*(ROut-.1),rot_to(ax))
base=C+perp*0+ (ax*math.cos(math.radians(150))+perp*math.sin(math.radians(150)))*ROut
base2=C+(ax*math.cos(math.radians(180))+perp*math.sin(math.radians(180)))*ROut
foot=Vector((0,base2.y,3.5))
obj('stem',tube([base2,(base2.x,base2.y+.1,(base2.z+foot.z)/2),foot,(0,base2.y*.4,1.2),(0,0,.4)],.5,M['dark'],seg=14,res=8),None)
obj('foot',cyl(5.4,.6,M['dark'],seg=48,r2=4.5,bevel=.1),None,(0,0,.3))
obj('foot2',cyl(3,.4,M['brass'],seg=36,r2=1.8),None,(0,0,.8))
def frame(n):
    """Rotation taking +Z to the orbit normal n."""
    return Vector((0,0,1)).rotation_difference(Vector(n).normalized()).to_matrix()
def add_ring(n,R,m,r=.1,seg=120):
    me=torus(R,r,m,seg=seg,sides=5,name='orbit');o=obj('orbit',me,None,C);q=Vector((0,0,1)).rotation_difference(Vector(n).normalized());o.rotation_mode='QUATERNION';o.rotation_quaternion=q
    return o
def at(n,R,t):
    B=frame(n);return C+B@Vector((R*math.cos(t),R*math.sin(t),0)),B@Vector((-math.sin(t),math.cos(t),0))
def stay(p,m=M['wire']):
    """A fine radial pin from the globe holds each orbit wire in place."""
    d=(p-C).normalized();rod(C+d*Rg*.99,p,.045,m,seg=6)
    obj('ferrule',cyl(.14,.3,M['brass'],seg=8),None,C+d*(Rg+.08),rot_to(d))
def sat(n,R,t,scale=1,col=None):
    p,tg=at(n,R,t);up=(p-C).normalized();rt=tg.cross(up);Mx=Matrix((rt,tg,up)).transposed().to_euler()
    b=obj('sat',box(.86*scale,1.2*scale,.86*scale,M['cream'],bevel=.06,seg=1),None,p,Mx)
    for s in (-1,1):
        obj('sat_arm',cyl(.05*scale,.6*scale,M['steel'],seg=6),b,(s*.7*scale,0,0),(0,math.pi/2,0))
        obj('sat_panel',box(1.5*scale,.86*scale,.06*scale,M['panel'],seg=1),b,(s*1.7*scale,0,0))
    obj('sat_dish',cyl(.32*scale,.08*scale,M['brass'],seg=10,r2=.16*scale),b,(0,0,.5*scale))
def shard(p,s,hot=False):
    bm=bmesh.new();pts=[Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-.6,.6))).normalized()*random.uniform(.6,1)*s for _ in range(6)]
    vs=[bm.verts.new(x) for x in pts];bmesh.ops.convex_hull(bm,input=vs);bm.normal_update()
    return obj('shard',from_bm(bm,'shard',M['shard2' if hot else 'shard']),None,p,(random.random()*6,random.random()*6,random.random()*6))
orbits=[]
incs=[((.26,.12,1),0),((-.62,.42,.75),1),((.72,.55,.4),2),((-.2,-.86,.52),0),((.5,-.72,.5),1),((-.8,-.3,.45),2)]
stays={0:(.6,3.7),1:(1.2,4.6),2:(.2,3.4)}
for k,(n,sh) in enumerate(incs):
    R=shells[sh][0];add_ring(n,R,M['wire2'] if sh==1 else M['wire']);orbits.append((n,R))
    for t in stays[sh]:
        p,_=at(n,R,t+k*.4);stay(p)
# satellites ride the wires
for k,(n,R) in enumerate(orbits):
    for q in range(3):
        sat(n,R,.9+q*2.05+k*.7,scale=1.05+.2*(k%2))
# The collision in the 550 km shell: two orbits meet, and fragment orbits fan out from that point.
n1=Vector(incs[1][0]).normalized();n2=Vector(incs[4][0]).normalized();line=n1.cross(n2).normalized()
Rc=shells[1][0];P=C+line*Rc
# keep the impact on the side a visitor sees first
if (P-C).y>0:line=-line;P=C+line*Rc
tan=(n1+n2).normalized()
for k in range(9):
    u=-1+2*k/8;nf=(n1*math.cos(u*1.25)+n1.cross(line)*math.sin(u*1.25)).normalized()
    Rf=Rc+(k%3-1)*.0
    add_ring(nf,Rc,M['frag'],r=.06,seg=96)
    for j in range(9):
        B=frame(nf);base_=B.inverted()@line;t0=math.atan2(base_.y,base_.x)
        t=t0+(.32+j*.62+random.uniform(-.1,.1))*(1 if j%2 else -1)
        p,_=at(nf,Rc,t);shard(p,random.uniform(.14,.28),hot=(j<3))
obj('impact',sphere(.72,M['hot'],seg=18,ring=12),None,P)
for k in range(26):
    d=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,1))).normalized();l=random.uniform(1.3,3.2)
    rod(P,P+d*l,.05,M['frag'],seg=5);shard(P+d*l,random.uniform(.16,.34),hot=True)
sat(n1,Rc,math.atan2((frame(n1).inverted()@line).y,(frame(n1).inverted()@line).x)+.17,scale=.95)
sat(n2,Rc,math.atan2((frame(n2).inverted()@line).y,(frame(n2).inverted()@line).x)-.17,scale=.95)
# Loose debris on every orbit, thickest where the paper's model puts it, at 850 km.
for k,(n,R) in enumerate(orbits):
    for j in range(16 if R>18 else 9):
        p,_=at(n,R,random.uniform(0,TAU));shard(p,random.uniform(.14,.26))
# altitude tags on the meridian
for R,lab in shells:
    p=C+(ax*math.cos(math.radians(28))+perp*math.sin(math.radians(28)))*R
    stem=C+(ax*math.cos(math.radians(28))+perp*math.sin(math.radians(28)))*(ROut)
plinth(30,30,M['enamel'],M['brass'])
plaque('KESSLER CASCADE','450 / 550 / 850 KM SHELLS / HEIGHTS NOT TO SCALE',0,-15.09,-.75,M['brass'],M['engr'],w=11.5,h=1.25)
print('objects',len(bpy.data.objects),'tris',tris_of())
if mode=='view':
    render(out,{'iso':(-.6,-1,.3),'side':(0,-1,.05),'top':(.3,.5,1),'back':(.9,1,.2)},cx=(0,0,23),dist=150,size=(900,640),samples=20)
if mode=='final':
    join_static(keep=('tyre','mover'));bake_ao(out+'_ao.png',size=1280,skip=('mover',),distance=4)
    bpy.ops.wm.save_as_mainfile(filepath=out+'.blend')
    export(out+'_raw.glb');print('tris final',tris_of())
