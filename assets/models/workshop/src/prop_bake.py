"""Import the interactive rest geometry for Cycles and export only the light at its vertices."""
import json
import os

import bpy
import numpy as np


def add_receivers(work):
    path = os.path.join(work, 'prop-geometry.json')
    if not os.path.exists(path):
        return
    for i, entry in enumerate(json.load(open(path))):
        name = f'prop_light_{i:03}'
        vertices = np.asarray(entry['verts']).reshape((-1, 3))
        faces = np.asarray(entry['indices']).reshape((-1, 3))
        me = bpy.data.meshes.new(name)
        me.from_pydata(vertices.tolist(), [], faces.tolist())
        for j, rgb in enumerate(entry['colors']):
            mat = bpy.data.materials.new(f'{name}_{j}')
            mat.use_nodes = True
            mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*rgb, 1)
            me.materials.append(mat)
        for start, count, material in entry['groups']:
            for poly in list(me.polygons)[start // 3:(start + count) // 3]:
                poly.material_index = material
        me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), dtype=np.bool_))
        me.normals_split_custom_set_from_vertices(np.asarray(entry['normals']).reshape((-1, 3)).tolist())
        color = me.color_attributes.new(name='Irradiance', type='FLOAT_COLOR', domain='POINT')
        me.color_attributes.active_color = color
        me.color_attributes.render_color_index = 0
        o = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(o)
        o['g'] = 'prop_lighting'
        o['signature'] = entry['signature']
        o['instance_vertices'] = entry['instanceVertices']
        if entry['moving'] or not entry['visible']:
            # Receivers retain their lighting, but their closed pose must not leave shadows on the set.
            o.visible_shadow = False
            o.visible_diffuse = False
            o.visible_glossy = False
        if not entry['visible']:
            o.visible_camera = False


def bake_receivers(work, theme):
    objects = sorted((o for o in bpy.data.objects if o.get('g') == 'prop_lighting'), key=lambda o: o.name)
    if not objects:
        return
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, target='VERTEX_COLORS')
    parts = []
    for o in objects:
        colors = o.data.color_attributes['Irradiance'].data
        rgba = np.empty(len(colors) * 4, dtype=np.float32)
        colors.foreach_get('color', rgba)
        rgb = rgba.reshape((-1, 4))[:, :3]
        if o['instance_vertices']:
            rgb = rgb.reshape((-1, o['instance_vertices'], 3)).mean(axis=1)
        parts.append(rgb)
    np.save(os.path.join(work, f'props-{theme}.npy'), np.concatenate(parts))
    if theme == 'day':
        with open(os.path.join(work, 'prop-receivers.json'), 'w') as file:
            json.dump([o['signature'] for o in objects], file)
    print('baked interactive props', theme, len(objects), flush=True)
