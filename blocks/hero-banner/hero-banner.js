/**
 * Robust Hero Banner decorator
 * - includes slides that only contain anchors
 * - uses anchor text for button labels (fallback friendly label if no text)
 */
export default function decorate(block) {
  // prevent double-init
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // Collect slides: direct child divs (legacy); tolerant of empty nodes
  const rawSlides = Array.from(block.querySelectorAll(':scope > div'));

  // Keep slides that have at least one visible thing: text, image, or anchors
  const slideElements = rawSlides.filter((slide) => {
    const text = slide.textContent?.trim() || "";
    const hasImage = !!slide.querySelector("img");
    const hasAnchor = slide.querySelectorAll("a").length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });

  if (slideElements.length === 0) return;

  // create carousel elements
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  slideElements.forEach((slide, index) => {
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

    // read expected parts but be tolerant
    const parts = slide.querySelectorAll(':scope > div');
    const title = parts[0]?.textContent?.trim() || '';
    const description = parts[1]?.textContent?.trim() || '';
    const imgEl = (parts[2] && parts[2].querySelector('img')) || slide.querySelector('img');
    const bgImg = imgEl?.src || '';

    // anchors handling - preserve author order
    const anchors = Array.from(slide.querySelectorAll('a'));

    // helper: friendly label if anchor has no text
    const friendlyLabelFromHref = (href) => {
      if (!href) return '';
      try {
        const u = new URL(href, location.origin);
        // prefer pathname/final part or hostname
        const last = u.pathname.split('/').filter(Boolean).pop();
        return last ? decodeURIComponent(last.replace(/[-_]/g, ' ')) : u.hostname;
      } catch (e) {
        // fallback: strip protocol for short display
        return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    };

    let knowLabel = 'Know More';
    let knowLink = '#';
    let watchLabel = 'Watch Video';
    let watchLink = '#';

    if (anchors.length >= 2) {
      const a1 = anchors[0];
      const a2 = anchors[1];

      knowLink = a1.href || '#';
      knowLabel = (a1.textContent || '').trim() || friendlyLabelFromHref(knowLink) || knowLabel;

      watchLink = a2.href || '#';
      watchLabel = (a2.textContent || '').trim() || friendlyLabelFromHref(watchLink) || watchLabel;
    } else if (anchors.length === 1) {
      const a = anchors[0];
      const txt = (a.textContent || '').trim().toLowerCase();
      const href = a.href || '#';

      if (txt.includes('watch')) {
        watchLink = href;
        watchLabel = (a.textContent || '').trim() || friendlyLabelFromHref(href) || watchLabel;
        // try to find know label in nearby text nodes or parts
        const maybeKnow = parts[3]?.textContent?.trim() || '';
        if (maybeKnow) knowLabel = maybeKnow;
      } else {
        knowLink = href;
        knowLabel = (a.textContent || '').trim() || friendlyLabelFromHref(href) || knowLabel;
        const maybeWatch = parts[5]?.textContent?.trim() || '';
        if (maybeWatch) watchLabel = maybeWatch;
      }
    } else {
      // no anchors: try legacy parts mapping
      const maybeKnow = parts[3]?.textContent?.trim();
      const maybeKnowHref = parts[4]?.querySelector('a')?.href;
      const maybeWatch = parts[5]?.textContent?.trim();
      const maybeWatchHref = parts[6]?.querySelector('a')?.href;

      if (maybeKnow) knowLabel = maybeKnow;
      if (maybeKnowHref) knowLink = maybeKnowHref;
      if (maybeWatch) watchLabel = maybeWatch;
      if (maybeWatchHref) watchLink = maybeWatchHref;
    }

    // ensure we use text content for labels (important): do not insert raw href text
    const safeKnowLabel = escapeHtml(knowLabel);
    const safeWatchLabel = escapeHtml(watchLabel);

    // render slide preserving Know More first
    slide.style.backgroundImage = bgImg ? `url('${bgImg}')` : '';
    slide.innerHTML = `
      <div class="hero-slide-content">
        ${title ? `<h2 class="hero-title">${escapeHtml(title)}</h2>` : ''}
        ${description ? `<p class="hero-description">${escapeHtml(description)}</p>` : ''}
        <div class="hero-cta-group">
          <a href="${escapeAttr(knowLink)}" class="hero-btn primary" data-link-type="know">${safeKnowLabel}</a>
          <a href="${escapeAttr(watchLink)}" class="hero-btn secondary" data-link-type="watch">${safeWatchLabel}</a>
        </div>
      </div>
    `;
    track.appendChild(slide);
  });

  wrapper.appendChild(track);

  // controls (same as before)
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Carousel controls');
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">01 / ${String(slideElements.length).padStart(2, '0')}</div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  wrapper.appendChild(controls);

  // replace block contents
  block.innerHTML = '';
  block.appendChild(wrapper);

  // carousel behavior (same basic implementation)
  let currentSlide = 0;
  let autoplayInterval = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slideElements.length).padStart(2, '0')}`;
    }
    track.querySelectorAll('.hero-slide').forEach((s, i) => {
      s.setAttribute('aria-hidden', String(i !== currentSlide));
    });
  }

  function prevSlide() {
    currentSlide = currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1;
    updateCarousel();
  }

  function nextSlide() {
    currentSlide = currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
  }

  function stopAutoplay(){ if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; } }
  function startAutoplay(){ stopAutoplay(); autoplayInterval = setInterval(nextSlide, 5000); }

  controls.querySelector('.hero-prev')?.addEventListener('click', () => { prevSlide(); stopAutoplay(); });
  controls.querySelector('.hero-next')?.addEventListener('click', () => { nextSlide(); stopAutoplay(); });

  wrapper.addEventListener('mouseenter', stopAutoplay);
  wrapper.addEventListener('mouseleave', startAutoplay);
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prevSlide(); stopAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); }
  });

  // touch support
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  wrapper.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); stopAutoplay(); }
  }, { passive: true });

  updateCarousel();
  startAutoplay();

  // cleanup observer (optional)
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.removedNodes.forEach((n) => { if (n === block) { stopAutoplay(); observer.disconnect(); } }));
    });
    observer.observe(block.parentElement, { childList: true, subtree: true });
  }

  // --- helpers ---
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }
  function escapeAttr(s) {
    if (!s) return '#';
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
