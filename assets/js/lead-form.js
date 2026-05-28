(function () {
  const form = document.querySelector("#lead-form");
  const message = document.querySelector("#form-message");

  if (!form || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.classList.remove("error");
    message.textContent = "送信しています...";

    const endpoint = form.dataset.endpoint;
    if (!endpoint || endpoint.includes("YOUR-PROJECT")) {
      message.classList.add("error");
      message.textContent = "送信先URLが未設定です。Supabase Edge Function URLに差し替えてください。";
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.marketing_consent = formData.get("marketing_consent") === "yes";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "送信に失敗しました。");
      }

      form.reset();
      message.textContent = result.message || "登録が完了しました。メールをご確認ください。";
    } catch (error) {
      message.classList.add("error");
      message.textContent = error.message || "時間をおいて再度お試しください。";
    }
  });
})();
