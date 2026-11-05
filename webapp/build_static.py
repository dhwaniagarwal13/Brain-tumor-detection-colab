"""Retired. The hosted site (site/) is now a multi-page site built from site_src/.

This script used to copy the single-page Flask app into site/, deleting everything there first.
Use `python site_src/build.py` instead. To refresh only the metrics shown on the site after running
webapp/evaluate.py, copy webapp/static/metrics.json to site/static/metrics.json.
"""
import sys

sys.exit("build_static.py is retired. Run: python site_src/build.py")
