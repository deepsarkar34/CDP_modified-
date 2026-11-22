// Click through every beat; check the Dr. Ortiz outcomes; fail on console errors; save screenshots.
// Usage: npm run build && npm run preview &  then  npm run walkthrough
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const out = 'artifacts';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const expect = (cond, msg) => { if (!cond) errors.push(msg); };
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
const stage = () => page.locator('.stage').innerText();

await page.goto(url); await page.waitForTimeout(700);
expect((await page.locator('.step').count()) === 10, 'expected 10 steps on the map');

// Every beat, start to end
let beat = 0;
while (true) {
  await page.waitForTimeout(1300);
  if (await page.locator('.pipe').count() && !(await page.locator('.decide-table tr.chosen').count())) await page.waitForTimeout(3600);
  await page.screenshot({ path: `${out}/beat-${String(beat).padStart(2, '0')}.png` });
  if (await page.locator('.foot .btn.primary').isDisabled()) break;
  await page.keyboard.press('ArrowRight'); beat++;
}
console.log(`${beat + 1} beats`);

// Story checks
await page.keyboard.press('r'); await page.waitForTimeout(1200);
expect((await stage()).includes('ORTIZ, LENA MD'), 'Hook shows Veeva fragment');
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1400);
expect((await stage()).includes('Lena Ortiz, MD'), 'Hook merges into Lena Ortiz, MD');

await page.keyboard.press('8'); await page.waitForTimeout(4200);
expect((await page.locator('.decide-table tr.chosen').innerText()).includes('Side effect guide email'), 'ML picks the side effect guide email');
expect((await page.locator('.decide-table tr.blocked').count()) === 2, 'Two options blocked');
await page.screenshot({ path: `${out}/decide-ml.png` });
await page.keyboard.press('m'); await page.waitForTimeout(2200);
expect((await page.locator('.decide-table tr.chosen').innerText()).includes('Nurse education webinar invite'), 'Rules only picks the webinar');
expect((await page.locator('.sl.off').count()) === 1, 'Rules only: pass 2 crossed out on the map');
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
expect((await stage()).includes('nothing plans the next touch'), 'Rules only output card');
await page.screenshot({ path: `${out}/decide-rules-output.png` });
await page.keyboard.press('m'); await page.waitForTimeout(900);
expect((await stage()).includes('Send the side effect guide email today'), 'ML output card');
expect((await stage()).includes('Pause email for 14 days'), 'ML next best experience');
await page.screenshot({ path: `${out}/decide-ml-output.png` });

await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1200);
expect((await stage()).includes('342 oncologists'), 'Activate Sankey');
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
expect((await stage()).includes('Managing immune related side effects'), 'Email follows the decision');

await page.keyboard.press('0'); await page.waitForTimeout(700);
await page.locator('[role=radio]', { hasText: 'No response' }).click(); await page.waitForTimeout(500);
expect((await stage()).includes('Nothing for 14 days'), 'Learn: no-response outcome');
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
const learn = await stage();
expect(learn.includes('34') && learn.includes('19 pts'), 'Learn: holdout 34, 19 points');

// Consent off: emails blocked, rep visit chosen
await page.keyboard.press('8'); await page.keyboard.press('c'); await page.waitForTimeout(4200);
expect((await page.locator('.decide-table tr.chosen').innerText()).includes('Rep visit'), 'Consent off: rep visit chosen');
await page.keyboard.press('c');

// Narrow screen and reduced motion
const narrow = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
narrow.on('pageerror', e => errors.push(`pageerror (narrow): ${e.message}`));
await narrow.goto(url); await narrow.bringToFront(); await narrow.waitForTimeout(700); await narrow.keyboard.press('8'); await narrow.waitForTimeout(700);
expect(await narrow.locator('.decide-table tr.chosen').count() === 1, 'Reduced motion: finished state at once');
const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
expect(overflow <= 1, `Narrow: page scrolls sideways by ${overflow}px`);
await narrow.screenshot({ path: `${out}/decide-narrow.png`, fullPage: true });
await narrow.close();

await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Walkthrough OK, no console errors.');
