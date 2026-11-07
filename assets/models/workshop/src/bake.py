"""Bake day and night light into the dressing atlas and the four room planes, then export the GLB.

blender -b WORK/workshop.blend --python bake.py -- WORK SAMPLES DRESS_SIZE [DEVICE]

Writes WORK/light-{day,night}-{dress,floor,back,left,right}.exr, WORK/dress_raw.glb and adds the
merged material classes to WORK/materials.json."""
import sys, os, json, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', '..', 'vending', 'src'))
import bpy, bmesh
import lights
from lib import srgb

a = sys.argv[sys.argv.index('--') + 1:]
WORK, SAMPLES, SIZE = a[0], int(a[1]), int(a[2]); DEVICE = a[3] if len(a) > 3 else 'GPU'
SIZES = {'dress': SIZE, 'S_floor': SIZE, 'S_back': SIZE, 'S_left': SIZE // 2, 'S_right': SIZE // 2}
TABLE = json.load(open(os.path.join(WORK, 'materials.json')))

s = bpy.context.scene; s.render.engine = 'CYCLES'
if DEVICE == 'GPU':
    p = bpy.context.preferences.addons['cycles'].preferences; p.compute_device_type = 'METAL'; p.get_devices()
    for d in p.devices: d.use = d.type == 'METAL'
    s.cycles.device = 'GPU'
else:
    s.cycles.device = 'CPU'
s.cycles.samples = SAMPLES; s.cycles.use_denoising = False; s.cycles.max_bounces = 6; s.cycles.diffuse_bounces = 4
s.cycles.glossy_bounces = 1; s.cycles.caustics_reflective = False; s.cycles.caustics_refractive = False
s.render.bake.margin = 6; s.render.bake.use_clear = True

# metals have no diffuse response, so they would bake black: bake everything as a dielectric
for m in bpy.data.materials:
    b = m.node_tree.nodes.get('Principled BSDF') if m.node_tree else None
    if b: b.inputs['Metallic'].default_value = 0; b.inputs['Coat Weight'].default_value = 0

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
dress = [o for o in meshes if o.get('g') == 'dress' and not o.get('bakeonly')]

# one lightmap atlas for all the dressing, in a second UV set
bpy.ops.object.select_all(action='DESELECT')
for o in dress:
    o.select_set(True)
    if 'lm' not in o.data.uv_layers: o.data.uv_layers.new(name='lm')
    o.data.uv_layers.active = o.data.uv_layers['lm']
bpy.context.view_layer.objects.active = dress[0]
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(55), island_margin=.001, area_weight=0, correct_aspect=True, scale_to_bounds=False)
bpy.ops.uv.pack_islands(rotate=True, margin=.0012, shape_method='CONCAVE')
bpy.ops.object.mode_set(mode='OBJECT')


def bake(group, theme):
    obs = [o for o in meshes if o.get('g') == group and not o.get('bakeonly')]
    if group.startswith('S_'):
        for o in obs: o.data.uv_layers.active = o.data.uv_layers['UVMap']
    img = bpy.data.images.new(f'lm_{theme}_{group}', SIZES[group], SIZES[group], alpha=False, float_buffer=True)
    for o in obs:
        for m in o.data.materials:
            t = m.node_tree; n = t.nodes.get('BAKE') or t.nodes.new('ShaderNodeTexImage'); n.name = 'BAKE'; n.image = img; t.nodes.active = n
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=6, use_clear=True)
    name = group.replace('S_', '')
    img.filepath_raw = os.path.join(WORK, f'light-{theme}-{name}.exr'); img.file_format = 'OPEN_EXR'; img.save()
    print('baked', theme, group, len(obs), flush=True)


for theme in ('day', 'night'):
    lights.rig(theme)
    for group in SIZES: bake(group, theme)

# ---- export: drop the bake-only parts, merge plain materials into vertex-coloured classes ----
for m in bpy.data.materials:
    if m.node_tree and 'BAKE' in m.node_tree.nodes: m.node_tree.nodes.remove(m.node_tree.nodes['BAKE'])
for o in [o for o in bpy.data.objects if o.type != 'MESH' or o.get('bakeonly') or o.get('g') != 'dress']:
    bpy.data.objects.remove(o)


def lin(h):
    return srgb(h)[:3]


CLASS = {}
for name, r in TABLE.items():
    if r.get('tex') or r.get('glow') or r.get('glass') or r.get('coat') or name.startswith(('room_', 'proxy_')): continue
    CLASS[name] = 'metal' if r.get('metal', 0) >= .8 else 'paint' if False else 'plastic'
for name in ('frame_blue', 'teal', 'navy', 'shelf_steel', 'vise'): CLASS[name] = 'paint'
TABLE['plastic'] = dict(color='#ffffff', rough=.55, metal=0, vc=True, cls=True)
TABLE['metal'] = dict(color='#ffffff', rough=.3, metal=1, vc=True, cls=True)
TABLE['paint'] = dict(color='#ffffff', rough=.46, metal=.35, tex='powder', vc=True, cls=True)
cls_mats = {}
for c in ('plastic', 'metal', 'paint'):
    r = TABLE[c]
    cm = bpy.data.materials.new(c); cm.use_nodes = True; cls_mats[c] = cm
    b = cm.node_tree.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = r['rough']; b.inputs['Metallic'].default_value = r['metal']
by_class = {}
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    mn = o.data.materials[0].name
    c = CLASS.get(mn)
    me = o.data
    if c:
        col = lin(TABLE[mn]['color']); attr = me.color_attributes['Col']
        for d in attr.data:
            v = d.color; d.color = (v[0] * col[0], v[1] * col[1], v[2] * col[2], 1)
        me.materials[0] = cls_mats[c]; by_class.setdefault(c, []).append(o)
    elif not TABLE.get(mn, {}).get('vc'):
        if 'Col' in me.color_attributes: me.color_attributes.remove(me.color_attributes['Col'])
for c, obs in by_class.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join(); bpy.context.view_layer.objects.active.name = 'dress__' + c
for o in bpy.data.objects:
    o.name = o.data.name = 'dress__' + o.data.materials[0].name
    o.data.uv_layers.active_index = 0
    for ca in [x for x in o.data.color_attributes if x.name != 'Col']: o.data.color_attributes.remove(ca)
    ca = o.data.color_attributes
    if 'Col' in ca: ca.active_color = ca['Col']; ca.render_color_index = ca.find('Col')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(WORK, 'dress_raw.glb'), export_format='GLB', use_selection=True, export_apply=False,
                          export_yup=True, export_materials='EXPORT', export_vertex_color='ACTIVE', export_cameras=False,
                          export_lights=False, export_animations=False, export_tangents=False)
json.dump(TABLE, open(os.path.join(WORK, 'materials.json'), 'w'), indent=0)
print('exported', len(bpy.data.objects), 'meshes', flush=True)
