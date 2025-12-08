/**
 * Businesses Accordion - Non-destructive AEM compatible
 * @param {HTMLElement} block - The businesses-section block element
 */
export default function decorate(block) {
  // Get all business items
  const items = [...block.querySelectorAll('[data-aue-model="business-item"]')];
  
  if (!items.length) {
    console.warn('No business items found in businesses-section block');
    return;
  }

  // Extract header elements
  const sectionTitleEl = block.querySelector('[data-aue-prop="sectionTitle"]');
  const sectionSubtitleEl = block.querySelector('[data-aue-prop="sectionSubtitle"]');
  const introTextEl = block.querySelector('[data-aue-prop="introText"]');
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'business-accordion-wrapper';
  
  // Create header
  const headerContainer = document.createElement('header');
  headerContainer.className = 'business-accordion-header';
  
  if (sectionTitleEl || sectionSubtitleEl) {
    const titleWrapper = document.createElement('h2');
    
    if (sectionTitleEl) {
      const titleText = sectionTitleEl.textContent?.replace('/', '').trim() || '';
      titleWrapper.appendChild(document.createTextNode(titleText));
    }
    
    if (sectionSubtitleEl) {
      const subtitleText = sectionSubtitleEl.textContent?.trim() || '';
      const span = document.createElement('span');
      span.textContent = ` ${subtitleText}`;
      titleWrapper.appendChild(span);
    }
    
    headerContainer.appendChild(titleWrapper);
  }
  
  if (introTextEl) {
    const introWrapper = document.createElement('div');
    introWrapper.className = 'intro-text';
    introWrapper.innerHTML = introTextEl.innerHTML;
    headerContainer.appendChild(introWrapper);
  }
  
  wrapper.appendChild(headerContainer);
  
  // Create main container
  const mainContainer = document.createElement('div');
  mainContainer.className = 'business-accordion-container';
  
  // Create image preview container for desktop
  const imagePreview = document.createElement('div');
  imagePreview.className = 'business-image-preview';
  
  const imageContainer = document.createElement('div');
  imageContainer.className = 'business-image-container';
  
  // Create accordion wrapper
  const accordionWrapper = document.createElement('div');
  accordionWrapper.className = 'accordion';
  accordionWrapper.id = 'businessAccordion';
  
  // Process each business item
  items.forEach((item, index) => {
    // Extract image - get the entire picture element
    const imageElement = item.querySelector('[data-aue-prop="image"]');
    const pictureElement = imageElement?.querySelector('picture');
    
    // Extract other content
    const titleEl = item.querySelector('[data-aue-prop="title"]');
    const descriptionEl = item.querySelector('[data-aue-prop="description"]');
    const ctaLabelEl = item.querySelector('[data-aue-prop="ctaLabel"]');
    const ctaLinkEl = item.querySelector('.button-container a, a[href]');
    
    // Create desktop image - clone the entire picture element
    if (pictureElement) {
      const desktopImage = document.createElement('div');
      desktopImage.className = `desktop-business-image ${index === 0 ? 'active' : ''}`;
      desktopImage.setAttribute('data-index', index);
      
      // Clone the entire picture element
      const pictureClone = pictureElement.cloneNode(true);
      desktopImage.appendChild(pictureClone);
      imageContainer.appendChild(desktopImage);
    }
    
    // Create accordion item
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    
    // Create accordion header
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
    
    // Add title to button
    if (titleEl) {
      const titleSpan = document.createElement('span');
      titleSpan.className = 'business-title';
      titleSpan.textContent = titleEl.textContent?.trim() || '';
      button.appendChild(titleSpan);
    }
    
    // Add icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = index === 0 ? '−' : '+';
    button.appendChild(iconSpan);
    
    accordionHeader.appendChild(button);
    accordionItem.appendChild(accordionHeader);
    
    // Create accordion collapse
    const accordionCollapse = document.createElement('div');
    accordionCollapse.id = `collapse${index}`;
    accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
    accordionCollapse.setAttribute('aria-labelledby', `heading${index}`);
    accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');
    
    const accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';
    
    // Add description
    if (descriptionEl) {
      const descDiv = document.createElement('div');
      descDiv.className = 'business-description';
      descDiv.innerHTML = descriptionEl.innerHTML;
      accordionBody.appendChild(descDiv);
    }
    
    // Add CTA
    if (ctaLabelEl && ctaLinkEl) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'business-cta';
      
      const ctaLink = document.createElement('a');
      ctaLink.href = ctaLinkEl.href;
      ctaLink.className = 'btn btn-primary';
      ctaLink.title = ctaLinkEl.title || ctaLabelEl.textContent?.trim() || '';
      ctaLink.textContent = ctaLabelEl.textContent?.trim() || '';
      
      ctaDiv.appendChild(ctaLink);
      accordionBody.appendChild(ctaDiv);
    }
    
    // Add mobile image - clone picture element
    if (pictureElement) {
      const mobileImage = document.createElement('div');
      mobileImage.className = 'mobile-business-image';
      mobileImage.setAttribute('data-index', index);
      
      const mobilePicture = pictureElement.cloneNode(true);
      mobileImage.appendChild(mobilePicture);
      accordionBody.appendChild(mobileImage);
    }
    
    accordionCollapse.appendChild(accordionBody);
    accordionItem.appendChild(accordionCollapse);
    accordionWrapper.appendChild(accordionItem);
  });
  
  // Add image container to preview
  imagePreview.appendChild(imageContainer);
  
  // Build the layout
  mainContainer.appendChild(imagePreview);
  mainContainer.appendChild(accordionWrapper);
  wrapper.appendChild(mainContainer);
  
  // Hide original content but preserve it for AEM
  const originalContent = block.querySelectorAll(':scope > div:not([data-aue-model])');
  originalContent.forEach(el => {
    el.style.display = 'none';
  });
  
  items.forEach(item => {
    item.style.display = 'none';
  });
  
  // Add our enhanced UI
  block.appendChild(wrapper);
  
  // Initialize accordion functionality
  initAccordionFunctionality(accordionWrapper, imageContainer);
  setupResponsiveBehavior(imageContainer);
  
  // Public API
  block.BusinessAccordion = {
    openItem: (index) => {
      const button = document.querySelector(`#heading${index} .accordion-button`);
      if (button) button.click();
    },
    getActiveIndex: () => {
      const activeCollapse = document.querySelector('.accordion-collapse.show');
      if (activeCollapse) {
        const match = activeCollapse.id.match(/collapse(\d+)/);
        return match ? parseInt(match[1]) : -1;
      }
      return -1;
    }
  };
}

/**
 * Initialize accordion functionality
 */
function initAccordionFunctionality(accordion, imageContainer) {
  const buttons = accordion.querySelectorAll('.accordion-button');
  const collapses = accordion.querySelectorAll('.accordion-collapse');
  const desktopImages = imageContainer.querySelectorAll('.desktop-business-image');
  const mobileImages = accordion.querySelectorAll('.mobile-business-image');
  
  // Update image display
  function updateImages(index) {
    desktopImages.forEach((img, i) => {
      if (i === index) {
        img.classList.add('active');
        img.style.opacity = '1';
      } else {
        img.classList.remove('active');
        img.style.opacity = '0';
      }
    });
    
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      mobileImages.forEach((mobileImg, i) => {
        if (mobileImg.parentElement) {
          mobileImg.style.display = i === index ? 'block' : 'none';
        }
      });
    }
  }
  
  // Update accordion state
  function updateAccordionState(index) {
    buttons.forEach((btn, i) => {
      const shouldBeActive = i === index;
      const isCurrentlyActive = !btn.classList.contains('collapsed');
      
      // Only update if state is changing
      if (shouldBeActive !== isCurrentlyActive) {
        btn.classList.toggle('collapsed', !shouldBeActive);
        btn.setAttribute('aria-expanded', shouldBeActive);
        
        const icon = btn.querySelector('.accordion-icon');
        if (icon) {
          icon.textContent = shouldBeActive ? '−' : '+';
        }
        
        // Update collapse
        const collapse = collapses[i];
        if (collapse) {
          if (shouldBeActive) {
            collapse.classList.add('show');
          } else {
            collapse.classList.remove('show');
          }
        }
      }
    });
    
    // Update images
    updateImages(index);
  }
  
  // Add click handlers
  buttons.forEach((button, index) => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isActive = !this.classList.contains('collapsed');
      
      if (!isActive) {
        // Open this item
        updateAccordionState(index);
      } else {
        // Close this item (optional - you can remove this if you don't want to close on click)
        updateAccordionState(-1);
      }
    });
    
    // Keyboard navigation
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
      }
    });
  });
  
  // Initialize with first item active
  updateAccordionState(0);
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior(imageContainer) {
  function updateLayout() {
    const isMobile = window.innerWidth < 992;
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    const desktopImages = document.querySelectorAll('.desktop-business-image');
    
    if (imageContainer && imageContainer.parentElement) {
      imageContainer.parentElement.style.display = isMobile ? 'none' : 'block';
    }
    
    if (isMobile) {
      // Mobile view - show/hide mobile images based on active state
      const activeButton = document.querySelector('.accordion-button[aria-expanded="true"]');
      const buttons = document.querySelectorAll('.accordion-button');
      const activeIndex = activeButton ? 
        Array.from(buttons).indexOf(activeButton) : 0;
      
      mobileImages.forEach((img, index) => {
        if (img.parentElement) {
          img.style.display = index === activeIndex ? 'block' : 'none';
        }
      });
      
      desktopImages.forEach(img => {
        img.style.display = 'none';
      });
    } else {
      // Desktop view - show desktop images
      mobileImages.forEach(img => {
        img.style.display = 'none';
      });
      
      desktopImages.forEach(img => {
        img.style.display = 'block';
      });
    }
  }
  
  // Initial update
  updateLayout();
  
  // Update on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateLayout, 250);
  });
}

// Auto-initialize if not using ES6 modules
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const accordionBlocks = document.querySelectorAll('.businesses-section');
    accordionBlocks.forEach(block => {
      if (typeof decorate === 'function') {
        decorate(block);
      }
    });
  });
}