"""Build the Code gateway in page coordinates using the workshop modelling kit."""
from pathlib import Path
import math
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent / 'vending/src/workshop'))
import kit as k
import bpy
from mathutils import Vector

CX, HALF, FLOOR, TOP, TURN = -2.2, .65, .117, 2.5, .44
RADIUS = HALF / math.cos(TURN)
CENTER_Y = TOP - RADIUS
OPEN_HALF, BASE, AXIS_Z, THICKNESS = .60, .171, -.185, .085
LEAF_WIDTH, LEAF_RADIUS = .594, RADIUS - .056
HINGES = (.105, .79, 1.39)
ANGLE = math.pi + 2 * TURN

k.start()
paint = k.M('Cedar paint', '#234960', .63)
field = k.M('Fielded cedar', '#234359', .65)
wood = k.M('Timber jamb', '#51311e', .68)
brass = k.M('Aged brass', '#b38c49', .42)
iron = k.M('Blackened iron', '#25282a', .53)
cream = k.M('Cream inlay', '#decb9f', .56)
plaster = k.M('Lime plaster', '#d9c8b0', .86)
stone = k.M('Limestone', '#b7ab98', .72)
terra = k.M('Terracotta', '#a4563c', .76)
seal = k.M('Brush seal', '#151617', .92)
glass = k.M('Lamp glass', '#ffc27e', .38)
glass['bulb'] = True

def weather(mat, dark, light, scale, grain=None):
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    uv = nodes.new('ShaderNodeTexCoord')
    stretch = nodes.new('ShaderNodeVectorMath')
    stretch.operation = 'MULTIPLY'
    stretch.inputs[1].default_value = grain or (1, 1, 1)
    links.new(uv.outputs['Object'], stretch.inputs[0])
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = scale
    noise.inputs['Detail'].default_value = 3
    links.new(stretch.outputs[0], noise.inputs['Vector'])
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = .22
    ramp.color_ramp.elements[1].position = .82
    ramp.color_ramp.elements[0].color = k.srgb(dark)
    ramp.color_ramp.elements[1].color = k.srgb(light)
    links.new(noise.outputs['Fac'], ramp.inputs[0])
    shader = nodes['Principled BSDF']
    links.new(ramp.outputs[0], shader.inputs['Base Color'])
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .20
    bump.inputs['Distance'].default_value = .002
    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs[0], shader.inputs['Normal'])

for material, dark, light in [(paint,'#1a374c','#2e5770'),(field,'#183344','#2b5066'),(wood,'#3e2518','#68432d')]:
    weather(material, dark, light, 20, (6, .16, 6))
weather(brass, '#806334', '#c8a666', 23)
weather(plaster, '#c8b79f', '#e1d2b8', 24)
weather(stone, '#a59783', '#c4b9a5', 20)
weather(terra, '#954b35', '#b96a50', 21)

def part(name, mesh, xyz=(0,0,0), parent=None, rot=(0,0,0), scale=None):
    return k.S(name, mesh, xyz, rot, parent=parent, scale=scale)

def block(name, xyz, dim, material, bevel=.003, parent=None):
    return part(name, k.box(*dim, material, bevel, seg=1), xyz, parent)

def plate(name, outline, depth, material, z, parent=None, holes=(), bevel=.002):
    return part(name, k.panel(outline, depth, material, holes, bevel, name=name), (0,0,z), parent)

def cylinder(name, xyz, radius, height, material, parent=None, upright=False, segments=16, taper=None):
    return part(name, k.cyl(radius,height,material,seg=segments,r2=taper), xyz, parent, k.Yr if upright else (0,0,0))

def pivot(name, xyz, parent=None):
    return k.obj(name, None, parent or k.ROOT, xyz)

def star(x,y,r):
    return [(x+math.cos(i*math.pi/8)*r*(.73 if i%2 else 1),
             y+math.sin(i*math.pi/8)*r*(.73 if i%2 else 1)) for i in range(16)]

def arc(radius, start, end, steps):
    return [(CX+math.cos(a)*radius,CENTER_Y+math.sin(a)*radius)
            for a in (start+(end-start)*i/steps for i in range(steps+1))]

def opening(grow, bottom):
    return [(CX-HALF-grow,bottom),*arc(RADIUS+grow,math.pi+TURN,-TURN,56),
            (CX+HALF+grow,bottom)]

frame = pivot('Gate_fixed', (0,0,0))
plate('Plaster surround', k.rect(CX-1.35,.02,CX+1.35,3), .05, plaster, .025,
      frame, [opening(0,.06)], .002)
# A shallow relief in the spandrels, clear of the existing sign, rosettes and columns.
for side in (-1,1):
    for row in range(9):
        y=.25+row*.265
        for offset in (.90,1.12):
            x=CX+side*(offset + (.07 if row%2 else 0))
            if y>2.17 or (offset<1 and y<1.25):
                continue
            outer=[(x-.075,y),(x,y+.105),(x+.075,y),(x,y-.105)]
            inner=[(x-.064,y),(x,y+.088),(x+.064,y),(x,y-.088)]
            plate('Sebka lozenge',outer,.005,plaster,.052,frame,[inner],.0005)
for i in range(33):
    a=math.pi+TURN-ANGLE*i/33-.003
    b=math.pi+TURN-ANGLE*(i+1)/33+.003
    plate('Cut arch voussoir',arc(RADIUS+.165,a,b,4)+arc(RADIUS+.015,b,a,4),
          .062,terra if i%2 else stone,.075,frame,bevel=.003)
plate('Arch brass fillet',arc(RADIUS+.20,math.pi+TURN,-TURN,56)+arc(RADIUS+.175,-TURN,math.pi+TURN,56),
      .072,brass,.063,frame,bevel=.002)
# Open U-sections continue around the arch without a crossbar in the aperture.
for title,outer,inner,depth,z,material in [
    ('Cedar jamb', .012,-.050,.296,-.158,wood),
    ('Planted stop',-.048,-.068,.022,-.075,wood),
    ('Rebate seal',-.054,-.062,.008,-.090,seal),
]:
    plate(title,opening(outer,FLOOR)+opening(inner,FLOOR)[::-1],depth,material,z,frame,bevel=.002)
block('Stone sill',(CX,FLOOR+.017,-.04),(1.5,.05,.62),stone,.011,frame)
block('Weather bar',(CX,.162,-.14),(1.18,.012,.05),brass,.003,frame)
for side in (-1,1):
    x=CX+side*OPEN_HALF
    for y in HINGES:
        for dy in (-.042,.042):
            cylinder('Fixed hinge knuckle',(x,BASE+y+dy,AXIS_Z),.015,.03,iron,frame,True)
            block('Jamb hinge lug',(x+side*.012,BASE+y+dy,AXIS_Z+.017),(.028,.025,.052),iron,.002,frame)
    x=CX+side*1.13
    cylinder('Sconce wall plate',(x,1.85,.062),.048,.014,brass,frame)
    block('Sconce arm',(x,1.85,.126),(.018,.018,.126),brass,.004,frame)
    cylinder('Sconce crown',(x,1.817,.19),.072,.057,brass,frame,True,8,.027)
    cylinder('Sconce base',(x,1.639,.19),.052,.022,brass,frame,True,8,.059)
    cylinder('Lamp glass',(x,1.722,.19),.061,.143,glass,frame,True,8,.049)
    for i in range(8):
        a=i*math.tau/8
        cylinder('Sconce glazing bar',(x+math.cos(a)*.053,1.72,.19+math.sin(a)*.053),
                 .0035,.15,brass,frame,True,6)

def top(x):
    return CENTER_Y-BASE+math.sqrt(max(0,LEAF_RADIUS**2-(OPEN_HALF-x)**2))

leaves, rings = [], []
for side, name in [(-1,'L'),(1,'R')]:
    d=-side
    leaf=pivot('Gate_leaf_'+name,(CX+side*OPEN_HALF,BASE,AXIS_Z))
    leaves.append(leaf)
    flip=lambda pts:[(d*x,y) for x,y in pts]
    outline=[(.006,.002),(LEAF_WIDTH,.002)]
    outline += [(x,top(x)) for x in (LEAF_WIDTH-(LEAF_WIDTH-.006)*i/36 for i in range(37))]
    # The holes in the joinery are occupied by full-depth panels. A stepped
    # moulding and raised field finish each face.
    lo, hi=.070,LEAF_WIDTH-.070
    panels=[k.rect(lo,.125,hi,.72),k.rect(lo,.83,hi,1.32),
            [(lo,1.43),(hi,1.43)]+[(x,top(x)-.077) for x in (hi-(hi-lo)*i/20 for i in range(21))]]
    plate('Stiles and rails',flip(outline),THICKNESS,paint,THICKNESS/2,leaf,
          [flip(panel) for panel in panels],.0028)
    for index, panel in enumerate(panels):
        plate('Fielded panel',flip(panel),.048,field,THICKNESS/2,leaf,bevel=.001)
        midpoint=Vector((sum(x for x,y in panel)/len(panel),sum(y for x,y in panel)/len(panel)))
        inset=[tuple(midpoint.lerp(Vector((x,y)),.88)) for x,y in panel]
        y=(.422,1.075,1.75)[index]
        for face in (-1,1):
            z=THICKNESS/2+face*.028
            plate('Raised field',flip(inset),.016,field,z,leaf,bevel=.005)
            plate('Eight-point inlay',star(d*(lo+hi)/2,y,.078 if index==1 else .094),
                  .003,cream,z+face*.009,leaf,bevel=.001)
            part('Rosette boss',k.sphere(.021,brass,12,6),(d*(lo+hi)/2,y,z+face*.011),
                 leaf,scale=(1,1,.5))
    for x in (.032,LEAF_WIDTH-.034):
        y=.065
        while y<top(x)-.05:
            part('Domed nail',k.sphere(.012,brass,10,6),(d*x,y,THICKNESS),leaf,scale=(1,1,.48))
            y+=.13
    for y in HINGES:
        for z in (-.004,THICKNESS+.004):
            outline_hinge=[(.007,-.019),(.247,-.014),(.27,-.024),(.301,0),(.27,.024),(.247,.014),(.007,.019)]
            plate('Forged strap',[(d*x,y+v) for x,v in outline_hinge],.008,iron,z,leaf,bevel=.0015)
            for x in (.061,.148,.24):
                cylinder('Strap bolt',(d*x,y,z+(.005 if z>0 else -.005)),.008,.006,brass,leaf,segments=8)
        cylinder('Turning hinge barrel',(0,y,0),.014,.05,iron,leaf,True)
        block('Hinge return',(d*.018,y,.037),(.036,.032,.068),iron,.002,leaf)
    for face,label in [(1,'front'),(-1,'back')]:
        x=d*(LEAF_WIDTH-.085)
        z=THICKNESS if face>0 else 0
        plate('Escutcheon',star(x,1.02,.055),.008,brass,z+face*.004,leaf)
        cylinder('Ring eye',(x,1.024,z+face*.013),.013,.022,brass,leaf,segments=12)
        pull=part('Gate_ring_'+name+'_'+label,k.torus(.043,.007,brass,32,8),
                  (x,1.024,z+face*.026),leaf)
        for vertex in pull.data.vertices:
            vertex.co.y-=.046
        rings.append(pull)
        block('Kick strip',(d*LEAF_WIDTH/2,.043,z+face*.003),(LEAF_WIDTH-.045,.072,.006),brass,.002,leaf)
    block('Bottom seal',(d*LEAF_WIDTH/2,.004,THICKNESS/2),(LEAF_WIDTH-.031,.012,.032),seal,.001,leaf)
    if side==1:
        block('Meeting stile trim',(-LEAF_WIDTH+.013,top(LEAF_WIDTH)/2,THICKNESS+.004),
              (.024,top(LEAF_WIDTH)-.035,.009),brass,.002,leaf)
        # The leading leaf opens into the hall. The overlap belongs behind
        # the trailing leaf so it can pull away from the seam without clipping.
        block('Meeting astragal',(-LEAF_WIDTH-.003,top(LEAF_WIDTH)/2,-.006),
              (.033,top(LEAF_WIDTH)-.035,.010),wood,.002,leaf)
        x=-LEAF_WIDTH+.052
        hole=k.circ(x,.875,.007,12)
        plate('Lock escutcheon',k.rr(x-.026,.80,x+.026,.927,.008,3),
              .008,brass,THICKNESS+.004,leaf,[hole],.001)
        block('Key slot',(x,.861,THICKNESS+.008),(.005,.019,.002),seal,.0005,leaf)
    else:
        for y in (.14,1.72):
            x=LEAF_WIDTH-.032
            block('Flush bolt housing',(x,y,-.005),(.021,.15,.010),brass,.002,leaf)
            block('Flush bolt slide',(x,y,-.012),(.007,.082,.008),iron,.001,leaf)
            block('Flush bolt thumb',(x,y+.025,-.017),(.012,.017,.007),brass,.001,leaf)

def merge_parts(group, name, exclude=()):
    parts=[o for o in group.children if o.type=='MESH' and o not in exclude]
    bpy.ops.object.select_all(action='DESELECT')
    for item in parts:
        item.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    mesh=bpy.context.object
    mesh.name=name
    return mesh

lamp_parts=[o for o in frame.children if o.data.materials[0]==glass]
fixed=merge_parts(frame,'Fixed baked joinery',lamp_parts)
leaf_meshes=[merge_parts(o,'Baked leaf '+o.name,rings) for o in leaves]

def area(name, page_xyz, aim, power, size, tint):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.shape='DISK'
    data.size=size
    data.color=tint
    o=k.obj(name,data,k.ROOT,page_xyz)
    o.rotation_euler=(Vector(aim)-Vector(page_xyz)).to_track_quat('-Z','Y').to_euler()
    return o

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=32
scene.cycles.max_bounces=4
scene.cycles.use_denoising=False
scene.world=bpy.data.worlds.new('Soft neutral sky')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.74,.80,.90,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.56
area('Soft daylight',(CX-2,4,3),(CX,1.4,0),270,4,(1,.89,.76))
area('Interior bounce',(CX+.7,2.3,-2),(CX,1.2,0),100,3,(1,.77,.55))

# Save editable geometry and material nodes before atlas consolidation.
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
out=Path(args[0]) if args else HERE.parent/'gate-raw.glb'
size=int(args[1]) if len(args)>1 else 1280
scene.render.bake.margin=8
scene.render.bake.margin_type='EXTEND'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'gate.blend'))

def bake(label, objects, atlas_size):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.hide_render=False
        o.select_set(True)
        o.data.uv_layers.new(name='Bake')
        o.data.uv_layers.active=o.data.uv_layers['Bake']
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(58),island_margin=.006,area_weight=.2)
    bpy.ops.object.mode_set(mode='OBJECT')
    img=bpy.data.images.new(label,atlas_size,atlas_size,alpha=False)
    materials={m for o in objects for m in o.data.materials}
    targets={}
    for m in materials:
        nodes=m.node_tree.nodes
        node=nodes.new('ShaderNodeTexImage')
        node.image=img
        nodes.active=node
        targets[m]=node
    bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT','COLOR'},margin=7,use_clear=True)
    img.pack()
    replacements={}
    for m in materials:
        m.node_tree.nodes.remove(targets[m])
        metal=.42 if m==brass else .25 if m==iron else 0
        # All opaque materials in an atlas share a shader except hardware,
        # which gets its reflectance back after the diffuse bake.
        if metal not in replacements:
            baked=k.mat(f'{label}_{metal:g}','#ffffff',.63 if not metal else .48,metal)
            nodes=baked.node_tree.nodes
            tex=nodes.new('ShaderNodeTexImage')
            tex.image=img
            baked.node_tree.links.new(tex.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
            replacements[metal]=baked
    for o in objects:
        for slot in o.material_slots:
            old=slot.material
            slot.material=replacements[.42 if old==brass else .25 if old==iron else 0]
        for layer in list(o.data.uv_layers):
            if layer.name!='Bake':
                o.data.uv_layers.remove(layer)
    print('Baked',label,atlas_size,flush=True)

sets=[('Fixed', [fixed], size)]+[
    (f'Leaf_{i}',[leaf]+[ring for ring in rings if ring.parent==leaves[i]],min(1024,size))
    for i,leaf in enumerate(leaf_meshes)
]
for label,group,atlas_size in sets:
    # A separate bake per leaf excludes the frame, neighbour and lamp meshes.
    for item in bpy.data.objects:
        if item.type=='MESH':
            item.hide_render=item not in group
    bake(label,group,atlas_size)

for item in bpy.data.objects:
    if item.type=='MESH':
        item.hide_render=False
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,
                          export_lights=False,export_cameras=False,export_extras=True,
                          export_animations=False)
