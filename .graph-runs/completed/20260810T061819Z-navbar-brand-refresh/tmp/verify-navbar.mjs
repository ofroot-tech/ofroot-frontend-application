import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = {};
const baseUrl = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3100';

const measureControl = async locator => locator.evaluate(element => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    paddingInline: `${style.paddingLeft} / ${style.paddingRight}`,
    paddingBlock: `${style.paddingTop} / ${style.paddingBottom}`,
    gap: style.gap,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
  };
});

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await desktop.waitForTimeout(700);

  const desktopNav = desktop.getByRole('navigation', { name: 'Primary navigation' });
  const desktopCta = desktopNav.getByRole('link', { name: 'Book an audit' });
  results.desktop = {
    navVisible: await desktopNav.isVisible(),
    ctaHref: await desktopCta.getAttribute('href'),
    overflow: await desktop.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    headerHeight: await desktop.locator('header').evaluate(element => Math.round(element.getBoundingClientRect().height)),
    logoBox: await desktop.getByRole('link', { name: 'OfRoot Tech home' }).first().boundingBox(),
    primaryCta: await measureControl(desktop.getByRole('link', { name: 'Book a Growth Systems Audit' }).first()),
    secondaryCta: await measureControl(desktop.getByRole('link', { name: 'Explore Our Systems' })),
    finalCta: await measureControl(desktop.getByRole('link', { name: 'Book a Growth Systems Audit' }).last()),
    orbitVisible: await desktop.getByRole('img', { name: 'One connected growth system: Discover, Convert, Operate' }).isVisible(),
    orbitAnimating: await desktop.getByRole('img', { name: 'One connected growth system: Discover, Convert, Operate' }).getAttribute('data-animate'),
  };
  await desktop.screenshot({ path: 'output/playwright/navbar-after-desktop.png', fullPage: false });

  await desktop.getByText('Services', { exact: true }).first().click();
  results.desktop.servicesLinks = await desktopNav.locator('details').first().getByRole('link').allTextContents();
  await desktop.screenshot({ path: 'output/playwright/navbar-after-dropdown.png', fullPage: false });

  await desktop.goto(`${baseUrl}/results`, { waitUntil: 'domcontentloaded' });
  await desktop.waitForTimeout(350);
  results.desktop.activeRoute = await desktopNav.getByRole('link', { name: 'Results' }).getAttribute('aria-current');

  const breakpoint = await browser.newPage({ viewport: { width: 1024, height: 800 } });
  await breakpoint.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await breakpoint.waitForTimeout(350);
  results.breakpoint = {
    desktopNavVisible: await breakpoint.getByRole('navigation', { name: 'Primary navigation' }).isVisible(),
    menuButtonVisible: await breakpoint.getByRole('button', { name: 'Open navigation' }).isVisible(),
    overflow: await breakpoint.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
  };
  await breakpoint.screenshot({ path: 'output/playwright/navbar-after-1024.png', fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await mobile.waitForTimeout(350);
  const openButton = mobile.getByRole('button', { name: 'Open navigation' });
  results.mobile = {
    openButtonVisible: await openButton.isVisible(),
    desktopNavVisible: await mobile.getByRole('navigation', { name: 'Primary navigation' }).isVisible(),
    overflowClosed: await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    primaryCta: await measureControl(mobile.getByRole('link', { name: 'Book a Growth Systems Audit' }).first()),
    secondaryCta: await measureControl(mobile.getByRole('link', { name: 'Explore Our Systems' })),
    finalCta: await measureControl(mobile.getByRole('link', { name: 'Book a Growth Systems Audit' }).last()),
  };
  await mobile.screenshot({ path: 'output/playwright/navbar-after-mobile.png', fullPage: false });

  await openButton.focus();
  await openButton.click();
  const dialog = mobile.getByRole('dialog', { name: 'Mobile navigation' });
  const closeButton = mobile.getByRole('button', { name: 'Close navigation' });
  await dialog.waitFor({ state: 'visible' });
  results.mobile.dialogVisible = await dialog.isVisible();
  results.mobile.focusOnOpen = await closeButton.evaluate(element => document.activeElement === element);
  results.mobile.bodyOverflowOpen = await mobile.evaluate(() => document.body.style.overflow);
  results.mobile.mobileCtaHref = await dialog.getByRole('link', { name: 'Book a Growth Systems Audit' }).getAttribute('href');
  results.mobile.overflowOpen = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await mobile.screenshot({ path: 'output/playwright/navbar-after-mobile-open.png', fullPage: false });

  await dialog.getByRole('link', { name: 'OfRoot Tech home' }).focus();
  await mobile.keyboard.press('Shift+Tab');
  results.mobile.focusLoop = await dialog
    .getByRole('link', { name: 'Book a Growth Systems Audit' })
    .evaluate(element => document.activeElement === element);

  await mobile.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  results.mobile.dialogClosedWithEscape = (await dialog.count()) === 0;
  results.mobile.focusRestored = await openButton.evaluate(element => document.activeElement === element);
  results.mobile.bodyOverflowRestored = await mobile.evaluate(() => document.body.style.overflow);

  const logoResponse = await desktop.request.get(`${baseUrl}/ofroot-tech-logo.svg`);
  results.asset = {
    status: logoResponse.status(),
    contentType: logoResponse.headers()['content-type'],
  };

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
