
(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const endpoint = form.dataset.endpoint;
  const button = form.querySelector(".form-submit");
  const status = form.querySelector(".form-status");
  const pageUrl = form.querySelector('[name="page_url"]');
  const submittedAt = form.querySelector('[name="submitted_at"]');

  if (pageUrl) pageUrl.value = window.location.href;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    if (!endpoint) {
      status.textContent = "Submission endpoint is not configured.";
      status.className = "form-status error";
      return;
    }

    if (submittedAt) submittedAt.value = new Date().toISOString();

    const defaultText = button.dataset.default || button.textContent;
    button.disabled = true;
    button.textContent = button.dataset.sending || "Sending…";
    status.textContent = "Sending your message…";
    status.className = "form-status";

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new FormData(form)
      });
      form.reset();
      if (pageUrl) pageUrl.value = window.location.href;
      button.textContent = button.dataset.success || "Message sent ✓";
      status.textContent = form.dataset.success || "Thank you. Your message has been sent.";
      status.className = "form-status success";
    } catch (error) {
      button.textContent = defaultText;
      status.textContent = "The message could not be sent. Please use email or Telegram.";
      status.className = "form-status error";
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = defaultText;
      }, 2500);
    }
  });
})();
