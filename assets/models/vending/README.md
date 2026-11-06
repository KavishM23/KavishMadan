# Project machine models

Four GLBs for the Builds page vending machine, at real size in metres, optimised with meshopt and WebP.

| Model | File | Triangles* | Source |
|---|---|---|---|
| Project Strata | `strata.glb` | 153,640 | CAD and photographs |
| Quadcopter | `quadcopter.glb` | 31,792 | Representative |
| Kessler | `kessler.glb` | 48,422 | Project facts, hand-built |
| Dragonfly wing | `wing.glb` | 44,984 | Team slides, concept |

*Rendered total, with the tyre and rim shared four times on Strata.

## What is real and what is inferred

**Strata.** Hand-modelled around original CAD. It is not a 3D scan.
- From CAD: every rib outline, sliced at 22 stations from the Fusion body in `4x4CAR223e2.f3d`, plus the tyre (`Tire1.stl`, reduced to 8% of its triangles) and the rim (`RimV2.stl`). Body width 14.5 cm, length 34 cm.
- From the deck: 22 slots, the 30 mm height cut, base plate outline and side tabs.
- Inferred from photographs: chassis layout, links, coilovers, axles, gearbox, electronics, wiring, side frame sizes, grille bar count, rib legs, wheel discs, and the Strata mark, which is a simplified redraw. Wheelbase, track and ride height are estimates that keep the car under the 200 mm limit.

**Quadcopter.** There is no CAD or photo of the real prototypes in the project files, so this is a representative Arduino quadcopter. Its sensors, layout and proportions are illustrative, and the plaque says so.

**Kessler.** A desk sculpture. The 450, 550 and 850 km shells come from the model, but their heights are spread out and the plaque says they are not to scale. Fragment orbits all pass through the impact point. Satellite and debris counts are illustrative, not simulation output.

**Wing.** A concept reconstruction from the YYGS slides: NACA 0009 section, with ridges along the leading edge and mid-chord. Ridge count and height, chord, span and taper are estimates. The stand is invented for display. Its quadrant marks the slides' -2 to 18 degree sweep.

## Rebuilding

Tools: Blender 4.2 LTS, Python with numpy, shapely, scipy, Pillow and zstandard, and `@gltf-transform/cli` 4.

1. Decompress the `.f3d` (a zip using zstd) and run `fusion_decode.py` on `OGS.BlobFolder/OGS/DefaultScene/Fusion_mesh_000`. `strata_body.npz` is the result for the body.
2. `python strata_sections.py strata_body.npz strata_parts.json`
3. `python earth_textures.py land.json earth`, where `land.json` is `land-50m` from the `world-atlas` package.
4. `blender -b --python strata.py -- strata_parts.json out/strata final`. The other three scripts work the same way. `Tire1.stl` is too large to keep here, so pass its path as the fifth argument.
5. `gltf-transform optimize out/strata_raw.glb strata.glb --compress meshopt --texture-compress webp --texture-size 1536 --simplify false --instance false --join false --flatten false --palette false`

`src/blend/` holds packed Blender files of each finished model, with baked ambient occlusion.

## Page behaviour

`builds-lab-layout.js` holds the cabinet dimensions and the dispense path as plain numbers. `tests/builds-lab.test.cjs` walks that path and fails if a product would pass through the glass, a shelf lip, the ramp or the hatch edge. The check uses each model's bounding box, not its exact shape.
