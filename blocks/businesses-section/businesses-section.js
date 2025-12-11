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
  

  
  imagePreview.appendChild(imageContainer);
  accordionContainer.appendChild(imagePreview);
  
  // --- CREATE ACCORDION ---
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "businessAccordion";

  
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
