"""The three alcoves and the vestibule. Each stop has its own set; all share the arch, bridge and materials."""
from kit import *
import math,random
PI=math.pi
CUR=[None]
def build(L,RE,S,M,m):
    random.seed(9)
    for i,s in enumerate(L['stops']):
        g='a%d'%(i+1)
        A=bpy.data.objects.new('stop'+str(i),None);coll().objects.link(A);A.parent=kitroot();R=L['wallR'];A.location=(math.sin(s['theta'])*R,s['y'],math.cos(s['theta'])*R);A.rotation_euler=(0,s['theta']+PI,0);CUR[0]=A
        P=lambda n,me,loc=(0,0,0),rot=(0,0,0),sc=None,g=g,A=A:S(n,me,loc,rot or (0,0,0),g,A,sc)
        shell(L,s,i,P,M,m,RE)
        {0:larder,1:study,2:arcade}[i](L,P,M,m,RE)
    vestibule(L,S,M,m,RE)
def kitroot():
    import kit;return kit.ROOT
def arch(hw,hh,n=44):
    rad=hw*1.02;cy=hh-rad;p=[]
    for i in range(n+1):
        t=math.radians(-18+216*i/n);p.append((rad*math.cos(t),cy+rad*math.sin(t)))
    return [(hw*.94,0)]+p+[(-hw*.94,0)]
def shell(L,s,i,P,M,m,RE):
    hw,hh,D=L['alcoveW']/2,L['alcoveH'],L['alcoveD'];pf=arch(hw,hh)
    # deck and bridge back to the stair
    wid=L['bridgeW'];span=L['wallR']-L['stairR']-.05
    P('bridge',box(wid,.4,span,m['ter'],bevel=.02),(0,-.2,span/2))
    for sx in (-1,1):
        x=sx*wid/2
        P('bridgebeam',box(.3,.7,span+.3,m['dk'],bevel=.02),(x,-.65,span/2))
        P('strut',tube([(x,-.9,.2),(x,-3.4,0.06)],.0001,m['dk'],seg=4,res=1)) if False else None
        p0,p1=Vector_((x,-1,span*.72)),Vector_((x,-4.6,.1));d=p1-p0
        P('strut',cyl(.11,d.length,m['dk'],seg=10),tuple((p0+p1)/2),rot_to(d))
        P('strutfoot',box(.6,.8,.1,m['st'],bevel=.02),(x,-4.7,.02))
        P('deckrail',tube([(x,3,span+.05),(x,3,-.2)],.08,m['wood'],seg=8,res=1))
        P('deckrail2',tube([(x,1.55,span),(x,1.55,-.2)],.03,m['br'],seg=6,res=1))
        for k in range(8):
            z=span*(k+.5)/8;P('baluster',cyl(.035,3,m['dk'],seg=8),(x,1.5,z),Yr)
        P('newel',lathe([(.17,0),(.17,.2),(.1,.3),(.09,2.7),(.15,2.8),(.15,2.94),(.08,3.02),(0,3.06)],m['br'],seg=14),(x,0,span-.05))
    # arch surround: alternating voussoirs like the gate at the top of the stairs
    N=len(pf)-2
    for k in range(1,N,2):
        a,b=pf[k],pf[min(k+2,N+1)]
        c=((a[0]+b[0])/2,(a[1]+b[1])/2)
    hwb=hw+.62
    outer=arch(hwb,hh+.62)
    P('archring',panel(outer,.5,m['pl'] if False else M('arch_cream'),holes=[pf],bevel=.03),(0,0,.1))
    # coloured voussoirs laid over the ring
    for k in range(0,16):
        t0=math.radians(-18+216*k/16);t1=math.radians(-18+216*(k+1)/16);rad=hw*1.02;cy=hh-rad
        if k%2:continue
        q=[(rad*math.cos(t0+.012),cy+rad*math.sin(t0+.012)),((rad+.62)*math.cos(t0+.012),cy+(rad+.62)*math.sin(t0+.012)),((rad+.62)*math.cos(t1-.012),cy+(rad+.62)*math.sin(t1-.012)),(rad*math.cos(t1-.012),cy+rad*math.sin(t1-.012))]
        P('voussoir',panel(q,.06,m['terra'],bevel=.012),(0,0,.37))
    P('archbrass',panel(arch(hw+.06,hh+.06),.08,m['br'],holes=[arch(hw-.04,hh-.04)],bevel=.012),(0,0,.34))
    # stop number on the keystone
    P('keystone',box(1.0,.62,.1,m['br'],bevel=.02),(0,hh+.32,.42));P('stopno',quad(.82,.5,RE['no'+str(i)],m['pr']),(0,hh+.32,.48))
    # the room behind: floor, vaulted walls, back wall
    P('alcfloor',box(2*hw+1,.3,D+.6,m['ter']),(0,-.15,-D/2))
    bm=bmesh.new();n=len(pf);f=[[bm.verts.new((p[0],p[1],0.2)) for p in pf],[bm.verts.new((p[0],p[1],-D)) for p in pf]]
    for k in range(n-1):bm.faces.new((f[0][k],f[1][k],f[1][k+1],f[0][k+1]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    P('alcwall',from_bm(bm,'alcwall',m['plf'],smooth=50))
    P('alcback',panel(pf,.2,m['plf'],bevel=0),(0,0,-D-.05))
    # alcove lamp
    P('alcshade',lathe([(0,.28),(.08,.28),(.1,.2),(.8,-.2),(.8,-.24),(.74,-.24),(.08,.14),(0,.2)],m['br'],seg=24),(0,hh-2.0,-2.3))
    P('alcbulb',sphere(.16,m['glow'],seg=12,ring=8),(0,hh-2.22,-2.3))
    P('alccord',cyl(.016,1.7,m['rb'],seg=6),(0,hh-1.05,-2.3),Yr)
def Vector_(v):
    from mathutils import Vector;return Vector(v)
def laptop(P,M,m,RE,x,y,z,key):
    """A 16-inch laptop open at about 112 degrees. The page draws the screen."""
    al=M('laptop_alu','#a9adb0',.36,1,tex='brushed',tile=2);W,D_=1.36,.94
    P('lapbase',box(W,.05,D_,al,bevel=.018,seg=2),(x,y+.03,z))
    P('lapkeys',quad(1.14,.52,RE['keys'],m['pr']),(x,y+.0565,z-.13),(-PI/2,0,0))
    P('laptrack',box(.5,.002,.3,M('laptop_track','#bcc0c2',.3,.6),seg=1),(x,y+.057,z+.27))
    a=math.radians(112-90)
    hinge=(x,y+.06,z-D_/2+.015)
    P('laphinge',cyl(.03,W*.9,M('laptop_dark','#232628',.4,.6),seg=10),hinge,Xr)
    h=.9;cy=hinge[1]+math.cos(a)*h/2;cz=hinge[2]-math.sin(a)*h/2
    P('laplid',box(W,h,.035,al,bevel=.014,seg=2),(x,cy,cz),(-a,0,0))
    P('lapbezel',box(W-.03,h-.03,.006,M('laptop_black','#0a0b0c',.3),seg=1),(x,cy+math.cos(a)*0,cz+.0),(-a,0,0)) if False else None
    nx=math.sin(a);ny=math.cos(a)
    P('lapbezel',box(W-.03,h-.03,.006,M('laptop_black','#0a0b0c',.3),seg=1),(x,cy+math.sin(a)*.02,cz+math.cos(a)*.02),(-a,0,0))
    o=quad(W-.1,(W-.1)/1.6,(0,0,1,1),M('screen_'+key,'#ffffff',.5));s=bpy.data.objects.new('mover_screen_'+key,o);coll().objects.link(s)
    s['mover']=1
    return s,(x,cy+math.sin(a)*.026,cz+math.cos(a)*.026),(-a,0,0)
def worldify(s,parent,loc,rot):
    """Place a mover by its alcove's transform, then the join step frees it from the hierarchy."""
    s.parent=parent;s.location=loc;s.rotation_euler=rot;bpy.context.view_layer.update();mw=s.matrix_world.copy();import kit;s.parent=kit.ROOT;s.matrix_parent_inverse=kit.ROOT.matrix_world.inverted();s.matrix_world=mw
def island(P,M,m,top,finish):
    P('islandtop',box(5.4,.16,1.9,top,bevel=.03,seg=2),(.2,3-.08,-1.9))
    P('islandbody',box(5.1,2.84,1.6,finish,bevel=.02),(.2,1.42,-1.9))
    P('islandkick',box(5.0,.2,1.5,m['rb']),(.2,.1,-1.9))
    for k in range(3):
        x=-1.5+k*1.7
        P('doorpanel',box(1.55,2.4,.04,finish,bevel=.012),(x,1.5,-1.09));P('doorpull',box(.6,.05,.05,m['br'],bevel=.012),(x,2.48,-1.05))
def larder(L,P,M,m,RE):
    g=M('sage_tile','#6f8a78',.3,tex='enamel',tile=3)
    island(P,M,m,m['wood'],g)
    s,loc,rot=laptop(P,M,m,RE,.2,3,-1.85,'lastbite');worldify(s,parent_of(P),loc,rot)
    # back wall: tiled splash, two open shelves of jars and tins
    bw=-5.0
    P('splash',box(7.2,2.3,.05,g),(-.2,3.05,bw+.03))
    for y in (3.5,5.0):
        P('shelf',box(6.6,.14,.8,m['wood'],bevel=.02),(.9,y,bw+.42))
        for x in (-2.0,.9,3.8):P('shelfbracket',panel([(0,0),(.6,0),(0,-.5)],.06,m['dk'],bevel=.006),(x,y-.07,bw+.1),(0,-PI/2,0))
    glassj=M('jar_glass','#b9cfc9',.15)
    fills=['#d8c39a','#8a5a2e','#efe6d2','#d8d0c0','#b58a5a','#c8a24a']
    for i,x in enumerate((-1.6,-.9,-.2,.5,1.2,1.9)):
        h=.8+.1*(i%3);P('jar',lathe([(0,0),(.26,0),(.3,.05),(.3,h-.1),(.24,h),(.24,h+.06),(0,h+.06)],glassj,seg=14),(x,3.57,bw+.42))
        P('jarfill',cyl(.26,h*.72,M('fill'+str(i),fills[i],.7),seg=12),(x,3.6+h*.36,bw+.42),Yr);P('jarlid',cyl(.25,.08,m['br'],seg=14),(x,3.57+h+.09,bw+.42),Yr)
        P('jarlabel',quad(.36,.22,RE['jar'+str(i)],m['pr']),(x,3.57+h*.45,bw+.73))
    for i,x in enumerate((-1.7,-.8,.1)):
        P('tin',cyl(.3,.62,M('tin'+str(i),['#a4412a','#23465a','#c5a16c'][i],.4,.3),seg=16,bevel=.02),(x,5.38,bw+.42),Yr)
    P('basket',lathe([(0,0),(.5,0),(.68,.42),(.66,.42),(.48,.04),(0,.04)],M('wicker','#9a7446',.8),seg=18),(1.6,5.07,bw+.42))
    for j in range(5):P('lemon',sphere(.2,M('lemon','#d9b23a',.5),seg=10,ring=8),(1.35+j*.13,5.42+(j%2)*.1,bw+.42+(j%3)*.08-.08))
    # cream fridge against the right wall, with the app's use-first note on the door
    fx=3.4
    P('fridge',box(2.3,6.1,1.9,m['cr'],bevel=.09,seg=3),(fx,3.05,-3.9))
    P('fridgeline',box(2.3,.03,.01,m['bk'],seg=1),(fx,4.6,-2.94));P('fridgehandle',box(.09,1.0,.1,m['br'],bevel=.03),(fx-.92,5.2,-2.88));P('fridgehandle',box(.09,1.5,.1,m['br'],bevel=.03),(fx-.92,3.6,-2.88))
    P('fridgenote',quad(.7,.92,RE['note'],m['pr']),(fx+.3,3.2,-2.94),(0,0,.04));P('magnet',cyl(.07,.03,M('pin_red','#a4412a',.4),seg=12),(fx+.3,3.62,-2.92))
    # food on the worktop: a crate of produce, bread and milk
    P('crate',box(1.3,.5,.85,m['wood'],bevel=.02),(-1.6,3.25,-1.95))
    for j in range(9):
        P('tomato',sphere(.19,M('tomato','#b8392a',.42),seg=10,ring=8),(-2.05+(j%3)*.42,3.6,-2.2+(j//3)*.3))
    for j in range(5):
        P('leaf',sphere(.2,M('leaf','#4f7a42',.6),seg=8,ring=6),(-1.25+(j%2)*.2,3.62+(j%3)*.05,-2.15+j*.1),None,(1,.5,1))
    P('bread',lathe([(0,0),(.3,.02),(.36,.2),(.3,.36),(0,.42)],M('bread','#b98a4e',.7),seg=14),(1.75,3,-1.5),None,(1.5,1,.85))
    P('milk',lathe([(0,0),(.17,0),(.17,.62),(.09,.82),(.09,.94),(0,.94)],M('milk','#efe9dc',.3),seg=14),(2.25,3,-2.1));P('milkcap',cyl(.1,.08,m['terra'],seg=12),(2.25,3.96,-2.1),Yr)
    # donation crate on the floor, with the pin from the app's map
    P('donate',box(1.5,1.0,1.1,M('card','#b4916a',.8),bevel=.02),(-3.0,.5,-3.6),(0,.2,0))
    P('pinhead',sphere(.26,M('pin_red'),seg=12,ring=8),(-3.0,1.75,-3.6));P('pinstem',lathe([(0,0),(.05,.3),(.12,.5),(0,.52)],M('pin_red'),seg=10),(-3.0,1.16,-3.6)) 
def study(L,P,M,m,RE):
    island(P,M,m,m['wood'],M('study_blue','#23465a',.35,tex='enamel',tile=3))
    s,loc,rot=laptop(P,M,m,RE,.2,3,-1.85,'tutortime');worldify(s,parent_of(P),loc,rot)
    bw=-5.0
    # blackboard carrying the real matching formula
    P('boardframe',box(5.0,3.0,.1,m['wd'],bevel=.02),(-1.3,5.0,bw+.08));P('board',quad(4.7,2.72,RE['chalk'],m['pr']),(-1.3,5.0,bw+.14));P('chalkrail',box(4.8,.08,.2,m['wd'],bevel=.012),(-1.3,3.46,bw+.2));P('chalk',cyl(.03,.3,m['paper'],seg=6),(-.4,3.53,bw+.2),Xr)
    # tall bookcase
    bx=3.0
    P('caseback',box(2.8,7.2,.1,m['wd']),(bx,3.6,bw+.1))
    for x in (bx-1.4,bx+1.4):P('caseside',box(.12,7.2,1.0,m['wd'],bevel=.012),(x,3.6,bw+.55))
    for y in (.1,1.5,2.9,4.3,5.7,7.1):P('caseshelf',box(2.8,.12,1.0,m['wd'],bevel=.012),(bx,y,bw+.55))
    for y in (.16,1.56,2.96,4.36,5.76):
        P('spines',quad(2.6,1.0,RE['spines'],m['pr']),(bx,y+.56,bw+.9))
        P('bookbody',box(2.6,1.0,.6,M('book_body','#4a3a30',.7)),(bx,y+.56,bw+.58))
    # books and papers on the desk, banker lamp, invoice tray
    for k,c in enumerate(('#23465a','#a4694a','#d8c39a')):
        P('deskbook',box(.9-.06*k,.12,.66,M('bk'+str(k),c,.6),bevel=.012),(-1.7,3.06+k*.125,-1.8),(0,.1*k,0))
    P('lampbase',lathe([(0,0),(.26,0),(.26,.05),(.04,.1),(.03,.62),(0,.62)],m['br'],seg=16),(-1.1,3,-2.2))
    P('lampshade',cyl(.17,1.0,M('banker_green','#2c5a46',.3),seg=16,bevel=.02),(-1.1,3.74,-2.1),(0,PI/2,0),(1,.75,1));P('lampbulb',sphere(.12,m['glow'],seg=10,ring=6),(-1.1,3.62,-2.1))
    P('tray',box(.9,.08,.7,m['wd'],bevel=.012),(1.9,3.04,-1.7));P('invoice',box(.72,.012,.55,m['paper'],seg=1),(1.9,3.09,-1.7),(0,.07,0));P('invoice2',box(.72,.012,.55,m['paper'],seg=1),(1.9,3.11,-1.7),(0,-.04,0))
    P('mug',lathe([(0,0),(.16,0),(.17,.03),(.17,.36),(.15,.36),(.14,.04),(0,.04)],M('mug_cream','#e0d4ba',.32),seg=16),(2.4,3,-2.3))
    # two chairs: a tutor and a student, the pair the platform matches
    for x,yaw in ((-3.2,.5),(-2.1,-.3)) if False else ((-3.3,.7),):
        chair(P,M,m,x,-3.6,yaw)
    chair(P,M,m,-.9,-3.7,-.55)
    P('rug',box(4.4,.03,3.2,M('rug','#7a3a2c',.8)),(-2.1,.02,-3.5))
    # wall calendar
    P('calendar',box(1.2,1.3,.03,m['paper'],seg=1),(3.9,6.5,bw+.02)) if False else None
def chair(P,M,m,x,z,yaw):
    from mathutils import Matrix
    c=math.cos(yaw);s_=math.sin(yaw);T=lambda a,b:(x+a*c+b*s_,None,z-a*s_+b*c)
    t=T(0,0);P('chairseat',box(1.3,.12,1.25,m['wood'],bevel=.03),(x,1.6,z),(0,yaw,0))
    for a,b in ((-.55,-.5),(.55,-.5),(-.55,.5),(.55,.5)):
        q=T(a,b);P('chairleg',cyl(.05,1.55,m['wd'],seg=8),(q[0],.78,q[2]),Yr)
    q=T(0,-.6);P('chairback',box(1.3,1.4,.1,m['wood'],bevel=.03),(q[0],2.5,q[2]),(0,yaw,0))
def arcade(L,P,M,m,RE):
    c=M('cab_deep','#141a33',.36,tex='enamel',tile=3);side=M('cab_side','#a4412a',.4,tex='enamel',tile=3)
    # floor mat of the Dojo, and the cabinet itself
    P('tatami',box(7.4,.06,4.6,M('tatami','#b39c64',.7,tex='wood',tile=2)),(0,.03,-2.7))
    P('tatamiedge',box(7.5,.04,.12,m['dk']),(0,.05,-.42))
    cz,cx=-2.3,.25
    prof=[(-1.15,0),(1.15,0),(1.15,3.05),(1.0,3.15),(.38,5.05),(.62,5.35),(.62,6.75),(-1.15,6.75)]
    for sx in (-1,1):
        o=P('cabside',panel([(p[0],p[1]) for p in prof],.12,side,bevel=.02),(cx+sx*1.25,0,cz),(0,PI/2,0))
    w=2.42
    P('cabback',box(w,6.75,.1,c),(cx,3.37,cz-1.12))
    P('cabtop',box(w,.1,1.8,c,bevel=.01),(cx,6.72,cz-.25))
    P('cabbase',box(w,3.0,.1,c,bevel=.01),(cx,1.5,cz+1.15))
    P('kick',box(w,.3,.1,m['rb']),(cx,.15,cz+1.17))
    # control deck, angled up towards the player
    a=.26;P('deck',box(w,.1,1.0,c,bevel=.012),(cx,3.15,cz+.82),(-a*-.0+0,0,0)) if False else None
    P('deck',box(w,.1,1.0,M('deck_black','#101214',.4),bevel=.012),(cx,3.12,cz+.78),(a,0,0))
    P('deckart',quad(2.2,.62,RE['kf5'],m['pr']),(cx,3.185,cz+.8),(-PI/2+a,0,0))
    def onDeck(u,v):return (cx+u,3.17+math.sin(-a)*v*-1 if False else 3.18-v*math.sin(a),cz+.78+v*math.cos(a))
    P('stickball',sphere(.13,M('stick_red','#c9402e',.3),seg=14,ring=10),(onDeck(-.6,0)[0],onDeck(-.6,0)[1]+.34,onDeck(-.6,0)[2]));P('stickshaft',cyl(.03,.3,m['st'],seg=8),(onDeck(-.6,0)[0],onDeck(-.6,0)[1]+.15,onDeck(-.6,0)[2]),Yr);P('stickgate',cyl(.2,.02,bk_(m),seg=16),(onDeck(-.6,0)[0],onDeck(-.6,0)[1]+.03,onDeck(-.6,0)[2]),Yr)
    for k,(u,v,cc) in enumerate(((.15,.1,'#d9a520'),(.5,.03,'#c9402e'),(.85,-.04,'#2f7a8a'),(.15,-.16,'#d9a520'),(.5,-.23,'#c9402e'),(.85,-.3,'#2f7a8a'))):
        q=onDeck(u,v);P('btn',lathe([(0,0),(.12,0),(.12,.04),(.09,.07),(0,.06)],M('btn'+str(k%3),cc,.3),seg=14),(q[0],q[1]+.01,q[2]))
    # monitor bezel and marquee
    P('monbezel',panel(rr(-1.15,-.82,1.15,.82,.05),.08,M('deck_black'),holes=[rr(-.86,-.53,.86,.53,.03)],bevel=.01),(cx,4.45,cz+.42),(-.2,0,0))
    sc=quad(1.72,1.06,(0,0,1,1),M('screen_kungfooled','#ffffff',.5));ob=bpy.data.objects.new('mover_screen_kungfooled',sc);coll().objects.link(ob);ob['mover']=1;worldify(ob,parent_of(P),(cx,4.45,cz+.4),(-.2,0,0))
    P('marqueebox',box(w+.04,.86,.26,M('deck_black'),bevel=.012),(cx,6.14,cz+.6));P('marquee',quad(2.2,.46,RE['marquee'],M('marquee_lit','#ffffff',.5,tex='code_prints',emit='#ffffff',emit_str=1.4,glow=1)),(cx,6.14,cz+.74))
    P('coin',box(.5,.74,.03,m['br'],bevel=.008),(cx,1.8,cz+1.21));P('coinslot',box(.05,.2,.01,m['rb']),(cx-.1,1.86,cz+1.23));P('coinslot',box(.05,.2,.01,m['rb']),(cx+.1,1.86,cz+1.23))
    # shelf of ten realms, one cartridge each
    bw=-5.0
    P('cartshelf',box(7.4,.14,.7,m['wood'],bevel=.02),(-.1,6.15,bw+.38))
    for k in range(10):
        x=-3.25+k*.7;P('cartbody',box(.6,.8,.14,M('cart_body','#22262a',.5),bevel=.012),(x,6.62,bw+.5),(-.08,0,0));P('cartlabel',quad(.54,.72,RE['cart'+str(k)],m['pr']),(x,6.63,bw+.585),(-.08,0,0))
    # wing chun dummy: the Dojo in the game
    dx,dz=-3,-3.3
    P('dummypost',lathe([(.42,0),(.42,.1),(.3,.2),(.3,5),(.26,5.2),(0,5.3)],M('dummy_wood','#7a5230',.6),seg=20),(dx,0,dz))
    for k,(y,ya) in enumerate(((4.2,.6),(4.2,-.6),(3.1,.1))):
        c_=math.cos(ya);s_=math.sin(ya);P('dummyarm',cyl(.09,1.4,M('dummy_wood'),seg=10),(dx+s_*.7,y-.1,dz+c_*.7),(.2,ya,0))
    P('dummyleg',cyl(.1,1.5,M('dummy_wood'),seg=10),(dx+.3,1.3,dz+.5),(.9,.5,0))
    # paper lanterns and a cool strip, the only hard colour in the stairwell
    for k,x in enumerate((-2.8,3.2)):
        P('paperlantern',sphere(.5,M('paper_lantern','#ffffff',.5,emit='#ffb070',emit_str=2.2,glow=1),seg=14,ring=10),(x,7.2,-3.6),None,(1,1.25,1));P('lanterncord',cyl(.012,1.6,m['rb'],seg=6),(x,8.4,-3.6),Yr)
    P('neonstrip',box(7,.05,.05,M('neon','#ffffff',.5,emit='#5a7dff',emit_str=7,glow=1)),(0,.14,bw+.05))
def bk_(m):return m['bk']
def parent_of(P):return CUR[0]
def vestibule(L,S,M,m,RE):
    """A brick lobby off the workshop, set well above the shaft, where the gate stands."""
    y0=62;Sg=lambda n,me,loc=(0,0,0),rot=(0,0,0),sc=None:S(n,me,loc,rot or (0,0,0),'vest',None,sc)
    brick=M('wall_brick','#b9b2a6',.8,tex='brick',tile=4);conc=M('floor_ves','#ffffff',.6,tex='terra',tile=4)
    Sg('vfloor',box(30,.3,26,conc),(0,y0-.15,4));Sg('vback',box(30,16,.3,brick),(0,y0+8,-1.2))
    for x in (-12,12):Sg('vside',box(.3,16,26,brick),(x,y0+8,4))
    Sg('vceil',box(30,.3,26,M('ceiling_boards','#ffffff',.8,tex='boards',tile=4)),(0,y0+12,4))
    for x in (-8.5,8.5):
        Sg('vlantern',lathe([(.34,.3),(.4,-.14),(.26,-.6),(.12,-.72),(0,-.74)],M('lantern_glass'),seg=8),(x,y0+7.2,-.8));Sg('vbracket',box(.1,.1,.6,m['br']),(x,y0+7.7,-.9))
    for x in (-10.5,10.5):Sg('vplanter',lathe([(.5,0),(.8,.2),(.9,1.4),(.8,1.5),(.7,1.4),(0,1.4)],m['terra'],seg=16),(x,y0,1.2));Sg('vplant',sphere(1.1,M('leaf'),seg=10,ring=8),(x,y0+2.3,1.2),None,(.8,1.2,.8))
    Sg('vrunner',box(8,.03,14,M('rug'),),(0,y0+.02,7))
    # the gate is drawn live in the page; this stand-in gives it a contact shadow in the bake
    o=Sg('vproxy',box(24,8.4,.7,M('rug')),(0,y0+4.2,L['gate']['z']-.35));o['bakeonly']=1
