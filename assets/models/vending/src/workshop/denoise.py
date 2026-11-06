"""Clean a baked atlas with Blender's built-in Open Image Denoise. blender -b --python denoise.py -- in.exr out.exr"""
import bpy,sys
a=sys.argv[sys.argv.index('--')+1:]
img=bpy.data.images.load(a[0]);w,h=img.size
s=bpy.context.scene;s.use_nodes=True;t=s.node_tree;t.nodes.clear()
i=t.nodes.new('CompositorNodeImage');i.image=img;d=t.nodes.new('CompositorNodeDenoise');d.use_hdr=True;d.prefilter='ACCURATE';c=t.nodes.new('CompositorNodeComposite')
t.links.new(i.outputs[0],d.inputs['Image']);t.links.new(d.outputs[0],c.inputs[0])
s.render.resolution_x,s.render.resolution_y=w,h;s.render.resolution_percentage=100;s.render.image_settings.file_format='OPEN_EXR';s.render.image_settings.color_depth='32'
s.view_settings.view_transform='Raw';s.render.use_compositing=True;s.render.filepath=a[1]
bpy.ops.render.render(write_still=True)
