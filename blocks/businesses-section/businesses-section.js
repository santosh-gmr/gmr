// business-accordion.js
document.addEventListener('DOMContentLoaded', function() {
    initBusinessesAccordion();
});

/**
 * Initialize and transform the businesses section into an accordion
 */
function initBusinessesAccordion() {
    const section = document.querySelector('.businesses-section');
    if (!section) return;
    
    // Create container for the accordion
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'business-accordion-wrapper';
    
    // Extract header content
    const sectionTitle = section.querySelector('[data-aue-prop="sectionTitle"]')?.textContent?.trim() || '';
    const sectionSubtitle = section.querySelector('[data-aue-prop="sectionSubtitle"]')?.textContent?.trim() || '';
    const introText = section.querySelector('[data-aue-prop="introText"]')?.innerHTML || '';
    
    // Create header
    const header = document.createElement('header');
    header.className = 'businesses-header';
    
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
    
    // Get all business items
    const businessItems = section.querySelectorAll('[data-aue-model="business-item"]');
    
    // Create main container with two columns
    const mainContainer = document.createElement('div');
    mainContainer.className = 'business-accordion-container';
    
    // Create image preview container (for desktop)
    const imagePreviewContainer = document.createElement('div');
    imagePreviewContainer.className = 'business-image-preview';
    
    // Create accordion container
    const accordionInner = document.createElement('div');
    accordionInner.className = 'accordion';
    accordionInner.id = 'businessAccordion';
    
    // Store image data
    const allImages = [];
    
    // Process each business item
    businessItems.forEach((item, index) => {
        // Extract data
        const imgElement = item.querySelector('[data-aue-prop="image"] img');
        const imageSrc = imgElement?.src || '';
        const imageAlt = imgElement?.alt || '';
        const title = item.querySelector('[data-aue-prop="title"]')?.textContent?.trim() || '';
        const description = item.querySelector('[data-aue-prop="description"]')?.innerHTML || '';
        const ctaLabel = item.querySelector('[data-aue-prop="ctaLabel"]')?.textContent?.trim() || '';
        const ctaLinkElement = item.querySelector('.button-container a');
        const ctaLink = ctaLinkElement?.href || '#';
        const ctaTitle = ctaLinkElement?.title || ctaLabel;
        
        // Store image data
        allImages.push({
            src: imageSrc,
            alt: imageAlt,
            title: title,
            index: index
        });
        
        // Create accordion item
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.setAttribute('data-index', index);
        
        // Create accordion header
        const accordionHeader = document.createElement('h3');
        accordionHeader.className = 'accordion-header';
        
        const button = document.createElement('button');
        button.className = `accordion-button ${index === 0 ? '' : 'collapsed'}`;
        button.type = 'button';
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', `#collapse${index}`);
        button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
        button.setAttribute('aria-controls', `collapse${index}`);
        
        button.innerHTML = `
            <span class="accordion-title">${title}</span>
            <span class="accordion-icon">${index === 0 ? '−' : '+'}</span>
        `;
        
        accordionHeader.appendChild(button);
        
        // Create accordion collapse
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = `collapse${index}`;
        accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
        accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');
        
        // Create accordion body with mobile image
        accordionCollapse.innerHTML = `
            <div class="accordion-body">
                <div class="business-description">${description}</div>
                ${ctaLabel ? `
                    <div class="business-cta">
                        <a href="${ctaLink}" class="button" title="${ctaTitle}">
                            ${ctaLabel}
                        </a>
                    </div>
                ` : ''}
                <div class="mobile-image" data-index="${index}">
                    <img src="${imageSrc}" alt="${imageAlt}" loading="lazy">
                </div>
            </div>
        `;
        
        // Append to accordion item
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);
        
        // Add to accordion container
        accordionInner.appendChild(accordionItem);
    });
    
    // Create desktop image elements
    allImages.forEach((imgData, index) => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = `desktop-image ${index === 0 ? 'active' : ''}`;
        imgWrapper.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.alt;
        img.loading = 'lazy';
        
        imgWrapper.appendChild(img);
        imagePreviewContainer.appendChild(imgWrapper);
    });
    
    // Assemble the main container
    mainContainer.appendChild(imagePreviewContainer);
    mainContainer.appendChild(accordionInner);
    
    // Build the complete structure
    accordionContainer.appendChild(header);
    accordionContainer.appendChild(mainContainer);
    
    // Replace the original section content
    section.innerHTML = '';
    section.appendChild(accordionContainer);
    
    // Initialize accordion functionality
    setupAccordionFunctionality();
    setupResponsiveBehavior();
}

/**
 * Setup accordion click functionality
 */
function setupAccordionFunctionality() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    const desktopImages = document.querySelectorAll('.desktop-image');
    const mobileImages = document.querySelectorAll('.mobile-image');
    
    // Set initial state
    if (accordionButtons.length > 0 && desktopImages.length > 0) {
        desktopImages[0].classList.add('active');
        mobileImages[0].style.display = 'block';
    }
    
    // Add click handlers
    accordionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isCurrentlyActive = !this.classList.contains('collapsed');
            
            // Close all items if clicking on an active one
            if (isCurrentlyActive) {
                closeAllAccordionItems();
                return;
            }
            
            // Open the clicked item
            openAccordionItem(index);
        });
        
        // Add keyboard support
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
    });
    
    /**
     * Open a specific accordion item
     */
    function openAccordionItem(index) {
        // Update accordion buttons
        accordionButtons.forEach((btn, idx) => {
            const isActive = idx === index;
            btn.classList.toggle('collapsed', !isActive);
            btn.setAttribute('aria-expanded', isActive);
            const icon = btn.querySelector('.accordion-icon');
            if (icon) {
                icon.textContent = isActive ? '−' : '+';
            }
        });
        
        // Update accordion collapses
        const collapses = document.querySelectorAll('.accordion-collapse');
        collapses.forEach((collapse, idx) => {
            if (idx === index) {
                collapse.classList.add('show');
            } else {
                collapse.classList.remove('show');
            }
        });
        
        // Update desktop images
        desktopImages.forEach((imgWrapper, idx) => {
            imgWrapper.classList.toggle('active', idx === index);
        });
        
        // Update mobile images
        mobileImages.forEach((mobileImg, idx) => {
            mobileImg.style.display = idx === index ? 'block' : 'none';
        });
        
        // Dispatch event
        const event = new CustomEvent('businessAccordion:change', {
            detail: { index: index }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Close all accordion items
     */
    function closeAllAccordionItems() {
        accordionButtons.forEach(btn => {
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
            const icon = btn.querySelector('.accordion-icon');
            if (icon) icon.textContent = '+';
        });
        
        const collapses = document.querySelectorAll('.accordion-collapse');
        collapses.forEach(collapse => {
            collapse.classList.remove('show');
        });
        
        desktopImages.forEach(img => {
            img.classList.remove('active');
        });
        
        mobileImages.forEach(mobileImg => {
            mobileImg.style.display = 'none';
        });
    }
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior() {
    const imagePreview = document.querySelector('.business-image-preview');
    const mobileImages = document.querySelectorAll('.mobile-image');
    
    function updateLayout() {
        const isMobile = window.innerWidth < 992;
        
        if (imagePreview) {
            imagePreview.style.display = isMobile ? 'none' : 'block';
        }
        
        // On mobile, show images only in active accordion items
        if (isMobile) {
            mobileImages.forEach(img => {
                const index = parseInt(img.getAttribute('data-index'));
                const button = document.querySelector(`.accordion-button[data-bs-target="#collapse${index}"]`);
                if (button) {
                    const isActive = !button.classList.contains('collapsed');
                    img.style.display = isActive ? 'block' : 'none';
                }
            });
        }
    }
    
    // Initial update
    updateLayout();
    
    // Update on resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateLayout, 250);
    });
}

/**
 * Public API
 */
window.BusinessAccordion = {
    openItem: function(index) {
        const button = document.querySelector(`.accordion-button[data-bs-target="#collapse${index}"]`);
        if (button) button.click();
    },
    
    closeAll: function() {
        const buttons = document.querySelectorAll('.accordion-button');
        buttons.forEach(btn => {
            if (!btn.classList.contains('collapsed')) {
                btn.click();
            }
        });
    },
    
    getActiveIndex: function() {
        const activeButton = document.querySelector('.accordion-button[aria-expanded="true"]');
        if (activeButton) {
            const target = activeButton.getAttribute('data-bs-target');
            const match = target?.match(/collapse(\d+)/);
            return match ? parseInt(match[1]) : -1;
        }
        return -1;
    }
};

// Auto-initialize
if (document.readyState !== 'loading') {
    initBusinessesAccordion();
}