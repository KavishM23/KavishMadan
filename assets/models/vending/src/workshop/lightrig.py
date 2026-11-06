"""Warm practical lights with a controlled cool accent. Positions are page units (x, y up, z to viewer)."""
import bpy,math,json
from mathutils import Vector
P=lambda x,y,z:(x,-z,y)
BOUNCE={'wall_brick':'#aaa18f','floor':'#8f8a80','wood':'#a98255','wood_dark':'#6e4a2e','ceiling_boards':'#7a5c43','peg':'#d9ccb0','cork':'#b98d5b','card':'#b4916a','mat':'#2a2d2e'}
def srgb(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)];return [x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]+[1]
def gpu():
    p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
    for d in p.devices:d.use=(d.type=='METAL')
    bpy.context.scene.cycles.device='GPU'
def rig(pend):
    s=bpy.context.scene;s.render.engine='CYCLES';gpu()
    for n,c in BOUNCE.items():
        m=bpy.data.materials.get(n)
        if m:m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=srgb(c)
    # metals have no diffuse response, so they would bake black; bake everything as a dielectric
    for m in bpy.data.materials:
        b=m.node_tree.nodes.get('Principled BSDF')
        if b:b.inputs['Metallic'].default_value=0;b.inputs['Coat Weight'].default_value=0
    w=bpy.data.worlds.new('w');w.use_nodes=True;bg=w.node_tree.nodes['Background'];bg.inputs[0].default_value=srgb('#26394a');bg.inputs[1].default_value=.05;s.world=w
    def lamp(n,kind,loc,color,energy,size=.4,rot=None,spot=None):
        l=bpy.data.lights.new(n,kind);l.color=srgb(color)[:3];l.energy=energy
        if kind=='POINT':l.shadow_soft_size=size
        if kind=='SPOT':l.shadow_soft_size=size;l.spot_size=spot[0];l.spot_blend=spot[1]
        if kind=='AREA':l.shape='RECTANGLE';l.size=size[0];l.size_y=size[1]
        o=bpy.data.objects.new(n,l);s.collection.objects.link(o);o.location=P(*loc)
        if rot:o.rotation_euler=(Vector(P(*rot))-Vector(P(*loc))).to_track_quat('-Z','Y').to_euler()
        return o
    # pendants: warm pools over the bench and the shelves
    lamp('pendA','POINT',(-4.4,7.0,.2),'#ffcf96',170,.3)
    lamp('pendB','POINT',(5.8,7.25,.2),'#ffcf96',150,.3)
    # a soft hero light over the machine front, from the pendant in front of it
    lamp('hero','SPOT',(1.1,8.2,6.5),'#ffe4bd',1900,.8,rot=(1.0,2.5,2.2),spot=(math.radians(74),.85))
    # shadow-board hood
    lamp('hood','AREA',(-3.5,7.42,-.9),'#ffd9a6',30,(5.0,.5),rot=(-3.5,5,-1.5))
    # cool dusk through the window, the only blue in the room
    lamp('dusk','AREA',(-10.5,6.2,4.5),'#7fb2dc',620,(6,5),rot=(-3,1,2.5))
    lamp('cool','AREA',(7.9,5.25,-.6),'#8fc4e6',42,(4.4,.14),rot=(6,3.5,-1))
    # low fill so the foreground never falls to black
    lamp('binL','AREA',(-.5,1.7,1.8),'#ffe2b8',14,(2.6,.4),rot=(-.5,.6,1.8))
    lamp('fill','AREA',(0,8.3,12),'#bcd0dc',170,(14,10),rot=(0,0,12))
def camera(pos,look,fov=35,aspect=1.6):
    s=bpy.context.scene;c=bpy.data.objects.get('cam') or bpy.data.objects.new('cam',bpy.data.cameras.new('cam'))
    if c.name not in s.collection.objects:s.collection.objects.link(c)
    c.data.sensor_fit='VERTICAL';c.data.sensor_height=24;c.data.lens=12/math.tan(math.radians(fov)/2);c.data.clip_end=200;s.camera=c
    c.location=P(*pos);c.rotation_euler=(Vector(P(*look))-Vector(P(*pos))).to_track_quat('-Z','Y').to_euler();return c
