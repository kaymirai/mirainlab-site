const lab = document.querySelector(".product-lab");
const canvas = document.querySelector("[data-product-canvas]");
const productButtons = document.querySelectorAll(".idea-chip");
const productArt = document.querySelector("[data-product-art]");
const productLabel = document.querySelector("[data-product-label]");
const productTitle = document.querySelector("[data-product-title]");
const productBody = document.querySelector("[data-product-body]");
const productTagOne = document.querySelector("[data-product-tag-one]");
const productTagTwo = document.querySelector("[data-product-tag-two]");
const productTagThree = document.querySelector("[data-product-tag-three]");
const productNote = document.querySelector("[data-product-note]");
const processSteps = document.querySelectorAll(".process-steps li");

const productCopy = {
  botanical: {
    accent: "#1f6f5b",
    label: "Research seed",
    title: "植物好き向けのマグ案",
    body: "季節イベント、検索語、参考画像から、真似ではない方向性へ落とし込みます。",
    tags: ["botanical", "gift idea", "mug mockup"],
    note: "まずは買う人と使う場面を絞り、商品化しやすい形へ整理します。",
  },
  teacher: {
    accent: "#315ac6",
    label: "Listing draft",
    title: "先生向けギフトの出品案",
    body: "贈る相手、季節、短いフレーズを組み合わせて、タイトルと画像の方向性を決めます。",
    tags: ["teacher gift", "season", "title"],
    note: "出品文はキーワードだけでなく、誰がなぜ買うかまで揃えます。",
  },
  dog: {
    accent: "#bb8527",
    label: "Improve loop",
    title: "犬好き向けTシャツの改善案",
    body: "クリックされる画像、読みやすい文字、避ける表現を確認して、次の修正に絞ります。",
    tags: ["dog mom", "readability", "next fix"],
    note: "反応が弱い時は、画像、検索語、商品説明のどこで止まっているかを見ます。",
  },
};

let activeProduct = "botanical";
let activeStep = 0;
let particles = [];
let pointer = { x: 0.5, y: 0.5 };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hexToRgba = (hex, alpha) => {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const setProduct = (key) => {
  const next = productCopy[key];
  if (!next) return;

  activeProduct = key;
  productLabel.textContent = next.label;
  productTitle.textContent = next.title;
  productBody.textContent = next.body;
  productTagOne.textContent = next.tags[0];
  productTagTwo.textContent = next.tags[1];
  productTagThree.textContent = next.tags[2];
  productNote.textContent = next.note;
  productArt.style.setProperty("--product-accent", next.accent);

  productButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.product === key);
  });

  burstParticles(10, next.accent);
};

const setStep = (index) => {
  activeStep = index % processSteps.length;
  processSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === activeStep);
  });
};

productButtons.forEach((button) => {
  button.addEventListener("click", () => setProduct(button.dataset.product));
});

processSteps.forEach((step) => {
  step.addEventListener("click", () => setStep(Number(step.dataset.step)));
});

const resizeCanvas = () => {
  if (!canvas || !lab) return;

  const rect = lab.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor((rect.width + 44) * scale));
  canvas.height = Math.max(1, Math.floor((rect.height + 44) * scale));
};

const burstParticles = (count, color) => {
  if (!canvas) return;

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: canvas.width * (0.28 + Math.random() * 0.46),
      y: canvas.height * (0.22 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.2,
      life: 0.7 + Math.random() * 0.7,
      radius: 7 + Math.random() * 16,
      color,
    });
  }
};

const drawCanvas = () => {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(229, 100, 47, 0.12)");
  gradient.addColorStop(0.5, "rgba(31, 111, 91, 0.12)");
  gradient.addColorStop(1, "rgba(49, 90, 198, 0.12)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const accent = productCopy[activeProduct].accent;
  particles = particles
    .map((particle) => {
      const pullX = (pointer.x * width - particle.x) * 0.0007;
      const pullY = (pointer.y * height - particle.y) * 0.0007;
      return {
        ...particle,
        x: particle.x + particle.vx + pullX,
        y: particle.y + particle.vy + pullY,
        vx: particle.vx * 0.992,
        vy: particle.vy * 0.992,
        life: particle.life - 0.006,
        radius: particle.radius + 0.025,
      };
    })
    .filter((particle) => particle.life > 0);

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(particle.color, Math.max(0, particle.life * 0.16));
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = `${accent}44`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const y = height * (0.18 + i * 0.18) + Math.sin(Date.now() / 1100 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, y);
    ctx.bezierCurveTo(width * 0.32, y - 42, width * 0.58, y + 42, width * 0.92, y - 6);
    ctx.stroke();
  }

  window.requestAnimationFrame(drawCanvas);
};

if (canvas && lab) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  if (!reduceMotion) {
    burstParticles(18, productCopy[activeProduct].accent);
    lab.addEventListener("pointermove", (event) => {
      const rect = lab.getBoundingClientRect();
      pointer = {
        x: (event.clientX - rect.left) / Math.max(1, rect.width),
        y: (event.clientY - rect.top) / Math.max(1, rect.height),
      };
    });
    drawCanvas();
  }
}

if (!reduceMotion) {
  window.setInterval(() => {
    setStep(activeStep + 1);
  }, 1800);
}
