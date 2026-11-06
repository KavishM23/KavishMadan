"""The Code stairwell: a blue tiled shaft around a stone column, with a stair, three alcoves and a vestibule.
Everything is built from code-layout.js. Real scale: one unit is about 30 cm."""
import sys,os,json,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..','..','vending','src','workshop'))
from kit import *
import kit
from mathutils import Vector
sys.path.insert(0,os.path.dirname(__file__))
a=sys.argv[sys.argv.index('--')+1:];L=json.load(open(a[0]));OUT=a[1];RE=json.load(open(a[2]));
start()
PI=math.pi
k=L['pitch']/(2*PI)
stops=L['stops']
def flat(t):return sum(max(0,min(L['landing'],t-(s['theta']-L['landing']/2))) for s in stops)
def H(t):return -k*(t-flat(t))
def AT(t,r,y):return (math.sin(t)*r,y,math.cos(t)*r)
zel=M('zellige','#ffffff',.3,tex='zellige',tile=4.4,uvmode='cyl');pl=M('plaster','#ffffff',.8,tex='plaster',tile=5,uvmode='cyl');plf=M('plaster_flat','#ffffff',.8,tex='plaster',tile=5)
ter=M('terracotta','#ffffff',.6,tex='terra',tile=3);sto=M('stone','#ffffff',.6,tex='stone',tile=4);stoc=M('stone_col','#d8cfbe',.6,tex='stone',tile=4,uvmode='cyl')
br=M('brass_brushed','#b8945f',.34,1,tex='brushed',tile=2);dk=M('steel_dark','#2c3236',.4,.9,tex='brushed',tile=2);st=M('steel_brushed','#a6adae',.32,1,tex='brushed',tile=2)
wood=M('wood','#ffffff',.55,tex='wood',tile=3);wd=M('wood_dark','#6e4a2e',.6,tex='wood',tile=3);cr=M('enamel_cream','#e6d9bd',.34,tex='enamel',tile=3);en=M('enamel_blue','#1f4152',.3,tex='enamel',tile=3)
rb=M('rubber_black','#101213',.8);bk=M('plastic_black','#17191b',.5);pr=M('code_prints','#ffffff',.5,tex='code_prints');plain=M('paper','#efe6d2',.7);terra=M('terra_paint','#a4694a',.5)
M('arch_cream','#e6d9bd',.5);M('rug','#7a3a2c',.8);M('leaf','#4f7a42',.6);M('lantern_glass','#ffcf96',.4,emit='#ffcf96',emit_str=5,glow=1)
glow=M('lantern_glow','#ffffff',.5,emit='#ffcf96',emit_str=7,glow=1)
SH=lambda n,me,loc=(0,0,0),rot=(0,0,0),sc=None:S(n,me,loc,rot,'shaft',None,sc)
ST=lambda n,me,loc=(0,0,0),rot=(0,0,0),sc=None:S(n,me,loc,rot,'stair',None,sc)
top,bot=L['shaftTop'],L['floorY'];R=L['wallR']
# ---- shaft wall, cut for the three alcoves ----
def tube_wall(r,y0,y1,m,seg=120):
    """A closed ring of wall, so the arch cuts stay clean through its thickness."""
    bm=bmesh.new();r2=r+.8
    rg=[[bm.verts.new((q*math.sin(TAU*i/seg),y,q*math.cos(TAU*i/seg))) for i in range(seg)] for q,y in ((r,y0),(r,y1),(r2,y1),(r2,y0))]
    for i in range(seg):
        j=(i+1)%seg
        for k in range(4):
            n=(k+1)%4;bm.faces.new((rg[k][j],rg[n][j],rg[n][i],rg[k][i]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    return from_bm(bm,'wall',m,smooth=30)
def ring(r0,r1,h,m,seg=120):
    return cyl(r1,h,m,seg=seg,caps=True)
# wall bands: tile below each frieze, plaster above
bands=[];y=top
marks=[s['y'] for s in stops]+[bot]
ys=[top,-4]+[v for s in stops for v in (s['y']-1.0,)]+[bot]
ws=SH('wallmain',tube_wall(R,bot,top,zel))
for s in stops:
    # cut an arched opening; a thick boolean prism gives a clean edge
    prof=[]
    hw=L['alcoveW']/2;hh=L['alcoveH']
    rad=hw*1.02;cy=hh-rad
    for i in range(41):
        t=math.radians(-18+216*i/40);prof.append((rad*math.cos(t),cy+rad*math.sin(t)))
    prof=[(-hw*.94,0)]+prof[::-1][::-1][::-1]+[(hw*.94,0)] if False else [(hw*.94,0)]+prof+[(-hw*.94,0)]
    cut=bpy.data.objects.new('cut',panel(prof,6,plf,bevel=0));coll().objects.link(cut);cut.parent=kit.ROOT
    phi=s['theta']+PI;cut.location=(math.sin(s['theta'])*R,s['y'],math.cos(s['theta'])*R);cut.rotation_euler=(0,phi,0)
    bpy.context.view_layer.update()
    mod=ws.modifiers.new('b','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cut;mod.solver='EXACT'
    dg=bpy.context.evaluated_depsgraph_get();me=bpy.data.meshes.new_from_object(ws.evaluated_get(dg),depsgraph=dg);ws.modifiers.clear();ws.data=me;bpy.data.objects.remove(cut)
# frieze rings tie the shaft together
for y in [s['y']+L['alcoveH']+.9 for s in stops]+[-1.5]:
    SH('frieze',cyl(R-.04,1.0,pl,seg=120,caps=False),(0,y,0),Yr)
    for dy in (-.54,.54):SH('friezetrim',torus(R-.02,.05,br,seg=120,sides=6),(0,y+dy,0),(PI/2,0,0))
SH('floor',cyl(R+.3,.3,ter,seg=96),(0,bot-.15,0),Yr)
SH('ceil',cyl(R+.3,.4,wd,seg=96),(0,top+.2,0),Yr)
SH('oculus',cyl(2.6,.05,M('sky','#ffffff',.5,emit='#8cbde0',emit_str=1.4,glow=1),seg=48),(0,top-.02,0),Yr)
SH('oculusring',torus(2.7,.14,br,seg=64,sides=8),(0,top-.05,0),(PI/2,0,0))
for i in range(12):
    a0=i*TAU/12;SH('rafter',box(.5,.4,R-3,dk,bevel=.02),(math.sin(a0)*(R+2.7)/2,top-.2,math.cos(a0)*(R+2.7)/2),(0,a0,0))
# drone pad and floor star
SH('padbase',cyl(2.6,.12,dk,seg=64,bevel=.02),(*AT(L['thetaEnd']-.1,7.4,bot+.06),),Yr)
SH('padring',torus(2.2,.06,M('pad_glow','#ffffff',.5,emit='#ffd9a0',emit_str=4,glow=1),seg=64,sides=6),(*AT(L['thetaEnd']-.1,7.4,bot+.14),),(PI/2,0,0))
SH('padmark',torus(1.1,.05,br,seg=48,sides=6),(*AT(L['thetaEnd']-.1,7.4,bot+.14),),(PI/2,0,0))
# ---- column, treads, stringer and rails ----
ST('column',cyl(L['colR'],top-bot,stoc,seg=48,caps=False),(0,(top+bot)/2,0),Yr)
for y in [bot+.3]+[-(i+1)*6.2 for i in range(7)]:ST('colband',torus(L['colR']+.02,.06,br,seg=48,sides=6),(0,y,0),(PI/2,0,0))
ST('colfoot',lathe([(1.5,0),(1.5,.3),(1.15,.5),(.92,.7)],sto,seg=48),(0,bot,0))
te=L['thetaEnd'];da=TAU/L['treads']
def wedge(a0,a1,r0,r1,th,m,seg=4,nose=None):
    bm=bmesh.new();n=seg+1;t=[[],[],[],[]]
    for i in range(n):
        an=a0+(a1-a0)*i/seg
        for j,(r,y) in enumerate(((r0,0),(r1,0),(r1,-th),(r0,-th))):t[j].append(bm.verts.new((math.sin(an)*r,y,math.cos(an)*r)))
    for i in range(seg):
        for j in range(4):
            q=(t[j][i],t[j][i+1],t[(j+1)%4][i+1],t[(j+1)%4][i]);bm.faces.new(q)
    bm.faces.new([t[0][0],t[1][0],t[2][0],t[3][0]]);bm.faces.new([t[3][-1],t[2][-1],t[1][-1],t[0][-1]])
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);return from_bm(bm,'wedge',m,smooth=30)
ri,ro=L['colR']-.05,L['stairR']
t=0.;count=0;posts=[]
while t<te-.02:
    land=any(abs(t+da/2-s['theta'])<L['landing']/2+da/2 for s in stops)
    if not land:
        y=H(t+da/2)
        ST('tread',wedge(t,t+da*1.04,ri,ro,.34,sto),(0,y,0))
        ST('nosing',wedge(t+da*.985,t+da*1.04,ri+.12,ro-.02,.05,br),(0,y+.03,0))
        ST('riser',wedge(t+da*.86,t+da*.99,ri,ro-.1,L['pitch']/L['treads']-.3,dk),(0,y-.3,0))
        posts.append(t+da/2)
    t+=da
for s in stops:
    a0=s['theta']-L['landing']/2;a1=s['theta']+L['landing']/2
    ST('landing',wedge(a0,a1,ri,ro+.1,.42,ter,seg=16),(0,s['y'],0))
    ST('landingedge',wedge(a0,a1,ro+.02,ro+.16,.5,br,seg=16),(0,s['y']+.04,0))
# helical stringer and handrail, with a gap where each bridge leaves the stair
gapA=math.asin(L['bridgeW']/2/ro)+.03
def inGap(th):return any(abs(th-s['theta'])<gapA for s in stops)
def runs():
    th=0.;out=[];cur=[]
    while th<te:
        if inGap(th):
            if cur:out.append(cur);cur=[]
        else:cur.append(th)
        th+=.09
    if cur:out.append(cur)
    return out
for run in runs():
    ST('rail',tube([AT(th,ro-.1,H(th)+L['railH']) for th in run],.09,wood,seg=8,res=1))
    ST('rail2',tube([AT(th,ro-.1,H(th)+L['railH']*.52) for th in run],.03,br,seg=6,res=1))
    ST('stringer',tube([AT(th,ro+.02,H(th)-.32) for th in run],.17,dk,seg=8,res=1))
    for e in (run[0],run[-1]):
        y=H(e);ST('newel',lathe([(.17,0),(.17,.2),(.1,.3),(.09,L['railH']-.3),(.15,L['railH']-.2),(.15,L['railH']-.06),(.08,L['railH']+.02),(0,L['railH']+.06)],br,seg=14),AT(e,ro-.1,y))
for th in posts:
    if not inGap(th):
        y=H(th);ST('baluster',cyl(.035,L['railH']+.28,dk,seg=8),AT(th,ro-.1,y+(L['railH']-.28)/2),Yr)
# inner hand line on the column, brass on brackets
ST('colrail',tube([AT(th,L['colR']+.34,H(th)+2.7) for th in [i*.12 for i in range(int(te/.12))] if not inGap(th)],.05,br,seg=6,res=1)) if False else None
# top deck: where the door opens onto the stair
ST('topdeck',wedge(-PI*.55,.02,ri,ro+.1,.42,ter,seg=24),(0,0,0))
ST('topdeckrail',tube([AT(th,ro-.1,L['railH']) for th in [-PI*.55+i*.1 for i in range(18)]],.09,wood,seg=8,res=1))
for i in range(9):
    th=-PI*.55+i*.2;ST('baluster',cyl(.035,L['railH'],dk,seg=8),AT(th,ro-.1,L['railH']/2),Yr)
# ---- lanterns on the shaft wall, spaced down the helix ----
def lantern(th,y):
    p=Vector(AT(th,R-.9,y));o=Vector(AT(th,R-.05,y+.7))
    SH('lbracket',tube([o,Vector(AT(th,R-.45,y+1.0)),Vector(AT(th,R-.9,y+.75))],.05,br,seg=6,res=4))
    SH('lcap',lathe([(0,.5),(.1,.48),(.32,.32),(.34,.28),(.05,.26)],br,seg=8),tuple(p+Vector((0,.1,0))))
    SH('lbody',lathe([(.26,.3),(.3,-.1),(.2,-.46),(.1,-.54),(0,-.56)],M('lantern_glass','#ffcf96',.4,emit='#ffcf96',emit_str=5,glow=1),seg=8),tuple(p))
    for i in range(4):
        an=i*TAU/4+th;SH('lrib',cyl(.018,.86,br,seg=5),tuple(p+Vector((math.sin(an)*.29,-.1,math.cos(an)*.29))),Yr)
lant=[]
th=1.2
while th<te:
    y=H(th)+4.8
    if all(abs(((th-s['theta']+PI)%TAU)-PI)>.9 or abs(y-s['y'])>10 for s in stops):lantern(th,y);lant.append(AT(th,R-1.2,y))
    th+=2.35
json.dump(lant,open(OUT+'_lanterns.json','w'))
import stops_build
stops_build.build(L,RE,S,M,dict(zel=zel,pl=pl,plf=plf,ter=ter,sto=sto,br=br,dk=dk,st=st,wood=wood,wd=wd,cr=cr,en=en,rb=rb,bk=bk,pr=pr,paper=plain,terra=terra,glow=glow))
print('objects',len(bpy.data.objects),'tris',tris_of())
join()
print('joined',len(bpy.data.objects),'tris',tris_of())
bpy.ops.wm.save_as_mainfile(filepath=OUT+'.blend')
