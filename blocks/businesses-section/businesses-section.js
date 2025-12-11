export default function decorate(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "business-accordion-wrapper";

  const children = [...block.children];

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  // H2 + span (from first two divs)
  const h2 = document.createElement("h2");
  const title = children[0]?.textContent?.trim() || "";
  const subtitle = children[1]?.textContent?.trim() || "";
  h2.innerHTML = `<span class="title">${title}</span> <span class="subtitle"> ${subtitle}</span>`;
  header.appendChild(h2);

  // Intro text wrapper (from third div)
  const intro = document.createElement("div");
  intro.className = "intro-text";
  const introText = children[2]?.innerHTML || "";
  if (introText) intro.innerHTML = introText;
  header.appendChild(intro);

  wrapper.appendChild(header);

  // --- CREATE ACCORDION CONTAINER ---
  const accordionContainer = document.createElement("div");
  accordionContainer.className = "business-accordion-container";
  
  // Extract business items (remaining children starting from index 3)
  const businessItems = children.slice(3);
  
  // --- CREATE DESKTOP IMAGE PREVIEW SECTION (hidden on mobile) ---
  const imagePreview = document.createElement("div");
  imagePreview.className = "business-image-preview";
  imagePreview.style.display = "block";
  
  const imageContainer = document.createElement("div");
  imageContainer.className = "business-image-container";
  
  // Create desktop image containers for each business item
  businessItems.forEach((item, index) => {
    const desktopImageDiv = document.createElement("div");
    desktopImageDiv.className = `desktop-business-image ${index === 0 ? "active" : ""}`;
    desktopImageDiv.setAttribute("data-index", index);
    
    // Extract image from the business item
    const pictureElement = item.querySelector("picture");
    if (pictureElement) {
      const img = document.createElement("img");
      const imgElement = pictureElement.querySelector("img");
      if (imgElement) {
        // Get the highest resolution image available for desktop
        let src = imgElement.src;
        const sources = pictureElement.querySelectorAll("source");
        
        // Try to find desktop source (min-width: 600px)
        sources.forEach(source => {
          if (source.media && source.media.includes("min-width: 600")) {
            const srcset = source.srcset.split(",")[0].split(" ")[0];
            if (srcset) src = srcset;
          }
        });
        
        img.src = src;
        img.alt = imgElement.alt || "";
        img.setAttribute("data-aue-prop", "image");
        img.setAttribute("data-aue-label", "Business Image");
        img.setAttribute("data-aue-type", "media");
        
        desktopImageDiv.appendChild(img);
      }
    }
    
    imageContainer.appendChild(desktopImageDiv);
  });
  
  imagePreview.appendChild(imageContainer);
  accordionContainer.appendChild(imagePreview);
  
  // --- CREATE ACCORDION ---
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "businessAccordion";
  
  // Create accordion items
  businessItems.forEach((item, index) => {
    const accordionItem = document.createElement("div");
    accordionItem.className = `accordion-item ${index === 0 ? "active" : ""}`;
    
    // --- ACCORDION HEADER ---
    const accordionHeader = document.createElement("h2");
    accordionHeader.className = `accordion-header ${index === 0 ? "active" : ""}`;
    accordionHeader.id = `heading${index}`;
    
    const button = document.createElement("button");
    button.className = `accordion-button ${index === 0 ? "active" : ""}`;
    button.type = "button";
    button.setAttribute("data-bs-toggle", "collapse");
    button.setAttribute("data-bs-target", `#collapse${index}`);
    button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
    button.setAttribute("aria-controls", `collapse${index}`);
    
    // Business title - find the div with business-title class or the second child
    const titleSpan = document.createElement("span");
    titleSpan.className = "business-title";
    
    // Try to find by class first
    const titleElement = item.querySelector(".business-title");
    if (!titleElement) {
      // Fallback to second child
      const itemChildren = [...item.children];
      if (itemChildren.length > 1) {
        titleSpan.textContent = itemChildren[1].textContent.trim();
      }
    } else {
      titleSpan.textContent = titleElement.textContent.trim();
    }
    button.appendChild(titleSpan);
    
    // Accordion icon
    const iconSpan = document.createElement("span");
    iconSpan.className = "accordion-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    
    const iconWrapper = document.createElement("span");
    iconWrapper.className = "icon-wrapper";
    
    // Plus icon SVG
    const plusIcon = document.createElement("span");
    plusIcon.className = `plus-icon ${index === 0 ? "d-none" : ""}`;
    plusIcon.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
</svg>`;
    
    // Minus icon SVG
    const minusIcon = document.createElement("span");
    minusIcon.className = `minus-icon ${index === 0 ? "" : "d-none"}`;
    minusIcon.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
</svg>`;
    
    iconWrapper.appendChild(plusIcon);
    iconWrapper.appendChild(minusIcon);
    iconSpan.appendChild(iconWrapper);
    button.appendChild(iconSpan);
    
    accordionHeader.appendChild(button);
    accordionItem.appendChild(accordionHeader);
    
    // --- ACCORDION COLLAPSE ---
    const collapseDiv = document.createElement("div");
    collapseDiv.id = `collapse${index}`;
    collapseDiv.className = `accordion-collapse collapse ${index === 0 ? "show" : ""}`;
    collapseDiv.setAttribute("aria-labelledby", `heading${index}`);
    collapseDiv.setAttribute("data-bs-parent", "#businessAccordion");
    
    const accordionBody = document.createElement("div");
    accordionBody.className = "accordion-body";
    
    // Business description - find the div with business-description class or third child
    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "business-description";
    
    const descriptionElement = item.querySelector(".business-description");
    if (!descriptionElement) {
      // Fallback to third child
      const itemChildren = [...item.children];
      if (itemChildren.length > 2) {
        const p = document.createElement("p");
        p.textContent = itemChildren[2].textContent.trim();
        descriptionDiv.appendChild(p);
      }
    } else {
      descriptionDiv.innerHTML = descriptionElement.innerHTML;
    }
    accordionBody.appendChild(descriptionDiv);
    
    // CTA button
    const ctaDiv = document.createElement("div");
    ctaDiv.className = "business-cta";
    
    // Find the actual link URL
    let linkUrl = "#";
    let linkText = "READ MORE";
    
    // Try to find CTA by class first
    const ctaElement = item.querySelector(".cta-label");
    if (ctaElement) {
      linkText = ctaElement.textContent.trim();
    }
    
    // Look for a link element
    const linkElement = item.querySelector("a");
    if (linkElement) {
      linkUrl = linkElement.href;
    }
    
    // Create CTA link
    const ctaLink = document.createElement("a");
    ctaLink.href = linkUrl;
    ctaLink.className = "btn btn-transparent";
    ctaLink.textContent = linkText;
    
    ctaDiv.appendChild(ctaLink);
    accordionBody.appendChild(ctaDiv);
    
    // MOBILE BUSINESS IMAGE (shown below CTA button on mobile)
    const mobileImageDiv = document.createElement("div");
    mobileImageDiv.className = "mobile-business-image";
    mobileImageDiv.setAttribute("data-index", index);
    
    const pictureElement = item.querySelector("picture");
    if (pictureElement) {
      // Clone the picture element for mobile
      const mobilePicture = pictureElement.cloneNode(true);
      mobileImageDiv.appendChild(mobilePicture);
    }
    
    accordionBody.appendChild(mobileImageDiv);
    collapseDiv.appendChild(accordionBody);
    accordionItem.appendChild(collapseDiv);
    accordion.appendChild(accordionItem);
  });
  
  accordionContainer.appendChild(accordion);
  wrapper.appendChild(accordionContainer);
  
  // Replace original block
  block.innerHTML = "";
  block.appendChild(wrapper);
  
  // Add CSS for responsive behavior
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 767px) {
      .business-image-preview {
        display: none !important;
      }
      .mobile-business-image {
        display: block !important;
        margin-top: 20px;
      }
      .mobile-business-image picture,
      .mobile-business-image img {
        width: 100%;
        height: auto;
      }
    }
    
    @media (min-width: 768px) {
      .mobile-business-image {
        display: none !important;
      }
      .business-image-preview {
        display: block !important;
      }
    }
    
    /* Basic accordion styles */
    .accordion-item {
      border-bottom: 1px solid #ddd;
    }
    
    .accordion-header {
      margin: 0;
    }
    
    .accordion-button {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    
    .accordion-button.active {
      font-weight: bold;
    }
    
    .accordion-collapse {
      overflow: hidden;
      transition: height 0.3s ease;
    }
    
    .accordion-collapse:not(.show) {
      display: none;
    }
    
    .accordion-body {
      padding: 1rem;
    }
    
    .business-title {
      flex-grow: 1;
    }
    
    .accordion-icon {
      display: flex;
      align-items: center;
    }
    
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
    }
    
    .plus-icon, .minus-icon {
      display: inline-flex;
      align-items: center;
    }
    
    .d-none {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  // Add event listeners for accordion functionality
  setTimeout(() => {
    const accordionButtons = wrapper.querySelectorAll('.accordion-button');
    const desktopImages = wrapper.querySelectorAll('.desktop-business-image');
    
    // If Bootstrap is not available, add manual toggle functionality
    if (typeof bootstrap === 'undefined') {
      accordionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('data-bs-target');
          const target = wrapper.querySelector(targetId);
          const isExpanded = target.classList.contains('show');
          
          if (isExpanded) {
            // Close this item
            target.classList.remove('show');
            button.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
            
            // Update icons
            const plusIcon = button.querySelector('.plus-icon');
            const minusIcon = button.querySelector('.minus-icon');
            if (plusIcon) plusIcon.classList.remove('d-none');
            if (minusIcon) minusIcon.classList.add('d-none');
            
            // Update desktop image
            desktopImages[index]?.classList.remove('active');
          } else {
            // Close all other items
            wrapper.querySelectorAll('.accordion-collapse.show').forEach(collapse => {
              collapse.classList.remove('show');
            });
            
            wrapper.querySelectorAll('.accordion-button.active').forEach(btn => {
              btn.classList.remove('active');
              btn.setAttribute('aria-expanded', 'false');
              
              // Update icons for all buttons
              const plusIcon = btn.querySelector('.plus-icon');
              const minusIcon = btn.querySelector('.minus-icon');
              if (plusIcon) plusIcon.classList.remove('d-none');
              if (minusIcon) minusIcon.classList.add('d-none');
            });
            
            // Remove active from all desktop images
            desktopImages.forEach(img => img.classList.remove('active'));
            
            // Open this item
            target.classList.add('show');
            button.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
            
            // Update icons
            const plusIcon = button.querySelector('.plus-icon');
            const minusIcon = button.querySelector('.minus-icon');
            if (plusIcon) plusIcon.classList.add('d-none');
            if (minusIcon) minusIcon.classList.remove('d-none');
            
            // Update desktop image
            desktopImages[index]?.classList.add('active');
          }
        });
      });
    } else {
      // Bootstrap is available, use Bootstrap events
      const collapseElements = wrapper.querySelectorAll('.accordion-collapse');
      
      collapseElements.forEach((collapseEl, index) => {
        collapseEl.addEventListener('show.bs.collapse', function () {
          // Update active classes
          desktopImages.forEach(img => img.classList.remove('active'));
          desktopImages[index]?.classList.add('active');
          
          // Update icons
          const allPlusIcons = wrapper.querySelectorAll('.plus-icon');
          const allMinusIcons = wrapper.querySelectorAll('.minus-icon');
          
          allPlusIcons.forEach(icon => icon.classList.remove('d-none'));
          allMinusIcons.forEach(icon => icon.classList.add('d-none'));
          
          const currentButton = accordionButtons[index];
          const currentPlusIcon = currentButton.querySelector('.plus-icon');
          const currentMinusIcon = currentButton.querySelector('.minus-icon');
          
          if (currentPlusIcon) currentPlusIcon.classList.add('d-none');
          if (currentMinusIcon) currentMinusIcon.classList.remove('d-none');
        });
        
        collapseEl.addEventListener('hide.bs.collapse', function () {
          // When closing, update icons
          const currentButton = accordionButtons[index];
          const currentPlusIcon = currentButton.querySelector('.plus-icon');
          const currentMinusIcon = currentButton.querySelector('.minus-icon');
          
          if (currentPlusIcon) currentPlusIcon.classList.remove('d-none');
          if (currentMinusIcon) currentMinusIcon.classList.add('d-none');
          
          // Check if this was the active desktop image
          if (desktopImages[index]?.classList.contains('active')) {
            desktopImages[index]?.classList.remove('active');
          }
        });
      });
    }
    
    // Handle window resize for responsive behavior
    function handleResponsiveLayout() {
      const isMobile = window.innerWidth <= 767;
      const mobileImages = wrapper.querySelectorAll('.mobile-business-image');
      
      if (isMobile) {
        // On mobile, ensure mobile images are visible
        mobileImages.forEach(imgDiv => {
          imgDiv.style.display = 'block';
        });
      } else {
        // On desktop, hide mobile images
        mobileImages.forEach(imgDiv => {
          imgDiv.style.display = 'none';
        });
      }
    }
    
    // Initial check
    handleResponsiveLayout();
    
    // Listen for window resize
    window.addEventListener('resize', handleResponsiveLayout);
  }, 100);
}