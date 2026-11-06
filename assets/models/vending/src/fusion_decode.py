import numpy as np,sys,pickle
from fusion_scan import scan
from PIL import Image,ImageDraw
def decode(path):
    b,segs=scan(path);faces=[];v6=[]
    i=0
    while i<len(segs):
        s=segs[i]
        if s[0]=='V' and s[1]==8 and i+1<len(segs) and segs[i+1][0]=='X':
            x=segs[i+1]
            idx=np.frombuffer(b,'<u4',count=x[3],offset=x[2])
            end=s[2]+s[3]*32
            vc=s[3]
            good=idx[:len(idx)-len(idx)%3]
            need=int(good.max())+1 if good.size else 0
            if need>vc and need<vc+64 and end-need*32>=0: vc=need
            v=np.frombuffer(b,'<f4',count=vc*8,offset=end-vc*32).reshape(-1,8)
            # trailing V tolerance
            m=len(idx)-len(idx)%3
            idx=idx[:m].reshape(-1,3)
            if idx.size and idx.max()<len(v) and np.isfinite(v).all(): faces.append((v[:,:3].copy(),v[:,3:6].copy(),idx.copy()))
            else: v6.append(('bad',s,x))
            i+=2;continue
        if s[0]=='V':v6.append(s)
        i+=1
    return faces,v6
def view(faces,axes,size=900,out='a.png',flip=(1,1)):
    P=np.vstack([f[0] for f in faces]);mn=P.min(0);mx=P.max(0)
    a,b_=axes;s=size/max(mx[a]-mn[a],mx[b_]-mn[b_])*.95
    im=Image.new('RGB',(int((mx[a]-mn[a])*s)+30,int((mx[b_]-mn[b_])*s)+30),'white');d=ImageDraw.Draw(im)
    for f in faces:
        v=f[0];e=f[2]
        for t in e:
            p=[(15+(v[k,a]-mn[a])*s,15+(mx[b_]-v[k,b_])*s) for k in t]
            d.line(p+[p[0]],fill=(120,120,160))
    im.save(out)
if __name__=='__main__':
    faces,rest=decode(sys.argv[1])
    print('faces',len(faces),'tris',sum(len(f[2]) for f in faces),'rest',rest[:8],len(rest))
    P=np.vstack([f[0] for f in faces]);print('bbox',P.min(0),P.max(0))
    pickle.dump(faces,open(sys.argv[2],'wb'))
    for k,ax in enumerate([(0,1),(0,2),(1,2)]):view(faces,ax,out=sys.argv[2]+f'.{k}.png')
