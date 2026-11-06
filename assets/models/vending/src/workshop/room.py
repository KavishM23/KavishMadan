"""The workshop: shell, bench, wall displays, storage and the small objects that make it lived in.
Real scale: one page unit is about 30 cm. Project images and rib outlines are the real ones."""
from kit import *
import random
from mathutils import Vector
def build(G,RE,parts):
    random.seed(21)
    S0=lambda n,me,loc=(0,0,0),rot=(0,0,0),scale=None:S(n,me,loc,rot,'shell',None,scale)
    P=lambda n,me,loc=(0,0,0),rot=(0,0,0),scale=None:S(n,me,loc,rot,'props',None,scale)
    brick=M('wall_brick','#b9b2a6',.8,tex='brick',tile=4);dado=M('wall_dado','#a35f42',.5,tex='enamel',tile=3)
    conc=M('floor','#ffffff',.5,tex='concrete',tile=9);joint=M('joint','#2c2a27',.8)
    boards=M('ceiling_boards','#ffffff',.8,tex='boards',tile=4);beam=M('beam','#23323a',.5,.3)
    wood=M('wood','#ffffff',.55,tex='wood',tile=3);woodd=M('wood_dark','#6e4a2e',.6,tex='wood',tile=3);trim=M('trim','#ded2b6',.5)
    en=M('enamel_blue');en2=M('enamel_deep');cr=M('enamel_cream');br=M('brass_brushed');st=M('steel_brushed');dk=M('steel_dark');rb=M('rubber_black');bk=M('plastic_black');pr=M('prints')
    peg=M('peg','#ffffff',.65,tex='peg',tile=.68);cork=M('cork','#ffffff',.8,tex='cork',tile=2.5);card=M('card','#ffffff',.8,tex='card',tile=1.6);mt=M('mat','#ffffff',.8,tex='mat',tile=2.4)
    acr=M('acrylic_orange','#ff4a0e',.22,emit='#ff3a00',emit_str=.15);tp=M('tyre_black','#17191a',.86);paper=M('paper','#efe6d2',.7);terr=M('terracotta','#a4694a',.6);sage=M('sage','#6f8a78',.5);red=M('wire_red','#8a2f22',.5);blu=M('wire_blue','#2f5a70',.5);pcb=M('pcb','#14527a',.4);pcbg=M('pcbg','#1f5a44',.4);gold=M('gold','#c9a65a',.35,1);glassj=M('jar_glass','#b9cfc9',.15,0)
    XL,XR,ZB,YC=-8.2,8.5,-1.6,8.8;ZF=21
    # ---- shell ----
    S0('floor',box(XR-XL+.4,.02,ZF-ZB,conc),((XL+XR)/2,-.01,(ZB+ZF)/2))
    for z in (2.6,8.6,14.6):S0('joint',box(XR-XL,.006,.03,joint),((XL+XR)/2,.004,z))
    for x in (-5,1,7):S0('joint',box(.03,.006,ZF-ZB,joint),(x,.004,(ZB+ZF)/2))
    wall=lambda n,w,h,c,rot,m:S0(n,box(w,h,.12,m),c,rot)
    wall('back',XR-XL,YC-2.5,((XL+XR)/2,(YC+2.5)/2,ZB-.06),(0,0,0),brick)
    wall('backd',XR-XL,2.5,((XL+XR)/2,1.25,ZB-.06),(0,0,0),dado)
    wall('right',ZF-ZB,YC-2.5,(XR+.06,(YC+2.5)/2,(ZB+ZF)/2),(0,math.pi/2,0),brick)
    wall('rightd',ZF-ZB,2.5,(XR+.06,1.25,(ZB+ZF)/2),(0,math.pi/2,0),dado)
    # left wall, cut for a tall steel window
    wn=(-.2,3.4,7.4,7.9)
    me=panel(rect(ZB-.06,2.5,ZF,YC),.12,brick,holes=[rect(*wn)],bevel=0);S0('left',me,(XL-.06,0,0),(0,-math.pi/2,0))
    wall('leftd',ZF-ZB,2.5,(XL-.06,1.25,(ZB+ZF)/2),(0,math.pi/2,0),dado)
    for a,b,c,d in ((wn[0],wn[1],wn[2],wn[1]+.09),(wn[0],wn[3]-.09,wn[2],wn[3]),(wn[0],wn[1],wn[0]+.09,wn[3]),(wn[2]-.09,wn[1],wn[2],wn[3])):
        S0('winframe',box(.14,d-b,c-a,dk),(XL-.02,(b+d)/2,(a+c)/2))
    for i in range(1,6):S0('mullion',box(.07,wn[3]-wn[1],.05,dk),(XL-.03,(wn[1]+wn[3])/2,wn[0]+(wn[2]-wn[0])*i/6))
    for i in range(1,5):S0('mullion',box(.07,.05,wn[2]-wn[0],dk),(XL-.03,wn[1]+(wn[3]-wn[1])*i/5,(wn[0]+wn[2])/2))
    S0('sill',box(.3,.1,wn[2]-wn[0]+.3,cr),(XL+.1,wn[1]-.04,(wn[0]+wn[2])/2))
    S0('dusk',box(.02,wn[3]-wn[1]+.4,wn[2]-wn[0]+.4,M('dusk_sky','#ffffff',.5,emit='#6fa4cf',emit_str=.62,glow=0)),(XL-.9,(wn[1]+wn[3])/2,(wn[0]+wn[2])/2))
    S0('ceiling',box(XR-XL+.4,.1,ZF-ZB,boards),((XL+XR)/2,YC+.05,(ZB+ZF)/2))
    for z in (.6,6.6,12.6,18.6):
        S0('ibeam',box(XR-XL,.05,.34,beam),((XL+XR)/2,YC-.42,z));S0('ibeam',box(XR-XL,.05,.34,beam),((XL+XR)/2,YC-.03,z));S0('ibeam',box(XR-XL,.4,.05,beam),((XL+XR)/2,YC-.22,z))
    for x in (-8.14,8.44):
        for s in (ZB,):pass
    # skirting and rails tie wall to floor and dado to brick
    for n,w,c,rot in (('b',XR-XL,((XL+XR)/2,0,ZB+.03),(0,0,0)),('r',ZF-ZB,(XR-.03,0,(ZB+ZF)/2),(0,math.pi/2,0)),('l',ZF-ZB,(XL+.03,0,(ZB+ZF)/2),(0,math.pi/2,0))):
        S0('skirt',box(w,.26,.06,woodd,bevel=.008),(c[0],.13,c[2]),rot);S0('chair',box(w,.1,.07,woodd,bevel=.012),(c[0],2.5,c[2]),rot)
    # services: conduit along the wall, with boxes and a drop to the machine's socket
    cond=M('conduit','#8d9594',.34,1)
    for y,zz in ((8.0,ZB+.1),(7.8,ZB+.1)):P('conduit',cyl(.05,XR-XL,cond,seg=10),((XL+XR)/2,y,zz),Xr)
    for x in (-6.6,-.4,3.4,7):
        P('junction',box(.42,.42,.16,dk,bevel=.02),(x,7.9,ZB+.1))
        for dx in (-.14,.14):P('jscrew',cyl(.02,.02,st,seg=6),(x+dx,7.9,ZB+.19))
    P('conduit',cyl(.05,7.4,cond,seg=10),(3.4,4.2,ZB+.08),Yr)
    P('socketbox',box(.5,.5,.14,dk,bevel=.02),(3.4,.8,ZB+.08));P('socketface',box(.36,.36,.02,cr,bevel=.004),(3.4,.8,ZB+.16))
    for dx in (-.08,.08):P('socketpin',box(.03,.08,.005,bk),(3.4+dx,.82,ZB+.172))
    P('cable',tube([(2.75,.5,-.95),(3.1,.42,-1.1),(3.3,.14,-1.25),(3.5,.06,-1.1),(3.6,.2,-1.0),(3.4,.8,ZB+.2)],.032,rb,seg=7,res=6))
    P('switch',box(.26,.4,.06,cr,bevel=.01),(-.6,4.3,ZB+.04));P('toggle',box(.06,.14,.05,bk),(-.6,4.3,ZB+.09))
    # ---- workbench ----
    bx0,bx1,zb0,zb1,Bt=-7.8,-1.45,ZB+.06,.72,3.0
    bc=(bx0+bx1)/2;zc=(zb0+zb1)/2
    P('benchtop',box(bx1-bx0,.2,zb1-zb0,wood,bevel=.02,seg=2),(bc,Bt-.1,zc))
    for x in (bx0+.2,(bx0+bx1)/2,bx1-.2):
        for z in (zb0+.14,zb1-.16):P('benchleg',box(.17,Bt-.2,.17,dk,bevel=.012),(x,(Bt-.2)/2,z))
        P('benchrail',box(.1,.14,zb1-zb0-.2,dk,bevel=.01),(x,1.05,zc));P('benchrail',box(.1,.14,zb1-zb0-.2,dk,bevel=.01),(x,Bt-.28,zc))
        for z in (zb0+.14,zb1-.16):P('foot',cyl(.14,.05,rb,seg=12),(x,.025,z),Yr)
    P('benchrail',box(bx1-bx0-.3,.14,.1,dk,bevel=.01),(bc,Bt-.28,zb1-.16));P('benchrail',box(bx1-bx0-.3,.14,.1,dk,bevel=.01),(bc,Bt-.28,zb0+.14))
    P('undershelf',box(bx1-bx0-.34,.1,zb1-zb0-.3,woodd,bevel=.01),(bc,1.18,zc))
    # pedestal of drawers under the bench
    dx0,dx1=-3.95,-1.72
    P('pedestal',box(dx1-dx0,Bt-.42-.25,zb1-zb0-.3,en2,bevel=.015),((dx0+dx1)/2,(Bt-.2+.25)/2-.05,zc-.02))
    for i in range(4):
        y=.6+i*.56;dc=(dx0+dx1)/2
        P('drawer',box(dx1-dx0-.1,.5,.06,en,bevel=.016),(dc,y,zb1-.14))
        P('pull',box(.62,.05,.06,br,bevel=.016),(dc,y+.08,zb1-.08))
        P('labelholder',box(.5,.14,.015,br,bevel=.004),(dc,y-.1,zb1-.1));P('drawerlabel',quad(.44,.1,RE['d'+str(i*2+1)],pr),(dc,y-.1,zb1-.09))
    # shadow board and cork board above the bench
    P('pegframe',panel(rect(-5.2,3.5,-1.8,7.3),.08,woodd,holes=[rect(-5.1,3.6,-1.9,7.2)],bevel=.012),(0,0,ZB+.09))
    P('pegboard',box(3.2,3.6,.03,peg),(-3.5,5.4,ZB+.07))
    z=ZB+.12
    def hook(x,y):P('hook',tube([(x,y+.02,z-.04),(x,y+.02,z+.04),(x,y-.02,z+.07)],.012,st,seg=5,res=3))
    for i,(l,wd) in enumerate(((.9,.11),(.82,.1),(.74,.09),(.66,.08),(.58,.07),(.5,.06))):
        x=-4.85+i*.26;y=6.9-l/2
        P('spanner',panel(spanner(l,wd),.02,M('chrome','#c7cdcf',.24,1),bevel=.004),(x,y,z));hook(x,6.92)
    for i,(c,n) in enumerate((('#1f4152',.72),('#a4412a',.66),('#c5a16c',.6),('#1f4152',.52),('#6f8a78',.46))):
        x=-3.25+i*.2;hm=M('handle'+str(i),c,.4)
        P('driverhandle',lathe([(0,0),(.042,.0),(.05,.05),(.05,.2),(.038,.26),(0,.27)],hm,seg=10,smooth=50),(x,6.72-.27,z));P('drivershaft',cyl(.012,n-.27,M('chrome'),seg=6),(x,6.45-(n-.27)/2,z));hook(x,6.74)
    # pliers, hammer, square, hacksaw
    plh=M('grip','#a4412a',.5)
    for x,o in ((-2.15,1),):
        P('plier',panel([(-.05,0),(.05,0),(.06,.3),(.02,.44),(-.02,.44),(-.06,.3)],.03,M('chrome'),bevel=.004),(x,6.25,z))
        for s in (-1,1):P('plierhandle',tube([(x+s*.04,6.3,z),(x+s*.07,6.05,z),(x+s*.1,5.7,z)],.026,plh,seg=6,res=4))
        hook(x,6.72)
    P('hammerhead',box(.34,.12,.12,st,bevel=.02),(-4.5,5.52,z));P('hammershaft',lathe([(0,0),(.04,0),(.05,.1),(.036,.2),(.036,.72),(0,.73)],wood,seg=10),(-4.5,4.76,z));hook(-4.4,5.6);hook(-4.6,5.6)
    P('square',panel([(0,0),(1.0,0),(1.0,.12),(.12,.12),(.12,.7),(0,.7)],.012,M('chrome'),bevel=.002),(-4.0,4.9,z))
    hook(-3.9,5.6)
    saw=[(-.62,0),(-.62,.3),(.62,.3),(.62,0)]
    P('sawframe',tube([(-.62,4.3,z),(-.62,4.62,z),(.62,4.62,z),(.62,4.3,z)],.016,en2,seg=6,res=4),(0,0,0)) if False else None
    P('sawframe',panel([(-.62,0),(-.62,.34),(.62,.34),(.62,0),(.58,0),(.58,.3),(-.58,.3),(-.58,0)],.03,en2,bevel=.004),(-2.95,4.28,z));P('sawblade',box(1.2,.05,.006,st),(-2.95,4.3,z));hook(-3.3,4.64);hook(-2.6,4.64)
    P('sawgrip',lathe([(0,0),(.05,0),(.055,.2),(.04,.26),(0,.27)],M('handle1'),seg=10),(-2.28,4.14,z))
    # coils of wire and tape on hooks, a clamp
    for x,y,c in ((-3.1,5.25,'wire_red'),(-2.72,5.25,'wire_blue')):
        for k in range(4):P('wirecoil',torus(.15-.008*k,.012,M(c),seg=22,sides=5),(x,y-.01*k,z+.012*k));
        hook(x,y+.14)
    P('tape',lathe([(.14,0),(.2,0),(.2,.1),(.14,.1),(.14,0)],M('tape_cream','#ddcfaa',.5),seg=22),(-2.2,5.3,z-.02),(math.pi/2,0,0));hook(-2.2,5.46)
    P('clamp',panel([(0,0),(.08,0),(.08,.6),(.34,.6),(.34,.52),(.42,.52),(.42,.68),(0,.68)],.04,en,bevel=.006),(-2.65,3.95-.02+.0,z)) if False else None
    # shop light hood across the top of the board
    P('hood',panel([(0,0),(.4,0),(.5,-.12),(.42,-.16),(.34,-.06),(0,-.06)],6.0,dk,bevel=.006),(-4.65,7.55,0),(0,-math.pi/2,0));o=None
    P('hoodtube',cyl(.04,5.6,M('led_warm'),seg=10),(-4.65,7.47,ZB+.22),Xr)
    for x in (-7,-2.4):P('hoodarm',box(.05,.05,.3,dk),(x,7.56,ZB+.05))
    # cork board: drawings and project pictures, slightly off square
    P('corkframe',panel(rect(-7.75,3.6,-5.35,6.35),.08,woodd,holes=[rect(-7.67,3.68,-5.43,6.27)],bevel=.012),(0,0,ZB+.09));P('cork',box(2.3,2.65,.03,cork),(-6.55,4.98,ZB+.07))
    pins=[('sketch',-7.0,5.72,1.0,.75,.03),('aerofoil',-5.95,5.72,.86,.47,-.04),('orbit',-6.1,4.85,.76,.76,.06),('ribdraw',-7.05,4.7,1.05,.34,-.02),('wiring',-7.05,4.14,.72,.54,.05),('plan',-5.98,4.12,.76,.49,-.03)]
    for k,x,y,w,h,a in pins:
        P('pin_paper',quad(w,h,RE[k],pr),(x,y,ZB+.1),(0,0,a));P('pin',sphere(.03,M('pin_red','#a4412a',.4),seg=8,ring=6),(x,y+h/2-.05,ZB+.12))
    # vise bolted to the bench end
    vx=-7.1
    P('visebase',box(.7,.14,.5,en,bevel=.03),(vx,Bt+.07,.2));P('visejaw',box(.6,.34,.14,en,bevel=.03),(vx,Bt+.3,.05));P('visejaw',box(.6,.34,.14,en,bevel=.03),(vx,Bt+.3,.4));P('visescrew',cyl(.035,.9,st,seg=10),(vx,Bt+.24,.7));P('visebar',cyl(.02,.5,st,seg=8),(vx,Bt+.24,1.03),Xr)
    # cutting mat, sketch, pencil and steel rule
    P('cutmat',box(2.1,.015,1.4,M('mat_green','#2c4a4e',.6),bevel=.004),(-4.6,Bt+.008,-.1))
    P('sheet',quad(1.28,.96,RE['sketch'],pr),(-4.9,Bt+.02,-.05),(-math.pi/2,0,.08))
    P('pencil',cyl(.01,.54,M('sign_yellow','#d9a520',.4),seg=6),(-4.25,Bt+.03,.15),(0,.5,0));P('rule',box(1.0,.006,.08,M('chrome'),seg=1),(-4.35,Bt+.022,-.58),(0,.03,0))
    # real rib offcuts: outlines from the CAD slice, in the orange acrylic
    s=1/30
    rib=[r for r in parts['ribs'] if r['rib']==9][:1]+[r for r in parts['ribs'] if r['rib']==11][:1]+[r for r in parts['ribs'] if r['rib']==4][:1]
    for i,r in enumerate(rib):
        out=[((p[0]-17)*s,(p[1]-5.5)*s) for p in r['outer']];hl=[[((p[0]-17)*s,(p[1]-5.5)*s) for p in h] for h in r['holes']]
        P('rib',poly_mesh([{'outer':out,'holes':hl}],.01,'rib',acr),(-2.9+i*.07,Bt+.016+i*.012,-.45+i*.18),(-math.pi/2,0,.4-i*.2))
    # offcut stack of material samples
    for i,(m_,w) in enumerate(((acr,.5),(M('hips','#18191b',.6),.56),(M('pla_cream','#e0d3b8',.5),.46),(acr,.34))):
        P('sample',box(w,.02,w*.8,m_,bevel=.003),(-3.05,Bt+.012+i*.022,.42),(0,.2*i,0))
    # the real Strata wheel, tyre on rim, leaning at the back of the bench
    tt=read_stl(os.path.expanduser('~/Downloads/Tire1.stl'),.1);tt=tt[tt[:,:,0].min(1)>-15.5];tc=(tt.reshape(-1,3).min(0)+tt.reshape(-1,3).max(0))/2
    tm=stl_mesh((tt-tc)*s,'tyre',tp,decimate=.02,smooth=48)
    rt=read_stl(os.path.join(os.path.dirname(__file__),'..','strata_rim.stl'),.1);rc=(rt.reshape(-1,3).min(0)+rt.reshape(-1,3).max(0))/2
    rm=stl_mesh((rt-rc)*s,'rim',M('rim_black','#101214',.42),decimate=.5,smooth=34)
    S('tyre',tm,(-5.95,Bt+.183,-1.28),(math.pi/2+.18,0,0),'props');S('rim',rm,(-5.95,Bt+.183,-1.28),(math.pi/2+.18,0,0),'props')
    S('tyre2',tm,(-5.35,Bt+.083,-.95),(0,0,0),'props')
    # electronics corner: Arduino on a mat, breadboard, leads, soldering station
    P('esdmat',box(1.3,.012,.9,M('esd_blue','#335e78',.7),bevel=.003),(-6.2,Bt+.007,.25-.0)) if False else None
    ax,az=-5.65,.3
    P('arduinopcb',box(.23,.012,.18,pcb,seg=1),(ax,Bt+.05,az));P('ard_leg',cyl(.008,.04,st,seg=6),(ax-.09,Bt+.02,az+.07),Yr);P('ard_leg',cyl(.008,.04,st,seg=6),(ax+.09,Bt+.02,az-.07),Yr);P('ard_leg',cyl(.008,.04,st,seg=6),(ax+.09,Bt+.02,az+.07),Yr);P('ard_leg',cyl(.008,.04,st,seg=6),(ax-.09,Bt+.02,az-.07),Yr)
    P('ard_chip',box(.11,.012,.025,bk,seg=1),(ax+.02,Bt+.064,az));P('ard_usb',box(.04,.035,.04,st,seg=1),(ax-.11,Bt+.075,az-.04))
    P('breadboard',box(.56,.028,.18,M('board_cream','#e8e0cc',.5),bevel=.004),(ax+.1,Bt+.014,az+.3))
    for k,(c,bend) in enumerate((('wire_red',.05),('wire_blue',.07),('sign_yellow',.04))):
        P('jumper',tube([(ax+.05*k,Bt+.07,az+.08),(ax+.05*k+.04,Bt+.07+bend,az+.18),(ax+.1*k,Bt+.03,az+.3)],.006,M(c),seg=4,res=4))
    P('solderbase',box(.6,.26,.4,en2,bevel=.03),(-6.9,Bt+.13,.72-.4));P('solderdial',cyl(.07,.03,br,seg=14),(-6.9,Bt+.15,.54));P('solderdisp',box(.26,.09,.012,M('led_red','#ffffff',.5,emit='#ff5a2a',emit_str=2.2,glow=1)),(-6.9,Bt+.2,.527))
    P('solderstand',tube([(-6.3,Bt+.02,.3),(-6.32,Bt+.2,.3),(-6.2,Bt+.3,.34)],.02,st,seg=5,res=3));P('solderiron',cyl(.022,.6,M('handle1'),seg=8),(-6.1,Bt+.33,.26),(.2,0,1.1))
    P('solderlead',tube([(-6.6,Bt+.1,.32),(-6.5,Bt+.05,.5),(-6.1,Bt+.05,.56),(-5.85,Bt+.3,.42)],.012,rb,seg=4,res=4))
    # jars of fixings, mug of pencils, wing rib template, wire spool
    for i,x in enumerate((-2.0,-2.26,-2.52)):
        P('jar',lathe([(0,0),(.09,0),(.1,.02),(.1,.2),(.08,.22),(.08,.25),(0,.25)],glassj,seg=14),(x,Bt,-1.2))
        P('jarlid',cyl(.09,.04,br,seg=14),(x,Bt+.27,-1.2),Yr);P('jarfill',cyl(.08,.09+.03*i,st,seg=12),(x,Bt+.06+.015*i,-1.2),Yr)
    P('mug',lathe([(0,0),(.1,0),(.11,.02),(.11,.26),(.1,.26),(.095,.03),(0,.03)],M('mug_cream','#e0d4ba',.32),seg=18),(-1.95,Bt,.4));P('mughandle',torus(.06,.012,M('mug_cream'),seg=12,sides=6),(-1.83,Bt+.14,.4),(0,0,0))
    for i,a in enumerate((.1,-.14,.2)):P('pencil',cyl(.009,.4,M(['sign_yellow','wire_blue','terracotta'][i]),seg=6),(-1.95+i*.02,Bt+.26,.4),(math.pi/2+a,.1,0))
    P('spool',lathe([(.06,0),(.2,0),(.2,.03),(.11,.03),(.11,.25),(.2,.25),(.2,.28),(.06,.28)],M('board_cream'),seg=20),(-2.45,Bt,.25));P('spoolwire',cyl(.15,.22,M('wire_red'),seg=20),(-2.45,Bt+.14,.25),Yr)
    P('lampbase',cyl(.17,.04,en2,seg=18),(-3.4,Bt+.02,-1.05),Yr)
    P('lamparm',tube([(-3.4,Bt+.02,-1.05),(-3.6,Bt+.7,-1.0),(-3.2,Bt+1.2,-.75)],.018,dk,seg=6,res=2));P('lampshade',lathe([(0,.1),(.06,.1),(.17,-.1),(.16,-.1),(.05,.08),(0,.08)],en,seg=16),(-3.2,Bt+1.2,-.6),(.5,0,0))
    P('lampbulb',sphere(.055,M('bulb','#ffffff',.5,emit='#ffd9a0',emit_str=9,glow=1),seg=10,ring=6),(-3.2,Bt+1.14,-.54))
    # bench underside storage
    for i,x in enumerate((-7.2,-6.2,-5.2)):
        P('crate',box(.85,.6,.95,card,bevel=.012),(x,1.53,zc+.1));P('crateflap',box(.85,.012,.45,card),(x,1.84,zc+.3))
        P('cratelabel',quad(.5,.24,RE['c'+str(i)],pr),(x,1.53,zc+.585))
    # ---- shelving, right of the machine ----
    sx0,sx1,sz0,sz1=3.72,8.3,ZB+.06,-.3
    levels=(.62,1.95,3.28,4.6)
    for x in (sx0+.05,(sx0+sx1)/2,sx1-.05):
        for z in (sz0+.05,sz1-.05):
            P('upright',box(.09,4.85,.09,dk,bevel=.006),(x,2.42,z))
            for i in range(0,24):P('uslot',box(.04,.05,.092,bk,seg=1),(x,.3+i*.19,z))
        P('uprightfoot',box(.2,.04,sz1-sz0+.1,dk,bevel=.006),(x,.02,(sz0+sz1)/2))
    for y in levels:
        P('board',box(sx1-sx0-.02,.1,sz1-sz0,wood,bevel=.012),((sx0+sx1)/2,y,(sz0+sz1)/2))
        P('boardedge',box(sx1-sx0-.02,.13,.02,dk,bevel=.004),((sx0+sx1)/2,y,sz1+.01))
    fz=sz1-.42;t=lambda i:levels[i]+.05
    # level 0: heavy boxes and filament cartons
    for i,x in enumerate((4.3,5.5,6.7,7.8)):
        P('carton',box(1.0,.95,.95,card,bevel=.012),(x,t(0)+.475,fz-.1),(0,random.uniform(-.06,.06),0))
        P('tape',box(.14,.96,.97,M('tape_cream'),seg=1),(x,t(0)+.476,fz-.1))
        if i<3:P('cartonlabel',quad(.5,.24,RE['c'+str(i+1)],pr),(x+.24,t(0)+.55,fz+.385))
    # level 1: small-parts drawers and paint
    cx,cy=4.7,t(1)
    P('partscab',box(1.56,.95,.6,en,bevel=.015),(cx,cy+.475,fz-.1))
    for i in range(12):
        col=i%3;row=i//3;px=cx-.5+col*.5;py=cy+.8-row*.22
        P('partsdrawer',box(.46,.19,.03,M('board_cream'),bevel=.008),(px,py,fz+.215));P('partslabel',quad(.34,.1,RE['d'+str(i)],pr),(px,py+.01,fz+.232));P('partspull',box(.12,.02,.03,dk),(px,py-.06,fz+.24))
    for i,(x,c) in enumerate(((6.0,'enamel_blue'),(6.5,'terracotta'),(7.0,'sage'),(7.55,'brass_brushed'))):
        h=.5+.08*(i%2);P('can',cyl(.21,h,M(c),seg=20,bevel=.008),(x,cy+h/2,fz),Yr);P('canrim',torus(.2,.012,st,seg=20,sides=5),(x,cy+h,fz),(math.pi/2,0,0));P('canhandle',tube([(x-.2,cy+h-.02,fz),(x,cy+h+.2,fz+.02),(x+.2,cy+h-.02,fz)],.008,st,seg=4,res=4))
    # level 2: 3D printer with a filament spool, project binders
    px,py=4.85,t(2)
    P('printerbase',box(1.7,.14,.9,en2,bevel=.02),(px,py+.07,fz-.1))
    for sx in (-.8,.8):
        for sz in (-.38,.38):P('printerpost',box(.05,1.0,.05,dk,bevel=.006),(px+sx,py+.6,fz-.1+sz))
    P('printertop',box(1.7,.1,.9,en2,bevel=.02),(px,py+1.1,fz-.1));P('printerbed',box(1.1,.03,.7,M('hips'),bevel=.004),(px,py+.3,fz-.1));P('printerrail',cyl(.018,1.5,st,seg=8),(px,py+.8,fz+.05),Xr);P('printerhead',box(.24,.26,.2,M('board_cream'),bevel=.02),(px+.2,py+.75,fz+.05));P('printernozzle',cyl(.03,.09,br,seg=8,r2=.01),(px+.2,py+.58,fz+.05),(-math.pi/2,0,0))
    P('printwork',lathe([(0,0),(.24,0),(.24,.1),(.16,.1),(.16,0)],tp,seg=22),(px-.1,py+.32,fz-.1))
    P('printerlabel',quad(.5,.11,RE['lab1'],pr),(px,py+.07,fz+.355))
    P('filament',lathe([(.1,0),(.32,0),(.32,.03),(.28,.03),(.28,.2),(.32,.2),(.32,.23),(.1,.23)],M('tape_cream'),seg=24),(px+1.25,py+.34,fz),(math.pi/2,0,0));P('filamentwound',cyl(.27,.17,acr,seg=24),(px+1.25,py+.34,fz+.115))
    P('filament',lathe([(.1,0),(.32,0),(.32,.03),(.28,.03),(.28,.2),(.32,.2),(.32,.23),(.1,.23)],M('tape_cream'),seg=24),(px+1.25,py+.34+.0,fz-.34),(math.pi/2,0,0))
    for i in range(6):
        x=6.9+i*.2;P('binder',box(.17,.98,.7,M('binder'+str(i),['#23465a','#a4694a','#d8c39a','#3f6b5e','#7d5f45','#23465a'][i],.5),bevel=.012),(x,py+.49,fz-.1));P('binderspine',quad(.15,.72,RE['b'+str(i)],pr),(x,py+.52,fz+.256))
    # top level: engineering interests, on display
    y4=t(3)
    # desk model of a delta airliner, on a brass stand
    planeY=y4+.5;px=5.0
    P('planestand',lathe([(0,0),(.2,0),(.2,.03),(.03,.05),(.02,.42),(0,.42)],br,seg=16),(px,y4,fz))
    prof=[]
    fus=[]
    for i in range(15):
        t_=i/14;xx=-.75+1.5*t_;rad=.055*min(1,(t_/.2)**.6)*(1-max(0,(t_-.75)/.25)**2*.82)
        fus.append((xx,rad))
    bm=bmesh.new();rings=[]
    for xx,rad in fus:rings.append([bm.verts.new((xx,rad*math.cos(TAU*j/10),rad*math.sin(TAU*j/10))) for j in range(10)])
    for a_,b_ in zip(rings,rings[1:]):
        for j in range(10):bm.faces.new((a_[j],b_[j],b_[(j+1)%10],a_[(j+1)%10]))
    bm.faces.new(rings[0][::-1]);bm.faces.new(rings[-1]);bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    wht=M('plane_white','#ece6d8',.34);P('planebody',from_bm(bm,'body',wht,smooth=60),(px,planeY,fz),(0,.35,.05))
    P('planewing',panel([(-.42,0),(.64,.42),(.64,-.42)],.018,wht,bevel=.002),(px,planeY-.03,fz),(math.pi/2,.0,-.35))
    P('planefin',panel([(.42,0),(.72,.0),(.72,.3)],.016,wht,bevel=.002),(px,planeY,fz),(0,.35,0))
    # small globe, aerofoil section block, and a propeller blade
    gx=6.55
    P('smallglobe',sphere(.34,M('globe_blue','#2a6176',.3),seg=24,ring=14),(gx,y4+.52,fz));P('globearc',torus(.4,.012,br,seg=32,sides=6),(gx,y4+.52,fz),(0,.5,0));P('globebase',lathe([(0,0),(.2,0),(.2,.03),(.04,.06),(.03,.14),(0,.14)],br,seg=14),(gx,y4,fz))
    foil=[(.5*(1-math.cos(math.pi*i/20)),0) for i in range(21)]
    t2=lambda x:5*.09*(.2969*x**.5-.126*x-.3516*x*x+.2843*x**3-.1036*x**4)
    pf=[(x,t2(x)) for x,_ in foil]+[(x,-t2(x)) for x,_ in foil[::-1][1:-1]]
    P('foilblock',panel([((x-.4)*1.1,y*1.1+.26) for x,y in pf],.4,M('foil_blue','#7fa9ba',.4),bevel=.006),(7.6,y4+.0,fz-.1),(0,.6,0))
    P('foilstand',box(.7,.05,.3,dk,bevel=.008),(7.6,y4+.025,fz-.1),(0,.6,0));P('foilpost',cyl(.018,.26,br,seg=8),(7.6,y4+.13,fz-.1),Yr)
    # framed prints above the shelving, hung on the wall
    def framed(k,x,y,w,h,m_=.1):
        P('framewood',panel(rect(-w/2-m_-.06,-h/2-m_-.06,w/2+m_+.06,h/2+m_+.06),.07,woodd,holes=[rect(-w/2-m_,-h/2-m_,w/2+m_,h/2+m_)],bevel=.01),(x,y,ZB+.06))
        P('mount',box(w+2*m_,h+2*m_,.012,M('mount_cream','#efe6d2',.7)),(x,y,ZB+.04));P('print',quad(w,h,RE[k],pr),(x,y,ZB+.052))
    framed('hero',4.95,6.75,2.0,1.333,.09);framed('laser',7.0,7.28,1.1,.825,.07);framed('cad',7.0,6.05,1.1,.825,.07)
    # ---- floor: ribbed mat, tool chest, stool ----
    P('floormat',box(5.6,.03,3.6,mt,bevel=.012),(1.15,.015,4.15))
    chest=(5.75,3.3)
    P('chestbody',box(2.3,2.5,1.25,en2,bevel=.03,seg=2),(chest[0],1.55,chest[1]));P('chesttop',box(2.36,.08,1.3,st,bevel=.02),(chest[0],2.84,chest[1]))
    for i in range(5):
        y=.68+i*.45;P('chestdrawer',box(2.12,.4,.05,en,bevel=.015),(chest[0],y,chest[1]+.65));P('chestpull',box(1.5,.04,.06,br,bevel=.015),(chest[0],y+.11,chest[1]+.68))
    for dx in (-.95,.95):
        for dz in (-.5,.5):
            P('castor',cyl(.15,.1,rb,seg=16),(chest[0]+dx,.15,chest[1]+dz),Xr);P('castorfork',box(.18,.2,.08,dk),(chest[0]+dx,.28,chest[1]+dz))
    P('chestrail',cyl(.03,2.4,st,seg=10),(chest[0],2.1,chest[1]-.72),Xr)
    P('chestbox',box(.9,.3,.5,en,bevel=.02),(chest[0]-.45,3.03,chest[1]-.1));P('chestboxlid',box(.92,.04,.52,st,bevel=.01),(chest[0]-.45,3.19,chest[1]-.1))
    P('chestgauge',cyl(.2,.1,M('wood'),seg=18),(chest[0]+.6,2.93,chest[1]+.2),Yr);P('chestspool',cyl(.17,.26,M('wire_blue'),seg=18),(chest[0]+.62,3.06,chest[1]+.2),Yr)
    st_=(-4.6,2.2)
    P('stoolseat',lathe([(0,0),(.46,0),(.5,.04),(.5,.1),(.46,.13),(0,.13)],wood,seg=24),(st_[0],2.15,st_[1]))
    for a in (0,1,2,3):
        c,s_=math.cos(a*TAU/4+.4),math.sin(a*TAU/4+.4)
        S('stoolleg',cyl(.04,1,dk,seg=8),(0,0,0),(0,0,0),'props').name='x';o=bpy.data.objects['x'];bpy.data.objects.remove(o)
        rod_=Vector((st_[0]+.3*c,2.15,st_[1]+.3*s_)),Vector((st_[0]+.56*c,.0,st_[1]+.56*s_));d_=rod_[1]-rod_[0]
        P('stoolleg',cyl(.04,d_.length,dk,seg=8),(rod_[0]+rod_[1])/2,rot_to(d_))
    P('stoolring',torus(.46,.022,dk,seg=24,sides=6),(st_[0],.8,st_[1]),(math.pi/2,0,0))
    # pendant lamps on cords
    pend=[(-4.4,7.2,.2),(5.8,7.45,.2),(1.15,7.9,5.2)]
    for x,y,z in pend:
        P('cord',cyl(.012,YC-y-.3,rb,seg=6),(x,(YC+y+.3)/2,z),Yr)
        P('shade',lathe([(0,.3),(.08,.3),(.1,.22),(.5,-.1),(.5,-.12),(.46,-.12),(.08,.2),(0,.28)],cr,seg=24),(x,y,z))
        P('bulb',sphere(.1,M('bulb'),seg=12,ring=8),(x,y-.02,z))
    return pend
