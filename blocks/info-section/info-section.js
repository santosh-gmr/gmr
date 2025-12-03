export default function decorate(block) {
  const title = block.querySelector('h1, h2');
  const desc = block.querySelector('p');

  // Detect stats (if any)
  const statsList = block.querySelectorAll('ul li');

  const hasStats = statsList.length > 0;

  let statsHTML = '';

  if (hasStats) {
    statsHTML = `
      <div class="is-stats">
        ${Array.from(statsList).map((item) => `
          <div class="is-stat">
            <div class="is-number">${item.querySelector('strong')?.innerText || ''}</div>
            <div class="is-label">${item.querySelector('em')?.innerText || ''}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  block.innerHTML = `
    <div class="is-wrapper ${hasStats ? 'with-stats' : 'no-stats'}">
       <div class="is-left">${title?.outerHTML || ''}</div>
       <div class="is-right">${desc?.outerHTML || ''}</div>
    </div>
    ${statsHTML}
  `;
}
