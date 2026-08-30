const { chromium } = require('C:/Users/kayso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');

const base = process.env.LP_BASE || 'http://127.0.0.1:8133';
const outputDir = process.env.LP_QA_DIR || 'C:/work/mirainlab-funnel-work/output/product-routing-qa';
const pages = ['index.html', 'diagnosis.html', 'free-gift.html', 'mentor.html'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const failures = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const pageName of pages) {
      const page = await context.newPage();
      page.on('pageerror', (error) => failures.push(`${pageName}@${viewport.name}: ${error.message}`));
      const response = await page.goto(`${base}/${pageName}`, { waitUntil: 'domcontentloaded' });
      if (!response || response.status() !== 200) failures.push(`${pageName}@${viewport.name}: HTTP ${response?.status()}`);

      const revealCount = await page.locator('[data-reveal]').count();
      for (let index = 0; index < revealCount; index += 1) {
        await page.locator('[data-reveal]').nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(45);
      }
      const imageCount = await page.locator('img').count();
      for (let index = 0; index < imageCount; index += 1) {
        await page.locator('img').nth(index).scrollIntoViewIfNeeded();
      }
      await page.waitForTimeout(100);

      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
        overflowingActions: [...document.querySelectorAll('.button, .route-product')]
          .filter((element) => element.offsetParent !== null && element.scrollWidth > element.clientWidth + 1)
          .map((element) => element.textContent.trim()),
      }));
      if (result.overflow > 1) failures.push(`${pageName}@${viewport.name}: horizontal overflow ${result.overflow}px`);
      if (result.brokenImages.length) failures.push(`${pageName}@${viewport.name}: broken images ${result.brokenImages.join(', ')}`);
      if (result.overflowingActions.length) failures.push(`${pageName}@${viewport.name}: overflowing actions ${result.overflowingActions.join(' | ')}`);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(outputDir, `${pageName.replace('.html', '')}-${viewport.name}.png`),
        fullPage: true,
      });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('PASS: four-page desktop/mobile layout, images, and CTA sizing verified.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
