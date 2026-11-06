import numpy as np,sys
def scan(path):
    b=open(path,'rb').read();n=len(b);a=np.frombuffer(b[:n//4*4],'<f4')
    i=0;segs=[]
    def isv(k,s):
        if k+s>len(a):return False
        v=a[k:k+6]
        if not np.all(np.isfinite(v)):return False
        return abs(np.linalg.norm(v[3:6])-1)<.005 and np.all(np.abs(v[:3])<1000)
    while i<len(a):
        best=None
        for s in (6,8):
            j=i;c=0
            while isv(j,s):j+=s;c+=1
            if best is None or c*s>best[1]*best[0]:best=(s,c)
        s,c=best
        if c>=3:
            segs.append(('V',s,i*4,c));i+=s*c
        else:
            st=i;i+=1
            while i<len(a) and not (isv(i,6) and isv(i+6,6) and isv(i+12,6)) and not (isv(i,8) and isv(i+8,8) and isv(i+16,8)):i+=1
            segs.append(('X',0,st*4,i-st))
    return b,segs
if __name__=='__main__':
    b,segs=scan(sys.argv[1])
    print(len(b),len(segs))
    from collections import Counter
    print(Counter((s[0],s[1]) for s in segs))
    for s in segs[:40]:print(s, b[s[2]:s[2]+24].hex() if s[0]=='X' else '')
