import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const logs = [];
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => logs.push(`[PAGEERROR] ${err.message}`));

await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 60000 });

const vals = [];
for (let i = 0; i < 14; i++) {
  const v = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('.tabular'));
    return spans.slice(0, 6).map((s) => s.textContent);
  });
  vals.push(`t=${i * 500}ms: ${JSON.stringify(v)}`);
  await page.waitForTimeout(500);
}

await page.screenshot({ path: 'scripts/counter-check.png', fullPage: false });

console.log('OBSERVATIONS:');
vals.forEach((v) => console.log(v));
console.log('\nCONSOLE LOGS:');
logs.forEach((l) => console.log(l));

await browser.close();
