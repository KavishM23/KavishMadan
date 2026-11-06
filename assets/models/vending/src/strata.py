"""Project Strata, assembled at real size in centimetres.
From the CAD: rib outlines, rim, tyre. From the deck: 22 slots, 30 mm height cut, plate outline.
Read from photographs (inferred): chassis layout, electronics placement, side frame sizes."""
import sys,json,math,os
sys.path.insert(0,os.path.dirname(__file__))
from lib import *
a=sys.argv[sys.argv.index('--')+1:];parts=json.load(open(a[0]));out=a[1];mode=a[2] if len(a)>2 else 'view'
reset()
M=dict(
 acr=mat('acrylic',  '#ff3a04',.16,0,emit='#ff2c00',emit_str=.1,coat=.6),
 acre=mat('acrylic_edge','#ff5208',.3,0,emit='#ff4200',emit_str=.7),
 hips=mat('hips_black','#16181a',.62),
 alu=mat('alu_orange','#e8571c',.34,.9),
 alu2=mat('alu_dark','#23272a',.42,.8),
 steel=mat('steel','#b9bfc2',.28,1),
 plas=mat('plastic_black','#141618',.55),
 rub=mat('tyre_tpu','#17191a',.86),
 rim=mat('rim_pla','#101214',.42),
 spring=mat('spring_black','#0e0f10',.38,.7),
 batt=mat('battery_wrap','#3f8a55',.42),
 batt2=mat('battery_label','#e0b83a',.5),
 pcb=mat('pcb_blue','#14527a',.4,.1),
 chip=mat('chip_black','#0d0e10',.35),
 hdr=mat('header_gold','#c9a65a',.35,1),
 red=mat('wire_red','#c8201c',.5),
 blk=mat('wire_black','#0c0c0e',.5),
 yel=mat('wire_yellow','#d9a520',.5),
 enamel=mat('enamel_blue','#1d3a48',.34,.1,coat=.5),
 brass=mat('brass','#c5a16c',.32,1),
 engr=mat('engraved','#2a2418',.5,.3),
)
Zp=14.6                       # top of the base plate above ground; total height stays under the 200 mm rule
Xof=lambda y:y-17            # CAD length to car X; the low nose end carries the grille at -X
AX=12.5;RW=5.53;TK=10.5       # half wheelbase, tyre radius, half track
root=None
# Laser-cut ribs, each stood in its own slot.
T=parts['T']
for i,r in enumerate(parts['ribs']):
    outer=[(p[0]-17,p[1]-3.0) for p in r['outer']];holes=[[(p[0]-17,p[1]-3.0) for p in h] for h in r['holes']]
    me=poly_mesh([{'outer':outer,'holes':holes}],T,f'rib{i}',M['acr'],M['acre'])
    obj(f'rib{i}',me,None,(0,r['x'],Zp+.15),(math.pi/2,0,0))
# Base plate. Its local XY is car XY, thickness 3 mm.
pl=[{'outer':[(p[0]-17,p[1]) for p in q['outer']],'holes':[[(p[0]-17,p[1]) for p in h] for h in q['holes']]} for q in parts['plate']]
obj('plate',poly_mesh(pl,.3,'plate',M['hips']),None,(0,0,Zp))
W=parts['W']
# Side frames fold down from the plate at mid-span.
for sgn,name in ((-1,'sideL'),(1,'sideR')):
    o=obj(name,poly_mesh(parts['side'],.3,name,M['hips']),None,(0,sgn*(W/2-.15),Zp+.1),(math.pi/2,0,0))
# Grille under the nose, raked a little as in the photographs.
g=obj('grille',poly_mesh(parts['grille'],.3,'grille',M['hips']),None,(-16.9,0,Zp),(math.pi/2,0,math.pi/2))
g.rotation_euler=(math.radians(78),0,math.pi/2)
gx=lambda z:-16.9-(Zp-z)*math.tan(math.radians(12))
# Solid panel at the tail.
tail=[{'outer':[(-W/2,-5.4),(W/2,-5.4),(W/2,0),(-W/2,0)]}]
o=obj('tail',poly_mesh(tail,.3,'tail',M['hips']),None,(16.9,0,Zp),(math.radians(78),0,-math.pi/2))
# The Strata mark on the grille.
mk=obj('mark',poly_mesh(parts['mark'],.3,'mark',M['acr'],M['acre']),None,(gx(11.6)-.22,1.6,11.6),(math.radians(78),0,-math.pi/2+math.pi))
mk.rotation_euler=(math.radians(78),0,-math.pi/2);mk.scale=(1.75,1.75,1)
# ---- Chassis: read from photographs of the crawler platform ----
def frame_plate():
    from_=[(-7.4,-1.6),(-3.2,-2.5),(3.2,-2.5),(7.4,-1.6),(6.2,2.7),(2.6,1.2),(-2.6,1.2),(-6.2,2.7)]
    holes=[[(-5.5,-1.1),(-2.9,-1.7),(-3.8,.3)],[(5.5,-1.1),(2.9,-1.7),(3.8,.3)],[(-1.9,-1.7),(1.9,-1.7),(0,.25)]]
    return [{'outer':from_,'holes':holes}]
FZ=8.3
for s in (-1,1):
    obj('rail',poly_mesh(frame_plate(),.42,'rail',M['alu'],M['alu']),None,(0,s*3.1,FZ),(math.pi/2,0,0))
    for x,z in ((-6.1,10.5),(6.1,10.5),(-4.5,7.1),(4.5,7.1),(0,6.2)):
        obj('bolt',cyl(.18,.14,M['steel'],seg=6),None,(x,s*3.34,z),(math.pi/2,0,0))
# cross members tie the rails; stand-offs carry the side frames, so nothing hangs in the air
for x,z in ((-5.5,7.2),(5.5,7.2),(-3,10),(3,10)):
    rod((x,-3.1,z),(x,3.1,z),.22,M['alu2'],seg=10)
for x in (-3.1,3.1):
    for z in (Zp-2.45,Zp-5.55):
        rod((x,-W/2+.15,z),(x,W/2-.15,z),.16,M['alu2'],seg=8)
for x in (-3.9,3.9):
    rod((x,-3.1,FZ+.8),(x,-W/2+.1,FZ+.8),.14,M['alu2'],seg=8);rod((x,3.1,FZ+.8),(x,W/2-.1,FZ+.8),.14,M['alu2'],seg=8)
for x in (-6.2,6.2):
    rod((x,-2.9,10.6),(x,-2.9,Zp-.1),.16,M['alu2'],seg=8);rod((x,2.9,10.6),(x,2.9,Zp-.1),.16,M['alu2'],seg=8)
# gearbox and motor
obj('gear',box(4.8,3.2,3.2,M['plas'],bevel=.22),None,(.2,0,7.4))
obj('gearcap',cyl(1.5,.5,M['alu2'],seg=28,bevel=.06),None,(.8,-1.8,7.8),(math.pi/2,0,0))
obj('motor',cyl(1.42,3.8,M['steel'],seg=28,bevel=.06),None,(-.9,0,10.2),(0,math.pi/2,0))
obj('motorcan',cyl(1.46,1.8,M['alu2'],seg=28),None,(-2,0,10.2),(0,math.pi/2,0))
obj('motorend',cyl(.5,.4,M['hdr'],seg=14),None,(-3.1,0,10.2),(0,math.pi/2,0))
# axles and diffs
for s,sx in ((-1,'F'),(1,'R')):
    X=s*AX
    obj('axle',cyl(.62,TK*2-5.5,M['plas'],seg=18),None,(X,0,RW),(math.pi/2,0,0))
    d=obj('diff',sphere(1.85,M['plas'],seg=28,ring=16),None,(X,.9,RW+.1));d.scale=(1,.8,1)
    obj('diffcap',cyl(1.1,.3,M['alu2'],seg=20),None,(X+s*1.55,.9,RW+.1),(0,math.pi/2,0))
    for y in (-1,1):
        kn=obj('knuckle',box(1.3,1.3,3.1,M['plas'],bevel=.2),None,(X,y*7.8,RW))
        rod((X,y*7.7,RW),(X,y*(TK-.8),RW),.42,M['steel'],seg=14)
        obj('shock_mount',box(2.1,.45,2.6,M['alu'],bevel=.08),None,(X-s*.5,y*4.7,RW+1.5))
        obj('link_mount',box(1.5,.6,1.9,M['alu'],bevel=.08),None,(X-s*.3,y*3.1,RW-1.1))
    # driveshaft with joints, running to the gearbox
    a0=Vector((s*2.6,.1,7));a1=Vector((X-s*2,.9,RW+.1))
    rod(a0,a1,.26,M['steel'],seg=12);obj('yoke',cyl(.42,.8,M['alu2'],seg=12),None,a0,rot_to(a1-a0));obj('yoke',cyl(.42,.8,M['alu2'],seg=12),None,a1,rot_to(a1-a0))
    # four-link location and coilovers
    for y in (-1,1):
        p0=Vector((s*5.3,y*3.1,6.9));p1=Vector((X-s*.3,y*3.1,RW-1.5))
        rod(p0,p1,.17,M['steel'],seg=10)
        for q in (p0,p1):obj('rodend',sphere(.34,M['alu'],seg=12,ring=8),None,q)
        p0=Vector((s*6.0,y*1.7,10.2));p1=Vector((X-s*.7,y*1.3,RW+1.7))
        rod(p0,p1,.17,M['alu'],seg=10)
        for q in (p0,p1):obj('rodend',sphere(.3,M['alu2'],seg=12,ring=8),None,q)
        rod((X-s*.7,y*1.3,RW+1.7),(X,y*1.3,RW+.6),.22,M['alu'],seg=8)
        top=Vector((s*5.2,y*3.55,11.5));bot=Vector((X-s*.5,y*4.7,RW+1.7));d=bot-top;c=(top+bot)/2;r=rot_to(d)
        obj('dampbody',cyl(.42,d.length*.62,M['alu'],seg=14),None,top+d*.33,r)
        obj('damprod',cyl(.17,d.length*.5,M['steel'],seg=10),None,top+d*.76,r)
        obj('spring',helix(.72,d.length*.82,7.5,.095,M['spring'],seg=6,step=12),None,c,r)
        for t in (.08,.92):obj('collar',cyl(.8,.16,M['alu'],seg=16),None,top+d*t,r)
        obj('cap',sphere(.34,M['alu'],seg=12,ring=8),None,top);obj('cap',sphere(.34,M['alu'],seg=12,ring=8),None,bot)
# steering at the grille-end axle
rod((-AX-1.4,-7.4,RW-.3),(-AX-1.4,7.4,RW-.3),.15,M['steel'],seg=10)
for y in (-1,1):rod((-AX-1.4,y*7.4,RW-.3),(-AX,y*7.6,RW-.6),.15,M['steel'],seg=8)
sv=obj('servo',box(2.1,1.1,2.1,M['plas'],bevel=.1),None,(-AX+.9,-3.2,RW+2.5))
rod((-AX+.9,-3.2,RW+1.4),(-AX-1.4,-3.2,RW-.3),.13,M['alu'],seg=8)
rod((-AX+.9,-3.2,RW+1.4),(-AX+.9,-3.2,RW+2.3),.1,M['steel'],seg=8)
# tow bar arm under the grille
rod((-11.5,0,9.4),(gx(9.6)+.2,0,9.4),.2,M['alu2'],seg=10)
obj('hook',torus(.42,.09,M['steel'],seg=18,sides=6),None,(gx(9.6)-.1,0,9.0),(math.pi/2,0,0))
# Electronics deck: LiPo, ESC, Arduino and a sensor, wired together
DZ=Zp-3.2
obj('deck',box(11.5,7.2,.18,M['hips'],bevel=.03,seg=1),None,(0,0,12.25))
for x in (-5,5):
    for y in (-3,3):rod((x,y,10.1),(x,y,12.2),.14,M['steel'],seg=8)
obj('lipo',box(7,3.2,1.5,M['batt'],bevel=.28),None,(1.8,1.5,13.05))
obj('lipolabel',box(3.1,3.26,1.2,M['batt2'],bevel=.1,seg=1),None,(2.2,1.5,13.05))
obj('esc',box(3.2,2.5,1.25,M['chip'],bevel=.12),None,(-3.6,1.7,12.95))
for k in range(5):obj('fin',box(2.8,.09,.16,M['alu2'],seg=1),None,(-3.6,.8+k*.46,13.62))
pb=obj('arduino',box(5.8,2.9,.1,M['pcb'],bevel=.02,seg=1),None,(-.8,-2.1,12.55))
obj('atmega',box(2.6,.65,.28,M['chip'],bevel=.03,seg=1),None,(.1,-2.3,12.74))
obj('usb',box(1.1,.9,.8,M['steel'],bevel=.04,seg=1),None,(-3.5,-2.6,12.98))
for y,n in ((-3.35,11),(-.95,9)):
    obj('hdr',box(n*.24,.22,.5,M['chip'],seg=1),None,(-.7,y,12.85))
    for k in range(n):obj('pin',box(.05,.05,.12,M['hdr'],seg=1),None,(-.7-(n-1)*.12+k*.24,y,13.14))
for k,(x,y) in enumerate(((1.4,-1.0),(1.9,-1.0))):obj('cap',cyl(.17,.34,M['alu2'],seg=10),None,(x,y,12.78))
for s,y in ((-1,-.6),(1,.9)):pass
red=M['red'];blk=M['blk'];yel=M['yel']
obj('w',tube([(-1.7,1.5,13.2),(-1,2.9,13.9),(-.1,3.1,13.3),(-1.6,2.4,13.2)],.1,red),None)
obj('w',tube([(-1.7,1.1,13.1),(-.8,.4,13.9),(-.1,.5,13.3),(-1.6,1,13.2)],.1,blk),None)
obj('w',tube([(-5.2,1.9,13),(-6,2.6,12.6),(-4.8,3.4,11.2),(-2.4,1.6,10.2)],.075,red),None)
obj('w',tube([(-5.2,1.5,13),(-6.2,.9,12.5),(-5,-.4,11.2),(-3.1,-.3,10.2)],.075,blk),None)
obj('w',tube([(-3.6,.5,13.2),(-2.8,-.3,13.5),(-2,-1.2,13.1),(-1.8,-1.9,13.05)],.05,yel),None)
obj('w',tube([(-3.4,.5,13.2),(-2.5,-.1,13.3),(-1.2,-.9,13.1),(-1.2,-1.8,13.05)],.05,red),None)
obj('w',tube([(.8,-3.3,13.1),(2.6,-3.5,13.5),(4.5,-3.3,12.9),(6,-4.6,11)],.05,yel),None)
obj('w',tube([(1.2,-3.3,13.1),(3,-3.2,13.4),(4.8,-3.0,12.8),(6.2,-4.2,11)],.05,blk),None)
# ---- Wheels: rim and tyre from the CAD STLs ----
RIM=a[3] if len(a)>3 else '~/Downloads/RimV2.stl'
TY=a[4] if len(a)>4 else '~/Downloads/Tire1.stl'
rt=read_stl(RIM,.1);tt=read_stl(TY,.1)
tt=tt[tt[:,:,0].min(1)>-15.5]
rc=(rt.reshape(-1,3).min(0)+rt.reshape(-1,3).max(0))/2
tc=(tt.reshape(-1,3).min(0)+tt.reshape(-1,3).max(0))/2
print('rim centre',rc,'size',np.ptp(rt.reshape(-1,3),axis=0),'tyre',tc,np.ptp(tt.reshape(-1,3),axis=0),len(tt))
rt=rt-rc;tt=tt-tc
rim_me=stl_mesh(rt,'rim_shared',M['rim'],smooth=34)
ty_me=stl_mesh(tt,'tyre',M['rub'],decimate=(.08 if mode!='draft' else .03),smooth=48)
disc_r=3.45
discp=[{'outer':[(disc_r*math.cos(TAU*i/56),disc_r*math.sin(TAU*i/56)) for i in range(56)]}]
disc_me=poly_mesh(discp,.3,'disc',M['acr'],M['acre'])
mark_w=poly_mesh(parts['mark'],.32,'markw',M['acr'],M['acre'])
for sx in (-1,1):
    for sy in (-1,1):
        p=(sx*AX,sy*TK,RW)
        rz=0 if sy<0 else math.pi
        obj('tyre',ty_me,None,p,(0,0,rz))
        obj('rim_shared',rim_me,None,p,(0,0,rz))
        OUT=sy*(2.72)
        obj('disc',disc_me,None,(p[0],sy*(TK+1.75),RW),(math.pi/2,0,0))
        m=obj('wheelmark',mark_w,None,(p[0],sy*(TK+2.0),RW),(math.pi/2,0,0 if sy>0 else 0));m.scale=(1.9,1.9,1)
        m.rotation_euler=(math.pi/2,0,math.pi if sy>0 else 0) if False else (math.pi/2,0,0)
# ---- Display base ----
plinth(38,31.5,M['enamel'],M['brass'])
obj('pl',bpy.data.meshes.new('x'))
plaque('PROJECT STRATA','4X4 IN SCHOOLS / 2ND IN THE UAE',0,-15.84,-.75,M['brass'],M['engr'],w=11.5,h=1.25)
print('objects',len(bpy.data.objects),'tris',tris_of())
if mode=='view' or mode=='draft':
    render(out,{'iso':(-.8,-1,.42),'side':(0,-1,.04),'hero':(-1,-.55,.16),'back':(.9,1,.5)},cx=(0,0,8.5),dist=125,size=(900,640),samples=20,lens=70)
if mode=='final':
    join_static();bake_ao(out+'_ao.png',size=1536,distance=5)
    bpy.ops.wm.save_as_mainfile(filepath=out+'.blend')
    export(out+'_raw.glb');print('tris final',tris_of())
