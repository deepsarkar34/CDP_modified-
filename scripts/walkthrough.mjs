// Click through every beat in every vendor mode; fail on console errors; save screenshots.
// Usage: npm run build && npm run walkthrough   (expects `npm run preview` on :4173, or pass a URL)
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
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(url);
const total = await page.evaluate(() => document.querySelectorAll('.step').length);
if (total !== 9) errors.push(`expected 9 steps on the map, found ${total}`);

for (const vendor of ['neutral', 'salesforce', 'adobe', 'databricks']) {
  await page.keyboard.press('r');
  // select vendor via its button (labels come from the vendor pack)
  const idx = ['neutral', 'salesforce', 'adobe', 'databricks'].indexOf(vendor);
  await page.locator('.seg button').nth(idx).click();
  let beat = 0;
  while (true) {
    await page.waitForTimeout(vendor === 'neutral' ? 1400 : 500);
    // Let the Decide sublayers finish playing (5 x 1.4 s) before the screenshot.
    if (await page.locator('.pipe').count() && !(await page.locator('.decide-table tr.chosen').count())) await page.waitForTimeout(7200);
    if (vendor === 'neutral' || beat % 4 === 0) await page.screenshot({ path: `${out}/${vendor}-${String(beat).padStart(2, '0')}.png` });
    const disabled = await page.locator('.foot .btn.primary').isDisabled();
    if (disabled) break;
    await page.keyboard.press('ArrowRight');
    beat++;
  }
  console.log(`${vendor}: ${beat + 1} beats`);
}

// Decide in both modes: check the outcomes from the brief
const text = sel => page.locator(sel).first().innerText();
const expect = (cond, msg) => { if (!cond) errors.push(msg); };
await page.keyboard.press('r'); await page.keyboard.press('7');
await page.waitForTimeout(7800);
expect((await text('.decide-table tr.chosen')).includes('Rep remote call'), 'ML: remote call should be chosen');
const capML = await page.locator('.cap-table tbody tr').allInnerTexts();
expect(capML[0].includes('Dr. Brown') && capML[0].includes('#1'), 'ML: Dr. Brown should be #1');
expect(capML.at(-1).includes('Dr. Patel') && capML.at(-1).includes('#8'), 'ML: Dr. Patel should be #8 and roll over');
await page.screenshot({ path: `${out}/decide-ml.png` });
await page.keyboard.press('m'); await page.waitForTimeout(3600);
expect((await text('.decide-table tr.chosen')).includes('Webinar invite email'), 'Rules: webinar should be chosen');
expect((await page.locator('.sl.off').count()) === 3, 'Rules: 3 sublayers crossed out on the map');
const capR = await page.locator('.cap-table tbody tr').allInnerTexts();
expect(capR[0].includes('Dr. Patel') && capR[6].includes('Rolls to next week') && capR[7].includes('Dr. Brown') && capR[7].includes('#7'), 'Rules: Patel #1, Brown #7 after the divider');
await page.screenshot({ path: `${out}/decide-rules.png` });
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(800);
expect((await page.locator('.stage').innerText()).includes('Webinar invite email to Dr. John Brown.'), 'Rules output card');
expect((await page.locator('.stage').innerText()).includes('No sequence'), 'Rules: no-sequence line');
await page.screenshot({ path: `${out}/decide-rules-output.png` });
await page.keyboard.press('m'); await page.waitForTimeout(800);
expect((await page.locator('.stage').innerText()).includes('Remote call with Dr. John Brown within 5 days.'), 'ML output card');
expect((await page.locator('.stage').innerText()).includes('Pause email for the month'), 'ML: next best experience');
await page.screenshot({ path: `${out}/decide-ml-output.png` });
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
expect((await page.locator('.stage').innerText()).includes('remote call within 5 days'), 'Activate rep card matches decision');
await page.keyboard.press('9'); await page.waitForTimeout(600);
await page.locator('[role=radio]', { hasText: 'No response' }).click(); await page.waitForTimeout(500);
expect((await page.locator('.stage').innerText()).includes('+19 to +11'), 'Learn: no-response outcome');
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(700);
expect((await page.locator('.stage').innerText()).includes('124'), 'Learn: holdout 124');
await page.screenshot({ path: `${out}/learn.png` });

// Narrow screen and reduced motion
const narrow = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
narrow.on('pageerror', e => errors.push(`pageerror (narrow): ${e.message}`));
await narrow.goto(url); await narrow.bringToFront(); await narrow.waitForTimeout(600); await narrow.keyboard.press('7'); await narrow.waitForTimeout(600);
expect(await narrow.locator('.decide-table tr.chosen').count() === 1, 'Reduced motion: finished state shown at once');
const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
expect(overflow <= 1, `Narrow: page scrolls sideways by ${overflow}px`);
await narrow.screenshot({ path: `${out}/decide-narrow.png`, fullPage: true });
await narrow.close(); await page.bringToFront();

// Deep dive + consent off on Activate
await page.keyboard.press('8'); await page.keyboard.press('d'); await page.keyboard.press('c');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/deep-consent-off.png`, fullPage: true });

await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Walkthrough OK, no console errors.');
