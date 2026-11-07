"""Shared helpers for the home Workshop. Everything is placed in page units: metres, y up and
z towards the visitor, the same numbers workshop.js uses. ROOT turns that into Blender's z-up
space and the glTF exporter turns it straight back."""
import sys, os, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'vending', 'src'))
from lib import *  # noqa: F401,F403  bevelled boxes, cylinders, rods, tubes from the vending build
import bmesh
from mathutils import Vector, Matrix, Euler

ROOT = None
TABLE = {}
ATLAS = {}
Yr = (math.pi / 2, 0, 0)   # stand a cylinder up (its own axis is z)
Xr = (0, math.pi / 2, 0)   # lay a cylinder along x

# Room numbers shared with workshop-room.js.
RW, RD, RH = 10.6, 7.6, 4.3
HX, HZ = RW / 2, RD / 2
WZ0, WZ1, WY0, WY1 = -3.45, -.35, .8, 3.75


def start(atlas=None):
    global ROOT
    reset(); MATS.clear(); TABLE.clear()
    if atlas: ATLAS.update(json.load(open(atlas)))
    ROOT = bpy.data.objects.new('ROOT', None); coll().objects.link(ROOT)
    ROOT.rotation_euler = (math.pi / 2, 0, 0)
    return ROOT


def M(name, color='#888888', rough=.6, metal=0, tex=None, tile=None, emit=None, emit_str=1, bounce=None, vc=False, **kw):
    """A plain Blender material for the bake, plus the record the page rebuilds it from."""
    if name in MATS: return MATS[name]
    m = mat(name, bounce or color, rough, metal, emit=emit, emit_str=emit_str)
    TABLE[name] = dict(color=color, rough=rough, metal=metal, tex=tex, tile=tile, emit=emit, emit_str=emit_str, vc=vc, **kw)
    return m


def frame(name, loc=(0, 0, 0), rot=(0, 0, 0), scale=1, parent=None):
    """A local frame (an empty) so a piece of furniture can be built in its own coordinates."""
    e = bpy.data.objects.new(name, None); coll().objects.link(e)
    e.parent = parent or ROOT; e.location = loc; e.rotation_euler = rot; e.scale = (scale,) * 3
    return e


def S(name, me, loc=(0, 0, 0), rot=(0, 0, 0), g='mid', parent=None, scale=None, bake_only=False, wear=None):
    """Place a static part. g is its lightmap group."""
    o = bpy.data.objects.new(name, me); coll().objects.link(o)
    o.parent = parent or ROOT; o.location = loc; o.rotation_euler = rot; o['g'] = g
    if scale is not None: o.scale = scale if hasattr(scale, '__len__') else (scale,) * 3
    if bake_only: o['bakeonly'] = 1
    if wear: o['wear'] = json.dumps(wear)
    return o


def B(name, size, loc, m, g='mid', bevel=.004, rot=(0, 0, 0), parent=None, seg=2, **kw):
    sx, sy, sz = size
    return S(name, box(sx, sy, sz, m, bevel=min(bevel, min(size) / 2.2) if bevel else 0, name=name, seg=seg), loc, rot, g, parent, **kw)


def C(name, r, h, loc, m, g='mid', rot=Yr, parent=None, seg=24, r2=None, bevel=0, **kw):
    return S(name, cyl(r, h, m, seg=seg, r2=r2, bevel=bevel, name=name), loc, rot, g, parent, **kw)


def R(name, a, b, r, m, g='mid', parent=None, seg=10):
    o = rod(a, b, r, m, seg=seg, parent=parent or ROOT, name=name); o['g'] = g
    return o


def T(name, points, r, m, g='mid', parent=None, seg=8, res=6, closed=False):
    return S(name, tube(points, r, m, seg=seg, name=name, res=res, closed=closed), g=g, parent=parent)


def rr(x0, y0, x1, y1, r=.03, seg=4):
    w = [(x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180), (x1 - r, y0 + r, 270)]; p = []
    for cx, cy, a0 in w:
        for i in range(seg + 1):
            t = math.radians(a0 + 90 * i / seg); p.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return p


def circ(x, y, r, n=16): return [(x + r * math.cos(TAU * i / n), y + r * math.sin(TAU * i / n)) for i in range(n)]


def plate(outer, t, m, holes=(), bevel=.0015, name='plate'):
    """A cut flat part, thickness along local z, with its edges broken so they catch light."""
    me = poly_mesh([{'outer': outer, 'holes': list(holes)}], t, name, m)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    if bevel:
        e = [x for x in bm.edges if len(x.link_faces) == 2 and x.calc_face_angle(0) > .9]
        bmesh.ops.bevel(bm, geom=e, offset=bevel, segments=1, profile=.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(38)); return me


def card(w, h, key, m, t=0, name='print'):
    """A flat print facing +z mapped to an atlas entry. t>0 gives it a paper thickness."""
    u0, v0, u1, v1 = ATLAS[key]
    bm = bmesh.new(); l = bm.loops.layers.uv.new('UVMap')
    z = t / 2
    v = [bm.verts.new(p) for p in ((-w / 2, -h / 2, z), (w / 2, -h / 2, z), (w / 2, h / 2, z), (-w / 2, h / 2, z))]
    f = bm.faces.new(v)
    for lp, c in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[l].uv = c
    if t:
        back = [bm.verts.new((p.co.x, p.co.y, -z)) for p in v]
        fb = bm.faces.new(back[::-1])
        for lp in fb.loops: lp[l].uv = (u0, v0)
        for i in range(4):
            fs = bm.faces.new((v[i], back[i], back[(i + 1) % 4], v[(i + 1) % 4]))
            for lp in fs.loops: lp[l].uv = (u0 + .0005, v0 + .0005)
    me = from_bm(bm, name, m); me['atlas'] = 1
    return me


def lathe(prof, m, seg=24, name='lathe', smooth=45):
    """Spin (radius, height) points around the mesh's own y axis."""
    bm = bmesh.new(); rings = []
    for r, y in prof:
        rings.append([bm.verts.new((r * math.cos(TAU * i / seg), y, r * math.sin(TAU * i / seg))) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            try: bm.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i]))
            except ValueError: pass
    if prof[0][0] > 1e-4: bm.faces.new(rings[0][::-1])
    if prof[-1][0] > 1e-4: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bm(bm, name, m, smooth=smooth)


def hexprism(r, h, m, name='hex'):
    return cyl(r, h, m, seg=6, name=name)


def spanner(l, w):
    """Open-ended spanner outline on z=0, jaw at +y, ring at -y."""
    j = w * 1.05
    return [(-w * .3, -l / 2), (w * .3, -l / 2), (w * .26, l / 2 - j), (j * .62, l / 2 - j * .5), (j * .62, l / 2 + j * .1), (j * .2, l / 2 + j * .32),
            (j * .2, l / 2 - j * .05), (-j * .2, l / 2 - j * .05), (-j * .2, l / 2 + j * .32), (-j * .62, l / 2 + j * .1), (-j * .62, l / 2 - j * .5), (-w * .26, l / 2 - j)]


def drape(w, d, drop, m, folds=5, name='cloth', seed=1):
    """A cloth lying on a surface (its top at y=0, extending -z..+z by d) and falling over the +z edge by drop."""
    import random
    rnd = random.Random(seed)
    nx, nz = 18, 16
    bm = bmesh.new(); grid = []
    total = d + drop
    for j in range(nz + 1):
        s = j / nz * total; row = []
        for i in range(nx + 1):
            x = (i / nx - .5) * w
            ripple = math.sin(i / nx * math.pi * folds + rnd.random() * .3) * .006
            if s <= d:
                p = (x, .002 + abs(ripple) * .6 + .004 * math.sin(s * 40 + x * 30) ** 2, -d / 2 + s)
            else:
                t = s - d
                hang = min(1, t / .03)
                p = (x * (1 - .08 * t / max(drop, 1e-3)), -t, d / 2 + .004 + ripple * 2.4 * hang + .01 * hang)
            row.append(bm.verts.new(p))
        grid.append(row)
    for j in range(nz):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.004)
    bm.normal_update()
    return from_bm(bm, name, m, smooth=70)


# ---------------------------------------------------------------------------
def _tile_uvs(o, tile):
    """World-scale box UVs, with the long side of each part running along U so grain follows the length."""
    me = o.data
    if 'UVMap' not in me.uv_layers: me.uv_layers.new(name='UVMap')
    bm = bmesh.new(); bm.from_mesh(me); l = bm.loops.layers.uv['UVMap']
    mw = o.matrix_world
    corners = [mw @ Vector(c) for c in o.bound_box]
    span = [max(c[k] for c in corners) - min(c[k] for c in corners) for k in range(3)]
    for f in bm.faces:
        n = (mw.to_3x3() @ f.normal); ax = max(range(3), key=lambda k: abs(n[k]))
        rest = [k for k in range(3) if k != ax]
        # the longer extent of the part along the two remaining axes runs along U, so grain follows length
        if span[rest[1]] > span[rest[0]]: rest = rest[::-1]
        for lp in f.loops:
            p = mw @ lp.vert.co
            lp[l].uv = (p[rest[0]] / tile, p[rest[1]] / tile)
    bm.to_mesh(me); bm.free()


def _wear(o, spec):
    """Vertex colour: 1 is clean. Bevel faces (not axis-aligned) pick up wear; low parts pick up grime."""
    me = o.data; mw = o.matrix_world
    col = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    edge = spec.get('edge', 0); grime = spec.get('grime', 0); tint = spec.get('tint', [1.25, 1.2, 1.12])
    import random; rnd = random.Random(len(me.vertices))
    for poly in me.polygons:
        n = (mw.to_3x3() @ poly.normal).normalized()
        isedge = max(abs(n.x), abs(n.y), abs(n.z)) < .93
        for li in poly.loop_indices:
            p = mw @ me.vertices[me.loops[li].vertex_index].co
            c = [1, 1, 1]
            if isedge and rnd.random() < edge: c = tint[:]
            h = p.z  # Blender z is page y
            if grime and h < .18:
                k = 1 - grime * (1 - h / .18); c = [x * k for x in c]
            col.data[li].color = (min(1, c[0] / 1.3), min(1, c[1] / 1.3), min(1, c[2] / 1.3), 1)


def join():
    """Bake transforms, then merge statics by lightmap group and material (bake-only parts separately)."""
    bpy.context.view_layer.update()
    for o in [x for x in bpy.data.objects if x.type == 'MESH']:
        me = o.data
        if me.users > 1: o.data = me = me.copy()
        mats = [m.name for m in me.materials]
        rec = TABLE.get(mats[0], {}) if mats else {}
        if rec.get('tile') and not me.get('atlas'): _tile_uvs(o, rec['tile'])
        if 'UVMap' not in me.uv_layers: me.uv_layers.new(name='UVMap')
        if 'Col' not in me.color_attributes:
            c = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
            for d in c.data: d.color = (1 / 1.3, 1 / 1.3, 1 / 1.3, 1)
        if o.get('wear'): _wear(o, json.loads(o['wear']))
    groups = {}
    for o in [x for x in bpy.data.objects if x.type == 'MESH']:
        if not o.data.polygons: continue
        g = o.get('g', 'mid')
        bm = bmesh.new(); bm.from_mesh(o.data); mw = o.matrix_world.copy()
        bmesh.ops.transform(bm, matrix=mw, verts=bm.verts)
        if mw.determinant() < 0: bmesh.ops.reverse_faces(bm, faces=bm.faces)
        tmp = bpy.data.meshes.new('tmp'); bm.to_mesh(tmp); bm.free()
        for i, m in enumerate(o.data.materials): groups.setdefault((g, m.name, bool(o.get('bakeonly'))), []).append((tmp, i))
    for o in [x for x in bpy.data.objects if x.type == 'MESH']: bpy.data.objects.remove(o)
    for (g, mn, bo), lst in groups.items():
        b = bmesh.new()
        for tmp, i in lst:
            b2 = bmesh.new(); b2.from_mesh(tmp)
            bmesh.ops.delete(b2, geom=[f for f in b2.faces if f.material_index != i], context='FACES_ONLY')
            for f in b2.faces: f.material_index = 0
            t2 = bpy.data.meshes.new('t2'); b2.to_mesh(t2); b2.free(); b.from_mesh(t2); bpy.data.meshes.remove(t2)
        name = ('bake__' if bo else '') + f'{g}__{mn}'
        me = bpy.data.meshes.new(name); b.to_mesh(me); b.free(); me.materials.append(bpy.data.materials[mn])
        o = bpy.data.objects.new(name, me); coll().objects.link(o); o['g'] = g
        if bo: o['bakeonly'] = 1
    for me in [x for x in bpy.data.meshes if x.users == 0]: bpy.data.meshes.remove(me)
    for e in [x for x in bpy.data.objects if x.type == 'EMPTY']: bpy.data.objects.remove(e)


def tris(objs=None):
    n = 0
    for o in objs or bpy.data.objects:
        if o.type == 'MESH': n += sum(len(p.vertices) - 2 for p in o.data.polygons)
    return n
