"""The steel shelving on the right wall, built in its own coordinates (the page's shelving()): x along
the wall, z out from it, scaled 0.96. The flight cases, binders, books and plant stay live on the page;
this is the frame they sit on and the stock that fills the gaps between them."""
import math, random
from kit import *

g = 'dress'
W_, D_, H_ = 3.1, .62, 2.9
LEVELS = [.24, 1.06, 1.92, 2.76]


def slots(h, step=.05):
    """Dark slot quads on the two outer faces of a slotted angle, as one mesh."""
    bm = bmesh.new()
    for k in range(int(h / step)):
        y = .05 + k * step
        for face in ((1, 0), (0, 1)):
            if face == (1, 0):  # face pointing +x... built as quads on the flange face
                q = [(.0, y, .008), (.0, y + .024, .008), (.0, y + .024, .02), (.0, y, .02)]
            else:
                q = [(.008, y, .0), (.02, y, .0), (.02, y + .024, .0), (.008, y + .024, .0)]
            bm.faces.new([bm.verts.new(p) for p in q])
    bm.normal_update()
    return bm


def bin_(P, W, x, y, z, lab, fill, rnd, w=.14, h=.11, d=.25):
    """An open-fronted stacking bin with a label and what is in it."""
    m = W['bin']
    B('bin floor', (w, .004, d), (x, y + .002, z), m, g, bevel=.001, parent=P)
    for s in (-1, 1): S('bin side', plate([(-d / 2, 0), (d / 2, 0), (d / 2, h * .5), (d / 2 - .06, h), (-d / 2, h)], .004, m, bevel=.0008), (x + s * w / 2, y, z), (0, -math.pi / 2, 0), g=g, parent=P)
    B('bin back', (w, h, .004), (x, y + h / 2, z - d / 2), m, g, bevel=.001, parent=P)
    B('bin lip', (w, h * .5, .004), (x, y + h * .25, z + d / 2), m, g, bevel=.001, parent=P)
    S(lab, card(w * .7, .022, lab, W['prints']), (x, y + h * .3, z + d / 2 + .0025), g=g, parent=P)
    for i in range(14):
        px, pz = x + rnd.uniform(-w / 2 + .02, w / 2 - .02), z + rnd.uniform(-d / 2 + .03, d / 2 - .07)
        py = y + .008 + rnd.random() * h * .3
        kind = fill
        if kind == 'bear': S('bearing', torus(.008, .004, W['steel'], seg=14, sides=6), (px, py, pz), (rnd.uniform(0, 3), 0, rnd.uniform(0, 3)), g=g, parent=P)
        elif kind == 'nut': C('nut', .005, .004, (px, py, pz), W['zinc'], g, rot=(rnd.uniform(0, 3), 0, 0), parent=P, seg=6)
        elif kind == 'plug': B('connector', (.014, .008, .01), (px, py, pz), W['white_plastic'] if i % 2 else W['xt_yellow'], g, bevel=.0015, rot=(0, rnd.uniform(0, 3), 0), parent=P)
        elif kind == 'servo': B('servo', (.04, .036, .02), (px, py + .01, pz), W['wire_blue'] if i % 2 else W['black'], g, bevel=.002, rot=(0, rnd.uniform(0, 3), 0), parent=P)
        else: R('screw', (px, py, pz), (px + .014, py + .004, pz + .004), .002, W['steel'], g, parent=P, seg=6)


def build(W):
    P = frame('shelving', (4.86, 0, -2.2), (0, -math.pi / 2, 0), .96)
    xs = [-W_ / 2, 0, W_ / 2]
    zs = [-D_ / 2, D_ / 2]
    # slotted angle uprights, each turned so its corner faces out, on a foot plate with a levelling foot
    for x in xs:
        for z in zs:
            sx = -1 if x < 0 else 1; sz = -1 if z < 0 else 1
            if x == 0: sx = 1
            U = frame('upright', (x, 0, z), (0, 0, 0), parent=P)
            B('angle a', (.045, H_, .003), (-sx * .0225 + sx * .0, .02 + H_ / 2, -sz * .0015 + sz * .0), W['shelf_steel'], g, bevel=.0008, parent=U)
            B('angle b', (.003, H_, .045), (-sx * .0015, .02 + H_ / 2, -sz * .0225), W['shelf_steel'], g, bevel=.0008, parent=U)
            bm = slots(H_ - .05)
            me = bpy.data.meshes.new('slots'); bm.to_mesh(me); bm.free(); me.materials.append(W['black'])
            S('slots', me, (sx * .0006, 0, sz * .0006), (0, 0 if (sx > 0) == (sz > 0) else 0, 0), g=g, parent=U, scale=(-sx, 1, -sz))
            B('foot plate', (.07, .006, .07), (-sx * .022, .023, -sz * .022), W['shelf_steel'], g, bevel=.002, parent=U)
            C('foot thread', .006, .02, (-sx * .022, .012, -sz * .022), W['zinc'], g, parent=U, seg=8)
            C('foot pad', .022, .008, (-sx * .022, .004, -sz * .022), W['rubber'], g, parent=U, seg=16, bevel=.002)
    # boards on angle beams, with gussets and bolts at every joint
    for y in LEVELS:
        B('shelf board', (W_ + .02, .04, D_ + .02), (0, y + .005, 0), W['oak'], g, bevel=.004, parent=P, wear={'edge': .5, 'tint': [.82, .78, .72]})
        for s in (-1, 1): B('board end', (.004, .036, D_ + .016), (s * (W_ / 2 + .0115), y + .005, 0), W['endgrain'], g, bevel=0, parent=P)
        for z in zs:
            B('beam', (W_, .04, .003), (0, y - .035, z + (.0015 if z > 0 else -.0015)), W['shelf_steel'], g, bevel=.0008, parent=P)
            B('beam lip', (W_, .003, .03), (0, y - .0165, z - (.015 if z > 0 else -.015)), W['shelf_steel'], g, bevel=.0008, parent=P)
        for x in xs:
            B('side beam', (.003, .04, D_), (x + (.0015 if x >= 0 else -.0015), y - .035, 0), W['shelf_steel'], g, bevel=.0008, parent=P)
            for z in zs:
                sz = 1 if z > 0 else -1
                gx = x - (.035 if x > 0 else -.035) if x != 0 else x + .035
                S('gusset', plate([(0, 0), (.06, 0), (0, -.06)], .003, W['shelf_steel'], bevel=.0006), (x, y - .016, z + sz * .004), (0, 0 if x <= 0 else math.pi, 0), g=g, parent=P)
                for dx in (.012, .028):
                    C('beam bolt', .0055, .004, (x + (dx if x <= 0 else -dx), y - .03, z + sz * .006), W['zinc'], g, rot=(0, 0, 0), parent=P, seg=6)
    # cross bracing: on both ends between every pair of levels, and across the back of the low bays
    for x in (-W_ / 2, W_ / 2):
        for y0, y1 in zip(LEVELS, LEVELS[1:]):
            for za, zb in ((-D_ / 2, D_ / 2), (D_ / 2, -D_ / 2)):
                R('brace', (x, y0 + .02, za), (x, y1 - .06, zb), .0042, W['shelf_steel'], g, parent=P, seg=6)
    for xa, xb in ((-W_ / 2, 0), (0, W_ / 2)):
        y0, y1 = LEVELS[0], LEVELS[1]
        for p0, p1 in (((xa, y0 + .02), (xb, y1 - .06)), ((xb, y0 + .02), (xa, y1 - .06))):
            R('back brace', (p0[0], p0[1], -D_ / 2 - .006), (p1[0], p1[1], -D_ / 2 - .006), .0042, W['shelf_steel'], g, parent=P, seg=6)

    rnd = random.Random(14)
    t = [y + .025 for y in LEVELS]
    # level 0: a reel of wire stood on its rim between the cases, its end trailing over the edge
    C('reel flange', .14, .012, (-.33, t[0] + .14, -.02), W['black'], g, rot=Xr, parent=P, seg=32, bevel=.002)
    C('reel flange', .14, .012, (-.13, t[0] + .14, -.02), W['black'], g, rot=Xr, parent=P, seg=32, bevel=.002)
    C('reel wire', .11, .19, (-.23, t[0] + .14, -.02), W['wire_red'], g, rot=Xr, parent=P, seg=32)
    T('wire end', [(-.23, t[0] + .25, -.02), (-.2, t[0] + .22, .12), (-.17, t[0] + .02, .25), (-.15, t[0] - .02, .33), (-.14, t[0] - .2, .34)], .0025, W['wire_red'], g, parent=P, seg=6)
    # level 1: four labelled bins, a multimeter with its leads plugged in, a folded drawing
    for k, (lab, fill) in enumerate((('lab_m3', 'screw'), ('lab_m4', 'nut'), ('lab_bear', 'bear'), ('lab_jst', 'plug'))):
        bin_(P, W, -.58 + k * .155, t[1], (-.06, -.02, .0, -.05)[k], lab, fill, rnd)
    Mm = frame('multimeter', (.2, t[1], .12), (-.3, -.25, 0), parent=P)
    B('meter body', (.09, .18, .04), (0, .09, 0), W['meter'], g, bevel=.01, parent=Mm)
    S('meter', card(.078, .16, 'meter', W['prints']), (0, .092, .0205), g=g, parent=Mm)
    B('tilt stand', (.07, .12, .004), (0, .065, -.03), W['black'], g, bevel=.001, rot=(.4, 0, 0), parent=Mm)
    for k, (dx, m) in enumerate(((-.0222, W['wire_black']), (.0222, W['wire_red']))):
        C('lead boot', .0055, .016, (dx, .02, .026), m, g, rot=(0, 0, 0), parent=Mm, seg=10)
    # leads leave the sockets, curl down to the shelf and end in probes (in shelf coordinates)
    for k, (m, s) in enumerate(((W['wire_black'], -1), (W['wire_red'], 1))):
        p0 = Vector((.2 + s * .021, t[1] + .022, .148))
        pts = [p0, p0 + Vector((s * .01, -.005, .03)), Vector((.22 + s * .03, t[1] + .004, .23)), Vector((.33 + s * .02, t[1] + .004, .2)), Vector((.4, t[1] + .004, .1 + s * .03)), Vector((.36, t[1] + .004, .02 + s * .02))]
        T('meter lead', [tuple(p) for p in pts], .0022, m, g, parent=P, seg=6)
        end = pts[-1]; d = Vector((-1, 0, -.4 * s)).normalized()
        R('probe', end, end + d * .1, .0055, m, g, parent=P, seg=10)
        R('probe tip', end + d * .1, end + d * .13, .0012, W['steel'], g, parent=P, seg=6)
    Fd = frame('folded drawing', (.56, t[1] + .002, .0), (0, .1, 0), parent=P)
    S('drawing', card(.21, .3, 'drawing', W['prints'], t=.001), (0, .006, 0), (-math.pi / 2 + .03, 0, 0), g=g, parent=Fd)
    B('folded under', (.21, .004, .3), (0, .002, 0), W['paper'], g, bevel=.001, parent=Fd)
    # level 2: a satellite part in a foam cradle, a spool of filament and its box, two more bins
    Kc = frame('cradle', (-.5, t[2], .05), (0, .08, 0), parent=P)
    for s in (-1, 1): S('foam', plate([(-.11, 0), (.11, 0), (.11, .07), (.03, .07), (0, .035), (-.0, .035)], .18, W['foam'], bevel=.004), (s * .0, 0, 0), (0, 0 if s > 0 else math.pi, 0), g=g, parent=Kc)
    Sat = frame('test piece', (0, .095, 0), (0, .3, math.pi / 4), parent=Kc)
    e = .05
    for a in (-e, e):
        for b in (-e, e):
            R('rail', (a, b, -e), (a, b, e), .0035, W['alu'], g, parent=Sat, seg=6)
            R('rail', (a, -e, b), (a, e, b), .0035, W['alu'], g, parent=Sat, seg=6)
            R('rail', (-e, a, b), (e, a, b), .0035, W['alu'], g, parent=Sat, seg=6)
    for n, r in (((0, 0, 1), (0, 0, 0)), ((1, 0, 0), (0, math.pi / 2, 0)), ((0, 1, 0), (-math.pi / 2, 0, 0))):
        S('solar face', box(.092, .092, .002, W['solar'], name='solar'), (n[0] * e, n[1] * e, n[2] * e), r, g=g, parent=Sat)
    S('lab_kess', card(.1, .02, 'lab_kess', W['prints'], t=.0003), (-.0, .02, .092), g=g, parent=Kc)
    C('filament spool', .1, .065, (-.25, t[2] + .1, -.06), W['black'], g, rot=Xr, parent=P, seg=32, bevel=.003)
    C('filament', .085, .058, (-.25, t[2] + .1, -.06), W['bin_cream'], g, rot=Xr, parent=P, seg=32)
    B('filament box', (.19, .07, .21), (-.07, t[2] + .035, .06), W['card'], g, bevel=.003, rot=(0, .12, 0), parent=P)
    S('filament', card(.16, .085, 'filament', W['prints']), (-.07, t[2] + .0705, .06), (-math.pi / 2, 0, .12), g=g, parent=P)
    for k, (lab, fill) in enumerate((('lab_sens', 'plug'), ('lab_serv', 'servo'))):
        bin_(P, W, 1.1 + k * .2, t[2], (.0, -.04)[k], lab, fill, rnd, w=.17)
    # level 3: archive boxes and a coil of wire, clear of the plant
    for x, z, lab in ((.12, -.04, 'lab_spare'), (.47, .0, 'lab_acr')):
        B('archive box', (.3, .24, .38), (x, t[3] + .12, z), W['card'], g, bevel=.004, parent=P)
        B('archive lid', (.31, .03, .39), (x, t[3] + .235, z), W['card'], g, bevel=.004, parent=P)
        S(lab, card(.12, .036, lab, W['prints']), (x, t[3] + .14, z + .191), g=g, parent=P)
    S('wire coil', torus(.085, .018, W['wire_blue'], seg=32, sides=8), (1.15, t[3] + .018, .02), (math.pi / 2, 0, 0), g=g, parent=P)
    S('lab_wire', card(.08, .024, 'lab_wire', W['prints'], t=.0003), (1.15, t[3] + .038, .11), (-math.pi / 2 + .2, 0, 0), g=g, parent=P)
    # a clamp lamp on the end upright, pointing down into the shelves
    Lp = frame('clamp lamp', (W_ / 2 + .03, 2.62, D_ / 2 + .02), (0, .5, 0), parent=P)
    B('clamp', (.04, .06, .03), (0, 0, 0), W['dark_steel'], g, bevel=.004, parent=Lp)
    R('clamp neck', (0, .03, .0), (-.08, .12, .08), .005, W['dark_steel'], g, parent=Lp)
    S('clamp shade', lathe([(.01, .04), (.025, .036), (.055, -.03), (.058, -.034), (.054, -.03), (.022, .032), (.009, .037)], W['teal'], 24), (-.08, .12, .08), (.6, 0, .5), g=g, parent=Lp)
    S('clamp bulb', sphere(.02, W['bulb'], seg=14, ring=8), (-.088, .11, .088), g=g, parent=Lp)
    T('clamp cable', [(0, -.02, -.01), (.01, -.2, -.02), (.0, -.6, -.03), (-.01, -1.2, -.02), (0, -2.2, -.02), (.05, -2.58, -.1)], .003, W['black'], g, parent=Lp, seg=6)
    return P
