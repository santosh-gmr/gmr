export default function decorate(block) {
  // Create the main container
  const container = document.createElement('div');
  container.className = 'careerSection';
  
  // Create the row
  const row = document.createElement('div');
  row.className = 'row';
  
  // Create three columns
  const col1 = document.createElement('div');
  col1.className = 'col-md-4';
  
  const col2 = document.createElement('div');
  col2.className = 'col-md-4';
  
  const col3 = document.createElement('div');
  col3.className = 'col-md-4';
  
  // Get all child divs from the original block
  const children = Array.from(block.children);
  
  // Arrays to store different types of content
  const images = [];
  let headerText = '';
  let contentH2 = null;
  let contentH3 = null;  // Changed from contentH2 to contentH3
  let contentP = null;
  let ctaText = '';
  let ctaLink = null;
  
  // Process each child div
  children.forEach((child) => {
    // Check for header text (first text content)
    if (child.querySelector('p') && !headerText && !child.querySelector('a.button')) {
      const p = child.querySelector('p');
      if (p && p.textContent && !p.textContent.includes('Explore Life at')) {
        headerText = p.textContent.trim();
      }
    }
    
    // Check for images
    const picture = child.querySelector('picture');
    if (picture) {
      images.push(child);
    }
    
    // Check for content H2 or H3
    const h2 = child.querySelector('h2');
    const h3 = child.querySelector('h3'); // Also check for h3
    
    if (h2 && h2.id === 'be-part-of-a-team-that-values-innovation-growth-and-impact') {
      contentH2 = h2;
      
      // Get the paragraph that follows this h2
      const nextSibling = child.querySelector('p');
      if (nextSibling && nextSibling.textContent.includes('Build your career')) {
        contentP = nextSibling;
      }
    } else if (h3 && h3.textContent.includes('Be part of a team')) {
      // Check for h3 with the specific text
      contentH3 = h3;
      
      // Get the paragraph that follows this h3
      const nextSibling = child.querySelector('p');
      if (nextSibling && nextSibling.textContent.includes('Build your career')) {
        contentP = nextSibling;
      }
    }
    
    // Check for CTA text (Explore Life at GMR)
    const p = child.querySelector('p');
    if (p && p.textContent.includes('Explore Life at')) {
      ctaText = p.textContent.trim();
    }
    
    // Check for CTA button
    const buttonLink = child.querySelector('a.button');
    if (buttonLink) {
      ctaLink = buttonLink;
    }
  });
  
  // Build Column 1 - Two images
  if (images.length >= 2) {
    // First image (top left)
    const imgDiv1 = document.createElement('div');
    imgDiv1.className = 'careerImg picone';
    const picture1 = images[0].querySelector('picture');
    if (picture1) {
      const img1 = document.createElement('img');
      const imgSrc = picture1.querySelector('img').src;
      img1.src = imgSrc;
      img1.setAttribute('data-aue-prop', 'imageOffice');
      img1.setAttribute('data-aue-label', 'Image 1 (Top Left)');
      img1.setAttribute('data-aue-type', 'media');
      imgDiv1.appendChild(img1);
    }
    col1.appendChild(imgDiv1);
    
    // Second image (bottom left)
    const imgDiv2 = document.createElement('div');
    imgDiv2.className = 'careerImg pictwo';
    const picture2 = images[1].querySelector('picture');
    if (picture2) {
      const img2 = document.createElement('img');
      const imgSrc = picture2.querySelector('img').src;
      img2.src = imgSrc;
      img2.setAttribute('data-aue-prop', 'imageTeamSmall');
      img2.setAttribute('data-aue-label', 'Image 2 (Bottom Left)');
      img2.setAttribute('data-aue-type', 'media');
      imgDiv2.appendChild(img2);
    }
    col1.appendChild(imgDiv2);
  }
  
  // Build Column 2 - Content
  const cardContent = document.createElement('div');
  cardContent.className = 'cardContent';
  
  // Use H3 if available, otherwise use H2
  if (contentH3) {
    const h3 = document.createElement('h3'); // Create h3 element
    h3.textContent = contentH3.textContent;
    cardContent.appendChild(h3);
  } else if (contentH2) {
    const h2 = document.createElement('h2');
    h2.textContent = contentH2.textContent;
    cardContent.appendChild(h2);
  }
  
  if (contentP) {
    const p = document.createElement('p');
    p.textContent = contentP.textContent;
    cardContent.appendChild(p);
  } else if (!contentP && (contentH3 || contentH2)) {
    // If paragraph is missing, add a fallback
    const p = document.createElement('p');
    p.textContent = 'Build your career in a company where your ambition meets opportunity.';
    cardContent.appendChild(p);
  }
  
  col2.appendChild(cardContent);
  
  // Build Column 3 - Large image and CTA
  if (images.length >= 3) {
    const imgDiv3 = document.createElement('div');
    imgDiv3.className = 'careerImg picthree';
    const picture3 = images[2].querySelector('picture');
    if (picture3) {
      const img3 = document.createElement('img');
      const imgSrc = picture3.querySelector('img').src;
      img3.src = imgSrc;
      img3.setAttribute('data-aue-prop', 'imageTeamLarge');
      img3.setAttribute('data-aue-label', 'Image 3 (Right Side)');
      img3.setAttribute('data-aue-type', 'media');
      imgDiv3.appendChild(img3);
    }
    col3.appendChild(imgDiv3);
  }
  
  // Add CTA button
  const ctaDiv = document.createElement('div');
  ctaDiv.className = 'cta careerBtn';
  
  const link = document.createElement('a');
  link.className = 'btn btn-orange w-100';
  if (ctaLink) {
    link.href = ctaLink.href || '#';
    link.textContent = ctaText || ctaLink.textContent || 'Explore Life at GMR';
    link.setAttribute('title', ctaLink.getAttribute('title') || '#');
  }
  
  ctaDiv.appendChild(link);
  col3.appendChild(ctaDiv);
  
  // Assemble the structure
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  container.appendChild(row);
  
  // Clear the original block
  block.innerHTML = '';
  
  // Create and prepend the header
  if (headerText) {
    const header = document.createElement('header');
    header.className = 'entry-container text-center';
    
    const headerH2 = document.createElement('h2');
    headerH2.textContent = headerText;
    headerH2.className = 'title';
    
    header.appendChild(headerH2);
    block.appendChild(header);
  }
  
  // Add the main container
  block.appendChild(container);
}