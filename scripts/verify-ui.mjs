// Layout/a11y probe across screens x widths x themes. Usage: PORT=41000 node scripts/verify-ui.mjs
import { createRequire } from 'node:module';
const require = createRequire('/usr/local/lib/node_modules/');
const { chromium } = require('playwright');

const port = process.env.PORT;
const routes = ['overview', 'scorecard', 'health', 'replenishment', 'forecast', 'plan'];
const sizes = [{ w: 1440, h: 900 }, { w: 390, h: 844 }];
const themes = ['light', 'dark'];

function lum(rgb) {
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const browser = await chromium.launch();
const out = [];
for (const theme of themes) for (const s of sizes) for (const r of routes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, colorScheme: theme });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/#/${r}`);
  await page.waitForSelector('h1', { timeout: 20000 });
  await page.waitForTimeout(r === 'forecast' || r === 'health' ? 2500 : 1200);
  const res = await page.evaluate(() => {
    const de = document.documentElement;
    const small = [...document.querySelectorAll('button, input, select, a, summary, [role=radio]')].filter((e) => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && b.height < 32 && !e.closest('.sr-only') && !e.classList.contains('sr-only') && !(e.closest('[role=row]') && e.tagName === 'BUTTON');
    }).map((e) => `${e.tagName}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24)}:${Math.round(e.getBoundingClientRect().height)}`);
    const bg = getComputedStyle(document.body).backgroundColor;
    const fg = getComputedStyle(document.body).color;
    const muted = [...document.querySelectorAll('.text-muted, .text-faint')].slice(0, 40).map((e) => ({ c: getComputedStyle(e).color, bg: getComputedStyle(e.closest('.card') || document.body).backgroundColor }));
    return { theme: document.documentElement.dataset.activeTheme, overflow: de.scrollWidth - de.clientWidth, h1: document.querySelector('h1')?.textContent, small, bg, fg, muted };
  });
  const parse = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  let worst = 99;
  for (const m of res.muted) {
    const a = lum(parse(m.c)); const b = lum(parse(m.bg.startsWith('rgba(0, 0, 0, 0)') ? res.bg : m.bg));
    worst = Math.min(worst, (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
  }
  out.push({ theme, w: s.w, route: r, overflowPx: res.overflow, smallTargets: res.small.length, smallSample: res.small.slice(0, 3), minMutedContrast: Number(worst.toFixed(2)), consoleErrors: errors.length });
  await ctx.close();
}
await browser.close();
console.table(out);
const bad = out.filter((o) => o.overflowPx > 0 || o.consoleErrors > 0 || o.minMutedContrast < 4.5);
console.log(bad.length ? 'ISSUES: ' + JSON.stringify(bad, null, 1) : 'ALL PASS');
