"""Encode the baked maps and textures for the page and write its manifest.
python pack.py WORK OUT

Each lightmap is stored as sRGB WebP scaled to its own 99.7th percentile; the scale goes in the
manifest so the page restores real light levels. Phones get half-size maps."""
import sys, os, json, glob
import numpy as np
from PIL import Image
WORK, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)
scales = {}
for f in sorted(glob.glob(os.path.join(WORK, 'light-*.npy'))):
    name = os.path.basename(f)[:-4]                        # light-day-dress
    a = np.nan_to_num(np.load(f)); a[a < 0] = 0
    a = np.flipud(a)                                        # Blender rows start at the bottom
    lum = a.max(2); sc = float(max(.02, np.percentile(lum[lum > 1e-5], 99.7)))
    b = np.clip(a / sc, 0, 1)
    e = np.where(b <= .0031308, b * 12.92, 1.055 * b ** (1 / 2.4) - .055)
    e = np.clip(e + (rng.random(e.shape[:2])[..., None] - .5) / 255, 0, 1)   # stop banding in soft gradients
    im = Image.fromarray((e * 255 + .5).astype(np.uint8))
    im.save(os.path.join(OUT, name + '.webp'), quality=88, method=6)
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(os.path.join(OUT, name + '-mobile.webp'), quality=84, method=6)
    _, theme, group = name.split('-'); scales.setdefault(theme, {})[group] = round(sc, 5)
    print(name, im.size, 'scale', round(sc, 4), flush=True)
T = os.path.join(WORK, 'tex')
sizes = {'oak_a': 1024, 'oak_r': 512, 'endgrain_a': 512, 'powder_a': 512, 'powder_r': 512, 'peg_a': 512, 'cork_a': 512,
         'card_a': 512, 'plaster_a': 1024, 'rubber_a': 256, 'galv_a': 256, 'prints': 2048}
for n, size in sizes.items():
    im = Image.open(os.path.join(T, n + '.png')).convert('RGB')
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, n + '.webp'), quality=86 if n != 'prints' else 88, method=6)
    if n == 'prints': im.resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, 'prints-mobile.webp'), quality=86, method=6)
table = json.load(open(os.path.join(WORK, 'materials.json')))
used = {k: v for k, v in table.items() if not k.startswith(('room_', 'proxy_'))}
json.dump({'materials': used, 'textures': list(sizes), 'lightmaps': scales,
           'glows': [[-3.59, 1.39, -3.4, .5, '#ffc27a'], [4.5, 2.62, -.76, .4, '#ffcb88']]},
          open(os.path.join(OUT, 'manifest.json'), 'w'))
print(sum(os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT)) // 1024, 'KB in', OUT)
