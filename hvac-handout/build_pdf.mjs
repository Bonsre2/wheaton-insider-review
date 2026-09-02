import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = 'file://' + path.join(__dirname, 'handout.html');
const outPath = path.join(__dirname, 'Bons-Realty-HVAC-Mini-Split-Handout.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(htmlPath, { waitUntil: 'networkidle' });
await page.pdf({
  path: outPath,
  width: '8.5in',
  height: '11in',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  pageRanges: '1',
});
await browser.close();
console.log('PDF written:', outPath);
