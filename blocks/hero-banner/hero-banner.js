export default function decorate(block) {
  const rows = [...block.children];
  const cells = rows.flatMap((row) => [...row.children]);

  const bannerWrapper = document.createElement("div");
  bannerWrapper.className = "inner-banner";

  // Overlay wrapper
  const overlayWrapper = document.createElement("div");
  overlayWrapper.className = "inner-banner-overlay";

  // Container + row layout
  const columnContainer = document.createElement("div");
  columnContainer.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const firstCol = document.createElement("div");
  firstCol.className = "col-md-6";

  const secondCol = document.createElement("div");
  secondCol.className = "col-md-6";

  // Variable to hold optional image wrapper
  let separateWrapper = null;

  cells.forEach((cell, index) => {
    const fieldName =
      cell.getAttribute("data-name") || cell.textContent.split(":")[0].trim();

    const fieldContent = cell.innerHTML.replace(`${fieldName}:`, "").trim();

    // Create button as anchor tag
    if (fieldName.toLowerCase() === "button") {
      const buttonWrapper = document.createElement("div");
      buttonWrapper.className = "banner-button";

      const anchor = document.createElement("a");
      const existingLink = cell.querySelector("a");

      anchor.href = existingLink ? existingLink.href : "#";
      anchor.textContent = existingLink
        ? existingLink.textContent
        : fieldContent;
      anchor.classList.add("btn", "btn-primary");

      buttonWrapper.appendChild(anchor);

      // Button goes inside LEFT column
      firstCol.appendChild(buttonWrapper);
      return;
    }

    // Normal field container
    const fieldDiv = document.createElement("div");
    fieldDiv.className = `field-${fieldName}`;
    fieldDiv.innerHTML = fieldContent;

    // 3rd field logic → ONLY create wrapper if content exists
    if (index === 2) {
      if (fieldContent && fieldContent.trim() !== "") {
        separateWrapper = document.createElement("div");
        separateWrapper.className = "inner-banner-img";
        separateWrapper.appendChild(fieldDiv);
      }
    } else if (index < 2) {
      firstCol.appendChild(fieldDiv);
    } else {
      secondCol.appendChild(fieldDiv);
    }
  });

  // Append layout
  row.appendChild(firstCol);
  row.appendChild(secondCol);
  columnContainer.appendChild(row);
  overlayWrapper.appendChild(columnContainer);

  // Only append image wrapper if exists
  if (separateWrapper) {
    bannerWrapper.appendChild(separateWrapper);
  }

  bannerWrapper.appendChild(overlayWrapper);

  // Replace block content
  block.innerHTML = "";
  block.appendChild(bannerWrapper);
}
