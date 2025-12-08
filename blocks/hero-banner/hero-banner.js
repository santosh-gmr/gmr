/**
 * Hero Banner Carousel - Universal Editor Compatible
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // --- Authoring Prevention ---
  // Check if the carousel has already been initialized
  if (block.querySelector('.hero-carousel-wrapper')) {
    return;
  }

  // Prevent decoration in authoring placeholder
  if (block.querySelector('.aem-block-placeholder')) {
    return;
  }

  // --- Extract Slides ---
  const slideElements = [...block.children]; // capture authored slides before clearing

  // --- Create Structure ---
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  slideElements.forEach((slide, index) => {
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

    const parts = slide.querySelectorAll(':scope > div');
    const title = parts[0]?.textContent?.trim() || '';
    const description = parts[1]?.textContent?.trim() || '';
    const imgElement = parts[2]?.querySelector('img');
    const bgImg = imgElement?.src || '';
    const knowLabel = parts[3]?.textContent?.trim() || 'Know More';
    const knowLink = parts[4]?.querySelector('a')?.href || '#';
    const watchLabel = parts[5]?.textContent?.trim() || 'Watch Video';
    const watchLink = parts[6]?.querySelector('a')?.href || '#';

    slide.style.backgroundImage = `url('${bgImg}')`;

    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${title}</h2>
        <p class="hero-description">${description}</p>
        <div class="hero-cta-group">
          <a href="${knowLink}" class="hero-btn primary">${knowLabel}</a>
          <a href="${watchLink}" class="hero-btn secondary">${watchLabel}</a>
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
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">
      01 / ${String(slideElements.length).padStart(2, '0')}
    </div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;

  carouselWrapper.appendChild(controls);

  // --- FIX: Remove original authored slides to avoid duplicates ---
  block.innerHTML = '';        // <-- THIS FIXES THE DOUBLE SLIDE ISSUE
  block.appendChild(carouselWrapper);

  // --- Carousel Functionality ---
  let currentSlide = 0;
  let autoplayInterval = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slideElements.length).padStart(2, '0')}`;
    }

    track.querySelectorAll('.hero-slide').forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== currentSlide));
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

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  const prevButton = controls.querySelector('.hero-prev');
  const nextButton = controls.querySelector('.hero-next');

  prevButton?.addEventListener('click', () => {
    prevSlide();
    stopAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
  });

  carouselWrapper.addEventListener('mouseenter', stopAutoplay);
  carouselWrapper.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  carouselWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      stopAutoplay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      stopAutoplay();
    }
  });

  // Touch navigation
  let touchStartX = 0;
  let touchEndX = 0;

  carouselWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      stopAutoplay();
    }
  }, { passive: true });

  // Initialize + autoplay
  updateCarousel();
  startAutoplay();

  // Cleanup when removed
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === block) {
            stopAutoplay();
            observer.disconnect();
          }
        });
      });
    });
    observer.observe(block.parentElement, { childList: true, subtree: true });
  }
}
