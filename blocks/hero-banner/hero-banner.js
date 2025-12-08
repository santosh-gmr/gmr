/**
 * Robust Hero Banner decorator
 * - Fixes slide collection bug
 * - Uses anchor text for button labels; friendly fallback if empty
 * - Accepts slides that only contain anchors
 */
export default function decorate(block) {
  // Prevent double-init
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // Collect direct child slide DIVs
  const rawSlides = Array.from(block.querySelectorAll(':scope > div'));

  // Keep slides that have at least one visible thing: text, image, or anchors
  const slideElements = rawSlides.filter((slide) => {
    const text = (slide.textContent || '').trim();
    const hasImage = !!slide.querySelector('img');
    const hasAnchor = slide.querySelectorAll('a').length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });

  if (slideElements.length === 0) return;

  // Create carousel DOM
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  // Helper: produce friendly label from href if anchor has no text
  function friendlyLabelFromHref(href) {
    if (!href) return '';
    try {
      const u = new URL(href, location.origin);
      const last = u.pathname.split('/').filter(Boolean).pop();
      if (last) return decodeURIComponent(last.replace(/[-_]/g, ' '));
      return u.hostname;
    } catch (e) {
      return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  // Helpers to escape content safely
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
  }
  function escapeAttr(s) {
    if (!s) return '#';
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  slideElements.forEach((slide, index) => {
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

    // Try legacy parts but be tolerant
    const parts = slide.querySelectorAll(':scope > div');
    const title = parts[0]?.textContent?.trim() || '';
    const description = parts[1]?.textContent?.trim() || '';
    const possibleImg = (parts[2] && parts[2].querySelector('img')) || slide.querySelector('img');
    const bgImg = possibleImg?.src || '';

    // Gather anchors preserving author order
    const anchors = Array.from(slide.querySelectorAll('a'));

    // Default labels and links
    let knowLabel = 'Know More';
    let knowLink = '#';
    let watchLabel = 'Watch Video';
    let watchLink = '#';

    if (anchors.length >= 2) {
      const a1 = anchors[0], a2 = anchors[1];
      knowLink = a1.href || '#';
      knowLabel = (a1.textContent || '').trim() || friendlyLabelFromHref(knowLink) || knowLabel;
      watchLink = a2.href || '#';
      watchLabel = (a2.textContent || '').trim() || friendlyLabelFromHref(watchLink) || watchLabel;
    } else if (anchors.length === 1) {
      const a = anchors[0];
      const txt = (a.textContent || '').trim().toLowerCase();
      const href = a.href || '#';
      // If anchor text contains 'watch' assume it's the watch button, else know
      if (txt.includes('watch')) {
        watchLink = href;
        watchLabel = (a.textContent || '').trim() || friendlyLabelFromHref(href) || watchLabel;
        // try to read know label from parts (legacy)
        const maybeKnow = parts[3]?.textContent?.trim();
        if (maybeKnow) knowLabel = maybeKnow;
      } else {
        knowLink = href;
        knowLabel = (a.textContent || '').trim() || friendlyLabelFromHref(href) || knowLabel;
        const maybeWatch = parts[5]?.textContent?.trim();
        if (maybeWatch) watchLabel = maybeWatch;
      }
    } else {
      // No anchors: fallback to legacy parts mapping if present
      const maybeKnow = parts[3]?.textContent?.trim();
      const maybeKnowHref = parts[4]?.querySelector('a')?.href;
      const maybeWatch = parts[5]?.textContent?.trim();
      const maybeWatchHref = parts[6]?.querySelector('a')?.href;
      if (maybeKnow) knowLabel = maybeKnow;
      if (maybeKnowHref) knowLink = maybeKnowHref;
      if (maybeWatch) watchLabel = maybeWatch;
      if (maybeWatchHref) watchLink = maybeWatchHref;
    }

    // Render slide (Know More first to preserve visual order)
    slide.style.backgroundImage = bgImg ? `url('${bgImg}')` : '';
    slide.innerHTML = `
      <div class="hero-slide-content">
        ${title ? `<h2 class="hero-title">${escapeHtml(title)}</h2>` : ''}
        ${description ? `<p class="hero-description">${escapeHtml(description)}</p>` : ''}
        <div class="hero-cta-group">
          <a href="${escapeAttr(knowLink)}" class="hero-btn primary" data-link-type="know">${escapeHtml(knowLabel)}</a>
          <a href="${escapeAttr(watchLink)}" class="hero-btn secondary" data-link-type="watch">${escapeHtml(watchLabel)}</a>
        </div>
      </div>
    `;
    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Carousel controls');
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">01 / ${String(slideElements.length).padStart(2, '0')}</div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  carouselWrapper.appendChild(controls);

  // Replace block contents
  block.innerHTML = '';
  block.appendChild(carouselWrapper);

  // Carousel behavior (same as before)
  let currentSlide = 0;
  let autoplayInterval = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slideElements.length).padStart(2, '0')}`;
    }
    track.querySelectorAll('.hero-slide').forEach((s, i) => s.setAttribute('aria-hidden', String(i !== currentSlide)));
  }

  function prevSlide() { currentSlide = currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1; updateCarousel(); }
  function nextSlide() { currentSlide = currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1; updateCarousel(); }
  function stopAutoplay() { if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; } }
  function startAutoplay() { stopAutoplay(); autoplayInterval = setInterval(nextSlide, 5000); }

  controls.querySelector('.hero-prev')?.addEventListener('click', () => { prevSlide(); stopAutoplay(); });
  controls.querySelector('.hero-next')?.addEventListener('click', () => { nextSlide(); stopAutoplay(); });

  carouselWrapper.addEventListener('mouseenter', stopAutoplay);
  carouselWrapper.addEventListener('mouseleave', startAutoplay);
  carouselWrapper.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { prevSlide(); stopAutoplay(); } if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); } });

  // touch support
  let touchStartX = 0;
  carouselWrapper.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  carouselWrapper.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); stopAutoplay(); }
  }, { passive: true });

  updateCarousel();
  startAutoplay();

  // cleanup observer
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.removedNodes.forEach((n) => { if (n === block) { stopAutoplay(); observer.disconnect(); } } ));
    });
    observer.observe(block.parentElement, { childList: true, subtree: true });
  }
}
