export default function decorate(block) {
  const rows = [...block.children];

  const sectionTitle = rows[0]?.children[0]?.innerText || "";

  block.innerHTML = `
    <h2 class="purpose-driven-team-title" data-aue-prop="sectionTitle">${sectionTitle}</h2>
    <div class="purpose-team-wrapper"></div>
  `;

  const wrapper = block.querySelector('.purpose-team-wrapper');

  const leftContainer = document.createElement('div');
  leftContainer.className = 'team-left-images';

  const centerPanel = document.createElement('div');
  centerPanel.className = 'team-center-panel';

  const rightContainer = document.createElement('div');
  rightContainer.className = 'team-right-image';

  const ctaBtn = document.createElement('div');
  ctaBtn.className = 'team-cta-btn';
  ctaBtn.innerText = rows[0]?.children[1]?.innerText;
  ctaBtn.setAttribute("data-aue-prop", "ctaText");

  rows.slice(1).forEach((row, index) => {
    const [imageCol, descCol] = row.children;

    if (index === 0 || index === 1) {
      // LEFT TWO IMAGES
      const img = document.createElement('picture');
      img.innerHTML = imageCol.innerHTML;
      leftContainer.append(img);

    } else if (index === 2) {
      // RIGHT IMAGE
      rightContainer.innerHTML = `<picture>${imageCol.innerHTML}</picture>`;
    }

    if (index === 1) {
      centerPanel.innerHTML = descCol.innerHTML;
    }
  });

  wrapper.append(leftContainer);
  wrapper.append(centerPanel);
  wrapper.append(rightContainer);
  wrapper.append(ctaBtn);
}
