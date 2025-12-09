// export default function decorate(block) {
//   /* ----------------------------------
//      1. Detect fragment page
//   ---------------------------------- */
//   if (window.location.pathname.includes('/fragments/')) {
//     document.body.classList.add('fragment-page');
//   }

//   /* ----------------------------------
//      2. Normalize DOM
//   ---------------------------------- */
//   const children = [...block.children];

//   const title = children[0];
//   const description = children[1];
//   const cta = children[2];

//   const cards = children.slice(4); // cards start after 4th div

//   // Create layout containers
//   const left = document.createElement('div');
//   left.className = 'success-left';

//   const right = document.createElement('div');
//   right.className = 'success-right';

//   const slider = document.createElement('div');
//   slider.className = 'success-slider';

//   /* ----------------------------------
//      3. Arrows
//   ---------------------------------- */
//   const arrows = document.createElement('div');
//   arrows.className = 'success-arrows';

//   arrows.innerHTML = `
//     <button class="arrow-prev">&#8592;</button>
//     <button class="arrow-next">&#8594;</button>
//   `;

//   /* ----------------------------------
//      4. Assemble layout
//   ---------------------------------- */
//   left.append(title, description, cta, arrows);

//   cards.forEach(card => slider.appendChild(card));

//   right.appendChild(slider);

//   block.innerHTML = '';
//   block.append(left, right);

//   /* ----------------------------------
//      5. Slider logic
//   ---------------------------------- */
//   const prev = arrows.querySelector('.arrow-prev');
//   const next = arrows.querySelector('.arrow-next');

//   next.addEventListener('click', () => {
//     slider.scrollBy({ left: 420, behavior: 'smooth' });
//   });

//   prev.addEventListener('click', () => {
//     slider.scrollBy({ left: -420, behavior: 'smooth' });
//   });

//   /* ----------------------------------
//      6. Site-based filtering (Fragment reuse)
//   ---------------------------------- */
//   const wrapper = block.closest('.section')
//     ?.querySelectorAll('.success-stories-wrapper');

//   if (!wrapper) return;

//   const path = window.location.pathname.toLowerCase();
//   let index = 0;

//   if (path.includes('/aero/')) index = 1;
//   if (path.includes('/infra/')) index = 2;

//   wrapper.forEach((el, i) => {
//     el.style.display = i === index ? 'block' : 'none';
//   });
// }


import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* ----------------------------------
     1. Analyze the Context (Project Detection)
  ---------------------------------- */
  const path = window.location.pathname.toLowerCase();
  let projectFilter = 'all'; // Default to showing everything
  
  // Define your project logic here
  if (path.includes('/airport')) projectFilter = 'airport';
  else if (path.includes('/infra')) projectFilter = 'infra';
  else if (path.includes('/aero-gmr')) projectFilter = 'energy';

  /* ----------------------------------
     2. Setup Layout Containers
  ---------------------------------- */
  const container = document.createElement('div');
  container.classList.add('success-stories-container');

  const leftPanel = document.createElement('div');
  leftPanel.classList.add('success-left');

  const rightPanel = document.createElement('div');
  rightPanel.classList.add('success-right');

  const slider = document.createElement('div');
  slider.classList.add('success-slider');

  /* ----------------------------------
     3. Process Rows (The Fix)
  ---------------------------------- */
  // Convert HTMLCollection to Array for safe slicing
  const rows = [...block.children];

  // Based on your Image: Row 0=Title, 1=Desc, 2=CTA, 3+=Stories
  // We use specific checks to ensure we don't break if a row is missing
  
  rows.forEach((row, index) => {
    // --- PART A: The Header (Left Panel) ---
    if (index === 0) {
      // Title
      const title = row.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) {
        title.classList.add('section-title');
        leftPanel.append(title);
      }
    } 
    else if (index === 1) {
      // Description
      const desc = row.querySelector('p');
      if (desc) {
        desc.classList.add('section-desc');
        leftPanel.append(desc);
      }
    } 
    else if (index === 2) {
      // CTA
      const btn = row.querySelector('a');
      if (btn) {
        const btnWrapper = document.createElement('div');
        btnWrapper.classList.add('section-cta');
        if (btn.closest('strong')) btn.classList.add('primary'); // bold = primary
        btn.classList.add('button');
        btnWrapper.append(btn);
        leftPanel.append(btnWrapper);
      }
    } 
    // --- PART B: The Stories (Right Panel) ---
    else {
      // This is a Story Item Row
      // Expected columns: [Image] | [Text Content] | [Filter Tag (Optional)]
      const cols = [...row.children];
      
      // Safety check: ensure it has content
      if (cols.length >= 2) {
        const imgCol = cols[0];
        const textCol = cols[1];
        // Check for a 3rd column for filtering, otherwise default to 'all'
        const tagCol = cols[2] ? cols[2].textContent.trim().toLowerCase() : 'all';

        // FILTER LOGIC:
        // Render card if:
        // 1. The card tag is 'all' OR
        // 2. The card tag matches the current project OR
        // 3. We are on the main generic page (no specific filter active)
        if (tagCol === 'all' || tagCol === projectFilter || projectFilter === 'all') {
            
            const card = document.createElement('div');
            card.classList.add('story-card');

            // 1. Image
            const pic = imgCol.querySelector('picture');
            if (pic) {
                // Optimization: Use resizing for performance
                const optimized = createOptimizedPicture(pic.querySelector('img').src, 'Story', false, [{ width: '400' }]);
                card.append(optimized);
            }

            // 2. Content
            const content = document.createElement('div');
            content.classList.add('card-content');
            content.innerHTML = textCol.innerHTML;
            
            // Clean up: remove the filter text if it leaked into the content
            // (Standard EDS practice is to just use the text content)
            
            card.append(content);
            slider.append(card);
        }
      }
    }
  });

  /* ----------------------------------
     4. Add Navigation Arrows (Left Panel)
  ---------------------------------- */
  const arrows = document.createElement('div');
  arrows.classList.add('nav-arrows');
  arrows.innerHTML = `
    <button class="prev" aria-label="Previous Story">←</button>
    <button class="next" aria-label="Next Story">→</button>
  `;
  leftPanel.append(arrows);

  /* ----------------------------------
     5. Assemble DOM
  ---------------------------------- */
  rightPanel.append(slider);
  container.append(leftPanel, rightPanel);
  
  block.textContent = ''; // CLEAR OLD CONTENT
  block.append(container); // APPEND NEW CLEAN STRUCTURE

  /* ----------------------------------
     6. Event Listeners (Slider Logic)
  ---------------------------------- */
  const btnNext = arrows.querySelector('.next');
  const btnPrev = arrows.querySelector('.prev');

  if (btnNext && btnPrev) {
      btnNext.addEventListener('click', () => {
        slider.scrollBy({ left: 320, behavior: 'smooth' }); // Adjust 320 to your card width + gap
      });

      btnPrev.addEventListener('click', () => {
        slider.scrollBy({ left: -320, behavior: 'smooth' });
      });
  }
}