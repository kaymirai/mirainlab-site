const { chromium } = require('C:/Users/kayso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const base = process.env.LP_BASE || 'http://127.0.0.1:8133';
const styledPages = [
  'index.html', 'diagnosis.html', 'free-gift.html', 'udemy.html', 'paid.html', 'mentor.html',
  'faq.html', 'profile.html', 'legal.html', 'privacy.html',
  'new/index.html', 'new/diagnosis.html', 'new/free-gift.html', 'new/udemy.html', 'new/paid.html', 'new/mentor.html',
];

async function inspectHeading(page, selector, phrase) {
  return page.locator(selector).evaluate((element, text) => {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    const fullText = nodes.map((item) => item.data).join('');
    const start = fullText.indexOf(text);
    if (start < 0) return { found: false, lineCount: 0 };

    const locate = (absoluteOffset) => {
      let offset = absoluteOffset;
      for (const item of nodes) {
        if (offset <= item.data.length) return { node: item, offset };
        offset -= item.data.length;
      }
      const last = nodes.at(-1);
      return { node: last, offset: last.data.length };
    };

    const from = locate(start);
    const to = locate(start + text.length);
    const range = document.createRange();
    range.setStart(from.node, from.offset);
    range.setEnd(to.node, to.offset);

    const bands = [];
    for (const rect of [...range.getClientRects()].filter((item) => item.width > 0 && item.height > 0)) {
      if (!bands.some((top) => Math.abs(rect.top - top) < 24)) bands.push(rect.top);
    }
    return { found: true, lineCount: bands.length };
  }, phrase);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const failures = [];

  for (const pageName of styledPages) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(`${base}/${pageName}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const headings = await page.locator('h1,h2,h3').evaluateAll((elements) => elements.map((element) => ({
        text: element.textContent.trim(),
        wordBreak: getComputedStyle(element).wordBreak,
        textWrap: getComputedStyle(element).textWrap,
      })));
      if (headings.some((heading) => heading.text.includes('。'))) failures.push(`${pageName}: heading contains a Japanese full stop`);
      if (headings.some((heading) => heading.wordBreak !== 'auto-phrase' || heading.textWrap !== 'pretty')) failures.push(`${pageName}: headings do not use phrase-aware balanced wrapping`);
      await page.close();
  }

  for (const prefix of ['', 'new/']) {
    const top = await browser.newPage({ viewport: { width: 320, height: 844 } });
    await top.goto(`${base}/${prefix}index.html`, { waitUntil: 'domcontentloaded' });
    await top.evaluate(() => document.fonts.ready);
    for (const phrase of ['今日つくる1枚が、', '決まらない']) {
      const result = await inspectHeading(top, 'h1', phrase);
      if (!result.found || result.lineCount !== 1) failures.push(`${prefix || 'root/'}index.html@320: phrase split across lines: ${phrase}`);
    }
    const topOverflow = await top.locator('h1').evaluate((element) => element.scrollWidth - element.clientWidth);
    if (topOverflow > 1) failures.push(`${prefix || 'root/'}index.html@320: hero heading overflows by ${topOverflow}px`);
    await top.close();

    const gift = await browser.newPage({ viewport: { width: 360, height: 844 } });
    await gift.goto(`${base}/${prefix}free-gift.html`, { waitUntil: 'domcontentloaded' });
    await gift.evaluate(() => document.fonts.ready);
    for (const phrase of ['最初の1商品案と、', 'デザイン画像']) {
      const result = await inspectHeading(gift, 'h1', phrase);
      if (!result.found || result.lineCount !== 1) failures.push(`${prefix || 'root/'}free-gift.html@360: phrase split across lines: ${phrase}`);
    }
    await gift.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('PASS: phrase-aware heading wraps verified across core funnel pages.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
