/**
 * Hero Banner Carousel - Universal Editor Compatible
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // --- Idempotency and Authoring Checks ---
  // The Universal Editor inserts a placeholder with this class. If it exists, do not decorate.
  if (block.querySelector('.aem-block-placeholder')) {
    return;
  }

  // Find the raw slide elements. These are the direct children of the block.
  // We use a data attribute to mark them as "raw" to avoid re-selecting them later.
  const rawSlides = [...block.querySelectorAll(':scope > div:not([data-slide-processed])')];

  // If there are no raw slides to process, and a carousel already exists, do nothing.
  if (rawSlides.length === 0 && block.querySelector('.hero-carousel-wrapper')) {
    return;
  }

  // --- Structure Initialization ---
  // Find existing carousel parts or create them if they don't exist.
  let carouselWrapper = block.querySelector('.hero-carousel-wrapper');
  if (!carouselWrapper) {
    carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'hero-carousel-wrapper';
  }

  let track = block.querySelector('.hero-carousel-track');
  if (!track) {
    track = document.createElement('div');
    track.className = 'hero-carousel-track';
  }

  // --- Process Raw Slides ---
  rawSlides.forEach((slide, index) => {
    slide.setAttribute('data-slide-processed', 'true'); // Mark as processed
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');

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

  // --- Assemble the Block ---
  // If the wrapper is not already in the block, clear the block and build it.
  if (!block.contains(carouselWrapper)) {
    block.innerHTML = ''; // Clear only if we are building for the first time
    carouselWrapper.appendChild(track);

    const controls = document.createElement('div');
    controls.className = 'hero-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Carousel controls');
    carouselWrapper.appendChild(controls);

    block.appendChild(carouselWrapper);
  }

  // --- Update Controls and Functionality ---
  const allSlides = track.querySelectorAll('.hero-slide');
  const controls = block.querySelector('.hero-controls');
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">
      01 / ${String(allSlides.length).padStart(2, '0')}
    </div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;

  // --- Carousel Functionality ---
  let currentSlide = 0;
  let autoplayInterval = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(allSlides.length).padStart(2, '0')}`;
    }
    allSlides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== currentSlide));
    });
  }

  function prevSlide() {
    currentSlide = (currentSlide === 0) ? allSlides.length - 1 : currentSlide - 1;
    updateCarousel();
  }

  function nextSlide() {
    currentSlide = (currentSlide === allSlides.length - 1) ? 0 : currentSlide + 1;
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

  // Initialize
  updateCarousel();
  startAutoplay();
}
