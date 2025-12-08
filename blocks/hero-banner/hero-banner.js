/**
 * Hero Banner Carousel - Universal Editor Compatible (robust link/label parsing)
 * @param {HTMLElement} block - The herobanner block element
 */
export default function decorate(block) {
  // --- Authoring Prevention ---
  if (block.querySelector('.hero-carousel-wrapper')) return;

  // Do not run in authoring placeholder mode
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

    // Collect direct children divs (legacy structure) but be tolerant
    const parts = slide.querySelectorAll(":scope > div");
    const title = parts[0]?.textContent?.trim() || "";
    const description = parts[1]?.textContent?.trim() || "";
    const imgElement = parts[2]?.querySelector("img");
    const bgImg = imgElement?.src || "";

    // Robust parsing for labels and links:
    //  - Look for anchors anywhere inside the slide (preserve author order)
    //  - Fall back to nearby text nodes if anchors are absent
    const anchors = Array.from(slide.querySelectorAll("a"));
    let knowLabel = "Know More";
    let knowLink = "#";
    let watchLabel = "Watch Video";
    let watchLink = "#";

    if (anchors.length >= 2) {
      // Two or more anchors: assume first is know, second is watch
      knowLink = anchors[0].href || "#";
      knowLabel = (anchors[0].textContent || knowLabel).trim() || knowLabel;
      watchLink = anchors[1].href || "#";
      watchLabel = (anchors[1].textContent || watchLabel).trim() || watchLabel;
    } else if (anchors.length === 1) {
      const a = anchors[0];
      const txt = (a.textContent || "").toLowerCase();
      // If anchor text looks like watch/watch video, map to watch; else know
      if (txt.includes("watch")) {
        watchLink = a.href || "#";
        watchLabel = (a.textContent || watchLabel).trim() || watchLabel;
      } else {
        knowLink = a.href || "#";
        knowLabel = (a.textContent || knowLabel).trim() || knowLabel;
      }
      // Try to extract the other label from parts (if present)
      // authors sometimes place labels in sibling divs without anchors
      const maybeKnow = parts[3]?.textContent?.trim();
      const maybeWatch = parts[5]?.textContent?.trim();
      if (!knowLabel || knowLabel === "") {
        if (maybeKnow) knowLabel = maybeKnow;
      }
      if (!watchLabel || watchLabel === "") {
        if (maybeWatch) watchLabel = maybeWatch;
      }
    } else {
      // No anchors: attempt to read labels from parts positions (legacy)
      const maybeKnow = parts[3]?.textContent?.trim();
      const maybeKnowHref = parts[4]?.querySelector("a")?.href;
      const maybeWatch = parts[5]?.textContent?.trim();
      const maybeWatchHref = parts[6]?.querySelector("a")?.href;

      if (maybeKnow) knowLabel = maybeKnow;
      if (maybeKnowHref) knowLink = maybeKnowHref;
      if (maybeWatch) watchLabel = maybeWatch;
      if (maybeWatchHref) watchLink = maybeWatchHref;
      // Leave # fallback if nothing found
    }

    // Ensure primary (Know More) is rendered first so styling/order stays consistent
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

  block.innerHTML = "";
  block.appendChild(carouselWrapper);

  // --- Carousel Logic ---
  let currentSlide = 0;
  let autoplayInterval = null;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector(".hero-pagination");
    if (pagination) {
      pagination.textContent =
        `${String(currentSlide + 1).padStart(2, "0")} / ${String(
          slideElements.length
        ).padStart(2, "0")}`;
    }

    track.querySelectorAll(".hero-slide").forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== currentSlide));
    });
  }

  function prevSlide() {
    currentSlide =
      currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1;
    updateCarousel();
  }

  function nextSlide() {
    currentSlide =
      currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1;
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

  carouselWrapper.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  carouselWrapper.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
        stopAutoplay();
      }
    },
    { passive: true }
  );

  // Initialize
  updateCarousel();
  startAutoplay();

  // Cleanup observer
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
    observer.observe(block.parentElement, {
      childList: true,
      subtree: true,
    });
  }
}
