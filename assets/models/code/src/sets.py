"""Compact 3D sets that replace the flat monitors on the Code staircase, one per project.
Scene units, origin on the landing, +z facing the camera. The page puts the real screen on each one.
blender -b --python sets.py -- OUT prints.json KEY TEXDIR SHAREDTEX"""
import sys,os,json,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..','..','vending','src','workshop'))
from kit import *
import kit
a=sys.argv[sys.argv.index('--')+1:];OUT,RE,KEY,TX,SH=a[0],json.load(open(a[1])),a[2],a[3],a[4]
start();PI=math.pi
wood=M('wood','#c49a68',.5,tex='wood',tile=1.6);wd=M('wood_dark','#5e3f28',.55)
br=M('brass','#b8945f',.34,1);dk=M('steel_dark','#2c3236',.42,.8);st=M('steel','#a6adae',.32,1);rb=M('rubber_black','#101213',.8);bk=M('plastic_black','#17191b',.5)
pr=M('code_prints','#ffffff',.5,tex='code_prints');paper=M('paper','#efe6d2',.7);terra=M('terra_paint','#a4694a',.5);cream=M('cream','#e6d9bd',.4);glass=M('jar_glass','#c8dcd6',.18)
P=lambda n,me,loc=(0,0,0),rot=(0,0,0),sc=None:S(n,me,loc,rot,'set',None,sc)
def deck(w,fz):
    """Independent landing outside the 3.45 stair radius (set origin at 4.10)."""
    back=-.63
    depth=fz-back
    center=(fz+back)/2
    P('landing slab',box(w,.16,depth,cream,bevel=.027),(0,-.08,center))
    P('landing fascia',box(w-.035,.105,depth-.04,wd,bevel=.014),(0,-.18,center))
    P('landing nosing',box(w-.08,.033,.045,br,bevel=.008),(0,-.105,fz+.008))
    for x in (-w*.35,w*.35):
        P('underside beam',box(.13,.13,depth-.1,dk,bevel=.012),(x,-.25,center))
        heel=Vector_((x,-.77,back+.06))
        toe=Vector_((x,-.28,fz*.72))
        span=toe-heel
        P('triangular brace',cyl(.06,span.length,dk,seg=8),tuple((heel+toe)/2),rot_to(span))
        P('brace back plate',box(.23,.62,.08,dk,bevel=.012),(x,-.49,back+.043))
        for y in (-.28,-.68):
            P('brace bolt',cyl(.036,.018,br,seg=8),(x,y,back+.09))
def Vector_(v):
    from mathutils import Vector;return Vector(v)
def counter(w,top,body,fz):
    h=1.1;d=fz+.5;zc=(fz-.5)/2
    P('top',box(w,.09,d,top,bevel=.02,seg=2),(0,h-.045,zc));P('body',box(w-.14,h-.2,d-.16,body,bevel=.015),(0,(h-.2)/2+.11,zc));P('kick',box(w-.2,.11,d-.22,rb),(0,.055,zc))
    n=3
    for k in range(n):
        x=(k-1)*(w-.14)/n;P('door',box((w-.14)/n-.05,h-.34,.02,body,bevel=.008),(x,.58,fz-.075));P('pull',box(.42,.03,.03,br,bevel=.008),(x,.92,fz-.05))
    return h
def laptop(h,z):
    al=M('laptop_alu','#a9adb0',.36,.9);W,D=2.7,1.75;y=h
    P('lapbase',box(W,.07,D,al,bevel=.03,seg=2),(0,y+.04,z));P('lapkeys',quad(2.24,.98,RE['keys'],pr),(0,y+.078,z-.24),(-PI/2,0,0));P('laptrack',box(.96,.004,.54,M('track','#bcc0c2',.3,.5),seg=1),(0,y+.078,z+.52))
    t=math.radians(16);H=1.75;hz=z-D/2+.02;hy=y+.08
    P('hinge',cyl(.045,W*.9,M('laptop_dark','#232628',.4,.5),seg=10),(0,hy,hz),Xr)
    cy=hy+math.cos(t)*H/2;cz=hz-math.sin(t)*H/2
    P('lid',box(W,H,.055,al,bevel=.022,seg=2),(0,cy,cz),(-t,0,0));P('bezel',box(W-.05,H-.05,.008,M('bezel','#08090a',.3),seg=1),(0,cy+math.sin(t)*.03,cz+math.cos(t)*.03),(-t,0,0))
    q=quad(W-.17,(W-.17)/1.6,(0,0,1,1),M('screen','#ffffff',.5));s=S('mover_screen',q,(0,cy+math.sin(t)*.036,cz+math.cos(t)*.036),(-t,0,0));s['mover']=1
if KEY=='lastbite':
    fz=2.05;deck(5.1,fz);sage=M('sage','#6f8a78',.34);h=counter(4.7,wood,sage,fz);laptop(h,.98)
    # tiled splash with a shelf of jars above the screen
    P('back',box(4.7,2.9,.09,sage,bevel=.012),(0,h+1.4,-.52));P('backtop',box(4.76,.07,.16,br,bevel=.012),(0,h+2.86,-.5))
    P('shelf',box(4.5,.08,.5,wood,bevel=.018),(0,3.06,-.24))
    for x in (-1.8,1.8):P('bracket',panel([(0,0),(.38,0),(0,-.32)],.05,dk,bevel=.006),(x,3.02,-.46),(0,-PI/2,0))
    fills=['#d8c39a','#8a5a2e','#efe6d2','#d8d0c0','#b58a5a','#c8a24a'];labels=[0,1,2,3,4,5]
    for i,x in enumerate((-1.75,-1.05,-.35,.35,1.05,1.75)):
        hh=.5+.07*(i%3);P('jar',lathe([(0,0),(.2,0),(.24,.04),(.24,hh-.07),(.19,hh),(.19,hh+.04),(0,hh+.04)],glass,seg=16),(x,3.1,-.24))
        P('fill',cyl(.2,hh*.74,M('fill'+str(i),fills[i],.7),seg=14),(x,3.13+hh*.37,-.24),Yr);P('lid2',cyl(.2,.07,br,seg=16),(x,3.1+hh+.07,-.24),Yr);P('jarlabel',quad(.3,.18,RE['jar'+str(i)],pr),(x,3.1+hh*.46,0.005))
    # produce crate, bread and milk beside the laptop
    P('crate',box(.72,.3,.72,wood,bevel=.015),(-1.92,h+.15,.95))
    for j in range(6):P('tomato',sphere(.135,M('tomato','#b8392a',.42),seg=12,ring=9),(-2.12+(j%3)*.2,h+.37,.77+(j//3)*.3))
    for j in range(4):P('leaf',sphere(.13,M('leaf','#4f7a42',.6),seg=9,ring=6),(-1.76+(j%2)*.12,h+.42+(j%3)*.02,.75+j*.11),(0,0,0),(1,.55,1))
    P('bread',lathe([(0,0),(.2,.02),(.25,.14),(.2,.25),(0,.29)],M('bread','#b98a4e',.7),seg=14),(1.92,h,1.1),(0,0,0),(1.5,1,.9))
    P('milk',lathe([(0,0),(.12,0),(.12,.42),(.06,.56),(.06,.64),(0,.64)],M('milk','#efe9dc',.3),seg=14),(1.95,h,.42));P('milkcap',cyl(.07,.06,terra,seg=12),(1.95,h+.66,.42),Yr)
    P('note',quad(.5,.66,RE['note'],pr),(2.0,h+1.15,-.47),(0,0,.04));P('magnet',cyl(.05,.02,M('red','#a4412a',.4),seg=10),(2.0,h+1.44,-.45))
elif KEY=='tutortime':
    fz=2.05;deck(5.1,fz);blue=M('study_blue','#23465a',.38);h=counter(4.7,wood,blue,fz);laptop(h,.98)
    # dark panel with the real match formula above the laptop, and a column of books
    P('back',box(4.7,3.0,.09,wd,bevel=.012),(0,h+1.45,-.52))
    P('boardframe',box(3.1,1.2,.07,wd,bevel=.015),(-.72,3.26,-.45));P('board',quad(2.96,1.08,RE['chalk'],pr),(-.72,3.26,-.41))
    P('chalkrail',box(3.0,.05,.12,br,bevel=.01),(-.72,2.64,-.41))
    for y in (1.5,2.3,3.1):
        P('case',box(1.0,.05,.4,wood,bevel=.01),(1.75,y-.04,-.3));P('books',box(.9,.62,.3,M('bookbody','#4a3a30',.7)),(1.75,y+.3,-.3));P('spines',quad(.9,.62,RE['spines'],pr),(1.75,y+.3,-.14))
    P('case',box(1.0,.05,.4,wood,bevel=.01),(1.75,3.9,-.3))
    for x in (1.23,2.27):P('caseside',box(.05,2.46,.42,wood,bevel=.01),(x,2.68,-.3))
    for k,c in enumerate(('#23465a','#a4694a','#d8c39a')):P('deskbook',box(.74-.05*k,.1,.56,M('bk'+str(k),c,.6),bevel=.012),(-1.85,h+.05+k*.105,1.0),(0,.12*k,0))
    P('lampbase',lathe([(0,0),(.2,0),(.2,.04),(.03,.08),(.025,.6),(0,.6)],br,seg=16),(-1.85,h,.2));P('lampshade',cyl(.13,.72,M('banker','#2c5a46',.3),seg=16,bevel=.02),(-1.85,h+.68,.3),Xr,(1,.72,1));P('lampbulb',sphere(.08,M('bulb','#ffe2b0',.4,emit='#ffd9a0',emit_str=3),seg=10,ring=6),(-1.85,h+.58,.3))
    P('tray',box(.7,.06,.56,wd,bevel=.012),(1.92,h+.03,1.05));P('invoice',box(.56,.01,.44,paper,seg=1),(1.92,h+.07,1.05),(0,.07,0));P('mug',lathe([(0,0),(.13,0),(.14,.03),(.14,.3),(.12,.3),(.11,.04),(0,.04)],M('mug','#e0d4ba',.32),seg=16),(1.95,h,.4))
else:
    fz=1.9;deck(5.1,fz);P('tatami',box(4.9,.04,2.4,M('tatami','#b39c64',.7,tex='wood',tile=1.2)),(0,.02,.64))
    side=M('cab_side','#a4412a',.4);c=M('cab_deep','#141a33',.38);blk=M('deck_black','#101214',.42)
    cz=.42;w=3.0;prof=[(1.25,0),(-1.2,0),(-1.2,4.75),(.62,4.75),(.62,3.92),(.35,3.72),(.81,1.84),(1.31,1.64),(1.25,1.55)]
    for s in (-1,1):P('cabside',panel(prof,.1,side,bevel=.02),(s*(w/2+.05),0,cz),(0,-PI/2,0))
    P('cabback',box(w,4.72,.08,c),(0,2.36,cz-1.16));P('cabtop',box(w,.08,1.8,c),(0,4.71,cz-.28));P('cabfront',box(w,1.62,.08,c),(0,.81,cz+1.2));P('kick',box(w,.16,.1,rb),(0,.08,cz+1.22))
    # The cabinet has an opaque monitor pod behind the CRT, a separate
    # enamel control panel below it, and no display artwork under the controls.
    tilt=.2
    screen_y,screen_z=2.78,cz+.62
    normal=Vector_((0,math.sin(tilt),math.cos(tilt)))
    origin=Vector_((0,screen_y,screen_z))
    angle=(-tilt,0,0)
    P('Monitor enclosure',box(w-.045,1.91,1.08,c,bevel=.035),
      tuple(origin-normal*.558),angle)
    P('Monitor bezel',panel(rr(-1.5,-.98,1.5,.98,.05),.08,blk,
      holes=[rr(-1.24,-.76,1.24,.76,.03)],bevel=.01),tuple(origin),angle)
    s=S('mover_screen',quad(2.48,1.52,(0,0,1,1),M('screen','#ffffff',.5)),
        tuple(origin+normal*.005),angle)
    s['mover']=1
    P('Upper monitor baffle',box(w-.08,.20,.42,c,bevel=.012),(0,3.81,cz+.24))
    P('Lower monitor valance',box(w-.06,.11,.21,c,bevel=.01),(0,1.806,cz+.65))
    P('Rear access panel',box(2.65,1.63,.035,blk,bevel=.025),(0,2.74,cz-1.21))
    for y in (3.18,3.26,3.34,3.42):
        P('Rear vent louver',box(1.63,.028,.021,rb,bevel=.005),(0,y,cz-1.235))
    t=.25
    ctrl_y,ctrl_z=1.71,cz+.98
    def D(u,v,lift=0):
        return (u,ctrl_y-v*math.sin(t)+(.041+lift)*math.cos(t),
                  ctrl_z+v*math.cos(t)+(.041+lift)*math.sin(t))
    P('Control deck',box(w,.082,.66,blk,bevel=.016),(0,ctrl_y,ctrl_z),(t,0,0))
    P('Control deck front trim',box(w-.08,.018,.024,side,bevel=.004),D(0,.305,.003),(t,0,0))
    for x in (-1.38,1.38):
        for z in (-.24,.24):
            P('Panel fastener',cyl(.024,.008,st,seg=10),D(x,z,.004),(t-PI/2,0,0))
    q=D(-.86,.03)
    P('Joystick dust washer',cyl(.17,.023,bk,seg=18),D(-.86,.03,.011),(t-PI/2,0,0))
    P('Joystick shaft',cyl(.029,.247,st,seg=12),(q[0],q[1]+.126,q[2]),Yr)
    P('Joystick grip',sphere(.111,M('stick_red','#c9402e',.3),seg=20,ring=12),
      (q[0],q[1]+.255,q[2]))
    for i,(u,v,cc) in enumerate(((.23,-.13,'#d9a520'),(.58,-.13,'#c9402e'),(.93,-.13,'#2f7a8a'),
                                 (.23,.15,'#d9a520'),(.58,.15,'#c9402e'),(.93,.15,'#2f7a8a'))):
        P('Button collar',cyl(.101,.020,rb,seg=16),D(u,v,.01),(t-PI/2,0,0))
        P('Push button',lathe([(0,0),(.085,0),(.085,.035),(.069,.052),(0,.055)],
          M('btn'+str(i%3),cc,.3),seg=18),D(u,v,.013),(t,0,0))
    P('marqueebox',box(w,.72,.2,blk,bevel=.012),(0,4.3,cz+.56));P('marquee',quad(2.8,.56,RE['marquee'],M('marquee_lit','#ffffff',.5,tex='code_prints',emit='#ffffff',emit_str=.5)),(0,4.3,cz+.67))
    P('coin',box(.42,.6,.03,br,bevel=.008),(0,1.0,cz+1.25));P('coinslot',box(.05,.16,.01,rb),(-.09,1.06,cz+1.27));P('coinslot',box(.05,.16,.01,rb),(.09,1.06,cz+1.27))
    # realm cartridges in a rack, and a small training dummy for the Dojo
    P('rack',box(.74,1.5,.3,wd,bevel=.012),(2.05,.77,.05))
    for k in range(10):
        x=1.85+(k%2)*.34;y=.33+(k//2)*.28;P('cart',quad(.24,.25,RE['cart'+str(k)],pr),(x-.0,y,.21))
    dw=M('dummy_wood','#7a5230',.6);P('dummypost',lathe([(.24,0),(.24,.06),(.16,.12),(.16,2.3),(.13,2.42),(0,2.46)],dw,seg=18),(-2.05,0,.2))
    for y,ya in ((1.9,.6),(1.9,-.6),(1.35,.1)):P('dummyarm',cyl(.05,.72,dw,seg=9),(-2.05+math.sin(ya)*.34,y-.05,.2+math.cos(ya)*.34),(.2,ya,0))
print('tris',tris_of())
join()
# real timber and the print atlas in the file; everything else stays a clean material
def image(m,path):
    t=m.node_tree;b=t.nodes['Principled BSDF'];n=t.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(path);uv=t.nodes.new('ShaderNodeUVMap');uv.uv_map='UVMap';t.links.new(uv.outputs[0],n.inputs[0]);t.links.new(n.outputs[0],b.inputs['Base Color'])
    if b.inputs['Emission Strength'].default_value>0:t.links.new(n.outputs[0],b.inputs['Emission Color'])
for m in bpy.data.materials:
    if m.name in('code_prints','marquee_lit'):image(m,TX+'/code_prints.png')
    elif m.name in('wood','tatami'):image(m,SH+'/wood_a.png')
for o in bpy.data.objects:
    if o.type=='MESH' and not o.name.startswith('mover'):
        if 'ao' not in o.data.uv_layers:o.data.uv_layers.new(name='ao')
        o.data.uv_layers.active=o.data.uv_layers['ao']
bake_ao(OUT+'_ao.png',size=1024,skip=('mover',),distance=1.1,samples=48)
for o in bpy.data.objects:
    if o.type=='MESH':o.data.uv_layers.active_index=0
for o in [x for x in bpy.data.objects if x.type!='MESH']:bpy.data.objects.remove(o)
bpy.ops.export_scene.gltf(filepath=OUT+'_raw.glb',export_format='GLB',export_apply=False,export_yup=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_animations=False)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'.blend')
print('exported')
