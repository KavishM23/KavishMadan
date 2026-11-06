"""Shared helpers for the baked machine and workshop. Work happens in page units, y up, z towards the
viewer; ROOT turns that into Blender's z-up space, and glTF export turns it straight back."""
import sys,os,json,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
ROOT=None;TABLE={}
Yr=(math.pi/2,0,0);Xr=(0,math.pi/2,0)  # a cylinder's own axis is z; these turn it upright or sideways
def start():
    global ROOT;reset();MATS.clear();TABLE.clear()
    ROOT=bpy.data.objects.new('ROOT',None);coll().objects.link(ROOT);ROOT.rotation_euler=(math.pi/2,0,0)
    return ROOT
def M(name,color='#888888',rough=.6,metal=0,tex=None,tile=None,emit=None,emit_str=1,**kw):
    """A plain Blender material for the bake, plus the record the page uses to rebuild it with shared textures."""
    if name in MATS:return MATS[name]
    m=mat(name,color,rough,metal,emit=emit,emit_str=emit_str);TABLE[name]=dict(color=color,rough=rough,metal=metal,tex=tex,tile=tile,emit=emit,emit_str=emit_str,**kw);return m
def S(name,me,loc=(0,0,0),rot=(0,0,0),g='props',parent=None,scale=None):
    """Place a static part. g is its lightmap group."""
    o=bpy.data.objects.new(name,me);coll().objects.link(o);o.location=loc;o.rotation_euler=rot;o.parent=parent or ROOT;o['g']=g
    if scale is not None:o.scale=scale if hasattr(scale,'__len__') else (scale,)*3
    return o
def rr(x0,y0,x1,y1,r=.03,seg=4):
    w=[(x1-r,y1-r,0),(x0+r,y1-r,90),(x0+r,y0+r,180),(x1-r,y0+r,270)];p=[]
    for cx,cy,a0 in w:
        for i in range(seg+1):
            t=math.radians(a0+90*i/seg);p.append((cx+r*math.cos(t),cy+r*math.sin(t)))
    return p
def rect(x0,y0,x1,y1):return [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
def circ(x,y,r,n=16):return [(x+r*math.cos(TAU*i/n),y+r*math.sin(TAU*i/n)) for i in range(n)]
def panel(outer,t,m,holes=(),bevel=.008,seg=1,name='panel'):
    """A cut plate, thickness along z, with its edges broken so they catch light."""
    me=poly_mesh([{'outer':outer,'holes':list(holes)}],t,name,m)
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-5)
    if bevel:
        e=[x for x in bm.edges if len(x.link_faces)==2 and x.calc_face_angle(0)>.9]
        bmesh.ops.bevel(bm,geom=e,offset=bevel,segments=seg,profile=.5,affect='EDGES',clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    me.shade_smooth();me.set_sharp_from_angle(angle=math.radians(38));return me
def quad(w,h,uv,m,name='quad'):
    """A flat print facing +z, mapped into the atlas rectangle uv=(u0,v0,u1,v1)."""
    bm=bmesh.new();l=bm.loops.layers.uv.new('UVMap')
    v=[bm.verts.new(p) for p in ((-w/2,-h/2,0),(w/2,-h/2,0),(w/2,h/2,0),(-w/2,h/2,0))];f=bm.faces.new(v)
    for lp,c in zip(f.loops,((uv[0],uv[1]),(uv[2],uv[1]),(uv[2],uv[3]),(uv[0],uv[3]))):lp[l].uv=c
    return from_bm(bm,name,m)
def lathe(prof,m,seg=24,name='lathe',smooth=45):
    """Spin (radius,height) points around y."""
    bm=bmesh.new();rings=[]
    for r,y in prof:
        rings.append([bm.verts.new((r*math.cos(TAU*i/seg),y,r*math.sin(TAU*i/seg))) for i in range(seg)])
    for a,b in zip(rings,rings[1:]):
        for i in range(seg):
            q=(a[i],a[(i+1)%seg],b[(i+1)%seg],b[i])
            try:bm.faces.new(q)
            except ValueError:pass
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    return from_bm(bm,name,m,smooth=smooth)
def spanner(l,w):
    """Open-ended spanner outline, flat on z, jaw at the top."""
    j=w*1.05;n=[(-w*.3,-l/2),(w*.3,-l/2),(w*.26,l/2-j),(j*.62,l/2-j*.5),(j*.62,l/2+j*.1),(j*.2,l/2+j*.32),(j*.2,l/2-j*.05),(-j*.2,l/2-j*.05),(-j*.2,l/2+j*.32),(-j*.62,l/2+j*.1),(-j*.62,l/2-j*.5),(-w*.26,l/2-j)]
    return n
def join(keep=()):
    """Bake transforms and merge statics by lightmap group and material."""
    bpy.context.view_layer.update();groups={}
    for o in [x for x in bpy.data.objects if x.type=='MESH']:
        if o.get('mover') or not o.data.polygons:continue
        g=o.get('g','props')
        bm=bmesh.new();bm.from_mesh(o.data);mw=o.matrix_world.copy();bmesh.ops.transform(bm,matrix=mw,verts=bm.verts)
        if mw.determinant()<0:bmesh.ops.reverse_faces(bm,faces=bm.faces)
        tmp=bpy.data.meshes.new('tmp');bm.to_mesh(tmp);bm.free()
        for i,m in enumerate(o.data.materials):groups.setdefault((g,m.name,bool(o.get('bakeonly'))),[]).append((tmp,i))
    for o in [x for x in bpy.data.objects if x.type=='MESH' and not x.get('mover')]:bpy.data.objects.remove(o)
    out={}
    for (g,mn,bo),lst in groups.items():
        b=bmesh.new()
        for tmp,i in lst:
            b2=bmesh.new();b2.from_mesh(tmp);bmesh.ops.delete(b2,geom=[f for f in b2.faces if f.material_index!=i],context='FACES_ONLY')
            for f in b2.faces:f.material_index=0
            t2=bpy.data.meshes.new('t2');b2.to_mesh(t2);b2.free();b.from_mesh(t2);bpy.data.meshes.remove(t2)
        me=bpy.data.meshes.new(f'{g}__{mn}');b.to_mesh(me);b.free();me.materials.append(bpy.data.materials[mn]);o=obj(f'{g}__{mn}',me);o['g']=g
        if bo:o['bakeonly']=1;o.name='bake__'+o.name
    for me in [x for x in bpy.data.meshes if x.users==0]:bpy.data.meshes.remove(me)
    # movers keep their own transform, free of ROOT, so the page sees plain page-space positions
    for o in [x for x in bpy.data.objects if x.type=='MESH' and x.get('mover') and x.parent is ROOT]:
        w=o.matrix_world.copy();o.parent=None;o.matrix_world=w
    # world-scale box UVs for tiled materials; atlas prints keep the UVs they were given
    for o in bpy.data.objects:
        if o.type!='MESH':continue
        me=o.data;tile=None
        if me.materials:
            tile=TABLE.get(me.materials[0].name,{}).get('tile')
        if not me.uv_layers:me.uv_layers.new(name='UVMap')
        if tile:
            bm=bmesh.new();bm.from_mesh(me);l=bm.loops.layers.uv['UVMap']
            mw=o.matrix_world
            for f in bm.faces:
                n=f.normal;ax=max(range(3),key=lambda k:abs(n[k]))
                for lp in f.loops:
                    p=mw@lp.vert.co
                    uv=(p.x,p.y) if ax==2 else ((p.y,p.z) if ax==0 else (p.x,p.z))
                    lp[l].uv=(uv[0]/tile,uv[1]/tile)
            bm.to_mesh(me);bm.free()
    json.dump(TABLE,open(sys.argv[sys.argv.index('--')+2]+'_materials.json','w'),indent=0)
