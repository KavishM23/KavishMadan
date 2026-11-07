"""Setup work around the MP4/4: a rolling tool chest with the setup sheet on top, a pit board
against the wall, a low trolley jack parked behind the car, and tape marks for where it sits.
Everything stays out of the car's footprint and its drive path; scene.py checks that."""
import math, random
from kit import *

g = 'dress'
CAR = dict(pos=(.25, -.42), rot=.87)
WHEELS = [(-.86, .86), (1.4, .84)]  # (local z, outer x) for rear and front axles, car-rig local, metres


def car_to_world(x, z):
    c, s = math.cos(CAR['rot']), math.sin(CAR['rot'])
    return (CAR['pos'][0] + x * c + z * s, -x * s + z * c + CAR['pos'][1])


def build(W):
    # ---- tape brackets on the floor beside each wheel ----
    for zc, ox in WHEELS:
        for side in (-1, 1):
            x = side * (ox + .09)
            for (x0, z0, x1, z1) in ((x, zc - .3, x, zc + .3), (x, zc - .3, x - side * .14, zc - .3), (x, zc + .3, x - side * .14, zc + .3)):
                a, b = car_to_world(x0, z0), car_to_world(x1, z1)
                L = math.hypot(b[0] - a[0], b[1] - a[1]) + .05
                yaw = math.atan2(b[0] - a[0], b[1] - a[1])
                B('floor tape', (.038, .0012, L), ((a[0] + b[0]) / 2, .00075, (a[1] + b[1]) / 2), W['tape'], g, bevel=0, rot=(0, yaw, 0))
    # a faint centre-line mark ahead of the nose where the car is pushed back to
    a, b = car_to_world(0, 2.5), car_to_world(0, 2.75)
    B('floor tape', (.05, .0015, .25), ((a[0] + b[0]) / 2, .00075, (a[1] + b[1]) / 2), W['tape_yellow'], g, bevel=0, rot=(0, math.atan2(b[0] - a[0], b[1] - a[1]), 0))

    # ---- rolling tool chest against the back wall ----
    Ch = frame('chest', (.55, 0, -3.43), (0, .04, 0))
    wear = {'edge': .7, 'grime': .4, 'tint': [1.7, 1.65, 1.55]}
    B('chest body', (.72, .8, .46), (0, .52, 0), W['navy'], g, bevel=.008, parent=Ch, wear={'edge': .45, 'grime': .3, 'tint': [1.6, 1.55, 1.45]})
    B('chest top mat', (.7, .008, .44), (0, .924, 0), W['rubber'], g, bevel=.002, parent=Ch)
    y = .9
    for h in (.07, .07, .09, .11, .13, .15):
        y -= h + .012
        B('drawer', (.68, h, .016), (0, y + h / 2, .235), W['navy'], g, bevel=.004, parent=Ch, wear=wear)
        B('drawer pull', (.62, .016, .02), (0, y + h - .014, .252), W['alu'], g, bevel=.004, parent=Ch)
    B('chest plinth', (.7, .03, .44), (0, .135, 0), W['dark_steel'], g, bevel=.003, parent=Ch)
    R('push bar', (.38, .78, -.17), (.38, .78, .17), .011, W['chrome'], g, parent=Ch)
    for z in (-.17, .17): R('push bar post', (.36, .78, z), (.38, .78, z), .009, W['chrome'], g, parent=Ch)
    for x in (-.3, .3):
        for z in (-.17, .17):
            B('caster plate', (.08, .006, .08), (x, .117, z), W['zinc'], g, bevel=.002, parent=Ch)
            for s in (-1, 1): B('caster fork', (.006, .07, .05), (x + s * .022, .08, z - .01), W['zinc'], g, bevel=.002, parent=Ch)
            C('caster wheel', .045, .03, (x, .045, z - .015), W['rubber'], g, rot=Xr, parent=Ch, seg=20, bevel=.004)
            C('caster hub', .02, .036, (x, .045, z - .015), W['zinc'], g, rot=Xr, parent=Ch, seg=12)
            if z > 0: B('caster brake', (.03, .008, .03), (x, .09, z + .03), W['grip_red'], g, bevel=.002, parent=Ch)
    # the blue rag over the push bar
    Rg = frame('chest rag', (.385, .78, 0), (0, math.pi / 2, 0), parent=Ch)
    S('rag', drape(.2, .02, .16, W['cloth_blue'], folds=3, seed=7), (0, .0, 0), g=g, parent=Rg)
    S('rag back', drape(.2, .02, .12, W['cloth_blue'], folds=3, seed=8), (0, 0, 0), (0, math.pi, 0), g=g, parent=Rg)
    # on top: the setup sheet on a clipboard, a torque wrench, a pressure gauge
    top = .928
    Cb = frame('clipboard', (-.12, top + .004, .04), (0, .18, 0), parent=Ch)
    B('clipboard', (.24, .006, .33), (0, 0, 0), W['oak_dark'], g, bevel=.002, parent=Cb)
    S('setup', card(.21, .28, 'setup', W['prints'], t=.0004), (0, .0035, .02), (-math.pi / 2, 0, 0), g=g, parent=Cb)
    B('clip', (.08, .012, .03), (0, .008, -.15), W['chrome'], g, bevel=.003, parent=Cb)
    R('torque wrench', (.05, top + .015, -.12), (.33, top + .015, .02), .009, W['chrome'], g, parent=Ch)
    C('wrench head', .02, .02, (.05, top + .015, -.12), W['dark_steel'], g, parent=Ch, seg=16)
    R('wrench grip', (.24, top + .016, -.025), (.33, top + .016, .02), .013, W['black'], g, parent=Ch)
    C('gauge dial', .03, .02, (.2, top + .012, .14), W['chrome'], g, parent=Ch, seg=20)
    C('gauge face', .026, .002, (.2, top + .023, .14), W['white_plastic'], g, parent=Ch, seg=20)
    T('gauge hose', [(.2, top + .01, .17), (.1, top + .01, .2), (.02, top + .012, .16), (-.0, top + .01, .1)], .005, W['black'], g, parent=Ch)

    # ---- pit board leaning on the wall beside it ----
    Pb = frame('pitboard', (-.62, 0, -3.6), (-.13, .08, 0))
    B('pit frame', (.64, .84, .025), (0, .62, 0), W['dark_steel'], g, bevel=.004, parent=Pb)
    S('pitboard', card(.6, .8, 'pitboard', W['prints']), (0, .62, .0128), g=g, parent=Pb)
    R('pit pole', (0, 1.04, -.01), (0, 1.62, -.01), .012, W['alu'], g, parent=Pb)
    C('pit grip', .016, .12, (0, 1.56, -.01), W['black'], g, parent=Pb, seg=12)
    for x in (-.28, .28): C('pit foot', .015, .02, (x, .2, 0), W['rubber'], g, rot=(0, 0, 0), parent=Pb, seg=10)

    # ---- low-profile trolley jack parked behind the car, saddle towards it ----
    J = frame('jack', (-1.58, 0, -2.62), (0, .55, 0))
    for s in (-1, 1): B('jack side', (.012, .085, .62), (s * .1, .07, 0), W['red_paint'], g, bevel=.003, parent=J, wear={'edge': .5, 'grime': .5})
    B('jack deck', (.2, .01, .5), (0, .11, -.02), W['red_paint'], g, bevel=.002, parent=J)
    for s in (-1, 1):
        C('jack front wheel', .036, .025, (s * .118, .036, .26), W['zinc'], g, rot=Xr, parent=J, seg=16)
        C('jack caster', .03, .022, (s * .1, .03, -.3), W['rubber'], g, rot=Xr, parent=J, seg=14)
    R('lift arm', (0, .09, -.12), (0, .07, .3), .03, W['red_paint'], g, parent=J)
    C('saddle', .055, .02, (0, .085, .32), W['dark_steel'], g, parent=J, seg=20, bevel=.003)
    C('saddle pad', .05, .012, (0, .1, .32), W['rubber'], g, parent=J, seg=20)
    C('pump', .028, .14, (0, .12, -.2), W['chrome'], g, rot=Yr, parent=J, seg=14)
    R('handle', (0, .12, -.3), (0, .95, -.72), .013, W['red_paint'], g, parent=J)
    R('handle grip', (0, .88, -.68), (0, .99, -.75), .018, W['black'], g, parent=J)

    # ---- a shop vacuum parked in the front corner, hose coiled over it ----
    Vc = frame('shop vac', (4.72, 0, 3.05), (0, -.4, 0))
    S('vac drum', lathe([(0, .07), (.19, .07), (.2, .1), (.2, .44), (.19, .46), (0, .46)], W['bin'], 32), (0, 0, 0), g=g, parent=Vc)
    S('vac head', lathe([(0, .46), (.205, .46), (.205, .52), (.15, .6), (0, .61)], W['black'], 32), (0, 0, 0), g=g, parent=Vc)
    R('vac handle', (-.09, .64, 0), (.09, .64, 0), .012, W['black'], g, parent=Vc)
    for x in (-.09, .09): R('vac handle post', (x, .6, 0), (x, .645, 0), .01, W['black'], g, parent=Vc)
    for a in range(4):
        t = a * TAU / 4 + .4
        C('vac caster', .03, .022, (math.cos(t) * .16, .03, math.sin(t) * .16), W['rubber'], g, rot=Xr, parent=Vc, seg=12)
        B('vac caster mount', (.04, .045, .04), (math.cos(t) * .16, .07, math.sin(t) * .16), W['black'], g, bevel=.004, parent=Vc)
    C('vac inlet', .03, .06, (0, .38, .2), W['black'], g, rot=(0, 0, 0), parent=Vc, seg=14)
    hose = [(0, .38, .23), (.1, .36, .32), (.25, .45, .28), (.28, .62, .05), (.12, .66, -.1), (-.12, .63, -.08), (-.2, .55, .1), (-.05, .5, .25), (.15, .5, .3)]
    T('vac hose', hose, .019, W['black'], g, parent=Vc, seg=10, res=8)
    R('vac wand', (-.24, .04, -.12), (-.18, .98, -.2), .016, W['alu'], g, parent=Vc)
    B('vac nozzle', (.26, .03, .06), (-.245, .02, -.12), W['black'], g, bevel=.006, rot=(0, .3, 0), parent=Vc)
    return Ch
