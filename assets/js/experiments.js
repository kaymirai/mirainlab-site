const motionSections = document.querySelectorAll(
  ".parallax-lab, .tunnel-lab, .zoom-lab"
);

const updateScrollProgress = () => {
  const viewportHeight = window.innerHeight || 1;

  motionSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const range = rect.height + viewportHeight;
    const raw = (viewportHeight - rect.top) / range;
    const progress = Math.min(1, Math.max(0, raw));

    section.style.setProperty("--scroll-progress", progress.toFixed(3));
  });
};

let ticking = false;

const requestScrollUpdate = () => {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollProgress();
    ticking = false;
  });
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollProgress();

const morphCopy = {
  start: {
    label: "Start",
    title: "まずは全体像と道具を整理",
    body: "アカウント、受注生産型の商品販売サービス、初期費用、最初のリサーチ手順を短く固めます。",
  },
  listing: {
    label: "Listing",
    title: "商品ページを出せる形にする",
    body: "タイトル、タグ、画像、価格、配送まわりを一つずつ確認して、初回出品まで進めます。",
  },
  improve: {
    label: "Improve",
    title: "反応を見て改善の順番を決める",
    body: "アクセス、クリック、保存、購入のどこで止まっているかを見て、次の一手へ絞ります。",
  },
};

const morphCard = document.querySelector(".morph-card");
const morphLabel = document.querySelector(".morph-label");
const morphTitle = document.querySelector(".morph-card h3");
const morphBody = document.querySelector(".morph-card p");
const morphTabs = document.querySelectorAll(".morph-tab");

const updateMorph = (state) => {
  const next = morphCopy[state];
  if (!next) return;

  const apply = () => {
    morphCard.dataset.state = state;
    morphLabel.textContent = next.label;
    morphTitle.textContent = next.title;
    morphBody.textContent = next.body;
  };

  if (document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
  }

  morphTabs.forEach((tab) => {
    const selected = tab.dataset.state === state;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
};

morphTabs.forEach((tab) => {
  tab.addEventListener("click", () => updateMorph(tab.dataset.state));
});
