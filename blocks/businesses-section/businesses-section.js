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
  wrapper.className = 'business-accordion-wrapper';

  // Create header section
  const header = document.createElement('header');
  header.className = 'business-accordion-header';
  
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
  mainContainer.className = 'business-accordion-container';

  // Create desktop image preview container
  const imagePreview = document.createElement('div');
  imagePreview.className = 'business-image-preview';

  // Create Bootstrap accordion container
  const accordionContainer = document.createElement('div');
  accordionContainer.className = 'accordion';
  accordionContainer.id = 'businessAccordion';

  // Create image container for desktop view
  const imageContainer = document.createElement('div');
  imageContainer.className = 'business-image-container';
  
  // Process each business item
  items.forEach((item, index) => {
    // Extract data from each item
    const pictureElement = item.querySelector('[data-aue-prop="image"]');
    let imageSrc = '';
    
    // Try different ways to get the image source
    if (pictureElement) {
      // Check for img tag first
      const imgElement = pictureElement.querySelector('img');
      if (imgElement && imgElement.src) {
        imageSrc = imgElement.src;
      } else {
        // Check for source tag
        const sourceElement = pictureElement.querySelector('source');
        if (sourceElement && sourceElement.srcset) {
          imageSrc = sourceElement.srcset.split(' ')[0]; // Get first src from srcset
        }
      }
    }
    
    const imageAlt = pictureElement?.querySelector('img')?.alt || '';
    
    const title = item.querySelector('[data-aue-prop="title"]')?.textContent?.trim() || '';
    const description = item.querySelector('[data-aue-prop="description"]')?.innerHTML || '';
    const ctaLabel = item.querySelector('[data-aue-prop="ctaLabel"]')?.textContent?.trim() || '';
    const ctaLinkElement = item.querySelector('.button-container a');
    const ctaLink = ctaLinkElement?.href || '#';
    const ctaTitle = ctaLinkElement?.title || ctaLabel;

    // Create image for desktop preview
    if (imageSrc) {
      const desktopImage = document.createElement('div');
      desktopImage.className = `desktop-business-image ${index === 0 ? 'active' : ''}`;
      desktopImage.setAttribute('data-index', index);
      
      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = imageAlt || title;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      
      desktopImage.appendChild(img);
      imageContainer.appendChild(desktopImage);
    }

    // Create Bootstrap accordion item
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';

    // Create accordion header (Bootstrap style)
    const accordionHeader = document.createElement('h2');
    accordionHeader.className = 'accordion-header';
    accordionHeader.id = `heading${index}`;

    const button = document.createElement('button');
    button.className = `accordion-button ${index === 0 ? '' : 'collapsed'}`;
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse${index}`);
    button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    button.setAttribute('aria-controls', `collapse${index}`);

    button.innerHTML = `
      <span class="business-title">${title}</span>
      <span class="accordion-icon" aria-hidden="true">${index === 0 ? '−' : '+'}</span>
    `;

    accordionHeader.appendChild(button);

    // Create accordion collapse (Bootstrap style)
    const accordionCollapse = document.createElement('div');
    accordionCollapse.id = `collapse${index}`;
    accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
    accordionCollapse.setAttribute('aria-labelledby', `heading${index}`);
    accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');

    // Create mobile image element
    const mobileImage = document.createElement('div');
    mobileImage.className = 'mobile-business-image';
    mobileImage.setAttribute('data-index', index);
    
    if (imageSrc) {
      const mobileImg = document.createElement('img');
      mobileImg.src = imageSrc;
      mobileImg.alt = imageAlt || title;
      mobileImg.loading = 'lazy';
      mobileImg.style.width = '100%';
      mobileImg.style.maxHeight = '300px';
      mobileImg.style.objectFit = 'cover';
      mobileImg.style.borderRadius = '8px';
      mobileImage.appendChild(mobileImg);
    }

    // Build accordion body content
    const accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';
    accordionBody.innerHTML = `
      <div class="business-description">${description}</div>
      ${ctaLabel ? `
        <div class="business-cta">
          <a href="${ctaLink}" class="btn btn-primary" title="${ctaTitle}">
            ${ctaLabel}
          </a>
        </div>
      ` : ''}
    `;

    // Add mobile image to accordion body
    accordionBody.appendChild(mobileImage);

    // Assemble accordion collapse
    accordionCollapse.appendChild(accordionBody);

    // Assemble accordion item
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionCollapse);

    // Add to accordion container
    accordionContainer.appendChild(accordionItem);
  });

  // Add image container to preview
  imagePreview.appendChild(imageContainer);

  // Assemble main container
  mainContainer.appendChild(imagePreview);
  mainContainer.appendChild(accordionContainer);
  wrapper.appendChild(mainContainer);

  // Clear block and add new structure
  block.innerHTML = '';
  block.appendChild(wrapper);

  // Initialize accordion functionality
  initAccordionFunctionality(accordionContainer, imageContainer);
  setupResponsiveBehavior(imageContainer);

  // Public API
  block.BusinessAccordion = {
    openItem: (index) => {
      const button = document.querySelector(`#heading${index} .accordion-button`);
      if (button) {
        button.click();
      }
    },
    getActiveIndex: () => {
      const activeItem = document.querySelector('.accordion-item .accordion-collapse.show');
      if (activeItem) {
        const id = activeItem.id;
        const match = id.match(/collapse(\d+)/);
        return match ? parseInt(match[1]) : -1;
      }
      return -1;
    }
  };
}

/**
 * Initialize accordion functionality with Bootstrap-like behavior
 */
function initAccordionFunctionality(accordion, imageContainer) {
  const buttons = accordion.querySelectorAll('.accordion-button');
  const desktopImages = imageContainer.querySelectorAll('.desktop-business-image');
  const mobileImages = accordion.querySelectorAll('.mobile-business-image');

  // Set initial active image
  if (desktopImages.length > 0) {
    desktopImages[0].classList.add('active');
  }

  // Add click handlers for accordion buttons
  buttons.forEach((button, index) => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isActive = !this.classList.contains('collapsed');
      
      if (!isActive) {
        // Update all buttons
        buttons.forEach((btn, i) => {
          const shouldBeActive = i === index;
          btn.classList.toggle('collapsed', !shouldBeActive);
          btn.setAttribute('aria-expanded', shouldBeActive);
          
          const icon = btn.querySelector('.accordion-icon');
          if (icon) {
            icon.textContent = shouldBeActive ? '−' : '+';
          }
        });

        // Update desktop images
        desktopImages.forEach((img, i) => {
          img.classList.toggle('active', i === index);
        });

        // Update mobile images visibility
        const isMobile = window.innerWidth < 992;
        if (isMobile) {
          mobileImages.forEach((mobileImg, i) => {
            if (mobileImg.parentElement) {
              mobileImg.style.display = i === index ? 'block' : 'none';
            }
          });
        }
      }
    });

    // Add keyboard navigation
    button.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          button.click();
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (index + 1) % buttons.length;
          buttons[nextIndex].focus();
          buttons[nextIndex].click();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (index - 1 + buttons.length) % buttons.length;
          buttons[prevIndex].focus();
          buttons[prevIndex].click();
          break;
        case 'Home':
          e.preventDefault();
          buttons[0].focus();
          buttons[0].click();
          break;
        case 'End':
          e.preventDefault();
          buttons[buttons.length - 1].focus();
          buttons[buttons.length - 1].click();
          break;
      }
    });
  });

  // Initialize Bootstrap Collapse if available
  if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
    const collapseElements = accordion.querySelectorAll('.accordion-collapse');
    collapseElements.forEach(collapseEl => {
      new bootstrap.Collapse(collapseEl, {
        toggle: false
      });

      collapseEl.addEventListener('show.bs.collapse', function(e) {
        const item = this.closest('.accordion-item');
        const button = item.querySelector('.accordion-button');
        const index = Array.from(buttons).indexOf(button);
        
        // Update desktop images
        desktopImages.forEach((img, i) => {
          img.classList.toggle('active', i === index);
        });

        // Update button icon
        const icon = button.querySelector('.accordion-icon');
        if (icon) {
          icon.textContent = '−';
        }
      });

      collapseEl.addEventListener('hide.bs.collapse', function(e) {
        const item = this.closest('.accordion-item');
        const button = item.querySelector('.accordion-button');
        
        // Update button icon
        const icon = button.querySelector('.accordion-icon');
        if (icon) {
          icon.textContent = '+';
        }
      });
    });
  }
}

/**
 * Setup responsive behavior for images
 */
function setupResponsiveBehavior(imageContainer) {
  function updateImageLayout() {
    const isMobile = window.innerWidth < 992;
    const desktopImages = document.querySelectorAll('.desktop-business-image');
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    
    if (imageContainer) {
      imageContainer.style.display = isMobile ? 'none' : 'block';
    }
    
    // Update mobile images visibility
    if (isMobile) {
      mobileImages.forEach((mobileImg, index) => {
        if (mobileImg.parentElement) {
          const button = document.querySelector(`#heading${index} .accordion-button`);
          const isActive = button && !button.classList.contains('collapsed');
          mobileImg.style.display = isActive ? 'block' : 'none';
        }
      });
      
      desktopImages.forEach(img => {
        img.style.display = 'none';
      });
    } else {
      mobileImages.forEach(mobileImg => {
        mobileImg.style.display = 'none';
      });
      
      desktopImages.forEach(img => {
        img.style.display = 'block';
      });
    }
  }

  // Initial update
  updateImageLayout();

  // Update on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateImageLayout, 250);
  });
}