#!/usr/bin/env python3
"""Make the self-hosted font subsets in packages/tokens/fonts/ (brief §8.5, AD §8.5).

Run by hand when a font or the character set changes; the woff2 output is committed, so CI and
the apps never need Python or a font CDN.

    python3 -m venv .venv && .venv/bin/pip install fonttools==4.60.1 brotli==1.1.0
    .venv/bin/python -I packages/tokens/scripts/subset-fonts.py <InterVariable.ttf> <Bricolage.ttf>

Sources (SIL Open Font License 1.1, licences copied next to the output):
  Inter 4.1         https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip  (InterVariable.ttf)
  Bricolage Grotesque  https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fonts")

# Latin + Latin-1, general punctuation, the naira sign and the few symbols the copy uses.
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2000-206F,U+20A6,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"
)
# tnum: money and references use tabular figures (F-Type). case: capitals-aware punctuation.
FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "case"]


def build(src: str, limits: dict, out_name: str) -> None:
    # Subset the full variable font first, then pin or narrow the axes. (Instancing first leaves
    # gvar without entries for some glyphs and the subsetter fails.)
    font = TTFont(src)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.name_IDs = ["*"]  # keep copyright and licence names
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    font = instancer.instantiateVariableFont(font, limits)
    path = os.path.join(OUT, out_name)
    subset.save_font(font, path, options)
    print(f"{out_name}: {os.path.getsize(path)} bytes")


def main() -> None:
    inter, bricolage = sys.argv[1], sys.argv[2]
    os.makedirs(OUT, exist_ok=True)
    # Inter: weights 400-700 stay variable; optical size fixed at text size (14).
    build(inter, {"wght": (400, 700), "opsz": 14}, "inter-latin-400-700.woff2")
    # Bricolage Grotesque: display only, 700-800, normal width; optical size fixed at 32
    # (headings run 22-56 px).
    build(bricolage, {"wght": (700, 800), "wdth": 100, "opsz": 32}, "bricolage-latin-700-800.woff2")


if __name__ == "__main__":
    main()
