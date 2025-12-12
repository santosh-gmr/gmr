export default function decorate(block) {
  const rows = [...block.children];

  const title = rows[0]?.querySelector("[data-aue-prop='sectionTitle']");
  const desc = rows[1]?.querySelector("[data-aue-prop='sectionDescription']");

  const wrapper = document.createElement("div");
  wrapper.className = "innovation-cards-wrapper";

  // HEADER
  const header = document.createElement("div");
  header.className = "innovation-header";

  if (title) {
    const t = title.cloneNode(true);
    t.classList.add("innovation-title");
    header.append(t);
  }

  if (desc) {
    const d = desc.cloneNode(true);
    d.classList.add("innovation-description");
    header.append(d);
  }

  // GRID
  const grid = document.createElement("div");
  grid.className = "innovation-card-grid";

  rows.slice(2).forEach((row) => {
    const img = row.querySelector("[data-aue-prop='image']");
    const ttl = row.querySelector("[data-aue-prop='title']");
    const des = row.querySelector("[data-aue-prop='description']");
    const cta = row.querySelector("[data-aue-prop='ctaText']");

    if (!img && !ttl && !des && !cta) return;

    const card = document.createElement("div");
    card.className = "innovation-card";

    const pic = img?.closest("picture")?.cloneNode(true)?.outerHTML || "";

    card.innerHTML = `
      <div class="innovation-card-image">${pic}</div>
      <div class="innovation-card-overlay">
        <h3>${ttl?.innerText || ""}</h3>
        <p>${des?.innerHTML || ""}</p>
        <a class="innovation-cta">${cta?.innerText || ""} ›</a>
      </div>
    `;

    grid.append(card);
  });

  wrapper.append(header);
  wrapper.append(grid);

  // 🚨 THE MAGIC FIX 🚨
  // Completely replace block with wrapper → without touching internal authored nodes
  block.replaceWith(wrapper);
}
