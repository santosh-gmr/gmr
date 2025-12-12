export default function decorate(block) {
  // Only decorate on published/preview, NOT in authoring (Universal Editor)
  if (document.querySelector('html[data-aue-mode]')) {
    // We're in Universal Editor - do NOT decorate, keep original structure
    return;
  }

  // Create outer wrapper for published site
  const preview = document.createElement("div");
  preview.className = "innovation-cards";

  const rows = [...block.children];

  // Extract content from rows
  const titleText = rows[0]?.textContent?.trim() || "";
  const descHTML = rows[1]?.innerHTML || "";

  // Header for published site
  const headerHTML = `
    <h2 class="section-title">${titleText}</h2>
    <div class="section-description">
      ${descHTML}
    </div>
  `;

  preview.innerHTML = headerHTML + `<div class="innovation-card-grid"></div>`;

  const grid = preview.querySelector(".innovation-card-grid");

  // Build cards from remaining rows
  rows.slice(2).forEach(row => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const picture = cells[0]?.querySelector("picture")?.cloneNode(true)?.outerHTML || "";
    const title = cells[1]?.textContent?.trim() || "";
    const description = cells[2]?.innerHTML || "";
    const ctaText = cells[3]?.textContent?.trim() || "";

    const card = document.createElement("div");
    card.className = "innovation-card";

    card.innerHTML = `
      ${picture}
      <div class="innovation-card-content">
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="innovation-card-cta">${ctaText}</div>
      </div>
    `;

    grid.append(card);
  });

  // Replace block content with decorated version
  block.textContent = '';
  block.append(preview);
}