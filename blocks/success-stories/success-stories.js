/**
 * success-stories.js — fixed & defensive
 * - export default decorate(block)
 * - finds marker div dynamically (no fixed index)
 * - safe guards for author/publish environments
 */

export default function decorate(block) {
  if (!block || !(block instanceof HTMLElement)) return;

  // Prevent double-decoration
  if (block.dataset.ssDecorated === 'true') return;
  block.dataset.ssDecorated = 'true';

  try {
    const text = (el) => (el && el.textContent ? el.textContent.trim() : '');
    const childDivs = Array.from(block.children).filter(c => c && c.tagName && c.tagName.toLowerCase() === 'div');

    // Compute expected tag value based on pathname (fallback to 'global')
    let pageVal = 'global';
    try {
      const isAero = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.startsWith('/aero-gmr/');
      if (isAero) pageVal = 'aero';
    } catch (e) { /* ignore */ }

    // Find the child DIV that contains a <p> equal to pageVal (case-insensitive)
    const markerDiv = childDivs.find(div => {
      if (!div || !div.querySelectorAll) return false;
      const ps = Array.from(div.querySelectorAll('p')).map(p => p && p.textContent ? p.textContent.trim().toLowerCase() : '');
      return ps.some(t => t === pageVal);
    });

    // If no marker found -> clear block and mark loaded
    if (!markerDiv) {
      block.innerHTML = '';
      //block.dataset.blockStatus = 'loaded';
      //delete block.dataset.ssDecorated;
      return;
    }

    // Get index of marker within direct child divs
    const markerIndex = childDivs.indexOf(markerDiv);
    if (markerIndex === -1) {
      block.innerHTML = '';
      block.dataset.blockStatus = 'loaded';
      delete block.dataset.ssDecorated;
      return;
    }

    // Extract header fields from the top of the same block (safe guards)
    const titleText = (childDivs[0] && childDivs[0].querySelector && childDivs[0].querySelector('p')) ? text(childDivs[0].querySelector('p')) : '';
    const descText  = (childDivs[1] && childDivs[1].querySelector && childDivs[1].querySelector('p')) ? text(childDivs[1].querySelector('p')) : '';
    const ctaText   = (childDivs[2] && childDivs[2].querySelector && childDivs[2].querySelector('p')) ? text(childDivs[2].querySelector('p')) : '';

    // Collect candidate slides only from the SAME wrapper area: divs AFTER the marker within childDivs
    const possibleSlides = childDivs.slice(markerIndex + 1);
    const slides = possibleSlides.filter(d => d && d.querySelector && (d.querySelector('picture') || d.querySelector('img') || d.querySelector('source')));

    if (!slides.length) {
      block.innerHTML = '';
      ///block.dataset.blockStatus = 'loaded';
      //delete block.dataset.ssDecorated;
      return;
    }

    // Build cleaned DOM
    block.innerHTML = ''; // clear original markup (if you prefer hide instead of remove, change)
    const wrapper = document.createElement('div');
    // add a class that includes tag value for styling if needed
    const firstP = markerDiv.querySelector('p');
    const tagValue = firstP ? text(firstP).toLowerCase() : 'global';
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

    // RIGHT: slider
    const right = document.createElement('div'); right.className = 'success-right';
    const slider = document.createElement('div'); slider.className = 'success-slider'; slider.setAttribute('aria-live','polite');

    // create slides (clone image nodes to preserve srcset)
    slides.forEach(src => {
      if (!src) return;
      const slideEl = document.createElement('article'); slideEl.className = 'slide';
      const pic = src.querySelector ? (src.querySelector('picture') || src.querySelector('img')) : null;
      if (pic) {
        const mediaWrap = document.createElement('div'); mediaWrap.className = 'slide-media';
        try { mediaWrap.appendChild(pic.cloneNode(true)); } catch (e) {}
        slideEl.appendChild(mediaWrap);
      }

      // title/excerpt
      const pTags = src.querySelectorAll ? Array.from(src.querySelectorAll('p')).filter(p => p && p.textContent && p.textContent.trim()) : [];
      // pick first meaningful p for title (skip 'global'/'read more')
      let titleCandidate = null;
      for (const p of pTags) {
        const t = p.textContent.trim().toLowerCase();
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
    block.appendChild(wrapper);

    // --- carousel behaviour (lightweight, same as before) ---
    const GAP = 28;
    const AUTOPLAY_MS = 5000;
    const TRANS_MS = 420;

    const slideEls = Array.from(slider.children || []);
    if (!slideEls.length) {
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
      const r = slideEls[0] && slideEls[0].getBoundingClientRect ? slideEls[0].getBoundingClientRect() : null;
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

    // attach safely
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

    // expose destroy to clean up
    block.__successStoriesDestroy = function destroy() {
      stopAutoplay();
      try { prevBtn && prevBtn.removeEventListener && prevBtn.removeEventListener('click', prev); } catch (e) {}
      try { nextBtn && nextBtn.removeEventListener && nextBtn.removeEventListener('click', next); } catch (e) {}
      block.removeEventListener('mouseenter', stopAutoplay);
      block.removeEventListener('mouseleave', startAutoplay);
      block.removeEventListener('focusin', stopAutoplay);
      block.removeEventListener('focusout', startAutoplay);
      window.removeEventListener('resize', this);
      //delete block.dataset.ssDecorated;
    };

    // done
    block.dataset.blockStatus = 'loaded';
  } catch (err) {
    console.error('success-stories decorate error', err);
    //block.dataset.blockStatus = 'loaded';
    //delete block.dataset.ssDecorated;
  }
}
