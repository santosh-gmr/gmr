export default function decorate(block) {
  block.classList.add('commitment-cards');

  const children = [...block.children];

  // Extract Section Title
  const titleWrapper = children.shift();
  const sectionTitle = titleWrapper?.querySelector('[data-aue-prop="sectionTitle"]');

  const header = document.createElement('div');
  header.className = 'commitment-header';
  if (sectionTitle) header.append(sectionTitle);

  // Prepare cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'commitment-cards-container';

  // Process each card (child block)
  children.forEach((card) => {
    card.classList.add('commitment-card');

    // Button enhancement
    const btnText = card.querySelector('[data-aue-prop="buttonText"]');
    const btnLink = card.querySelector('[data-aue-prop="buttonLink"]');

    if (btnText && btnLink) {
      const button = document.createElement('a');
      button.textContent = btnText.textContent.trim();
      button.href = btnLink.textContent.trim();
      button.className = 'commitment-btn';
      card.append(button);
    }

    cardsContainer.append(card);
  });

  // Rebuild block
  block.innerHTML = '';
  block.append(header, cardsContainer);
}
    