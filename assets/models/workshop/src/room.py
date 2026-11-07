"""The room around the props: bake surfaces for the four painted planes, the window recess and its
steel frame, sill, skirting, conduit and outlets, the pinboard and the wall-hung kit."""
import math, random
from kit import *


def surface(name, coords, uvs, m):
    """A bake-only plane matching one of the page's finish planes, with the same UVs."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([(p[0], p[1], p[2]) for p in coords], [], [(0, 1, 2, 3)])
    me.materials.append(m)
    uv = me.uv_layers.new(name='UVMap')
    for li in me.polygons[0].loop_indices: uv.data[li].uv = uvs[me.loops[li].vertex_index]
    me['atlas'] = 1
    o = S(name, me, g='S_' + name.split('_')[0])
    return o


def conduit(points, W, g, clip_every=.55, axis=None):
    """Galvanised conduit along a polyline, with saddle clips screwed to the wall."""
    for a, b in zip(points, points[1:]):
        R('conduit', a, b, .0105, W['zinc'], g, seg=12)
        a, b = Vector(a), Vector(b); d = b - a; n = max(1, int(d.length / clip_every))
        for i in range(n):
            p = a + d * ((i + .5) / n)
            wall = Vector(axis)
            S('saddle', box(.026 if abs(d.y) > abs(d.x) + abs(d.z) else .03, .03 if abs(d.y) <= abs(d.x) + abs(d.z) else .026, .026, W['zinc'], bevel=.003, name='saddle'), p - wall * .002, g=g,
              rot=(0, 0, 0))
    for p in points[1:-1]:
        S('elbow', sphere(.0125, W['zinc'], seg=12, ring=8, name='elbow'), p, g=g)


def outlet(p, facing, W, g, double=True):
    """A metal-clad socket box on the wall surface. facing is the wall normal as (x,z)."""
    fx, fz = facing; rot = (0, math.atan2(fx, fz), 0)
    f = frame('outlet', p, rot)
    w = .15 if double else .085
    S('outlet box', box(w, .085, .04, W['zinc'], bevel=.006, name='box'), (0, 0, .02), g=g, parent=f)
    for k in ([-.035, .035] if double else [0]):
        S('socket face', box(.05, .055, .004, W['white_plastic'], bevel=.003, name='face'), (k, 0, .042), g=g, parent=f)
        for dx in (-.01, .01): S('pin hole', box(.004, .011, .002, W['black'], name='pin'), (k + dx, .006, .044), g=g, parent=f)
        S('switch', box(.012, .016, .006, W['white_plastic'], bevel=.002, name='sw'), (k, -.02, .045), g=g, parent=f)
    for dx in (-w / 2 + .012, w / 2 - .012): S('screw', cyl(.004, .003, W['zinc'], seg=10), (dx, 0, .0415), g=g, parent=f)
    return f


def build(W, room_m):
    g = 'dress'
    # ---- bake surfaces, matching workshop-room.js ----
    F = room_m
    surface('floor_main', [(-HX, 0, HZ), (HX, 0, HZ), (HX, 0, -HZ), (-HX, 0, -HZ)], [(0, 0), (1, 0), (1, 1), (0, 1)], F['floor'])
    surface('back_main', [(-HX, 0, -HZ), (HX, 0, -HZ), (HX, RH, -HZ), (-HX, RH, -HZ)], [(0, 0), (1, 0), (1, 1), (0, 1)], F['wall'])
    surface('right_main', [(HX, 0, -HZ), (HX, 0, HZ), (HX, RH, HZ), (HX, RH, -HZ)], [(0, 0), (1, 0), (1, 1), (0, 1)], F['wall'])
    for i, (z0, z1, y0, y1) in enumerate([(-HZ, HZ, 0, WY0), (-HZ, HZ, WY1, RH), (-HZ, WZ0, WY0, WY1), (WZ1, HZ, WY0, WY1)]):
        surface(f'left_{i}', [(-HX, y0, z1), (-HX, y0, z0), (-HX, y1, z0), (-HX, y1, z1)],
                [((HZ - z1) / RD, y0 / RH), ((HZ - z0) / RD, y0 / RH), ((HZ - z0) / RD, y1 / RH), ((HZ - z1) / RD, y1 / RH)], F['wall'])
    # The set has no ceiling on screen, but a bake-only lid makes the light behave like a room.
    B('ceiling', (RW + .6, .08, RD + .4), (0, RH + .04, 0), F['ceiling'], g='proxy', bevel=0, bake_only=True)
    # The four planes block outside light by themselves; a box behind a plane would sit on its surface and black it out.

    # ---- window recess: plaster reveals, a steel frame set back, sealant and putty ----
    WD = .3; wcx = -HX - WD / 2; zc = (WZ0 + WZ1) / 2; zl = WZ1 - WZ0; yc = (WY0 + WY1) / 2; yl = WY1 - WY0
    B('reveal back', (WD, yl + .02, .025), (wcx, yc, WZ0 - .0125), W['plaster'], g, bevel=.006)
    B('reveal front', (WD, yl + .02, .025), (wcx, yc, WZ1 + .0125), W['plaster'], g, bevel=.006)
    B('reveal head', (WD, .025, zl + .05), (wcx, WY1 + .0125, zc), W['plaster'], g, bevel=.006)
    # a rounded plaster arris where each reveal meets the wall face
    for z in (WZ0, WZ1):
        C('arris', .012, yl, (-HX + .002, yc, z), W['plaster'], g, rot=Yr, seg=8)
    C('arris head', .012, zl, (-HX + .002, WY1, zc), W['plaster'], g, rot=(0, 0, 0), seg=8)
    fx = -HX - .2  # frame centre plane, the same as the page's glass
    nz, ny = 5, 4; zs = zl / nz; ys = yl / ny
    for i in range(nz + 1):
        w = .06 if i in (0, nz) else .032
        B('window mullion', (.05, yl, w), (fx, yc, WZ0 + i * zs), W['win_steel'], g, bevel=.004)
    for j in range(ny + 1):
        h = .06 if j in (0, ny) else .032
        B('window transom', (.05, h, zl), (fx, WY0 + j * ys, zc), W['win_steel'], g, bevel=.004)
    # putty fillets on the room side of every pane
    for i in range(nz):
        for j in range(ny):
            z0, z1 = WZ0 + i * zs, WZ0 + (i + 1) * zs; y0, y1 = WY0 + j * ys, WY0 + (j + 1) * ys
            m = .022 if i in (0,) else .02
            for (y, zz, sz, sy) in ((y0 + .022, (z0 + z1) / 2, zs - .04, .007), (y1 - .022, (z0 + z1) / 2, zs - .04, .007)):
                B('putty', (.008, sy, sz), (fx + .02, y, zz), W['sealant'], g, bevel=.002)
            for zz in (z0 + .022, z1 - .022):
                B('putty', (.008, ys - .04, .007), (fx + .02, (y0 + y1) / 2, zz), W['sealant'], g, bevel=.002)
    # mastic bead where the frame meets the plaster
    for z in (WZ0 + .002, WZ1 - .002):
        C('mastic', .006, yl, (fx + .03, yc, z), W['sealant'], g, rot=Yr, seg=6)
    for y in (WY0 + .002, WY1 - .002):
        C('mastic', .006, zl, (fx + .03, y, zc), W['sealant'], g, rot=(0, 0, 0), seg=6)
    # one opening light: a thicker sash, a cockspur handle and a peg stay
    oz0, oz1 = WZ0 + 2 * zs, WZ0 + 3 * zs; oy0, oy1 = WY0 + ys, WY0 + 2 * ys
    for z in (oz0 + .02, oz1 - .02): B('sash', (.02, ys - .02, .014), (fx + .03, (oy0 + oy1) / 2, z), W['win_steel'], g, bevel=.003)
    for y in (oy0 + .02, oy1 - .02): B('sash', (.02, .014, zs - .02), (fx + .03, y, (oz0 + oz1) / 2), W['win_steel'], g, bevel=.003)
    hz = oz1 - .03; hy = (oy0 + oy1) / 2
    B('handle plate', (.006, .05, .016), (fx + .043, hy, hz), W['brass'], g, bevel=.002)
    R('cockspur', (fx + .046, hy, hz), (fx + .07, hy - .07, hz - .008), .0055, W['brass'], g)
    S('handle knob', sphere(.009, W['brass'], seg=12, ring=8), (fx + .07, hy - .07, hz - .008), g=g)
    R('peg stay', (fx + .045, oy0 + .02, oz0 + .1), (fx + .2, oy0 + .02, oz0 + .1), .004, W['brass'], g)
    for k in range(3): C('stay pin', .003, .012, (fx + .1 + k * .035, oy0 + .01, oz0 + .1), W['brass'], g, rot=Yr, seg=8)
    # oak sill with end grain at the ends, and an apron under the nosing
    sx0, sx1 = fx + .03, -HX + .075; sw = zl + .16
    B('sill', (sx1 - sx0, .04, sw), ((sx0 + sx1) / 2, WY0 + .0, zc), W['oak'], g, bevel=.006, wear={'edge': .35, 'tint': [.82, .78, .72]})
    for s in (-1, 1): B('sill end', (sx1 - sx0 - .004, .036, .004), ((sx0 + sx1) / 2, WY0, zc + s * (sw / 2 + .0015)), W['endgrain'], g, bevel=0)
    B('sill apron', (.02, .07, zl + .08), (-HX + .012, WY0 - .055, zc), W['oak'], g, bevel=.004)
    # sill things: a pot plant on a saucer, a jar of brushes, a coil of solder
    pot_p = (-HX + .02, WY0 + .02, -1.1)
    S('saucer', lathe([(0, 0), (.1, 0), (.11, .018), (.103, .02), (.09, .006), (0, .006)], W['terracotta'], 28), pot_p, g=g)
    S('pot', lathe([(0, .006), (.075, .006), (.1, .15), (.108, .152), (.108, .17), (.099, .17), (.093, .155), (0, .155)], W['terracotta'], 28), pot_p, g=g)
    C('soil', .093, .004, (pot_p[0], pot_p[1] + .152, pot_p[2]), W['soil'], g)
    rnd = random.Random(4)
    for i in range(11):
        a = i * 2.39996; h = .26 + rnd.random() * .22; lean = .05 + rnd.random() * .1
        base = Vector((pot_p[0] + math.cos(a) * .03, pot_p[1] + .15, pot_p[2] + math.sin(a) * .03))
        tip = base + Vector((math.cos(a) * lean, h, math.sin(a) * lean))
        # snake-plant leaves: flat, tapering blades
        d = tip - base; n = Vector((-math.sin(a), 0, math.cos(a))) * .022
        bm = bmesh.new(); pts = []
        for k in range(7):
            t = k / 6; c = base + d * t + Vector((0, 0, 0)); wdt = (1 - t ** 1.6) * (1 if k < 6 else 0) + .001
            pts.append((bm.verts.new(c - n * wdt), bm.verts.new(c + n * wdt)))
        for (a0, a1), (b0, b1) in zip(pts, pts[1:]): bm.faces.new((a0, a1, b1, b0))
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.003)
        S('leaf', from_bm(bm, 'leaf', W['leaf'] if i % 3 else W['leaf_pale'], smooth=60), g=g)
    jar = (-HX + .03, WY0 + .02, -2.55)
    S('jar', lathe([(0, 0), (.04, 0), (.042, .09), (.036, .1), (.036, .11), (0, .11)], W['enamel'], 20), jar, g=g)
    for k in range(5):
        a = k * 1.3; tip = (jar[0] + math.cos(a) * .03, jar[1] + .2 + k * .012, jar[2] + math.sin(a) * .03)
        R('brush', (jar[0] + math.cos(a) * .012, jar[1] + .02, jar[2] + math.sin(a) * .012), tip, .004, W['oak'], g, seg=8)
        C('ferrule', .005, .02, tip, W['steel'], g, rot=Yr, seg=8)
    S('solder', torus(.032, .009, W['steel'], seg=24, sides=8), (-HX + .1, WY0 + .03, -.75), (math.pi / 2, 0, 0), g=g)
    C('solder core', .022, .016, (-HX + .1, WY0 + .03, -.75), W['black'], g, seg=16)

    # ---- skirting on three walls ----
    for x0, x1 in ((-HX, HX),):
        B('skirting back', (x1 - x0, .12, .018), ((x0 + x1) / 2, .06, -HZ + .009), W['oak_dark'], g, bevel=.004)
    B('skirting right', (.018, .12, RD), (HX - .009, .06, 0), W['oak_dark'], g, bevel=.004)
    B('skirting left', (.018, .12, RD), (-HX + .009, .06, 0), W['oak_dark'], g, bevel=.004)

    # ---- power: conduit drops and outlets ----
    conduit([(-5.2, RH, -HZ + .013), (-5.2, 1.1, -HZ + .013), (-4.83, 1.1, -HZ + .013)], W, g, axis=(0, 0, -1))
    outlet((-4.75, 1.1, -HZ), (0, 1), W, g)
    conduit([(5.24, RH, -HZ + .013), (5.24, .3, -HZ + .013), (2.05, .3, -HZ + .013)], W, g, axis=(0, 0, -1))
    outlet((1.97, .3, -HZ), (0, 1), W, g)
    conduit([(HX - .013, RH, .05), (HX - .013, .5, .05)], W, g, axis=(1, 0, 0))
    outlet((HX, .42, .05), (-1, 0), W, g)
    # a light switch by the front of the right wall
    sw = frame('switch', (HX, 1.25, 2.7), (0, -math.pi / 2, 0))
    S('switch plate', box(.085, .085, .008, W['white_plastic'], bevel=.004), (0, 0, .004), g=g, parent=sw)
    S('rocker', box(.022, .036, .008, W['white_plastic'], bevel=.003), (0, 0, .011), (.08, 0, 0), g=g, parent=sw)

    # ---- fire extinguisher on the right wall ----
    ex = frame('extinguisher', (HX, 0, 2.3), (0, -math.pi / 2, 0))
    B('bracket', (.06, .16, .012), (0, 1.12, .006), W['dark_steel'], g, parent=ex)
    S('cylinder', lathe([(0, 0), (.072, 0), (.075, .02), (.075, .44), (.06, .5), (.03, .52), (0, .52)], W['red_paint'], 28), (0, .74, .085), g=g, parent=ex)
    C('valve', .018, .06, (0, 1.29, .085), W['chrome'], g, parent=ex, seg=12)
    B('lever', (.015, .012, .11), (0, 1.33, .12), W['dark_steel'], g, parent=ex)
    T('hose', [(0, 1.3, .1), (.04, 1.25, .16), (.07, 1.05, .17), (.075, .85, .16)], .009, W['black'], g, parent=ex)
    S('horn', lathe([(.012, 0), (.035, .1), (.032, .1), (.01, .0)], W['black'], 16), (.075, .78, .16), (math.pi, 0, 0), g=g, parent=ex)
    S('ex label', card(.1, .14, 'extinguisher', W['prints']), (0, .98, .161), g=g, parent=ex)

    # ---- pinboard by the window, with the real Strata pictures ----
    pb = frame('pinboard', (-HX, 1.72, .75), (0, math.pi / 2, 0))
    B('cork', (.92, .62, .012), (0, 0, .012), W['cork'], g, bevel=.002, parent=pb)
    for s in (-1, 1):
        B('pin frame', (.96, .025, .03), (0, s * .3225, .015), W['oak'], g, bevel=.004, parent=pb)
        B('pin frame', (.025, .62, .03), (s * .4675, 0, .015), W['oak'], g, bevel=.004, parent=pb)
    rnd = random.Random(9)
    pins = [('pin_sketch', -.28, .14, .04), ('pin_cad', .04, .16, -.05), ('pin_laser', .3, .12, .03),
            ('pin_tyre', -.26, -.13, -.03), ('pin_wiring', .05, -.12, .06), ('pin_card', .31, -.15, -.02)]
    for key, x, y, a in pins:
        S(key, card(.24, .18, key, W['prints'], t=.0004), (x, y, .0195), (0, 0, a), g=g, parent=pb)
        col = W['grip_red'] if rnd.random() < .5 else W['grip_yellow']
        px = x + rnd.uniform(-.02, .02)
        S('push pin', cyl(.006, .01, col, seg=10), (px, y + .075, .025), g=g, parent=pb)
        S('pin head', sphere(.0075, col, seg=10, ring=6), (px, y + .075, .031), g=g, parent=pb)
    return {'pot': pot_p}
