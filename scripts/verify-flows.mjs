// Interaction probe on the built app. Usage: PORT=41000 node scripts/verify-flows.mjs
import { createRequire } from 'node:module';
const require = createRequire('/usr/local/lib/node_modules/');
const { chromium } = require('playwright');
const base = `http://127.0.0.1:${process.env.PORT}`;
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/#/forecast`);
await page.waitForSelector('text=11-month forecast (maximum for 36 months of history)');
await page.waitForSelector('text=5,960 materials');
ok('long view label exact', true);

const radios = await page.$$eval('[role=radiogroup][aria-label="Forecast horizon"] [role=radio]', (e) => e.map((x) => x.textContent.trim()));
ok('horizon options are 3, 6, 11 only', JSON.stringify(radios) === JSON.stringify(['3 months', '6 months', '11 months (max)']), radios.join('|'));

await page.click('[role=radio]:has-text("3 months")');
await page.waitForSelector('h2:has-text("3-month forecast")');
const sub3 = await page.textContent('section[aria-label="3-month forecast"] header p');
ok('3-month view covers Jan to Mar 2026', /Jan 2026 to Mar 2026 · 3 months/.test(sub3), sub3);
const rows3 = await page.textContent('text=/materials · total over 3 months/');
ok('3-month table header', /total over 3 months/.test(rows3));

await page.click('[role=radio]:has-text("6 months")');
await page.waitForSelector('h2:has-text("6-month forecast")');
const sub6 = await page.textContent('section[aria-label="6-month forecast"] header p');
ok('6-month view covers Jan to Jun 2026', /Jan 2026 to Jun 2026 · 6 months/.test(sub6), sub6);

// material type filter -> URL + count
await page.selectOption('#f-type', 'ZSPN');
await page.waitForTimeout(600);
ok('type filter is in the URL', new URL(page.url()).searchParams.get('type') === 'ZSPN', page.url());
const znTxt = await page.textContent('text=/materials · total over 6 months/');
const zn = Number(znTxt.match(/([\d,]+) materials/)[1].replace(/,/g, ''));
await page.selectOption('#f-type', 'ZSPR');
await page.waitForTimeout(600);
const zrTxt = await page.textContent('text=/materials · total over 6 months/');
const zr = Number(zrTxt.match(/([\d,]+) materials/)[1].replace(/,/g, ''));
ok('ZSPN + ZSPR material counts add to 5,960', zn + zr === 5960, `${zn}+${zr}`);

// empty filter
await page.selectOption('#f-type', '');
await page.selectOption('#f-plant', 'HZL_DEMO_03');
await page.waitForSelector('text=No forecast for HZL_DEMO_03');
ok('uncovered plant shows empty state', true);
await page.selectOption('#f-plant', 'ALL_PLANTS');

// shared URL restores state
await page.goto(`${base}/?plant=HZL_DEMO_01&type=ZSPN#/forecast`);
await page.waitForSelector('text=materials · total over');
ok('URL restores filters', (await page.inputValue('#f-type')) === 'ZSPN' && (await page.inputValue('#f-plant')) === 'HZL_DEMO_01');

// keyboard: tab reaches the theme toggle and shows a focus ring
await page.goto(`${base}/#/overview`);
await page.waitForSelector('h1');
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
const focus = await page.evaluate(() => {
  const e = document.activeElement;
  return { tag: e.tagName, text: (e.textContent || '').trim().slice(0, 20), shadow: getComputedStyle(e).boxShadow };
});
ok('focus is visible on keyboard focus', focus.shadow !== 'none', JSON.stringify(focus));

// theme toggle flips attribute
await page.click('button[aria-label^="Switch to"]');
const attr = await page.getAttribute('html', 'data-theme');
ok('theme toggle sets data-theme', attr === 'dark' || attr === 'light', String(attr));

// overview All plants KPI equals the source ALL_PLANTS row
await page.goto(`${base}/#/overview`);
await page.waitForSelector('text=Gross inventory value');
const tile = await page.textContent('article[aria-label="Gross inventory value"] p.text-2xl');
ok('All plants gross value tile shows source ₹512.52 Cr', tile.trim() === '₹512.52 Cr', tile);

await page.goto(`${base}/?plant=HZL_DEMO_01#/overview`);
await page.waitForSelector('text=Gross inventory value');
const tile1 = await page.textContent('article[aria-label="Gross inventory value"] p.text-2xl');
ok('HZL_DEMO_01 gross value differs from All plants', tile1.trim() !== tile.trim(), tile1);

ok('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
console.table(results);
console.log(results.every((r) => r.pass) ? 'ALL FLOWS PASS' : 'FLOW FAILURES');
await browser.close();
