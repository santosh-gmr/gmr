export default function decorate(block) {
  /* ----------------------------------
     1. Detect fragment page
  ---------------------------------- */
  if (window.location.pathname.includes('/fragments/')) {
    document.body.classList.add('fragment-page');
  }

  /* ----------------------------------
     2. Normalize DOM
  ---------------------------------- */
  const children = [...block.children];

  const title = children[0];
  const description = children[1];
  const cta = children[2];

  const cards = children.slice(4); // cards start after 4th div

  // Create layout containers
  const left = document.createElement('div');
  left.className = 'success-left';

  const right = document.createElement('div');
  right.className = 'success-right';

  const slider = document.createElement('div');
  slider.className = 'success-slider';

  /* ----------------------------------
     3. Arrows
  ---------------------------------- */
  const arrows = document.createElement('div');
  arrows.className = 'success-arrows';

  arrows.innerHTML = `
    <button class="arrow-prev">&#8592;</button>
    <button class="arrow-next">&#8594;</button>
  `;

  /* ----------------------------------
     4. Assemble layout
  ---------------------------------- */
  left.append(title, description, cta, arrows);

  cards.forEach(card => slider.appendChild(card));

  right.appendChild(slider);

  block.innerHTML = '';
  block.append(left, right);

  /* ----------------------------------
     5. Slider logic
  ---------------------------------- */
  const prev = arrows.querySelector('.arrow-prev');
  const next = arrows.querySelector('.arrow-next');

  next.addEventListener('click', () => {
    slider.scrollBy({ left: 420, behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    slider.scrollBy({ left: -420, behavior: 'smooth' });
  });

  /* ----------------------------------
     6. Site-based filtering (Fragment reuse)
  ---------------------------------- */
  const wrapper = block.closest('.section')
    ?.querySelectorAll('.success-stories-wrapper');

  if (!wrapper) return;

  const path = window.location.pathname.toLowerCase();
  let index = 0;

  if (path.includes('/aero/')) index = 1;
  if (path.includes('/infra/')) index = 2;

  wrapper.forEach((el, i) => {
    el.style.display = i === index ? 'block' : 'none';
  });
}
