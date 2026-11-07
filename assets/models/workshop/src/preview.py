"""Render the built scene from the page's cameras, for checking layout before the bake.
blender -b WORK/workshop.blend --python preview.py -- OUTDIR THEME SAMPLES [views]"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'vending', 'src'))
import bpy, lights
a = sys.argv[sys.argv.index('--') + 1:]; OUT, THEME, SAMPLES = a[0], a[1], int(a[2]); ONLY = a[3].split(',') if len(a) > 3 else None
VIEWS = {
    'rest': ((.52, 2.62, 9.35), (.15, .95, -.5), 31, (1440, 900)),
    'left': ((2.9, 2.5, 8.6), (-2.6, 1.1, -1.6), 31, (1440, 900)),
    'right': ((-2.4, 2.5, 8.9), (3.0, 1.1, -1.4), 31, (1440, 900)),
    'bench': ((-2.55, 1.5, -.1), (-4.1, .95, -2.45), 40, (1200, 800)),
    'benchtop': ((-3.55, 1.45, -2.35), (-4.0, .9, -3.3), 45, (1200, 800)),
    'shelf': ((2.4, 1.8, .2), (4.7, 1.5, -2.0), 45, (1200, 800)),
    'chest': ((-.3, 1.45, -1.6), (.5, .7, -3.5), 45, (1200, 800)),
    'window': ((-2.6, 1.7, .9), (-5.3, 1.6, -1.2), 45, (1200, 800)),
    'phone': ((.4, 3.4, 15.5), (.15, .62, -.5), 31, (500, 900)),
}
s = bpy.context.scene; s.render.engine = 'CYCLES'
try:
    p = bpy.context.preferences.addons['cycles'].preferences; p.compute_device_type = 'METAL'; p.get_devices()
    for d in p.devices: d.use = d.type == 'METAL'
    s.cycles.device = 'GPU'
except Exception as e: print('cpu render', e)
s.cycles.samples = SAMPLES; s.cycles.use_denoising = True; s.view_settings.view_transform = 'AgX'; s.view_settings.look = 'AgX - Base Contrast'
lights.rig(THEME)
for name, (pos, look, fov, (w, h)) in VIEWS.items():
    if ONLY and name not in ONLY: continue
    lights.camera(pos, look, fov); s.render.resolution_x, s.render.resolution_y = w, h; s.render.resolution_percentage = 50
    s.render.filepath = os.path.join(OUT, f'bl-{THEME}-{name}.png'); bpy.ops.render.render(write_still=True); print('rendered', name, flush=True)
