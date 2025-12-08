// businesses-accordion.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap accordion functionality
    initBusinessesAccordion();
    
    // Handle image preloading and lazy loading if needed
    preloadActiveImages();
});

/**
 * Initialize the Bootstrap accordion for businesses section
 */
function initBusinessesAccordion() {
    const accordionContainer = document.querySelector('.businesses-section');
    
    if (!accordionContainer) {
        console.warn('Businesses section not found on page');
        return;
    }
    
    // Get all accordion items
    const accordionButtons = accordionContainer.querySelectorAll('.accordion-button');
    const accordionItems = accordionContainer.querySelectorAll('.accordion-item');
    const businessImages = accordionContainer.querySelectorAll('.business-image');
    
    // Initialize first item as active if none is active
    if (!accordionContainer.querySelector('.accordion-item.active')) {
        const firstItem = accordionItems[0];
        const firstButton = accordionButtons[0];
        const firstImage = businessImages[0];
        
        if (firstItem) {
            firstItem.classList.add('active');
            firstButton.classList.remove('collapsed');
            firstButton.setAttribute('aria-expanded', 'true');
            
            // Show first image
            if (firstImage) {
                firstImage.classList.add('active');
            }
        }
    }
    
    // Add click event listeners to accordion buttons
    accordionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const item = this.closest('.accordion-item');
            const targetId = this.getAttribute('data-bs-target') || 
                            this.getAttribute('href');
            const businessImage = businessImages[index];
            
            // Check if clicking on already active item
            const isAlreadyActive = item.classList.contains('active');
            
            // Close all items
            closeAllAccordionItems(accordionItems, accordionButtons, businessImages);
            
            // If not already active, open this one
            if (!isAlreadyActive) {
                openAccordionItem(item, this, businessImage);
                
                // Dispatch custom event for analytics or other tracking
                dispatchAccordionEvent('accordionOpened', {
                    itemIndex: index,
                    title: this.querySelector('.business-title')?.textContent || ''
                });
            } else {
                // Dispatch event for accordion closed
                dispatchAccordionEvent('accordionClosed', {
                    itemIndex: index,
                    title: this.querySelector('.business-title')?.textContent || ''
                });
            }
        });
        
        // Add keyboard accessibility
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
            
            // Arrow key navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                navigateAccordionItems(e.key, accordionButtons, index);
            }
        });
    });
    
    // Initialize Bootstrap collapse if Bootstrap JS is available
    if (typeof bootstrap !== 'undefined') {
        initBootstrapCollapse();
    }
}

/**
 * Close all accordion items
 */
function closeAllAccordionItems(items, buttons, images) {
    items.forEach(item => {
        item.classList.remove('active');
        const collapseElement = item.querySelector('.accordion-collapse');
        if (collapseElement) {
            collapseElement.classList.remove('show');
        }
    });
    
    buttons.forEach(button => {
        button.classList.add('collapsed');
        button.setAttribute('aria-expanded', 'false');
    });
    
    images.forEach(img => {
        img.classList.remove('active');
    });
}

/**
 * Open a specific accordion item
 */
function openAccordionItem(item, button, image) {
    item.classList.add('active');
    button.classList.remove('collapsed');
    button.setAttribute('aria-expanded', 'true');
    
    // Show corresponding image
    if (image) {
        image.classList.add('active');
    }
    
    // If using Bootstrap collapse
    const collapseElement = item.querySelector('.accordion-collapse');
    if (collapseElement) {
        collapseElement.classList.add('show');
    }
}

/**
 * Navigate accordion items with keyboard arrows
 */
function navigateAccordionItems(key, buttons, currentIndex) {
    let nextIndex;
    
    if (key === 'ArrowDown') {
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
    }
    
    if (nextIndex !== undefined) {
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
    }
}

/**
 * Initialize Bootstrap Collapse component
 */
function initBootstrapCollapse() {
    const collapseElements = document.querySelectorAll('.accordion-collapse');
    
    collapseElements.forEach(collapseEl => {
        // Add Bootstrap event listeners
        collapseEl.addEventListener('show.bs.collapse', function(e) {
            const item = this.closest('.accordion-item');
            const button = item.querySelector('.accordion-button');
            const index = Array.from(document.querySelectorAll('.accordion-button')).indexOf(button);
            const image = document.querySelectorAll('.business-image')[index];
            
            if (image) {
                image.classList.add('active');
            }
        });
        
        collapseEl.addEventListener('hide.bs.collapse', function(e) {
            const item = this.closest('.accordion-item');
            const button = item.querySelector('.accordion-button');
            const index = Array.from(document.querySelectorAll('.accordion-button')).indexOf(button);
            const image = document.querySelectorAll('.business-image')[index];
            
            if (image) {
                image.classList.remove('active');
            }
        });
    });
}

/**
 * Preload images for better user experience
 */
function preloadActiveImages() {
    // Preload first image (active by default)
    const firstImage = document.querySelector('.business-image.active img');
    if (firstImage && firstImage.dataset.src) {
        const img = new Image();
        img.src = firstImage.dataset.src;
    }
    
    // Optional: Preload all images on hover
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const index = Array.from(accordionButtons).indexOf(this);
            const image = document.querySelectorAll('.business-image')[index];
            if (image) {
                const imgElement = image.querySelector('img');
                if (imgElement && imgElement.dataset.src && !imgElement.src) {
                    const img = new Image();
                    img.src = imgElement.dataset.src;
                    img.onload = function() {
                        imgElement.src = imgElement.dataset.src;
                    };
                }
            }
        });
    });
}

/**
 * Dispatch custom events for tracking
 */
function dispatchAccordionEvent(eventName, detail) {
    const event = new CustomEvent(`businessAccordion:${eventName}`, {
        detail: detail,
        bubbles: true
    });
    document.dispatchEvent(event);
}

/**
 * Public API for external control
 */
window.BusinessesAccordion = {
    openItem: function(index) {
        const buttons = document.querySelectorAll('.accordion-button');
        if (buttons[index]) {
            buttons[index].click();
        }
    },
    
    closeAll: function() {
        const accordionContainer = document.querySelector('.businesses-section');
        if (accordionContainer) {
            const items = accordionContainer.querySelectorAll('.accordion-item');
            const buttons = accordionContainer.querySelectorAll('.accordion-button');
            const images = accordionContainer.querySelectorAll('.business-image');
            closeAllAccordionItems(items, buttons, images);
        }
    },
    
    getActiveIndex: function() {
        const activeItem = document.querySelector('.accordion-item.active');
        if (activeItem) {
            const items = document.querySelectorAll('.accordion-item');
            return Array.from(items).indexOf(activeItem);
        }
        return -1;
    }
};

// Auto-initialize if script is loaded after DOM is ready
if (document.readyState !== 'loading') {
    initBusinessesAccordion();
}