/**
 * Hero Banner Carousel - Fixed CTA Mapping + Universal Editor Safe (No Hang)
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

    // FIXED: Correct column mapping for 8 columns (per your JSON)
    const parts = slide.querySelectorAll(":scope > div");
    const title = parts[0]?.textContent?.trim() || "";
    const description = parts[1]?.textContent?.trim() || "";
    const imgElement = parts[2]?.querySelector("img");
    const bgImg = imgElement?.src || "";

    // Skip index 3 (Background Video)
    const knowLabel = parts[4]?.textContent?.trim() || "Know More";  // Fixed: Now column 4
    const knowLink = parts[5]?.querySelector("a")?.href || "#";      // Fixed: Now column 5
    const watchLabel = parts[6]?.textContent?.trim() || "Watch Video"; // Fixed: Now column 6
    const watchLink = parts[7]?.querySelector("a")?.href || "#";     // Fixed: Now column 7

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

  // --- Controls ---
  const controls = document.createElement("div");
  controls.className = "hero-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Carousel controls");

  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite" aria-atomic="true">
      01 / ${String(slideElements.length).padStart(2, "0")}
    </div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  carouselWrapper.appendChild(controls);

  // --- Safe: Move original slides into a hidden container for editor support ---
  const originalContainer = document.createElement("div");
  originalContainer.style.display = "none";
  originalContainer.className = "hero-original-rows";
  slideElements.forEach(slide => originalContainer.appendChild(slide));
  block.appendChild(originalContainer);

  // Add carousel last
  block.appendChild(carouselWrapper);

  // --- Carousel Logic ---
  let currentSlide = 0;
  let autoplayInterval = null;
  let rebuildTimeout = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector(".hero-pagination");
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(slideElements.length).padStart(2, "0")}`;
    }
    track.querySelectorAll(".hero-slide").forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== currentSlide));
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
    if (slideElements.length > 1) {
      autoplayInterval = setInterval(nextSlide, 5000);
    }
  }

  const prevButton = controls.querySelector(".hero-prev");
  const nextButton = controls.querySelector(".hero-next");

  prevButton?.addEventListener("click", () => {
    prevSlide();
    stopAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    nextSlide();
    stopAutoplay();
  });

  carouselWrapper.addEventListener("mouseenter", stopAutoplay);
  carouselWrapper.addEventListener("mouseleave", startAutoplay);

  // --- Keyboard Navigation ---
  carouselWrapper.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
      stopAutoplay();
    } else if (e.key === "ArrowRight") {
      nextSlide();
      stopAutoplay();
    }
  });

  // --- Touch Swipe ---
  let touchStartX = 0;
  let touchEndX = 0;

  carouselWrapper.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      stopAutoplay();
    }
  }, { passive: true });

  // --- Safe Rebuild for Editor (throttled, no hang) ---
  function rebuildSlides() {
    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(() => {
      const newRows = [...originalContainer.children].filter(row => row.textContent.trim() || row.querySelector("img"));
      if (newRows.length !== slideElements.length) {
        slideElements = newRows;
        // Re-render track with new slides (same logic as above)
        track.innerHTML = "";
        slideElements.forEach((slide, index) => {
          slide.className = "hero-slide";
          slide.setAttribute("aria-label", `${index + 1} of ${slideElements.length}`);
          const parts = slide.querySelectorAll(":scope > div");
          const title = parts[0]?.textContent?.trim() || "";
          const description = parts[1]?.textContent?.trim() || "";
          const imgElement = parts[2]?.querySelector("img");
          const bgImg = imgElement?.src || "";
          const knowLabel = parts[4]?.textContent?.trim() || "Know More";
          const knowLink = parts[5]?.querySelector("a")?.href || "#";
          const watchLabel = parts[6]?.textContent?.trim() || "Watch Video";
          const watchLink = parts[7]?.querySelector("a")?.href || "#";

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
        currentSlide = 0;
        updateCarousel();
        startAutoplay();
      }
    }, 500); // Throttle to 500ms - prevents hang
  }

  // Safe observer: Watch only the original container (not the whole block)
  if (originalContainer) {
    const observer = new MutationObserver(rebuildSlides);
    observer.observe(originalContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Initialize
  updateCarousel();
  startAutoplay();

  // Cleanup on block removal
  if (block.parentElement) {
    const cleanupObserver = new MutationObserver((mutations) => {
      let shouldCleanup = false;
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === block) shouldCleanup = true;
        });
      });
      if (shouldCleanup) {
        stopAutoplay();
        if (rebuildTimeout) clearTimeout(rebuildTimeout);
        cleanupObserver.disconnect();
      }
    });
    cleanupObserver.observe(block.parentElement, { childList: true, subtree: true });
  }
}