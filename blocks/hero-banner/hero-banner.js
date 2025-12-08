/**
 * Hero Banner Carousel – Fully Universal Editor Compatible
 * Fixes CTA mapping + preserves authoring rows
 * Works perfectly with your _hero-banner.json (8 columns)
 */

export default async function decorate(block) {
  // Prevent double decoration
  if (block.closest('.hero-carousel-wrapper') || block.querySelector('.hero-carousel-wrapper')) return;

  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  carouselWrapper.appendChild(track);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">Previous</button>
    <div class="hero-pagination" aria-live="polite">01 / 01</div>
    <button class="hero-next" aria-label="Next slide" type="button">Next</button>
  `;
  carouselWrapper.appendChild(controls);

  // Insert carousel but keep original rows for authoring
  block.appendChild(carouselWrapper);

  let currentSlide = 0;
  let autoplayInterval = null;

  const buildSlides = () => {
    track.innerHTML = ''; // Only clear rendered slides

    // Get all direct child rows that are NOT the carousel itself
    const rows = Array.from(block.children).filter(
      child => !child.classList?.contains('hero-carousel-wrapper')
    );

    if (rows.length === 0) return;

    rows.forEach((row, index) => {
      const cols = row.querySelectorAll(':scope > div');

      const title           = cols[0]?.textContent?.trim() || '';
      const description     = cols[1]?.textContent?.trim() || '';
      const bgImage         = cols[2]?.querySelector('img')?.src || '';
      // cols[3] = Background Video (ignored for now)
      const knowMoreLabel   = cols[4]?.textContent?.trim() || 'Know More';
      const knowMoreLink    = cols[5]?.querySelector('a')?.href || '#';
      const watchVideoLabel = cols[6]?.textContent?.trim() || 'Watch Video';
      const watchVideoLink  = cols[7]?.querySelector('a')?.href || '#';

      const slide = document.createElement('div');
      slide.className = 'hero-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${index + 1} of ${rows.length}`);

      if (bgImage) {
        slide.style.backgroundImage = `url('${bgImage}')`;
      }

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

    // Reset to first slide on rebuild
    currentSlide = 0;
    updateCarousel();
  };

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    const total = track.children.length;
    const pagination = controls.querySelector('.hero-pagination');
    if (pagination && total > 0) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    track.querySelectorAll('.hero-slide').forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== currentSlide);
    });
  };

  const nextSlide = () => {
    const total = track.children.length;
    if (total <= 1) return;
    currentSlide = (currentSlide + 1) % total;
    updateCarousel();
  };

  const prevSlide = () => {
    const total = track.children.length;
    if (total <= 1) return;
    currentSlide = (currentSlide - 1 + total) % total;
    updateCarousel();
  };

  const startAutoplay = () => {
    clearInterval(autoplayInterval);
    if (track.children.length > 1) {
      autoplayInterval = setInterval(nextSlide, 5000);
    }
  };

  const stopAutoplay = () => clearInterval(autoplayInterval);

  // Event Listeners
  controls.querySelector('.hero-prev').addEventListener('click', () => {
    prevSlide();
    stopAutoplay();
  });

  controls.querySelector('.hero-next').addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
  });

  carouselWrapper.addEventListener('mouseenter', stopAutoplay);
  carouselWrapper.addEventListener('mouseleave', startAutoplay);

  // Touch swipe
  let touchStartX = 0;
  carouselWrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      stopAutoplay();
    }
  }, { passive: true });

  // Keyboard
  carouselWrapper.tabIndex = 0;
  carouselWrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prevSlide(); stopAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoplay(); }
  });

  // Initial build
  buildSlides();
  if (track.children.length > 1) startAutoplay();

  // Live updates when author adds/removes/reorders slides
  const observer = new MutationObserver(() => {
    buildSlides();
    if (track.children.length > 1) startAutoplay();
  });

  observer.observe(block, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  // Cleanup
  block.addEventListener('removed', () => {
    stopAutoplay();
    observer.disconnect();
  }, { once: true });
}