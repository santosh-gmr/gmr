/**
 * Hero Banner Carousel - Responsive + Lazy-loading
 *
 * - Lazy-loads background images and background videos via IntersectionObserver
 * - Injects video only on larger screens and when prefers-reduced-motion is not set
 * - Accessible controls, keyboard support, and touch swipe
 */

export default function decorate(block) {
  // Prevent double execution in editor
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  // Filter out empty/authoring rows
  const slideElements = [...block.children].filter((slide) => {
    const text = (slide.textContent || '').trim();
    const hasImage = !!slide.querySelector('img');
    const hasAnchor = slide.querySelectorAll('a').length > 0;
    return text.length > 0 || hasImage || hasAnchor;
  });

  if (slideElements.length === 0) return;

  // Helpers
  function escapeHtml(str) {
    if (str == null) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(str).replace(/[&<>"']/g, (m) => map[m]);
  }

  function friendlyLabelFromHref(href) {
    if (!href) return '';
    try {
      const u = new URL(href, window.location.origin);
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts.pop();
      if (last) {
        return decodeURIComponent(last.replace(/[-_]/g, ' '));
      }
      return u.hostname;
    } catch (err) {
      return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  // Build carousel structure
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  // Pre-check reduced-motion preference for autoplay decisions
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slideElements.forEach((slide, index) => {
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

    const cols = slide.querySelectorAll(':scope > div');

    const title = cols[0]?.textContent?.trim() || '';
    const description = cols[1]?.innerHTML?.trim() || '';

    const imgEl = cols[2]?.querySelector('img');
    const bgImageDesktop = imgEl?.getAttribute('data-desktop-src') || imgEl?.src || '';
    const bgImageMobile = imgEl?.getAttribute('data-mobile-src') || '';

    const bgVideoEl =
      cols[3]?.querySelector('video source') ||
      cols[3]?.querySelector('video') ||
      cols[3]?.querySelector('a');
    const bgVideo = bgVideoEl?.src || bgVideoEl?.href || '';

    const knowMoreLink = cols[5]?.querySelector('a')?.href ||
      (slide.querySelector('a') ? slide.querySelector('a').href : '#');
    const knowMoreLabelRaw = cols[4]?.textContent?.trim() || '';
    const watchVideoLink = cols[7]?.querySelector('a')?.href || '#';
    const watchVideoLabelRaw = cols[6]?.textContent?.trim() || '';

    const knowAnchor = cols[5]?.querySelector('a') || slide.querySelector('a');
    const watchAnchor = cols[7]?.querySelector('a') || null;

    // anchor texts via small if-blocks (avoid unnecessary ternary)
    let knowAnchorText = '';
    if (knowAnchor) {
      knowAnchorText = (knowAnchor.textContent || '').trim();
    }

    let watchAnchorText = '';
    if (watchAnchor) {
      watchAnchorText = (watchAnchor.textContent || '').trim();
    }

    // Compose labels with operator at beginning of wrapped lines
    const knowLabel = knowMoreLabelRaw
      || knowAnchorText
      || friendlyLabelFromHref(knowMoreLink)
      || 'Know More';

    const watchLabel = watchVideoLabelRaw
      || watchAnchorText
      || friendlyLabelFromHref(watchVideoLink)
      || 'Watch Video';

    // Choose desktop vs mobile without breaking '=' across lines
    let chosenBg = bgImageDesktop;
    if (window.innerWidth <= 480 && bgImageMobile) {
      chosenBg = bgImageMobile;
    }

    if (chosenBg) slide.dataset.bgLazySrc = chosenBg;
    if (bgImageMobile) slide.dataset.bgMobileSrc = bgImageMobile;
    if (bgImageDesktop) slide.dataset.bgDesktopSrc = bgImageDesktop;
    if (bgVideo) slide.dataset.bgVideo = bgVideo;

    // Build slide content (escape where needed)
    slide.innerHTML = ''
      + '<div class="hero-slide-content">'
      + `<h2 class="hero-title">${escapeHtml(title)}</h2>`
      + `<div class="hero-description">${description || ''}</div>`
      + '<div class="hero-cta-group">'
      + `<a href="${escapeHtml(knowMoreLink)}" class="hero-btn primary" aria-label="${escapeHtml(knowLabel)}">${escapeHtml(knowLabel)}</a>`
      + `<a href="${escapeHtml(watchVideoLink)}" class="hero-btn secondary" aria-label="${escapeHtml(watchLabel)}">${escapeHtml(watchLabel)}</a>`
      + '</div>'
      + '</div>';

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Controls: Prev / Pagination / Next
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.innerHTML = ''
    + '<button class="hero-prev" aria-label="Previous slide" type="button">←</button>'
    + `<div class="hero-pagination" aria-live="polite">01 / ${String(slideElements.length).padStart(2, '0')}</div>`
    + '<button class="hero-next" aria-label="Next slide" type="button">→</button>';
  carouselWrapper.appendChild(controls);

  // clear and append constructed carousel
  block.textContent = '';
  block.appendChild(carouselWrapper);

  // Carousel logic
  let currentSlide = 0;
  let autoplayInterval = null;

  const slides = track.querySelectorAll('.hero-slide');

  // Lazy-load helper functions
  function loadImageOnSlide(s) {
    const src = s.dataset.bgLazySrc || s.dataset.bgDesktopSrc || s.dataset.bgMobileSrc;
    if (!src) return Promise.resolve();
    if (s.dataset.bgLoaded === 'true') return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        s.style.backgroundImage = `url('${src}')`;
        s.dataset.bgLoaded = 'true';
        resolve();
      };
      img.onerror = () => {
        s.dataset.bgLoaded = 'true';
        resolve();
      };
      img.src = src;
    });
  }

  function injectVideoOnSlideIfAllowed(s) {
    const url = s.dataset.bgVideo;
    if (!url) return;
    if (window.innerWidth <= 640 || reduceMotion) return;
    if (s.querySelector('.hero-bg-video')) return;
    try {
      const v = document.createElement('video');
      v.className = 'hero-bg-video';
      v.autoplay = true;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'metadata';
      v.setAttribute('aria-hidden', 'true');
      v.src = url;
      s.insertBefore(v, s.firstChild);
      v.play().catch(() => { /* ignore */ });
    } catch (err) {
      // swallow
    }
  }

  // IntersectionObserver: load images and videos when slide becomes near viewport
  const ioSupported = 'IntersectionObserver' in window;
  let io = null;

  function onSlideIntersect(entries) {
    entries.forEach((entry) => {
      const s = entry.target;
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        loadImageOnSlide(s).then(() => {
          injectVideoOnSlideIfAllowed(s);
        });
        if (io) io.unobserve(s);
      }
    });
  }

  if (ioSupported) {
    io = new IntersectionObserver(onSlideIntersect, {
      root: null,
      rootMargin: '300px',
      threshold: 0.05,
    });
    slides.forEach((s) => io.observe(s));
  } else {
    // fallback: eager load all (no lazy)
    slides.forEach((s) => {
      loadImageOnSlide(s).then(() => injectVideoOnSlideIfAllowed(s));
    });
  }

  // If viewport resizes and crosses mobile/desktop threshold, update dataset.bgLazySrc accordingly
  function updateChosenBackgroundsForViewport() {
    slides.forEach((s) => {
      const desktop = s.dataset.bgDesktopSrc || '';
      const mobile = s.dataset.bgMobileSrc || '';
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
      slides.forEach((s) => {
        if (s.dataset.bgLoaded === 'true') {
          injectVideoOnSlideIfAllowed(s);
        }
      });
    }, 120);
  }, { passive: true });

  // update UI to reflect current slide
  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const pagination = controls.querySelector('.hero-pagination');
    if (pagination) {
      pagination.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slideElements.length).padStart(2, '0')}`;
    }
    track.querySelectorAll('.hero-slide').forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== currentSlide ? 'true' : 'false');
    });
  };

  const prevSlide = () => {
    currentSlide = currentSlide === 0 ? slideElements.length - 1 : currentSlide - 1;
    updateCarousel();
    const s = slides[currentSlide];
    if (s) {
      loadImageOnSlide(s).then(() => injectVideoOnSlideIfAllowed(s));
      const nextIndex = (currentSlide + 1) % slides.length;
      const snext = slides[nextIndex];
      if (snext) loadImageOnSlide(snext);
    }
  };

  const nextSlide = () => {
    currentSlide = currentSlide === slideElements.length - 1 ? 0 : currentSlide + 1;
    updateCarousel();
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
    if (reduceMotion) return;
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  };

  // Bind controls safely
  const prevBtn = controls.querySelector('.hero-prev');
  const nextBtn = controls.querySelector('.hero-next');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoplay();
    });
  }

  // Pause on hover/focus (keyboard accessibility)
  carouselWrapper.addEventListener('mouseenter', stopAutoplay);
  carouselWrapper.addEventListener('mouseleave', startAutoplay);

  carouselWrapper.tabIndex = 0;
  carouselWrapper.addEventListener('focusin', stopAutoplay);
  carouselWrapper.addEventListener('focusout', startAutoplay);

  carouselWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      nextSlide();
    }
    stopAutoplay();
  });

  // Touch swipe support
  let touchStartX = 0;
  carouselWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselWrapper.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
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
