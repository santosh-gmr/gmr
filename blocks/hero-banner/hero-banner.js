/**
 * Hero Banner Carousel - Responsive + Lazy-loading
 *
 * - Uses IntersectionObserver to lazy-load background images and background videos
 * - Video injection only when slide becomes visible, only on larger screens and when prefers-reduced-motion is not set
 * - Falls back to eager load if IntersectionObserver not available
 * - Keeps accessibility and responsive fixes from the earlier iteration
 *
 * Expectations:
 * - Slide markup: columns mapped from CMS; an <img> in column 3 (index 2) may contain:
 *     data-desktop-src (optional), data-mobile-src (optional), src
 * - Column 4 (index 3) may contain a <video> or link to video; we extract URL and store it as dataset.bgVideo
 *
 * Drop this file in place of your existing hero-banner.js
 */

export default function decorate(block) {
  // Prevent double execution in editor
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // Filter out empty/authoring rows
  const slideElements = [...block.children].filter((slide) => {
    const text = (slide.textContent || '').trim();
    const hasImage = !!slide.querySelector("img");
    const hasAnchor = slide.querySelectorAll("a").length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });
  if (slideElements.length === 0) return;

  // Helpers
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, (m) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
  }

  function friendlyLabelFromHref(href) {
    if (!href) return '';
    try {
      const u = new URL(href, location.origin);
      const last = u.pathname.split('/').filter(Boolean).pop();
      return last ? decodeURIComponent(last.replace(/[-_]/g, ' ')) : u.hostname;
    } catch (e) {
      return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  // Build carousel structure
  const carouselWrapper = document.createElement("div");
  carouselWrapper.className = "hero-carousel-wrapper";

  const track = document.createElement("div");
  track.className = "hero-carousel-track";

  // Pre-check reduced-motion preference for autoplay decisions
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // We'll keep a mirror of original slide DOM for reading data (used for lazy decisions)
  const originalSlides = slideElements.map(s => s.cloneNode(true));

  slideElements.forEach((slide, index) => {
    // normalize slide element
    slide.className = "hero-slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slideElements.length}`);

    // get columns (direct children)
    const cols = slide.querySelectorAll(":scope > div");

    // mapping per model
    const title = cols[0]?.textContent?.trim() || "";
    const description = cols[1]?.innerHTML?.trim() || ""; // keep richtext innerHTML

    // background image: support data-mobile-src on source img or img src
    const imgEl = cols[2]?.querySelector("img");
    const bgImageDesktop = imgEl?.getAttribute('data-desktop-src') || imgEl?.src || "";
    const bgImageMobile = imgEl?.getAttribute('data-mobile-src') || "";

    // background video (link or video source)
    const bgVideoEl = cols[3]?.querySelector("video source") || cols[3]?.querySelector("video") || cols[3]?.querySelector("a");
    const bgVideo = bgVideoEl?.src || bgVideoEl?.href || "";

    // CTAs (best-effort extraction)
    const knowMoreLink = cols[5]?.querySelector("a")?.href || (slide.querySelector("a") ? slide.querySelector("a").href : "#");
    const knowMoreLabelRaw = cols[4]?.textContent?.trim() || "";
    const watchVideoLink = cols[7]?.querySelector("a")?.href || "#";
    const watchVideoLabelRaw = cols[6]?.textContent?.trim() || "";

    const knowAnchor = cols[5]?.querySelector("a") || slide.querySelector("a");
    const watchAnchor = cols[7]?.querySelector("a") || null;

    const knowLabel = knowMoreLabelRaw
      || (knowAnchor ? (knowAnchor.textContent || '').trim() : '')
      || friendlyLabelFromHref(knowMoreLink)
      || "Know More";

    const watchLabel = watchVideoLabelRaw
      || (watchAnchor ? (watchAnchor.textContent || '').trim() : '')
      || friendlyLabelFromHref(watchVideoLink)
      || "Watch Video";

    // We DO NOT set backgroundImage here (lazy loading will handle it).
    // But store chosen URLs on data attributes so observer can pick them later.
    // Choose desktop vs mobile based on current viewport width (initial)
    const chosenBg = (window.innerWidth <= 480 && bgImageMobile) ? bgImageMobile : bgImageDesktop;
    if (chosenBg) slide.dataset.bgLazySrc = chosenBg;
    if (bgImageMobile) slide.dataset.bgMobileSrc = bgImageMobile;
    if (bgImageDesktop) slide.dataset.bgDesktopSrc = bgImageDesktop;
    if (bgVideo) slide.dataset.bgVideo = bgVideo;

    // Build content (escape where needed)
    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${escapeHtml(title)}</h2>
        <div class="hero-description">${description ? description : ''}</div>
        <div class="hero-cta-group">
          <a href="${escapeHtml(knowMoreLink)}" class="hero-btn primary" aria-label="${escapeHtml(knowLabel)}">${escapeHtml(knowLabel)}</a>
          <a href="${escapeHtml(watchVideoLink)}" class="hero-btn secondary" aria-label="${escapeHtml(watchLabel)}">${escapeHtml(watchLabel)}</a>
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Controls: Prev / Pagination / Next
  const controls = document.createElement("div");
  controls.className = "hero-controls";
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite">01 / ${String(slideElements.length).padStart(2, "0")}</div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  carouselWrapper.appendChild(controls);

  // clear and append constructed carousel
  block.textContent = ""; // safe clear
  block.appendChild(carouselWrapper);

  // Carousel logic
  let currentSlide = 0;
  let autoplayInterval = null;

  const slides = track.querySelectorAll(".hero-slide");

  // Lazy-load helper functions
  function loadImageOnSlide(s) {
    const src = s.dataset.bgLazySrc || s.dataset.bgDesktopSrc || s.dataset.bgMobileSrc;
    if (!src) return Promise.resolve();
    // Check if already loaded
    if (s.dataset.bgLoaded === "true") return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      // allow browser to decode asynchronously
      img.decoding = 'async';
      img.onload = () => {
        s.style.backgroundImage = `url('${src}')`;
        s.dataset.bgLoaded = "true";
        resolve();
      };
      img.onerror = () => {
        // do not block on error - leave placeholder
        s.dataset.bgLoaded = "true";
        resolve();
      };
      img.src = src;
    });
  }

  function injectVideoOnSlideIfAllowed(s) {
    const url = s.dataset.bgVideo;
    if (!url) return;
    // Only inject on larger screens, and if user didn't request reduced motion
    if (window.innerWidth <= 640 || reduceMotion) return;
    // avoid duplicate
    if (s.querySelector('.hero-bg-video')) return;
    try {
      const v = document.createElement('video');
      v.className = 'hero-bg-video';
      // set attributes
      v.autoplay = true;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'metadata';
      v.setAttribute('aria-hidden', 'true');
      // set source only when wanting to start loading to avoid data usage
      v.src = url;
      // insert as first child so overlay sits above
      s.insertBefore(v, s.firstChild);
      // attempt to play (some browsers block autoplay without user gesture for unmuted videos; ours are muted)
      v.play().catch(() => { /* ignore play promise errors */ });
    } catch (e) {
      // swallow errors
    }
  }

  // IntersectionObserver: load images and videos when slide becomes near viewport
  const ioSupported = 'IntersectionObserver' in window;
  let io = null;

  function onSlideIntersect(entries) {
    entries.forEach(entry => {
      const s = entry.target;
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        // load background image
        loadImageOnSlide(s).then(() => {
          // after image loaded, inject video if available
          injectVideoOnSlideIfAllowed(s);
        });
        // optionally unobserve to avoid reloading
        if (io) io.unobserve(s);
      }
    });
  }

  if (ioSupported) {
    io = new IntersectionObserver(onSlideIntersect, { root: null, rootMargin: '300px', threshold: 0.05 });
    slides.forEach(s => {
      io.observe(s);
    });
  } else {
    // fallback: eager load all (no lazy)
    slides.forEach(s => {
      loadImageOnSlide(s).then(() => injectVideoOnSlideIfAllowed(s));
    });
  }

  // If viewport resizes and crosses mobile/desktop threshold, update dataset.bgLazySrc accordingly for slides not yet loaded
  function updateChosenBackgroundsForViewport() {
    slides.forEach((s, i) => {
      const desktop = s.dataset.bgDesktopSrc || "";
      const mobile = s.dataset.bgMobileSrc || "";
      if (window.innerWidth <= 480 && mobile) {
        s.dataset.bgLazySrc = mobile;
      } else if (desktop) {
        s.dataset.bgLazySrc = desktop;
      }
    });
  }
  // initialize chosen backgrounds
  updateChosenBackgroundsForViewport();

  // update on resize (debounced)
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateChosenBackgroundsForViewport();
      // reinject videos for slides that became eligible
      slides.forEach(s => {
        if (s.dataset.bgLoaded === "true") {
          injectVideoOnSlideIfAllowed(s);
        }
      });
    }, 120);
  }, { passive: true });

  // update UI to reflect current slide
  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector(".hero-pagination");
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(slideElements.length).padStart(2, "0")}`;
    }
    track.querySelectorAll(".hero-slide").forEach((s, i) => {
      s.setAttribute("aria-hidden", i !== currentSlide ? "true" : "false");
    });
  };

  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1;
    updateCarousel();
    // proactively lazy-load the new slide (and neighbor)
    const s = slides[currentSlide];
    if (s) {
      loadImageOnSlide(s).then(() => injectVideoOnSlideIfAllowed(s));
      // pre-load next slide too
      const nextIndex = (currentSlide + 1) % slides.length;
      const snext = slides[nextIndex];
      if (snext) loadImageOnSlide(snext);
    }
  };

  const nextSlide = () => {
    currentSlide = currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
    // proactively lazy-load the new slide (and neighbor)
    const s = slides[currentSlide];
    if (s) {
      loadImageOnSlide(s).then(() => injectVideoOnSlideIfAllowed(s));
      const nextIndex = (currentSlide + 1) % slides.length;
      const snext = slides[nextIndex];
      if (snext) loadImageOnSlide(snext);
    }
  };

  const stopAutoplay = () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = null;
  };

  const startAutoplay = () => {
    // don't autoplay if user prefers reduced motion
    if (reduceMotion) return;
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  };

  // Bind controls safely
  const prevBtn = controls.querySelector(".hero-prev");
  const nextBtn = controls.querySelector(".hero-next");
  if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); stopAutoplay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); stopAutoplay(); });

  // Pause on hover/focus (keyboard accessibility)
  carouselWrapper.addEventListener("mouseenter", stopAutoplay);
  carouselWrapper.addEventListener("mouseleave", startAutoplay);

  carouselWrapper.tabIndex = 0; // make focusable
  carouselWrapper.addEventListener("focusin", stopAutoplay);
  carouselWrapper.addEventListener("focusout", startAutoplay);

  carouselWrapper.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); nextSlide(); } // space
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

  // Initialize: eager-load the first slide & neighbor to avoid white flash
  const initPreload = () => {
    const first = slides[0];
    const second = slides[1];
    if (first) loadImageOnSlide(first).then(() => injectVideoOnSlideIfAllowed(first));
    if (second) loadImageOnSlide(second);
  };

  // Start everything
  initPreload();
  updateCarousel();
  startAutoplay();

  // Cleanup when block is removed (editor)
  if (block.parentElement) {
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if ([...m.removedNodes].includes(block)) {
          stopAutoplay();
          if (io) io.disconnect();
          mo.disconnect();
        }
      });
    });
    mo.observe(block.parentElement, { childList: true });
  }
}
