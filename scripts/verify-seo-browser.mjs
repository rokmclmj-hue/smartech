import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:3100';
const label = process.argv[3] || 'local';
const verify = process.argv.includes('--verify');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await context.newPage();
const results = { base, checkedAt: new Date().toISOString(), pages: [], errors: [] };
page.on('pageerror', e => results.errors.push(e.message));
try {
  for (const path of ['/', '/products', '/products/A41821946', '/blog/96', '/blog/battery-manufacturing-dry-pump-pfpe-oil']) {
    const response = await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const html = await response.text();
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const data = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => { const v = JSON.parse(s.textContent); return v['@graph'] ?? [v]; });
      const main = document.querySelector('main');
      return {
        title: document.title,
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
        description: document.querySelector('meta[name="description"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        schemas: data.map(v => v['@type']),
        product: data.find(v => v['@type'] === 'Product'),
        article: data.find(v => v['@type'] === 'Article'),
        hero: (() => { const p = main?.querySelector('section p'); if (!p) return null; const s = getComputedStyle(p); return { opacity: s.opacity, animation: s.animationName, marginTop: s.marginTop, text: p.textContent }; })(),
        showcase: [...document.querySelectorAll('.showcase-photo img')].map(i => ({ src: i.currentSrc || i.src, sizes: i.sizes, loaded: i.complete && i.naturalWidth > 0, box: { width: i.clientWidth, height: i.clientHeight } })),
        images: document.querySelectorAll('article img').length,
      };
    });
    const entry = { path, status: response.status(), initialH1Count: (html.match(/<h1(?:\s|>)/g) ?? []).length, ...info };
    results.pages.push(entry);
    if (verify) {
      assert.equal(entry.status, 200, path);
      assert.equal(entry.h1.length, 1, path + ' one H1');
      assert.ok(entry.description, path + ' description');
      if (path === '/products') assert.equal(entry.initialH1Count, 1, 'catalog title in initial HTML');
      if (path === '/') {
        assert.equal(entry.hero.opacity, '1');
        assert.equal(entry.hero.animation, 'none');
        assert.equal(entry.hero.marginTop, '0px', 'preserve mobile intro spacing');
        assert.ok(entry.showcase.every(i => i.src.includes('/_next/image?')));
      }
      if (path.startsWith('/products/')) {
        assert.ok(entry.product);
        assert.equal(entry.product.offers.availability, undefined);
        assert.ok(!entry.schemas.includes('FAQPage'));
        const publicPrice = entry.product.offers.price.toLocaleString('ko-KR');
        assert.ok((await page.locator('main').innerText()).includes(publicPrice), 'schema price visible');
      }
    }
    if (path === '/') {
      await page.screenshot({ path: `tools/seo-${label}-mobile.png`, fullPage: false });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({ path: `tools/seo-${label}-desktop.png`, fullPage: false });
      await page.setViewportSize({ width: 390, height: 844 });
    }
  }
  if (verify) {
    await page.goto(base + '/products?q=RV12', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('예: RV12, A70316934, nXDS, TIC...').waitFor();
    assert.equal(await page.getByPlaceholder('예: RV12, A70316934, nXDS, TIC...').inputValue(), 'RV12');
    await page.waitForFunction(() => document.querySelectorAll('a[href^="/products/"]').length > 0, { timeout: 30000 });
    results.search = { query: 'RV12', productLinks: await page.locator('a[href^="/products/"]').count() };
    assert.equal(results.errors.length, 0, 'browser errors');
  }
} finally {
  await fs.writeFile(`tools/seo-${label}-browser.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ label, pages: results.pages.map(p => ({ path: p.path, status: p.status, h1: p.h1.length, initialH1: p.initialH1Count })), errors: results.errors, search: results.search }));
