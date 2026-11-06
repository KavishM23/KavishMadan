"""Tiling surface textures and the print atlas for the workshop. numpy and Pillow only.
Every texture here is generated. Project images come from the site's own img folder."""
import sys,os,math,json
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps
from scipy.ndimage import gaussian_filter as blur
out=sys.argv[1];IMG=sys.argv[2];rng=np.random.default_rng(7)
N=1024
def tn(sigma,n=N):
    a=blur(rng.random((n,n)),sigma,mode='wrap');return (a-a.min())/np.ptp(a)
def fbm(n=N,base=64,oct=5):
    a=np.zeros((n,n));w=1;t=0;s=base
    for _ in range(oct):a+=tn(s,n)*w;t+=w;w*=.55;s=max(.6,s/2)
    a/=t;return (a-a.min())/np.ptp(a)
def hex3(h):return np.array([int(h[i:i+2],16) for i in (1,3,5)],dtype=np.float32)/255
def save(name,a):Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8)).save(f'{out}/{name}.png')
def normal(h,k):
    gy,gx=np.gradient(h);gx=gx*N/1024;gy=gy*N/1024
    # wrap the edge so the tile stays seamless
    n=np.dstack((-gx*k,gy*k,np.ones_like(h)));n/=np.linalg.norm(n,axis=2,keepdims=True);return n*.5+.5
def orm(r,m=None):
    m=np.zeros_like(r) if m is None else m
    return np.dstack((np.ones_like(r),r,m))
# Painted brick: 8 bricks across, 14 courses, cream limewash
bw,bh=N/6,N/14;mortar=4.2
h=np.ones((N,N));tone=np.zeros((N,N));Y,X=np.mgrid[0:N,0:N]
row=(Y/bh).astype(int);xo=X+(row%2)*bw/2;col=(xo/bw).astype(int)%6
fy=(Y%bh);fx=(xo%bw)
edge=np.minimum(np.minimum(fy,bh-fy),np.minimum(fx,bw-fx))
brick=np.clip(edge/mortar,0,1)**.7
ids=(row%14)*7+col;cols=rng.random(200)
tone=cols[ids%200]
f=fbm();g=tn(1.2)
h=brick*.8+f*.12+g*.08
c=hex3('#e2d3b2')[None,None]*(.9+.12*tone[...,None])*(.92+.14*f[...,None])
c=c*(.62+.38*brick[...,None])
# limewash thins on the arrises and lets the terracotta through
thin=np.clip((fbm(base=20)-.62)*7,0,1)*np.clip(1-edge/16,0,1)
c=c*(1-thin[...,None]*.55)+hex3('#a4694a')[None,None]*thin[...,None]*.55
nb=normal(blur(h,.9,mode='wrap'),5.5)*2-1;c=c*(1+(nb[...,1]*.55-nb[...,0]*.2)[...,None]);save('brick_a',c);save('brick_r',orm(.74+.16*f))
# Polished concrete
f=fbm(base=90);p=tn(.9);s=np.clip((fbm(base=30)-.56)*5,0,1)
c=hex3('#8f8a80')[None,None]*(.82+.26*f[...,None])*(.97+.06*p[...,None])*(1-.14*s[...,None])
cr=np.zeros((N,N));im=Image.new('L',(N,N),0);d=ImageDraw.Draw(im)
for _ in range(7):
    x,y=rng.random(2)*N;a=rng.random()*6.28;pts=[(x,y)]
    for k in range(26):
        a+=rng.normal(0,.5);x+=math.cos(a)*22;y+=math.sin(a)*22;pts.append((x,y))
    d.line(pts,fill=int(120+rng.random()*90),width=1)
cr=np.asarray(im,dtype=np.float32)/255
c=c*(1-cr[...,None]*.42)
save('concrete_a',c);save('concrete_r',orm(.36+.24*f+.18*s));
# Butcher-block timber: staves along U
sta=np.zeros((N,N));tint=np.zeros((N,N));sw=N//9
for i in range(9):
    sta[i*sw:(i+1)*sw]=rng.random();
line=np.zeros((N,N))
line[::sw]=1;line=blur(line,1.1,mode='wrap')*3
gr=blur(rng.random((N,N)),(1.1,70),mode='wrap');gr=(gr-gr.min())/np.ptp(gr)
gr2=blur(rng.random((N,N)),(5,160),mode='wrap');gr2=(gr2-gr2.min())/np.ptp(gr2)
base=hex3('#b58a5a')[None,None]*(.8+.28*sta[...,None])
c=base*(.72+.42*gr[...,None])*(.86+.24*gr2[...,None]);c=c*(1-np.clip(line,0,1)[...,None]*.6)
save('wood_a',c);save('wood_r',orm(.52+.2*gr))
# Brushed metal, for tinted steel and brass
br=blur(rng.random((N,N)),(.45,48),mode='wrap');br=(br-br.min())/np.ptp(br)
sc=np.zeros((N,N));im=Image.new('L',(N,N),0);d=ImageDraw.Draw(im)
for _ in range(120):
    x,y=rng.random(2)*N;a=rng.random()*6.28;l=20+rng.random()*140
    d.line((x,y,x+math.cos(a)*l,y+math.sin(a)*l),fill=int(50+rng.random()*150),width=1)
sc=np.asarray(im,dtype=np.float32)/255
v=.9+.14*br-.14*sc
save('brushed_a',np.dstack((v,v,v)));save('brushed_r',orm(.3+.26*br+.3*sc,np.ones_like(br)))
# Enamel: near-clean paint with fine scuffs and a little orange peel
pe=tn(3);sc=np.zeros((N,N));im=Image.new('L',(N,N),0);d=ImageDraw.Draw(im)
for _ in range(60):
    x,y=rng.random(2)*N;a=rng.random()*6.28;l=8+rng.random()*80
    d.line((x,y,x+math.cos(a)*l,y+math.sin(a)*l),fill=int(30+rng.random()*170),width=1)
for _ in range(16):
    x,y=rng.random(2)*N;r=2+rng.random()*7;d.ellipse((x-r,y-r,x+r,y+r),fill=int(100+rng.random()*110))
sc=blur(np.asarray(im,dtype=np.float32)/255,.5);v=1-.3*sc+.03*(fbm(base=60)-.5)
save('enamel_a',np.dstack((v,v,v)));save('enamel_r',orm(.26+.06*pe+.42*sc))
# Pegboard: painted hardboard, holes on an 8 by 8 grid
c1=hex3('#d9ccb0');Yp,Xp=np.mgrid[0:N,0:N];cell=N/8
dx=(Xp%cell)-cell/2;dy=(Yp%cell)-cell/2;rad=np.sqrt(dx*dx+dy*dy);hole=np.clip((rad-17)/2.5,0,1)
f=fbm(base=50)
c=c1[None,None]*(.93+.1*f[...,None])*(.08+.92*hole[...,None])
np_=normal(blur(hole,1.6,mode='wrap'),3)*2-1;c=c*(1+(np_[...,1]*.5-np_[...,0]*.2)[...,None]);save('peg_a',c);save('peg_r',orm(.55+.2*f))
# Cork
sp=blur(rng.random((N,N)),1.6,mode='wrap');sp=(sp-sp.min())/np.ptp(sp);c=hex3('#b98d5b')[None,None]*(.68+.62*sp[...,None])
dk=np.clip((blur(rng.random((N,N)),3,mode='wrap')-.52)*38,0,1)
save('cork_a',c*(1-.45*dk[...,None]))
# Cardboard with flute lines
fl=(np.sin(Yp/N*6.28*48)*.5+.5);f=fbm(base=30);c=hex3('#b4916a')[None,None]*(.86+.2*f[...,None])*(.96+.05*fl[...,None]);save('card_a',c)
# Ribbed rubber mat
ribs=(np.sin(Xp/N*6.28*16)*.5+.5)**.6;f=fbm(base=40);c=hex3('#2a2d2e')[None,None]*(.76+.3*f[...,None])*(.6+.4*ribs[...,None])
save('mat_a',c)
# Timber boards for the ceiling, 6 across
sta=np.zeros((N,N));sw=N//6
for i in range(6):sta[:,i*sw:(i+1)*sw]=rng.random()
gr=blur(rng.random((N,N)),(60,1),mode='wrap');gr=(gr-gr.min())/np.ptp(gr)
l2=np.zeros((N,N));l2[:,::sw]=1;l2=blur(l2,1.2,mode='wrap')*3
c=hex3('#7d5f45')[None,None]*(.7+.45*sta[...,None])*(.76+.34*gr[...,None])*(1-np.clip(l2,0,1)[...,None]*.7)
save('boards_a',c)
# ---- print atlas: photographs, drawings, labels ----
A=2048;P=Image.new('RGB',(A,A),'#e8dcc4');dr=ImageDraw.Draw(P);rects={}
def font(sz,name='Avenir Next.ttc',idx=8):
    for p in ('/System/Library/Fonts/'+name,'/System/Library/Fonts/Supplemental/'+name):
        if os.path.exists(p):
            try:return ImageFont.truetype(p,sz,index=idx)
            except Exception:return ImageFont.truetype(p,sz)
    return ImageFont.load_default()
din=lambda s:ImageFont.truetype('/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf',s)
din2=lambda s:ImageFont.truetype('/System/Library/Fonts/Supplemental/DIN Alternate Bold.ttf',s)
def put(key,x,y,w,h,img=None):
    if img is not None:P.paste(img.resize((w,h),Image.LANCZOS),(x,y))
    rects[key]=[x/A,1-(y+h)/A,(x+w)/A,1-y/A]
def fit(path,w,h):
    im=Image.open(path).convert('RGB');return ImageOps.fit(im,(w,h),Image.LANCZOS)
x=0
put('hero',0,0,720,480,fit(f'{IMG}/strata-hero.webp',720,480))
put('cad',720,0,480,360,fit(f'{IMG}/strata-2-cad.webp',480,360))
put('laser',1200,0,480,360,fit(f'{IMG}/strata-4-laser.webp',480,360))
put('sketch',1680,0,368,276,fit(f'{IMG}/strata-1-sketch.webp',368,276))
put('wiring',720,360,360,270,fit(f'{IMG}/strata-6-wiring.webp',360,270))
put('tyre',1080,360,300,225,fit(f'{IMG}/strata-5-tyre.webp',300,225))
# Aerofoil drawing: NACA 0009 as named in the wing slides
W,H=620,340;im=Image.new('RGB',(W,H),'#f0e6d0');d=ImageDraw.Draw(im)
for i in range(0,W,20):d.line((i,0,i,H),fill='#dcd2b8')
for i in range(0,H,20):d.line((0,i,W,i),fill='#dcd2b8')
yt=lambda t:5*.09*(.2969*t**.5-.126*t-.3516*t*t+.2843*t**3-.1036*t**4)
pts=[(60+500*t,170-500*yt(t)) for t in np.linspace(0,1,120)]+[(60+500*t,170+500*yt(t)) for t in np.linspace(1,0,120)]
d.line(pts,fill='#23465a',width=3);d.line((40,170,590,170),fill='#a4694a',width=1)
d.text((22,18),'NACA 0009',font=din(46),fill='#23465a');d.text((22,296),'CHORD LINE / RE 50K',font=din(24),fill='#a4694a')
put('aerofoil',1380,360,480,263,im)
# Orbit diagram: the three shells named on the site
W,H=420,420;im=Image.new('RGB',(W*2,H*2),'#14303e');d=ImageDraw.Draw(im);c=W
for r,col in ((140,'#3f7f97'),):d.ellipse((c-r,c-r,c+r,c+r),fill=col)
for r,lab in ((220,'450 KM'),(280,'550 KM'),(360,'850 KM')):
    d.ellipse((c-r,c-r,c+r,c+r),outline='#d8c39a',width=3);d.text((c+6,c-r+6),lab,font=din(30),fill='#d8c39a')
put('orbit',1860,276,188,188,im.resize((188,188),Image.LANCZOS))
# Rib outline drawn from the CAD slice
parts=json.load(open(sys.argv[3]))
im=Image.new('RGB',(1240,400),'#f0e6d0');d=ImageDraw.Draw(im)
for i in range(0,1240,40):d.line((i,0,i,400),fill='#dcd2b8')
for i in range(0,400,40):d.line((0,i,1240,i),fill='#dcd2b8')
rib=[r for r in parts['ribs'] if r['rib']==8]
for r in rib:
    d.polygon([(40+p[0]*34,360-(p[1]-3)*60) for p in r['outer']],outline='#a4412a')
d.text((40,18),'STRATA RIB 09',font=din(40),fill='#a4412a')
put('ribdraw',0,480,620,200,im)
# Blueprint: top view of the slotted plate
im=Image.new('RGB',(620,400),'#1c4257');d=ImageDraw.Draw(im)
for i in range(0,620,31):d.line((i,0,i,400),fill='#265269')
for i in range(0,400,31):d.line((0,i,620,i),fill='#265269')
d.rectangle((60,110,560,300),outline='#d9e4dc',width=3)
for i in range(22):
    y=118+i*8.2;d.line((80,y,540,y),fill='#d9e4dc',width=2)
d.text((60,40),'BASE PLATE / 22 SLOTS',font=din(40),fill='#d9e4dc')
put('plan',620,680,420,270,im)
# Machine lettering
def tag(key,x,y,w,h,text,bg,fg,size,fnt=din):
    im=Image.new('RGB',(w,h),bg);d=ImageDraw.Draw(im);f=fnt(size);b=d.textbbox((0,0),text,font=f);d.text(((w-b[2]-b[0])/2,(h-b[3]-b[1])/2),text,font=f,fill=fg);put(key,x,y,w,h,im)
tag('marquee',0,950,1024,110,'KAVISH  /  PROJECTS','#ecdfc4','#1d3a48',78,din2)
for i,(k,t) in enumerate((('s1','01  STRATA'),('s2','02  QUADS'),('s3','03  ORBIT'),('s4','04  WING'))):
    tag(k,1040+i*0,680+i*44,340,40,t,'#183543','#ecdfc4',32)
for i,n in enumerate(('01','02','03','04')):
    tag('n'+n,1400+i*150,700,140,100,n,'#e4d6ba','#1d3a48',84)
tag('collect',1040,860,420,60,'COLLECT','#c5a16c','#2a2418',50)
tag('push',1480,830,320,50,'PUSH TO OPEN','#c5a16c','#2a2418',36)
tag('hv',1820,800,220,60,'240 V','#e4d6ba','#7a2e1c',44)
tag('model',1040,930,560,70,'PROJECT MACHINE / KM-04','#c5a16c','#2a2418',46)
tag('serial',1620,880,400,50,'S/N 2026-0416','#c5a16c','#2a2418',34)
for i,t in enumerate(('STRATA','KESSLER','WING','QUADS','NOTES','RECEIPTS')):
    tag('b'+str(i),1040+i*100,1010,96,330,'',['#23465a','#a4694a','#d8c39a','#3f6b5e','#7d5f45','#23465a'][i],'#fff',10)
    s=Image.new('RGB',(330,96),['#23465a','#a4694a','#d8c39a','#3f6b5e','#7d5f45','#23465a'][i]);d=ImageDraw.Draw(s);d.text((16,18),t,font=din(58),fill='#f2e9d6' if i!=2 else '#23465a');P.paste(s.rotate(90,expand=True),(1040+i*100,1010))
for i,t in enumerate(('M3','M4','M5','FUSES','HEADERS','LEDS','JST','SERVO','SHRINK','TIES','BOLTS','SHIMS')):
    tag('d'+str(i),1660+(i%3)*128,1010+(i//3)*48,124,44,t,'#f0e6d0','#23465a',32)
for i,t in enumerate(('PLA+','TPU AIR','HIPS','ACRYLIC')):
    tag('c'+str(i),0+i*260,1070,250,120,t,'#c9a57a','#3a2a1c',74)
# Strata contour lines, the team's motif, for the backing panel of the machine
hmap=blur(rng.random((720,600)),(46,46));hmap=(hmap-hmap.min())/np.ptp(hmap)
ct=np.abs(((hmap*16)%1)-.5);line=np.clip(1-ct/.05,0,1)
base=hex3('#ddd2ba')[None,None]*np.ones((720,600,3));base=base*(1-line[...,None]*.16)+hex3('#a88f67')[None,None]*line[...,None]*.16
put('contour',1100,1360,600,688,Image.fromarray((np.clip(base,0,1)*255).astype(np.uint8)))
# Status screen frame for the machine, drawn at run time, so only a dark panel here.
tag('blank',0,1200,64,64,'','#101c22','#000',8)
for i,t in enumerate(('24H','PRINTER 02')):
    tag('lab'+str(i),80+i*300,1200,280,64,t,'#23465a','#ecdfc4',40)
P.save(f'{out}/prints.png');json.dump(rects,open(f'{out}/prints.json','w'))
print('textures done',len(rects))
