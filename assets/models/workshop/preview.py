"""Serve only the site's public assets for a local Workshop preview."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit
import os

ROOT = Path(__file__).resolve().parents[3]
PORT = int(os.environ.get("WORKSHOP_PORT", "8765"))
PUBLIC = {".html", ".js", ".css", ".ico", ".svg", ".png", ".jpg",
          ".jpeg", ".webp", ".gif", ".glb", ".gltf", ".bin", ".woff2"}


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        raw = unquote(urlsplit(path).path).lstrip("/") or "index.html"
        rel = PurePosixPath(raw)
        if (".." in rel.parts or any(part.startswith(".") for part in rel.parts)
                or Path(raw).suffix.lower() not in PUBLIC):
            return str(ROOT / "__not_found__")
        dest = (ROOT / raw).resolve()
        if not dest.is_relative_to(ROOT):
            return str(ROOT / "__not_found__")
        return str(dest)


print(f"Workshop preview: http://127.0.0.1:{PORT}/#home", flush=True)
ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
