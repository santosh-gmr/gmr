/**
 * Businesses Accordion - Non-destructive AEM compatible
 * @param {HTMLElement} block - The businesses-section block element
 */
export default function decorate(block) {
  // Preserve original content - don't replace innerHTML
  const originalHTML = block.innerHTML;
  
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
  
  // Wrap the entire block for styling
  const wrapper = document.createElement('div');
  wrapper.className = 'business-accordion-wrapper';
  
  // Preserve header structure but add proper markup
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
  
  // --- FIXED IMAGE EXTRACTION ---
  const imgElement = item.querySelector('img[data-aue-prop="image"]');
  const imageSrc = imgElement?.getAttribute("src") || "";
  const imageAlt = imgElement?.getAttribute("alt") || "";

  // Desktop Image
  if (imgElement && imageSrc) {
    const desktopImage = document.createElement("div");
    desktopImage.className = `desktop-business-image ${index === 0 ? "active" : ""}`;
    desktopImage.setAttribute("data-index", index);

    const clone = imgElement.cloneNode(true);
    desktopImage.appendChild(clone);
    imageContainer.appendChild(desktopImage);
  }

  // Mobile image
  if (imgElement && imageSrc) {
    const mobileImage = document.createElement("div");
    mobileImage.className = "mobile-business-image";
    mobileImage.setAttribute("data-index", index);

    const clone2 = imgElement.cloneNode(true);
    mobileImage.appendChild(clone2);
    accordionBody.appendChild(mobileImage);
  }

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
  const desktopImages = imageContainer.querySelectorAll('.desktop-business-image');
  const mobileImages = accordion.querySelectorAll('.mobile-business-image');
  
  // Update image display
  function updateImages(index) {
    desktopImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
    
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      mobileImages.forEach((mobileImg, i) => {
        mobileImg.style.display = i === index ? 'block' : 'none';
      });
    }
  }
  
  // Add click handlers
  buttons.forEach((button, index) => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isActive = !this.classList.contains('collapsed');
      
      if (!isActive) {
        // Update button states
        buttons.forEach((btn, i) => {
          const shouldBeActive = i === index;
          btn.classList.toggle('collapsed', !shouldBeActive);
          btn.setAttribute('aria-expanded', shouldBeActive);
          
          const icon = btn.querySelector('.accordion-icon');
          if (icon) {
            icon.textContent = shouldBeActive ? '−' : '+';
          }
        });
        
        // Update images
        updateImages(index);
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
  updateImages(0);
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior(imageContainer) {
  function updateLayout() {
    const isMobile = window.innerWidth < 992;
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    
    if (imageContainer) {
      imageContainer.parentElement.style.display = isMobile ? 'none' : 'block';
    }
    
    // Update mobile images
    if (isMobile) {
      const activeIndex = document.querySelector('.accordion-button[aria-expanded="true"]');
      const buttons = document.querySelectorAll('.accordion-button');
      const activeBtnIndex = activeIndex ? 
        Array.from(buttons).indexOf(activeIndex) : 0;
      
      mobileImages.forEach((img, index) => {
        img.style.display = index === activeBtnIndex ? 'block' : 'none';
      });
    } else {
      mobileImages.forEach(img => {
        img.style.display = 'none';
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