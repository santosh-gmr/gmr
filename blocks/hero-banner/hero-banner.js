/**
 * Hero Banner - final anchor-label fix for AEM-authoring pattern
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

  // helpers
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

  // Try to get visible text from anchor or due AEM pattern (label in sibling part)
  function resolveLabelForAnchor(a, slide) {
    if (!a) return '';
    // 1) visible text
    const txt = (a.textContent || '').trim();
    if (txt) return txt;
    // 2) aria / title / data attrs / img alt
    const aria = a.getAttribute && a.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
    if (a.title && a.title.trim()) return a.title.trim();
    if (a.dataset) {
      const d = a.dataset.label || a.dataset.cta || a.dataset.ctalabel;
      if (d && d.trim()) return d.trim();
    }
    const img = a.querySelector && a.querySelector('img');
    if (img && img.alt && img.alt.trim()) return img.alt.trim();

    // 3) AEM-style parts mapping:
    // Find the direct child parts of the slide (AEM often outputs label as parts[3] and anchor as parts[4])
    const parts = Array.from(slide.querySelectorAll(':scope > div'));
    if (parts.length) {
      // find which part contains this anchor
      const anchorPartIndex = parts.findIndex((p) => p.contains(a));
      if (anchorPartIndex !== -1) {
        // check prior parts for text (n-1, n-2)
        for (let delta = 1; delta <= 3; delta++) {
          const idx = anchorPartIndex - delta;
          if (idx >= 0) {
            const candidate = (parts[idx].textContent || '').trim();
            if (candidate) return candidate;
          }
        }
        // also check next parts (n+1, n+2) just in case
        for (let delta = 1; delta <= 2; delta++) {
          const idx = anchorPartIndex + delta;
          if (idx < parts.length) {
            const candidate = (parts[idx].textContent || '').trim();
            if (candidate) return candidate;
          }
        }
      } else {
        // anchor not inside a direct part (maybe nested), still try common nearby indexes:
        // try parts[3], parts[4], parts[5] which often hold labels/links in AEM
        const candidatesIdx = [3,4,5,6];
        for (const ci of candidatesIdx) {
          if (ci < parts.length) {
            const candidate = (parts[ci].textContent || '').trim();
            if (candidate) return candidate;
          }
        }
      }
    }

    // 4) fallback: friendly href-derived label (short)
    return friendlyLabelFromHref(a.href || '');
  }

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

    const anchors = Array.from(slide.querySelectorAll('a'));

    let knowLabel = 'Know More';
    let knowLink = '#';
    let watchLabel = 'Watch Video';
    let watchLink = '#';

    if (anchors.length >= 2) {
      const a1 = anchors[0], a2 = anchors[1];
      knowLink = a1.href || '#';
      watchLink = a2.href || '#';
      knowLabel = resolveLabelForAnchor(a1, slide) || knowLabel;
      watchLabel = resolveLabelForAnchor(a2, slide) || watchLabel;
    } else if (anchors.length === 1) {
      const a = anchors[0];
      const href = a.href || '#';
      const lower = (a.textContent || '').trim().toLowerCase();
      if (lower.includes('watch')) {
        watchLink = href;
        watchLabel = resolveLabelForAnchor(a, slide) || watchLabel;
        const maybeKnow = parts[3]?.textContent?.trim();
        if (maybeKnow) knowLabel = maybeKnow;
      } else {
        knowLink = href;
        knowLabel = resolveLabelForAnchor(a, slide) || knowLabel;
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

    // Render and preserve Know More first
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

  block.innerHTML = '';
  block.appendChild(carouselWrapper);

  // basic carousel logic (unchanged)
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

  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.removedNodes.forEach((n) => { if (n === block) { stopAutoplay(); observer.disconnect(); } } ));
    });
    observer.observe(block.parentElement, { childList: true, subtree: true });
  }
}
