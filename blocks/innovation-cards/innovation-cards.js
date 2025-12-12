// export default function decorate(block) {
//   const rows = [...block.children];

//   const title = rows[0]?.querySelector("[data-aue-prop='sectionTitle']");
//   const desc = rows[1]?.querySelector("[data-aue-prop='sectionDescription']");

//   // Create new wrapper WITHOUT deleting original author DOM
//   const header = document.createElement("div");
//   header.className = "innovation-header";

//   if (title) header.append(title.cloneNode(true));
//   if (desc) header.append(desc.cloneNode(true));

//   const grid = document.createElement("div");
//   grid.className = "innovation-card-grid";

//   // Now build cards
//   rows.slice(2).forEach((row) => {
//     const image = row.querySelector("[data-aue-prop='image']");
//     const t = row.querySelector("[data-aue-prop='title']");
//     const d = row.querySelector("[data-aue-prop='description']");
//     const cta = row.querySelector("[data-aue-prop='ctaText']");

//     if (!image && !t && !d && !cta) return; // skip empty rows

//     const card = document.createElement("div");
//     card.className = "innovation-card";

//     card.innerHTML = `
//       <div class="innovation-card-image">${image?.closest("picture")?.outerHTML || ""}</div>
//       <div class="innovation-card-overlay">
//         <h3>${t?.innerText || ""}</h3>
//         <p>${d?.innerHTML || ""}</p>
//         <a class="innovation-cta">${cta?.innerText || ""} ›</a>
//       </div>
//     `;

//     grid.append(card);
//   });

//   // Final output wrapper
//   const wrapper = document.createElement("div");
//   wrapper.className = "innovation-cards-wrapper";
//   wrapper.append(header);
//   wrapper.append(grid);

//   // Replace only visible HTML, NOT authoring DOM
//   block.replaceChildren(wrapper);
// }
