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

     const titleDiv = cells[0];
     const contentDiv = cells[1];

  //   // Read heading for classname
     const value = contentDiv.textContent.trim();
  //   //const value = titleDiv.textContent.trim();

  //   // Build YOUR custom structure
    const col = document.createElement("div");
    if(value!='' && value!='undefined')
    {
      const safeClass = value.toLowerCase().replace(/\s+/g, "-");
      col.classList.add("col", "w-20", safeClass);
    }else {
      col.classList.add("col", "w-20");
    }

    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("footer-nav");

    // const contentWrapper = document.createElement("div");
    // contentWrapper.classList.add("footer-text");

  //   // Move editable nodes (UE keeps edit capability)
     titleWrapper.append(...titleDiv.childNodes);
     //contentWrapper.append(...contentDiv.childNodes);

  //   // Final structure
  //   //col.append(titleWrapper, contentWrapper);
       col.append(titleWrapper);

  //   // Replace original table row with new column markup
     row.replaceWith(col);
     //row.append(col);
   });
}


