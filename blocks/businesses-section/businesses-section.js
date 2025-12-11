export default function decorate(block) {
  // Create container wrapper
  const container = document.createElement("div");
  container.className = "container";
 
  // Collect all children
  const children = [...block.children];
 
  children.forEach((child, index) => {
    if (index === 0) {
      // Convert first item to H2
      const h2 = document.createElement("h2");
      h2.innerHTML = child.innerHTML;
      container.appendChild(h2);
    } else {
      container.appendChild(child);
    }
  });
 
  // Clear original block content and append container
  block.innerHTML = "";
  block.appendChild(container);
}