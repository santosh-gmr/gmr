export default function decorate(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "business-accordion-wrapper";

  const children = [...block.children];

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  // H2 + span (from first two divs)
  const h2 = document.createElement("h2");
  const title = children[0]?.textContent?.trim() || "";
  const subtitle = children[1]?.textContent?.trim() || "";
  h2.innerHTML = `<span class="title">${title}</span> <span class="subtitle"> ${subtitle}</span>`;
  header.appendChild(h2);

  // Intro text wrapper (from third div)
  const intro = document.createElement("div");
  intro.className = "intro-text";
  const introText = children[2]?.innerHTML || "";
  if (introText) intro.innerHTML = introText;
  header.appendChild(intro);

  wrapper.appendChild(header);

  // Replace original block with just the header
  block.innerHTML = "";
  block.appendChild(wrapper);
}