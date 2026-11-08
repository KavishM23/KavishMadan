"""Workshop sign, practical lighting and the fixed hardware around the interactive props."""
from kit import B, C, R, S, T, M, frame, lathe, Xr


def build(W):
    g = 'dress'
    navy, brass, steel, rubber = (W[n] for n in ('navy', 'brass', 'dark_steel', 'rubber'))
    tube = M('neon_tube', '#b3dfd4', .3, emit='#81d2bd', emit_str=.18, glow=True)
    sign = frame('KM sign', (.18, 2.48, -3.8))
    B('sign back box', (1.18, .53, .065), (0, 0, .04), navy, g, parent=sign, bevel=.027)
    B('brass sign frame', (1.1, .452, .015), (0, 0, .077), brass, g, parent=sign, bevel=.007)
    B('sign enamel', (1.082, .434, .012), (0, 0, .086), navy, g, parent=sign, bevel=.006)
    strokes = [
        [(-.38, -.143), (-.38, .143)],
        [(-.18, .143), (-.37, -.009), (-.17, -.143)],
        [(0, -.143), (0, .143), (.17, -.032), (.34, .143), (.34, -.143)],
    ]
    for i, path in enumerate(strokes):
        T(f'glass sign tube {i}', [(x, y, .112) for x, y in path], .012, tube, g, parent=sign, seg=8, res=2)
        for x, y in path:
            C('sign tube mount', .018, .018, (x, y, .101), steel, g, rot=(0, 0, 0), parent=sign, seg=12)
    for x in (-.533, .533):
        for y in (-.196, .196):
            C('sign corner screws', .009, .005, (x, y, .097), brass, g, rot=(0, 0, 0), parent=sign, seg=10)
    R('sign supply conduit', (.18, 2.213, -3.762), (.18, 1.94, -3.762), .008, steel, g)
    B('sign junction box', (.084, .085, .05), (.18, 1.905, -3.77), steel, g)

    # An actual luminaire at the source of the night pool over the car.
    diffuser = M('strip_diffuser', '#eee4cb', .42, emit='#ffe5b4', emit_str=0, glow=True)
    P = frame('strip lamp', (.2, 4.045, -.1))
    B('strip housing', (1.78, .1, .24), (0, 0, 0), steel, g, parent=P, bevel=.025)
    B('strip diffuser', (1.63, .028, .16), (0, -.06, 0), diffuser, g, parent=P, bevel=.013)
    for x in (-.67, .67):
        R('strip hanger', (x, .05, 0), (x, .255, 0), .009, steel, g, parent=P)
        B('strip mounting plate', (.09, .018, .07), (x, .249, 0), steel, g, parent=P)

    # Fixed pieces belong to the scene. They line up with the live hinge/stand/props.
    Q = frame('crate fixed hardware', (4.3, 0, .42), (0, -1.28, 0))
    for x in (-.31, .31):
        B('lower crate hinge plate', (.094, .098, .012), (x, .563, -.378), brass, g, parent=Q, bevel=.004)
        C('hinge barrel', .012, .083, (x, .614, -.37), brass, g, rot=Xr, parent=Q, seg=14)
        for dx in (-.029, .029):
            C('hinge plate screw', .007, .006, (x + dx, .539, -.386), steel, g, rot=(0, 0, 0), parent=Q, seg=10)
    for x in (-.438, .438):
        for z in (-.345, .345):
            B('crate rubber foot', (.066, .024, .06), (x, .012, z), rubber, g, parent=Q)

    for x in (-.31, .31):
        B('upper crate hinge leaf', (.087, .025, .012), (x, .636, -.374), brass, 'mounted_crate', parent=Q, bevel=.003)
        C('upper crate hinge pin', .006, .003, (x, .64, -.382), steel, 'mounted_crate', rot=(0, 0, 0), parent=Q, seg=10)

    G = frame('guitar stand', (-3.1, 0, -1.95), (0, .6, 0), 1.72)
    R('stand upright', (0, .09, -.1), (0, .625, -.047), .011, steel, g, parent=G, seg=16)
    R('stand cradle mounting tube', (0, .1, -.1), (0, .098, -.04), .011, steel, g, parent=G, seg=14)
    R('stand neck yoke', (-.029, .625, -.047), (.029, .625, -.047), .009, rubber, g, parent=G, seg=16)
    for side in (-1, 1):
        front = (side * .21, .013, .11)
        rear = (side * .04, .013, -.33)
        for end in (front, rear):
            R('stand leg', (0, .1, -.1), end, .011, steel, g, parent=G, seg=14)
            B('moulded stand foot', (.034, .026, .048), end, rubber, g, parent=G, bevel=.01)
        R('stand body cradle', (0, .098, -.04), (side * .12, .098, .04), .011, steel, g, parent=G, seg=14)
        T('rubber cradle sleeve', [(side * .12, .098, .04), (side * .126, .11, .074), (side * .13, .125, .09)],
          .012, rubber, g, parent=G, seg=12)
        R('rubber neck stop', (side * .024, .625, -.047), (side * .03, .69, -.032), .008, rubber, g, parent=G, seg=14)
    B('stand adjustment collar', (.039, .07, .032), (0, .308, -.081), steel, g, parent=G, bevel=.006)
    C('stand height thumbscrew', .016, .018, (.025, .308, -.081), rubber, g, rot=Xr, parent=G, seg=12)
    C('stand clamp pin', .005, .042, (0, .308, -.081), brass, g, rot=Xr, parent=G, seg=10)

    L = frame('laptop socket plates', (-2.45, 0, .3), (0, .5, 0), 2.05)
    for z, width in ((.109, .014), (.134, .010), (.154, .009)):
        B('machined port lip', (.002, .0065, width + .003), (-.146, .008, z), steel, g, parent=L, bevel=.001)
        B('recessed port opening', (.0014, .004, width), (-.147, .008, z), W['black'], g, parent=L, bevel=.0007)
    B('laptop activity indicator', (.002, .0016, .003), (-.146, .009, .17), W['leaf_pale'], g, parent=L, bevel=.0005)

    H = frame('trophy plaque pins', (3.72, 0, -.82), (0, -.3, 0), 1.5)
    for x in (-.048, .048):
        for y in (.074, .116):
            C('brass plaque rivet', .003, .002, (x, y, .082), brass, g, rot=(0, 0, 0), parent=H, seg=12)

    for profile in (
        [(.117, .616), (.122, .617), (.123, .620), (.121, .622), (.116, .621)],
        [(.015, .222), (.019, .223), (.019, .229), (.015, .231)],
    ):
        S('turned trophy collar', lathe(profile, W['chrome'], seg=64), g='mounted_trophy', parent=H)

    Y = frame('spare tyre liner', (3.2, .2, 1.5), scale=1.06)
    profile = [(.231, -.16), (.224, -.151), (.219, -.133), (.218, -.095), (.214, 0),
               (.218, .095), (.219, .133), (.224, .151), (.231, .16),
               (.234, .156), (.226, .125), (.226, -.125), (.234, -.156), (.231, -.16)]
    S('moulded inner tyre bead and liner', lathe(profile, rubber, seg=72), g='mounted_tyre', parent=Y)
