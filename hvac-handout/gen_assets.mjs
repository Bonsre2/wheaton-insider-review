// Rasterize the logo, benefit icons, and illustrations from handout.html into
// crisp PNGs (assets/) so the editable Word document can reuse the same artwork.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node gen_assets.mjs
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const d = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 4 });
await p.goto('file://' + path.join(d, 'handout.html'), { waitUntil: 'networkidle' });

async function shot(sel, file, idx = 0) {
  const els = await p.$$(sel);
  if (!els[idx]) { console.log('MISS', sel, idx); return; }
  await els[idx].screenshot({ path: path.join(d, 'assets', file), omitBackground: true });
}

await shot('.brand .logomark', 'logo.png');
const icons = ['ic_noduct', 'ic_disrupt', 'ic_efficient', 'ic_quiet', 'ic_control', 'ic_ranch'];
for (let i = 0; i < 6; i++) await shot('.benefit .ic', icons[i] + '.png', i);
await shot('.figrow .figure', 'fig_condenser.png', 0);
await shot('.figrow .figure', 'fig_wallunit.png', 1);
await shot('.figure.sys', 'fig_diagram.png', 0);

await b.close();
console.log('assets done');
