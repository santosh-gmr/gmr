/**
 * Hero Banner Carousel - Responsive & Improved
 * Replaces background handling to allow responsive sources and safe video
 * Respects prefers-reduced-motion
 *
 * Note: the code still expects the slide structure used by your model:
 * columns mapped per _hero-banner.json (title, description, background image, video, CTAs, etc.)
 *
 * Based on original file inspected during review.
 * See: original hero-banner.js for reference. :contentReference[oaicite:3]{index=3}
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
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[m]));
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
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'hero-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  // Pre-check reduced-motion preference for autoplay decisions
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slideElements.forEach((slide, index) => {
    // normalize slide element
    slide.className = 'hero-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slideElements.length}`);

    // get columns (direct children)
    const cols = slide.querySelectorAll(':scope > div');

    // mapping per model
    const title = cols[0]?.textContent?.trim() || '';
    const description = cols[1]?.innerHTML?.trim() || ''; // keep richtext innerHTML
    // background image: support data-mobile-src on source img or img src
    const imgEl = cols[2]?.querySelector('img');
    const bgImage = imgEl?.getAttribute('data-desktop-src') || imgEl?.src || '';
    const bgImageMobile = imgEl?.getAttribute('data-mobile-src') || '';

    // background video
    const bgVideoEl = cols[3]?.querySelector('video source') || cols[3]?.querySelector('a');
    const bgVideo = bgVideoEl?.src || bgVideoEl?.href || '';

    // CTAs
    const knowMoreLabelRaw = cols[4]?.textContent?.trim() || '';
    const knowMoreLink = cols[5]?.querySelector('a')?.href || '#';

    const watchVideoLabelRaw = cols[6]?.textContent?.trim() || '';
    const watchVideoLink = cols[7]?.querySelector('a')?.href || '#';

    const knowAnchor = cols[5]?.querySelector('a') || slide.querySelector('a');
    const watchAnchor = cols[7]?.querySelector('a') || null;

    const knowLabel = knowMoreLabelRaw
      || (knowAnchor ? (knowAnchor.textContent || '').trim() : '')
      || friendlyLabelFromHref(knowMoreLink)
      || 'Know More';

    const watchLabel = watchVideoLabelRaw
      || (watchAnchor ? (watchAnchor.textContent || '').trim() : '')
      || friendlyLabelFromHref(watchVideoLink)
      || 'Watch Video';

    // Set background image responsively (JS chooses based on viewport if mobile src available)
    const chosenBg = (window.innerWidth <= 480 && bgImageMobile) ? bgImageMobile : bgImage;
    if (chosenBg) {
      // set as background on slide (degrades fine if image missing)
      slide.style.backgroundImage = `url('${chosenBg}')`;
    } else {
      slide.style.backgroundImage = '';
    }

    // Build content (escape where needed)
    // description kept as innerHTML (from CMS richtext) — sanitize if necessary upstream
    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${escapeHtml(title)}</h2>
        <div class="hero-description">${description || ''}</div>
        <div class="hero-cta-group">
          <a href="${escapeHtml(knowMoreLink)}" class="hero-btn primary" aria-label="${escapeHtml(knowLabel)}">${escapeHtml(knowLabel)}</a>
          <a href="${escapeHtml(watchVideoLink)}" class="hero-btn secondary" aria-label="${escapeHtml(watchLabel)}">${escapeHtml(watchLabel)}</a>
        </div>
      </div>
    `;

    // store video url for later injection if allowed
    if (bgVideo) slide.dataset.bgVideo = bgVideo;

    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);

  // Controls: Prev / Pagination / Next
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide" type="button">←</button>
    <div class="hero-pagination" aria-live="polite">01 / ${String(slideElements.length).padStart(2, '0')}</div>
    <button class="hero-next" aria-label="Next slide" type="button">→</button>
  `;
  carouselWrapper.appendChild(controls);

  // clear and append constructed carousel
  block.textContent = ''; // safe clear
  block.appendChild(carouselWrapper);

  // Carousel logic
  let currentSlide = 0;
  let autoplayInterval = null;

  const slides = track.querySelectorAll('.hero-slide');

  // If a slide has a data-bg-video and device is large enough, inject <video>
  function injectBackgroundVideos() {
    slides.forEach((s) => {
      const url = s.dataset.bgVideo;
      // Only inject video on larger screens and when user didn't prefer reduced motion
      if (url && window.innerWidth > 640 && !reduceMotion) {
        // avoid duplicate insertion
        if (!s.querySelector('.hero-bg-video')) {
          const v = document.createElement('video');
          v.className = 'hero-bg-video';
          v.src = url;
          v.autoplay = true;
          v.loop = true;
          v.muted = true;
          v.playsInline = true;
          v.preload = 'metadata';
          // ensure video doesn't interfere with pointer events
          v.setAttribute('aria-hidden', 'true');
          // insert as first child so overlay and content sit above
          s.insertBefore(v, s.firstChild);
        }
      } else {
        // remove video on small screens or reduced motion preference
        const existing = s.querySelector('.hero-bg-video');
        if (existing) existing.remove();
      }
    });
  }

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
    // don't autoplay if user prefers reduced motion
    if (reduceMotion) return;
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 5000);
  };

  // Bind controls safely
  const prevBtn = controls.querySelector('.hero-prev');
  const nextBtn = controls.querySelector('.hero-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoplay(); });

  // Pause on hover/focus (keyboard accessibility)
  carouselWrapper.addEventListener('mouseenter', stopAutoplay);
  carouselWrapper.addEventListener('mouseleave', startAutoplay);

  carouselWrapper.tabIndex = 0; // make focusable
  carouselWrapper.addEventListener('focusin', stopAutoplay);
  carouselWrapper.addEventListener('focusout', startAutoplay);

  carouselWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); nextSlide(); } // space
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
      diff > 0 ? nextSlide() : prevSlide();
      stopAutoplay();
    }
  }, { passive: true });

  // Initialize
  injectBackgroundVideos();
  updateCarousel();
  startAutoplay();

  // Re-evaluate responsive video/image choices on resize (debounced)
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // re-choose mobile/desktop background images if data-mobile-src provided
      slides.forEach((s, i) => {
        const imgEl = slideElements[i]?.querySelector(':scope > div:nth-child(3) img');
        const bgMobile = imgEl?.getAttribute('data-mobile-src') || '';
        const bgDesktop = imgEl?.getAttribute('data-desktop-src') || imgEl?.src || '';
        const chosen = (window.innerWidth <= 480 && bgMobile) ? bgMobile : bgDesktop;
        if (chosen) s.style.backgroundImage = `url('${chosen}')`;
      });
      injectBackgroundVideos();
    }, 120);
  }, { passive: true });

  // Cleanup when block is removed (editor)
  if (block.parentElement) {
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if ([...m.removedNodes].includes(block)) {
          stopAutoplay();
          mo.disconnect();
        }
      });
    });
    mo.observe(block.parentElement, { childList: true });
  }
}
