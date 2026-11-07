"""Tiling surfaces and the print atlas for the home Workshop. numpy, scipy and Pillow only.

python textures.py OUT IMG strata_parts.json

Every surface texture here is generated. Photographs and sketches come from the
site's own img folder; labels and sheets are drawn here. atlas.json records where
each print sits, in UV space, so the Blender build can map it."""
import sys, os, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
from scipy.ndimage import gaussian_filter as blur

OUT, IMG, PARTS = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def tn(n, sigma):
    a = blur(rng.random((n, n)), sigma, mode='wrap')
    return (a - a.min()) / np.ptp(a)


def fbm(n, base, octaves=5):
    a = np.zeros((n, n)); w = 1; t = 0; s = base
    for _ in range(octaves):
        a += tn(n, s) * w; t += w; w *= .55; s = max(.6, s / 2)
    a /= t
    return (a - a.min()) / np.ptp(a)


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


def save(name, a, size=None):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))
    if size: im = im.resize((size, size), Image.LANCZOS)
    im.save(f'{OUT}/{name}.png')


def grey(a): return np.dstack([a] * 3)


# Oiled oak, grain along U. Wavy growth lines, medullary flecks and darker pores.
N = 1024
Y, X = np.mgrid[0:N, 0:N] / N
warp = tn(N, 60) * .09 + tn(N, 14) * .012
lines = (np.sin((Y + warp) * 2 * math.pi * 26 + tn(N, 30) * 4) * .5 + .5) ** 3
pores = blur((rng.random((N, N)) > .985).astype(float), .6, mode='wrap')
pores = blur(pores, (0, 5), mode='wrap')
fleck = blur((rng.random((N, N)) > .9993).astype(float), (.8, 7), mode='wrap')
k = fbm(N, 90)
oak = hexc('#b98a5a')[None, None] * (.84 + .2 * k[..., None])
oak = oak * (1 - .2 * lines[..., None]) * (1 - .55 * np.clip(pores * 5, 0, 1)[..., None])
oak = oak + np.clip(fleck * 8, 0, 1)[..., None] * .06
save('oak_a', oak)
save('oak_r', grey(.52 + .2 * lines + .18 * np.clip(pores * 5, 0, 1)), 512)

# End grain: concentric rings from a pith off the tile, so a sawn end reads as sawn.
n = 512; y, x = np.mgrid[0:n, 0:n] / n
r = np.hypot(x + .9, y - 1.4) + tn(n, 20) * .03
rings = (np.sin(r * 2 * math.pi * 30) * .5 + .5) ** 2
eg = hexc('#8d6440')[None, None] * (.78 + .14 * tn(n, 8)[..., None]) * (1 - .32 * rings[..., None])
eg *= 1 - .4 * blur((rng.random((n, n)) > .96).astype(float), .7, mode='wrap')[..., None]
save('endgrain_a', eg)

# Powder coat: fine orange peel, neutral so each material tints it.
n = 512
peel = tn(n, 2.2) * .6 + tn(n, 6) * .4
save('powder_a', grey(.88 + .1 * peel))
save('powder_r', grey(.42 + .16 * peel))

# Pegboard: 25.4 mm pitch, ten holes to the tile, on painted hardboard.
n = 512; y, x = np.mgrid[0:n, 0:n] / n
d = np.hypot((x * 10) % 1 - .5, (y * 10) % 1 - .5)
hole = np.clip((.105 - d) / .02, 0, 1)
ring = np.clip(1 - abs(d - .12) / .03, 0, 1)
board = .9 + .06 * tn(n, 3)
peg = grey(board * (1 - .08 * ring)) * (1 - hole[..., None] * .86)
save('peg_a', peg)

# Cork, sanded fresh.
n = 512
c = tn(n, .8) * .5 + tn(n, 2.5) * .3 + tn(n, 9) * .2
cork = hexc('#b58a59')[None, None] * (.7 + .45 * c[..., None])
save('cork_a', cork)

# Corrugated card: two-tone kraft with a faint flute.
n = 512; y, x = np.mgrid[0:n, 0:n] / n
flute = np.sin(x * 2 * math.pi * 64) * .5 + .5
card = hexc('#b08a5e')[None, None] * (.9 + .06 * flute[..., None] + .1 * tn(n, 12)[..., None])
save('card_a', card)

# Lime plaster for the reveals and window head, a touch uneven.
n = 1024
pl = fbm(n, 70)
pla = grey(.9 + .08 * pl) * hexc('#f2ece0')[None, None]
pla *= 1 - .05 * blur((rng.random((n, n)) > .995).astype(float), 1.5, mode='wrap')[..., None]
save('plaster_a', pla)

# Rubber and galvanised steel.
n = 256
save('rubber_a', grey(.85 + .15 * tn(n, 1.4)))
n = 512
sp = blur(rng.random((n // 16, n // 16)), .0)
sp = np.kron(sp, np.ones((16, 16)))[:n, :n]
sp = blur(sp, 1.3, mode='wrap')
save('galv_a', grey(.8 + .2 * sp))

# ---------------------------------------------------------------------------
# Print atlas. Each entry is a rectangle in a 4096 canvas, saved at 2048.
A = 4096
atlas = Image.new('RGB', (A, A), (232, 224, 206))
dr = ImageDraw.Draw(atlas)
rects = {}


def font(size, bold=False, mono=False, hand=False):
    paths = []
    if hand: paths += ['/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf']
    if mono: paths += ['/System/Library/Fonts/Supplemental/Courier New Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Courier New.ttf', '/System/Library/Fonts/Menlo.ttc']
    paths += ['/System/Library/Fonts/Supplemental/DIN Alternate Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
              '/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/Library/Fonts/Arial.ttf']
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except OSError: pass
    return ImageFont.load_default()


cursor = [0, 0, 0]  # x, y, row height


def slot(name, w, h):
    x, y, rh = cursor
    if x + w > A: x, y, rh = 0, y + rh + 8, 0
    rects[name] = (x, y, w, h)
    cursor[:] = [x + w + 8, y, max(rh, h)]
    return x, y


def uv(name):
    x, y, w, h = rects[name]
    # Pillow's origin is top left; UVs start bottom left.
    return [x / A, 1 - (y + h) / A, (x + w) / A, 1 - y / A]


def paste_photo(name, file, w, h, border=18, tone=None):
    x, y = slot(name, w, h)
    dr.rectangle([x, y, x + w, y + h], fill=(242, 238, 228))
    im = Image.open(os.path.join(IMG, file)).convert('RGB')
    im = ImageOps.fit(im, (w - border * 2, h - border * 2), Image.LANCZOS)
    if tone: im = Image.blend(im, Image.new('RGB', im.size, tone), .06)
    atlas.paste(im, (x + border, y + border))


# Real project photographs and sketches.
paste_photo('photo_hero', 'strata-hero.webp', 900, 600, 0)
paste_photo('pin_sketch', 'strata-1-sketch.webp', 560, 420)
paste_photo('pin_cad', 'strata-2-cad.webp', 560, 420)
paste_photo('pin_laser', 'strata-4-laser.webp', 560, 420)
paste_photo('pin_tyre', 'strata-5-tyre.webp', 560, 420)
paste_photo('pin_wiring', 'strata-6-wiring.webp', 560, 420)
paste_photo('pin_card', 'strata-3-card.webp', 560, 420)

# Marked-up assembly sketch, drawn from the real CAD rib outlines.
parts = json.load(open(PARTS))
x0, y0 = slot('assembly', 1000, 700)
sheet = Image.new('RGB', (1000, 700), (238, 233, 220)); g = ImageDraw.Draw(sheet)
for i in range(0, 1000, 25): g.line([(i, 0), (i, 700)], fill=(214, 220, 216), width=1)
for j in range(0, 700, 25): g.line([(0, j), (1000, j)], fill=(214, 220, 216), width=1)
ink = (52, 70, 82)
ribs = [r for r in parts['ribs'] if r['outer']]
ribs.sort(key=lambda r: r['x'])
for k, rb in enumerate(ribs[::3]):
    off = k * 13
    pts = [(80 + p[0] * 22 + off, 470 - p[1] * 22 - off * .55) for p in rb['outer']]
    g.line(pts + [pts[0]], fill=ink, width=2)
g.rectangle([80, 470, 80 + 34 * 22, 470 + 14.8 * 22 * .25], outline=ink, width=3)
red = (176, 52, 38)
g.text((70, 40), 'STRATA  -  RIB ASSEMBLY', font=font(40, True), fill=ink)
g.text((70, 92), '22 ribs  /  plate slots', font=font(30, mono=True), fill=ink)
g.ellipse([560, 260, 700, 360], outline=red, width=5)
g.line([(700, 300), (820, 230)], fill=red, width=4)
g.text((760, 180), 'check fit', font=font(40, hand=True), fill=red)
g.line([(150, 560), (870, 560)], fill=red, width=3)
g.text((360, 580), '30 mm cut', font=font(42, hand=True), fill=red)
atlas.paste(sheet, (x0, y0))

# Car setup sheet (set dressing, deliberately generic).
x0, y0 = slot('setup', 700, 940)
s = Image.new('RGB', (700, 940), (242, 238, 229)); g = ImageDraw.Draw(s)
g.rectangle([0, 0, 700, 90], fill=(34, 56, 74))
g.text((30, 22), 'SETUP SHEET', font=font(48, True), fill=(240, 232, 214))
g.text((30, 120), 'CAR  12          SESSION  ___', font=font(30, mono=True), fill=(40, 40, 40))
for j, row in enumerate(['TYRE PRESS', 'RIDE HEIGHT', 'CAMBER', 'TOE', 'FRONT WING', 'REAR WING', 'NOTES']):
    yy = 190 + j * 100
    g.line([(30, yy + 70), (670, yy + 70)], fill=(160, 160, 150), width=2)
    g.text((30, yy + 20), row, font=font(26, mono=True), fill=(70, 70, 70))
    if j < 4:
        for c in range(4):
            g.text((300 + c * 95, yy - 5), ['FL', 'FR', 'RL', 'RR'][c], font=font(20, mono=True), fill=(130, 130, 120))
hand = font(40, hand=True)
for j, vals in enumerate([['1.4', '1.4', '1.3', '1.3'], ['32', '32', '48', '48'], ['-3.0', '-3.0', '-1.5', '-1.5']]):
    for c, v in enumerate(vals): g.text((300 + c * 95, 190 + j * 100 + 18), v, font=hand, fill=(30, 60, 120))
g.text((300, 690), 'more rear', font=hand, fill=(30, 60, 120))
g.text((60, 820), 'check rear wing bolts', font=hand, fill=(176, 52, 38))
atlas.paste(s, (x0, y0))

# Pit board letters.
x0, y0 = slot('pitboard', 600, 800)
s = Image.new('RGB', (600, 800), (24, 26, 28)); g = ImageDraw.Draw(s)
for j, txt in enumerate(['P1', 'L 12', '+2.1', 'BOX']):
    g.rectangle([30, 30 + j * 190, 570, 190 + j * 190], fill=(36, 38, 40))
    g.text((300, 110 + j * 190), txt, font=font(140, True), fill=(236, 226, 196) if j != 3 else (226, 168, 60), anchor='mm')
atlas.paste(s, (x0, y0))

# Labels: drawers, bins, tins, boxes. White card in a brass holder or on tape.
labels = {
    'lab_m3': 'M3 SCREWS', 'lab_m4': 'M4 NUTS', 'lab_bear': 'BEARINGS', 'lab_jst': 'JST / XT60',
    'lab_wire': 'WIRE 22AWG', 'lab_crimp': 'CRIMPS', 'lab_hex': 'HEX KEYS', 'lab_drill': 'DRILL BITS',
    'lab_spare': 'SPARES', 'lab_pla': 'PLA+', 'lab_tpu': 'TPU', 'lab_acr': 'ACRYLIC 3MM',
    'lab_tape': 'TAPE', 'lab_glue': 'GLUE', 'lab_zip': 'ZIP TIES', 'lab_kess': 'KESSLER TEST',
    'lab_sens': 'SENSORS', 'lab_serv': 'SERVOS',
}
for key, text in labels.items():
    x0, y0 = slot(key, 360, 110)
    dr.rectangle([x0, y0, x0 + 360, y0 + 110], fill=(240, 236, 226))
    dr.text((x0 + 180, y0 + 56), text, font=font(46, True), fill=(36, 44, 50), anchor='mm')

# Tape strips with marker writing.
for key, text in {'tape_flat': 'FLAT  -  DO NOT USE', 'tape_new': 'NEW SET', 'tape_rib': 'RIBS 10-22'}.items():
    x0, y0 = slot(key, 520, 90)
    dr.rectangle([x0, y0, x0 + 520, y0 + 90], fill=(222, 210, 168))
    dr.text((x0 + 260, y0 + 46), text, font=font(54, hand=True), fill=(30, 30, 40), anchor='mm')

# Caliper display, multimeter face.
x0, y0 = slot('caliper_lcd', 300, 110)
dr.rectangle([x0, y0, x0 + 300, y0 + 110], fill=(170, 182, 160))
dr.text((x0 + 150, y0 + 58), '34.00', font=font(84, True, mono=True), fill=(30, 36, 32), anchor='mm')
x0, y0 = slot('meter', 360, 560)
dr.rectangle([x0, y0, x0 + 360, y0 + 560], fill=(214, 156, 44))
dr.rectangle([x0 + 30, y0 + 30, x0 + 330, y0 + 170], fill=(156, 170, 150))
dr.text((x0 + 180, y0 + 100), '11.87', font=font(96, True, mono=True), fill=(30, 36, 32), anchor='mm')
dr.ellipse([x0 + 80, y0 + 220, x0 + 280, y0 + 420], fill=(40, 40, 42))
for a in range(12):
    t = a / 12 * 2 * math.pi
    dr.line([(x0 + 180 + 95 * math.cos(t), y0 + 320 + 95 * math.sin(t)), (x0 + 180 + 125 * math.cos(t), y0 + 320 + 125 * math.sin(t))], fill=(30, 30, 30), width=5)
for i, c in enumerate([(30, 30, 30), (30, 30, 30), (180, 40, 30)]):
    dr.ellipse([x0 + 50 + i * 100, y0 + 460, x0 + 110 + i * 100, y0 + 520], fill=(20, 20, 20), outline=c, width=8)

# Cutting mat: green with a 10 mm grid.
x0, y0 = slot('mat', 1200, 900)
dr.rectangle([x0, y0, x0 + 1200, y0 + 900], fill=(46, 92, 74))
for i in range(0, 1200, 20): dr.line([(x0 + i, y0), (x0 + i, y0 + 900)], fill=(86, 134, 112) if i % 100 else (150, 190, 168), width=1 if i % 100 else 2)
for j in range(0, 900, 20): dr.line([(x0, y0 + j), (x0 + 1200, y0 + j)], fill=(86, 134, 112) if j % 100 else (150, 190, 168), width=1 if j % 100 else 2)
for i in range(30):
    a = rng.random() * 6.28; cx, cy = x0 + rng.random() * 1200, y0 + rng.random() * 900; l = 40 + rng.random() * 160
    dr.line([(cx, cy), (cx + math.cos(a) * l, cy + math.sin(a) * l)], fill=(70, 112, 94), width=2)

# A folded technical drawing and the outer face of a rolled one.
x0, y0 = slot('drawing', 900, 640)
s = Image.new('RGB', (900, 640), (228, 232, 236)); g = ImageDraw.Draw(s)
g.rectangle([20, 20, 880, 620], outline=(60, 80, 110), width=3)
g.rectangle([600, 500, 880, 620], outline=(60, 80, 110), width=2)
g.text((612, 512), 'KM / DRG 07', font=font(30, True), fill=(60, 80, 110))
g.text((612, 560), 'SCALE 1:2', font=font(24, mono=True), fill=(60, 80, 110))
for k in range(6):
    g.ellipse([90 + k * 12, 120 + k * 8, 470 - k * 12, 440 - k * 8], outline=(60, 80, 110), width=2)
g.line([(80, 280), (480, 280)], fill=(60, 80, 110), width=1); g.line([(280, 90), (280, 470)], fill=(60, 80, 110), width=1)
for i in range(7): g.line([(520, 120 + i * 50), (840, 120 + i * 50)], fill=(150, 160, 175), width=2)
atlas.paste(s, (x0, y0))

# Fire extinguisher label, outlet face, a box of filament.
x0, y0 = slot('extinguisher', 300, 420)
dr.rectangle([x0, y0, x0 + 300, y0 + 420], fill=(236, 230, 218))
dr.text((x0 + 150, y0 + 70), 'CO2', font=font(110, True), fill=(30, 30, 30), anchor='mm')
dr.text((x0 + 150, y0 + 170), '2 kg', font=font(56, True), fill=(30, 30, 30), anchor='mm')
for i in range(5): dr.line([(x0 + 40, y0 + 240 + i * 34), (x0 + 260, y0 + 240 + i * 34)], fill=(120, 120, 120), width=6)
x0, y0 = slot('filament', 600, 300)
dr.rectangle([x0, y0, x0 + 600, y0 + 300], fill=(244, 240, 232))
dr.rectangle([x0, y0, x0 + 600, y0 + 70], fill=(40, 70, 90))
dr.text((x0 + 300, y0 + 36), 'PLA+  1.75 mm', font=font(44, True), fill=(240, 236, 226), anchor='mm')
dr.text((x0 + 300, y0 + 170), '1 kg', font=font(80, True), fill=(40, 70, 90), anchor='mm')

atlas = atlas.filter(ImageFilter.UnsharpMask(1.2, 40, 2))
atlas.resize((2048, 2048), Image.LANCZOS).save(f'{OUT}/prints.png')
json.dump({k: uv(k) for k in rects}, open(f'{OUT}/atlas.json', 'w'), indent=0)
print('textures and atlas written to', OUT, 'atlas use', cursor[1] + cursor[2], 'of', A)
