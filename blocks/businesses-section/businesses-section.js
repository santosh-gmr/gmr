export default function decorate(block) {
  const container = document.createElement("div");
  container.className = "business-accordion-wrapper";

  const children = [...block.children];

  // Build header
  const header = document.createElement("header");
  header.className = "business-accordion-header";

  // Extract <p> from the original child WITHOUT removing original DOM
  const getPContent = (el) => el.querySelector("p")?.innerHTML.trim() || "";

  const title = getPContent(children[0]);
  const subtitle = getPContent(children[1]);
  const intro = getPContent(children[2]);

  // Build H2
  const h2 = document.createElement("h2");
  h2.innerHTML = `<span>${title}</span><span>${subtitle}</span>`;
  header.appendChild(h2);

  // Intro P
  const introP = document.createElement("p");
  introP.innerHTML = intro;
  header.appendChild(introP);

  container.appendChild(header);

  // Append cloned remaining children 
  children.slice(3).forEach((child) => container.appendChild(child.cloneNode(true)));

  // Keep original children so AEM fields stay visible
  // Just hide them visually, not delete them
  block.style.display = "none";

  // Add new UI structure after original block
  block.insertAdjacentElement("afterend", container);
}
