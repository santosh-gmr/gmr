// Replace your existing decorate() with this version.
// It preserves your layout & classes but finds elements flexibly instead of using fixed indexes.
export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'business-accordion-wrapper';

  // Grab original child nodes (the editors may have merged things)
  const children = [...block.children];

  // --- HEADER ---
  const header = document.createElement('header');
  header.className = 'business-accordion-header';

  // Robust title/subtitle extraction:
  // If the first child contains both title and subtitle in one node, try splitting on <br> or newline,
  // otherwise use the first two blocks if they exist.
  const first = children[0] || null;
  const second = children[1] || null;

  let titleText = '';
  let subtitleText = '';

  if (first) {
    // prefer heading tags if present
    const heading = first.querySelector('h1,h2,h3,h4');
    if (heading) {
      titleText = heading.textContent.trim();
      // subtitle may be in a small/span inside heading or following sibling
      const small = heading.querySelector('small,span');
      if (small) subtitleText = small.textContent.trim();
    } else {
      // fallback: split by <br> or newline
      const html = first.innerHTML.trim();
      if (html.includes('<br') || html.includes('\n')) {
        // split by br or newline, take first as title second as subtitle
        const temp = html.replace(/<br\s*\/?>/gi, '\n').split('\n').map(s => s.trim()).filter(Boolean);
        titleText = temp[0] || '';
        subtitleText = temp[1] || '';
      } else {
        // if second exists, use first as title, second as subtitle
        if (second) {
          titleText = first.textContent.trim();
          subtitleText = second.textContent.trim();
        } else {
          // single node only: use it as title
          titleText = first.textContent.trim();
        }
      }
    }
  }

  const h2 = document.createElement('h2');
  h2.innerHTML = `<span class="title">${titleText}</span>` + (subtitleText ? ` <span class="subtitle"> ${subtitleText}</span>` : '');
  header.appendChild(h2);

  // intro text can be in third child or combined; find the next element that has more text (not the picture)
  const introCandidate = children.find((c, i) => i >= 2 && c && c.textContent.trim().length > 0 && !c.querySelector('picture') && c.querySelectorAll('p,div').length >= 0);
  if (introCandidate) {
    const intro = document.createElement('div');
    intro.className = 'intro-text';
    // keep the rich HTML editors may have produced
    intro.innerHTML = introCandidate.innerHTML.trim();
    header.appendChild(intro);
  }

  wrapper.appendChild(header);

  // --- ITEMS ---
  // Identify business items — all remaining blocks that look like items (contain an image/title/description/link)
  // We'll take children after the header-related nodes. A robust way: find nodes that contain either picture/img or an anchor
  const itemCandidates = children.filter((c, idx) => {
    // skip the header-like nodes we already consumed (first 3 tends to be header/title/intro)
    // but don't rely on indexes only: include nodes that have content look like an item.
    const hasPicture = !!c.querySelector('picture, img');
    const hasLink = !!c.querySelector('a');
    const textLen = (c.textContent || '').trim().length;
    return (hasPicture || hasLink || textLen > 10) && idx >= 2;
  });

  // Build the accordion container & image preview area (keeping your existing classes)
  const accordionContainer = document.createElement('div');
  accordionContainer.className = 'business-accordion-container';

  const imagePreview = document.createElement('div');
  imagePreview.className = 'business-image-preview';
  const imageContainer = document.createElement('div');
  imageContainer.className = 'business-image-container';

  // Create accordion element
  const accordion = document.createElement('div');
  accordion.className = 'accordion';
  accordion.id = 'businessAccordion';

  // Helper functions for extracting elements from an item block
  function extractImage(item) {
    // prefer <picture>, otherwise first <img>
    const picture = item.querySelector('picture');
    if (picture) return picture.cloneNode(true);
    const img = item.querySelector('img');
    if (img) {
      // create a simple picture-like wrapper with the img
      const p = document.createElement('picture');
      p.appendChild(img.cloneNode(true));
      return p;
    }
    return null;
  }

  function extractTitle(item) {
    const heading = item.querySelector('h1,h2,h3,h4');
    if (heading) return heading.textContent.trim();
    // sometimes editors put title in strong or bold
    const bold = item.querySelector('strong,b');
    if (bold && bold.textContent.trim().length >= 2) return bold.textContent.trim();
    // fallback: find the child element with the largest text length (likely the title)
    let best = '';
    [...item.children].forEach(ch => {
      const t = (ch.textContent || '').trim();
      if (t.length > best.length) best = t;
    });
    // if nothing, fallback to entire item text (shortened)
    if (!best) best = (item.textContent || '').trim().split('\n').map(s=>s.trim()).filter(Boolean)[0] || '';
    return best;
  }

  function extractDescription(item) {
    // join all <p> elements or anything with text except the title and links
    const ps = [...item.querySelectorAll('p')].map(p => p.innerHTML.trim()).filter(Boolean);
    if (ps.length) return ps.join('');
    // if no <p>, take content of the node(s) that are not title or links or picture
    const parts = [];
    [...item.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        if (t) parts.push(t);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        if (el.matches('picture, img, a, h1, h2, h3, h4, strong, b')) return;
        const txt = el.innerHTML.trim();
        if (txt) parts.push(txt);
      }
    });
    return parts.join('<br/>');
  }

  function extractCTA(item) {
    // return the first anchor with href
    const a = item.querySelector('a[href]');
    if (a) {
      return { href: a.href, text: (a.textContent || 'READ MORE').trim(), title: a.title || a.textContent.trim() };
    }
    // fallback: any link-like text
    return null;
  }

  // Build items
  itemCandidates.forEach((item, index) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = `accordion-item ${index === 0 ? 'active' : ''}`;

    const accordionHeader = document.createElement('h2');
    accordionHeader.className = `accordion-header ${index === 0 ? 'active' : ''}`;
    accordionHeader.id = `heading${index}`;

    const button = document.createElement('button');
    button.className = `accordion-button ${index === 0 ? 'active' : ''}`;
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse${index}`);
    button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-controls', `collapse${index}`);

    // Title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'business-title';
    titleSpan.textContent = extractTitle(item) || '';
    button.appendChild(titleSpan);

    // Icon wrapper (same as your original)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.setAttribute('aria-hidden', 'true');

    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'icon-wrapper';

    const plusIcon = document.createElement('span');
    plusIcon.className = `plus-icon ${index === 0 ? 'd-none' : ''}`;
    plusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/></svg>`;

    const minusIcon = document.createElement('span');
    minusIcon.className = `minus-icon ${index === 0 ? '' : 'd-none'}`;
    minusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/></svg>`;

    iconWrapper.appendChild(plusIcon);
    iconWrapper.appendChild(minusIcon);
    iconSpan.appendChild(iconWrapper);
    button.appendChild(iconSpan);

    accordionHeader.appendChild(button);
    accordionItem.appendChild(accordionHeader);

    // Collapse body
    const collapseDiv = document.createElement('div');
    collapseDiv.id = `collapse${index}`;
    collapseDiv.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
    collapseDiv.setAttribute('aria-labelledby', `heading${index}`);
    collapseDiv.setAttribute('data-bs-parent', '#businessAccordion');

    const accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';

    // Description (join multiple paragraphs)
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'business-description';
    const desc = extractDescription(item);
    if (desc) {
      // preserve HTML if any
      descriptionDiv.innerHTML = desc;
    }
    accordionBody.appendChild(descriptionDiv);

    // CTA
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'business-cta';
    const cta = extractCTA(item);
    const ctaLink = document.createElement('a');
    ctaLink.className = 'btn btn-transparent';
    if (cta) {
      ctaLink.href = cta.href;
      ctaLink.title = cta.title || '';
      ctaLink.textContent = cta.text || 'READ MORE';
    } else {
      ctaLink.href = '#';
      ctaLink.textContent = 'READ MORE';
    }
    ctaDiv.appendChild(ctaLink);
    accordionBody.appendChild(ctaDiv);

    // Mobile image — clone picture/img if present
    const mobileImageDiv = document.createElement('div');
    mobileImageDiv.className = 'mobile-business-image';
    mobileImageDiv.setAttribute('data-index', index);
    const mobilePicture = extractImage(item);
    if (mobilePicture) mobileImageDiv.appendChild(mobilePicture);
    accordionBody.appendChild(mobileImageDiv);

    collapseDiv.appendChild(accordionBody);
    accordionItem.appendChild(collapseDiv);
    accordion.appendChild(accordionItem);

    // Desktop preview images (kept outside accordion body)
    const desktopImageDiv = document.createElement('div');
    desktopImageDiv.className = `desktop-business-image ${index === 0 ? 'active' : ''}`;
    desktopImageDiv.setAttribute('data-index', index);
    const desktopPicture = extractImage(item);
    if (desktopPicture) desktopImageDiv.appendChild(desktopPicture);
    imageContainer.appendChild(desktopImageDiv);
  });

  imagePreview.appendChild(imageContainer);
  accordionContainer.appendChild(imagePreview);
  accordionContainer.appendChild(accordion);
  wrapper.appendChild(accordionContainer);

  // Replace original block content with our wrapper
  block.innerHTML = '';
  block.appendChild(wrapper);

  // add minimal responsive style safeguards (keeps your CSS intact)
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 767px) {
      .business-image-preview { display: none !important; }
      .mobile-business-image { display: block !important; margin-top: 20px; }
      .mobile-business-image picture, .mobile-business-image img { width: 100%; height: auto; }
    }
    @media (min-width: 768px) {
      .mobile-business-image { display: none !important; }
      .business-image-preview { display: block !important; }
    }
  `;
  document.head.appendChild(style);

  // Event wiring for collapse toggle (keeps your existing behavior)
  setTimeout(() => {
    const wrapperEl = wrapper;
    const collapseEls = wrapperEl.querySelectorAll('.accordion-collapse');
    const desktopImages = wrapperEl.querySelectorAll('.desktop-business-image');
    const accordionItems = wrapperEl.querySelectorAll('.accordion-item');
    const accordionHeaders = wrapperEl.querySelectorAll('.accordion-header');
    const accordionButtons = wrapperEl.querySelectorAll('.accordion-button');

    // If Bootstrap is present, use its events; otherwise fall back to manual toggling
    collapseEls.forEach((el, idx) => {
      el.addEventListener('show.bs.collapse', function () {
        accordionItems.forEach(i => i.classList.remove('active'));
        accordionHeaders.forEach(h => h.classList.remove('active'));
        accordionButtons.forEach(b => b.classList.remove('active'));
        desktopImages.forEach(d => d.classList.remove('active'));

        accordionItems[idx].classList.add('active');
        accordionHeaders[idx].classList.add('active');
        accordionButtons[idx].classList.add('active');
        desktopImages[idx] && desktopImages[idx].classList.add('active');

        wrapperEl.querySelectorAll('.plus-icon').forEach(p => p.classList.remove('d-none'));
        wrapperEl.querySelectorAll('.minus-icon').forEach(m => m.classList.add('d-none'));
        const curPlus = accordionButtons[idx].querySelector('.plus-icon');
        const curMinus = accordionButtons[idx].querySelector('.minus-icon');
        if (curPlus) curPlus.classList.add('d-none');
        if (curMinus) curMinus.classList.remove('d-none');
      });

      el.addEventListener('hide.bs.collapse', function () {
        // keep icon state correct if last open closes
        const open = wrapperEl.querySelectorAll('.accordion-collapse.show');
        if (open.length === 0) {
          accordionItems[idx].classList.remove('active');
          accordionHeaders[idx].classList.remove('active');
          accordionButtons[idx].classList.remove('active');
          const curPlus = accordionButtons[idx].querySelector('.plus-icon');
          const curMinus = accordionButtons[idx].querySelector('.minus-icon');
          if (curPlus) curPlus.classList.remove('d-none');
          if (curMinus) curMinus.classList.add('d-none');
        }
      });
    });

    // Manual toggles when bootstrap isn't present
    accordionButtons.forEach((btn, i) => {
      btn.addEventListener('click', function (e) {
        if (typeof bootstrap !== 'undefined') return; // let bootstrap handle it
        const targetId = this.getAttribute('data-bs-target');
        const target = wrapperEl.querySelector(targetId);
        const isOpen = target.classList.contains('show');

        if (isOpen) {
          target.classList.remove('show');
          accordionItems[i].classList.remove('active');
          accordionHeaders[i].classList.remove('active');
          this.classList.remove('active');
          const plus = this.querySelector('.plus-icon');
          const minus = this.querySelector('.minus-icon');
          if (plus) plus.classList.remove('d-none');
          if (minus) minus.classList.add('d-none');
        } else {
          // close others
          wrapperEl.querySelectorAll('.accordion-collapse.show').forEach(x => x.classList.remove('show'));
          accordionItems.forEach(it => it.classList.remove('active'));
          accordionHeaders.forEach(h => h.classList.remove('active'));
          accordionButtons.forEach(b => b.classList.remove('active'));
          desktopImages.forEach(d => d.classList.remove('active'));

          target.classList.add('show');
          accordionItems[i].classList.add('active');
          accordionHeaders[i].classList.add('active');
          this.classList.add('active');
          desktopImages[i] && desktopImages[i].classList.add('active');

          wrapperEl.querySelectorAll('.plus-icon').forEach(p => p.classList.remove('d-none'));
          wrapperEl.querySelectorAll('.minus-icon').forEach(m => m.classList.add('d-none'));

          const plus = this.querySelector('.plus-icon');
          const minus = this.querySelector('.minus-icon');
          if (plus) plus.classList.add('d-none');
          if (minus) minus.classList.remove('d-none');
        }
      });
    });

    // responsive behavior
    function handleResponsive() {
      const mobile = window.innerWidth <= 767;
      wrapperEl.querySelectorAll('.mobile-business-image').forEach(mi => {
        mi.style.display = mobile ? 'block' : 'none';
      });
    }
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
  }, 50);
}
