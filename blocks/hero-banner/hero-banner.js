/**
 * Hero Banner Carousel - Fixed & Improved Version (Dec 2025)
 * Correctly maps all 8 columns including Background Video
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // --- Prevent double execution in Universal Editor ---
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // --- Filter out empty/authoring rows ---
  const slideElements = [...block.children].filter((slide) => {
    const text = slide.textContent.trim();
    const hasImage = slide.querySelector("img");
    return text.length > 0 || hasImage;
  });

  if (slideElements.length === 0) return;

  // --- Create carousel structure ---
  const carouselWrapper = document.createElement("div");
  carouselWrapper.className = "hero-carousel-wrapper";

  const track = document.createElement("div");
  track.className = "hero-carousel-track";

  slideElements.forEach((slide, index) => {
    slide.className = "hero-slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slideElements.length}`);

    // Get all direct div children (each represents a column)
    const cols = slide.querySelectorAll(":scope > div");

    // Column mapping according to your _hero-banner.json
    const title           = cols[0]?.textContent?.trim() || "";
    const description     = cols[1]?.textContent?.trim() || "";

    // Background Image (column 3)
    const bgImage         = cols[2]?.querySelector("img")?.src || "";

    // Background Video (column 4) - optional, we'll support it later if needed
    const bgVideo         = cols[3]?.querySelector("video source")?.src
      || cols[3]?.querySelector("a")?.href || "";

    // CTAs - Correct indices
    const knowMoreLabel   = cols[4]?.textContent?.trim() || "Know More";
    const knowMoreLink    = cols[5]?.querySelector("a")?.href || "#";

    const watchVideoLabel = cols[6]?.textContent?.trim() || "Watch Video";
    const watchVideoLink  = cols[7]?.querySelector("a")?.href || "#";

    // Set background (image first, video fallback can be added later)
    if (bgImage) {
      slide.style.backgroundImage = `url('${bgImage}')`;
    }

    // Build clean content
    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${title}</h2>
        <div class="hero-description">${description}</div>
        <div class="hero-cta-group">
          <a href="${knowMoreLink}" class="hero-btn primary" aria-label="${knowMoreLabel}">${knowMoreLabel}</a>
          <a href="${watchVideoLink}" class="hero-btn secondary" aria-label="${watchVideoLabel}">${watchVideoLabel}</a>
        </div>
      </div>
    `;

    // Optional: If you want to support background video in the future, store the URL
    if (bgVideo) {
      slide.dataset.bgVideo = bgVideo;
    }

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // --- Controls (Prev / Pagination / Next) ---
  const controls = document.createElement("div");
  controls.className = "hero-controls";
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite">01 / ${String(slideElements.length).padStart(2, "0")}</div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  carouselWrapper.appendChild(controls);

  // --- Clear and append new structure ---
  block.textContent = ""; // Safe clear
  block.appendChild(carouselWrapper);

  // --- Carousel Logic ---
  let currentSlide = 0;
  let autoplayInterval = null;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector(".hero-pagination");
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(slideElements.length).padStart(2, "0")}`;
    }
    track.querySelectorAll(".hero-slide").forEach((s, i) => {
      s.setAttribute("aria-hidden", i !== currentSlide);
    });
  };

  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1;
    updateCarousel();
  };

  const nextSlide = () => {
    currentSlide = currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
  };

  const stopAutoplay = () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  };

  // Event Listeners
  controls.querySelector(".hero-prev").addEventListener("click", () => {
    prevSlide();
    stopAutoplay();
  });

  controls.querySelector(".hero-next").addEventListener("click", () => {
    nextSlide();
    stopAutoplay();
  });

  carouselWrapper.addEventListener("mouseenter", stopAutoplay);
  carouselWrapper.addEventListener("mouseleave", startAutoplay);

  // Keyboard support
  carouselWrapper.tabIndex = 0; // Make focusable
  carouselWrapper.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === " ") e.preventDefault(), nextSlide();
    stopAutoplay();
  });

  // Touch swipe support
  let touchStartX = 0;
  carouselWrapper.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      stopAutoplay();
    }
  }, { passive: true });

  // Initialize
  updateCarousel();
  startAutoplay();

  // Cleanup when block is removed (e.g., in editor)
  if (block.parentElement) {
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if ([...m.removedNodes].includes(block)) {
          stopAutoplay();
        }
      });
    }).observe(block.parentElement, { childList: true });
  }
}