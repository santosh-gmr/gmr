export default function decorate(block) {
  const rows = [...block.children];

  const sectionTitle = rows[0]?.children[0]?.innerText || "";
  const sectionDescription = rows[1]?.children[0]?.innerHTML || "";

  block.innerHTML = `
    <h2 class="section-title" data-aue-prop="sectionTitle">${sectionTitle}</h2>
    <div class="section-description" data-aue-prop="sectionDescription">${sectionDescription}</div>
    <div class="innovation-card-grid"></div>
  `;

  const grid = block.querySelector(".innovation-card-grid");

  rows.slice(2).forEach((row) => {
    
    const cols = [...row.children];

    // Skip rows that have no authored values
    if (cols.every(col => !col.innerText.trim() && !col.innerHTML.trim())) return;


    const [imageCol, titleCol, descCol, ctaCol] = row.children;

    const card = document.createElement("div");
    card.className = "innovation-card";

    card.innerHTML = `
      <picture>${imageCol.innerHTML}</picture>
      <div class="innovation-card-content">
        <h3>${titleCol.innerText}</h3>
        <p>${descCol.innerHTML}</p>
        <div class="innovation-card-cta">${ctaCol.innerText}</div>
      </div>
    `;

    grid.append(card);
  });
}
