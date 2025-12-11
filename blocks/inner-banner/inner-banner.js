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

  let buttonLabel = "";
  let buttonLink = "";

  cells.forEach((cell, index) => {
    const rawName =
      cell.getAttribute("data-name") || cell.textContent.split(":")[0].trim();
    const fieldName = rawName.toLowerCase();

    const fieldDiv = document.createElement("div");
    fieldDiv.className = `field-${fieldName}`;

    let fieldValue = cell.innerHTML.replace(`${rawName}:`, "").trim();

    // ---------------- LABEL field: store label only ----------------
    if (fieldName === "label") {
      buttonLabel = fieldValue;
      fieldDiv.innerHTML = fieldValue;
    }
    // ---------------- LINK field: store URL only ----------------
    else if (fieldName === "link") {
      buttonLink = fieldValue;
      fieldDiv.innerHTML = fieldValue;
    }
    // ---------------- BUTTON field -> Create <a> ----------------
    else if (fieldName === "button") {
      const anchor = document.createElement("a");
      anchor.classList.add("btn", "btn-primary");

      anchor.href = buttonLink || "#";
      anchor.textContent = buttonLabel || "Click Here";

      fieldDiv.innerHTML = "";
      fieldDiv.appendChild(anchor);
    }
    // ---------------- Normal fields ----------------
    else {
      fieldDiv.innerHTML = fieldValue;
    }

    // -------------- Column placement logic ----------------
    if (index === 4) {
      separateWrapper.appendChild(fieldDiv);
      fieldDiv.classList.add("desktop-banner", "d-md-block", "d-none");
    } else if (index === 5) {
      fieldDiv.classList.add("mobile-banner", "d-md-none");
      separateWrapper.appendChild(fieldDiv);
    } else if (index < 3) {
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
