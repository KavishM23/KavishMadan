"""Stairwell lighting: cool dusk falling from the oculus, warm lanterns on the wall, and a warm pool in each alcove."""
import bpy,math,json
from mathutils import Vector
P=lambda x,y,z:(x,-z,y)
BOUNCE={'zellige':'#143f5e','plaster':'#e2d6be','plaster_flat':'#e2d6be','terracotta':'#8f5a42','stone':'#b8ac98','stone_col':'#a89c88','wood':'#a98255','wood_dark':'#6e4a2e','wall_brick':'#aaa18f','floor_ves':'#8f5a42','ceiling_boards':'#7a5c43'}
def srgb(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)];return [x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]+[1]
def gpu():
    p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
    for d in p.devices:d.use=(d.type=='METAL')
    bpy.context.scene.cycles.device='GPU'
def fromStop(L,s,x,y,z):
    c,n=math.cos(s['theta']),math.sin(s['theta']);r=L['wallR']-z;return (n*r-c*x,s['y']+y,c*r+n*x)
def rig(L,lant):
    s=bpy.context.scene;s.render.engine='CYCLES';gpu()
    for m in bpy.data.materials:
        b=m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
        if b:b.inputs['Metallic'].default_value=0;b.inputs['Coat Weight'].default_value=0
    for n,c in BOUNCE.items():
        m=bpy.data.materials.get(n)
        if m:m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=srgb(c)
    w=bpy.data.worlds.new('w');w.use_nodes=True;bg=w.node_tree.nodes['Background'];bg.inputs[0].default_value=srgb('#1d3346');bg.inputs[1].default_value=.28;s.world=w
    def lamp(n,kind,loc,color,energy,size=.4,rot=None):
        l=bpy.data.lights.new(n,kind);l.color=srgb(color)[:3];l.energy=energy
        if kind=='POINT':l.shadow_soft_size=size
        if kind=='AREA':l.shape='RECTANGLE';l.size=size[0];l.size_y=size[1]
        if kind=='SPOT':l.shadow_soft_size=size;l.spot_size=math.radians(80);l.spot_blend=.8
        o=bpy.data.objects.new(n,l);s.collection.objects.link(o);o.location=P(*loc)
        if rot:o.rotation_euler=(Vector(P(*rot))-Vector(P(*loc))).to_track_quat('-Z','Y').to_euler()
    lamp('sky','AREA',(0,L['shaftTop']-.2,0),'#9ac6e8',2900,(9,9),rot=(0,-20,0))
    lamp('skylow','AREA',(0,-24,8.5),'#9ac6e8',380,(6,30),rot=(0,-24,0))
    for i,p in enumerate(lant):lamp('lan'+str(i),'POINT',tuple(p),'#ffbe78',150,.3)
    tint=[('#ffdcae','#d7e6c2'),('#ffdcae','#ffd9a8'),('#ffdcae','#7f9cff')]
    for i,st in enumerate(L['stops']):
        lamp(f'alc{i}','POINT',fromStop(L,st,0,L['alcoveH']-2.4,-2.3),tint[i][0],240,.5)
        lamp(f'alcf{i}','AREA',fromStop(L,st,-.4,7.8,3.5),'#ffe6c4',170,(7,4),rot=fromStop(L,st,.2,2,-3))
        lamp(f'alcb{i}','POINT',fromStop(L,st,3,1.6,-4),tint[i][1],36,.4)
        lamp(f'scr{i}','AREA',fromStop(L,st,.2,3.7,-1.2),'#cfe2f0',9,(1.2,.8),rot=fromStop(L,st,.2,3.2,2))
    a=L['thetaEnd']-.1;p=(math.sin(a)*7.4,L['floorY']+.8,math.cos(a)*7.4);lamp('pad','POINT',p,'#ffd29a',120,.6)
    lamp('floorfill','POINT',(0,L['floorY']+6,6),'#9ac6e8',110,1)
    # vestibule
    y0=62
    for x in (-8.5,8.5):lamp('v'+str(x),'POINT',(x,y0+6.7,-.2),'#ffc78a',360,.4)
    lamp('vfront','AREA',(0,y0+11,12),'#ffe4c4',1100,(14,10),rot=(0,y0+3,0))
    lamp('vcool','AREA',(-11,y0+7,12),'#a5c9e4',220,(4,8),rot=(0,y0+4,0))
def camera(pos,look,fov=38):
    s=bpy.context.scene;c=bpy.data.objects.get('cam') or bpy.data.objects.new('cam',bpy.data.cameras.new('cam'))
    if c.name not in s.collection.objects:s.collection.objects.link(c)
    c.data.sensor_fit='VERTICAL';c.data.sensor_height=24;c.data.lens=12/math.tan(math.radians(fov)/2);c.data.clip_end=300;s.camera=c
    c.location=P(*pos);c.rotation_euler=(Vector(P(*look))-Vector(P(*pos))).to_track_quat('-Z','Y').to_euler()
