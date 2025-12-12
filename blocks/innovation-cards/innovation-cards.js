export default function decorate(block) {
  // Create outer wrapper for preview (NOT inserted inside block)
  const preview = document.createElement("div");
  preview.className = "innovation-cards";

  const rows = [...block.children];

  // Extract authored props (DO NOT MODIFY these)
  const titleNode = rows[0]?.querySelector("[data-aue-prop='sectionTitle']");
  const descNode = rows[1]?.querySelector("[data-aue-prop='sectionDescription']");

  // Header for preview
  const headerHTML = `
    <h2 class="section-title">${titleNode?.innerText || ""}</h2>
    <div class="section-description">
      ${descNode?.innerHTML || ""}
    </div>
  `;

  preview.innerHTML = headerHTML + `<div class="innovation-card-grid"></div>`;

  const grid = preview.querySelector(".innovation-card-grid");

  // Build cards safely using cloned values
  rows.slice(2).forEach(row => {
    const img = row.querySelector("[data-aue-prop='image']");
    const ttl = row.querySelector("[data-aue-prop='title']");
    const des = row.querySelector("[data-aue-prop='description']");
    const cta = row.querySelector("[data-aue-prop='ctaText']");

    if (!img && !ttl && !des && !cta) return;

    const picture = img?.closest("picture")?.cloneNode(true)?.outerHTML || "";

    const card = document.createElement("div");
    card.className = "innovation-card";

    card.innerHTML = `
      ${picture}
      <div class="innovation-card-content">
        <h3>${ttl?.innerText || ""}</h3>
        <p>${des?.innerHTML || ""}</p>
        <div class="innovation-card-cta">${cta?.innerText || ""}</div>
      </div>
    `;

    grid.append(card);
  });

  // Insert PREVIEW *after* the block — never touching authored DOM
  block.after(preview);
}
