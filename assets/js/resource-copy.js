(function () {
  const buttons = document.querySelectorAll("[data-copy-target]");
  if (!buttons.length) return;

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  buttons.forEach((button) => {
    const originalLabel = button.textContent;

    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      try {
        await copyText(target.textContent.trim());
        button.textContent = "コピーしました";
        window.setTimeout(() => {
          button.textContent = originalLabel;
        }, 1800);
      } catch (error) {
        button.textContent = "コピーできません";
        window.setTimeout(() => {
          button.textContent = originalLabel;
        }, 1800);
      }
    });
  });
})();
