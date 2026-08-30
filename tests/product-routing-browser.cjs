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
    if (!top.supportText.includes('3か月')) failures.push(`${routeName} TOP: support route does not show the main offer`);
    if (top.supportText.includes('69,800円')) failures.push(`${routeName} TOP: price dominates before the mentorship details`);
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
      const mainOffer = hero?.querySelector('[data-main-offer]');
      const summary = mainOffer?.querySelector('.mentor-offer-summary');
      const price = mainOffer?.querySelector('.mentor-entry-price');
      const heading = mainOffer?.querySelector('h2');
      const entryAmount = price?.querySelector('.price-amount');
      const entryUnit = price?.querySelector('.price-unit');
      const finalPrice = [...document.querySelectorAll('.price-box .price')]
        .find((element) => element.textContent.includes('69,800'));
      const finalAmount = finalPrice?.querySelector('.price-amount');
      const finalUnit = finalPrice?.querySelector('.price-unit');
      const spot = document.querySelector('#spot');
      const consultationPrice = spot?.querySelector('.consultation-price');
      const consultationAmount = consultationPrice?.querySelector('.price-amount');
      const consultationUnit = consultationPrice?.querySelector('.price-unit');
      const featurePairs = [...document.querySelectorAll('.number-feature')];
      const stylesheetHref = document.querySelector('link[rel="stylesheet"][href*="new-lp.css"]')?.href || '';
      const timelineNumber = document.querySelector('.timeline-no');
      return {
        heroText: hero?.innerText || '',
        summaryText: summary?.innerText || '',
        summaryBeforePrice: Boolean(summary && price && (summary.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING)),
        priceFontSize: price ? Number.parseFloat(getComputedStyle(price).fontSize) : 0,
        headingFontSize: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 0,
        entryUnitRatio: entryUnit && price
          ? Number.parseFloat(getComputedStyle(entryUnit).fontSize) / Number.parseFloat(getComputedStyle(price).fontSize)
          : 0,
        finalUnitRatio: finalUnit && finalPrice
          ? Number.parseFloat(getComputedStyle(finalUnit).fontSize) / Number.parseFloat(getComputedStyle(finalPrice).fontSize)
          : 0,
        consultationUnitRatio: consultationUnit && consultationPrice
          ? Number.parseFloat(getComputedStyle(consultationUnit).fontSize) / Number.parseFloat(getComputedStyle(consultationPrice).fontSize)
          : 0,
        priceFontsDiffer: Boolean(
          entryAmount && entryUnit && finalAmount && finalUnit && consultationAmount && consultationUnit
          && getComputedStyle(entryAmount).fontFamily !== getComputedStyle(entryUnit).fontFamily
          && getComputedStyle(finalAmount).fontFamily !== getComputedStyle(finalUnit).fontFamily
          && getComputedStyle(consultationAmount).fontFamily !== getComputedStyle(consultationUnit).fontFamily
        ),
        featurePairCount: featurePairs.length,
        featurePairsValid: featurePairs.length > 0 && featurePairs.every((pair) => {
          const value = pair.querySelector('.number-value');
          const unit = pair.querySelector('.number-unit');
          if (!value || !unit) return false;
          const ratio = Number.parseFloat(getComputedStyle(unit).fontSize) / Number.parseFloat(getComputedStyle(value).fontSize);
          return ratio >= 0.6 && ratio <= 0.75 && getComputedStyle(value).fontFamily !== getComputedStyle(unit).fontFamily;
        }),
        sequenceUsesNumberFont: Boolean(timelineNumber && entryAmount
          && getComputedStyle(timelineNumber).fontFamily === getComputedStyle(entryAmount).fontFamily),
        stylesheetVersioned: Boolean(stylesheetHref && new URL(stylesheetHref).searchParams.has('v')),
        entryPriceText: price?.textContent.replace(/\s+/g, '') || '',
        finalPriceText: finalPrice?.textContent.replace(/\s+/g, '') || '',
        consultationPriceText: consultationPrice?.textContent.replace(/\s+/g, '') || '',
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
    if (!mentor.summaryText.includes('全8回') || !mentor.summaryText.includes('期間中の質問') || !mentor.summaryText.includes('終了後30日')) failures.push(`${routeName} mentor: package summary is not visible before price`);
    if (!mentor.summaryBeforePrice) failures.push(`${routeName} mentor: price appears before the package summary`);
    if (!mentor.priceFontSize || mentor.priceFontSize > mentor.headingFontSize) failures.push(`${routeName} mentor: entry price visually dominates the offer heading`);
    if (mentor.entryPriceText !== '69,800円（税込）' || mentor.finalPriceText !== '69,800円（税込）') failures.push(`${routeName} mentor: mentorship price wording changed`);
    if (mentor.entryUnitRatio < 0.62 || mentor.entryUnitRatio > 0.72 || mentor.finalUnitRatio < 0.62 || mentor.finalUnitRatio > 0.72 || mentor.consultationUnitRatio < 0.62 || mentor.consultationUnitRatio > 0.72) failures.push(`${routeName} mentor: price units do not share the intended hierarchy`);
    if (!mentor.priceFontsDiffer) failures.push(`${routeName} mentor: price digits and Japanese units use the same typeface`);
    if (mentor.consultationPriceText !== '6,000円/90分') failures.push(`${routeName} mentor: 90-minute consultation price wording changed`);
    if (mentor.featurePairCount < 6 || !mentor.featurePairsValid) failures.push(`${routeName} mentor: featured durations and counts lack a consistent number-unit hierarchy`);
    if (!mentor.sequenceUsesNumberFont) failures.push(`${routeName} mentor: sequence numbers do not use the shared numeric typeface`);
    if (!mentor.stylesheetVersioned) failures.push(`${routeName} mentor: stylesheet URL cannot invalidate stale browser caches`);
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

    for (const numericPage of [
      { path: 'index.html', minFeatures: 5, sequenceSelector: '.step-no', expectsPrice: false },
      { path: 'free-gift.html', minFeatures: 5, sequenceSelector: '.process-index', expectsPrice: true },
      { path: 'diagnosis.html', minFeatures: 3, sequenceSelector: '.route-node', expectsPrice: true },
      { path: 'udemy.html', minFeatures: 5, sequenceSelector: '.process-index', expectsPrice: false },
      { path: 'paid.html', minFeatures: 5, sequenceSelector: '.curriculum-no', expectsPrice: false },
    ]) {
      await page.goto(`${base}/${prefix}${numericPage.path}`, { waitUntil: 'domcontentloaded' });
      const numericDesign = await page.evaluate(({ sequenceSelector }) => {
        const featurePairs = [...document.querySelectorAll('.number-feature')];
        const firstValue = featurePairs[0]?.querySelector('.number-value');
        const sequence = document.querySelector(sequenceSelector);
        const price = document.querySelector('[data-numeric-price]');
        const priceAmount = price?.querySelector('.price-amount');
        const priceUnit = price?.querySelector('.price-unit');
        const stylesheetHref = document.querySelector('link[rel="stylesheet"][href*="new-lp.css"]')?.href || '';
        return {
          featureCount: featurePairs.length,
          featurePairsValid: featurePairs.length > 0 && featurePairs.every((pair) => {
            const value = pair.querySelector('.number-value');
            const unit = pair.querySelector('.number-unit');
            if (!value || !unit) return false;
            const ratio = Number.parseFloat(getComputedStyle(unit).fontSize) / Number.parseFloat(getComputedStyle(value).fontSize);
            return ratio >= 0.6 && ratio <= 0.75 && getComputedStyle(value).fontFamily !== getComputedStyle(unit).fontFamily;
          }),
          sequenceUsesNumberFont: Boolean(sequence && firstValue
            && getComputedStyle(sequence).fontFamily === getComputedStyle(firstValue).fontFamily),
          pricePresent: Boolean(price),
          priceUnitRatio: priceAmount && priceUnit
            ? Number.parseFloat(getComputedStyle(priceUnit).fontSize) / Number.parseFloat(getComputedStyle(priceAmount).fontSize)
            : 0,
          priceFontsDiffer: Boolean(priceAmount && priceUnit
            && getComputedStyle(priceAmount).fontFamily !== getComputedStyle(priceUnit).fontFamily),
          stylesheetVersioned: Boolean(stylesheetHref && new URL(stylesheetHref).searchParams.has('v')),
        };
      }, { sequenceSelector: numericPage.sequenceSelector });
      if (numericDesign.featureCount < numericPage.minFeatures || !numericDesign.featurePairsValid) failures.push(`${routeName} ${numericPage.path}: important numbers lack the shared number-unit hierarchy`);
      if (!numericDesign.sequenceUsesNumberFont) failures.push(`${routeName} ${numericPage.path}: sequence labels do not use the shared numeric typeface`);
      if (numericDesign.pricePresent !== numericPage.expectsPrice) failures.push(`${routeName} ${numericPage.path}: numeric price scope is incorrect`);
      if (numericPage.expectsPrice && (numericDesign.priceUnitRatio < 0.62 || numericDesign.priceUnitRatio > 0.72 || !numericDesign.priceFontsDiffer)) failures.push(`${routeName} ${numericPage.path}: route price does not match the shared price hierarchy`);
      if (!numericDesign.stylesheetVersioned) failures.push(`${routeName} ${numericPage.path}: stylesheet URL cannot invalidate stale browser caches`);
    }

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
