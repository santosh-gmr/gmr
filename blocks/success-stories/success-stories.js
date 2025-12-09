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
  // 1. Setup the layout containers
  const leftCol = document.createElement('div');
  leftCol.classList.add('success-stories-left');

  const rightCol = document.createElement('div');
  rightCol.classList.add('success-stories-right');

  const slider = document.createElement('div');
  slider.classList.add('stories-slider');

  // 2. Identify the current Project context (for filtering)
  // Logic: If URL contains '/airport', we look for 'airport' tag.
  const path = window.location.pathname.toLowerCase();
  let projectTag = 'all'; 
  if (path.includes('/airport')) projectTag = 'airport';
  if (path.includes('/infra')) projectTag = 'infra';

  // 3. Get all rows provided in the Authoring Dialog
  const rows = [...block.children];

  // 4. Iterate and Move Content
  rows.forEach((row, index) => {
    
    // --- ROW 0: Section Title ---
    if (index === 0) {
      const titleContent = row.firstElementChild; // Grab the actual div inside
      if (titleContent) {
        titleContent.classList.add('section-title');
        // Move the H2/H3/P element directly to preserve formatting
        leftCol.append(titleContent); 
      }
    } 

    // --- ROW 1: Section Description ---
    else if (index === 1) {
      const descContent = row.firstElementChild;
      if (descContent) {
        descContent.classList.add('section-description');
        leftCol.append(descContent);
      }
    } 

    // --- ROW 2: Call to Action (CTA) ---
    else if (index === 2) {
      const ctaContent = row.firstElementChild;
      if (ctaContent) {
        ctaContent.classList.add('section-cta');
        // Add button class to the link inside
        const link = ctaContent.querySelector('a');
        if (link) link.classList.add('button', 'primary');
        leftCol.append(ctaContent);
      }
    } 

    // --- ROW 3+: Success Story Cards ---
    else {
      // Each row here is a story from your dialog
      const cols = [...row.children];
      
      // We expect: Column 1 (Image), Column 2 (Text), Column 3 (Optional Tag)
      if (cols.length >= 2) {
        const imgCol = cols[0];
        const textCol = cols[1];
        const filterCol = cols[2]; // This might be empty or undefined

        // Filter Logic:
        // If there is a filter column, check if it matches projectTag. 
        // If no filter column exists, show it everywhere (default).
        const itemTag = filterCol ? filterCol.textContent.trim().toLowerCase() : 'all';
        
        if (itemTag === 'all' || itemTag === projectTag || projectTag === 'all') {
            
            const card = document.createElement('div');
            card.classList.add('story-card');

            // Handle Image
            const pic = imgCol.querySelector('picture');
            if (pic) {
                // Optimize image
                const optimizedPic = createOptimizedPicture(pic.querySelector('img').src, 'Success Story', false, [{ width: '400' }]);
                card.append(optimizedPic);
            }

            // Handle Text Content
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('story-content');
            
            // Move all children from the text column to the new card
            // This preserves H3, P, Links, etc. exactly as authored
            while (textCol.firstChild) {
                contentDiv.append(textCol.firstChild);
            }

            card.append(contentDiv);
            slider.append(card);
        }
      }
    }
  });

  // 5. Add Navigation Arrows to Left Column
  const arrows = document.createElement('div');
  arrows.classList.add('slider-arrows');
  arrows.innerHTML = `
    <button class="arrow-prev" aria-label="Previous"></button>
    <button class="arrow-next" aria-label="Next"></button>
  `;
  leftCol.append(arrows);

  // 6. Final DOM Assembly
  rightCol.append(slider);
  
  // Clear the original block structure strictly before appending new ones
  block.textContent = ''; 
  block.append(leftCol);
  block.append(rightCol);

  // 7. Initialize Slider Events
  const prevBtn = arrows.querySelector('.arrow-prev');
  const nextBtn = arrows.querySelector('.arrow-next');

  if(prevBtn && nextBtn) {
      nextBtn.addEventListener('click', () => {
          slider.scrollBy({ left: 320, behavior: 'smooth' });
      });
      prevBtn.addEventListener('click', () => {
          slider.scrollBy({ left: -320, behavior: 'smooth' });
      });
  }
}