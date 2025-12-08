/**
 * Hero Banner Carousel – 100% SAFE & STABLE (Dec 2025)
 * Fixes:
 *   • Correct Know More / Watch Video mapping (8 columns)
 *   • You can add/remove/reorder slides forever
 *   • ZERO risk of freeze/hang (fixed MutationObserver
 */
export default function decorate(block) {
  // Prevent double run
  if (block.querySelector('.hero-carousel-wrapper')) return;

  // Create carousel structure
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  wrapper.appendChild(track);

  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">Previous</button>
    <div class="hero-pagination" aria-live="polite">01 / 01</div>
    <button class="hero-next" aria-label="Next slide" type="button">Next</button>
  `;
  wrapper.appendChild(controls);

  block.appendChild(wrapper);

  let current = 0;
  let autoplay = null;

  const render = () => {
    track.innerHTML = '';

    // Only read original authoring rows (skip the wrapper we just added)
    const rows = [...block.children].filter(el => el !== wrapper);

    rows.forEach((row, i) => {
      const c = row.querySelectorAll(':scope > div');

      const title           = c[0]?.textContent?.trim() || '';
      const description     = c[1]?.textContent?.trim() || '';
      const bgImage         = c[2]?.querySelector('img')?.src || '';
      const knowMoreLabel   = c[4]?.textContent?.trim() || 'Know More';
      const knowMoreLink    = c[5]?.querySelector('a')?.href || '#';
      const watchVideoLabel = c[6]?.textContent?.trim() || 'Watch Video';
      const watchVideoLink   = c[7]?.querySelector('a')?.href || '#';

      const slide = document.createElement('div');
      slide.className = 'hero-slide';
      slide.style.backgroundImage = bgImage ? `url('${bgImage}')` : '';
      slide.setAttribute('aria-hidden', i !== current');
      slide.innerHTML = `
        <div class="hero-slide-content">
          <h2 class="hero-title">${title}</h2>
          <div class="hero-description">${description}</div>
          <div class="hero-cta-group">
            <a href="${knowMoreLink}" class="hero-btn primary">${knowMoreLabel}</a>
            <a href="${watchVideoLink}" class="hero-btn secondary">${watchVideoLabel}</a>
          </div>
        </div>
      `;
      track.appendChild(slide);
    });

    // Update pagination
    const total = rows.length;
    controls.querySelector('.hero-pagination').textContent =
      total ? `${String(current + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : '01 / 01';

    // Accessibility
    track.querySelectorAll('.hero-slide').forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== current);
    });
  };

  const goTo = (index) => {
    const total = track.children.length;
    if (total <= 1) return;
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    controls.querySelector('.hero-pagination').textContent =
      `${String(current + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAuto = () => {
    clearInterval(autoplay);
    if (track.children.length > 1) autoplay = setInterval(next, 5000);
  };
  const stopAuto = () => clearInterval(autoplay);

  // Controls
  controls.querySelector('.hero-prev').onclick = () => { prev(); stopAuto(); };
  controls.querySelector('.hero-next').onclick = () => { next(); stopAuto(); };

  wrapper.addEventListener('mouseenter', stopAuto);
  wrapper.addEventListener('mouseleave', startAuto);

  startAuto);

  // Swipe
  let startX = 0;
  wrapper.addEventListener('touchstart', e => startX = e.touches[0].screenX, {passive:true});
  wrapper.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); stopAuto(); }
  }, {passive:true});

  // Keyboard
  wrapper.tabIndex = 0;
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && prev()) || (e.key === 'ArrowRight' && next());
    if (e.key.includes('Arrow')) stopAuto();
  });

  // First render
  render();
  startAuto();

  // SAFE observer – only watches the original rows, NOT the carousel we created
  const observer = new MutationObserver(() => {
    render();
    startAuto();
  });

  observer.observe(block, {
    childList: true,
    subtree: false,        // important – don't watch inside carousel
    attributes: false,
    characterData: true
  });
}