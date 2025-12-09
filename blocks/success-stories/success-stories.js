/**
 * success-stories.js (AEM EDS block)
 * - Export default decorate(block)
 * - Filters to only build carousel when block contains a marker <p>global</p>
 * - Rebuilds a clean two-column layout and initializes a simple carousel
 */

export default function decorate(block) {

  if (!block || !(block instanceof HTMLElement)) return;

  // helpers
  const text = (el) => (el && el.textContent ? el.textContent.trim() : '');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // find direct child DIVs inside the block (the block provided is the ".success-stories.block")
  const childDivs = Array.from(block.children).filter((c) => c.tagName.toLowerCase() === 'div');

let markerIndex = 1;
  const p = childDivs[4].querySelector('p');
  const tagValue = text(p).toLowerCase();
  let pageVal = 'global';
  const isAero = window.location.pathname.startsWith('/aero-gmr/');
  if(isAero){
    pageVal = 'aero';
  }
  if (p && text(p).toLowerCase() === pageVal) {
    // --- Extract header info (title, description, CTA) from the top section of the block.
    // We assume title is in the first child div, description in second, CTA text in third.
    const titleText = (childDivs[0] && childDivs[0].querySelector('p')) ? text(childDivs[0].querySelector('p')) : '';
    const descText = (childDivs[1] && childDivs[1].querySelector('p')) ? text(childDivs[1].querySelector('p')) : '';
    const ctaText = (childDivs[2] && childDivs[2].querySelector('p')) ? text(childDivs[2].querySelector('p')) : '';

    // --- Collect slides: everything after the marker that contains an image/picture
    const possibleSlides = childDivs.slice(markerIndex + 1);
    const slides = possibleSlides.filter((d) => {
      return d.querySelector('picture') || d.querySelector('img') || d.querySelector('source');
    });

    // If no slides found, do nothing.
    if (!slides.length) return;

    // --- Build the new DOM structure
    // Clear the block and build wrapper structure expected by CSS/JS
    block.innerHTML = '';

    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'success-stories-wrapper-'+tagValue;

    // left column
    const left = document.createElement('div');
    left.className = 'success-left';

    const titleWrap = document.createElement('div');
    const titleP = document.createElement('p');
    titleP.className = 'story-title';
    titleP.innerHTML = titleText || 'Success Stories';
    titleWrap.appendChild(titleP);

    const descWrap = document.createElement('div');
    const descP = document.createElement('p');
    descP.className = 'story-desc';
    descP.innerHTML = descText || '';
    descWrap.appendChild(descP);

    const ctaWrap = document.createElement('div');
    const ctaLink = document.createElement('a');
    ctaLink.className = 'cta-button';
    ctaLink.href = '#';
    ctaLink.textContent = ctaText || 'Explore Our Success Stories';
    ctaWrap.appendChild(ctaLink);

    const arrowsWrap = document.createElement('div');
    arrowsWrap.className = 'success-arrows';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'arrow-prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.textContent = '←';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'arrow-next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.textContent = '→';
    arrowsWrap.appendChild(prevBtn);
    arrowsWrap.appendChild(nextBtn);

    left.appendChild(titleWrap);
    left.appendChild(descWrap);
    left.appendChild(ctaWrap);
    left.appendChild(arrowsWrap);

    // right column - slider track
    const right = document.createElement('div');
    right.className = 'success-right';

    const slider = document.createElement('div');
    slider.className = 'success-slider';
    slider.setAttribute('aria-live', 'polite');

    // build standardized slides from extracted nodes
    slides.forEach((s) => {
      const slideEl = document.createElement('article');
      slideEl.className = 'slide';

      // image: prefer picture > img, otherwise img
      const pic = s.querySelector('picture') || s.querySelector('img') || null;
      if (pic) {
        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'slide-media';
        // clone picture/img to preserve srcset and responsiveness
        mediaWrap.appendChild(pic.cloneNode(true));
        slideEl.appendChild(mediaWrap);
      }

      // title: usually the next immediate <div><p> after picture in original markup
      const titleNode = s.querySelector('div > p') || s.querySelector('h3') || null;
      if (titleNode) {
        const h = document.createElement('h3');
        h.className = 'slide-title';
        h.innerHTML = text(titleNode);
        slideEl.appendChild(h);
      }

      // excerpt: often the following <div><p>
      // We'll look for the first <p> that isn't the title or marker above
      const pTags = Array.from(s.querySelectorAll('p')).filter(p => text(p) && text(p).toLowerCase() !== 'read more');
      let excerptText = '';
      if (pTags.length > 1) {
        // if there are multiple, first was likely title, second excerpt
        excerptText = text(pTags[1]) || '';
      } else if (pTags.length === 1) {
        // single p — use it as excerpt (title might be elsewhere)
        excerptText = text(pTags[0]) || '';
      }
      if (excerptText) {
        const p = document.createElement('p');
        p.className = 'slide-excerpt';
        p.innerHTML = excerptText;
        slideEl.appendChild(p);
      }

      // CTA "Read More" — look for a p or a text 'Read More'
      const readMoreNode = Array.from(s.querySelectorAll('p, a')).find(n => /read\s*more/i.test(text(n)));
      if (readMoreNode) {
        const a = document.createElement('a');
        a.className = 'slide-cta';
        a.href = '#';
        a.textContent = text(readMoreNode) || 'Read More';
        slideEl.appendChild(a);
      }

      slider.appendChild(slideEl);
    });

    // append columns into wrapper and wrapper into block
    right.appendChild(slider);
    wrapper.appendChild(left);
    wrapper.appendChild(right);
    block.appendChild(wrapper);

    // --- Lightweight carousel behavior (2 on desktop, 1 on mobile)
    // Basic variables & helpers
    const GAP = 28; // px — keep in sync with CSS
    const AUTOPLAY_MS = 5000;
    const TRANS_MS = 420;
    let slidesPerView = getSlidesPerView();
    let slideEls = Array.from(slider.children);
    let slideWidth = measureSlideWidth();
    let index = 0;
    let isAnimating = false;
    let autoplayTimer = null;

    // measure function tries to get exact slide width; falls back to computed style/min-width
    function measureSlideWidth() {
      if (!slideEls[0]) return 360;
      const r = slideEls[0].getBoundingClientRect();
      if (r && r.width > 0) return Math.round(r.width);
      // fallback to CSS min-width parsing
      const cs = window.getComputedStyle(slideEls[0]);
      const mw = parseFloat(cs.minWidth) || 360;
      return Math.round(mw);
    }

    function getSlidesPerView() {
      const w = window.innerWidth;
      if (w >= 1200) return 2;
      if (w >= 900) return 2;
      if (w >= 600) return 1;
      return 1;
    }

    function fullSlideSize() {
      return slideWidth + GAP;
    }

    function applyTransform(immediate = false) {
      const offset = -index * fullSlideSize();
      if (immediate) slider.style.transition = 'none';
      else slider.style.transition = `transform ${TRANS_MS}ms cubic-bezier(.22,.9,.34,1)`;
      slider.style.transform = `translateX(${offset}px)`;
      if (immediate) {
        // force repaint then restore transition for future moves
        void slider.offsetHeight;
        slider.style.transition = `transform ${TRANS_MS}ms cubic-bezier(.22,.9,.34,1)`;
      }
    }

    function clampIndex(i) {
      const max = Math.max(0, slideEls.length - slidesPerView);
      return Math.min(Math.max(i, 0), max);
    }

    function goTo(i) {
      if (isAnimating) return;
      isAnimating = true;
      index = clampIndex(i);
      applyTransform(false);
      setTimeout(() => { isAnimating = false; }, TRANS_MS + 30);
    }

    function next() {
      goTo(index + 1);
      restartAutoplay();
    }
    function prev() {
      goTo(index - 1);
      restartAutoplay();
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        // if at end, wrap to 0
        if (index >= slideEls.length - slidesPerView) goTo(0);
        else goTo(index + 1);
      }, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    // wire arrow buttons
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // pause on hover/focus
    block.addEventListener('mouseenter', stopAutoplay);
    block.addEventListener('mouseleave', startAutoplay);
    block.addEventListener('focusin', stopAutoplay);
    block.addEventListener('focusout', startAutoplay);

    // keyboard navigation
    block.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // responsive handling
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        slidesPerView = getSlidesPerView();
        slideWidth = measureSlideWidth();
        // ensure index within new bounds
        index = clampIndex(index);
        applyTransform(true);
      }, 120);
    });

    // initial layout
    // ensure slider has display:flex and prevents wrapping
    slider.style.display = 'flex';
    slider.style.gap = GAP + 'px';
    slider.style.alignItems = 'stretch';
    slideEls.forEach((s) => s.style.flexShrink = '0');

    // set starting transform and start autoplay
    applyTransform(true);
    startAutoplay();

    // expose destroy helper (useful during client-side updates)
    block.__successStoriesDestroy = () => {
      stopAutoplay();
      prevBtn.removeEventListener('click', prev);
      nextBtn.removeEventListener('click', next);
      window.removeEventListener('resize', this);
      block.removeEventListener('mouseenter', stopAutoplay);
      block.removeEventListener('mouseleave', startAutoplay);
    };
  }else{
   block.innerHTML = '';
 // block.dataset.blockStatus = 'loaded';
  }

  // End decorate()
}
