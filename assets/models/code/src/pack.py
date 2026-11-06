"""Encode the stairwell lightmaps and textures. python pack.py WORK OUT SHARED_TEX"""
import sys,os,json
import numpy as np
from PIL import Image
W,O,SH=sys.argv[1],sys.argv[2],sys.argv[3];os.makedirs(O,exist_ok=True);lm={}
for g in ('shaft','stair','a1','a2','a3','vest'):
    a=np.load(f'{W}/scene_{g}.npy')[...,:3].astype(np.float32);a=np.nan_to_num(a);a[a<0]=0
    lum=a.max(2);sc=float(max(.05,np.percentile(lum[lum>1e-4],99.5)));b=np.clip(a/sc,0,1)
    e=np.where(b<=.0031308,b*12.92,1.055*b**(1/2.4)-.055);e=np.clip(e+(np.random.default_rng(3).random(e.shape[:2])[...,None]-.5)/255,0,1)
    im=Image.fromarray((e*255+.5).astype(np.uint8));im.save(f'{O}/lm-{g}.webp',quality=86,method=6);im.resize((768,768),Image.LANCZOS).save(f'{O}/lm-{g}-sm.webp',quality=82,method=6);lm[g]={'scale':round(sc,4)}
names=[]
for f,s,q in (('zellige_a',1024,84),('zellige_r',512,74),('terra_a',1024,82),('terra_r',256,60),('plaster_a',512,74),('stone_a',1024,80),('stone_r',256,60),('code_prints',2048,86)):
    Image.open(f'{W}/tex/{f}.png').convert('RGB').resize((s,s),Image.LANCZOS).save(f'{O}/{f}.webp',quality=q,method=6);names.append(f)
mats=json.load(open(f'{W}/scene_materials.json'));lant=json.load(open(f'{W}/scene_lanterns.json'))
json.dump({'materials':mats,'textures':names,'shared':['brushed_a','brushed_r','enamel_a','enamel_r','wood_a','wood_r','brick_a','brick_r','boards_a'],'lightmaps':lm,'lanterns':lant},open(f'{O}/manifest.json','w'))
print(sum(os.path.getsize(f'{O}/{x}') for x in os.listdir(O))//1024,'KB',lm)
