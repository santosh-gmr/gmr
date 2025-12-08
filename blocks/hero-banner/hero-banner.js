/**
 * Hero Banner with robust anchor label extraction (checks nearby sibling text)
 */
export default function decorate(block) {
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  const rawSlides = Array.from(block.querySelectorAll(':scope > div'));
  const slideElements = rawSlides.filter((slide) => {
    const text = (slide.textContent || '').trim();
    const hasImage = !!slide.querySelector('img');
    const hasAnchor = slide.querySelectorAll('a').length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });
  if (slideElements.length === 0) return;

  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  // --- Helpers ---
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

  // Walk previous/next siblings and parents in the slide to find human text near the anchor
  function findNearbyLabel(a, slide) {
    // 1) Check previous/next element siblings of the anchor
    let el = a;
    for (let i = 0; i < 6; i++) { // limit steps to avoid excessive walking
      el = el.previousElementSibling;
      if (!el) break;
      if (el.matches && !el.matches('a')) {
        const t = (el.textContent || '').trim();
        if (t) return t;
      }
    }
    el = a;
    for (let i = 0; i < 6; i++) {
      el = el.nextElementSibling;
      if (!el) break;
      if (el.matches && !el.matches('a')) {
        const t = (el.textContent || '').trim();
        if (t) return t;
      }
    }

    // 2) Check the anchor's parent and nearby siblings of that parent
    let p = a.parentElement;
    let depth = 0;
    while (p && p !== slide && depth < 4) {
      // check previous siblings of parent
      let s = p.previousElementSibling;
      for (let i = 0; i < 6 && s; i++, s = s.previousElementSibling) {
        if (!s.matches('a')) {
          const t = (s.textContent || '').trim();
          if (t) return t;
        }
      }
      // check next siblings of parent
      s = p.nextElementSibling;
      for (let i = 0; i < 6 && s; i++, s = s.nextElementSibling) {
        if (!s.matches('a')) {
          const t = (s.textContent || '').trim();
          if (t) return t;
        }
      }
      p = p.parentElement;
      depth++;
    }

    // 3) Try common selectors in the slide for small text blocks (title/label regions)
    const candidateSelectors = ['.hero-cta-label','.cta-text','.cta-label','[data-cta]','[data-label]','div','span','p'];
    for (const sel of candidateSelectors) {
      const found = slide.querySelector(sel);
      if (found) {
        const t = (found.textContent || '').trim();
        if (t) return t;
      }
    }

    return '';
  }

  function getAnchorLabel(a, slide) {
    if (!a) return '';
    // 1) Visible text inside anchor
    const text = (a.textContent || '').trim();
    if (text) return text;
    // 2) aria-label
    const aria = (a.getAttribute && a.getAttribute('aria-label')) || '';
    if (aria && aria.trim()) return aria.trim();
    // 3) title attribute
    const title = a.title || '';
    if (title.trim()) return title.trim();
    // 4) data- attributes (data-label, data-cta)
    if (a.dataset) {
      const dl = a.dataset.label || a.dataset.cta || a.dataset.ctalabel;
      if (dl && dl.trim()) return dl.trim();
    }
    // 5) aria-labelledby -> referenced element text
    const labelled = a.getAttribute && a.getAttribute('aria-labelledby');
    if (labelled) {
      const ref = document.getElementById(labelled);
      if (ref) {
        const rt = (ref.textContent || '').trim();
        if (rt) return rt;
      }
    }
    // 6) image alt inside anchor (image-only anchor)
    const img = a.querySelector && a.querySelector('img');
    const alt = img?.alt || '';
    if (alt.trim()) return alt.trim();

    // 7) Nearby sibling/parent slide text (this is the new important step)
    const nearby = findNearbyLabel(a, slide);
    if (nearby) return nearby;

    // 8) Fallback: friendly label from href (short)
    return friendlyLabelFromHref(a.href || '');
  }

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

  // Build slides
  slideElements.forEach((slide, index) => {
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

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
      watchLink = a2.href || '#';
      knowLabel = getAnchorLabel(a1, slide) || knowLabel;
      watchLabel = getAnchorLabel(a2, slide) || watchLabel;
    } else if (anchors.length === 1) {
      const a = anchors[0];
      const txtLower = (a.textContent || '').trim().toLowerCase();
      const href = a.href || '#';
      if (txtLower.includes('watch')) {
        watchLink = href;
        watchLabel = getAnchorLabel(a, slide) || watchLabel;
        const maybeKnow = parts[3]?.textContent?.trim();
        if (maybeKnow) knowLabel = maybeKnow;
      } else {
        knowLink = href;
        knowLabel = getAnchorLabel(a, slide) || knowLabel;
        const maybeWatch = parts[5]?.textContent?.trim();
        if (maybeWatch) watchLabel = maybeWatch;
      }
    } else {
      const maybeKnow = parts[3]?.textContent?.trim();
      const maybeKnowHref = parts[4]?.querySelector('a')?.href;
      const maybeWatch = parts[5]?.textContent?.trim();
      const maybeWatchHref = parts[6]?.querySelector('a')?.href;
      if (maybeKnow) knowLabel = maybeKnow;
      if (maybeKnowHref) knowLink = maybeKnowHref;
      if (maybeWatch) watchLabel = maybeWatch;
      if (maybeWatchHref) watchLink = maybeWatchHref;
    }

    // Render slide (Know More first)
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

  // Controls (unchanged)
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

  // Carousel behavior
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
