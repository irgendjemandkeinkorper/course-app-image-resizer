const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const { makePng } = require('./png-fixtures');

const root = path.resolve(__dirname, '..');

function startServer() {
  const server = http.createServer((req, res) => {
    const requested = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, requested === '/' ? 'index.html' : requested.slice(1));
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
  assert.deepEqual(errors, [], `browser errors: ${errors.join('; ')}`);
  if (axeFindings.size) console.warn(`Accessibility follow-ups observed: ${[...axeFindings].sort().join(', ')}`);
});
