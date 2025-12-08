// business-accordion.js
document.addEventListener('DOMContentLoaded', function() {
    transformBusinessesSection();
    initBusinessAccordion();
});

/**
 * Transform the existing HTML structure to accordion format
 */
function transformBusinessesSection() {
    const section = document.querySelector('.businesses-section');
    if (!section) return;
    
    // Get header content
    const sectionTitle = section.querySelector('[data-aue-prop="sectionTitle"]')?.innerText || '';
    const sectionSubtitle = section.querySelector('[data-aue-prop="sectionSubtitle"]')?.innerText || '';
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
                    ${sectionTitle.replace('/', '')} 
                    ${sectionSubtitle ? `<span>${sectionSubtitle}</span>` : ''}
                </h2>
            ` : ''}
            ${introText ? `<div class="intro-text">${introText}</div>` : ''}
        `;
        wrapper.appendChild(header);
    }
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'business-image-container';
    
    // Create accordion container
    const accordionContainer = document.createElement('div');
    accordionContainer.className = 'business-accordion';
    accordionContainer.id = 'businessAccordion';
    
    // Process each business item
    businessItems.forEach((item, index) => {
        // Extract data from current item
        const image = item.querySelector('[data-aue-prop="image"] img')?.src || 
                     item.querySelector('[data-aue-prop="image"] source')?.srcset || '';
        const altText = item.querySelector('[data-aue-prop="image"] img')?.alt || '';
        const title = item.querySelector('[data-aue-prop="title"]')?.innerText || '';
        const description = item.querySelector('[data-aue-prop="description"]')?.innerHTML || '';
        const ctaLabel = item.querySelector('[data-aue-prop="ctaLabel"]')?.innerText || '';
        const ctaLink = item.querySelector('.button-container a')?.href || '#';
        
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
                <span class="accordion-icon">+</span>
            </button>
        `;
        
        // Create accordion collapse
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = `collapse${index}`;
        accordionCollapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
        accordionCollapse.setAttribute('data-bs-parent', '#businessAccordion');
        
        accordionCollapse.innerHTML = `
            <div class="accordion-body">
                <div class="business-description">${description}</div>
                ${ctaLabel ? `
                    <div class="business-cta">
                        <a href="${ctaLink}" class="button" title="${ctaLabel}">
                            ${ctaLabel}
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Create image element
        const imageElement = document.createElement('img');
        imageElement.className = `business-image ${index === 0 ? 'active' : ''}`;
        imageElement.src = image;
        imageElement.alt = altText;
        imageElement.loading = 'lazy';
        imageElement.setAttribute('data-index', index);
        
        // Append to containers
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);
        accordionContainer.appendChild(accordionItem);
        imageContainer.appendChild(imageElement);
    });
    
    // Create layout container
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'business-accordion-layout';
    
    // Add image container and accordion to layout
    layoutContainer.appendChild(imageContainer);
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
    const businessImages = document.querySelectorAll('.business-image');
    
    // Initialize first item
    if (accordionButtons.length > 0) {
        accordionButtons[0].dispatchEvent(new Event('click'));
    }
    
    // Add click handlers
    accordionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const item = this.closest('.accordion-item');
            const isActive = item.classList.contains('active');
            
            // Update all items
            accordionButtons.forEach((btn, idx) => {
                const item = btn.closest('.accordion-item');
                const image = businessImages[idx];
                
                if (idx === index) {
                    if (!isActive) {
                        item.classList.add('active');
                        btn.classList.remove('collapsed');
                        btn.setAttribute('aria-expanded', 'true');
                        btn.querySelector('.accordion-icon').textContent = '−';
                        
                        if (image) {
                            image.classList.add('active');
                            // Add fade in effect
                            image.style.opacity = '0';
                            setTimeout(() => {
                                image.style.transition = 'opacity 0.3s ease';
                                image.style.opacity = '1';
                            }, 10);
                        }
                    } else {
                        item.classList.remove('active');
                        btn.classList.add('collapsed');
                        btn.setAttribute('aria-expanded', 'false');
                        btn.querySelector('.accordion-icon').textContent = '+';
                        
                        if (image) {
                            image.classList.remove('active');
                        }
                    }
                } else {
                    item.classList.remove('active');
                    btn.classList.add('collapsed');
                    btn.setAttribute('aria-expanded', 'false');
                    btn.querySelector('.accordion-icon').textContent = '+';
                    
                    if (image) {
                        image.classList.remove('active');
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
    });
    
    // Hover effect for preview
    accordionButtons.forEach((button, index) => {
        button.addEventListener('mouseenter', function() {
            const image = businessImages[index];
            if (image && !image.classList.contains('active')) {
                image.style.opacity = '0.3';
                image.style.transition = 'opacity 0.2s ease';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const image = businessImages[index];
            if (image && !image.classList.contains('active')) {
                image.style.opacity = '0';
            }
        });
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
            btn.querySelector('.accordion-icon').textContent = '+';
        });
        
        items.forEach(item => item.classList.remove('active'));
        images.forEach(img => img.classList.remove('active'));
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
}