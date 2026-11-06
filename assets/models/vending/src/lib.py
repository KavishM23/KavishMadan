"""Small modelling kit for the vending machine assets. Runs inside Blender 4.2.
All work is in centimetres; export scales to metres."""
import bpy,bmesh,math,json,os,struct
from mathutils import Vector,Matrix,geometry
import numpy as np
TAU=math.pi*2
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
def coll():return bpy.context.scene.collection
def srgb(h):
    h=h.lstrip('#');c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return [x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]+[1]
MATS={}
def mat(name,color='#888888',rough=.6,metal=0,emit=None,emit_str=1,coat=0,alpha=None,spec=.5):
    if name in MATS:return MATS[name]
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=srgb(color);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
    b.inputs['Specular IOR Level'].default_value=spec
    if coat:b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=.12
    if emit:b.inputs['Emission Color'].default_value=srgb(emit);b.inputs['Emission Strength'].default_value=emit_str
    if alpha is not None:b.inputs['Alpha'].default_value=alpha;m.blend_method='BLEND'
    MATS[name]=m;return m
def obj(name,me,parent=None,loc=(0,0,0),rot=(0,0,0)):
    o=bpy.data.objects.new(name,me);coll().objects.link(o);o.location=loc;o.rotation_euler=rot
    if parent:o.parent=parent
    return o
def from_bm(bm,name,m,smooth=None):
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free()
    if isinstance(m,(list,tuple)):
        for x in m:me.materials.append(x)
    else:me.materials.append(m)
    if smooth is not None:
        me.shade_smooth();me.set_sharp_from_angle(angle=math.radians(smooth))
    return me
def poly_mesh(parts,t,name,face,edge=None,flat_edge=True):
    """Extrude 2D shapes along local Z, centred. parts: [{'outer':[..],'holes':[[..]]}]."""
    bm=bmesh.new()
    for part in parts:
        loops=[part['outer']]+part.get('holes',[])
        vs=[];es=[];fs=[]
        for lp in loops:
            s=len(vs);vs+=[Vector((p[0],p[1])) for p in lp];n=len(lp)
            es+=[(s+i,s+(i+1)%n) for i in range(n)]
            fs.append(list(range(s,s+n)))
        res=geometry.delaunay_2d_cdt(vs,es,fs,2,1e-5)
        V,_,F,*_=res
        for z,flip in ((t/2,False),(-t/2,True)):
            bv=[bm.verts.new((p.x,p.y,z)) for p in V]
            for f in F:
                try:
                    q=bm.faces.new([bv[i] for i in (f[::-1] if flip else f)]);q.material_index=0
                except ValueError:pass
        # walls, oriented so the normals face out of the solid
        for k,lp in enumerate(loops):
            a=[Vector((p[0],p[1])) for p in lp]
            area=sum(a[i].x*a[(i+1)%len(a)].y-a[(i+1)%len(a)].x*a[i].y for i in range(len(a)))
            want_ccw=(k==0)
            order=a if (area>0)==want_ccw else a[::-1]
            n=len(order)
            for i in range(n):
                p,q=order[i],order[(i+1)%n]
                v=[bm.verts.new((p.x,p.y,-t/2)),bm.verts.new((q.x,q.y,-t/2)),bm.verts.new((q.x,q.y,t/2)),bm.verts.new((p.x,p.y,t/2))]
                f=bm.faces.new(v);f.material_index=1 if edge else 0
    bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-5) if False else None
    bm.normal_update()
    me=from_bm(bm,name,[face,edge] if edge else face)
    return me
def box(sx,sy,sz,m,bevel=.0,name='box',seg=2):
    bm=bmesh.new();bmesh.ops.create_cube(bm,size=1)
    for v in bm.verts:v.co=Vector((v.co.x*sx,v.co.y*sy,v.co.z*sz))
    if bevel:
        bmesh.ops.bevel(bm,geom=list(bm.edges)+list(bm.verts),offset=bevel,segments=seg,profile=.5,affect='EDGES')
    return from_bm(bm,name,m,smooth=35)
def cyl(r,h,m,seg=24,r2=None,bevel=0,name='cyl',caps=True):
    """Axis along local Z, centred."""
    bm=bmesh.new();bmesh.ops.create_cone(bm,cap_ends=caps,segments=seg,radius1=r,radius2=(r if r2 is None else r2),depth=h)
    if bevel:
        e=[x for x in bm.edges if len(x.link_faces)==2 and x.calc_face_angle(0)>1.0]
        bmesh.ops.bevel(bm,geom=e,offset=bevel,segments=2,profile=.5,affect='EDGES')
    return from_bm(bm,name,m,smooth=40)
def sphere(r,m,seg=24,ring=14,name='sph'):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=seg,v_segments=ring,radius=r)
    return from_bm(bm,name,m,smooth=80)
def torus(R,r,m,seg=64,sides=10,name='torus'):
    bm=bmesh.new();rings=[]
    for i in range(seg):
        a=TAU*i/seg;c=Vector((math.cos(a),math.sin(a),0));rg=[]
        for j in range(sides):
            b=TAU*j/sides;p=c*(R+r*math.cos(b))+Vector((0,0,r*math.sin(b)));rg.append(bm.verts.new(p))
        rings.append(rg)
    for i in range(seg):
        for j in range(sides):
            bm.faces.new((rings[i][j],rings[(i+1)%seg][j],rings[(i+1)%seg][(j+1)%sides],rings[i][(j+1)%sides]))
    bm.normal_update();return from_bm(bm,name,m,smooth=80)
def rot_to(d):return Vector((0,0,1)).rotation_difference(Vector(d).normalized()).to_euler()
def rod(a,b,r,m,seg=10,parent=None,name='rod',ends=False):
    a=Vector(a);b=Vector(b);d=b-a
    o=obj(name,cyl(r,d.length,m,seg=seg,name=name),parent,(a+b)/2,rot_to(d));return o
def tube(points,r,m,seg=8,name='tube',closed=False,res=6):
    """Sweep a circle along a smooth path through the points."""
    pts=[Vector(p) for p in points];n=len(pts);path=[]
    if closed:P=lambda i:pts[i%n];count=n
    else:P=lambda i:pts[max(0,min(n-1,i))];count=n-1
    for i in range(count):
        p0,p1,p2,p3=P(i-1),P(i),P(i+1),P(i+2)
        for k in range(res):
            t=k/res;path.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
    if not closed:path.append(pts[-1])
    bm=bmesh.new();rings=[];N=len(path);nrm=None
    for i,p in enumerate(path):
        tg=(path[(i+1)%N]-path[i-1]) if closed else (path[min(i+1,N-1)]-path[max(i-1,0)])
        tg.normalize()
        if nrm is None:
            nrm=tg.cross(Vector((.13,.27,1)));
            if nrm.length<1e-3:nrm=tg.cross(Vector((1,0,0)))
        nrm=(nrm-tg*nrm.dot(tg)).normalized();bin=tg.cross(nrm)
        rings.append([bm.verts.new(p+(nrm*math.cos(TAU*j/seg)+bin*math.sin(TAU*j/seg))*r) for j in range(seg)])
    for i in range(N if closed else N-1):
        a,b=rings[i],rings[(i+1)%N]
        for j in range(seg):bm.faces.new((a[j],b[j],b[(j+1)%seg],a[(j+1)%seg]))
    if not closed:
        bm.faces.new(rings[0][::-1]);bm.faces.new(rings[-1])
    bm.normal_update();return from_bm(bm,name,m,smooth=70)
def helix(r,h,turns,wire,m,seg=6,step=14,name='spring'):
    n=int(turns*step)
    pts=[(r*math.cos(TAU*turns*i/n),r*math.sin(TAU*turns*i/n),-h/2+h*i/n) for i in range(n+1)]
    return tube(pts,wire,m,seg=seg,name=name,res=1)
def read_stl(path,scale=1):
    b=open(os.path.expanduser(path),'rb').read();n=struct.unpack('<I',b[80:84])[0]
    a=np.frombuffer(b,dtype=np.dtype([('n','<3f4'),('v','<9f4'),('c','<u2')]),count=n,offset=84)
    return a['v'].reshape(-1,3,3).astype(np.float64)*scale
def stl_mesh(tris,name,m,decimate=None,smooth=30):
    """Weld an STL triangle soup into a mesh."""
    k=np.round(tris.reshape(-1,3)/1e-4).astype(np.int64)
    u,inv=np.unique(k,axis=0,return_inverse=True);inv=inv.ravel()
    V=np.zeros((len(u),3));V[inv]=tris.reshape(-1,3);F=inv.reshape(-1,3)
    F=F[(F[:,0]!=F[:,1])&(F[:,1]!=F[:,2])&(F[:,0]!=F[:,2])]
    me=bpy.data.meshes.new(name);me.from_pydata(V.tolist(),[],F.tolist());me.update()
    me.materials.append(m)
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    if decimate:
        o=obj(name+'_tmp',me);d=o.modifiers.new('d','DECIMATE');d.ratio=decimate
        dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg);nm=bpy.data.meshes.new_from_object(e,depsgraph=dg);bpy.data.objects.remove(o);me=nm;me.name=name
    me.shade_smooth();me.set_sharp_from_angle(angle=math.radians(smooth))
    return me
def tris_of(root=None):
    t=0
    for o in bpy.data.objects:
        if o.type=='MESH':t+=sum(len(p.vertices)-2 for p in o.data.polygons)
    return t
def plaque(text,sub,x,y,z,m_plate,m_text,w=11,h=2.1,parent=None,rx=math.pi/2,name='plaque'):
    """A brass nameplate, standing on the XZ plane and facing -Y."""
    p=obj(name,box(w,.12,h,m_plate,bevel=.03,seg=1),parent,(x,y,z))
    def label(s,size,dz):
        c=bpy.data.curves.new('t','FONT');c.body=s;c.size=size;c.align_x='CENTER';c.align_y='CENTER';c.extrude=.012;c.space_character=1.12
        o=bpy.data.objects.new('t',c);coll().objects.link(o);dg=bpy.context.evaluated_depsgraph_get();me=bpy.data.meshes.new_from_object(o.evaluated_get(dg),depsgraph=dg);bpy.data.objects.remove(o);bpy.data.curves.remove(c)
        me.materials.append(m_text);return obj('txt',me,p,(0,-.075,dz),(rx,0,0))
    label(text,h*.3,h*.13);label(sub,h*.17,-h*.27)
    for sx in (-1,1):
        s=obj('screw',cyl(.09,.05,m_text,seg=10),p,(sx*(w/2-.3),-.07,0),(rx,0,0))
    return p
def plinth(w,d,m_body,m_trim,h=2.2,r=1.4,name='plinth'):
    """Display base: enamel block on a brass-edged foot, top surface at z=0."""
    def rr(w,d,r,seg=8):
        pts=[]
        for cx,cy,a0 in ((w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)):
            for i in range(seg+1):
                a=math.radians(a0+90*i/seg);pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
        return pts
    g=obj(name,bpy.data.meshes.new('e'))
    top=obj('plinth_top',poly_mesh([{'outer':rr(w,d,r)}],h*.72,'plinth_top',m_body),g,(0,0,-h*.36))
    trim=obj('plinth_trim',poly_mesh([{'outer':rr(w+.5,d+.5,r+.25)}],h*.2,'plinth_trim',m_trim),g,(0,0,-h*.82))
    foot=obj('plinth_foot',poly_mesh([{'outer':rr(w+.1,d+.1,r+.05)}],h*.1,'plinth_foot',m_body),g,(0,0,-h*.97))
    for o in (top,trim,foot):o.data.shade_flat() if False else None
    return g
def render(out,views,cx=(0,0,5),dist=70,size=(1000,750),engine='CYCLES',samples=48,ortho=None,lens=70,bg=(.16,.2,.23)):
    s=bpy.context.scene
    s.render.engine=engine
    if engine=='CYCLES':
        s.cycles.samples=samples;s.cycles.use_denoising=True;s.cycles.device='CPU';s.cycles.max_bounces=5
    s.render.resolution_x,s.render.resolution_y=size
    w=bpy.data.worlds.new('w');w.use_nodes=True;n=w.node_tree.nodes;n['Background'].inputs[0].default_value=(*bg,1);n['Background'].inputs[1].default_value=1;s.world=w
    if 'keyL' not in bpy.data.objects:
        for nm,e,rot in (('keyL',3.2,(.9,.1,.6)),('fillL',1.1,(1.1,-.3,-2.2))):
            l=bpy.data.lights.new(nm,'SUN');l.energy=e;l.angle=.25;o=obj(nm,l);o.rotation_euler=rot
    cam=bpy.data.objects.get('cam') or obj('cam',bpy.data.cameras.new('cam'))
    cam.data.lens=lens;s.camera=cam;cam.data.clip_end=5000
    for k,dv in views.items():
        d=Vector(dv).normalized();c=Vector(cx);cam.location=c+d*dist
        cam.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update()
        s.render.filepath=f'{out}_{k}.png';bpy.ops.render.render(write_still=True)
def export(path,scale=.01):
    """Join static parts by material, keep named movers apart, scale to metres, write a GLB."""
    bpy.ops.object.select_all(action='DESELECT')
    root=bpy.data.objects.new('root',None);coll().objects.link(root);root.scale=(scale,)*3
    for o in bpy.data.objects:
        if o.parent is None and o is not root and o.type in('MESH','EMPTY'):o.parent=root
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_apply=True,export_yup=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_animations=False,export_extras=True)
def join_static(keep=('tyre','rim_shared','prop','mover')):
    """Bake transforms and merge everything that is not a named mover, by material."""
    dg=bpy.context.evaluated_depsgraph_get()
    groups={}
    for o in [x for x in bpy.data.objects if x.type=='MESH']:
        if any(o.name.startswith(k) for k in keep) or any(a.name.startswith('mover') for a in _anc(o)):continue
        groups.setdefault(id(o),o)
    bpy.context.view_layer.update()
    merged={}
    bm_by={}
    for o in list(groups.values()):
        me=o.data
        if not me.polygons:continue
        bm=bmesh.new();bm.from_mesh(me);bmesh.ops.transform(bm,matrix=o.matrix_world,verts=bm.verts)
        if o.matrix_world.determinant()<0:bmesh.ops.reverse_faces(bm,faces=bm.faces)
        tmp=bpy.data.meshes.new('t');bm.to_mesh(tmp);bm.free()
        for i,m in enumerate(me.materials):
            bm_by.setdefault(m.name,[]).append((tmp,i))
    for name,lst in bm_by.items():
        out=bmesh.new()
        cdsharp=None
        for tmp,i in lst:
            b2=bmesh.new();b2.from_mesh(tmp);rm=[f for f in b2.faces if f.material_index!=i]
            bmesh.ops.delete(b2,geom=rm,context='FACES_ONLY');
            for f in b2.faces:f.material_index=0
            t2=bpy.data.meshes.new('t2');b2.to_mesh(t2);b2.free();out.from_mesh(t2);bpy.data.meshes.remove(t2)
        me=bpy.data.meshes.new('M_'+name);out.to_mesh(me);out.free();me.materials.append(bpy.data.materials[name]);merged[name]=me
    for o in list(groups.values()):
        bpy.data.objects.remove(o)
    for _ in range(4):
        for o in [x for x in bpy.data.objects if x.type=='EMPTY' and not x.children and not x.name.startswith('mover')]:bpy.data.objects.remove(o)
    for n,me in merged.items():obj('M_'+n,me)
def _anc(o):
    while o.parent:
        o=o.parent;yield o

def bake_ao(path,size=1536,samples=32,skip=('tyre','rim_shared'),distance=6):
    """Bake ambient occlusion into one atlas and route it to each material's glTF occlusion slot."""
    s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=samples;s.cycles.use_denoising=False
    s.world=s.world or bpy.data.worlds.new('w')
    s.world.light_settings.distance=distance
    obs=[o for o in bpy.data.objects if o.type=='MESH' and o.data.polygons and not any(o.name.startswith(k) for k in skip)]
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs:o.select_set(True)
    bpy.context.view_layer.objects.active=obs[0]
    for o in obs:
        if 'ao' not in o.data.uv_layers:o.data.uv_layers.new(name='ao')
        o.data.uv_layers.active=o.data.uv_layers['ao']
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(58),island_margin=.0025,area_weight=.6,scale_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    img=bpy.data.images.new('ao',size,size,alpha=False);img.generated_color=(1,1,1,1);img.colorspace_settings.name='Non-Color'
    used=set(m for o in obs for m in o.data.materials)
    for m in used:
        t=m.node_tree;n=t.nodes.new('ShaderNodeTexImage');n.image=img;n.name='AO';t.nodes.active=n
        n.select=True
    bpy.ops.object.bake(type='AO',margin=6,use_clear=True,use_selected_to_active=False)
    # tame and pack
    a=np.array(img.pixels[:]).reshape(size,size,4)
    a[:,:,:3]=np.clip(a[:,:,:3]*1.02,0,1)**.8
    img.pixels=a.ravel().tolist();img.filepath_raw=path;img.file_format='PNG';img.save()
    grp=bpy.data.node_groups.get('glTF Material Output') or bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree')
    if 'Occlusion' not in [i.name for i in grp.interface.items_tree]:
        grp.interface.new_socket('Occlusion',in_out='INPUT',socket_type='NodeSocketFloat')
    for m in used:
        t=m.node_tree;n=t.nodes['AO'];uv=t.nodes.new('ShaderNodeUVMap');uv.uv_map='ao';t.links.new(uv.outputs[0],n.inputs[0])
        sc=t.nodes.new('ShaderNodeSeparateColor');t.links.new(n.outputs[0],sc.inputs[0])
        g=t.nodes.new('ShaderNodeGroup');g.node_tree=grp;t.links.new(sc.outputs[0],g.inputs[0])
