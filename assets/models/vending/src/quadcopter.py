"""Representative Arduino quadcopter. No CAD or photographs of the real prototypes exist in the
project files, so this shows the kind of machine described (Arduino, sensors, wiring), not a replica."""
import sys,os
sys.path.insert(0,os.path.dirname(__file__))
from lib import *
a=sys.argv[sys.argv.index('--')+1:];out=a[0];mode=a[1] if len(a)>1 else 'view'
reset()
M=dict(
 cf=mat('carbon','#1b1f22',.38,.15,coat=.4),
 arm=mat('arm_blue','#2f5868',.44,.2),
 plas=mat('plastic_black','#121416',.52),
 bell=mat('motor_bell','#a9b1b4',.26,1),
 st=mat('stator','#6d4a2a',.42,.9),
 steel=mat('steel','#b9bfc2',.28,1),
 cream=mat('prop_cream','#e6dcc4',.42),
 tip=mat('prop_tip','#e8571c',.42),
 brass=mat('brass','#c5a16c',.32,1),
 pcb=mat('pcb_blue','#14527a',.4,.1),
 pcbg=mat('pcb_green','#1f5a44',.42,.1),
 chip=mat('chip_black','#0d0e10',.35),
 hdr=mat('header_gold','#c9a65a',.35,1),
 lipo=mat('lipo_blue','#24404f',.4),
 lab=mat('lipo_label','#d8cdb4',.5),
 shr=mat('heatshrink','#3a3f42',.55),
 strap=mat('strap','#b5462a',.7),
 red=mat('wire_red','#c8201c',.5),blk=mat('wire_black','#0c0c0e',.5),yel=mat('wire_yellow','#d9a520',.5),
 blu=mat('wire_blue','#3f8fb0',.5),wht=mat('wire_white','#d9d6cc',.5),
 rub=mat('rubber','#1a1c1d',.85),
 enamel=mat('enamel_blue','#1d3a48',.34,.1,coat=.5),engr=mat('engraved','#2a2418',.5,.3),
)
L=15.5                      # centre to motor, 310 mm motor-to-motor
H=9.2                       # height of the lower plate above the base
U=2.2                       # plate spacing, keeping the upper plate below the propeller disc
def rr(w,d,r,seg=5):
    p=[]
    for cx,cy,a0 in ((w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)):
        for i in range(seg+1):
            t=math.radians(a0+90*i/seg);p.append((cx+r*math.cos(t),cy+r*math.sin(t)))
    return p
def circ(x,y,r,n=14):return [(x+r*math.cos(TAU*i/n),y+r*math.sin(TAU*i/n)) for i in range(n)]
# Lower plate carries the power wiring; upper plate carries the controller.
oct=[(9.6*math.cos(TAU*(i+.5)/8),9.6*math.sin(TAU*(i+.5)/8)) for i in range(8)]
holes=[circ(6.2*math.cos(TAU*i/8),6.2*math.sin(TAU*i/8),.7) for i in (0,2,4,6)]+[rr(3.2,1.1,.3)]
obj('lowerplate',poly_mesh([{'outer':oct,'holes':holes}],.25,'lowerplate',M['cf'],M['hdr'] if False else M['cf']),None,(0,0,H))
obj('upperplate',poly_mesh([{'outer':rr(12.5,11,1.6),'holes':[circ(x,y,.28) for x in (-5,5) for y in (-4.4,4.4)]}],.22,'upperplate',M['cf'],M['cf']),None,(0,0,H+U))
for x in (-5,5):
    for y in (-4.4,4.4):
        obj('standoff',cyl(.32,U,M['brass'],seg=6),None,(x,y,H+U/2))
        obj('screw',cyl(.28,.16,M['steel'],seg=6),None,(x,y,H+U+.2))
ARM=[(0,-1.25),(3.5,-1.25),(L-2,-.95),(L-.2,-1.5),(L+1.9,-1.5),(L+1.9,1.5),(L-.2,1.5),(L-2,.95),(0,1.25)]
armh=[rr(3,1.2,.3)]
armholes=[]
for x in (6.4,9.2,12):
    armholes.append([(p[0]+x,p[1]) for p in rr(1.8,1.05,.32)])
for i,th in enumerate((45,135,225,315)):
    r=math.radians(th);c,s=math.cos(r),math.sin(r)
    arm=obj('arm',poly_mesh([{'outer':ARM,'holes':armholes+[circ(L+.2,0,.55)]}],.8,'arm',M['arm'],M['arm']),None,(0,0,H+.6),(0,0,r))
    px,py=L*c+.2*c,L*s+.2*s
    mx,my=L*c,L*s
    Z=H+1
    obj('mount',cyl(1.65,.24,M['plas'],seg=28),None,(mx,my,Z+.12))
    for k in range(4):
        t=r+TAU*k/4+TAU/8;obj('screw',cyl(.14,.08,M['steel'],seg=6),None,(mx+1.1*math.cos(t),my+1.1*math.sin(t),Z+.28))
    obj('stator',cyl(1.15,.9,M['st'],seg=20),None,(mx,my,Z+.7))
    obj('base',cyl(1.42,.34,M['plas'],seg=30,bevel=.05),None,(mx,my,Z+.42))
    bell=bmesh.new()
    prof=[(1.42,0),(1.42,1.25),(1.3,1.42),(.5,1.5),(.34,1.72),(0,1.72)]
    n=36;rings=[]
    for j,(rr_,z) in enumerate(prof):
        rg=[bell.verts.new((rr_*math.cos(TAU*q/n),rr_*math.sin(TAU*q/n),z)) for q in range(n)];rings.append(rg)
    for j in range(len(prof)-1):
        for q in range(n):
            # the top of the bell is cut with six vent windows
            if j==2 and q%6 in (1,2,3):continue
            bell.faces.new((rings[j][q],rings[j][(q+1)%n],rings[j+1][(q+1)%n],rings[j+1][q]))
    bell.normal_update()
    ball=obj('bell',from_bm(bell,'bell',M['bell'],smooth=40),None,(mx,my,Z+.62))
    for k in range(9):
        t=TAU*k/9+.2
    obj('ring',torus(1.44,.06,M['brass'],seg=36,sides=6),None,(mx,my,Z+1.75))
    # ESC on the arm under heat-shrink, with motor and power leads
    e=obj('esc',box(3.3,1.45,.55,M['shr'],bevel=.2),None,(6.4*c,6.4*s,H+1.2),(0,0,r))
    obj('esclabel',box(1.5,1.2,.04,M['lab'],seg=1),None,(6.6*c,6.6*s,H+1.48),(0,0,r))
    n1=Vector((-s,c,0))
    for k,mm in zip((-.26,0,.26),(M['blu'],M['blk'],M['yel'])):
        P=lambda d,o,z:(d*c+o*k*n1.x,d*s+o*k*n1.y,z)
        obj('w',tube([P(8,1,H+1.18),P(10.2,1.1,H+1.5),P(12.6,1,H+1.2),P(L-.8,1.4,H+1.45),(mx+k*n1.x*.6,my+k*n1.y*.6,Z+.5)],.055,mm,seg=5),None)
    P=lambda d,o,z:(d*c+o*n1.x,d*s+o*n1.y,z)
    obj('w',tube([P(4.8,.32,H+1.2),P(3.6,.5,H+.9),P(2.4,.6,H+.42),P(1.3,.1,H+.2)],.075,M['red'],seg=5),None)
    obj('w',tube([P(4.8,-.32,H+1.2),P(3.6,-.5,H+.9),P(2.4,-.6,H+.42),P(1.3,-.1,H+.2)],.075,M['blk'],seg=5),None)
    obj('w',tube([P(4.8,0,H+1.5),P(5.4,0,H+2),P(6.8,.2,H+U+.3),P(4.6,.5,H+U+.55),(2*c,2*s,H+U+.55)],.035,M['wht'],seg=4),None)
    # landing leg: a sprung skid under each arm, bolted to the arm
    lg0=Vector((7.8*c,7.8*s,H+.2));lg1=Vector((10.2*c,10.2*s,4.2));lg2=Vector((11.6*c,11.6*s,.55))
    obj('leg',tube([lg0,(lg0+lg1)/2+Vector((.5*c,.5*s,.5)),lg1,lg2],.26,M['cf'],seg=8),None)
    obj('foot',sphere(.62,M['rub'],seg=14,ring=8),None,(lg2.x,lg2.y,.52)).scale=(1,1,.82)
    obj('legclamp',box(1.2,1.2,.5,M['plas'],bevel=.1),None,(lg0.x,lg0.y,H+.08),(0,0,r))
    # propeller: lofted blades with real twist, grouped so the site can spin it
    g=bpy.data.objects.new(f'mover_prop{i}',None);coll().objects.link(g);g.location=(mx,my,Z+2.55);g.empty_display_size=2
    dirn=1 if i%2==0 else -1
    bm=bmesh.new();st=[]
    R=8.6;NS=16;NC=10
    for side in (0,1):
        rings=[]
        for j in range(NS+1):
            t=j/NS;rr_=1.0+(R-1.0)*t
            ch=(.9+1.15*math.sin(min(1,t*2.2)*math.pi/2))*(1-t**3*.62);ch=max(.3,ch)
            tw=math.atan(4.5*2.54/(TAU*rr_))*dirn*(1 if t>.05 else .8)
            th=.2*(1-t*.7)
            rg=[]
            for q in range(NC):
                u=TAU*q/NC;cx=math.cos(u)*ch/2;cz=math.sin(u)*th/2*(1+.45*math.cos(u)*-1)+.05*ch*(1-(math.cos(u))**2)
                x=cx*math.cos(tw);z=cx*math.sin(tw)+cz
                vv=(x,rr_,z) if side==0 else (-x,-rr_,z)
                rg.append(bm.verts.new(vv))
            rings.append(rg)
        for j in range(NS):
            for q in range(NC):
                f=bm.faces.new((rings[j][q],rings[j][(q+1)%NC],rings[j+1][(q+1)%NC],rings[j+1][q]))
                f.material_index=1 if j>=NS-2 else 0
        bm.faces.new(rings[-1])
        for f in list(bm.faces)[-1:]:f.material_index=1
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bl=obj(f'mover_prop{i}_b',from_bm(bm,'blade',[M['cream'],M['tip']],smooth=50),g,(0,0,0),(0,0,r+math.radians(90)))
    obj(f'mover_prop{i}_h',cyl(.95,.62,M['cream'],seg=20,bevel=.08),g,(0,0,-.05))
    obj(f'mover_prop{i}_n',cyl(.42,.68,M['brass'],seg=6,r2=.28),g,(0,0,.5))
# Flight stack on the upper plate: Arduino, gyro, radio, and the sensor bar at the front.
Z=H+U+.11
obj('uno',box(7,5.3,.16,M['pcb'],bevel=.03,seg=1),None,(-.2,0,Z+.42))
for x in (-3.2,3):
    for y in (-2.2,2.2):obj('spacer',cyl(.18,.4,M['plas'],seg=8),None,(x,y,Z+.2))
obj('mcu',box(3.5,.85,.34,M['chip'],bevel=.03,seg=1),None,(.6,.1,Z+.67))
for y,n in ((-2.35,14),(2.35,14)):
    obj('hdr',box(n*.254,.25,.8,M['chip'],seg=1),None,(.1,y,Z+.9))
    for k in range(n):obj('pin',box(.06,.06,.16,M['hdr'],seg=1),None,(.1-(n-1)*.127+k*.254,y,Z+1.34))
obj('usb',box(1.6,1.2,1.05,M['steel'],bevel=.05,seg=1),None,(-3.7,-.9,Z+1.0))
obj('jack',box(1.4,.9,1.05,M['chip'],bevel=.05,seg=1),None,(-3.6,1.5,Z+1.0))
for x,y in ((-1.4,-1.3),(-.7,-1.3)):
    obj('cap',cyl(.3,.5,M['bell'],seg=12),None,(x,y,Z+.75))
obj('imu',box(2.1,1.6,.1,M['pcbg'],bevel=.02,seg=1),None,(1.6,1.3,Z+1.46))
obj('imuchip',box(.5,.5,.1,M['chip'],seg=1),None,(1.6,1.3,Z+1.56))
for x in (.8,2.4):obj('imuleg',cyl(.07,.35,M['hdr'],seg=6),None,(x,.8,Z+1.3))
obj('radio',box(2.4,1.3,.1,M['pcbg'],bevel=.02,seg=1),None,(1.6,-1.2,Z+1.46))
obj('xtal',box(.8,.4,.28,M['bell'],bevel=.05,seg=1),None,(1.2,-1.2,Z+1.64))
for x in (.8,2.4):obj('rleg',cyl(.07,.35,M['hdr'],seg=6),None,(x,-1.7,Z+1.3))
ant=tube([(2.7,-1.4,Z+1.5),(3.5,-2,Z+1.9),(4,-3,Z+3),(4.3,-3.6,Z+4.5)],.035,M['wht'],seg=4);obj('w',ant,None)
# forward sensor bar
sb=obj('sensorbar',box(.14,4.6,2.1,M['pcb'],bevel=.02,seg=1),None,(6.55,0,Z+.95))
for y in (-1.25,1.25):
    obj('sonar',cyl(.8,1.3,M['bell'],seg=24),None,(7.2,y,Z+.95),(0,math.pi/2,0))
    obj('sonarmesh',cyl(.66,.04,M['plas'],seg=24),None,(7.86,y,Z+.95),(0,math.pi/2,0))
obj('bracket',box(1.6,3.6,.2,M['plas'],bevel=.03,seg=1),None,(5.7,0,Z+.08))
# LiPo strapped under the lower plate
obj('lipo',box(10.5,3.9,2.7,M['lipo'],bevel=.3),None,(0,0,H-1.6))
obj('lipolabel',box(5.8,3.96,2.2,M['lab'],bevel=.1,seg=1),None,(.8,0,H-1.6))
for x in (-3.2,3.2):
    s=obj('strap',box(1,4.25,3.05,M['strap'],bevel=.28),None,(x,0,H-1.48))
obj('w',tube([(-5.2,.7,H-1.2),(-6.4,1,H-.6),(-6.6,.7,H+.1),(-5.4,.3,H+.2),(-1.2,.2,H+.2)],.11,M['red'],seg=6),None)
obj('w',tube([(-5.2,-.7,H-1.2),(-6.4,-1,H-.6),(-6.6,-.7,H+.1),(-5.4,-.3,H+.2),(-1.2,-.2,H+.2)],.11,M['blk'],seg=6),None)
# signal bundle up to the Arduino
for k,mm in enumerate((M['yel'],M['wht'],M['blu'])):
    o=-.7+k*.5
    obj('w',tube([(-1,o,H+.2),(-.8,o-1.6,H+1.6),(-3,o-2.2,H+1.5),(-6.9,o,Z-.3),(-5.9,o,Z+.6),(-4,o-1,Z+1.4),(-.7+k*.5,2.35,Z+1.45)],.04,mm,seg=4),None)
plinth(30,30,M['enamel'],M['brass'])
plaque('ANTI-DRONE QUAD','ARDUINO PROTOTYPE / REPRESENTATIVE BUILD',0,-15.09,-.75,M['brass'],M['engr'],w=11.5,h=1.25)
print('objects',len(bpy.data.objects),'tris',tris_of())
if mode in('view',):
    render(out,{'iso':(-.8,-1,.5),'side':(0,-1,.1),'top':(.2,-.3,1),'back':(.9,1,.3)},cx=(0,0,8),dist=112,size=(900,640),samples=20)
if mode=='final':
    join_static(keep=('tyre','mover'));bake_ao(out+'_ao.png',size=1280,skip=('mover',),distance=4)
    bpy.ops.wm.save_as_mainfile(filepath=out+'.blend')
    export(out+'_raw.glb');print('tris final',tris_of())
