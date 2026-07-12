(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('mirainlab-theme');
  if (stored === 'dark' || stored === 'light') root.dataset.theme = stored;

  function syncThemeButton() {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'ライトモードに切り替える' : 'ダークモードに切り替える');
      button.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    });
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener('click', (event) => {
    const themeButton = event.target.closest('[data-theme-toggle]');
    if (themeButton) {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mirainlab-theme', root.dataset.theme);
      syncThemeButton();
    }

    const menuButton = event.target.closest('[data-menu-toggle]');
    if (menuButton) {
      const nav = document.querySelector('.site-nav');
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    }
  });

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.18 })
    : null;

  document.querySelectorAll('[data-reveal], .rail-step, .dashboard-panel').forEach((element) => {
    if (observer) observer.observe(element);
    else element.classList.add('is-visible');
  });

  syncThemeButton();
  if (window.lucide) window.lucide.createIcons();
})();

(function () {
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;

  const questions = [
    { text: 'いま、いちばん止まっているのはどこですか？', options: ['商品案が決まらない', 'デザイン画像で止まる', 'Etsy・Printify設定が不安', '出品後に何を見るか分からない', '一人で続けられない'] },
    { text: '商品を形にする時間は、どのくらい取れそうですか？', options: ['まず60分だけ', '週に2〜3時間', '週に5時間以上', '時間より手順が不安', '一緒に予定を決めたい'] },
    { text: '説明はどの形が進めやすいですか？', options: ['PDFを順番に読む', '動画を止めながら操作する', '手順書とテンプレートを使う', '直接質問する', 'まだ分からない'] },
    { text: 'いま目指している到達点はどこですか？', options: ['商品案を1つ決める', 'Etsyへ1商品公開する', '商品を繰り返し出す', '注文後の対応まで覚える', '3か月続ける'] },
    { text: '止まったときに欲しい支援は何ですか？', options: ['次の1手だけ分かればよい', '動画で画面を確認したい', '調べ方と運営手順が欲しい', '90分だけ相談したい', '期間中いつでも質問したい'] }
  ];

  const answers = [];
  let index = 0;
  const title = quiz.querySelector('[data-question]');
  const options = quiz.querySelector('[data-options]');
  const count = quiz.querySelector('[data-count]');
  const fill = quiz.querySelector('[data-progress]');
  const result = document.querySelector('[data-result]');
  const routeNodes = document.querySelectorAll('.route-node');

  function render() {
    title.textContent = questions[index].text;
    count.textContent = `質問 ${index + 1} / ${questions.length}`;
    fill.style.width = `${((index + 1) / questions.length) * 100}%`;
    options.innerHTML = questions[index].options.map((option, optionIndex) => `
      <button class="quiz-option" type="button" data-option="${optionIndex}">
        <span class="quiz-option-dot" aria-hidden="true"></span><span>${option}</span>
      </button>`).join('');
    routeNodes.forEach((node, nodeIndex) => node.classList.toggle('active', nodeIndex <= index));
  }

  function showResult() {
    const supportScore = answers.reduce((score, value) => score + (value >= 3 ? 1 : 0), 0);
    const operationsScore = answers.filter((value) => value === 2).length;
    let heading = 'まずは無料スターターキットで、最初の1案を形にする段階です';
    let text = '受け取りPDFを開き、テーマからデザイン画像までを6ステップで進めましょう。';
    let link = 'free-gift.html';
    let label = 'スターターキットを見る';
    let plan = [
      '受け取りPDFを開き、全体の6ステップを確認する',
      'テーマ候補を3つ書き出す',
      'ニッチ候補を3つ出して1つ選ぶ',
      '商品案を3つ出し、採用・保留・見送りに分ける',
      '初心者向け4型から見た目を1つ選ぶ',
      '画像生成プロンプトを作り、デザイン画像を1枚出す',
      '綴り・権利・見え方を確認して次工程を決める',
    ];
    if (supportScore >= 3) {
      heading = '質問できる環境を使い、止まる時間を短くする段階です';
      text = '90分相談で現在地を整理するか、3か月伴走で商品を出し続ける予定を作りましょう。';
      link = 'mentor.html';
      label = '相談・伴走を見る';
      plan = [
        'いま止まっている画面と商品を1つに絞る',
        '自分で確認したことと、分からないことを分ける',
        '90分相談か3か月伴走のどちらが必要か決める',
        '質問時に共有する画面・URL・候補を準備する',
        '今週終える作業を1つ決める',
        '保留してよい作業を明記する',
        '7日後に進捗と次の質問を記録する',
      ];
    } else if (operationsScore >= 2 || answers[3] >= 2) {
      heading = '出品後も続けられる運営手順を整える段階です';
      text = '需要調査、次の商品、注文対応、入金確認までをBrainセルフ教材でつなげます。';
      link = 'paid.html';
      label = 'セルフ教材を見る';
      plan = [
        '公開済み商品と、次の商品候補を一覧にする',
        '表示・クリック・注文など見られる数字を記録する',
        '市場と競合を確認する商品候補を1つ選ぶ',
        '注文後メッセージとトラブル対応の文例を保存する',
        'Payoneer入金と費用記録の場所を確認する',
        '今週直す箇所を1つだけ選ぶ',
        '次の商品を作る日と確認日を決める',
      ];
    } else if (answers[2] === 1 || answers[3] === 1) {
      heading = '動画を止めながら、最初の商品を公開する段階です';
      text = 'Udemyで実際の画面と同じ順番を確認し、Etsyへの1商品公開まで進めます。';
      link = 'udemy.html';
      label = 'Udemyを見る';
      plan = [
        'Etsy・Printify・Payoneerの準備状況を確認する',
        '公開する最初の商品案を1つ決める',
        '動画視聴と実作業の時間を予定に入れる',
        '画像・タイトル・説明文・タグをそろえる',
        'Printifyの商品、色、サイズ、配置を設定する',
        '送料・価格・権利・商品表示を確認する',
        'Etsyへ公開し、パソコンとスマホで表示を確認する',
      ];
    }
    result.querySelector('[data-result-title]').textContent = heading;
    result.querySelector('[data-result-text]').textContent = text;
    const planElement = result.querySelector('[data-result-plan]');
    planElement.innerHTML = plan.map((item, day) => `
      <div class="process-row"><span class="process-index">${day + 1}</span><div><strong>DAY ${day + 1}</strong><small>${item}</small></div><i class="check" data-lucide="calendar-check"></i></div>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
    const action = result.querySelector('[data-result-link]');
    action.href = link;
    action.textContent = label;
    quiz.hidden = true;
    result.classList.add('is-open');
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }

  options.addEventListener('click', (event) => {
    const button = event.target.closest('[data-option]');
    if (!button) return;
    answers[index] = Number(button.dataset.option);
    button.classList.add('is-selected');
    setTimeout(() => {
      index += 1;
      if (index < questions.length) render(); else showResult();
    }, 180);
  });

  render();
})();
