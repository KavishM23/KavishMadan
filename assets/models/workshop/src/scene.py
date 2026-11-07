"""Build the dressed Workshop and save a .blend ready for baking.

blender -b --python scene.py -- WORK

WORK must hold tex/atlas.json and strata_parts.json (see rebuild.sh). carzone.json, if present,
is the MP4/4's footprint and drive sweep; the build stops if dressing would sit in its way."""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit
from kit import *
import mats, room, bench, carkit, shelf

WORK = sys.argv[sys.argv.index('--') + 1]
kit.start(os.path.join(WORK, 'tex', 'atlas.json'))
W = mats.build()
F = {'floor': M('room_floor', '#7c776e', .8, bounce='#8a857a'), 'wall': M('room_wall', '#cbbda5', .9, bounce='#cdbfa6'),
     'ceiling': M('room_ceiling', '#d8cebd', .9)}
room.build(W, F)
bench.build(W, json.load(open(os.path.join(WORK, 'strata_parts.json'))))
carkit.build(W)
shelf.build(W)

# ---- bake-only stand-ins for the live props, so their contact shade lands on the room ----
pm = {'dark': M('proxy_dark', '#2a2a2a', .8), 'wood': M('proxy_wood', '#8a5a3c', .8), 'red': M('proxy_red', '#5a2228', .8),
      'metal': M('proxy_metal', '#9a9a96', .5), 'pale': M('proxy_pale', '#d9d0bd', .8)}
p = lambda *a, **k: B(*a, g='proxy', bevel=0, bake_only=True, **k)
Gt = frame('guitar proxy', (-3.1, 0, -1.95), (0, .6, 0))
p('guitar body', (.36, .46, .09), (0, .56, .02), pm['wood'], parent=Gt, rot=(-.12, 0, 0))
R('guitar neck', (0, .8, -.01), (0, 1.75, -.12), .03, pm['wood'], 'proxy', parent=Gt).__setitem__('bakeonly', 1)
for a in (0, 2.1, 4.2):
    R('stand leg', (0, .3, -.05), (math.sin(a) * .28, .01, math.cos(a) * .22 - .05), .012, pm['dark'], 'proxy', parent=Gt).__setitem__('bakeonly', 1)
Lt = frame('laptop proxy', (-2.45, 0, .3), (0, .5, 0), 2.05)
p('laptop base', (.28, .016, .18), (0, .008, .15), pm['dark'], parent=Lt)
p('laptop lid', (.28, .18, .008), (0, .1, .06), pm['dark'], parent=Lt, rot=(-.25, 0, 0))
Bk = frame('book proxy', (-1.72, 0, 2.0), (0, .1, 0), 1.5)
p('book', (.62, .03, .46), (0, .02, 0), pm['pale'], parent=Bk)
St = frame('satellite proxy', (2.62, 0, -2.3), (0, -.2, 0), 1.12)
p('sat base', (.42, .04, .3), (0, .02, 0), pm['dark'], parent=St)
R('sat pole', (0, .04, 0), (0, 1.15, 0), .012, pm['metal'], 'proxy', parent=St).__setitem__('bakeonly', 1)
p('sat bus', (.26, .26, .26), (0, 1.28, 0), pm['metal'], parent=St)
p('sat panels', (1.75, .01, .3), (0, 1.3, 0), pm['dark'], parent=St)
Tp = frame('trophy proxy', (3.72, 0, -.82), (0, -.3, 0), 1.5)
p('trophy plinth', (.2, .12, .17), (0, .06, 0), pm['dark'], parent=Tp)
C('trophy cup', .09, .34, (0, .38, 0), pm['metal'], 'proxy', parent=Tp, r2=.05).__setitem__('bakeonly', 1)
C('tyre proxy', .37, .4, (3.2, .2, 1.5), pm['dark'], 'proxy', seg=40).__setitem__('bakeonly', 1)
Cr = frame('crate proxy', (4.3, 0, .42), (0, -1.28, 0))
p('crate', (.92, .64, .72), (0, .32, 0), pm['red'], parent=Cr)
Sh = frame('shelf proxies', (4.86, 0, -2.2), (0, -math.pi / 2, 0), .96)
for (w, h, d), (x, y) in (((.86, .38, .5), (-1.02, .265)), ((.6, .3, .48), (.39, .265)), ((.72, .38, .5), (-1.05, 1.085)),
                           ((.62, .28, .46), (-.92, 1.465)), ((.7, .28, .46), (1.08, .265))):
    p('case', (w, h, d), (x, y + h / 2, 0), pm['metal'], parent=Sh)
p('binders', (.75, .58, .36), (.45, 1.948 + .29, -.03), pm['dark'], parent=Sh)
p('books', (.42, .2, .3), (1.0, 1.11 + .1, 0), pm['pale'], parent=Sh)
C('plant pot', .11, .19, (4.72, 2.66 + .095, -3.12), pm['wood'], 'proxy').__setitem__('bakeonly', 1)

# ---- keep the car's footprint and drive path clear ----
zone = os.path.join(WORK, 'carzone.json')
if os.path.exists(zone):
    Z = json.load(open(zone))

    def inside(pt, poly):
        x, z = pt; c = False
        for (x1, z1), (x2, z2) in zip(poly, poly[1:] + poly[:1]):
            if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1: c = not c
        return c
    bpy.context.view_layer.update(); bad = []
    for o in bpy.data.objects:
        if o.type != 'MESH' or o.get('bakeonly') or str(o.get('g', '')).startswith('S_'): continue
        cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
        xs = [c.x for c in cs]; zs = [-c.y for c in cs]; ys = [c.z for c in cs]
        if max(ys) < .005 or min(ys) > 1.3: continue
        m = .2; x0, x1, z0, z1 = min(xs) - m, max(xs) + m, min(zs) - m, max(zs) + m
        pts = [(x0, z0), (x1, z0), (x0, z1), (x1, z1), ((x0 + x1) / 2, (z0 + z1) / 2)]
        for poly in Z['sweep'][::2]:
            if any(inside(q, poly) for q in pts) or any(x0 <= a <= x1 and z0 <= b <= z1 for a, b in poly):
                bad.append(o.name); break
    if bad: raise SystemExit('Dressing in the car path: ' + ', '.join(sorted(set(bad))))
    print('car path clear', flush=True)

print('objects', len(bpy.data.objects), 'tris', kit.tris(), flush=True)
kit.join()
print('joined', len(bpy.data.objects), 'tris', kit.tris(), flush=True)
json.dump(kit.TABLE, open(os.path.join(WORK, 'materials.json'), 'w'), indent=0)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, 'workshop.blend'))
