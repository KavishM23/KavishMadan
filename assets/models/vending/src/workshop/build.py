"""Build the machine and room, and save a .blend ready for baking.
blender -b --python build.py -- layout.json OUT prints.json strata_parts.json"""
import sys,os,json
sys.path.insert(0,os.path.dirname(__file__))
import kit
from kit import *
a=sys.argv[sys.argv.index('--')+1:];G=json.load(open(a[0]));OUT=a[1];RE=json.load(open(a[2]));parts=json.load(open(a[3]))
start()
import machine,room
machine.build(G);pend=room.build(G,RE,parts)
print('objects',len(bpy.data.objects),'tris',tris_of())
json.dump(pend,open(OUT+'_pend.json','w'))
join()
print('joined',len(bpy.data.objects),'tris',tris_of())
for o in bpy.data.objects:
    if o.type=='MESH':pass
bpy.ops.wm.save_as_mainfile(filepath=OUT+'.blend')
