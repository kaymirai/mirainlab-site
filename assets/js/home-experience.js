(function () {
  const canvas = document.querySelector("#lab-flow-canvas");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const hero = canvas.closest(".hero-lab");
  const pointer = { x: 0.68, y: 0.34, active: false };
  const particles = Array.from({ length: 36 }, (_, index) => ({
    x: (index % 9) / 8,
    y: Math.floor(index / 9) / 4 + 0.08,
    phase: index * 0.47,
    radius: 1.2 + (index % 4) * 0.7,
  }));

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = null;
  let isVisible = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCurve(time, offset, color, lineWidth) {
    ctx.beginPath();
    for (let i = 0; i <= 80; i += 1) {
      const t = i / 80;
      const influence = pointer.active ? (pointer.y - 0.5) * 34 : 0;
      const wave = Math.sin(t * Math.PI * 2 + time * 0.0007 + offset) * 18;
      const x = t * width;
      const y = height * (0.26 + offset * 0.08) + wave + influence * (1 - Math.abs(t - pointer.x));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255, 243, 226, 0.82)");
    gradient.addColorStop(0.48, "rgba(234, 244, 239, 0.78)");
    gradient.addColorStop(1, "rgba(230, 237, 248, 0.88)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawCurve(time, 0.3, "rgba(31, 111, 91, 0.28)", 2);
    drawCurve(time, 1.55, "rgba(229, 100, 47, 0.22)", 1.5);
    drawCurve(time, 2.8, "rgba(49, 90, 198, 0.18)", 1.25);

    particles.forEach((particle) => {
      const drift = Math.sin(time * 0.001 + particle.phase);
      const pull = pointer.active ? 1 - Math.min(1, Math.hypot(particle.x - pointer.x, particle.y - pointer.y) * 2.2) : 0;
      const x = particle.x * width + drift * 8 + pull * 22;
      const y = particle.y * height + Math.cos(time * 0.0012 + particle.phase) * 6 - pull * 14;
      ctx.beginPath();
      ctx.arc(x, y, particle.radius + pull * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(31, 111, 91, ${0.16 + pull * 0.22})`;
      ctx.fill();
    });

    frameId = requestAnimationFrame(render);
  }

  function start() {
    if (frameId || document.hidden || !isVisible) return;
    frameId = requestAnimationFrame(render);
  }

  function stop() {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }

  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) start();
        else stop();
      },
      { threshold: 0.08 }
    ).observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();
