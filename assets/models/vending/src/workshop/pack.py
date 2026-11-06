"""Encode lightmaps and tiling textures for the web and write the manifest the page reads.
python pack.py WORK OUT tools: WORK holds scene_*.npy arrays, tex/ and scene_materials.json."""
import sys,os,json
import numpy as np
from PIL import Image
W,O=sys.argv[1],sys.argv[2];os.makedirs(O,exist_ok=True)
lm={}
for g in ('shell','machine','props'):
    a=np.load(f'{W}/scene_{g}.npy')[...,:3].astype(np.float32);a=np.nan_to_num(a);a[a<0]=0
    a=np.flipud(a) if False else a
    lum=a.max(2);sc=float(max(.05,np.percentile(lum[lum>1e-4],99.6)));b=np.clip(a/sc,0,1)
    e=np.where(b<=.0031308,b*12.92,1.055*b**(1/2.4)-.055)
    # a little noise stops 8-bit banding on long soft gradients
    e=np.clip(e+(np.random.default_rng(3).random(e.shape[:2])[...,None]-.5)/255,0,1)
    im=Image.fromarray((e*255+.5).astype(np.uint8))
    im.save(f'{O}/lm-{g}.webp',quality=86,method=6);im.resize((1024,1024),Image.LANCZOS).save(f'{O}/lm-{g}-1k.webp',quality=84,method=6)
    lm[g]={'scale':round(sc,4)};print(g,'scale',sc,a.shape)
names=[];T=f'{W}/tex'
for f,s,q in (('brick_a',1024,82),('brick_r',256,60),('concrete_a',1024,82),('concrete_r',512,62),('wood_a',1024,84),('wood_r',512,62),('brushed_a',512,84),('brushed_r',512,80),('enamel_a',512,86),('enamel_r',512,84),('peg_a',512,80),('peg_r',256,60),('cork_a',512,70),('card_a',512,80),('mat_a',512,80),('boards_a',1024,80),('prints',2048,86)):
    Image.open(f'{T}/{f}.png').convert('RGB').resize((s,s),Image.LANCZOS).save(f'{O}/{f}.webp',quality=q,method=6);names.append(f)
mats=json.load(open(f'{W}/scene_materials.json'));pend=json.load(open(f'{W}/scene_pend.json'))
glows=[[p[0],p[1]-.06,p[2],3.4,'#ffd29a',.5] for p in pend[:2]]+[[-3.2,4.13,-.54,1.1,'#ffd9a0',.5],[-6.9,3.2,.53,.5,'#ff6a3a',.5],[1.15,5.89,2.42,1.2,'#fff0d0',.0]]
json.dump({'materials':mats,'textures':names,'lightmaps':lm,'glows':glows,'pendants':pend},open(f'{O}/manifest.json','w'))
print(sum(os.path.getsize(f'{O}/{x}') for x in os.listdir(O))//1024,'KB')
