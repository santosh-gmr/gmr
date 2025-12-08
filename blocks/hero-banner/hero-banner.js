/**
 * Restored original mapping (parts[3] = know label, parts[4] = know link)
 * + fixes slide collection bug and ensures label precedence (label text first, href only if no label)
 */
export default function decorate(block) {
  // --- Prevent double-init & author placeholder ---
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // --- Collect slides correctly (fixed) ---
  const slideElements = Array.from(block.children).filter((slide) => {
    const text = (slide.innerText || '').trim();
    const hasImage = !!slide.querySelector('img');
    // keep slides that contain text, images or anchors
    const hasAnchor = slide.querySelectorAll('a').length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });

  if (slideElements.length === 0) return;

  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  function friendlyLabelFromHref(href) {
    if (!href) return '';
    try {
      const u = new URL(href, location.origin);
      const last = u.pathname.split('/').filter(Boolean).pop();
      return last ? decodeURIComponent(last.replace(/[-_]/g, ' ')) : u.hostname;
    } catch (e) {
      return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  function getAnchorPreferText(a) {
    if (!a) return '';
    // visible text
    const text = (a.textContent || '').trim();
    if (text) return text;
    // aria-label/title
    const aria = a.getAttribute && a.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
    if (a.title && a.title.trim()) return a.title.trim();
    // image alt
    const img = a.querySelector && a.querySelector('img');
    if (img?.alt && img.alt.trim()) return img.alt.trim();
    // fallback to href-derived friendly text
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
    const imgElement = parts[2]?.querySelector('img') || slide.querySelector('img');
    const bgImg = imgElement?.src || '';

    // AEM mapping: label is often in parts[3] and the link in parts[4]
    const knowLabelFromPart = parts[3]?.textContent?.trim() || '';
    const knowAnchor = parts[4]?.querySelector('a') || slide.querySelector('a');
    const knowHref = knowAnchor?.href || '#';

    // Watch video mapping (legacy positions)
    const watchLabelFromPart = parts[5]?.textContent?.trim() || '';
    const watchAnchor = parts[6]?.querySelector('a') || null;
    const watchHref = watchAnchor?.href || (watchAnchor ? watchAnchor.href : '#');

    // Decide final label — priority: authored label (parts[3]) -> anchor text -> aria/title/alt -> href-friendly
    const knowLabel = knowLabelFromPart
      || (knowAnchor ? getAnchorPreferText(knowAnchor) : '')
      || 'Know More';

    const watchLabel = watchLabelFromPart
      || (watchAnchor ? getAnchorPreferText(watchAnchor) : '')
      || 'Watch Video';

    // Render slide with Know More first (keeps CSS order)
    slide.style.backgroundImage = bgImg ? `url('${bgImg}')` : '';
    slide.innerHTML = `
      <div class="hero-slide-content">
        ${title ? `<h2 class="hero-title">${escapeHtml(title)}</h2>` : ''}
        ${description ? `<p class="hero-description">${escapeHtml(description)}</p>` : ''}
        <div class="hero-cta-group">
          <a href="${escapeAttr(knowHref)}" class="hero-btn primary">${escapeHtml(knowLabel)}</a>
          <a href="${escapeAttr(watchHref)}" class="hero-btn secondary">${escapeHtml(watchLabel)}</a>
        </div>
      </div>
    `;
    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Controls (same as original)
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

  // Carousel behavior (kept minimal & original)
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
  updateCarousel();
  startAutoplay();

  // cleanup observer
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.removedNodes.forEach((n) => { if (n === block) { stopAutoplay(); observer.disconnect(); } } ));
    });
    observer.observe(block.parentElement, { childList: true, subtree: true });
  }

  // small helpers for safe output
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }
  function escapeAttr(s) {
    if (!s) return '#';
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
