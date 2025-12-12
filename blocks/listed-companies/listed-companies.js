export default function decorate(block) {
  const header = document.createElement('header');
  header.className = 'd-md-flex align-items-center gap-3';
  
  const companiesCol = document.createElement('div');
  companiesCol.className = 'companiesCol';
  
  const children = Array.from(block.children);
  
  if (children.length >= 4) {
    // --- HEADER ---
    const headerCol = document.createElement('div');
    headerCol.className = 'entry-container';
    
    const titleDiv = children[0];
    const h2 = document.createElement('h2');
    h2.textContent = titleDiv.textContent || titleDiv.innerText;
    headerCol.appendChild(h2);
    
    const descDiv = children[1];
    const descParagraph = descDiv.querySelector('p');
    if (descParagraph) {
      const newDesc = document.createElement('p');
      newDesc.innerHTML = descParagraph.innerHTML;
      headerCol.appendChild(newDesc);
    }
    
    header.appendChild(headerCol);
    
    // Third child: Visit Investor Relations link
    const linkDiv = children[2];
    const linkText = linkDiv.textContent || linkDiv.innerText;
    const link = document.createElement('a');
    link.className = 'btn btn-orange';
    link.href = '#';
    link.textContent = linkText.trim() || 'Visit Investor Relations';
    header.appendChild(link);
    
    // --- COMPANIES ---
    const row = document.createElement('div');
    row.className = 'row';
    
    for (let i = 3; i < children.length; i++) {
      const companyDiv = children[i];
      const companyChildren = Array.from(companyDiv.children);
      
      const col = document.createElement('div');
      col.className = 'col-md-6 mb-4';
      
      const companiesGrid = document.createElement('div');
      companiesGrid.className = 'companiesGrid';
      
      companyChildren.forEach((child) => {
        const text = child.textContent.trim();
        if (!text) return;
        
        if (child.querySelector('p')) {
          const p = document.createElement('p');
          p.innerHTML = child.querySelector('p').innerHTML;
          companiesGrid.appendChild(p);
        } else if (/Visit Website/i.test(text) || /Explore Highlights/i.test(text)) {
          const a = document.createElement('a');
          a.className = 'btn btn-link';
          a.href = '#';
          a.textContent = text;
          const linksContainer = companiesGrid.querySelector('.companies-links') || (() => {
            const div = document.createElement('div');
            div.className = 'companies-links mt-5 mb-4';
            companiesGrid.appendChild(div);
            return div;
          })();
          linksContainer.appendChild(a);
        } else {
          // assume first child is h3 (company name)
          if (!companiesGrid.querySelector('h3')) {
            const h3 = document.createElement('h3');
            h3.textContent = text;
            companiesGrid.insertBefore(h3, companiesGrid.firstChild);
          } else {
            // other text could be stock
            const stockDiv = document.createElement('div');
            stockDiv.className = 'companiesStock';
            stockDiv.textContent = text;
            col.appendChild(stockDiv);
          }
        }
      });
      
      col.appendChild(companiesGrid);
      row.appendChild(col);
    }
    
    companiesCol.appendChild(row);
    block.innerHTML = '';
    block.appendChild(header);
    block.appendChild(companiesCol);
  }
}
