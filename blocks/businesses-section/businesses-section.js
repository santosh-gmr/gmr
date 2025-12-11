export default function decorate(block) {
  // Create container wrapper
  const container = document.createElement("div");
  container.className = "business-accordion-container";
  
  // Collect all children
  const children = [...block.children];
  
  // Clear original block content
  block.innerHTML = "";
  
  // --- BUILD HEADER ---
  const header = document.createElement("div");
  header.className = "business-accordion-header";
  
  // First three children are header content
  for (let i = 0; i < Math.min(3, children.length); i++) {
    header.appendChild(children[i]);
  }
  
  // --- BUILD ACCORDION ITEMS ---
  const accordionItems = document.createElement("div");
  accordionItems.className = "business-accordion-items";
  
  // Remaining children are accordion items
  for (let i = 3; i < children.length; i++) {
    const item = children[i];
    item.className = "business-accordion-item";
    
    // Add click handler for accordion functionality
    const titleDiv = item.querySelector('div:nth-child(2)'); // The title div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'accordion-content';
    
    // Move everything after the title into content div
    const elementsToMove = [];
    for (let j = 2; j < item.children.length; j++) {
      elementsToMove.push(item.children[j]);
    }
    
    elementsToMove.forEach(element => {
      contentDiv.appendChild(element);
    });
    
    // Clear original item and rebuild structure
    item.innerHTML = '';
    
    // Create title wrapper with click handler
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'accordion-title';
    titleWrapper.innerHTML = titleDiv.innerHTML;
    titleWrapper.addEventListener('click', () => {
      item.classList.toggle('active');
    });
    
    // Append title and content
    item.appendChild(titleWrapper);
    item.appendChild(contentDiv);
    
    accordionItems.appendChild(item);
  }
  
  // Build the complete structure
  container.appendChild(header);
  container.appendChild(accordionItems);
  
  // Append container to block
  block.appendChild(container);
  
  // Initialize first item as active (optional)
  if (accordionItems.children.length > 0) {
    accordionItems.children[0].classList.add('active');
  }
}