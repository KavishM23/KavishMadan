"""Day and night light rigs for the bake. Positions are page units (x, y up, z to the visitor).

Day: soft light through the window, a little low sun, and warm bounce from the open front of the set.
Night: cool dusk at the window and warm pools from the lamps people would actually switch on: the
bench task lamp, the shelf clamp lamp and the work lamp over the car."""
import bpy, math
from mathutils import Vector
from lib import srgb

P = lambda x, y, z: Vector((x, -z, y))


def clear():
    for o in [o for o in bpy.data.objects if o.type == 'LIGHT']: bpy.data.objects.remove(o)


def lamp(n, kind, loc, color, energy, size=.3, at=None, spot=None, shape='RECTANGLE'):
    l = bpy.data.lights.new(n, kind); l.color = srgb(color)[:3]; l.energy = energy
    if kind in ('POINT', 'SPOT'): l.shadow_soft_size = size
    if kind == 'SPOT': l.spot_size, l.spot_blend = spot
    if kind == 'AREA':
        l.shape = shape
        if shape in ('RECTANGLE', 'ELLIPSE'): l.size, l.size_y = size
        else: l.size = size
    if kind == 'SUN': l.angle = size
    o = bpy.data.objects.new(n, l); bpy.context.scene.collection.objects.link(o); o.location = P(*loc)
    if at: o.rotation_euler = (P(*at) - P(*loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


def world(color, strength):
    w = bpy.data.worlds.get('bake') or bpy.data.worlds.new('bake'); w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = srgb(color); bg.inputs[1].default_value = strength
    bpy.context.scene.world = w


def glow(on):
    for m in bpy.data.materials:
        b = m.node_tree.nodes.get('Principled BSDF') if m.node_tree else None
        if b and m.name == 'bulb': b.inputs['Emission Strength'].default_value = 40 if on else 0


def rig(theme):
    clear()
    if theme == 'day':
        world('#f3e7d3', .55)
        # the window as a soft sky panel, just outside the glass, facing in
        lamp('window sky', 'AREA', (-5.75, 2.28, -1.9), '#f3f1ea', 1700, (3.1, 2.95), at=(0, 1.6, -1.9))
        lamp('sun', 'SUN', (-9.5, 6.1, -3.1), '#ffe2bd', 2.2, math.radians(4), at=(.2, 0, -.6))
        # light bouncing back in from the open front of the set, low and warm
        lamp('front bounce', 'AREA', (0, 2.2, 6.5), '#f5e6cf', 520, (10, 4), at=(0, 1.2, -2))
        lamp('ceiling bounce', 'AREA', (0, 4.2, 0), '#f6efe2', 140, (8, 6), at=(0, 0, 0))
        lamp('day sign bounce', 'AREA', (.18, 2.48, -3.59), '#91d6c7', 5, (.93, .36), at=(.18, 2.45, -3.8))
        glow(False)
    else:
        world('#1a2533', .18)
        lamp('window dusk', 'AREA', (-5.75, 2.28, -1.9), '#6f93c9', 300, (3.1, 2.95), at=(0, 1.2, -1.9))
        lamp('front dusk', 'AREA', (0, 2.5, 6.5), '#7d98bd', 94, (10, 4), at=(0, 1.2, -2))
        # the work lamp the page also lights over the car
        lamp('work lamp', 'SPOT', (.2, 3.97, -.1), '#ffcd8f', 520, .25, at=(.25, 0, -.5), spot=(math.radians(88), .85))
        lamp('work lamp fill', 'POINT', (.2, 3.95, -.1), '#ffcd8f', 25, .4)
        # bench task lamp, aimed at the half-built Strata
        lamp('task lamp', 'SPOT', (-3.6, 1.38, -3.38), '#ffc27a', 190, .02, at=(-4.15, .955, -3.3), spot=(math.radians(95), .55))
        lamp('task glow', 'POINT', (-3.59, 1.39, -3.4), '#ffc27a', 4, .03)
        # clamp lamp on the shelving end, into the shelves
        lamp('clamp lamp', 'SPOT', (4.52, 2.6, -.78), '#ffcb88', 160, .02, at=(4.86, 1.4, -1.8), spot=(math.radians(95), .7))
        lamp('neon wall bounce', 'AREA', (.18, 2.48, -3.58), '#80d9c6', 28, (.99, .35), at=(.18, 2.45, -3.8))
        lamp('neon reflected fill', 'AREA', (.18, 2.48, -3.65), '#83d9c4', 13, (.99, .35), at=(.3, 1.5, -1.2))
        glow(True)


def camera(pos, look, fov=31, aspect=1.6):
    s = bpy.context.scene
    c = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if c.name not in s.collection.objects: s.collection.objects.link(c)
    c.data.sensor_fit = 'VERTICAL'; c.data.sensor_height = 24; c.data.lens = 12 / math.tan(math.radians(fov) / 2); c.data.clip_end = 200
    s.camera = c; c.location = P(*pos); c.rotation_euler = (P(*look) - P(*pos)).to_track_quat('-Z', 'Y').to_euler()
    return c
