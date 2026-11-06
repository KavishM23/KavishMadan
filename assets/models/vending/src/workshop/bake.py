"""Bake direct and bounced light into one atlas per group, then export the GLB.
blender -b --python bake.py -- OUT samples size"""
import sys,os,json,math
sys.path.insert(0,os.path.dirname(__file__))
import bpy,numpy as np
a=sys.argv[sys.argv.index('--')+1:];OUT=a[0];SAMPLES=int(a[1]);SIZE=int(a[2]);ONLY=a[3] if len(a)>3 else 'shell,machine,props'
bpy.ops.wm.open_mainfile(filepath=OUT+'.blend')
import lightrig
lightrig.rig(json.load(open(OUT+'_pend.json')))
s=bpy.context.scene;s.render.resolution_x=s.render.resolution_y=SIZE;s.render.resolution_percentage=100;s.cycles.use_auto_tile=False;s.cycles.samples=SAMPLES;s.cycles.use_denoising=False;s.cycles.max_bounces=6;s.cycles.diffuse_bounces=4;s.cycles.glossy_bounces=1;s.cycles.caustics_reflective=False;s.cycles.caustics_refractive=False
s.render.bake.margin=6;s.render.bake.use_pass_direct=True;s.render.bake.use_pass_indirect=True;s.render.bake.use_pass_color=False;s.render.bake.use_clear=True
hide=[o for o in bpy.data.objects if o.name.startswith('mover')]
for o in hide:o.hide_render=True
meshes=[o for o in bpy.data.objects if o.type=='MESH']
for group in ONLY.split(','):
    obs=[o for o in meshes if o.get('g')==group and not o.get('bakeonly')]
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs:
        o.select_set(True)
        if 'lm' not in o.data.uv_layers:o.data.uv_layers.new(name='lm')
        o.data.uv_layers.active=o.data.uv_layers['lm']
    bpy.context.view_layer.objects.active=obs[0]
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(50),island_margin=.0035,area_weight=.0,scale_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    img=bpy.data.images.new('lm_'+group,SIZE,SIZE,alpha=False,float_buffer=True)
    for o in obs:
        for m in o.data.materials:
            t=m.node_tree;n=t.nodes.get('BAKE') or t.nodes.new('ShaderNodeTexImage');n.name='BAKE';n.image=img;t.nodes.active=n;n.select=True
    bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},margin=6,use_clear=True)
    img.filepath_raw=OUT+'_'+group+'.exr';img.file_format='OPEN_EXR';img.save()
    print('baked',group,len(obs),flush=True)
for o in meshes:
    if o.get('bakeonly'):bpy.data.objects.remove(o)
for o in hide:o.hide_render=False
bpy.ops.wm.save_as_mainfile(filepath=OUT+'_baked.blend')
for m in bpy.data.materials:
    t=m.node_tree
    if 'BAKE' in t.nodes:t.nodes.remove(t.nodes['BAKE'])
for o in [x for x in bpy.data.objects if x.type!='MESH']:bpy.data.objects.remove(o)
for o in bpy.data.objects:
    if o.data.uv_layers:o.data.uv_layers.active_index=0
def out(selected,path):
    bpy.ops.object.select_all(action='DESELECT')
    for o in selected:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_apply=False,export_yup=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_animations=False)
meshes=[o for o in bpy.data.objects if o.type=='MESH']
out([o for o in meshes if not o.name.startswith('mover')],OUT+'_raw.glb')
out([o for o in meshes if o.name.startswith('mover')],OUT+'_movers.glb')
print('exported',flush=True)
