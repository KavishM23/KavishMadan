"""Encode Cycles lightmaps as WebP and make a half-resolution phone tier."""
from pathlib import Path
from PIL import Image

out = Path(__file__).resolve().parent.parent / "workshop"
for source in sorted(out.glob("light-*.png")):
    image = Image.open(source).convert("RGB")
    target = source.with_suffix(".webp")
    image.save(target, "WEBP", quality=87, method=6)
    mobile = image.resize((image.width // 2, image.height // 2), Image.Resampling.LANCZOS)
    mobile.save(target.with_name(target.stem + "-mobile.webp"), "WEBP", quality=82, method=6)
    source.unlink()
    print(target.name, target.stat().st_size, "bytes")
