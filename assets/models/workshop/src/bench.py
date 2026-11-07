"""The left bench: Strata half-assembled on a cutting mat, the tools in use beside it, the rest put away
on the pegboard (with painted outlines where the ones in use belong), a bolted vise, a task lamp and
its cable to the wall, plus the stool, a dustpan and the drawings rolled up in the corner."""
import math, random
from kit import *

BX, BZ, TOP = -3.7, -3.36, .955
PZ = -.395            # pegboard face, bench-local z
g = 'dress'


def hole_x(x): return -1.25 + .0127 + round((x + 1.25 - .0127) / .0254) * .0254
def hole_y(y): return 1.31 + .0127 + round((y - 1.31 - .0127) / .0254) * .0254


def hook(F, W, x, y, length=.07, up=.016, r=.0028):
    x, y = hole_x(x), hole_y(y)
    R('peg hook', (x, y, PZ - .004), (x, y, PZ + length), r, W['zinc'], g, parent=F, seg=8)
    R('peg hook tip', (x, y, PZ + length), (x, y + up, PZ + length + .006), r, W['zinc'], g, parent=F, seg=8)
    return x, y


def build(W, parts):
    F = frame('bench', (BX, 0, BZ))
    wear_paint = {'edge': .5, 'grime': .45, 'tint': [1.5, 1.45, 1.35]}
    # ---- the bench itself ----
    B('bench top', (2.71, .06, .78), (0, .925, 0), W['oak'], g, bevel=.007, parent=F, wear={'edge': .7, 'tint': [.78, .72, .64]})
    for s in (-1, 1): B('top end grain', (.012, .056, .774), (s * 1.361, .925, 0), W['endgrain'], g, bevel=.002, parent=F)
    for x in (-1.27, 1.27):
        for z in (-.3, .3):
            B('leg', (.06, .85, .06), (x, .47, z), W['frame_blue'], g, bevel=.006, parent=F, wear=wear_paint)
            B('leg cap', (.07, .006, .07), (x, .044, z), W['frame_blue'], g, bevel=.002, parent=F)
            C('foot stud', .007, .03, (x, .028, z), W['zinc'], g, parent=F, seg=10)
            C('foot nut', .012, .008, (x, .036, z), W['zinc'], g, parent=F, seg=6)
            C('foot pad', .03, .012, (x, .006, z), W['rubber'], g, parent=F, seg=20, bevel=.003)
    for z in (-.3, .3):
        B('apron', (2.48, .07, .035), (0, .86, z), W['frame_blue'], g, bevel=.004, parent=F, wear=wear_paint)
        B('low rail', (2.48, .04, .035), (0, .24, z), W['frame_blue'], g, bevel=.004, parent=F, wear=wear_paint)
        for x in (-1.21, 1.21):
            for y in (.86, .24): C('frame bolt', .008, .006, (x, y, z + (.02 if z > 0 else -.02)), W['zinc'], g, rot=(0, 0, 0), parent=F, seg=6)
    for x in (-1.27, 1.27):
        B('side apron', (.035, .07, .54), (x, .86, 0), W['frame_blue'], g, bevel=.004, parent=F)
        B('side rail', (.035, .04, .54), (x, .24, 0), W['frame_blue'], g, bevel=.004, parent=F)
    B('lower shelf', (2.48, .025, .58), (0, .2725, 0), W['oak_dark'], g, bevel=.004, parent=F)
    # drawer unit hung under the right end
    B('drawer case', (.6, .565, .6), (.92, .6, .01), W['teal'], g, bevel=.006, parent=F, wear={'edge': .3})
    for i, (y, lab) in enumerate(((.8, 'lab_m3'), (.615, 'lab_hex'), (.43, 'lab_crimp'))):
        B('drawer front', (.56, .17, .02), (.92, y, .32), W['teal'], g, bevel=.005, parent=F, wear={'edge': .8, 'tint': [1.6, 1.55, 1.45]})
        R('drawer pull', (.82, y + .035, .345), (1.02, y + .035, .345), .006, W['brass'], g, parent=F)
        for x in (.82, 1.02): R('pull post', (x, y + .035, .33), (x, y + .035, .345), .005, W['brass'], g, parent=F)
        B('label frame', (.105, .04, .004), (.92, y - .035, .332), W['brass'], g, bevel=.0015, parent=F)
        S(lab, card(.095, .03, lab, W['prints']), (.92, y - .035, .3345), g=g, parent=F)
    # under the bench: kit put away
    for x, (w, h, d), lab in ((-.95, (.42, .26, .34), 'lab_pla'), (-.45, (.36, .2, .3), 'lab_spare')):
        B('box', (w, h, d), (x, .285 + h / 2, -.02), W['card'], g, bevel=.004, parent=F)
        S(lab, card(.13, .04, lab, W['prints']), (x, .285 + h * .62, -.02 + d / 2 + .001), g=g, parent=F)
    tb = (.15, .285, .02)
    B('toolbox', (.48, .2, .24), (tb[0], tb[1] + .1, tb[2]), W['red_paint'], g, bevel=.008, parent=F, wear={'edge': .6, 'tint': [1.4, 1.3, 1.2]})
    B('toolbox lid', (.49, .045, .25), (tb[0], tb[1] + .222, tb[2]), W['red_paint'], g, bevel=.012, parent=F)
    R('toolbox handle', (tb[0] - .12, tb[1] + .27, tb[2]), (tb[0] + .12, tb[1] + .27, tb[2]), .008, W['black'], g, parent=F)
    for x in (-.1, .1):
        B('catch', (.035, .04, .01), (tb[0] + x * 1.8, tb[1] + .2, tb[2] + .124), W['chrome'], g, bevel=.003, parent=F)
    S('cable coil', torus(.1, .012, W['black'], seg=32, sides=8), (.5, .3, -.05), (math.pi / 2, 0, 0), g=g, parent=F)
    S('cable coil 2', torus(.092, .012, W['black'], seg=32, sides=8), (.5, .325, -.04), (math.pi / 2 + .05, 0, .2), g=g, parent=F)

    # ---- pegboard on battens, standing off the wall ----
    B('pegboard', (2.5, 1.1, .006), (0, 1.86, PZ - .003), W['peg'], g, bevel=.0015, parent=F)
    for x in (-1.2, 0, 1.2): B('batten', (.04, 1.1, .036), (x, 1.86, -.42), W['oak_dark'], g, bevel=.003, parent=F)
    for y in (1.335, 2.385): B('cleat', (2.5, .04, .036), (0, y, -.42), W['oak_dark'], g, bevel=.003, parent=F)
    for x in (-1.2, 0, 1.2):
        for y in (1.335, 1.86, 2.385): C('board screw', .0055, .003, (x, y, PZ + .001), W['zinc'], g, rot=(0, 0, 0), parent=F, seg=10)
    B('peg trim', (2.53, .028, .028), (0, 2.425, -.39), W['oak'], g, bevel=.004, parent=F)
    B('peg trim', (2.53, .028, .028), (0, 1.295, -.39), W['oak'], g, bevel=.004, parent=F)

    oz = PZ + .0006
    # spanners hanging by their jaws, smallest left; the fourth is on the bench, so its hook is empty
    lens = [.15, .17, .19, .21, .23, .25]
    for k, l in enumerate(lens):
        x, y = hook(F, W, -1.1 + k * .075, 2.28, .05, .012)
        w = l * .11
        if k == 3:
            S('spanner outline', plate([(p[0] * 1.08, p[1] * 1.04) for p in spanner(l, w)], .0006, W['outline'], bevel=0), (x, y - l / 2 + w * .5, oz), g=g, parent=F)
            continue
        S('spanner', plate(spanner(l, w), .005, W['steel'], bevel=.0012), (x, y - l / 2 + w * .5, PZ + .03), (0, 0, (k - 2.5) * .01), g=g, parent=F)
    # screwdriver rack: a steel strip with handles up; one slot empty
    rx, ry = hole_x(-.04), hole_y(2.05)
    B('driver rack', (.34, .006, .06), (rx + .12, ry, PZ + .033), W['dark_steel'], g, bevel=.002, parent=F)
    for x in (rx, rx + .24):
        R('rack hook', (x, ry - .002, PZ - .003), (x, ry - .002, PZ + .01), .003, W['zinc'], g, parent=F)
        B('rack lug', (.012, .03, .004), (x, ry - .014, PZ + .004), W['dark_steel'], g, parent=F)
    grips = [W['grip_red'], W['grip_teal'], W['grip_yellow'], W['grip_red'], W['grip_teal']]
    for k in range(5):
        if k == 2: continue
        x = rx + .02 + k * .05
        S('driver handle', lathe([(0, 0), (.006, 0), (.011, .012), (.012, .072), (.0095, .088), (0, .092)], grips[k], 14), (x, ry + .003, PZ + .045), g=g, parent=F)
        R('driver shaft', (x, ry, PZ + .045), (x, ry - .1 - k * .02, PZ + .045), .0032, W['chrome'], g, parent=F, seg=8)
    # pliers on double prongs
    for k, (x, grip) in enumerate(((.42, W['grip_red']), (.56, W['grip_teal']))):
        hx_, hy_ = hook(F, W, x - .018, 2.2, .045, .01); hook(F, W, x + .018, 2.2, .045, .01)
        P = frame('pliers', (x, hy_ - .012, PZ + .03), parent=F)
        S('jaw', plate([(-.009, 0), (.009, 0), (.006, .045), (.0015, .06), (-.0015, .06), (-.006, .045)], .009, W['dark_steel'], bevel=.0012), (0, .0, 0), g=g, parent=P)
        C('rivet', .0065, .012, (0, 0, 0), W['steel'], g, rot=(0, 0, 0), parent=P, seg=12)
        for s in (-1, 1):
            R('handle', (s * .004, -.005, 0), (s * .03, -.16, 0), .0048, W['dark_steel'], g, parent=P)
            R('grip', (s * .011, -.045, 0), (s * .031, -.165, 0), .0075, grip, g, parent=P)
    # hammer head resting on two prongs
    hx, hy = hole_x(.8), hole_y(1.75)
    hook(F, W, hx - .04, hy, .05, .008); hook(F, W, hx + .04, hy, .05, .008)
    B('hammer head', (.12, .028, .028), (hx, hy + .0168, PZ + .035), W['dark_steel'], g, bevel=.004, parent=F)
    C('hammer face', .015, .012, (hx + .066, hy + .0168, PZ + .035), W['steel'], g, rot=Xr, parent=F, seg=16)
    R('hammer handle', (hx, hy + .03, PZ + .035), (hx, hy - .28, PZ + .035), .0125, W['oak'], g, parent=F, seg=12)
    # hacksaw on one hook through its frame
    sx, sy = hook(F, W, 1.0, 2.3, .055, .012)
    H = frame('hacksaw', (sx, sy + .007, PZ + .035), parent=F)
    R('saw bar', (-.2, 0, 0), (.17, 0, 0), .006, W['chrome'], g, parent=H)
    R('saw post', (.17, 0, 0), (.17, -.1, 0), .006, W['chrome'], g, parent=H)
    R('saw post', (-.2, 0, 0), (-.2, -.1, 0), .006, W['chrome'], g, parent=H)
    B('saw blade', (.37, .012, .0012), (-.015, -.092, 0), W['steel'], g, bevel=0, parent=H)
    B('saw grip', (.034, .11, .022), (-.235, -.075, 0), W['grip_teal'], g, bevel=.008, rot=(0, 0, .35), parent=H)
    C('wing nut', .008, .01, (.17, -.1, 0), W['chrome'], g, rot=Xr, parent=H, seg=8)
    # tape rolls stacked on a long prong
    tx, ty = hook(F, W, 1.12, 1.58, .085, .012)
    for k, m in enumerate((W['black'], W['grip_red'], W['wire_blue'])):
        S('tape roll', torus(.021, .009, m, seg=24, sides=8), (tx, ty - .021 + .0028, PZ + .02 + k * .021), g=g, parent=F)
    # solder spool and a coil of hook-up wire
    wx_, wy_ = hook(F, W, -.62, 1.62, .06, .01)
    C('wire spool', .04, .03, (wx_, wy_ - .04 + .003, PZ + .03), W['copper'], g, rot=(0, 0, 0), parent=F, seg=24)
    for s in (-1, 1): C('spool flange', .05, .004, (wx_, wy_ - .037, PZ + .03 + s * .017), W['black'], g, rot=(0, 0, 0), parent=F, seg=24)
    # painted outlines where the caliper and the hex keys live
    S('caliper outline', plate([(-.13, .0), (.13, 0), (.13, .02), (-.08, .02), (-.08, .06), (-.1, .06), (-.1, .02), (-.13, .02)], .0006, W['outline'], bevel=0), (.15, 1.62, oz), g=g, parent=F)
    S('hexkey outline', plate(rr(-.04, -.012, .04, .012, .006), .0006, W['outline'], bevel=0), (-.3, 1.6, oz), g=g, parent=F)
    for k in range(6): S('hexkey outline', plate(rr(-.002 - k * .001, -.07 - k * .01, .002 + k * .001, .0, .001), .0006, W['outline'], bevel=0), (-.33 + k * .012, 1.6, oz + .0001), g=g, parent=F)
    hook(F, W, .15, 1.66, .04, .01); hook(F, W, -.3, 1.63, .04, .01)

    # ---- shelf of tins above the pegboard ----
    B('tin shelf', (.66, .03, .19), (.84, 2.61, -.345), W['oak'], g, bevel=.004, parent=F)
    for x in (.6, 1.08):
        B('bracket wall leg', (.025, .16, .004), (x, 2.515, -.437), W['dark_steel'], g, parent=F)
        B('bracket arm', (.025, .004, .17), (x, 2.593, -.355), W['dark_steel'], g, parent=F)
        R('bracket brace', (x, 2.45, -.435), (x, 2.59, -.3), .004, W['dark_steel'], g, parent=F)
        for y in (2.47, 2.56): C('bracket screw', .005, .003, (x, y, -.434), W['zinc'], g, rot=(0, 0, 0), parent=F, seg=8)
    for i, (m, lab) in enumerate(((W['teal'], 'lab_glue'), (W['terracotta'], 'lab_tape'), (W['bin_cream'], 'lab_zip'))):
        x = .63 + i * .21
        C('tin', .065, .16, (x, 2.705, -.35), m, g, parent=F, seg=24, bevel=.004)
        C('tin lid', .068, .018, (x, 2.79, -.35), W['steel'], g, parent=F, seg=24, bevel=.003)
        S(lab, card(.08, .025, lab, W['prints']), (x, 2.72, -.2845), g=g, parent=F)

    # ---- the finished car, framed, hung from a nail on a wire ----
    fx, fy, fz = -.55, 2.88, -.43
    for s in (-1, 1):
        B('frame rail', (.8, .03, .024), (fx, fy + s * .25, fz + .012), W['oak_dark'], g, bevel=.004, parent=F)
        B('frame stile', (.03, .53, .024), (fx + s * .385, fy, fz + .012), W['oak_dark'], g, bevel=.004, parent=F)
    B('mount board', (.75, .48, .004), (fx, fy, fz + .006), W['paper'], g, bevel=0, parent=F)
    S('photo_hero', card(.6, .4, 'photo_hero', W['prints']), (fx, fy + .01, fz + .011), g=g, parent=F)
    C('nail', .003, .03, (fx, fy + .37, fz - .0), W['steel'], g, rot=(0, 0, 0), parent=F, seg=8)
    for s in (-1, 1): R('hanging wire', (fx + s * .3, fy + .25, fz + .006), (fx, fy + .37, fz + .008), .0009, W['steel'], g, parent=F, seg=4)

    # ---- on the bench: Strata half built ----
    Mt = frame('mat', (-.36, TOP + .001, .04), (0, .04, 0), parent=F)
    S('mat', card(.6, .45, 'mat', W['prints'], t=.002), (0, 0, 0), (-math.pi / 2, 0, 0), g=g, parent=Mt)
    A = frame('strata', (-.08, .002, -.02), (0, -.06, 0), parent=Mt)
    pl = parts['plate'][0]
    cm = lambda p: ((p[0] - 17) / 100, p[1] / 100)
    S('strata plate', plate([cm(p) for p in pl['outer']], .003, W['acrylic_black'], holes=[[cm(p) for p in h] for h in pl['holes']], bevel=.0004), (0, .0015, 0), (math.pi / 2, 0, 0), g=g, parent=A)
    ribs = [r for r in parts['ribs'] if r['outer']]
    rk = lambda p: ((p[0] - 17) / 100, (p[1] - 3) / 100)
    rnd = random.Random(5)
    stack = 0
    for r in sorted(ribs, key=lambda r: (r['rib'], r['x'])):
        me = plate([rk(p) for p in r['outer']], .003, W['acrylic_red'], holes=[[rk(p) for p in h] for h in r.get('holes', [])], bevel=.0004)
        if r['rib'] < 9:
            S('rib fitted', me, (0, .003, r['x'] / 100), g=g, parent=A)
        else:
            # the rest lie flat in a stack beside the plate, a little out of square
            S('rib stack', me, (rnd.uniform(-.006, .006) + .0, .0015 + stack * .0031, -.15 + rnd.uniform(-.004, .004)), (-math.pi / 2, 0, rnd.uniform(-.02, .02)), g=g, parent=A)
            stack += 1
    S('tape_rib', card(.09, .016, 'tape_rib', W['prints'], t=.0003), (.0, .0016 + stack * .0031, -.13), (-math.pi / 2, 0, .05), g=g, parent=A)
    # the assembly sketch, the caliper on it, and a pencil
    Sk = frame('sketch', (.2, TOP + .0012, .14), (0, .16, 0), parent=F)
    S('assembly', card(.297, .21, 'assembly', W['prints'], t=.0004), (0, 0, 0), (-math.pi / 2, 0, 0), g=g, parent=Sk)
    Cp = frame('caliper', (.03, .0035, .03), (0, -.45, 0), parent=Sk)
    B('caliper beam', (.21, .003, .016), (0, 0, 0), W['alu'], g, bevel=.0008, parent=Cp)
    B('fixed jaw', (.009, .003, .05), (-.1, 0, -.026), W['alu'], g, bevel=.0008, parent=Cp)
    B('slider', (.055, .009, .028), (-.03, .004, .004), W['black'], g, bevel=.002, parent=Cp)
    B('moving jaw', (.009, .003, .048), (-.052, 0, -.025), W['alu'], g, bevel=.0008, parent=Cp)
    S('caliper_lcd', card(.028, .011, 'caliper_lcd', W['prints']), (-.03, .0086, .004), (-math.pi / 2, 0, 0), g=g, parent=Cp)
    C('thumb wheel', .006, .004, (-.0, .004, .016), W['steel'], g, rot=Yr, parent=Cp, seg=12)
    R('pencil', (.1, .004, -.06), (.27, .004, .02), .0035, W['grip_yellow'], g, parent=Sk, seg=6)
    # fastener tray: eight compartments of screws, nuts and washers
    Tr = frame('tray', (.48, TOP, -.13), (0, .1, 0), parent=F)
    B('tray base', (.24, .005, .15), (0, .0025, 0), W['black'], g, bevel=.001, parent=Tr)
    for z in (-.075, 0, .075): B('tray wall', (.24, .028, .003), (0, .016, z), W['black'], g, bevel=.0008, parent=Tr)
    for x in (-.12, -.06, 0, .06, .12): B('tray wall', (.003, .028, .15), (x, .016, 0), W['black'], g, bevel=.0008, parent=Tr)
    rnd = random.Random(21)
    for cx in (-.09, -.03, .03, .09):
        for cz in (-.0375, .0375):
            kind = rnd.choice(['screw', 'nut', 'washer', 'screw'])
            for n in range(9):
                p = (cx + rnd.uniform(-.02, .02), .006 + rnd.random() * .006, cz + rnd.uniform(-.026, .026))
                if kind == 'screw':
                    a = rnd.uniform(0, 6.28); d = Vector((math.cos(a), 0, math.sin(a))) * .012
                    R('screw', Vector(p) - d / 2, Vector(p) + d / 2, .0015, W['steel'], g, parent=Tr, seg=6)
                    C('screw head', .0028, .002, Vector(p) + d / 2, W['steel'], g, rot=rot_to(d), parent=Tr, seg=8)
                elif kind == 'nut':
                    C('nut', .0032, .0026, p, W['zinc'], g, rot=(math.pi / 2 + rnd.uniform(-.3, .3), 0, 0), parent=Tr, seg=6)
                else:
                    C('washer', .0045, .0008, p, W['zinc'], g, rot=(math.pi / 2 + rnd.uniform(-.2, .2), 0, 0), parent=Tr, seg=12)
    # hex keys fanned out of their holder
    Hk = frame('hexkeys', (-.0, TOP, .27), (0, .5, 0), parent=F)
    B('key holder', (.08, .012, .022), (0, .006, 0), W['black'], g, bevel=.003, parent=Hk)
    for k in range(6):
        a = -.6 + k * .24; r = .0012 + k * .0004; L = .05 + k * .009; s = .016 + k * .002
        d = Vector((math.cos(a), 0, math.sin(a)))
        p0 = Vector((-.03 + k * .012, .003 + r, .0))
        p1 = p0 + d * L
        R('hex key', p0, p1, r, W['dark_steel'], g, parent=Hk, seg=6)
        R('hex key short', p1, p1 + Vector((0, 0, 0)) + Vector((-d.z, 0, d.x)) * s, r, W['dark_steel'], g, parent=Hk, seg=6)
    # the spanner and screwdriver taken off the board
    S('spanner in use', plate(spanner(.21, .023), .005, W['steel'], bevel=.0012), (.72, TOP + .0026, .2), (-math.pi / 2, 0, .9), g=g, parent=F)
    Sd = frame('driver', (.38, TOP + .012, .3), (0, .5, 0), parent=F)
    S('driver handle', lathe([(0, 0), (.006, 0), (.011, .012), (.012, .072), (.0095, .088), (0, .092)], W['grip_yellow'], 14), (0, 0, 0), (0, 0, math.pi / 2), g=g, parent=Sd)
    R('driver shaft', (0, 0, 0), (.12, 0, 0), .0032, W['chrome'], g, parent=Sd, seg=8)
    # battery lead with an XT60 plug, coiling across the bench to the chassis
    pts = [(-.33, TOP + .008, .02), (-.25, TOP + .004, .09), (-.12, TOP + .003, .16), (-.02, TOP + .004, .2), (.05, TOP + .006, .26)]
    T('lead red', pts, .0022, W['wire_red'], g, parent=F, seg=6)
    T('lead black', [(x + .006, y, z + .004) for x, y, z in pts], .0022, W['wire_black'], g, parent=F, seg=6)
    B('xt60', (.016, .008, .009), (.06, TOP + .006, .265), W['xt_yellow'], g, bevel=.0015, rot=(0, -.5, 0), parent=F)
    B('xt60 mate', (.016, .008, .009), (.075, TOP + .006, .276), W['xt_yellow'], g, bevel=.0015, rot=(0, -.5, 0), parent=F)
    # mug of coffee and a red toolbox of small kit at the back
    mug = (-.95, TOP, -.24)
    S('mug', lathe([(0, 0), (.04, 0), (.043, .006), (.043, .095), (.038, .095), (.037, .012), (0, .012)], W['enamel'], 24), mug, g=g, parent=F)
    S('mug rim', torus(.0405, .0025, W['navy'], seg=32, sides=6), (mug[0], mug[1] + .095, mug[2]), (math.pi / 2, 0, 0), g=g, parent=F)
    C('coffee', .037, .002, (mug[0], mug[1] + .075, mug[2]), W['soil'], g, parent=F, seg=24)
    S('mug handle', torus(.022, .005, W['enamel'], seg=20, sides=6), (mug[0] + .048, mug[1] + .05, mug[2]), g=g, parent=F)
    # task lamp, clamped low at the back right, cable down the arm to a power strip on the wall
    base = Vector((.62, TOP, -.27)); elbow = Vector((.46, TOP + .42, -.22)); head = Vector((.12, TOP + .45, -.04))
    C('lamp base', .085, .022, base + Vector((0, .011, 0)), W['teal'], g, parent=F, seg=28, bevel=.005)
    C('lamp knuckle', .018, .04, base + Vector((0, .04, 0)), W['dark_steel'], g, rot=Xr, parent=F, seg=12)
    for s in (-1, 1):
        R('lamp arm', base + Vector((0, .04, s * .012)), elbow + Vector((0, 0, s * .012)), .0045, W['dark_steel'], g, parent=F)
        R('lamp arm', elbow + Vector((0, 0, s * .012)), head + Vector((.03, .02, s * .012)), .0045, W['dark_steel'], g, parent=F)
    S('lamp spring', helix(.007, (elbow - base).length * .55, 9, .0012, W['steel']), ((base + elbow) / 2) + Vector((.02, 0, 0)), rot_to(elbow - base), g=g, parent=F)
    C('lamp elbow', .016, .04, elbow, W['dark_steel'], g, rot=(0, 0, 0), parent=F, seg=12)
    sh = frame('shade', head, (0, 0, .0), parent=F)
    S('lamp shade', lathe([(.012, .05), (.03, .045), (.07, -.035), (.074, -.04), (.07, -.035), (.028, .04), (.011, .046)], W['teal'], 28), (0, 0, 0), (.0, 0, -.45), g=g, parent=sh)
    S('lamp bulb', sphere(.026, W['bulb'], seg=16, ring=10), (-.012, -.012, 0), g=g, parent=sh)
    cab = [head + Vector((.03, .04, .0)), elbow + Vector((0, .02, -.025)), (elbow + base) / 2 + Vector((0, 0, -.026)), base + Vector((.02, .02, -.04)),
           Vector((.5, TOP + .006, -.36)), Vector((.33, TOP + .006, -.385)), Vector((.26, TOP + .05, -.388)), Vector((.22, 1.06, -.42))]
    T('lamp cable', [tuple(p) for p in cab], .0032, W['black'], g, parent=F, seg=6)
    # power strip screwed to the wall under the pegboard, its own lead back to the outlet
    B('power strip', (.42, .045, .038), (.05, 1.07, -.418), W['white_plastic'], g, bevel=.006, parent=F)
    for k in range(4):
        B('socket', (.034, .028, .002), (-.1 + k * .09, 1.07, -.398), W['bin_cream'], g, bevel=.002, parent=F)
    B('plug', (.03, .036, .022), (.2, 1.07, -.388), W['black'], g, bevel=.004, parent=F)
    B('plug 2', (.03, .036, .022), (.02, 1.07, -.388), W['black'], g, bevel=.004, parent=F)
    T('strip lead', [(-.16, 1.07, -.41), (-.3, 1.04, -.41), (-.6, 1.05, -.415), (-.9, 1.08, -.42), (-1.03, 1.1, -.41)], .0035, W['white_plastic'], g, parent=F, seg=6)
    T('charger lead', [(.02, 1.07, -.376), (.0, 1.0, -.37), (-.08, TOP + .004, -.33), (-.2, TOP + .003, -.3), (-.3, TOP + .004, -.31)], .002, W['black'], g, parent=F, seg=6)
    B('charger', (.05, .025, .07), (-.33, TOP + .0125, -.3), W['black'], g, bevel=.004, rot=(0, .3, 0), parent=F)

    # ---- vise, bolted through the top at the front right corner ----
    V = frame('vise', (1.0, TOP, .25), (0, 0, 0), parent=F)
    B('vise base', (.2, .016, .14), (0, .008, -.02), W['vise'], g, bevel=.004, parent=V, wear={'edge': .6, 'tint': [1.5, 1.45, 1.35]})
    for x in (-.08, .08):
        for z in (-.07, .03):
            C('vise washer', .015, .002, (x, .017, z), W['zinc'], g, parent=V, seg=14)
            C('vise bolt', .011, .009, (x, .022, z), W['zinc'], g, parent=V, seg=6)
            C('vise nut below', .011, .01, (x, -.065, z), W['zinc'], g, parent=V, seg=6)
            C('vise thread', .0055, .09, (x, -.03, z), W['zinc'], g, parent=V, seg=8)
    C('swivel', .065, .02, (0, .026, -.02), W['vise'], g, parent=V, seg=28, bevel=.003)
    B('fixed jaw', (.17, .075, .065), (0, .074, -.055), W['vise'], g, bevel=.006, parent=V, wear={'edge': .7, 'tint': [1.5, 1.45, 1.35]})
    B('anvil', (.08, .014, .05), (0, .118, -.075), W['dark_steel'], g, bevel=.003, parent=V)
    B('slide', (.075, .045, .2), (0, .058, .06), W['vise'], g, bevel=.005, parent=V)
    B('moving jaw', (.17, .072, .05), (0, .074, .07), W['vise'], g, bevel=.006, parent=V, wear={'edge': .7, 'tint': [1.5, 1.45, 1.35]})
    for z in (-.0215, .0435): B('jaw plate', (.15, .034, .006), (0, .093, z), W['steel'], g, bevel=.001, parent=V)
    C('screw', .011, .14, (0, .074, .13), W['steel'], g, rot=(0, 0, 0), parent=V, seg=14)
    C('screw boss', .02, .03, (0, .074, .1), W['vise'], g, rot=(0, 0, 0), parent=V, seg=16)
    R('tommy bar', (-.12, .074, .19), (.1, .074, .19), .0065, W['chrome'], g, parent=V)
    for x in (-.12, .1): S('bar ball', sphere(.012, W['chrome'], seg=12, ring=8), (x, .074, .19), g=g, parent=V)
    # a rib clamped upright in the jaws, as if being trimmed
    rib = sorted(ribs, key=lambda r: -len(r['outer']))[0]
    S('rib in vise', plate([((p[0] - 17) / 100 * .5, (p[1] - 3) / 100) for p in rib['outer']], .003, W['acrylic_red'], bevel=.0004), (0, .095, .011), (0, 0, 0), g=g, parent=V)
    # rag over the front edge beside the vise
    Rg = frame('rag', (.66, TOP, .39 - .06), (0, 0, 0), parent=F)
    S('rag', drape(.22, .12, .13, W['cloth'], folds=4, seed=3), (0, 0, 0), g=g, parent=Rg)

    # ---- stool ----
    St = frame('stool', (-4.2, 0, -1.55), (0, .4, 0), 1.05)
    C('seat', .19, .045, (0, .69, 0), W['oak'], g, parent=St, seg=36, bevel=.008)
    C('seat plate', .1, .012, (0, .66, 0), W['frame_blue'], g, parent=St, seg=20)
    for i in range(4):
        a = i / 4 * TAU + .4
        top = (math.cos(a) * .1, .655, math.sin(a) * .1); foot = (math.cos(a) * .24, .02, math.sin(a) * .24)
        R('stool leg', top, foot, .0125, W['frame_blue'], g, parent=St)
        C('stool foot', .016, .022, (foot[0], .011, foot[2]), W['rubber'], g, parent=St, seg=12)
    S('footring', torus(.186, .0085, W['frame_blue'], seg=40, sides=8), (0, .28, 0), (math.pi / 2, 0, 0), g=g, parent=St)

    # ---- dustpan and brush where the bench gets swept, with what was swept ----
    Dp = frame('dustpan', (-4.55, 0, -2.6), (0, .7, 0))
    B('pan floor', (.22, .004, .18), (0, .004, 0), W['bin'], g, bevel=.001, parent=Dp)
    B('pan back', (.22, .07, .006), (0, .035, -.09), W['bin'], g, bevel=.002, parent=Dp)
    for s in (-1, 1): S('pan side', plate([(-.09, 0), (.09, 0), (-.09, .07)], .006, W['bin'], bevel=.001), (s * .11, 0, 0), (0, math.pi / 2, 0), g=g, parent=Dp)
    R('pan handle', (0, .05, -.095), (0, .06, -.24), .012, W['bin'], g, parent=Dp)
    Br = frame('brush', (-4.35, .02, -2.45), (0, -.6, 0))
    B('brush back', (.26, .025, .045), (0, .03, 0), W['oak'], g, bevel=.006, parent=Br)
    B('bristles', (.24, .03, .04), (0, .006, 0), W['black'], g, bevel=.002, parent=Br)
    rnd = random.Random(31)
    for i in range(26):
        S('swept chip', box(.012 + rnd.random() * .01, .002, .003 + rnd.random() * .004, W['acrylic_red'] if i % 3 else W['oak'], name='chip'),
          (-4.48 + rnd.uniform(-.06, .06), .002, -2.48 + rnd.uniform(-.06, .06)), (0, rnd.uniform(0, 3), 0), g=g)

    # ---- drawings rolled up in the corner between the bench and the wall ----
    for k, (bx, bz, tx, tz, r, l) in enumerate(((-5.16, -3.5, -5.27, -3.7, .034, 1.08), (-5.2, -3.42, -5.28, -3.62, .03, .96), (-5.14, -3.58, -5.27, -3.76, .028, 1.12))):
        a = Vector((bx, r, bz)); b = Vector((tx, math.sqrt(max(.1, l * l - ((tx - bx) ** 2 + (tz - bz) ** 2))), tz))
        d = (b - a).normalized(); b = a + d * l
        R('rolled drawing', a, b, r, W['paper'] if k != 1 else W['bin_cream'], g, seg=16)
        R('roll band', a + d * (l * .7), a + d * (l * .72), r + .001, W['wire_blue'], g, seg=16)
        C('roll end', r * .55, .002, b + d * .0005, W['card'], g, rot=rot_to(d), seg=12)

    # ---- sheet stock leaning on the left wall: MDF, and the red acrylic skeleton the ribs were cut from ----
    Sh = frame('sheets', (-HX + .02, 0, 2.15), (0, math.pi / 2, 0))
    for k, (w, h, m, lean, dz) in enumerate(((1.22, 1.1, W['mdf'], .1, .0), (1.0, .95, W['mdf'], .085, .05))):
        S('sheet', box(w, h, .009, m, bevel=.002, name='sheet'), (dz, h / 2 * math.cos(lean), .03 + k * .018 + h / 2 * math.sin(lean)), (-lean, 0, 0), g=g, parent=Sh)
    holes = []
    for j, r in enumerate([r for r in ribs if r['rib'] % 2 == 0][:8]):
        ox, oy = (j % 2) * .03 - .035, .3 - j * .085
        holes.append([((p[0] - 17) / 100 * 1.0 + ox + .02, (p[1] - 5.5) / 100 * .9 + oy) for p in r['outer'][::2]])
    sk = plate(rr(-.4, -.42, .4, .42, .01), .003, W['acrylic_red'], holes=holes, bevel=.0005)
    S('skeleton sheet', sk, (-.02, .42 * math.cos(.07) + .005, .075 + .42 * math.sin(.07)), (-.07, 0, 0), g=g, parent=Sh)
    C('sheet stop', .02, .04, (-.5, .02, .1), W['rubber'], g, parent=Sh, seg=12)
    return F
