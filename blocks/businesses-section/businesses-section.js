export default function decorate(block) {
  // Wrapper container
  const container = document.createElement("div");
  container.className = "business-accordion-wrapper";

  // Collect children
  const children = [...block.children];

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  const h2 = document.createElement("h2");
  const intro = document.createElement("div");
  intro.className = "intro-text";

  // Process children
  children.forEach((child, index) => {
    if (index === 0) {
      // First item → Title
      const title = child.textContent.trim();
      h2.innerHTML = `<span class="title">${title}</span>`;
    }
    else if (index === 1) {
      // Second item → Subtitle
      const subtitle = child.textContent.trim();
      h2.innerHTML += ` <span class="subtitle">${subtitle}</span>`;
    }
    else if (index === 2) {
      // Third item → Intro Text
      intro.innerHTML = child.innerHTML;
    }
  });

  // Add header elements
  header.appendChild(h2);
  header.appendChild(intro);

  // Append header to container
  container.appendChild(header);

  // Append remaining children (from index 3 onward)
  children.forEach((child, index) => {
    if (index > 2) container.appendChild(child);
  });

  // Replace block content
  block.innerHTML = "";
  block.appendChild(container);
}
