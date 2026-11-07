"""Re-export fixed detail from the packed .blend without repeating the bake."""
from pathlib import Path
import bpy

root = Path(__file__).resolve().parent.parent
out = root / "workshop"
bpy.ops.wm.open_mainfile(filepath=str(root / "workshop.blend"))
details = [o for o in bpy.data.objects if o.type == "MESH" and o.get("detail")]
small = ("peg hook", "bench bolt", "drawer pull mount", "vise mounting bolt", "wing drawing clip", "floor expansion joint")
for tier in ("detail", "detail-mobile"):
    bpy.ops.object.select_all(action="DESELECT")
    selected = [o for o in details if tier == "detail" or not o.name.startswith(small)]
    for o in selected: o.select_set(True)
    bpy.context.view_layer.objects.active = selected[0]
    bpy.ops.export_scene.gltf(filepath=str(out / f"{tier}-raw.glb"), export_format="GLB", use_selection=True,
                              export_apply=False, export_yup=True, export_materials="EXPORT", export_cameras=False,
                              export_lights=False, export_animations=False)
