export default function decorate(block) {
  const data = block.json;

  block.classList.add('listed-companies');

  // Header Section
  const header = document.createElement('div');
  header.className = 'lc-header';

  const title = document.createElement('h2');
  title.textContent = data.sectionTitle;

  const desc = document.createElement('p');
  desc.textContent = data.sectionDescription;

  const cta = document.createElement('a');
  cta.className = 'lc-cta';
  cta.textContent = data.ctaText;
  cta.href = data.ctaLink;

  header.append(title, desc, cta);

  // Card Container
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'lc-cards';

  data.cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'lc-card';

    const info = document.createElement('div');
    info.className = 'lc-info';

    const company = document.createElement('h3');
    company.textContent = `${card.companyName} - Market Overview`;

    const date = document.createElement('span');
    date.textContent = `As on ${card.dateTime}`;

    // Price Rows
    const nse = document.createElement('div');
    nse.className = 'lc-row';

    const nseArrow = card.nseUpDown === 'up' ? '↑' : '↓';
    const nseColor = card.nseUpDown === 'up' ? 'green' : 'red';

    nse.innerHTML = `
      <strong>NSE</strong>
      <span class="lc-price">${card.nsePrice}</span>
      <span class="lc-change" style="color:${nseColor};">${nseArrow} ${card.nseChange}</span>
    `;

    const bse = document.createElement('div');
    bse.className = 'lc-row';

    const bseArrow = card.bseUpDown === 'up' ? '↑' : '↓';
    const bseColor = card.bseUpDown === 'up' ? 'green' : 'red';

    bse.innerHTML = `
      <strong>BSE</strong>
      <span class="lc-price">${card.bsePrice}</span>
      <span class="lc-change" style="color:${bseColor};">${bseArrow} ${card.bseChange}</span>
    `;

    const vol = document.createElement('p');
    vol.className = 'lc-volume';
    vol.textContent = `Volume ${card.volume}`;

    info.append(company, date, nse, bse, vol);

    // Image
    const image = document.createElement('img');
    image.src = card.image;
    image.className = 'lc-image';

    item.append(info, image);
    cardsWrapper.appendChild(item);
  });

  block.append(header, cardsWrapper);
}
