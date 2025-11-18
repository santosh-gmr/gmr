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

  // Get each original row inside container
  const rows = [...container.children];

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) return;

    console.log(cells[3]);
  });
}
