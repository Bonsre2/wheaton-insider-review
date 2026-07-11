# Bons Realty — HVAC Mini-Split Handout

A one-page, print-ready listing-packet handout that explains a ductless
mini-split system as **one potential** heating-and-cooling upgrade option for a
home without existing ductwork. Designed to read like a builder's/architect's
brief — navy, white, and light gray, with subtle iconography and cautious,
educational language (it does not promise feasibility).

## Deliverables

| File | Purpose |
| --- | --- |
| `Bons-Realty-HVAC-Mini-Split-Handout.pdf` | Print-ready one-page PDF (US Letter) |
| `Bons-Realty-HVAC-Mini-Split-Handout.docx` | Editable Microsoft Word version |

## Source & build

- `handout.html` — the design source for the PDF (self-contained, inline CSS + original SVG artwork).
- `gen_qr.py` — generates the four manufacturer QR codes (PNG + SVG) with [segno](https://pypi.org/project/segno/).
- `gen_assets.mjs` — rasterizes the logo, icons, and illustrations from `handout.html` to PNGs for the Word file.
- `build_pdf.mjs` — renders `handout.html` to PDF via headless Chromium (Playwright).
- `build_docx.py` — builds the editable `.docx` with [python-docx](https://pypi.org/project/python-docx/).
- `assets/` — generated QR codes, icons, and illustrations.

### Rebuild

```bash
pip install segno python-docx
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers   # or install Chromium via `npx playwright install chromium`

python3 gen_qr.py           # QR codes
node gen_assets.mjs         # icons/illustrations -> PNG (needs Playwright)
node build_pdf.mjs          # -> Bons-Realty-HVAC-Mini-Split-Handout.pdf
python3 build_docx.py       # -> Bons-Realty-HVAC-Mini-Split-Handout.docx
```

## Notes

- **Artwork** (logo mark, benefit icons, condenser/wall-unit/system diagram) is
  original line art created for this handout — no third-party image licensing
  required. QR codes link to each manufacturer's official site.
- **Cost ranges** are general Chicago-area estimates for illustration only, with
  sources listed in the handout's reference section. They are not a quote.
- The handout carries the required disclaimer: Bons Realty and its agents are not
  licensed HVAC contractors; buyers should obtain an independent evaluation and
  written estimate from a qualified, licensed HVAC contractor.
