/* Local synthetic smoke check. Requires the task's isolated PostgreSQL fixture
 * and a running loopback server. No external browser requests are permitted. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { Pool } = require('pg');

async function main() {
  const base = process.env.PARTNER_PREVIEW_URL || 'http://127.0.0.1:3017';
  if (new URL(base).hostname !== '127.0.0.1') throw new Error('Use a loopback preview only.');
  const testUrl = new URL(process.env.TEST_PARTNER_DATABASE_URL || '');
  if (testUrl.hostname !== '127.0.0.1' || testUrl.pathname !== '/ofroot_partner_test') throw new Error('Use the isolated test database only.');
  const output = path.join(process.cwd(), 'output/playwright/partner-funnel');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const database = new Pool({ connectionString: testUrl.toString(), max: 1 });
  const report = {};
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return ['http:', 'https:'].includes(url.protocol) && url.origin !== base ? route.abort() : route.continue();
    });
    await context.addInitScript(() => {
      window.partnerEvents = [];
      window.partnerVitals = { lcp: null, cls: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.partnerVitals.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.partnerVitals.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      window.addEventListener('ofroot:partner-analytics', event => window.partnerEvents.push(event.detail));
    });
    const page = await context.newPage();
    await page.goto(`${base}/partners/staffing`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.locator('h1').innerText(), /Senior Engineering Expertise/);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://www.ofroot.technology/partners/staffing');
    assert.equal(await page.locator('script[src*="googletagmanager"]').count(), 0);
    await page.screenshot({ path: path.join(output, 'desktop.png') });
    report.performance = await page.evaluate(() => ({ ...window.partnerVitals, note: 'local smoke, no network or CPU throttling' }));
    const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
    report.accessibility = axe.violations.map(v => ({ id: v.id, impact: v.impact, elements: v.nodes.map(n => n.target) }));
    assert.deepEqual(report.accessibility, [], 'Accessibility violations');

    await page.getByRole('link', { name: 'Discuss an Engineering Partnership', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name' }).fill('Synthetic Browser QA');
    await page.getByRole('textbox', { name: 'Work email' }).fill('smoke-browser@example.test');
    await page.getByRole('textbox', { name: 'Company' }).fill('Synthetic Partner Co');
    await page.getByRole('combobox', { name: 'You represent' }).selectOption('staffing');
    await page.getByRole('combobox', { name: 'Engineering need' }).selectOption('managed');
    await page.getByRole('textbox', { name: 'What needs to be delivered?' }).fill('Synthetic scope for application maintenance and an API integration.');
    await page.getByRole('combobox', { name: 'Target start timeframe' }).selectOption('planning');
    const disclosure = page.getByText('Add a budget or rate range', { exact: false });
    await disclosure.click();
    await page.getByRole('textbox', { name: 'Budget or rate range', exact: true }).fill('Synthetic rate to discuss');
    await disclosure.click(); await disclosure.click();
    assert.equal(await page.getByRole('textbox', { name: 'Budget or rate range', exact: true }).inputValue(), 'Synthetic rate to discuss');
    await page.getByRole('checkbox', { name: 'I understand OfRoot' }).check();

    let firstAttempt = true;
    const ids = [];
    await context.route('**/api/partner-inquiry', async route => {
      ids.push(route.request().postDataJSON().requestId);
      if (firstAttempt) { firstAttempt = false; return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Synthetic connection failure. Please try again.' }) }); }
      return route.continue();
    });
    await page.getByRole('button', { name: 'Send partnership inquiry', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Synthetic connection failure' }).waitFor();
    assert.equal(await page.getByRole('textbox', { name: 'Your name' }).inputValue(), 'Synthetic Browser QA');
    await page.screenshot({ path: path.join(output, 'preserved-error.png') });
    await page.getByRole('button', { name: 'Send partnership inquiry', exact: true }).click();
    await page.getByRole('heading', { name: 'Your inquiry is saved.' }).waitFor();
    assert.equal(ids[0], ids[1], 'Retry must preserve its request reference.');
    report.reference = ids[1];
    await page.screenshot({ path: path.join(output, 'confirmation.png') });
    const record = await database.query(`SELECT i.payload FROM ofroot_sales_inquiries i JOIN ofroot_partner_inquiry_receipts r ON r.inquiry_id=i.id WHERE r.request_id=$1`, [report.reference]);
    assert.equal(record.rows.length, 1);
    assert.equal(record.rows[0].payload.form.need, 'managed');
    assert.equal(record.rows[0].payload.notifications.status, 'approval_required');
    const events = await page.evaluate(() => window.partnerEvents);
    for (const value of ['partner_page_view', 'partner_cta_click', 'partner_form_start', 'partner_form_submit']) assert(events.some(e => e.event === value));
    assert.doesNotMatch(JSON.stringify(events), /example.test|Synthetic|rate to discuss|requestId/);
    report.analytics = events;
    report.formFlow = 'saved one durable lead after simulated failure; draft preserved; no mail sent';

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/partners/staffing`, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: path.join(output, 'mobile.png') });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('dialog', { name: 'Mobile navigation' }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Open navigation' }).evaluate(e => e === document.activeElement), true);
    const question = page.locator('summary').filter({ hasText: 'Will the work be subcontracted?' });
    await question.focus(); await page.keyboard.press('Enter');
    assert.equal(await question.evaluate(e => e.parentElement.open), true);
    await page.keyboard.press('Enter');
    assert.equal(await question.evaluate(e => e.parentElement.open), false);
    await page.addScriptTag({ content: axeSource });
    const mobileAxe = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
    report.mobileAccessibility = mobileAxe.violations.map(v => ({ id: v.id, impact: v.impact }));
    assert.deepEqual(report.mobileAccessibility, []);
    report.mobile = '390px: no overflow; menu Escape restores focus; native FAQ keyboard works';
    await page.getByRole('link', { name: 'Discuss an Engineering Partnership', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name' }).fill('Synthetic Mobile QA');
    await page.getByRole('textbox', { name: 'Work email' }).fill('smoke-mobile@example.test');
    await page.getByRole('textbox', { name: 'Company' }).fill('Synthetic Mobile Partner');
    await page.getByRole('combobox', { name: 'You represent' }).selectOption('consultancy');
    await page.getByRole('combobox', { name: 'Engineering need' }).selectOption('embedded');
    await page.getByRole('textbox', { name: 'What needs to be delivered?' }).fill('Synthetic mobile inquiry for embedded application engineering.');
    await page.getByRole('combobox', { name: 'Target start timeframe' }).selectOption('planning');
    await page.getByRole('checkbox', { name: 'I understand OfRoot' }).check();
    await page.screenshot({ path: path.join(output, 'mobile-form.png') });
    await page.getByRole('button', { name: 'Send partnership inquiry', exact: true }).click();
    await page.getByRole('heading', { name: 'Your inquiry is saved.' }).waitFor();
    report.mobileReference = ids[ids.length - 1];
    assert.equal((await database.query('SELECT inquiry_id FROM ofroot_partner_inquiry_receipts WHERE request_id=$1', [report.mobileReference])).rows.length, 1);
    await page.screenshot({ path: path.join(output, 'mobile-confirmation.png') });
    report.mobileForm = 'saved one durable inquiry using the 390px form';
    for (const width of [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Overflow at ${width}px`);
    }
    report.responsive = 'no horizontal overflow at 320, 390, 768, 1024 and 1440px';
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Staffing or talent partner? Discuss an engineering partnership' }).click();
    await page.waitForURL('**/partners/staffing');
    assert.equal(await page.locator('h1').count(), 1);
    report.homepage = 'one-click hero link reaches partner page';
    const response = await context.request.get(`${base}/partners/staffing`);
    report.headers = { contentTypeOptions: response.headers()['x-content-type-options'], frameOptions: response.headers()['x-frame-options'], referrerPolicy: response.headers()['referrer-policy'] };
    assert.equal(report.headers.contentTypeOptions, 'nosniff'); assert.equal(report.headers.frameOptions, 'DENY');
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); await database.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
