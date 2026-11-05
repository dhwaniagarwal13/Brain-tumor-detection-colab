"""Build the multi-page NeuroScan site.

Source fragments live in site_src/pages/<slug>.html (just the <main> content).
This script wraps each one with the shared <head>, header and footer and writes
the result to site/<slug>.html. Static assets (CSS/JS/metrics.json) live in site/static.

Run:  python site_src/build.py
"""
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / "site"

# slug, nav label (None = not in main nav), <title>, meta description
PAGES = [
    ("index", None, "NeuroScan: brain tumor MRI classification, explained",
     "A student research project that sorts brain MRI slices into glioma, meningioma, pituitary macroadenoma or healthy, with a plain-language guide to tumors, MRI and the AI behind it."),
    ("tumors", "Tumor types", "Brain tumor types guide: glioma, meningioma, pituitary macroadenoma",
     "What glioma, meningioma and pituitary macroadenoma are, how they look on MRI, common symptoms, how they are diagnosed and the main treatment options."),
    ("mri", "MRI basics", "How to read a brain MRI: sequences, planes and contrast",
     "T1, T2, FLAIR and contrast-enhanced MRI explained, with an interactive synthetic slice you can switch between sequences."),
    ("technology", "How the AI works", "How the NeuroScan classifier works",
     "Convolutional networks, transfer learning, softmax confidence and the two models behind NeuroScan, explained step by step."),
    ("results", "Results", "NeuroScan results: accuracy, confusion matrix and what went wrong",
     "Measured test accuracy, per-class performance, the confusion matrix, and an honest account of why validation scores overstated the model."),
    ("data", "Data", "The NeuroScan dataset: sources, splits and limits",
     "1,137 labelled brain MRI images across four classes: how they were split, augmented and what the data cannot tell us."),
    ("faq", "FAQ", "Brain tumor MRI and AI: questions and glossary",
     "Plain answers about brain tumors, MRI scans, AI diagnosis, accuracy and privacy, plus a glossary of imaging terms."),
    ("resources", "Resources", "About NeuroScan and where to learn more",
     "About this project, how to run it yourself, how to cite it, and trusted organizations for brain tumor information and support."),
    ("demo", None, "Try the classifier: upload a brain MRI",
     "Upload a brain MRI slice to the local NeuroScan server and see a four-class prediction with per-class probabilities."),
]

NAV = [(s, label) for s, label, *_ in PAGES if label]

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0c1315">
<link rel="icon" href="static/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="static/style.css">
</head>
<body class="page-{slug}">
<a class="skip" href="#main">Skip to content</a>
"""

HEADER = """<header class="bar">
  <div class="bar-in">
    <a class="brand" href="index.html" aria-label="NeuroScan home">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 17c3-1 4-5 7-5s3 4 6 4 4-5 9-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="21" cy="21" r="3" fill="var(--amber)"/></svg>
      <span>NeuroScan</span>
    </a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" aria-label="Main">
{links}
      <a class="try" href="demo.html">Try the classifier</a>
    </nav>
  </div>
</header>
"""

FOOTER = """
<footer class="foot">
  <div class="foot-in">
    <div class="foot-about">
      <p class="foot-brand">NeuroScan</p>
      <p>A student research project on classifying brain MRI slices. It is not a medical device and cannot diagnose, treat or rule out any condition. Anyone worried about symptoms or a scan should talk to a doctor.</p>
    </div>
    <div>
      <p class="foot-head">Learn</p>
      <ul>
        <li><a href="tumors.html">Tumor types</a></li>
        <li><a href="mri.html">MRI basics</a></li>
        <li><a href="faq.html">FAQ and glossary</a></li>
      </ul>
    </div>
    <div>
      <p class="foot-head">The project</p>
      <ul>
        <li><a href="technology.html">How the AI works</a></li>
        <li><a href="results.html">Results</a></li>
        <li><a href="data.html">Data</a></li>
        <li><a href="resources.html">Resources and about</a></li>
      </ul>
    </div>
  </div>
  <p class="foot-legal">Built with TensorFlow, Keras and Flask. Dataset: Jamil and Khan (2025), Mendeley Data, doi:10.17632/82mtzd8x72.2, CC BY 4.0. Images on this site labelled synthetic are generated in your browser and are not patient scans.</p>
</footer>
<script src="static/common.js"></script>
{extra}</body>
</html>
"""

EXTRA_SCRIPTS = {
    "index": ["viewer.js", "app.js"],
    "mri": ["viewer.js"],
    "technology": ["learn.js"],
    "results": ["app.js"],
    "demo": ["app.js"],
}


def build():
    (OUT / "static").mkdir(parents=True, exist_ok=True)
    for slug, _label, title, desc in PAGES:
        frag = (SRC / "pages" / f"{slug}.html").read_text(encoding="utf-8")
        links = "\n".join(
            f'      <a href="{s}.html"{" aria-current=\"page\"" if s == slug else ""}>{label}</a>'
            for s, label in NAV
        )
        extra = "".join(f'<script src="static/{f}"></script>\n' for f in EXTRA_SCRIPTS.get(slug, []))
        html = (
            HEAD.format(title=title, desc=desc, slug=slug)
            + HEADER.format(links=links)
            + '<main id="main">\n' + frag + "\n</main>"
            + FOOTER.format(extra=extra)
        )
        (OUT / f"{slug}.html").write_text(html, encoding="utf-8")
        print("wrote", f"{slug}.html")
    err = SRC / "pages" / "404.html"
    if err.exists():
        html = (
            HEAD.format(title="Page not found | NeuroScan", desc="This page does not exist.", slug="404")
            + HEADER.format(links="\n".join(f'      <a href="{s}.html">{l}</a>' for s, l in NAV))
            + '<main id="main">\n' + err.read_text(encoding="utf-8") + "\n</main>"
            + FOOTER.format(extra="")
        )
        (OUT / "404.html").write_text(html, encoding="utf-8")
        print("wrote 404.html")


if __name__ == "__main__":
    build()
