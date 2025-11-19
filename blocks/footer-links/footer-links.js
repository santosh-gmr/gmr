export default function decorate(block) {
  // CREATE a container before adding the row structure
  const container = document.createElement("div");
  container.classList.add("row");

  // Move the current block children into container
  // (They remain editable for Universal Editor)
  while (block.firstChild) {
    container.appendChild(block.firstChild);
  }

  // Add container inside block
  block.appendChild(container);

  // Now add row class to block
  block.classList.add("container");

  // Get each original row inside container (snapshot)
  const rows = [...container.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const titleDiv = cells[0];
    const contentDiv = cells[1];
    const value = contentDiv.textContent.trim();

    // Prepare class name
    const safeClass = value && value !== "undefined"
      ? value.toLowerCase().replace(/\s+/g, "-")
      : "";

    // --- IMPORTANT: reuse the existing row element instead of creating a new one ---
    // Clear existing children after we move the editable child nodes (so UE bindings on row remain).
    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("footer-nav");

    // Move editable nodes (this preserves the actual editable nodes, not clones)
    titleWrapper.append(...titleDiv.childNodes);

    // Remove old children from row but keep the row itself (so UE keeps references)
    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }

    // Reset or set classes on the same row element (preserves element identity)
    row.className = "";            // if you want to remove previous classes; otherwise just add new ones
    row.classList.add("col", "w-20");
    if (safeClass) row.classList.add(safeClass);

    // Append the new wrapper(s)
    row.appendChild(titleWrapper);
  });
}
