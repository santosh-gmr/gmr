export default function decorate(block) {
  const container = document.createElement("div");
  container.className = "business-accordion-wrapper";

  const children = [...block.children];

  // Build header
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  // Extract nested <p> text safely
  const getPContent = (el) => el.querySelector("p")?.innerHTML.trim() || "";

  const title = getPContent(children[0]);
  const subtitle = getPContent(children[1]);
  const intro = getPContent(children[2]);

  // Create H2 with two spans
  const h2 = document.createElement("h2");
  h2.innerHTML = `<span>${title}</span><span>${subtitle}</span>`;
  header.appendChild(h2);

  // Create intro paragraph
  const p = document.createElement("p");
  p.innerHTML = intro;
  header.appendChild(p);

  // Add header to container
  container.appendChild(header);

  // Append remaining children (if any)
  children.slice(3).forEach((child) => container.appendChild(child));

  block.innerHTML = "";
  block.appendChild(container);
}
