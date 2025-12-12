export default function decorate(block) {
  const rows = [...block.children];

  // Safely select the authored title/description nodes (they remain in author DOM)
  const titleNode = rows[0]?.querySelector("[data-aue-prop='sectionTitle']");
  const descNode = rows[1]?.querySelector("[data-aue-prop='sectionDescription']");

  // Create a preview wrapper (we will append clones into this; do NOT remove original nodes)
  const wrapper = document.createElement("div");
  wrapper.className = "innovation-cards-wrapper";

  // Build header (use clones so original nodes remain untouched)
  const header = document.createElement("div");
  header.className = "innovation-header";

  if (titleNode) {
    // cloneNode(true) => deep clone (keeps innerHTML/text) without touching original
    const clonedTitle = titleNode.cloneNode(true);
    // ensure the clonedTitle has the class we want for styling
    clonedTitle.classList.add("innovation-title");
    header.appendChild(clonedTitle);
  }

  if (descNode) {
    const clonedDesc = descNode.cloneNode(true);
    clonedDesc.classList.add("innovation-description");
    header.appendChild(clonedDesc);
  }

  // Card grid for preview
  const grid = document.createElement("div");
  grid.className = "innovation-card-grid";

  // iterate over item rows (slice(2) = card items)
  rows.slice(2).forEach((row) => {
    // find authored props inside the row (these remain in author DOM)
    const imageProp = row.querySelector("[data-aue-prop='image']");
    const titleProp = row.querySelector("[data-aue-prop='title']");
    const descProp = row.querySelector("[data-aue-prop='description']");
    const ctaProp = row.querySelector("[data-aue-prop='ctaText']");

    // if nothing authored in this row, skip
    if (!imageProp && !titleProp && !descProp && !ctaProp) return;

    // Use clones to build the preview card so original nodes remain intact
    const clonedPicture = imageProp?.closest("picture")?.cloneNode(true) || null;
    const clonedTitle = titleProp?.cloneNode(true) || null;
    const clonedDesc = descProp?.cloneNode(true) || null;
    const clonedCta = ctaProp?.cloneNode(true) || null;

    // If all clones empty, skip
    if (!clonedPicture && !clonedTitle && !clonedDesc && !clonedCta) return;

    const card = document.createElement("div");
    card.className = "innovation-card";

    // Build card HTML using clones (if clones exist, convert to outerHTML; else use empty string)
    const pictureHTML = clonedPicture ? clonedPicture.outerHTML : "";
    const titleText = clonedTitle ? clonedTitle.innerText : "";
    const descHTML = clonedDesc ? clonedDesc.innerHTML : "";
    const ctaText = clonedCta ? clonedCta.innerText : "";

    card.innerHTML = `
      <div class="innovation-card-image">${pictureHTML}</div>
      <div class="innovation-card-overlay">
        <h3>${titleText}</h3>
        <p>${descHTML}</p>
        <a class="innovation-cta">${ctaText} <span class="arrow">›</span></a>
      </div>
    `;

    grid.appendChild(card);
  });

  // assemble wrapper
  wrapper.appendChild(header);
  wrapper.appendChild(grid);

  // IMPORTANT: insert preview wrapper into the block WITHOUT deleting the authored DOM.
  // Using insertBefore ensures original children remain (editor keeps its bindings).
  block.insertBefore(wrapper, block.firstChild);
}
