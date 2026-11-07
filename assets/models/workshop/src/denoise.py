"""Clean every baked map with Blender's Open Image Denoise and save it as a float array for pack.py.
blender -b --python denoise.py -- WORK"""
import bpy, sys, os, glob
import numpy as np
WORK = sys.argv[sys.argv.index('--') + 1]
s = bpy.context.scene; s.use_nodes = True; t = s.node_tree
s.render.image_settings.file_format = 'OPEN_EXR'; s.render.image_settings.color_depth = '32'
s.view_settings.view_transform = 'Standard'; s.render.use_compositing = True; s.render.resolution_percentage = 100
for f in sorted(glob.glob(os.path.join(WORK, 'light-*.exr'))):
    if f.endswith('-dn.exr'): continue
    img = bpy.data.images.load(f); w, h = img.size
    t.nodes.clear()
    i = t.nodes.new('CompositorNodeImage'); i.image = img
    d = t.nodes.new('CompositorNodeDenoise'); d.use_hdr = True; d.prefilter = 'ACCURATE'
    c = t.nodes.new('CompositorNodeComposite')
    t.links.new(i.outputs[0], d.inputs['Image']); t.links.new(d.outputs[0], c.inputs[0])
    s.render.resolution_x, s.render.resolution_y = w, h
    out = f[:-4] + '-dn.exr'; s.render.filepath = out
    bpy.ops.render.render(write_still=True)
    r = bpy.data.images.load(out); r.colorspace_settings.name = 'Non-Color'
    a = np.array(r.pixels[:], dtype=np.float32).reshape(h, w, 4)[..., :3]
    np.save(f[:-4] + '.npy', a)
    print('denoised', os.path.basename(f), w, h, flush=True)
