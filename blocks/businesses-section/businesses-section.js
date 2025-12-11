export default function decorate(block) {
  // --- Authoring Prevention ---
  if (block.querySelector('.aem-block-placeholder')) {
    return;
  }
  if (block.querySelector('.business-accordion-wrapper')) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "business-accordion-wrapper";

  const children = [...block.children];

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  const h2 = document.createElement("h2");
  const title = children[0]?.textContent?.trim() || "";
  const subtitle = children[1]?.textContent?.trim() || "";
  h2.innerHTML = `<span class="title">${title}</span> <span class="subtitle"> ${subtitle}</span>`;
  header.appendChild(h2);

  const intro = document.createElement("div");
  intro.className = "intro-text";
  const introText = children[2]?.innerHTML || "";
  if (introText) intro.innerHTML = introText;
  header.appendChild(intro);

  wrapper.appendChild(header);

  // --- CREATE ACCORDION CONTAINER ---
  const accordionContainer = document.createElement("div");
  accordionContainer.className = "business-accordion-container";
  
  const businessItems = children.slice(3);
  
  const imagePreview = document.createElement("div");
  imagePreview.className = "business-image-preview";
  imagePreview.style.display = "block";
  
  const imageContainer = document.createElement("div");
  imageContainer.className = "business-image-container";
  
  businessItems.forEach((item, index) => {
    const desktopImageDiv = document.createElement("div");
    desktopImageDiv.className = `desktop-business-image ${index === 0 ? "active" : ""}`;
    desktopImageDiv.setAttribute("data-index", index);
    
    const pictureElement = item.children[0]?.querySelector("picture");
    if (pictureElement) {
      const img = document.createElement("img");
      const imgElement = pictureElement.querySelector("img");
      if (imgElement) {
        let src = imgElement.src;
        const sources = pictureElement.querySelectorAll("source");
        
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
  
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "businessAccordion";
  
  businessItems.forEach((item, index) => {
    const accordionItem = document.createElement("div");
    accordionItem.className = `accordion-item ${index === 0 ? "active" : ""}`;
    
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
    
    const titleSpan = document.createElement("span");
    titleSpan.className = "business-title";
    const titleElement = item.children[1];
    if (titleElement) {
      titleSpan.textContent = titleElement.textContent.trim();
    }
    button.appendChild(titleSpan);
    
    const iconSpan = document.createElement("span");
    iconSpan.className = "accordion-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    
    const iconWrapper = document.createElement("span");
    iconWrapper.className = "icon-wrapper";
    
    const plusIcon = document.createElement("span");
    plusIcon.className = `plus-icon ${index === 0 ? "d-none" : ""}`;
    plusIcon.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
</svg>`;
    
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
    
    const collapseDiv = document.createElement("div");
    collapseDiv.id = `collapse${index}`;
    collapseDiv.className = `accordion-collapse collapse ${index === 0 ? "show" : ""}`;
    collapseDiv.setAttribute("aria-labelledby", `heading${index}`);
    collapseDiv.setAttribute("data-bs-parent", "#businessAccordion");
    
    const accordionBody = document.createElement("div");
    accordionBody.className = "accordion-body";
    
    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "business-description";
    const descriptionElement = item.children[2];
    if (descriptionElement) {
      const p = document.createElement("p");
      p.textContent = descriptionElement.textContent.trim();
      descriptionDiv.appendChild(p);
    }
    accordionBody.appendChild(descriptionDiv);
    
    const ctaDiv = document.createElement("div");
    ctaDiv.className = "business-cta";
    
    let linkUrl = "#";
    let linkTitle = "#";
    
    const buttonContainer = item.children[4];
    if (buttonContainer) {
      const buttonLink = buttonContainer.querySelector("a");
      if (buttonLink) {
        linkUrl = buttonLink.href || "#";
        linkTitle = buttonLink.title || "#";
      }
    }
    
    const directLink = item.querySelector("a[href*='http']");
    if (directLink && directLink.href.includes("http")) {
      linkUrl = directLink.href;
      linkTitle = directLink.title || directLink.textContent.trim();
    }
    
    const ctaLink = document.createElement("a");
    ctaLink.href = linkUrl;
    ctaLink.title = linkTitle;
    ctaLink.className = "btn btn-transparent";
    
    const readMoreElement = item.children[3];
    if (readMoreElement) {
      ctaLink.textContent = readMoreElement.textContent.trim();
    } else {
      ctaLink.textContent = "READ MORE";
    }
    
    ctaDiv.appendChild(ctaLink);
    accordionBody.appendChild(ctaDiv);
    
    const mobileImageDiv = document.createElement("div");
    mobileImageDiv.className = "mobile-business-image";
    mobileImageDiv.setAttribute("data-index", index);
    
    const pictureElement = item.children[0]?.querySelector("picture");
    if (pictureElement) {
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
  
  block.innerHTML = "";
  block.appendChild(wrapper);
  
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
  
  setTimeout(() => {
    const collapseElements = wrapper.querySelectorAll('.accordion-collapse');
    const desktopImages = wrapper.querySelectorAll('.desktop-business-image');
    const accordionItems = wrapper.querySelectorAll('.accordion-item');
    const accordionHeaders = wrapper.querySelectorAll('.accordion-header');
    const accordionButtons = wrapper.querySelectorAll('.accordion-button');
    
    collapseElements.forEach((collapseEl, index) => {
      collapseEl.addEventListener('show.bs.collapse', function () {
        accordionItems.forEach(item => item.classList.remove('active'));
        accordionHeaders.forEach(header => header.classList.remove('active'));
        accordionButtons.forEach(button => button.classList.remove('active'));
        desktopImages.forEach(img => img.classList.remove('active'));
        
        accordionItems[index].classList.add('active');
        accordionHeaders[index].classList.add('active');
        accordionButtons[index].classList.add('active');
        desktopImages[index].classList.add('active');
        
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
        const openItems = wrapper.querySelectorAll('.accordion-collapse.show');
        if (openItems.length === 1 && openItems[0] === collapseEl) {
          accordionItems[index].classList.remove('active');
          accordionHeaders[index].classList.remove('active');
          accordionButtons[index].classList.remove('active');
          
          const currentPlusIcon = accordionButtons[index].querySelector('.plus-icon');
          const currentMinusIcon = accordionButtons[index].querySelector('.minus-icon');
          
          if (currentPlusIcon) currentPlusIcon.classList.remove('d-none');
          if (currentMinusIcon) currentMinusIcon.classList.add('d-none');
        }
      });
    });
    
    accordionButtons.forEach((button, index) => {
      button.addEventListener('click', function(e) {
        if (typeof bootstrap !== 'undefined') {
          return;
        }
        
        const targetId = this.getAttribute('data-bs-target');
        const target = wrapper.querySelector(targetId);
        
        if (target.classList.contains('show')) {
          target.classList.remove('show');
          accordionItems[index].classList.remove('active');
          accordionHeaders[index].classList.remove('active');
          this.classList.remove('active');
          
          const plusIcon = this.querySelector('.plus-icon');
          const minusIcon = this.querySelector('.minus-icon');
          if (plusIcon) plusIcon.classList.remove('d-none');
          if (minusIcon) minusIcon.classList.add('d-none');
        } else {
          wrapper.querySelectorAll('.accordion-collapse.show').forEach(el => {
            el.classList.remove('show');
          });
          accordionItems.forEach(item => item.classList.remove('active'));
          accordionHeaders.forEach(header => header.classList.remove('active'));
          accordionButtons.forEach(btn => btn.classList.remove('active'));
          desktopImages.forEach(img => img.classList.remove('active'));
          
          target.classList.add('show');
          accordionItems[index].classList.add('active');
          accordionHeaders[index].classList.add('active');
          this.classList.add('active');
          desktopImages[index].classList.add('active');
          
          wrapper.querySelectorAll('.plus-icon').forEach(icon => icon.classList.remove('d-none'));
          wrapper.querySelectorAll('.minus-icon').forEach(icon => icon.classList.add('d-none'));
          
          const plusIcon = this.querySelector('.plus-icon');
          const minusIcon = this.querySelector('.minus-icon');
          if (plusIcon) plusIcon.classList.add('d-none');
          if (minusIcon) minusIcon.classList.remove('d-none');
        }
      });
    });
    
    function handleResponsiveLayout() {
      const isMobile = window.innerWidth <= 767;
      const mobileImages = wrapper.querySelectorAll('.mobile-business-image');
      
      if (isMobile) {
        mobileImages.forEach(imgDiv => {
          imgDiv.style.display = 'block';
        });
      } else {
        mobileImages.forEach(imgDiv => {
          imgDiv.style.display = 'none';
        });
      }
    }
    
    handleResponsiveLayout();
    
    window.addEventListener('resize', handleResponsiveLayout);
  }, 100);
}

