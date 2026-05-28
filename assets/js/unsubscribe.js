(function () {
  const form = document.querySelector("#unsubscribe-form");
  const tokenInput = document.querySelector("#unsubscribe-token");
  const message = document.querySelector("#form-message");

  if (!form || !tokenInput || !message) return;

  const token = new URLSearchParams(window.location.search).get("token") || "";
  tokenInput.value = token;

  if (!token) {
    message.classList.add("error");
    message.textContent = "配信停止用の情報が見つかりません。メール本文のリンクから開いてください。";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.classList.remove("error");
    message.textContent = "処理しています...";

    const endpoint = form.dataset.endpoint;
    if (!endpoint || endpoint.includes("YOUR-PROJECT")) {
      message.classList.add("error");
      message.textContent = "配信停止URLが未設定です。Supabase Edge Function URLに差し替えてください。";
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "配信停止に失敗しました。");
      }
      message.textContent = result.message || "配信停止が完了しました。";
    } catch (error) {
      message.classList.add("error");
      message.textContent = error.message || "時間をおいて再度お試しください。";
    }
  });
})();
