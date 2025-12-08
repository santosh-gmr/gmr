// business-accordion.js
document.addEventListener('DOMContentLoaded', function() {
    transformBusinessesSection();
    initBusinessAccordion();
    setupMobileImageLayout();
    window.addEventListener('resize', setupMobileImageLayout);
});

/**
 * Transform the existing HTML structure to accordion format
 */
function transformBusinessesSection() {
    const section = document.querySelector('.businesses-section');
    if (!section) return;
    
    // Get header content
    const sectionTitle = section.querySelector('[data-aue-prop="sectionTitle"]')?.textContent || '';
    const sectionSubtitle = section.querySelector('[data-aue-prop="sectionSubtitle"]')?.textContent || '';
    const introText = section.querySelector('[data-aue-prop="introText"]')?.innerHTML || '';
    
    // Get all business items
    const businessItems = section.querySelectorAll('[data-aue-model="business-item"]');
    
    // Create new structure
    const wrapper = document.createElement('div');
    wrapper.className = 'business-accordion-container';
    
    // Create header
    if (sectionTitle || sectionSubtitle || introText) {
        const header = document.createElement('header');
        header.innerHTML = `
            ${sectionTitle || sectionSubtitle ? `
                <h2>
                    ${sectionTitle.replace('/', '').trim()} 
                    ${sectionSubtitle ? `<span>${sectionSubtitle}</span>` : ''}
                </h2>
            ` : ''}
            ${introText ? `<div class="intro-text">${introText}</div>` : ''}
        `;
        wrapper.appendChild(header);
    }
    
    // Create desktop image container (hidden on mobile)
    const desktopImageContainer = document.createElement('div');
    desktopImageContainer.className = 'business-image-container desktop-images';
    
    // Create accordion container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'business-accordion';
    accordionContainer.id = 'businessAccordion';
    
    // Store image data for mobile use
    const mobileImages = [];
    
    // Process each business item
    businessItems.forEach((item, index) => {
        // Extract data from current item
        const imageElement = item.querySelector('[data-aue-prop="image"] img');
        const imageSrc = imageElement?.src || '';
        const altText = imageElement?.alt || title;
        const title = item.querySelector('[data-aue-prop="title"]')?.textContent || '';
        const description = item.querySelector('[data-aue-prop="description"]')?.innerHTML || '';
        const ctaLabel = item.querySelector('[data-aue-prop="ctaLabel"]')?.textContent || '';
        const buttonElement = item.querySelector('.button-container a');
        const ctaLink = buttonElement?.href || '#';
        const buttonTitle = buttonElement?.title || ctaLabel;
        
        // Store for mobile
        mobileImages.push({
            src: imageSrc,
            alt: altText,
            index: index
        });
        
        // Create accordion item
        const accordionItem = document.createElement('div');
        accordionItem.className = `accordion-item ${index === 0 ? 'active' : ''}`;
        accordionItem.setAttribute('data-index', index);
        
        // Create accordion header
        const accordionHeader = document.createElement('div');
        accordionHeader.className = 'accordion-header';
        accordionHeader.innerHTML = `
            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapse${index}"
                    aria-expanded="${index === 0 ? 'true' : 'false'}" 
                    aria-controls="collapse${index}">
                <span class="business-title">${title}</span>
                <span class="accordion-icon">${index === 0 ? '−' : '+'}</span>
            </button>
        `;
        
        // Create accordion collapse with mobile image placeholder
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = `collapse${index}`;
        accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
        accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');
        
        accordionCollapse.innerHTML = `
            <div class="accordion-body">
                <div class="business-description">${description}</div>
                ${ctaLabel ? `
                    <div class="business-cta">
                        <a href="${ctaLink}" class="button" title="${buttonTitle}">
                            ${ctaLabel}
                        </a>
                    </div>
                ` : ''}
                <!-- Mobile image will be inserted here by JavaScript -->
                <div class="mobile-image-container" data-index="${index}"></div>
            </div>
        `;
        
        // Create desktop image element
        const desktopImageElement = document.createElement('img');
        desktopImageElement.className = `business-image ${index === 0 ? 'active' : ''}`;
        desktopImageElement.src = imageSrc;
        desktopImageElement.alt = altText;
        desktopImageElement.loading = 'lazy';
        desktopImageElement.setAttribute('data-index', index);
        
        // Create mobile image element
        const mobileImageElement = document.createElement('img');
        mobileImageElement.className = `mobile-business-image`;
        mobileImageElement.src = imageSrc;
        mobileImageElement.alt = altText;
        mobileImageElement.loading = 'lazy';
        mobileImageElement.setAttribute('data-index', index);
        
        // Append to containers
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);
        accordionContainer.appendChild(accordionItem);
        desktopImageContainer.appendChild(desktopImageElement);
        
        // Add mobile image to its container
        const mobileImageContainer = accordionCollapse.querySelector('.mobile-image-container');
        if (mobileImageContainer) {
            mobileImageContainer.appendChild(mobileImageElement);
        }
    });
    
    // Create layout container
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'business-accordion-layout';
    
    // Add image container and accordion to layout
    layoutContainer.appendChild(desktopImageContainer);
    layoutContainer.appendChild(accordionContainer);
    wrapper.appendChild(layoutContainer);
    
    // Replace original content
    section.innerHTML = '';
    section.appendChild(wrapper);
}

/**
 * Initialize accordion functionality
 */
function initBusinessAccordion() {
    const accordion = document.querySelector('.business-accordion');
    if (!accordion) return;
    
    const accordionButtons = accordion.querySelectorAll('.accordion-button');
    const desktopImages = document.querySelectorAll('.business-image-container.desktop-images .business-image');
    
    // Add click handlers
    accordionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const item = this.closest('.accordion-item');
            const isActive = item.classList.contains('active');
            
            // Update all items
            accordionButtons.forEach((btn, idx) => {
                const itm = btn.closest('.accordion-item');
                const desktopImage = desktopImages[idx];
                const icon = btn.querySelector('.accordion-icon');
                
                if (idx === index) {
                    if (!isActive) {
                        // Activate this item
                        itm.classList.add('active');
                        btn.classList.remove('collapsed');
                        btn.setAttribute('aria-expanded', 'true');
                        
                        if (icon) icon.textContent = '−';
                        
                        if (desktopImage) {
                            // Hide all images first
                            desktopImages.forEach(img => {
                                img.classList.remove('active');
                                img.style.opacity = '0';
                            });
                            
                            // Show current image with animation
                            desktopImage.classList.add('active');
                            desktopImage.style.transition = 'opacity 0.5s ease';
                            desktopImage.style.opacity = '1';
                        }
                    } else {
                        // Deactivate this item
                        itm.classList.remove('active');
                        btn.classList.add('collapsed');
                        btn.setAttribute('aria-expanded', 'false');
                        
                        if (icon) icon.textContent = '+';
                        
                        if (desktopImage) {
                            desktopImage.classList.remove('active');
                            desktopImage.style.opacity = '0';
                        }
                    }
                } else {
                    // Deactivate other items
                    itm.classList.remove('active');
                    btn.classList.add('collapsed');
                    btn.setAttribute('aria-expanded', 'false');
                    
                    if (icon) icon.textContent = '+';
                    
                    if (desktopImage) {
                        desktopImage.classList.remove('active');
                        desktopImage.style.opacity = '0';
                    }
                }
            });
            
            // Dispatch custom event
            const event = new CustomEvent('businessAccordionChange', {
                detail: {
                    index: index,
                    title: this.querySelector('.business-title')?.textContent,
                    isActive: !isActive
                }
            });
            accordion.dispatchEvent(event);
        });
        
        // Keyboard navigation
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % accordionButtons.length;
                accordionButtons[nextIndex].focus();
                accordionButtons[nextIndex].click();
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + accordionButtons.length) % accordionButtons.length;
                accordionButtons[prevIndex].focus();
                accordionButtons[prevIndex].click();
            }
        });
        
        // Hover effect for preview (desktop only)
        button.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 992) { // Desktop only
                const desktopImage = desktopImages[index];
                if (desktopImage && !desktopImage.classList.contains('active')) {
                    desktopImage.style.opacity = '0.5';
                    desktopImage.style.transition = 'opacity 0.3s ease';
                }
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 992) { // Desktop only
                const desktopImage = desktopImages[index];
                if (desktopImage && !desktopImage.classList.contains('active')) {
                    desktopImage.style.opacity = '0';
                }
            }
        });
    });
}

/**
 * Setup mobile image layout
 */
function setupMobileImageLayout() {
    const isMobile = window.innerWidth < 992;
    const desktopImageContainer = document.querySelector('.business-image-container.desktop-images');
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    
    if (desktopImageContainer) {
        // Show/hide desktop images based on screen size
        desktopImageContainer.style.display = isMobile ? 'none' : 'block';
    }
    
    // Show/hide mobile images based on active state
    mobileImages.forEach(img => {
        const index = img.getAttribute('data-index');
        const accordionItem = document.querySelector(`.accordion-item[data-index="${index}"]`);
        
        if (accordionItem) {
            const isActive = accordionItem.classList.contains('active');
            const parentContainer = img.closest('.mobile-image-container');
            
            if (parentContainer) {
                if (isMobile) {
                    img.style.display = isActive ? 'block' : 'none';
                    parentContainer.style.display = 'block';
                    
                    if (isActive) {
                        img.style.opacity = '1';
                        img.style.transition = 'opacity 0.3s ease';
                    }
                } else {
                    parentContainer.style.display = 'none';
                }
            }
        }
    });
    
    // Update image heights for mobile
    if (isMobile) {
        updateMobileImageHeights();
    }
}

/**
 * Update mobile image heights for consistency
 */
function updateMobileImageHeights() {
    const mobileImages = document.querySelectorAll('.mobile-business-image');
    let maxHeight = 0;
    
    // First, reset all heights
    mobileImages.forEach(img => {
        img.style.height = 'auto';
    });
    
    // Find the maximum natural height
    mobileImages.forEach(img => {
        if (img.naturalHeight > 0) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const width = img.offsetWidth || 300; // Default width
            const height = width / aspectRatio;
            maxHeight = Math.max(maxHeight, height);
        }
    });
    
    // Apply consistent height if we found a max
    if (maxHeight > 0) {
        mobileImages.forEach(img => {
            img.style.height = `${maxHeight}px`;
            img.style.objectFit = 'cover';
        });
    }
}

/**
 * Preload images for better UX
 */
function preloadImages() {
    const allImages = document.querySelectorAll('.business-image, .mobile-business-image');
    allImages.forEach(img => {
        if (img.src && !img.complete) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
}

/**
 * Public API
 */
window.BusinessAccordion = {
    openItem: function(index) {
        const buttons = document.querySelectorAll('.accordion-button');
        if (buttons[index]) {
            buttons[index].click();
        }
    },
    
    closeAll: function() {
        const buttons = document.querySelectorAll('.accordion-button');
        const items = document.querySelectorAll('.accordion-item');
        const images = document.querySelectorAll('.business-image');
        
        buttons.forEach(btn => {
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
            const icon = btn.querySelector('.accordion-icon');
            if (icon) icon.textContent = '+';
        });
        
        items.forEach(item => item.classList.remove('active'));
        images.forEach(img => {
            img.classList.remove('active');
            img.style.opacity = '0';
        });
        
        setupMobileImageLayout();
    },
    
    getActiveIndex: function() {
        const activeItem = document.querySelector('.accordion-item.active');
        if (activeItem) {
            return parseInt(activeItem.getAttribute('data-index'));
        }
        return -1;
    }
};

// Initialize on page load
if (document.readyState !== 'loading') {
    transformBusinessesSection();
    initBusinessAccordion();
    setupMobileImageLayout();
    preloadImages();
}