/**
 * Hero Banner Carousel - Universal Editor Compatible (ROBUST VERSION)
 * Uses column headers to map fields instead of fixed indices
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // --- Authoring Prevention ---
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // --- Extract & FILTER Slides ---
  let slideElements = [...block.children].filter((slide) => {
    const text = slide.innerText.trim();
    const hasImage = slide.querySelector("img");
    return text.length > 0 || hasImage;
  });

  if (slideElements.length === 0) return;

  // --- Get column mapping from FIRST ROW headers ---
  const headerRow = slideElements[0];
  const headerCells = headerRow.querySelectorAll(":scope > div");
  const columnMap = {};

  headerCells.forEach((cell, index) => {
    const headerText = cell.textContent?.trim().toLowerCase() || '';
    if (headerText) {
      columnMap[headerText] = index;
    }
  });

  // --- Create structure ---
  const carouselWrapper = document.createElement("div");
  carouselWrapper.className = "hero-carousel-wrapper";

  const track = document.createElement("div");
  track.className = "hero-carousel-track";

  slideElements.forEach((slide, index) => {
    slide.className = "hero-slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slideElements.length}`);

    // --- ROBUST FIELD EXTRACTION using columnMap ---
    const cells = slide.querySelectorAll(":scope > div");

    // Helper to safely get field value
    const getField = (fieldName) => {
      const colIndex = columnMap[fieldName.toLowerCase()];
      if (colIndex === undefined || colIndex >= cells.length) return '';
      const cell = cells[colIndex];
      return cell.textContent?.trim() || '';
    };

    const getLinkField = (fieldName) => {
      const colIndex = columnMap[fieldName.toLowerCase()];
      if (colIndex === undefined || colIndex >= cells.length) return '#';
      const cell = cells[colIndex];
      const link = cell.querySelector("a");
      return link?.href || '#';
    };

    // Extract fields by name (order-independent!)
    const title = getField("title");
    const description = getField("description");

    const bgImageCellIndex = columnMap["background image"] ?? columnMap["background-image"];
    const bgImage = bgImageCellIndex !== undefined && bgImageCellIndex < cells.length
      ? cells[bgImageCellIndex].querySelector("img")?.src || ''
      : '';

    const knowLabel = getField("know more label") || getField("know-more-label") || "Know More";
    const knowLink = getLinkField("know more link") || getLinkField("know-more-link") || "#";

    const watchLabel = getField("watch video label") || getField("watch-video-label") || "Watch Video";
    const watchLink = getLinkField("watch video link") || getLinkField("watch-video-link") || "#";

    // Set background
    if (bgImage) {
      slide.style.backgroundImage = `url('${bgImage}')`;
    }

    // Build slide content
    slide.innerHTML = `
      <div class="hero-slide-content">
        ${title ? `<h1 class="hero-title">${title}</h1>` : ''}
        ${description ? `<p class="hero-description">${description}</p>` : ''}
        <div class="hero-cta-group">
          ${knowLink !== '#' ? `<a href="${knowLink}" class="hero-btn primary">${knowLabel}</a>` : ''}
          ${watchLink !== '#' ? `<a href="${watchLink}" class="hero-btn secondary">${watchLabel}</a>` : ''}
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);
  block.innerHTML = '';
  block.appendChild(carouselWrapper);

  // Add carousel controls (dots, prev/next)
  addCarouselControls(carouselWrapper, slideElements.length);
}

// Carousel controls function
function addCarouselControls(wrapper, slideCount) {
  const controls = document.createElement("div");
  controls.className = "hero-controls";

  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide">❮</button>
    <div class="hero-pagination">1 / ${slideCount}</div>
    <button class="hero-next" aria-label="Next slide">❯</button>
  `;

  wrapper.appendChild(controls);

  let currentIndex = 0;
  const track = wrapper.querySelector('.hero-carousel-track');

  const updatePagination = () => {
    const pagination = controls.querySelector('.hero-pagination');
    pagination.textContent = `${currentIndex + 1} / ${slideCount}`;
  };

  const moveToSlide = (index) => {
    currentIndex = Math.max(0, Math.min(index, slideCount - 1));
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updatePagination();
  };

  controls.querySelector('.hero-prev').addEventListener('click', () => moveToSlide(currentIndex - 1));
  controls.querySelector('.hero-next').addEventListener('click', () => moveToSlide(currentIndex + 1));

  // Auto-advance
  let autoInterval;
  const startAuto = () => {
    autoInterval = setInterval(() => moveToSlide(currentIndex + 1), 5000);
  };
  const stopAuto = () => clearInterval(autoInterval);

  wrapper.addEventListener('mouseenter', stopAuto);
  wrapper.addEventListener('mouseleave', startAuto);
  startAuto();

  updatePagination();
}
