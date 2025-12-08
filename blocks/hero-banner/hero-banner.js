/**
 * Hero Banner Carousel - Universal Editor Compatible
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
    // Keep slide only if it has content
    return text.length > 0 || hasImage;
  });

  // If somehow nothing left, stop safely
  if (slideElements.length === 0) return;

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

    const parts = slide.querySelectorAll(":scope > div");

    // Expected columns (hero-banner-items model):
    // 0: Title
    // 1: Description
    // 2: Background Image
    // 3: Background Video (optional, but column should exist)
    // 4: Know More Label
    // 5: Know More Link URL
    // 6: Watch Video Label
    // 7: Watch Video Link URL

    const title = parts[0]?.textContent?.trim() || "";
    const description = parts[1]?.innerHTML?.trim() || "";

    const imgElement = parts[2]?.querySelector("img");
    const bgImg = imgElement?.src || "";

    const knowLabel = parts[4]?.textContent?.trim() || "Know More";
    const knowLink =
      parts[5]?.querySelector("a")?.href ||
      "#";

    const watchLabel = parts[6]?.textContent?.trim() || "Watch Video";
    const watchLink =
      parts[7]?.querySelector("a")?.href ||
      "#";

    // Apply background image
    if (bgImg) {
      slide.style.backgroundImage = `url('${bgImg}')`;
    }

    // --- Rebuild slide markup ---
    slide.innerHTML = `
      <div class="hero-slide-content">
        ${title ? `<h1 class="hero-title">${title}</h1>` : ""}
        ${description ? `<div class="hero-description">${description}</div>` : ""}
        <div class="hero-cta-group">
          ${knowLink !== "#" ? `<a href="${knowLink}" class="hero-btn primary">${knowLabel}</a>` : ""}
          ${watchLink !== "#" ? `<a href="${watchLink}" class="hero-btn secondary">${watchLabel}</a>` : ""}
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Replace original content
  block.innerHTML = "";
  block.appendChild(carouselWrapper);

  // Add controls
  addCarouselControls(carouselWrapper, slideElements.length);
}

/**
 * Adds carousel controls (prev/next buttons + pagination + auto-advance)
 */
function addCarouselControls(wrapper, slideCount) {
  if (slideCount <= 1) return;

  const controls = document.createElement("div");
  controls.className = "hero-controls";

  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide">❮</button>
    <div class="hero-pagination">1 / ${slideCount}</div>
    <button class="hero-next" aria-label="Next slide">❯</button>
  `;

  wrapper.appendChild(controls);

  let currentIndex = 0;
  const track = wrapper.querySelector(".hero-carousel-track");

  const updatePagination = () => {
    const pagination = controls.querySelector(".hero-pagination");
    if (pagination) {
      pagination.textContent = `${currentIndex + 1} / ${slideCount}`;
    }
  };

  const moveToSlide = (index) => {
    if (!track) return;
    currentIndex = (index + slideCount) % slideCount;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updatePagination();
  };

  const prevBtn = controls.querySelector(".hero-prev");
  const nextBtn = controls.querySelector(".hero-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => moveToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => moveToSlide(currentIndex + 1));
  }

  // --- Auto-advance with pause on hover ---
  let autoInterval;

  const startAuto = () => {
    stopAuto();
    autoInterval = setInterval(() => {
      moveToSlide(currentIndex + 1);
    }, 5000);
  };

  const stopAuto = () => {
    if (autoInterval) clearInterval(autoInterval);
  };

  wrapper.addEventListener("mouseenter", stopAuto);
  wrapper.addEventListener("mouseleave", startAuto);

  startAuto();
  updatePagination();
}
