export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = '';

  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'pe-section';

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'pe-items';

  rows.forEach((row, index) => {
    const cells = [...row.children];

    // First row = section title + description
    if (index === 0) {
      const title = cells[0]?.innerText || '';
      const desc = cells[1]?.innerHTML || '';

      sectionDiv.innerHTML = `
        <h2 class="pe-title">${title}</h2>
        <p class="pe-desc">${desc}</p>
      `;
    } else {
      // Experience Cards
      const img = cells[0]?.querySelector('img')?.src || '';
      const itemTitle = cells[1]?.innerText || '';
      const itemDesc = cells[2]?.innerHTML || '';

      const item = document.createElement('div');
      item.className = 'pe-card';

      item.innerHTML = `
        <div class="pe-img"><img src="${img}" loading="lazy"></div>
        <div class="pe-text">
          <h3>${itemTitle}</h3>
          <p>${itemDesc}</p>
        </div>
      `;

      itemsContainer.appendChild(item);
    }
  });

  block.appendChild(sectionDiv);
  block.appendChild(itemsContainer);
}
