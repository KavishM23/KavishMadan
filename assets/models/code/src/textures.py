"""Stairwell surfaces and the Code print atlas. Generated here; project art comes from the site's own img folder."""
import sys,math,json
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter
from scipy.ndimage import gaussian_filter as blur
out,IMG=sys.argv[1],sys.argv[2];rng=np.random.default_rng(11);N=1024
hexc=lambda h:tuple(int(h[i:i+2],16) for i in (1,3,5))
din=lambda s:ImageFont.truetype('/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf',s)
din2=lambda s:ImageFont.truetype('/System/Library/Fonts/Supplemental/DIN Alternate Bold.ttf',s)
chalk=lambda s:ImageFont.truetype('/System/Library/Fonts/Supplemental/Chalkduster.ttf',s)
def noise(sig):
    a=blur(rng.random((N,N)),sig,mode='wrap');return (a-a.min())/np.ptp(a)
def save(n,a):Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8)).save(f'{out}/{n}.png')
def orm(r):return np.dstack((np.ones_like(r),r,np.zeros_like(r)))
# Zellige: eight-point stars and crosses, each glazed piece a slightly different blue
S=4;M=N*S;im=Image.new('RGB',(M,M),hexc('#b5a98c'));d=ImageDraw.Draw(im);cell=M/4;gr=int(cell*.012)
blues=['#123a57','#154566','#0f3350','#184d6c','#123d5a'];teals=['#1b5f6a','#20686f','#175560'];navy=['#0d2a40','#0f3047','#0c263b'];
def star(cx,cy,r):
    p=[]
    for i in range(16):
        a=i*math.pi/8;q=r if i%2==0 else r*.72;p.append((cx+q*math.cos(a),cy+q*math.sin(a)))
    return p
rough=Image.new('L',(M,M),150);dr=ImageDraw.Draw(rough)
for j in range(-1,5):
    for i in range(-1,5):
        cx,cy=(i+.5)*cell,(j+.5)*cell;s=star(cx,cy,cell*.5-gr)
        d.polygon(s,fill=hexc(blues[rng.integers(len(blues))]));dr.polygon(s,fill=int(30+rng.random()*22))
        # the gaps between stars are laid in dark navy, so the wall reads as deep blue with fine lines
        cx2,cy2=i*cell,j*cell;r=cell*.335
        k4=[(cx2+r*1.28*math.cos(a),cy2+r*1.28*math.sin(a)) for a in (0,math.pi/2,math.pi,3*math.pi/2)]
        d.polygon(k4,fill=hexc(navy[rng.integers(len(navy))]));dr.polygon(k4,fill=int(36+rng.random()*18))
        r=cell*.2
        q=[(cx2+r*1.05*math.cos(a+math.pi/4),cy2+r*1.05*math.sin(a+math.pi/4)) for a in (0,math.pi/2,math.pi,3*math.pi/2)]
        d.polygon(q,fill=hexc(teals[rng.integers(len(teals))]));dr.polygon(q,fill=int(34+rng.random()*18))
im=im.resize((N,N),Image.LANCZOS);rough=rough.resize((N,N),Image.LANCZOS)
a=np.asarray(im,dtype=np.float32)/255;a=a*(.9+.2*noise(30)[...,None]);save('zellige_a',a)
save('zellige_r',orm(np.asarray(rough,dtype=np.float32)/255+.05*noise(2)))
# Terracotta floor: square tiles with small cream cabochons
c=np.zeros((N,N,3));cell=N/6;Y,X=np.mgrid[0:N,0:N];row=(Y/cell).astype(int);col=(X/cell).astype(int);vals=rng.random((8,8))
fy=(Y%cell);fx=(X%cell);edge=np.minimum(np.minimum(fx,cell-fx),np.minimum(fy,cell-fy));tile=np.clip(edge/4,0,1);n=noise(24)
base=np.array(hexc('#8f5a42'),dtype=np.float32)/255;c=base[None,None]*(.84+.22*vals[row,col][...,None])*(.84+.26*n[...,None])
c=c*(.3+.7*tile[...,None])+np.array(hexc('#4a3226'),dtype=np.float32)[None,None]/255*(1-tile[...,None])*.5
dx=np.minimum(fx,cell-fx);dy=np.minimum(fy,cell-fy);cab=(np.abs(dx)+np.abs(dy))<cell*.11
c[cab]=np.array(hexc('#c9b98f'),dtype=np.float32)/255*.8;save('terra_a',c);save('terra_r',orm(.55+.2*n))
# Warm lime plaster
n=noise(40);f=noise(1.5);c=np.array(hexc('#e2d6be'),dtype=np.float32)[None,None]/255*(.84+.18*n[...,None])*(.97+.05*f[...,None]);save('plaster_a',c)
# Limestone for treads and the column
n=noise(60);f=noise(1.2);c=np.array(hexc('#b8ac98'),dtype=np.float32)[None,None]/255*(.74+.34*n[...,None])*(.94+.1*f[...,None]);save('stone_a',c);save('stone_r',orm(.6+.2*n))
# ---- print atlas ----
A=2048;P=Image.new('RGB',(A,A),hexc('#1a1d1f'));dd=ImageDraw.Draw(P);rects={}
def put(k,x,y,w,h,img=None):
    if img is not None:P.paste(img.resize((w,h),Image.LANCZOS),(x,y))
    rects[k]=[x/A,1-(y+h)/A,(x+w)/A,1-y/A]
# chalkboard with the real match formula from TutorTime
w,h=900,520;b=Image.new('RGB',(w,h),hexc('#26382f'));g=ImageDraw.Draw(b)
for _ in range(240):
    x,y=rng.random(2)*[w,h];l=rng.random()*120;g.line((x,y,x+l,y+rng.random()*14-7),fill=(62,78,70),width=int(1+rng.random()*3))
g.text((46,34),'match score =',font=chalk(46),fill='#efe9d8')
for i,(t,c1) in enumerate((('0.42  x  style','#f2d9a8'),('+ 0.33  x  availability','#cfe6dc'),('+ 0.25  x  rating','#f2c0a8'))):g.text((78,126+i*92),t,font=chalk(46),fill=c1)
g.text((48,430),'cosine similarity of learning styles',font=chalk(26),fill='#b9c7bd')
put('chalk',0,0,900,520,b.filter(ImageFilter.GaussianBlur(.5)))
# keyboard
w,h=660,300;b=Image.new('RGB',(w,h),hexc('#b7babb'));g=ImageDraw.Draw(b)
rows=[(14,0),(14,0),(13,14),(12,24),(11,0)]
for r,(n,o) in enumerate(rows):
    kw=(w-24-o)/n
    for i in range(n):g.rounded_rectangle((12+o+i*kw+2,10+r*46,12+o+(i+1)*kw-2,10+r*46+40),6,fill='#1f2224')
g.rounded_rectangle((12+120,10+4*46,w-200,10+4*46+40),6,fill='#1f2224')
put('keys',900,0,660,300,b)
# Arcade art: marquee, side art, control deck
w,h=900,190;b=Image.new('RGB',(w,h),hexc('#101226'));g=ImageDraw.Draw(b)
for i,c1 in enumerate(('#ffcf5a','#ff8a3a','#e0452f')):
    g.text((w/2-3*i+3,18+i*2),'KUNG FOOLED',font=din2(128),fill=c1,anchor='ma')
put('marquee',0,540,900,190,b)
kf=['kf-arcade','kf-retro','kf-woodblock','kf-cyber','kf-map','kf-title']
for i,n in enumerate(kf):
    im2=ImageOps.fit(Image.open(f'{IMG}/{n}.webp').convert('RGB'),(240,135),Image.LANCZOS);put('kf'+str(i),920+(i%3)*250,320+(i//3)*145,240,135,im2)
# ten realm cartridges from the game's README
for i,(t,c1) in enumerate((('ARCADE','#c9402e'),('RETRO','#3a3a3a'),('POCKET','#5f7a3a'),('COMIC','#d9a520'),('AR GO','#2f7a8a'),('8-BIT','#7a3f9a'),('WOODBLOCK','#b58a5a'),('VHS','#2f3f6a'),('VAPORWAVE','#c86aa8'),('CYBER','#1e8a7a'))):
    b=Image.new('RGB',(150,200),hexc(c1));g=ImageDraw.Draw(b);g.rectangle((12,14,138,130),fill='#efe6d2');g.text((75,160),t,font=din(30),fill='#fff',anchor='mm');g.text((75,72),str(i+1).zfill(2),font=din(70),fill=c1,anchor='mm');put('cart'+str(i),i*170,760,150,200,b)
# book spines
cols=['#23465a','#a4694a','#d8c39a','#3f6b5e','#7d5f45','#5a2f2a','#c5a16c','#2e3f55']
b=Image.new('RGB',(1024,256),hexc('#2a2420'));g=ImageDraw.Draw(b);x=0
while x<1024:
    w2=int(18+rng.random()*40);c1=cols[rng.integers(len(cols))];g.rectangle((x,0,x+w2-2,256),fill=c1)
    for y in (26,226):g.rectangle((x+3,y,x+w2-5,y+5),fill='#c5a16c')
    x+=w2
put('spines',0,980,1024,256,b)
# jar labels, seed packets and the fridge note, in the app's own words
for i,t in enumerate(('RICE','LENTILS','FLOUR','SUGAR','OATS','PASTA')):
    b=Image.new('RGB',(180,110),hexc('#efe6d2'));g=ImageDraw.Draw(b);g.rectangle((6,6,173,103),outline='#6b5a42',width=3);g.text((90,55),t,font=din(52),fill='#3a2a1c',anchor='mm');put('jar'+str(i),1040+(i%3)*190,980+(i//3)*120,180,110,b)
b=Image.new('RGB',(320,420),hexc('#f4e9b8'));g=ImageDraw.Draw(b);g.text((26,26),'USE FIRST',font=din(58),fill='#8a2f22')
for i,t in enumerate(('spinach - 1 day','milk - 2 days','bread - 2 days','chicken - 3 days')):g.text((26,112+i*66),t,font=din(44),fill='#3a2a1c')
put('note',1620,980,320,420,b)
# stop signs on the arch keystones and the landing pad mark
for i,t in enumerate(('01','02','03')):
    b=Image.new('RGB',(200,120),hexc('#c5a16c'));g=ImageDraw.Draw(b);g.text((100,60),t,font=din2(88),fill='#2a2418',anchor='mm');put('no'+str(i),i*220,1250,200,120,b)
P.save(f'{out}/code_prints.png');json.dump(rects,open(f'{out}/code_prints.json','w'));print('ok',len(rects))
