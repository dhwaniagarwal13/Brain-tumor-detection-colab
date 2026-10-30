"""Export the Flask page as a static site (site/) for hosts that cannot run TensorFlow, e.g. Vercel."""
import re
import shutil
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE.parent / "site"

html = (BASE / "templates" / "index.html").read_text(encoding="utf-8")
html = re.sub(r"\{\{\s*url_for\('static',\s*filename='([^']+)'\)\s*\}\}", r"static/\1", html)

if OUT.exists():
    shutil.rmtree(OUT)
shutil.copytree(BASE / "static", OUT / "static")
(OUT / "index.html").write_text(html, encoding="utf-8")
print(f"Wrote {OUT}")
