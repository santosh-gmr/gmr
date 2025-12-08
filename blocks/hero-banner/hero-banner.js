/**
 * Hero Banner Carousel - Universal Editor Compatible
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // Get all slides from the block
  const slides = [...block.querySelectorAll(':scope > div')];

  if (!slides.length) {
    console.warn('No slides found in herobanner block');
    return;
  }

  // Create carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  // Create track for slides
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  // Process each slide
  slides.forEach((slide, index) => {
    // Query all divs within the slide
    const parts = slide.querySelectorAll(':scope > div');

    // Extract content from each part
    const title = parts[0]?.textContent?.trim() || '';
    const description = parts[1]?.textContent?.trim() || '';

    // Get background image
    const imgElement = parts[2]?.querySelector('img');
    const bgImg = imgElement?.src || '';
    const imgAlt = imgElement?.alt || `Slide ${index + 1}`;

    // Get CTA 1 (Know More)
    const knowLabel = parts[3]?.textContent?.trim() || 'Know More';
    const knowLink = parts[4]?.querySelector('a')?.href || '#';

    // Get CTA 2 (Watch Video)
    const watchLabel = parts[5]?.textContent?.trim() || 'Watch Video';
    const watchLink = parts[6]?.querySelector('a')?.href || '#';

    // Create slide element
    const slideEl = document.createElement('div');
    slideEl.className = 'hero-slide';
    slideEl.style.backgroundImage = `url('${bgImg}')`;
    slideEl.setAttribute('role', 'group');
    slideEl.setAttribute('aria-roledescription', 'slide');
    slideEl.setAttribute('aria-label', `${index + 1} of ${slides.length}`);

    // Build slide content
    slideEl.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${title}</h2>
        <p class="hero-description">${description}</p>
        <div class="hero-cta-group">
          <a href="${knowLink}" class="hero-btn primary">${knowLabel}</a>
          <a href="${watchLink}" class="hero-btn secondary">${watchLabel}</a>
        </div>
      </div>
    `;

    track.appendChild(slideEl);
  });

  // Add track to wrapper
  carouselWrapper.appendChild(track);

  // Create controls
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Carousel controls');

  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">
      01 / ${String(slides.length).padStart(2, '0')}
    </div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;

  carouselWrapper.appendChild(controls);

  // Clear block and add carousel
  block.innerHTML = '';
  block.appendChild(carouselWrapper);

  // Carousel state
  let currentSlide = 0;
  let autoplayInterval = null;

  // Update carousel position and pagination
  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent =
        `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }

    // Update aria-hidden for slides
    const allSlides = track.querySelectorAll('.hero-slide');
    allSlides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== currentSlide);
    });
  }

  // Go to previous slide
  function prevSlide() {
    currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    updateCarousel();
  }

  // Go to next slide
  function nextSlide() {
    currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
  }

  // Start autoplay
  function startAutoplay() {
    stopAutoplay(); // Clear any existing interval
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  // Stop autoplay
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // Attach event listeners
  const prevButton = controls.querySelector('.hero-prev');
  const nextButton = controls.querySelector('.hero-next');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      prevSlide();
      stopAutoplay(); // Stop autoplay when user interacts
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextSlide();
      stopAutoplay(); // Stop autoplay when user interacts
    });
  }

  // Pause autoplay on hover
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

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carouselWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
      stopAutoplay();
    }
  }

  // Initialize carousel
  updateCarousel();
  startAutoplay();

  // Cleanup on block removal (for Universal Editor)
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === block || node.contains(block)) {
            stopAutoplay();
            observer.disconnect();
          }
        });
      });
    });

    observer.observe(block.parentElement, { childList: true, subtree: true });
  }
}
