export default function decorate(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "business-accordion-wrapper";

  const children = [...block.children];

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  // H2 + span (from first two divs)
  const h2 = document.createElement("h2");
  const title = children[0]?.textContent || "";
  const subtitle = children[1]?.textContent || "";
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
    
    // Extract image from the business item (first child is picture)
    const pictureElement = item.children[0]?.querySelector("picture");
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
    
    // Business title (second child of item)
    const titleSpan = document.createElement("span");
    titleSpan.className = "business-title";
    const titleElement = item.children[1];
    if (titleElement) {
      titleSpan.textContent = titleElement.textContent;
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
    
    // Business description (third child of item)
    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "business-description";
    const descriptionElement = item.children[2];
    if (descriptionElement) {
      const p = document.createElement("p");
      p.textContent = descriptionElement.textContent;
      descriptionDiv.appendChild(p);
    }
    accordionBody.appendChild(descriptionDiv);
    
    // CTA button - Get URL from button container or link
    const ctaDiv = document.createElement("div");
    ctaDiv.className = "business-cta";
    
    // Find the actual link URL
    let linkUrl = "#";
    let linkTitle = "#";
    
    // Check for button container (fifth child, contains <a> with href="#")
    const buttonContainer = item.children[4];
    if (buttonContainer) {
      const buttonLink = buttonContainer.querySelector("a");
      if (buttonLink) {
        linkUrl = buttonLink.href || "#";
        linkTitle = buttonLink.title || "#";
      }
    }
    
    // Check for direct link (in case of Foundation with Google link)
    const directLink = item.querySelector("a[href*='http']");
    if (directLink && directLink.href.includes("http")) {
      linkUrl = directLink.href;
      linkTitle = directLink.title || directLink.textContent;
    }
    
    // Create CTA link - Use "READ MORE" text from fourth child
    const ctaLink = document.createElement("a");
    ctaLink.href = linkUrl;
    ctaLink.title = linkTitle;
    ctaLink.className = "btn btn-transparent";
    
    // Get "READ MORE" text from fourth child
    const readMoreElement = item.children[3];
    if (readMoreElement) {
      ctaLink.textContent = readMoreElement.textContent;
    } else {
      ctaLink.textContent = "READ MORE";
    }
    
    ctaDiv.appendChild(ctaLink);
    accordionBody.appendChild(ctaDiv);
    
    // MOBILE BUSINESS IMAGE (shown below CTA button on mobile)
    const mobileImageDiv = document.createElement("div");
    mobileImageDiv.className = "mobile-business-image";
    mobileImageDiv.setAttribute("data-index", index);
    
    const pictureElement = item.children[0]?.querySelector("picture");
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
  `;
  document.head.appendChild(style);
  
  // Add Bootstrap collapse event listeners
  setTimeout(() => {
    const collapseElements = wrapper.querySelectorAll('.accordion-collapse');
    const desktopImages = wrapper.querySelectorAll('.desktop-business-image');
    const accordionItems = wrapper.querySelectorAll('.accordion-item');
    const accordionHeaders = wrapper.querySelectorAll('.accordion-header');
    const accordionButtons = wrapper.querySelectorAll('.accordion-button');
    
    // Listen to Bootstrap's collapse events
    collapseElements.forEach((collapseEl, index) => {
      collapseEl.addEventListener('show.bs.collapse', function () {
        // Update active classes
        accordionItems.forEach(item => item.classList.remove('active'));
        accordionHeaders.forEach(header => header.classList.remove('active'));
        accordionButtons.forEach(button => button.classList.remove('active'));
        desktopImages.forEach(img => img.classList.remove('active'));
        
        // Add active classes to current item
        accordionItems[index].classList.add('active');
        accordionHeaders[index].classList.add('active');
        accordionButtons[index].classList.add('active');
        desktopImages[index].classList.add('active');
        
        // Update icons
        const allPlusIcons = wrapper.querySelectorAll('.plus-icon');
        const allMinusIcons = wrapper.querySelectorAll('.minus-icon');
        
        allPlusIcons.forEach(icon => icon.classList.remove('d-none'));
        allMinusIcons.forEach(icon => icon.classList.add('d-none'));
        
        const currentPlusIcon = accordionButtons[index].querySelector('.plus-icon');
        const currentMinusIcon = accordionButtons[index].querySelector('.minus-icon');
        
        if (currentPlusIcon) currentPlusIcon.classList.add('d-none');
        if (currentMinusIcon) currentMinusIcon.classList.remove('d-none');
      });
      
      collapseEl.addEventListener('hide.bs.collapse', function () {
        // When collapsing, check if this is the last open item
        const openItems = wrapper.querySelectorAll('.accordion-collapse.show');
        if (openItems.length === 1 && openItems[0] === collapseEl) {
          // This is the last open item being closed
          accordionItems[index].classList.remove('active');
          accordionHeaders[index].classList.remove('active');
          accordionButtons[index].classList.remove('active');
          
          // Update icons
          const currentPlusIcon = accordionButtons[index].querySelector('.plus-icon');
          const currentMinusIcon = accordionButtons[index].querySelector('.minus-icon');
          
          if (currentPlusIcon) currentPlusIcon.classList.remove('d-none');
          if (currentMinusIcon) currentMinusIcon.classList.add('d-none');
        }
      });
    });
    
    // Optional: Manual toggle for non-Bootstrap environments
    accordionButtons.forEach((button, index) => {
      button.addEventListener('click', function(e) {
        // Only run if Bootstrap is not loaded
        if (typeof bootstrap !== 'undefined') {
          return;
        }
        
        const targetId = this.getAttribute('data-bs-target');
        const target = wrapper.querySelector(targetId);
        
        if (target.classList.contains('show')) {
          // Close it
          target.classList.remove('show');
          accordionItems[index].classList.remove('active');
          accordionHeaders[index].classList.remove('active');
          this.classList.remove('active');
          
          // Update icons
          const plusIcon = this.querySelector('.plus-icon');
          const minusIcon = this.querySelector('.minus-icon');
          if (plusIcon) plusIcon.classList.remove('d-none');
          if (minusIcon) minusIcon.classList.add('d-none');
        } else {
          // Close all others
          wrapper.querySelectorAll('.accordion-collapse.show').forEach(el => {
            el.classList.remove('show');
          });
          accordionItems.forEach(item => item.classList.remove('active'));
          accordionHeaders.forEach(header => header.classList.remove('active'));
          accordionButtons.forEach(btn => btn.classList.remove('active'));
          desktopImages.forEach(img => img.classList.remove('active'));
          
          // Open this one
          target.classList.add('show');
          accordionItems[index].classList.add('active');
          accordionHeaders[index].classList.add('active');
          this.classList.add('active');
          desktopImages[index].classList.add('active');
          
          // Update icons
          wrapper.querySelectorAll('.plus-icon').forEach(icon => icon.classList.remove('d-none'));
          wrapper.querySelectorAll('.minus-icon').forEach(icon => icon.classList.add('d-none'));
          
          const plusIcon = this.querySelector('.plus-icon');
          const minusIcon = this.querySelector('.minus-icon');
          if (plusIcon) plusIcon.classList.add('d-none');
          if (minusIcon) minusIcon.classList.remove('d-none');
        }
      });
    });
    
    // Handle window resize for responsive behavior
    function handleResponsiveLayout() {
      const isMobile = window.innerWidth <= 767;
      const mobileImages = wrapper.querySelectorAll('.mobile-business-image');
      
      if (isMobile) {
        // On mobile, ensure mobile images are visible in accordion body
        mobileImages.forEach(imgDiv => {
          imgDiv.style.display = 'block';
        });
      } else {
        // On desktop, hide mobile images in accordion body
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