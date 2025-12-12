export default function decorate(block) {
  // Create the new structure
  const header = document.createElement('header');
  header.className = 'd-md-flex align-items-center gap-3';
  
  const companiesCol = document.createElement('div');
  companiesCol.className = 'companiesCol';
  
  // Get all the div children of the block
  const children = Array.from(block.children);
  
  if (children.length >= 4) {
    // Create headerCol div
    const headerCol = document.createElement('div');
    headerCol.className = 'entry-container';
    
    // First child: Title (Listed Companies)
    const titleDiv = children[0];
    const h2 = document.createElement('h2');
    h2.textContent = titleDiv.textContent || titleDiv.innerText;
    headerCol.appendChild(h2);
    
    // Second child: Description paragraph
    const descDiv = children[1];
    const descParagraph = descDiv.querySelector('p');
    if (descParagraph) {
      const newDesc = document.createElement('p');
      newDesc.innerHTML = descParagraph.innerHTML;
      headerCol.appendChild(newDesc);
    }
    
    // Add headerCol to header
    header.appendChild(headerCol);
    
    // Third child: Visit Investor Relations link
    const linkDiv = children[2];
    const linkText = linkDiv.textContent || linkDiv.innerText;
    const link = document.createElement('a');
    link.className = 'btn btn-primary';
    link.href = '#';
    link.textContent = linkText.replace('Visit Investor Relations', '').trim() || 'Visit Investor Relations';
    header.appendChild(link);
    
    // Create companies section
    const row = document.createElement('div');
    row.className = 'row';
    
    // Process company items (starting from 4th child, skipping the button container)
    // Start from index 4 because index 3 is the button container div
    for (let i = 4; i < children.length; i++) {
      const companyDiv = children[i];
      const companyChildren = Array.from(companyDiv.children);
      
      if (companyChildren.length >= 3) {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        
        // Create companiesGrid div
        const companiesGrid = document.createElement('div');
        companiesGrid.className = 'companiesGrid';
        
        // Company name (first child)
        const nameDiv = companyChildren[0];
        const h3 = document.createElement('h3');
        h3.textContent = nameDiv.textContent || nameDiv.innerText;
        companiesGrid.appendChild(h3);
        
        // Company description (second child)
        const descDiv = companyChildren[1];
        const descParagraph = descDiv.querySelector('p');
        if (descParagraph) {
          const newDesc = document.createElement('p');
          newDesc.innerHTML = descParagraph.innerHTML;
          companiesGrid.appendChild(newDesc);
        }
        
        // Add companiesGrid to column
        col.appendChild(companiesGrid);
        
        // Stock number (third child)
        const stockDiv = companyChildren[2];
        if (stockDiv && stockDiv.textContent.trim()) {
          const companiesStock = document.createElement('div');
          companiesStock.className = 'companiesStock';
          companiesStock.textContent = stockDiv.textContent || stockDiv.innerText;
          col.appendChild(companiesStock);
        }
        
        // Skip button containers (index 3 and 4)
        
        row.appendChild(col);
      }
    }
    
    companiesCol.appendChild(row);
    
    // Clear original block content and add new structure
    block.innerHTML = '';
    block.appendChild(header);
    block.appendChild(companiesCol);
  }
}