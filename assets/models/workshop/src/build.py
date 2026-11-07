"""Build the fixed Workshop detail and Cycles lightmaps (Blender 4.2 LTS).

Run with: blender -b --python assets/models/workshop/src/build.py -- SIZE SAMPLES
The coordinates below are the shipped Three.js room, converted from Y-up to
Blender's Z-up. The MP4/4 and all interactive props are deliberately absent
from the room bake, so their shadows travel with them.
"""
import math
import os
import sys
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE.parents[1] / "vending" / "src"))
import lib  # the vending room's bevelled mesh and material helpers

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SIZE = int(args[0]) if args else 1024
SAMPLES = int(args[1]) if len(args) > 1 else 48
OUT = ROOT / "workshop"
OUT.mkdir(exist_ok=True)
lib.reset()
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = SAMPLES
scene.cycles.max_bounces = 5
scene.cycles.diffuse_bounces = 4
scene.cycles.glossy_bounces = 1
scene.render.bake.margin = 5
scene.render.bake.target = "IMAGE_TEXTURES"
scene.render.bake.use_pass_color = False
scene.render.bake.use_pass_direct = True
scene.render.bake.use_pass_indirect = True
scene.view_settings.view_transform = "Standard"

plaster = lib.mat("warm lime plaster", "#d0c0a8", .91)
concrete = lib.mat("trowelled concrete", "#77736b", .87)
oak = lib.mat("oiled oak", "#a77b50", .59)
oak_edge = lib.mat("end grain", "#805b3d", .78)
teal = lib.mat("teal enamel", "#557a79", .47, .3)
steel = lib.mat("blackened steel", "#303a3d", .5, .75)
silver = lib.mat("brushed nickel", "#b6b8b3", .38, .82)
paper = lib.mat("drawing paper", "#e7dfcd", .88)
red = lib.mat("red toolbox", "#a45140", .42, .25)
rubber = lib.mat("rubber", "#222427", .85)
glass = lib.mat("glass", "#d8e4e1", .16)
MATERIALS = list(lib.MATS.values())

def v(p):
    """Three XYZ to Blender XYZ."""
    return (p[0], -p[2], p[1])

def cube(name, size, loc, material, bevel=0, detail=False):
    w, h, d = size
    o = lib.obj(name, lib.box(w, d, h, material, bevel=min(bevel, min(size) / 3), name=name), loc=v(loc))
    o["detail"] = detail
    return o

def line(name, a, b, radius, material, detail=True, sides=10):
    o = lib.rod(v(a), v(b), radius, material, seg=sides, name=name)
    o["detail"] = detail
    return o

def pin(name, radius, depth, loc, material, detail=True):
    o = lib.obj(name, lib.cyl(radius, depth, material, seg=12, name=name), loc=v(loc))
    o["detail"] = detail
    return o

def plane(name, coords, normal, material, uvs, detail=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata([v(p) for p in coords], [], [(0, 1, 2), (0, 2, 3)])
    me.materials.append(material)
    uv = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        for li in poly.loop_indices:
            uv.data[li].uv = uvs[me.loops[li].vertex_index]
    me.update()
    o = lib.obj(name, me)
    o["detail"] = detail
    o["lightmap"] = name.split("_")[0]
    return o

RW, RD, RH, HX, HZ = 10.6, 7.6, 4.3, 5.3, 3.8
WZ0, WZ1, WY0, WY1 = -3.45, -.35, .8, 3.75
floor = plane("floor_main", [(-HX, 0, HZ), (HX, 0, HZ), (HX, 0, -HZ), (-HX, 0, -HZ)], None, concrete,
              [(0, 0), (1, 0), (1, 1), (0, 1)])
back = plane("back_main", [(-HX, 0, -HZ), (HX, 0, -HZ), (HX, RH, -HZ), (-HX, RH, -HZ)], None, plaster,
             [(0, 0), (1, 0), (1, 1), (0, 1)])
right = plane("right_main", [(HX, 0, -HZ), (HX, 0, HZ), (HX, RH, HZ), (HX, RH, -HZ)], None, plaster,
              [(0, 0), (1, 0), (1, 1), (0, 1)])
for i, (z0, z1, y0, y1) in enumerate([
    (-HZ, HZ, 0, WY0), (-HZ, HZ, WY1, RH),
    (-HZ, WZ0, WY0, WY1), (WZ1, HZ, WY0, WY1),
]):
    plane(f"left_{i}", [(-HX, y0, z1), (-HX, y0, z0), (-HX, y1, z0), (-HX, y1, z1)], None, plaster,
          [((HZ-z1)/RD, y0/RH), ((HZ-z0)/RD, y0/RH), ((HZ-z0)/RD, y1/RH), ((HZ-z1)/RD, y1/RH)])

# Full-depth jambs and the wall/floor joint. Existing runtime wall finishes stay
# visible; these pieces supply the missing silhouette, joinery and contact shade.
for z in (WZ0, WZ1):
    cube("window return", (.29, WY1-WY0, .04), (-HX-.145, (WY0+WY1)/2, z), plaster, .005, True)
cube("sill oak top", (.43, .055, WZ1-WZ0+.22), (-HX+.055, WY0-.018, (WZ0+WZ1)/2), oak, .012, True)
cube("sill front lip", (.045, .06, WZ1-WZ0+.24), (-HX+.26, WY0-.065, (WZ0+WZ1)/2), oak_edge, .006, True)
for x in (-4.85, -3.2, -1.55, .1, 1.75, 3.4, 4.85):
    cube("back baseboard", (.09 if abs(x)>4.8 else 1.62, .15, .026), (x, .075, -HZ+.018), oak_edge, .004, True)
for z in (-2.9, -1.1, .7, 2.5):
    cube("right baseboard", (.026, .15, 1.8), (HX-.018, .075, z), oak_edge, .004, True)
for z in (1.0, 2.7):
    cube("left baseboard", (.026, .15, 1.7), (-HX+.018, .075, z), oak_edge, .004, True)
for x in (-4.6, -2.4, 0, 2.4, 4.6):
    cube("floor expansion joint", (.012, .002, RD-.16), (x, .001, 0), concrete, 0, True)

# Workbench location and dimensions match workshop.js. The original bench and
# its interactive props remain; the GLB adds details that meet their supports.
BX, BZ, BH = -3.7, -3.36, .92
def bench(name, size, p, material, bevel=.003):
    return cube(name, size, (BX+p[0], p[1], BZ+p[2]), material, bevel, True)
def bline(name, a, b, r, material):
    return line(name, (BX+a[0], a[1], BZ+a[2]), (BX+b[0], b[1], BZ+b[2]), r, material)
for x in (-1.2, 1.2):
    for z in (-.31, .31):
        bench("bench welded corner", (.115, .055, .115), (x, .86, z), steel, .005)
        for y in (.27, .86):
            pin("bench bolt", .012, .006, (BX+x, y, BZ+z+.053), silver)
for z in (-.31, .31):
    bench("bench lower rail", (2.44, .04, .035), (0, .27, z), steel)
for x in (-1.12, 1.12):
    bench("bench end rail", (.035, .04, .65), (x, .27, 0), steel)
for i in range(3):
    y = BH-.2-i*.185
    bench("drawer side runner", (.5, .012, .035), (.91, y, -.22), steel)
    bench("drawer side runner", (.5, .012, .035), (.91, y, .22), steel)
    for x in (.84, 1.10):
        pin("drawer pull mount", .012, .015, (BX+x, y, BZ+.267), silver)
for x in (-1.2, 1.2):
    bench("pegboard spacer", (.035, 1.1, .065), (x, 1.86, -.46), oak_edge)
for x in (-.95, -.55, -.15, .25, .65, 1.05):
    for y in (1.52, 1.72, 1.92, 2.12):
        bline("peg hook shank", (x, y, -.44), (x, y, -.37), .0045, silver)
        bline("peg hook lip", (x, y, -.37), (x, y+.025, -.35), .004, silver)
for x in (.58, 1.10):
    bench("tin shelf triangular brace", (.03, .29, .03), (x, 2.49, -.36), steel)
    bline("shelf diagonal", (x, 2.37, -.46), (x, 2.64, -.27), .007, steel)
for p in ((1.14, .99, .24), (1.14, 1.10, .24)):
    bench("vise mounting plate", (.26, .014, .28), p, steel, .005)
for x in (1.04, 1.24):
    for z in (.13, .35):
        pin("vise mounting bolt", .012, .008, (BX+x, 1.11, BZ+z), silver)
for x in (.75, .97):
    pin("lamp hinge pin", .018, .025, (BX+x, BH+.42 if x<.8 else BH+.68, BZ-.2), silver)
for a, b in [((.86, BH+.04, -.2), (.92, BH-.02, -.33)),
             ((.92, BH-.02, -.33), (1.1, BH-.025, -.32))]:
    bline("lamp wire", a, b, .0035, rubber)
# A few small, physically supported Strata offcuts and a drawing clip.
for i in range(5):
    x = -.34 + i*.073
    bench("Strata acrylic rib offcut", (.025, .07+i*.012, .055), (x, BH+.055, -.24), red, .002)
for x in (-.25, .25):
    bline("wing drawing clip", (x, BH+.008, .37), (x, BH+.008, .41), .003, silver)

# Room-only occluders for the fixed shelf and bench. Hide at export, but keep
# them in the packed .blend so the baked contact shadows are reproducible.
bench_proxy = cube("bakeonly bench top", (2.75, .075, .78), (BX, BH, BZ), oak, .01)
bench_proxy["bakeonly"] = True
for x in (-4.95, 4.95):
    cube("bakeonly fixed storage", (.7, 2.65, 1.2), (x, 1.325, -2.1), oak, .02)["bakeonly"] = True

def lighting(theme):
    for o in list(bpy.data.objects):
        if o.type == "LIGHT": bpy.data.objects.remove(o, do_unlink=True)
    world = bpy.data.worlds.get("Workshop world") or bpy.data.worlds.new("Workshop world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = ((.55, .65, .72, 1) if theme == "night" else (.85, .88, .82, 1))
    world.node_tree.nodes["Background"].inputs[1].default_value = .10 if theme == "night" else .18
    scene.world = world
    def area(name, p, target, power, size, color):
        data = bpy.data.lights.new(name, "AREA"); data.energy=power; data.shape="DISK"; data.size=size; data.color=color
        ob = lib.obj(name, data, loc=v(p)); ob.rotation_euler = (Vector(v(target))-ob.location).to_track_quat('-Z','Y').to_euler()
    if theme == "day":
        area("large window daylight", (-7.5, 3.2, -1.8), (-.4, .2, -.8), 220, 5.5, (1.0, .86, .68))
        area("ceiling bounce", (0, 3.9, .4), (0, 0, 0), 55, 6, (.82, .88, 1))
    else:
        area("cool dusk through window", (-7.5, 3.0, -1.8), (-1.5, .5, -.8), 72, 4.5, (.45, .63, 1))
        area("bench task lamp", (-2.84, 1.55, -3.5), (-3.7, .7, -3.1), 17, .7, (1, .62, .32))
        area("ceiling work lamp", (.2, 3.65, .4), (.1, 0, 0), 95, 2, (1, .72, .44))

def bake_group(group, theme):
    objects = [o for o in bpy.data.objects if o.type == "MESH" and o.get("lightmap") == group]
    if not objects: return
    image = bpy.data.images.new(f"lm_{theme}_{group}", SIZE, SIZE, alpha=False, float_buffer=True)
    for o in objects:
        for mat in o.data.materials:
            nodes = mat.node_tree.nodes
            node = nodes.get("Workshop bake") or nodes.new("ShaderNodeTexImage")
            node.name = "Workshop bake"; node.image = image; nodes.active = node
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=5)
    image.filepath_raw = str(OUT / f"light-{theme}-{group}.png")
    image.file_format = "PNG"; image.save()
    print("BAKED", theme, group, flush=True)

# Bake metallic surfaces as diffuse, then restore their metalness for export.
metal_values = {m: m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value for m in MATERIALS}
for m in MATERIALS: m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0
for theme in ("day", "night"):
    lighting(theme)
    for group in ("floor", "back", "left", "right"): bake_group(group, theme)
for m, value in metal_values.items(): m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = value

# All editable pieces, lights and bake-only meshes remain in the source file.
for o in bpy.data.objects:
    if o.type == "MESH": o.hide_render = False
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "workshop.blend"))

# Export only the added modelling; the original finish planes, moving props,
# lights, and temporary occluders are supplied by the site or bake source.
bpy.ops.object.select_all(action="DESELECT")
details = [o for o in bpy.data.objects if o.type == "MESH" and o.get("detail")]
for o in details: o.select_set(True)
bpy.context.view_layer.objects.active = details[0]
def export(path):
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                              export_apply=False, export_yup=True, export_materials="EXPORT", export_cameras=False,
                              export_lights=False, export_animations=False)
export(OUT / "detail-raw.glb")
small = ("peg hook", "bench bolt", "drawer pull mount", "vise mounting bolt", "wing drawing clip", "floor expansion joint")
for o in details:
    if o.name.startswith(small): o.select_set(False)
export(OUT / "detail-mobile-raw.glb")
print("EXPORTED", len(details), "detail objects", flush=True)
