"""Painted-globe textures. Coastlines: Natural Earth 1:50m via the world-atlas package (public domain data)."""
import json,sys,numpy as np
from PIL import Image,ImageDraw,ImageFilter
from scipy.ndimage import gaussian_filter
W,H=2048,1024;S=2
g=json.load(open(sys.argv[1]));out=sys.argv[2]
geoms=g['features'] if g['type']=='FeatureCollection' else [g]
m=Image.new('L',(W*S,H*S),0);d=ImageDraw.Draw(m)
def px(p):return ((p[0]+180)/360*W*S,(90-p[1])/180*H*S)
for f in geoms:
    gm=f['geometry'];polys=gm['coordinates'] if gm['type']=='MultiPolygon' else [gm['coordinates']]
    for poly in polys:
        d.polygon([px(p) for p in poly[0]],fill=255)
        for h in poly[1:]:d.polygon([px(p) for p in h],fill=0)
m=m.resize((W,H),Image.LANCZOS);land=np.asarray(m,dtype=np.float32)/255
rng=np.random.default_rng(4)
noise=gaussian_filter(rng.random((H,W)),24);noise=(noise-noise.min())/np.ptp(noise)
fine=gaussian_filter(rng.random((H,W)),2.2);fine=(fine-fine.min())/np.ptp(fine)
coast=np.clip(gaussian_filter(land,14)*1.6,0,1)
hex2=lambda h:np.array([int(h[i:i+2],16) for i in (1,3,5)],dtype=np.float32)
deep,shal,sand,sage=hex2('#143547'),hex2('#2a6176'),hex2('#e3d6b8'),hex2('#b9b58e')
oc=deep[None,None]+(shal-deep)[None,None]*(coast[...,None]*.85+noise[...,None]*.12)
ld=sand[None,None]+(sage-sand)[None,None]*np.clip(noise*1.5-.25,0,1)[...,None]
ld*= (.93+.12*fine)[...,None]
a=oc*(1-land[...,None])+ld*land[...,None]
# engraved brass graticule every 30 degrees
L=Image.new('L',(W,H),0);dl=ImageDraw.Draw(L)
for lon in range(-180,180,30):
    x=(lon+180)/360*W;dl.line([(x,0),(x,H)],fill=255,width=2)
for lat in range(-60,90,30):
    y=(90-lat)/180*H;dl.line([(0,y),(W,y)],fill=255,width=2)
gr=np.asarray(L.filter(ImageFilter.GaussianBlur(.6)),dtype=np.float32)/255
b=hex2('#c5a16c');a=a*(1-.72*gr[...,None])+b[None,None]*.72*gr[...,None]
Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(out+'_albedo.png')
# raised painted land: height to normal map
h=gaussian_filter(land,1.6)*1.0+fine*land*.18-gr*.25
gy,gx=np.gradient(h);k=5.5
n=np.dstack((-gx*k,gy*k,np.ones_like(h)));n/=np.linalg.norm(n,axis=2,keepdims=True)
Image.fromarray(((n*.5+.5)*255).astype(np.uint8)).resize((1536,768),Image.LANCZOS).save(out+'_normal.png')
# ocean glazed, land matte; G=roughness, B=metal
r=.26*(1-land)+.72*land;r=r*(1-gr)+.32*gr;mtl=gr*.9
Image.fromarray((np.dstack((np.ones_like(r),r,mtl))*255).astype(np.uint8)).resize((1024,512),Image.LANCZOS).save(out+'_orm.png')
