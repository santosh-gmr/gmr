/**
 * Businesses Accordion - Universal Editor Compatible
 * @param {HTMLElement} block - The businesses-section block element
 */
export default function decorate(block) {
  // Get all business items from the block
  const items = [...block.querySelectorAll('[data-aue-model="business-item"]')];
  
  if (!items.length) {
    console.warn('No business items found in businesses-section block');
    return;
  }

  // Extract header content
  const sectionTitle = block.querySelector('[data-aue-prop="sectionTitle"]')?.textContent?.trim() || '';
  const sectionSubtitle = block.querySelector('[data-aue-prop="sectionSubtitle"]')?.textContent?.trim() || '';
  const introText = block.querySelector('[data-aue-prop="introText"]')?.innerHTML || '';

  // Create main wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'businesses-accordion-wrapper';

  // Create header section
  const header = document.createElement('header');
  header.className = 'businesses-header';
  
  if (sectionTitle || sectionSubtitle) {
    const titleElement = document.createElement('h2');
    titleElement.innerHTML = `
      ${sectionTitle ? `${sectionTitle.replace('/', '').trim()}` : ''}
      ${sectionSubtitle ? ` <span>${sectionSubtitle}</span>` : ''}
    `.trim();
    header.appendChild(titleElement);
  }
  
  if (introText) {
    const introElement = document.createElement('div');
    introElement.className = 'intro-text';
    introElement.innerHTML = introText;
    header.appendChild(introElement);
  }

  wrapper.appendChild(header);

  // Create main container with two columns
  const mainContainer = document.createElement('div');
  mainContainer.className = 'businesses-accordion-container';

  // Create desktop image preview container
  const imagePreview = document.createElement('div');
  imagePreview.className = 'businesses-image-preview';

  // Create accordion container
  const accordion = document.createElement('div');
  accordion.className = 'businesses-accordion';
  accordion.id = 'businessesAccordion';
  accordion.setAttribute('role', 'tablist');
  accordion.setAttribute('aria-label', 'Business sectors');

  // Process each business item
  items.forEach((item, index) => {
    // Extract data from each item
    const imgElement = item.querySelector('[data-aue-prop="image"] img');
    const imageSrc = imgElement?.src || '';
    const imageAlt = imgElement?.alt || '';
    
    const title = item.querySelector('[data-aue-prop="title"]')?.textContent?.trim() || '';
    const description = item.querySelector('[data-aue-prop="description"]')?.innerHTML || '';
    const ctaLabel = item.querySelector('[data-aue-prop="ctaLabel"]')?.textContent?.trim() || '';
    const ctaLinkElement = item.querySelector('.button-container a');
    const ctaLink = ctaLinkElement?.href || '#';
    const ctaTitle = ctaLinkElement?.title || ctaLabel;

    // Create desktop image element
    const desktopImage = document.createElement('div');
    desktopImage.className = `desktop-image ${index === 0 ? 'active' : ''}`;
    desktopImage.setAttribute('data-index', index);
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt || title;
    img.loading = 'lazy';
    
    desktopImage.appendChild(img);
    imagePreview.appendChild(desktopImage);

    // Create accordion item
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    accordionItem.setAttribute('data-index', index);

    // Create accordion header
    const accordionHeader = document.createElement('div');
    accordionHeader.className = 'accordion-header';
    accordionHeader.setAttribute('role', 'heading');
    accordionHeader.setAttribute('aria-level', '3');

    const button = document.createElement('button');
    button.className = `accordion-button ${index === 0 ? '' : 'collapsed'}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('id', `tab-${index}`);
    button.setAttribute('aria-controls', `panel-${index}`);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');

    button.innerHTML = `
      <span class="accordion-title">${title}</span>
      <span class="accordion-icon" aria-hidden="true">${index === 0 ? '−' : '+'}</span>
    `;

    accordionHeader.appendChild(button);

    // Create accordion panel
    const accordionPanel = document.createElement('div');
    accordionPanel.id = `panel-${index}`;
    accordionPanel.className = `accordion-panel ${index === 0 ? 'active' : ''}`;
    accordionPanel.setAttribute('role', 'tabpanel');
    accordionPanel.setAttribute('aria-labelledby', `tab-${index}`);
    accordionPanel.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

    // Create mobile image element
    const mobileImage = document.createElement('div');
    mobileImage.className = 'mobile-image';
    mobileImage.setAttribute('data-index', index);
    
    const mobileImg = document.createElement('img');
    mobileImg.src = imageSrc;
    mobileImg.alt = imageAlt || title;
    mobileImg.loading = 'lazy';
    mobileImage.appendChild(mobileImg);

    // Build panel content
    accordionPanel.innerHTML = `
      <div class="accordion-content">
        <div class="business-description">${description}</div>
        ${ctaLabel ? `
          <div class="business-cta">
            <a href="${ctaLink}" class="button" title="${ctaTitle}">
              ${ctaLabel}
            </a>
          </div>
        ` : ''}
      </div>
    `;

    // Insert mobile image after CTA
    const accordionContent = accordionPanel.querySelector('.accordion-content');
    if (accordionContent) {
      accordionContent.appendChild(mobileImage);
    }

    // Assemble accordion item
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionPanel);
    accordion.appendChild(accordionItem);
  });

  // Add controls for keyboard navigation
  const controls = document.createElement('div');
  controls.className = 'accordion-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Accordion navigation');

  controls.innerHTML = `
    <button class="accordion-prev" type="button" aria-label="Previous business">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <div class="accordion-counter" aria-live="polite">
      <span class="current-item">1</span> / <span class="total-items">${items.length}</span>
    </div>
    <button class="accordion-next" type="button" aria-label="Next business">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  `;

  accordion.appendChild(controls);

  // Assemble main container
  mainContainer.appendChild(imagePreview);
  mainContainer.appendChild(accordion);
  wrapper.appendChild(mainContainer);

  // Clear block and add new structure
  block.innerHTML = '';
  block.appendChild(wrapper);

  // Accordion state
  let currentIndex = 0;
  const totalItems = items.length;

  // Update accordion state
  function updateAccordion(index) {
    // Update buttons
    const buttons = accordion.querySelectorAll('.accordion-button');
    const panels = accordion.querySelectorAll('.accordion-panel');
    const desktopImages = imagePreview.querySelectorAll('.desktop-image');
    const mobileImages = accordion.querySelectorAll('.mobile-image');

    buttons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('collapsed', !isActive);
      btn.setAttribute('aria-selected', isActive);
      btn.setAttribute('aria-expanded', isActive);
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      
      const icon = btn.querySelector('.accordion-icon');
      if (icon) {
        icon.textContent = isActive ? '−' : '+';
      }
    });

    panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });

    desktopImages.forEach((imgWrapper, i) => {
      imgWrapper.classList.toggle('active', i === index);
    });

    // Update mobile images visibility
    const isMobile = window.innerWidth < 992;
    mobileImages.forEach((mobileImg, i) => {
      if (isMobile) {
        mobileImg.style.display = i === index ? 'block' : 'none';
      } else {
        mobileImg.style.display = 'none';
      }
    });

    // Update counter
    const counter = accordion.querySelector('.accordion-counter .current-item');
    if (counter) {
      counter.textContent = index + 1;
    }

    // Update current index
    currentIndex = index;

    // Dispatch custom event
    const event = new CustomEvent('business-accordion:change', {
      detail: { index, total: totalItems }
    });
    block.dispatchEvent(event);
  }

  // Navigate to previous item
  function prevItem() {
    const newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    updateAccordion(newIndex);
    focusButton(newIndex);
  }

  // Navigate to next item
  function nextItem() {
    const newIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
    updateAccordion(newIndex);
    focusButton(newIndex);
  }

  // Focus on button
  function focusButton(index) {
    const button = accordion.querySelector(`#tab-${index}`);
    if (button) {
      button.focus();
    }
  }

  // Setup button click handlers
  const buttons = accordion.querySelectorAll('.accordion-button');
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      updateAccordion(index);
    });

    // Keyboard navigation within accordion
    button.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          nextItem();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          prevItem();
          break;
        case 'Home':
          e.preventDefault();
          updateAccordion(0);
          focusButton(0);
          break;
        case 'End':
          e.preventDefault();
          updateAccordion(totalItems - 1);
          focusButton(totalItems - 1);
          break;
      }
    });
  });

  // Setup control buttons
  const prevBtn = accordion.querySelector('.accordion-prev');
  const nextBtn = accordion.querySelector('.accordion-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', prevItem);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextItem);
  }

  // Handle responsive behavior
  function handleResponsive() {
    const isMobile = window.innerWidth < 992;
    const mobileImages = accordion.querySelectorAll('.mobile-image');
    const desktopImages = imagePreview.querySelectorAll('.desktop-image');

    if (isMobile) {
      // Mobile view
      imagePreview.style.display = 'none';
      
      mobileImages.forEach((mobileImg, i) => {
        mobileImg.style.display = i === currentIndex ? 'block' : 'none';
      });

      desktopImages.forEach(imgWrapper => {
        imgWrapper.style.display = 'none';
      });
    } else {
      // Desktop view
      imagePreview.style.display = 'block';
      
      mobileImages.forEach(mobileImg => {
        mobileImg.style.display = 'none';
      });

      desktopImages.forEach((imgWrapper, i) => {
        imgWrapper.style.display = i === currentIndex ? 'block' : 'none';
      });
    }
  }

  // Initial update
  updateAccordion(0);
  handleResponsive();

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResponsive, 250);
  });

  // Focus management for accessibility
  accordion.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('accordion-button')) {
      const index = parseInt(e.target.id.split('-')[1]);
      if (!isNaN(index) && index !== currentIndex) {
        updateAccordion(index);
      }
    }
  });

  // Cleanup on block removal (for Universal Editor)
  if (block.parentElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === block || node.contains(block)) {
            // Cleanup event listeners
            window.removeEventListener('resize', handleResponsive);
            observer.disconnect();
          }
        });
      });
    });

    observer.observe(block.parentElement, { childList: true, subtree: true });
  }

  // Public API
  block.BusinessAccordion = {
    openItem: (index) => {
      if (index >= 0 && index < totalItems) {
        updateAccordion(index);
        focusButton(index);
      }
    },
    closeAll: () => {
      updateAccordion(-1); // -1 means no item selected
    },
    getActiveIndex: () => currentIndex,
    next: nextItem,
    prev: prevItem
  };
}