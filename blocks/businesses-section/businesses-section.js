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
    
    // Business title (first child of item, since image is removed)
    const titleSpan = document.createElement("span");
    titleSpan.className = "business-title";
    const titleElement = item.children[0];
    if (titleElement) {
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
    
    // Business description (second child of item, since image is removed)
    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "business-description";
    const descriptionElement = item.children[1];
    if (descriptionElement) {
      const p = document.createElement("p");
      p.textContent = descriptionElement.textContent.trim();
      descriptionDiv.appendChild(p);
    }
    accordionBody.appendChild(descriptionDiv);
    
    // CTA button - Get URL from button container or link
    const ctaDiv = document.createElement("div");
    ctaDiv.className = "business-cta";
    
    // Find the actual link URL
    let linkUrl = "#";
    let linkTitle = "#";
    
    // Check for button container (fourth child, contains <a> with href="#")
    // Note: index 3 instead of 4 since we removed the image
    const buttonContainer = item.children[3];
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
      linkTitle = directLink.title || directLink.textContent.trim();
    }
    
    // Create CTA link - Use "READ MORE" text from third child
    // Note: index 2 instead of 3 since we removed the image
    const ctaLink = document.createElement("a");
    ctaLink.href = linkUrl;
    ctaLink.title = linkTitle;
    ctaLink.className = "btn btn-transparent";
    
    // Get "READ MORE" text from third child
    const readMoreElement = item.children[2];
    if (readMoreElement) {
      ctaLink.textContent = readMoreElement.textContent.trim();
    } else {
      ctaLink.textContent = "READ MORE";
    }
    
    ctaDiv.appendChild(ctaLink);
    accordionBody.appendChild(ctaDiv);
    
    collapseDiv.appendChild(accordionBody);
    accordionItem.appendChild(collapseDiv);
    accordion.appendChild(accordionItem);
  });
  
  accordionContainer.appendChild(accordion);
  wrapper.appendChild(accordionContainer);
  
  // Replace original block
  block.innerHTML = "";
  block.appendChild(wrapper);
  
  // Add Bootstrap collapse event listeners
  setTimeout(() => {
    const collapseElements = wrapper.querySelectorAll('.accordion-collapse');
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
        
        // Add active classes to current item
        accordionItems[index].classList.add('active');
        accordionHeaders[index].classList.add('active');
        accordionButtons[index].classList.add('active');
        
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
          
          // Open this one
          target.classList.add('show');
          accordionItems[index].classList.add('active');
          accordionHeaders[index].classList.add('active');
          this.classList.add('active');
          
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
  }, 100);
}