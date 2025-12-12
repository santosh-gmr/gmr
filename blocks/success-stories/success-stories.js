/**
 * success-stories.js — do not remove author modules while editing
 * - export default decorate(block)
 * - if wcmmode=edit or editor URL, do NOT hide/remove original wrappers
 * - otherwise (publish), hide originals to avoid duplicate content
 */

export default function decorate(block) {
  if (!block || !(block instanceof HTMLElement)) return;

  // Prevent double-decoration
  if (block.dataset.ssDecorated === 'true') return;
  block.dataset.ssDecorated = 'true';

  try {
    const text = (el) => (el && el.textContent ? el.textContent.trim() : '');

    // Detect author/edit mode:
    // 1) check wcmmode URL param (common in AEM: wcmmode=edit/preview/disabled)
    // 2) check for editor path like /editor.html (additional safety)
    let isEditMode = false;
    try {
      const url = (typeof window !== 'undefined' && window.location && window.location.href) ? new URL(window.location.href) : null;
      if (url) {
        const wcmmode = url.searchParams.get('wcmmode');
        if (wcmmode && wcmmode.toLowerCase() === 'edit') isEditMode = true;
        if ((url.pathname || '').includes('/editor.html')) isEditMode = true;
      }
    } catch (e) { /* ignore URL parse errors */ }

    // find direct child DIVs
    const childDivs = Array.from(block.children).filter(c => c && c.tagName && c.tagName.toLowerCase() === 'div');
    if (!childDivs.length) {
      // nothing to do
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    // determine page tag to match (global/aero etc.)
    let pageVal = 'global';
    try {
      const isAero = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.startsWith('/aero-gmr/');
      if (isAero) pageVal = 'aero';
    } catch (e) { /* ignore */ }

    // find marker DIV within the direct child divs (dynamic, not fixed index)
    const markerDiv = childDivs.find(div => {
      if (!div || !div.querySelectorAll) return false;
      const ps = Array.from(div.querySelectorAll('p')).map(p => p && p.textContent ? p.textContent.trim().toLowerCase() : '');
      return ps.some(t => t === pageVal);
    });

    // if no marker found -> nothing to show
    if (!markerDiv) {
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    const markerIndex = childDivs.indexOf(markerDiv);
    if (markerIndex === -1) {
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    // gather slides only from divs AFTER marker within same block
    const possibleSlides = childDivs.slice(markerIndex + 1);
    const slides = possibleSlides.filter(d => d && d.querySelector && (d.querySelector('picture') || d.querySelector('img') || d.querySelector('source')));

    if (!slides.length) {
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    // extract header fields safely from top of block
    const titleText = (childDivs[0] && childDivs[0].querySelector && childDivs[0].querySelector('p')) ? text(childDivs[0].querySelector('p')) : '';
    const descText  = (childDivs[1] && childDivs[1].querySelector && childDivs[1].querySelector('p')) ? text(childDivs[1].querySelector('p')) : '';
    const ctaText   = (childDivs[2] && childDivs[2].querySelector && childDivs[2].querySelector('p')) ? text(childDivs[2].querySelector('p')) : '';

    // Build cleaned wrapper (do NOT clear original content if in edit mode)
    const wrapper = document.createElement('div');
    // class name includes tag so you can style differently if needed
    const firstP = markerDiv.querySelector('p');
    const tagValue = firstP ? text(firstP).toLowerCase() : pageVal;
    wrapper.className = `success-stories-wrapper-${tagValue}`;

    // LEFT column
    const left = document.createElement('div'); left.className = 'success-left';
    const titleWrap = document.createElement('div'); const titleP = document.createElement('p'); titleP.className = 'story-title'; titleP.innerHTML = titleText || 'Success Stories'; titleWrap.appendChild(titleP);
    const descWrap  = document.createElement('div'); const descP  = document.createElement('p'); descP.className = 'story-desc'; descP.innerHTML = descText || ''; descWrap.appendChild(descP);
    const ctaWrap   = document.createElement('div'); const ctaLink = document.createElement('a'); ctaLink.className = 'cta-button'; ctaLink.href = '#'; ctaLink.textContent = ctaText || 'Explore Our Success Stories'; ctaWrap.appendChild(ctaLink);
    const arrowsWrap = document.createElement('div'); arrowsWrap.className = 'success-arrows';
    const prevBtn = document.createElement('button'); prevBtn.className = 'arrow-prev'; prevBtn.setAttribute('aria-label','Previous'); prevBtn.textContent = '←';
    const nextBtn = document.createElement('button'); nextBtn.className = 'arrow-next'; nextBtn.setAttribute('aria-label','Next'); nextBtn.textContent = '→';
    arrowsWrap.appendChild(prevBtn); arrowsWrap.appendChild(nextBtn);

    left.appendChild(titleWrap); left.appendChild(descWrap); left.appendChild(ctaWrap); left.appendChild(arrowsWrap);

    // RIGHT slider
    const right = document.createElement('div'); right.className = 'success-right';
    const slider = document.createElement('div'); slider.className = 'success-slider'; slider.setAttribute('aria-live','polite');

    // build slides (clone nodes to keep srcset)
    slides.forEach(src => {
      if (!src) return;
      const slideEl = document.createElement('article'); slideEl.className = 'slide';
      const pic = src.querySelector ? (src.querySelector('picture') || src.querySelector('img')) : null;
      if (pic) {
        const mediaWrap = document.createElement('div'); mediaWrap.className = 'slide-media';
        try { mediaWrap.appendChild(pic.cloneNode(true)); } catch (e) {}
        slideEl.appendChild(mediaWrap);
      }

      const pTags = src.querySelectorAll ? Array.from(src.querySelectorAll('p')).filter(p => p && p.textContent && p.textContent.trim()) : [];
      // title candidate
      let titleCandidate = null;
      for (const p of pTags) {
        const t = (p.textContent||'').trim().toLowerCase();
        if (t && t !== 'global' && t !== 'read more') { titleCandidate = p; break; }
      }
      if (titleCandidate) {
        const h = document.createElement('h3'); h.className = 'slide-title'; h.innerHTML = titleCandidate.textContent.trim(); slideEl.appendChild(h);
        const idx = pTags.indexOf(titleCandidate);
        if (pTags.length > idx + 1) {
          const ex = pTags[idx + 1].textContent.trim();
          if (ex && ex.toLowerCase() !== 'read more') { const p = document.createElement('p'); p.className = 'slide-excerpt'; p.innerHTML = ex; slideEl.appendChild(p); }
        }
      } else if (pTags.length) {
        const p = document.createElement('p'); p.className = 'slide-excerpt'; p.innerHTML = pTags[0].textContent.trim(); slideEl.appendChild(p);
      }

      // read more
      const readNode = src.querySelectorAll ? Array.from(src.querySelectorAll('p,a')).find(n => /read\s*more/i.test((n.textContent||'').trim())) : null;
      if (readNode) {
        const a = document.createElement('a'); a.className = 'slide-cta'; a.href = readNode.href || '#'; a.textContent = (readNode.textContent||'').trim() || 'Read More';
        slideEl.appendChild(a);
      }

      slider.appendChild(slideEl);
    });

    right.appendChild(slider);
    wrapper.appendChild(left);
    wrapper.appendChild(right);

    // If we're in edit mode, DON'T hide/remove originals: append cleaned wrapper after original content
    // If not edit mode (publish), hide matched wrapper(s) (to avoid duplicate content) and append cleaned wrapper
    if (isEditMode) {
      // append but keep original content visible for authoring
      block.appendChild(wrapper);
    } else {
      // hide the matched wrapper(s) in the entire block (only those which contain the page tag)
      const allWrappers = Array.from(block.querySelectorAll('.success-stories-wrapper'));
      allWrappers.forEach(w => {
        try {
          const hasTag = Array.from(w.querySelectorAll('p')).some(p => (p.textContent||'').trim().toLowerCase() === pageVal);
          if (hasTag) w.style.display = 'none';
        } catch (e) {}
      });
      // append cleaned wrapper
      block.appendChild(wrapper);
    }

    // --- Carousel (unchanged behavior) ---
    const GAP = 28;
    const AUTOPLAY_MS = 5000;
    const TRANS_MS = 420;

    const slideEls = Array.from(slider.children || []);
    if (!slideEls.length) {
      // nothing to show
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    slider.style.display = 'flex';
    slider.style.gap = GAP + 'px';
    slider.style.alignItems = 'stretch';
    slideEls.forEach(s => { if (s && s.style) s.style.flexShrink = '0'; });

    function slidesPerViewFromWidth() {
      const w = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200;
      if (w >= 1200) return 2;
      if (w >= 900) return 2;
      if (w >= 600) return 1;
      return 1;
    }
    function measureSlideWidth() {
      const r = (slideEls[0] && slideEls[0].getBoundingClientRect) ? slideEls[0].getBoundingClientRect() : null;
      if (r && r.width > 0) return Math.round(r.width);
      const cs = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(slideEls[0]) : null;
      return Math.round((cs && parseFloat(cs.minWidth)) || 360);
    }

    let slidesPerView = slidesPerViewFromWidth();
    let slideWidth = measureSlideWidth();
    let index = 0;
    let isAnimating = false;
    let autoplayTimer = null;

    function fullSize() { return slideWidth + GAP; }
    function clampIndex(i) { return Math.min(Math.max(i, 0), Math.max(0, slideEls.length - slidesPerView)); }
    function applyTransform(immediate = false) {
      const offset = -index * fullSize();
      if (immediate) slider.style.transition = 'none';
      else slider.style.transition = `transform ${TRANS_MS}ms cubic-bezier(.22,.9,.34,1)`;
      slider.style.transform = `translateX(${offset}px)`;
      if (immediate) { void slider.offsetHeight; slider.style.transition = `transform ${TRANS_MS}ms cubic-bezier(.22,.9,.34,1)`; }
    }
    function goTo(i) { if (isAnimating) return; isAnimating = true; index = clampIndex(i); applyTransform(false); setTimeout(() => { isAnimating = false; }, TRANS_MS + 30); }
    function next() { if (index >= slideEls.length - slidesPerView) goTo(0); else goTo(index + 1); restartAutoplay(); }
    function prev() { if (index <= 0) goTo(slideEls.length - slidesPerView); else goTo(index - 1); restartAutoplay(); }

    function startAutoplay() { stopAutoplay(); autoplayTimer = setInterval(() => next(), AUTOPLAY_MS); }
    function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    try { prevBtn && prevBtn.addEventListener && prevBtn.addEventListener('click', prev); } catch (e) {}
    try { nextBtn && nextBtn.addEventListener && nextBtn.addEventListener('click', next); } catch (e) {}

    block.addEventListener('mouseenter', stopAutoplay);
    block.addEventListener('mouseleave', startAutoplay);
    block.addEventListener('focusin', stopAutoplay);
    block.addEventListener('focusout', startAutoplay);
    block.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        slidesPerView = slidesPerViewFromWidth();
        slideWidth = measureSlideWidth();
        index = clampIndex(index);
        applyTransform(true);
      }, 120);
    });

    applyTransform(true);
    startAutoplay();

    // expose destroy helper
    block.__successStoriesDestroy = function destroy() {
      stopAutoplay();
      try { prevBtn && prevBtn.removeEventListener && prevBtn.removeEventListener('click', prev); } catch (e) {}
      try { nextBtn && nextBtn.removeEventListener && nextBtn.removeEventListener('click', next); } catch (e) {}
      block.removeEventListener('mouseenter', stopAutoplay);
      block.removeEventListener('mouseleave', startAutoplay);
      block.removeEventListener('focusin', stopAutoplay);
      block.removeEventListener('focusout', startAutoplay);
      window.removeEventListener('resize', this);
      delete block.dataset.ssDecorated;
    };

    block.dataset.blockStatus = 'loaded';
  } catch (err) {
    // fail-safe: mark loaded and allow later re-run
    console.error('success-stories decorate error', err);
    block.dataset.blockStatus = 'loaded';
    delete block.dataset.ssDecorated;
  }
}
