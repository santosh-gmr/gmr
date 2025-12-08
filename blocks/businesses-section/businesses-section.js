/**
 * Businesses Accordion - Preserves original HTML structure
 * @param {HTMLElement} block - The businesses-section block element
 */
export default function decorate(block) {
  // Get all business items
  const items = [...block.querySelectorAll('[data-aue-model="business-item"]')];
  
  if (!items.length) {
    console.warn('No business items found in businesses-section block');
    return;
  }

  // First, let's reorganize the structure without destroying it
  // We'll wrap everything in our layout containers
  
  // Create the main wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'business-accordion-enhanced';
  
  // Create header from existing elements
  const sectionTitleEl = block.querySelector('[data-aue-prop="sectionTitle"]');
  const sectionSubtitleEl = block.querySelector('[data-aue-prop="sectionSubtitle"]');
  const introTextEl = block.querySelector('[data-aue-prop="introText"]');
  
  // Create header container
  const headerContainer = document.createElement('header');
  headerContainer.className = 'business-accordion-header';
  
  if (sectionTitleEl || sectionSubtitleEl) {
    const titleWrapper = document.createElement('h2');
    
    if (sectionTitleEl) {
      const titleText = sectionTitleEl.textContent?.replace('/', '').trim() || '';
      titleWrapper.appendChild(document.createTextNode(titleText + ' '));
    }
    
    if (sectionSubtitleEl) {
      const subtitleText = sectionSubtitleEl.textContent?.trim() || '';
      const span = document.createElement('span');
      span.textContent = subtitleText;
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
  
  // Create main layout container
  const layoutContainer = document.createElement('div');
  layoutContainer.className = 'business-accordion-layout';
  
  // Create image preview column (for desktop)
  const imageColumn = document.createElement('div');
  imageColumn.className = 'business-image-column';
  
  // Create accordion column
  const accordionColumn = document.createElement('div');
  accordionColumn.className = 'business-accordion-column';
  
  // Create Bootstrap accordion
  const accordion = document.createElement('div');
  accordion.className = 'accordion';
  accordion.id = 'businessAccordion';
  
  // Process each business item - create accordion structure
  items.forEach((item, index) => {
    // Get the original picture element
    const pictureElement = item.querySelector('[data-aue-prop="image"] picture');
    
    // Get other elements
    const titleEl = item.querySelector('[data-aue-prop="title"]');
    const descriptionEl = item.querySelector('[data-aue-prop="description"]');
    const ctaLabelEl = item.querySelector('[data-aue-prop="ctaLabel"]');
    const ctaLinkEl = item.querySelector('.button-container a, a[href]');
    
    // Create desktop image display (clone the picture element)
    if (pictureElement) {
      const desktopImage = document.createElement('div');
      desktopImage.className = `desktop-business-image ${index === 0 ? 'active' : ''}`;
      desktopImage.setAttribute('data-index', index);
      
      // Clone the entire picture element
      const pictureClone = pictureElement.cloneNode(true);
      desktopImage.appendChild(pictureClone);
      imageColumn.appendChild(desktopImage);
    }
    
    // Create Bootstrap accordion item
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
    
    // Add title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    if (titleEl) {
      titleSpan.textContent = titleEl.textContent?.trim() || '';
    }
    
    // Add icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = index === 0 ? '−' : '+';
    
    button.appendChild(titleSpan);
    button.appendChild(iconSpan);
    accordionHeader.appendChild(button);
    
    // Create accordion collapse
    const accordionCollapse = document.createElement('div');
    accordionCollapse.id = `collapse${index}`;
    accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
    accordionCollapse.setAttribute('aria-labelledby', `heading${index}`);
    accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');
    
    // Create accordion body
    const accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';
    
    // Add description if exists
    if (descriptionEl) {
      const descriptionDiv = document.createElement('div');
      descriptionDiv.className = 'business-description';
      descriptionDiv.innerHTML = descriptionEl.innerHTML;
      accordionBody.appendChild(descriptionDiv);
    }
    
    // Add CTA if exists
    if (ctaLabelEl && ctaLinkEl) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'business-cta';
      
      const ctaLink = document.createElement('a');
      ctaLink.href = ctaLinkEl.href || '#';
      ctaLink.className = 'btn btn-primary';
      ctaLink.textContent = ctaLabelEl.textContent?.trim() || 'Read More';
      
      ctaDiv.appendChild(ctaLink);
      accordionBody.appendChild(ctaDiv);
    }
    
    // Add mobile image (clone of picture element)
    if (pictureElement) {
      const mobileImage = document.createElement('div');
      mobileImage.className = 'mobile-business-image';
      mobileImage.setAttribute('data-index', index);
      
      const mobilePicture = pictureElement.cloneNode(true);
      mobileImage.appendChild(mobilePicture);
      accordionBody.appendChild(mobileImage);
    }
    
    // Assemble the accordion item
    accordionCollapse.appendChild(accordionBody);
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionCollapse);
    accordion.appendChild(accordionItem);
  });
  
  // Add accordion to column
  accordionColumn.appendChild(accordion);
  
  // Build the layout
  layoutContainer.appendChild(imageColumn);
  layoutContainer.appendChild(accordionColumn);
  wrapper.appendChild(layoutContainer);
  
  // Replace the block content with our enhanced version
  // We'll preserve the original content in a hidden container for AEM
  const originalContent = document.createElement('div');
  originalContent.className = 'aem-original-content';
  originalContent.style.display = 'none';
  originalContent.innerHTML = block.innerHTML;
  
  // Clear block and add both original and enhanced content
  block.innerHTML = '';
  block.appendChild(originalContent);
  block.appendChild(wrapper);
  
  // Initialize accordion functionality
  initAccordionFunctionality(accordion, imageColumn);
  
  // Setup responsive behavior
  setupResponsiveBehavior(imageColumn);
}

/**
 * Initialize accordion functionality
 */
function initAccordionFunctionality(accordion, imageColumn) {
  const buttons = accordion.querySelectorAll('.accordion-button');
  const collapses = accordion.querySelectorAll('.accordion-collapse');
  const desktopImages = imageColumn.querySelectorAll('.desktop-business-image');
  
  // Set initial state
  if (buttons.length > 0 && desktopImages.length > 0) {
    desktopImages[0].classList.add('active');
  }
  
  // Add click handlers to buttons
  buttons.forEach((button, index) => {
    // Remove any existing listeners to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add click event to the new button
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isCurrentlyActive = !this.classList.contains('collapsed');
      
      // If already active, do nothing (or close if you want toggle behavior)
      if (!isCurrentlyActive) {
        // Update all buttons
        buttons.forEach((btn, i) => {
          const shouldBeActive = i === index;
          
          if (shouldBeActive) {
            btn.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
            
            const icon = btn.querySelector('.accordion-icon');
            if (icon) {
              icon.textContent = '−';
            }
          } else {
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
            
            const icon = btn.querySelector('.accordion-icon');
            if (icon) {
              icon.textContent = '+';
            }
          }
        });
        
        // Update collapses
        collapses.forEach((collapse, i) => {
          if (i === index) {
            collapse.classList.add('show');
          } else {
            collapse.classList.remove('show');
          }
        });
        
        // Update desktop images
        desktopImages.forEach((img, i) => {
          if (i === index) {
            img.classList.add('active');
            img.style.opacity = '1';
          } else {
            img.classList.remove('active');
            img.style.opacity = '0';
          }
        });
        
        // Update mobile images on mobile view
        updateMobileImages(index);
      }
    });
    
    // Keyboard navigation
    newButton.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          newButton.click();
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
  
  // Function to update mobile images
  function updateMobileImages(activeIndex) {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      const mobileImages = document.querySelectorAll('.mobile-business-image');
      mobileImages.forEach((img, index) => {
        if (img.parentElement) {
          img.style.display = index === activeIndex ? 'block' : 'none';
        }
      });
    }
  }
  
  // Initialize with first item active
  updateMobileImages(0);
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior(imageColumn) {
  function updateLayout() {
    const isMobile = window.innerWidth < 992;
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    const desktopImages = document.querySelectorAll('.desktop-business-image');
    
    if (imageColumn) {
      imageColumn.style.display = isMobile ? 'none' : 'block';
    }
    
    if (isMobile) {
      // Mobile view - show/hide mobile images
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
      // Desktop view
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