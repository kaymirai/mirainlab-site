const lab = document.querySelector(".product-lab");
const canvas = document.querySelector("[data-product-canvas]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = [];
let pointer = { x: 0.5, y: 0.5 };
const accent = "#1f6f5b";

const hexToRgba = (hex, alpha) => {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const resizeCanvas = () => {
  if (!canvas || !lab) return;

  const rect = lab.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor((rect.width + 44) * scale));
  canvas.height = Math.max(1, Math.floor((rect.height + 44) * scale));
};

const burstParticles = (count) => {
  if (!canvas) return;

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: canvas.width * (0.28 + Math.random() * 0.46),
      y: canvas.height * (0.22 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.2,
      life: 0.7 + Math.random() * 0.7,
      radius: 7 + Math.random() * 16,
    });
  }
};

const drawCanvas = () => {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(229, 100, 47, 0.1)");
  gradient.addColorStop(0.5, "rgba(31, 111, 91, 0.12)");
  gradient.addColorStop(1, "rgba(49, 90, 198, 0.1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

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
    ctx.fillStyle = hexToRgba(accent, Math.max(0, particle.life * 0.16));
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = `${accent}44`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const y = height * (0.24 + i * 0.2) + Math.sin(Date.now() / 1100 + i) * 10;
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
    burstParticles(18);
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
