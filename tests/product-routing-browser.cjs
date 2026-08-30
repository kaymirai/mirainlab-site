const { chromium } = require('C:/Users/kayso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const base = process.env.LP_BASE || 'http://127.0.0.1:8133';
const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSc12bXC8XFsJMs_8U44-8BbStaWtzF_QBlGDVyct4j45MRHyQ/viewform?usp=send_form';
const spotUrl = 'https://coconala.com/services/3526967';

function expectedHref(prefix, target) {
  return new URL(`${prefix}${target}`, `${base}/`).href;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });
  const failures = [];

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    for (const prefix of ['', 'new/']) {
      const routeName = `${prefix || 'root/'}@${viewport.name}`;
      const page = await browser.newPage({ viewport });

    await page.goto(`${base}/${prefix}index.html`, { waitUntil: 'domcontentloaded' });
    const top = await page.evaluate(() => {
      const section = document.querySelector('#learning-options');
      const selfStudy = section?.querySelector('[data-route="self-study"]');
      const support = section?.querySelector('[data-route="support"]');
      return {
        hasSection: Boolean(section),
        selfStudyText: selfStudy?.innerText || '',
        supportText: support?.innerText || '',
        supportHref: support?.querySelector('a')?.href || '',
        spotHref: section?.querySelector('[data-spot-entry] a')?.href || '',
        allProductsOptional: section?.innerText.includes('教材を全部買う必要はありません') || false,
        hasOldSixStepCopy: document.body.innerText.includes('6ステップ'),
      };
    });
    if (!top.hasSection) failures.push(`${routeName} TOP: two-route section missing`);
    if (!top.selfStudyText.includes('Udemy') || !top.selfStudyText.includes('Brain')) failures.push(`${routeName} TOP: self-study route does not compare Udemy and Brain`);
    if (!top.supportText.includes('3か月') || !top.supportText.includes('69,800円')) failures.push(`${routeName} TOP: support route does not show the main offer and price`);
    if (top.selfStudyText.includes('69,800円') || /Udemy|Brain|90分/.test(top.supportText)) failures.push(`${routeName} TOP: product roles overlap between routes`);
    if (top.supportHref !== expectedHref(prefix, 'mentor.html')) failures.push(`${routeName} TOP: support CTA does not link to mentorship`);
    if (top.spotHref !== expectedHref(prefix, 'mentor.html#spot')) failures.push(`${routeName} TOP: 90-minute entry is not supplemental`);
    if (!top.allProductsOptional) failures.push(`${routeName} TOP: optional-purchase note missing`);
    if (top.hasOldSixStepCopy) failures.push(`${routeName} TOP: obsolete six-step copy remains`);

    await page.goto(`${base}/${prefix}free-gift.html`, { waitUntil: 'domcontentloaded' });
    const gift = await page.evaluate(() => {
      const section = document.querySelector('#choose-next-route');
      return {
        heading: section?.querySelector('h2')?.innerText || '',
        selfStudy: section?.querySelector('[data-route="self-study"]')?.innerText || '',
        support: section?.querySelector('[data-route="support"]')?.innerText || '',
        compareHref: section?.querySelector('[data-route="self-study"] a')?.href || '',
        supportHref: section?.querySelector('[data-route="support"] a')?.href || '',
        spotHref: section?.querySelector('[data-spot-entry] a')?.href || '',
        allProductsOptional: section?.innerText.includes('教材を全部買う必要はありません') || false,
      };
    });
    if (gift.heading !== 'ここからは、自分に合う進め方を選べます') failures.push(`${routeName} gift: route heading missing`);
    if (!gift.selfStudy.includes('自分のペースで公開まで進める')) failures.push(`${routeName} gift: self-study route missing`);
    if (!gift.support.includes('相談しながら、商品公開まで進める') || !gift.support.includes('3か月 69,800円')) failures.push(`${routeName} gift: support route or price missing`);
    if (gift.selfStudy.includes('69,800円') || /Udemy|Brain|90分/.test(gift.support)) failures.push(`${routeName} gift: product roles overlap between routes`);
    if (gift.compareHref !== expectedHref(prefix, 'index.html#learning-options')) failures.push(`${routeName} gift: comparison CTA target mismatch`);
    if (gift.supportHref !== expectedHref(prefix, 'mentor.html')) failures.push(`${routeName} gift: mentorship CTA target mismatch`);
    if (gift.spotHref !== expectedHref(prefix, 'mentor.html#spot')) failures.push(`${routeName} gift: 90-minute CTA target mismatch`);
    if (!gift.allProductsOptional) failures.push(`${routeName} gift: optional-purchase note missing`);

    await page.goto(`${base}/${prefix}mentor.html`, { waitUntil: 'domcontentloaded' });
    const mentor = await page.evaluate(({ formUrl, spotUrl }) => {
      const hero = document.querySelector('.page-hero');
      const spot = document.querySelector('#spot');
      return {
        heroText: hero?.innerText || '',
        heroFormHref: hero?.querySelector(`a[href="${formUrl}"]`)?.href || '',
        spotText: spot?.innerText || '',
        spotHref: spot?.querySelector(`a[href="${spotUrl}"]`)?.href || '',
        heroHasSpotOffer: hero?.innerText.includes('6,000円') || false,
        spotAfterProgram: spot && document.querySelector('[data-main-offer]')
          ? spot.compareDocumentPosition(document.querySelector('[data-main-offer]')) & Node.DOCUMENT_POSITION_PRECEDING
          : false,
      };
    }, { formUrl, spotUrl });
    if (!mentor.heroText.includes('3か月') || !mentor.heroText.includes('69,800円')) failures.push(`${routeName} mentor: main offer not visible in hero`);
    if (mentor.heroFormHref !== formUrl) failures.push(`${routeName} mentor: main offer form CTA mismatch`);
    if (mentor.heroHasSpotOffer) failures.push(`${routeName} mentor: 90-minute offer still dominates hero`);
    if (!mentor.spotText.includes('3か月伴走が自分に合うか') || !mentor.spotText.includes('6,000円')) failures.push(`${routeName} mentor: 90-minute entry role is unclear`);
    if (mentor.spotHref !== spotUrl) failures.push(`${routeName} mentor: 90-minute CTA mismatch`);
    if (!mentor.spotAfterProgram) failures.push(`${routeName} mentor: 90-minute entry appears before main offer`);

    await page.goto(`${base}/${prefix}diagnosis.html`, { waitUntil: 'domcontentloaded' });
    for (let question = 0; question < 5; question += 1) {
      await page.locator('[data-option]').last().click();
      await page.waitForTimeout(220);
    }
    const diagnosis = await page.evaluate(() => {
      const result = document.querySelector('[data-result]');
      return {
        resultText: result?.innerText || '',
        primaryHref: result?.querySelector('[data-result-link]')?.href || '',
        selfStudyHref: result?.querySelector('[data-result-self-study]')?.href || '',
        supportHref: result?.querySelector('[data-result-support]')?.href || '',
      };
    });
    if (!diagnosis.resultText.includes('教材を全部買う必要はありません')) failures.push(`${routeName} diagnosis: optional-purchase note missing`);
    if (!diagnosis.resultText.includes('3か月伴走で') || diagnosis.primaryHref !== expectedHref(prefix, 'mentor.html')) failures.push(`${routeName} diagnosis: support result does not prioritize three-month mentorship`);
    if (diagnosis.selfStudyHref !== expectedHref(prefix, 'index.html#learning-options')) failures.push(`${routeName} diagnosis: self-study route target mismatch`);
    if (diagnosis.supportHref !== expectedHref(prefix, 'mentor.html')) failures.push(`${routeName} diagnosis: support route target mismatch`);

      await page.close();
    }
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('PASS: two-route product navigation verified on root and preview pages.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
