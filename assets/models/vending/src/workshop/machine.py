"""The project machine: a hollow, fitted cabinet built around the dispense path in builds-lab-layout.js."""
from kit import *
def build(G):
    g=dict(g='machine')
    R0=bpy.data.objects.new('machine_root',None);coll().objects.link(R0);R0.parent=ROOT;R0.location=(G['machineX'],0,0)
    P=lambda n,me,loc=(0,0,0),rot=(0,0,0),scale=None:S(n,me,loc,rot,'machine',R0,scale)
    en=M('enamel_blue','#1f4152',.3,.0,tex='enamel',tile=3);en2=M('enamel_deep','#14303d',.3,.0,tex='enamel',tile=3)
    cr=M('enamel_cream','#e6d9bd',.34,0,tex='enamel',tile=3);ln=M('liner_cream','#ded2b8',.6,0)
    br=M('brass_brushed','#b8945f',.34,1,tex='brushed',tile=2);st=M('steel_brushed','#a6adae',.32,1,tex='brushed',tile=2);dk=M('steel_dark','#2c3236',.4,.9,tex='brushed',tile=2)
    rb=M('rubber_black','#101213',.8);bk=M('plastic_black','#17191b',.5);pk=M('pocket_liner','#1a2428',.7);pr=M('prints','#ffffff',.55,tex='prints')
    F=G['front'];GZ=G['glass'];bL=G['bayL'];bR=G['bayR'];H=G['hatch'];top=G['ceiling'];bT=G['binTop'];L=G['lip'];B=G['back'];RE=json.load(open(sys.argv[sys.argv.index('--')+3]))
    # ---- plinth, feet and shell ----
    P('kick',box(4.3,.2,3,rb,bevel=.02),(0,.14,.68))
    P('basestrip',box(4.44,.06,3.2,st,bevel=.012),(0,.25,.7))
    for x in (-1.9,1.9):
        for z in (-.55,1.95):
            P('foot',cyl(.15,.06,rb,seg=16),(x,.03,z),(math.pi/2,0,0));P('footnut',cyl(.09,.08,st,seg=6),(x,.08,z),(math.pi/2,0,0))
    for x in (-1.5,-.9,-.3,.3,.9,1.5):P('kickslot',box(.42,.05,.02,bk),(x,.14,2.19))
    P('wallL',box(.1,5.45,3.1,en,bevel=.02),(-2.15,2.98,.7))
    P('wallR',box(.1,5.45,3.1,en,bevel=.02),(2.15,2.98,.7))
    P('back',box(4.3,5.45,.1,en2,bevel=.015),(0,2.98,-.8))
    # stiffening ribs and side vents, pressed into the outer skin
    for sx in (-1,1):
        for y in (1.2,2.8,4.4):P('sidebead',box(.03,.06,2.6,en,bevel=.012),(sx*2.21,y,.7))
        for i in range(9):P('sidevent',box(.022,.035,.62,bk),(sx*2.206,4.9+i*.075,-.2))
        for y in (.5,5.45):
            for z in (-.6,.1,.8,1.5):
                b=sphere(.03,st,seg=10,ring=6);o=P('rivet',b,(sx*2.205,y,z));o.scale=(.4,1,1)
    # head: crowned top cap with a lit sign
    P('cap',box(4.48,.09,3.28,en2,bevel=.03,seg=2),(0,6.2,.7))
    P('head',box(4.4,.56,3.2,en2,bevel=.03,seg=2),(0,5.9,.7))
    P('signbezel',panel(rr(-2.02,5.66,2.02,6.12,.05),.06,br,holes=[rr(-1.94,5.72,1.94,6.06,.03)],bevel=.012),(0,0,F+.0))
    P('signbox',box(3.9,.34,.04,bk),(0,5.89,F-.03))
    P('signface',quad(3.86,.32,RE['marquee'],M('sign_face','#ffffff',.5,tex='prints',emit='#fff0d0',emit_str=1.8,glow=1)),(0,5.89,F+.012))
    # selector column: a fixed box beside the door
    P('colface',box(1.2,3.72,.1,en,bevel=.012),(1.6,3.76,F-.08))
    P('colskirt',box(1.2,1.82,.1,en,bevel=.012),(1.6,1.11,F-.06))
    P('fascia',panel(rr(1.1,2.04,2.1,5.54,.05),.05,cr,bevel=.012),(0,0,F))
    # ---- interior, lined and lit ----
    bw=bR-bL;bc=(bL+bR)/2
    P('linerB',box(bw,3.7,.03,ln),(bc,3.72,-.74))
    P('contour',quad(bw-.04,3.56,RE['contour'],pr),(bc,3.74,-.722))
    for x in (bL,bR):P('linerS',box(.03,3.7,3.02,ln),(x,3.72,.72))
    P('ceiling',box(bw+.06,.05,3.02,ln),(bc,top+.075,.72))
    # slotted uprights carry the shelves
    for x,s in ((bL+.05,1),(bR-.05,-1)):
        for z in (-.5,.9):
            P('rail',box(.05,3.5,.13,st,bevel=.006,seg=1),(x,3.75,z))
            for i in range(22):P('railslot',box(.052,.06,.05,bk),(x,2.1+i*.155,z))
    for y0 in G['shelfTops']+[top]:
        Y=y0
        if y0==top:
            P('ceilbar',box(bw-.05,.04,G['lip']-G['back'],st,bevel=.008),(bc,top+.03,(L+B)/2))
            continue
        # the shelf is one folded sheet: a pan with a raised lip
        prof=[(B,Y),(L-.03,Y),(L,Y+.05),(L,Y+.09),(L+.035,Y+.09),(L+.035,Y+.03),(L,Y-.04),(B,Y-.04)]
        o=P('shelf',panel(prof,bw-.1,st,bevel=.006),(bc,0,0),(0,math.pi/2,0));o.rotation_euler=(0,-math.pi/2,0)
        # gussets to the uprights
        for x in (bL+.07,bR-.07):
            P('gusset',panel([(-.3,Y-.04),(.3,Y-.04),(.3,Y-.3)],.03,dk,bevel=.004),(x,0,.2),(0,math.pi/2,0))
            P('gusset',panel([(-.3,Y-.04),(.3,Y-.04),(.3,Y-.3)],.03,dk,bevel=.004),(x,0,1),(0,math.pi/2,0))
        # fence between the two products, and a label rail
        P('fence',panel(rr(B,Y,L-.1,Y+.28,.04),.03,dk,bevel=.005),(G['fenceX'],0,0),(0,-math.pi/2,0))
        P('labelrail',box(bw-.14,.135,.025,br,bevel=.006),(bc,Y-.075,L+.05))
        # warm strip light under each shelf, shining on the row below
        if y0!=G['shelfTops'][-1]:
            P('ledcase',box(bw-.3,.035,.08,dk,bevel=.006),(bc,Y-.06,L-.12))
            P('led',box(bw-.34,.012,.05,M('led_warm','#ffffff',.5,emit='#ffe7bd',emit_str=15,glow=1)),(bc,Y-.083,L-.12))
    P('ledcase',box(bw-.3,.035,.08,dk,bevel=.006),(bc,top+.0,L-.12))
    P('led',box(bw-.34,.012,.05,M('led_warm')),(bc,top-.022,L-.12))
    for name,(x,yt) in G['slots'].items():
        k={'strata':'s1','drone':'s2','orbit':'s3','wing':'s4'}[name]
        P('label',quad(1.02,.1,RE[k],pr),(x,yt-.075,L+.065))
        for s in (-1,1):
            cx=x+s*G['coilX'];cy=yt+G['coilY']
            P('hub',cyl(.1,.05,br,seg=18,bevel=.008),(cx,cy,B+.0))
            P('gearmotor',cyl(.135,.11,bk,seg=18),(cx,cy,B-.075))
            P('motorstrap',box(.32,.05,.05,dk,bevel=.006),(cx,cy-.16,B-.07))
            P('shaft',cyl(.03,.09,st,seg=10),(cx,cy,B+.05))
    # harness down the back of the bay
    for k,c in enumerate(('wire_blue','wire_red')):
        wm=M(c,'#2f5a70' if k==0 else '#8a2f22',.5)
        P('harness',tube([(bL+.2+k*.05,top,-.68),(bL+.22+k*.05,4.4,-.69),(bL+.2+k*.05,2.8,-.68),(bL+.22+k*.05,2.05,-.69)],.016,wm,seg=5))
    for y in (3.5,2.0):
        P('clip',box(.2,.03,.03,dk),(bL+.24,y+.4,-.67))
    # collection compartment behind the flap
    P('binback',box(bw,bT-.2,.05,pk),(bc,(bT+.2)/2,L-.02))
    P('bintop',box(bw+.08,.05,G['front']-L+.04,en2,bevel=.01),(bc,bT+.0,(L+G['front'])/2))
    P('binwallL',box(.05,bT-.22,G['front']-L,pk),(H['left']-.09,(bT+.22)/2,(L+G['front'])/2))
    P('binwallR',box(.05,bT-.22,G['front']-L,pk),(H['right']+.09,(bT+.22)/2,(L+G['front'])/2))
    slope=math.atan2(G['rampHigh']-G['rampLow'],G['front']-L);zc=(L+G['front'])/2;yc=(G['rampHigh']+G['rampLow'])/2
    P('ramp',box(bw,.05,(G['front']-L)/math.cos(slope)+.03,st,bevel=.006),(bc,yc-.025,zc),(slope,0,0))
    for x in (-1.45,-.75,-.05,.65):
        P('runner',box(.08,.02,(G['front']-L)/math.cos(slope)-.04,rb,bevel=.006),(x+.16,yc+.006,zc),(slope,0,0))
    P('binlamp',box(1.9,.02,.05,M('led_warm')),(bc-.0,bT-.05,F-.34))
    # front skin around the hatch, one cut sheet
    P('skin',panel(rect(-2.2,.28,1.0,bT+.05),.1,en,holes=[rr(H['left'],H['bottom'],H['right'],H['top'],.05)],bevel=.01),(0,0,F-.05))
    P('hatchtrim',panel(rr(H['left']-.1,H['bottom']-.1,H['right']+.1,H['top']+.1,.08),.03,br,holes=[rr(H['left'],H['bottom'],H['right'],H['top'],.05)],bevel=.008),(0,0,F+.015))
    P('hatchgasket',panel(rr(H['left']-.015,H['bottom']-.015,H['right']+.015,H['top']+.015,.05),.05,rb,holes=[rr(H['left']+.02,H['bottom']+.02,H['right']-.02,H['top']-.02,.04)],bevel=.004),(0,0,F-.005))
    P('collectplate',box(.76,.14,.02,br,bevel=.005),((H['left']+H['right'])/2,1.92+.05,F+.02))
    P('collect',quad(.72,.11,RE['collect'],pr),((H['left']+H['right'])/2,1.97,F+.0315))
    P('modelplate',box(.86,.1,.015,br,bevel=.004),(-1.7+.0,.42-.04,F+.012))if False else None
    for x in (-2.13,.97):
        for y in (.4,1.98):
            b=sphere(.03,st,seg=10,ring=6);o=P('rivet',b,(x,y,F+.004));o.scale=(1,1,.4)
    # flap hinge knuckles at the foot of the opening
    for x in (H['left']+.34,H['right']-.34):
        P('knuckle',cyl(.032,.26,br,seg=12,bevel=.004),(x,H['bottom'],F+.045),Xr)
        P('leaf',box(.24,.12,.012,br,bevel=.003),(x,H['bottom']-.06,F+.012))
    # ---- door: a thick frame on three barrel hinges, sealed by a rubber gasket ----
    fL,fR,fB,fT=bL-.14,bR+.14,bT+.0,5.62
    P('doorgasket',panel(rr(fL-.03,fB-.03,fR+.03,fT+.03,.05),.04,rb,holes=[rr(bL-.03,fB+.09,bR+.03,fT-.09,.03)],bevel=.004),(0,0,F-.11))
    P('doorframe',panel(rr(fL,fB,fR,fT,.06),.2,dk,holes=[rr(bL,fB+.12,bR,fT-.12,.03)],bevel=.014,seg=2),(0,0,F-.02))
    P('doorbead',panel(rr(bL-.03,fB+.09,bR+.03,fT-.09,.04),.02,br,holes=[rr(bL+.005,fB+.125,bR-.005,fT-.125,.025)],bevel=.005),(0,0,F+.085))
    P('glassseal',panel(rr(bL+.01,fB+.13,bR-.01,fT-.13,.03),.02,rb,holes=[rr(bL+.03,fB+.15,bR-.03,fT-.15,.02)],bevel=.003),(0,0,GZ))
    for y in (2.5,3.8,5.1):
        P('hingeleaf',box(.2,.5,.015,st,bevel=.004),(fL+.05,y,F+.09))
        P('hinge',cyl(.042,.52,st,seg=14,bevel=.006),(fL-.04,y,F+.07),Yr)
        for dy in (-.17,.17):P('hingescrew',cyl(.016,.012,bk,seg=6),(fL+.08,y+dy,F+.1))
    P('handle',box(.05,1.2,.06,br,bevel=.012,seg=2),(fR-.07,3.7,F+.13))
    for y in (3.18,4.22):P('handlepost',cyl(.022,.09,br,seg=10),(fR-.07,y,F+.09))
    P('lock',cyl(.05,.02,st,seg=16,bevel=.004),(fR-.07,2.95,F+.087));P('lockslot',box(.012,.05,.004,bk),(fR-.07,2.95,F+.098))
    # ---- selector ----
    Cx=1.6
    P('dispbezel',panel(rr(Cx-.43,4.88,Cx+.43,5.42,.03),.03,bk,holes=[],bevel=.008),(0,0,F+.033))
    P('dispglass',box(.8,.44,.006,M('disp_edge','#0b1418',.2)),(Cx,5.15,F+.05))
    for i in range(4):
        y=4.48-i*.55
        P('keyplate',panel(rr(Cx-.44,y-.2,Cx+.44,y+.2,.03),.03,st,bevel=.006),(0,0,F+.034))
        P('keywell',cyl(.13,.03,bk,seg=28),(Cx-.22,y,F+.05))
        nm='n0%d'%(i+1)
        P('number',quad(.32,.23,RE[nm],pr),(Cx+.17,y,F+.052))
        for sx in (-.4,.4):
            for sy in (-.15,.15):P('platescrew',cyl(.015,.01,bk,seg=6),(Cx+sx,y+sy,F+.052))
    # coin slot, return cup and a service lock
    P('coinplate',panel(rr(Cx-.3,2.18,Cx+.3,2.54,.04),.02,br,bevel=.005),(0,0,F+.03))
    P('coinslot',box(.03,.14,.01,bk),(Cx-.13,2.36,F+.041));P('coinbtn',cyl(.05,.03,st,seg=14,bevel=.005),(Cx+.12,2.36,F+.05))
    P('hvlabel',quad(.28,.075,RE['hv'],pr),(Cx,2.1,F+.027)) if False else None
    # louvres in the lower column, each slat pressed at an angle
    P('louvreframe',panel(rr(Cx-.42,.42,Cx+.42,1.3,.03),.03,en2,holes=[rr(Cx-.36,.48,Cx+.36,1.24,.02)],bevel=.006),(0,0,F+.005))
    P('louvreback',box(.74,.78,.01,bk),(Cx,.86,F-.01))
    for i in range(9):P('louvre',box(.72,.012,.06,dk),(Cx,.52+i*.083,F+.004),(.7,0,0))
    P('serviceplate',box(.84,.3,.012,st,bevel=.004),(Cx,1.62,F+.0));P('servicekey',cyl(.04,.02,bk,seg=12),(Cx,1.62,F+.012))
    P('nameplate',quad(.62,.078,RE['model'],pr),(Cx,1.51+.2,F+.0075)) if False else None
    P('serialplate',quad(.74,.09,RE['model'],pr),(Cx,1.62+.0,F+.0072))
    for sx in (-.4,.4):
        for sy in (-.12,.12):P('platescrew',cyl(.014,.01,bk,seg=6),(Cx+sx,1.62+sy,F+.008))
    # power cable leaves through a gland at the back
    P('gland',cyl(.06,.1,bk,seg=12),(1.6,.5,-.9))
    # ---- movers: the page drives these ----
    def mover(n,me,loc,rot=(0,0,0)):
        o=bpy.data.objects.new(n,me);coll().objects.link(o);o.parent=ROOT;o.location=(loc[0]+G['machineX'],loc[1],loc[2]);o.rotation_euler=rot;o['mover']=1;return o
    btn=M('button_cap','#c7a36a',.3,1);ringm=M('button_ring','#2a3a3a',.4,.2)
    for i in range(4):
        y=4.48-i*.55;c=lathe([(0,.0),(.105,.0),(.105,.05),(.098,.062),(.07,.056),(0,.05)],btn,seg=28,name='btn')
        o=mover(f'mover_btn{i}',c,(Cx-.22,y,F+.062),(math.pi/2,0,0))
        mover(f'mover_ring{i}',torus(.122,.011,ringm,seg=36,sides=6),(Cx-.22,y,F+.068))
    mover('mover_screen',quad(.78,.42,(0,0,1,1),M('screen','#ffffff',.5)),(Cx,5.15,F+.055))
    w,hh=H['right']-H['left']-.05,H['top']-H['bottom']-.05
    sm=M('flap_smoke','#22363e',.18,.1);fr=M('flap_frame','#14303d',.34,.1)
    bm_=panel(rr(-w/2,0,w/2,hh,.04),.03,sm,bevel=0);mover('mover_flap_pane',bm_,((H['left']+H['right'])/2,H['bottom']+.02,F+.05))
    mover('mover_flap',panel(rr(-w/2,0,w/2,hh,.04),.06,fr,holes=[rr(-w/2+.07,.07,w/2-.07,hh-.07,.02)],bevel=.008),((H['left']+H['right'])/2,H['bottom']+.02,F+.05))
    mover('mover_flap_pull',box(1.1,.04,.05,M('brass_flap','#b8945f',.34,1),bevel=.012),((H['left']+H['right'])/2,H['bottom']+.02+hh-.16,F+.1))
    gl=M('door_glass','#c9e2de',.06,0,glass=1)
    mover('mover_glass',box(bw-.04,fT-fB-.28,.012,gl),(bc,(fB+fT)/2,GZ))
    # coils for the bake only: they shade the shelves. The page draws its own.
    cs=M('coil_steel','#c6ccce',.26,1)
    n=int((L-B)/G['pitch'])
    pts=[]
    for i in range(int(n*18)+1):
        a=i/18*TAU;pts.append((G['coilR']*math.cos(a),G['coilR']*math.sin(a),i/18*G['pitch']))
    co=tube(pts,.016,cs,seg=5,res=1,name='coil')
    for name,(x,yt) in G['slots'].items():
        for s in (-1,1):
            o=P('coil',co,(x+s*G['coilX'],yt+G['coilY'],B));o['bakeonly']=1
