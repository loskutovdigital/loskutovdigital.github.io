
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


// Interactive infinite metrics marquee used by every SEO page.
(() => {
  const metricsMarquee = document.getElementById('metricsMarquee');
  const metricsTrack = document.getElementById('metricsTrack');
  if (!metricsMarquee || !metricsTrack) return;

  const originalGroup = metricsTrack.querySelector('.metrics-group');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LOOP_DURATION_MS = 22000;

  let groupWidth = 0;
  let offsetX = 0;
  let autoSpeed = 0;
  let isHovered = false;
  let isDragging = false;
  let pointerId = null;
  let pointerType = '';
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let momentum = 0;
  let lastFrameTime = performance.now();
  let resizeFrame = 0;

  function wrapOffset() {
    if (!groupWidth) return;
    while (offsetX <= -groupWidth) offsetX += groupWidth;
    while (offsetX > 0) offsetX -= groupWidth;
  }
  function renderMetrics() {
    wrapOffset();
    metricsTrack.style.transform = `translate3d(${offsetX}px,0,0)`;
  }
  function rebuildCopies() {
    if (!originalGroup) return;
    const oldProgress = groupWidth
      ? (((-offsetX % groupWidth) + groupWidth) % groupWidth) / groupWidth
      : 0;
    Array.from(metricsTrack.children).slice(1).forEach(node => node.remove());
    groupWidth = originalGroup.getBoundingClientRect().width;
    if (!groupWidth) return;
    const copiesNeeded = Math.max(2, Math.ceil(metricsMarquee.clientWidth / groupWidth) + 2);
    for (let i = 1; i < copiesNeeded; i += 1) {
      const clone = originalGroup.cloneNode(true);
      clone.setAttribute('aria-hidden','true');
      metricsTrack.appendChild(clone);
    }
    autoSpeed = groupWidth / LOOP_DURATION_MS;
    offsetX = -oldProgress * groupWidth;
    renderMetrics();
  }
  function scheduleRebuild() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(rebuildCopies);
  }
  function animateMetrics(now) {
    const elapsed = Math.min(now - lastFrameTime, 50);
    lastFrameTime = now;
    if (!isDragging && groupWidth) {
      const mouseHoverPause = isHovered && pointerType !== 'touch';
      if (!mouseHoverPause && Math.abs(momentum) > 0.01) {
        offsetX += momentum * elapsed;
        momentum *= Math.pow(0.035, elapsed / 1000);
        if (Math.abs(momentum) <= 0.01) momentum = 0;
        renderMetrics();
      } else if (!mouseHoverPause && !reduceMotion.matches) {
        offsetX -= autoSpeed * elapsed;
        renderMetrics();
      }
    }
    requestAnimationFrame(animateMetrics);
  }
  metricsMarquee.addEventListener('mouseenter', () => { isHovered = true; });
  metricsMarquee.addEventListener('mouseleave', () => {
    isHovered = false;
    if (!isDragging) pointerType = '';
  });
  metricsMarquee.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    isDragging = true;
    pointerId = event.pointerId;
    pointerType = event.pointerType || 'mouse';
    lastPointerX = event.clientX;
    lastPointerTime = performance.now();
    momentum = 0;
    metricsMarquee.classList.add('is-dragging');
    metricsMarquee.setPointerCapture(pointerId);
    if (pointerType === 'mouse') event.preventDefault();
  });
  metricsMarquee.addEventListener('pointermove', event => {
    if (!isDragging || event.pointerId !== pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - lastPointerX;
    const deltaTime = Math.max(now - lastPointerTime, 1);
    offsetX += deltaX;
    momentum = deltaX / deltaTime;
    lastPointerX = event.clientX;
    lastPointerTime = now;
    renderMetrics();
    if (pointerType === 'mouse') event.preventDefault();
  });
  function endMetricsDrag(event) {
    if (!isDragging || event.pointerId !== pointerId) return;
    isDragging = false;
    metricsMarquee.classList.remove('is-dragging');
    if (metricsMarquee.hasPointerCapture(pointerId)) metricsMarquee.releasePointerCapture(pointerId);
    if (pointerType !== 'touch') momentum = 0;
    pointerId = null;
  }
  metricsMarquee.addEventListener('pointerup', endMetricsDrag);
  metricsMarquee.addEventListener('pointercancel', endMetricsDrag);
  metricsMarquee.addEventListener('lostpointercapture', event => {
    if (isDragging && event.pointerId === pointerId) {
      isDragging = false;
      momentum = 0;
      pointerId = null;
      metricsMarquee.classList.remove('is-dragging');
    }
  });
  metricsMarquee.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    offsetX += event.key === 'ArrowLeft' ? -80 : 80;
    momentum = 0;
    renderMetrics();
  });
  window.addEventListener('resize', scheduleRebuild, {passive:true});
  document.addEventListener('visibilitychange', () => { lastFrameTime = performance.now(); });
  rebuildCopies();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRebuild);
  requestAnimationFrame(animateMetrics);
})();
