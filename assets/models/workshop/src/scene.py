"""Build the dressed Workshop and save a .blend ready for baking.

blender -b --python scene.py -- WORK

WORK must hold tex/atlas.json and strata_parts.json (see rebuild.sh). carzone.json, if present,
is the MP4/4's footprint and drive sweep; the build stops if dressing would sit in its way."""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit
from kit import *
import mats, room, bench, carkit, shelf, details

WORK = sys.argv[sys.argv.index('--') + 1]
kit.start(os.path.join(WORK, 'tex', 'atlas.json'))
W = mats.build()
F = {'floor': M('room_floor', '#7c776e', .8, bounce='#8a857a'), 'wall': M('room_wall', '#cbbda5', .9, bounce='#cdbfa6'),
     'ceiling': M('room_ceiling', '#d8cebd', .9)}
room.build(W, F)
bench.build(W, json.load(open(os.path.join(WORK, 'strata_parts.json'))))
carkit.build(W)
shelf.build(W)
details.build(W)

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
