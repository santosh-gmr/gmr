export default function decorate(block) {
  const rows = [...block.children];
  const cells = rows.flatMap((row) => [...row.children]);

  const bannerWrapper = document.createElement("div");
  bannerWrapper.className = "inner-hero";

  const separateWrapper = document.createElement("div");
  separateWrapper.className = "inner-hero-img";

  const overlayWrapper = document.createElement("div");
  overlayWrapper.className = "inner-hero-overlay";

  const columnContainer = document.createElement("div");
  columnContainer.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const firstCol = document.createElement("div");
  firstCol.className = "col-md-6";

  const secondCol = document.createElement("div");
  secondCol.className = "col-md-6";

  cells.forEach((cell, index) => {
    const fieldName =
      cell.getAttribute("data-name") || cell.textContent.split(":")[0].trim();

    const fieldDiv = document.createElement("div");
    fieldDiv.className = `field-${fieldName}`;

    let fieldValue = cell.innerHTML.replace(`${fieldName}:`, "").trim();

    // ------------ BUTTON FIELD: one <a>, href + label only ---------------
    if (fieldName.toLowerCase() === "button") {
      const anchor = document.createElement("a");

      const existingLink = cell.querySelector("a");

      if (existingLink) {
        anchor.href = existingLink.href;
        anchor.textContent = existingLink.textContent.trim(); // label only
      } else {
        anchor.href = "#";
        anchor.textContent = fieldValue; // plain label text
      }

      anchor.classList.add("btn", "btn-primary");

      fieldDiv.innerHTML = "";
      fieldDiv.appendChild(anchor);
    } else {
      fieldDiv.innerHTML = fieldValue;
    }

    // -------------- Column placement logic ----------------
    if (index === 4) {
      separateWrapper.appendChild(fieldDiv);
    } else if (index < 4) {
      firstCol.appendChild(fieldDiv);
    } else {
      secondCol.appendChild(fieldDiv);
    }
  });

  row.appendChild(firstCol);
  row.appendChild(secondCol);

  overlayWrapper.appendChild(columnContainer);
  columnContainer.appendChild(row);
  bannerWrapper.appendChild(separateWrapper);
  bannerWrapper.appendChild(overlayWrapper);

  block.innerHTML = "";
  block.appendChild(bannerWrapper);
}
