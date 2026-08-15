const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const JSZip = require('jszip');
const { makePng } = require('./png-fixtures');

const root = path.resolve(__dirname, '..');

function startServer() {
  const server = http.createServer((req, res) => {
    const requested = decodeURIComponent(req.url.split('?')[0]);
    const relative = requested === '/' ? 'index.html' : requested === '/favicon.ico' ? 'favicon.svg' : requested.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const contentType = file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'application/javascript' : file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.webmanifest') ? 'application/manifest+json' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType }); fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

test('all tabs load cleanly and a splash export creates a ZIP', async t => {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  t.after(async () => { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); });

  const page = await context.newPage();
  const errors = [];
  const axeFindings = new Set();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

  const tabs = page.locator('.tab-btn');
  assert.equal(await tabs.count(), 5);
  for (let i = 0; i < await tabs.count(); i++) {
    await tabs.nth(i).click();
    const violations = await new AxeBuilder({ page }).analyze();
    assert.ok(Array.isArray(violations.violations));
    violations.violations.forEach(v => axeFindings.add(`${v.id} (${v.impact || 'unknown'})`));
  }

  await page.locator('[data-tab="splash"]').click();
  await page.locator('#courseNameInput').fill('Smoke Course');
  await page.locator('#bgInput').setInputFiles({ name: 'smoke.png', mimeType: 'image/png', buffer: makePng(8, 8, 2, [40, 100, 60]) });
  await page.locator('.chk').first().check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportSelBtn').click()
  ]);
  assert.match(download.suggestedFilename(), /smoke-course-app-images-selected\.zip$/i);
  await page.locator('[data-tab="icons"]').click();
  await page.locator('#iconLogoInput').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: makePng(8, 4, 6, [40, 100, 60, 128]) });
  const [iconDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#iconExportBtn').click()
  ]);
  const zip = await JSZip.loadAsync(fs.readFileSync(await iconDownload.path()));
  const iconPng = await zip.file('app-icon.png').async('nodebuffer');
  const logoPng = await zip.file('main-logo.png').async('nodebuffer');
  assert.equal(iconPng[25], 2, 'app-icon.png must be RGB without alpha');
  assert.notEqual(logoPng[25], 2, 'main-logo.png must retain a non-RGB transparency-capable encoding');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-tab="crop"]').click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'phone viewport must not overflow horizontally');
  await page.setViewportSize({ width: 768, height: 1024 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'tablet viewport must not overflow horizontally');
  assert.deepEqual(errors, [], `browser errors: ${errors.join('; ')}`);
  if (axeFindings.size) console.warn(`Accessibility follow-ups observed: ${[...axeFindings].sort().join(', ')}`);
});
