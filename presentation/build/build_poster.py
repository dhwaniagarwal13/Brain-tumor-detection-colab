"""Render the poster (presentation/poster_src.html) to PDF and PNG with headless Chrome.

Run:  python presentation/build/build_poster.py
Needs Google Chrome installed (set CHROME to override the path).
"""
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # presentation/
CHROME = os.environ.get("CHROME", r"C:\Program Files\Google\Chrome\Application\chrome.exe")

history = json.loads((ROOT / "assets" / "history.json").read_text(encoding="utf-8"))["history"]
html = (ROOT / "poster_src.html").read_text(encoding="utf-8").replace(
    "/*HISTORY*/", json.dumps({"loss": history["loss"], "val_loss": history["val_loss"]}))
built = ROOT / "poster.html"                              # generated, git-ignored
built.write_text(html, encoding="utf-8")

url = built.as_uri()
base = [CHROME, "--headless=new", "--disable-gpu"]
subprocess.run(base + ["--no-pdf-header-footer", f"--print-to-pdf={ROOT / 'NeuroScan_Poster.pdf'}", url], check=True)
subprocess.run(base + ["--hide-scrollbars", "--window-size=2304,3456", f"--screenshot={ROOT / 'NeuroScan_Poster.png'}", url], check=True)
print("wrote NeuroScan_Poster.pdf and NeuroScan_Poster.png")
