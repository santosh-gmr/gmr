export default function decorate(block) {
  // Each row inside the authored table = one footertopbar item
  const rows = [...block.children];

  // Create wrapper for all items
  const wrapper = document.createElement("div");
  wrapper.classList.add("footer-top", "bg-primary", "py-3");

  rows.forEach((row) => {
    const cells = [...row.children]; // each cell contains authored fields

    // Map fields to your model structure
    const image = cells[0]?.querySelector("img")?.src || "";
    const linkedin = cells[1]?.textContent?.trim() || "";
    const facebook = cells[2]?.textContent?.trim() || "";
    const youtube = cells[3]?.textContent?.trim() || "";
    const buttonLabel = cells[4]?.textContent?.trim() || "";
    const textHtml = cells[5]?.innerHTML || ""; // RTE supports HTML

    // Create item container
    const item = document.createElement("div");
    item.classList.add("container", "d-flex", "gap-2", "align-items-center");

    // Build inner HTML
    item.innerHTML = `
      <div class="footertopbar-image">
        ${image ? `<img src="${image}" alt="">` : ""}
      </div>

      <div class="ms-auto social-links d-flex gap-2">
        ${
          linkedin
            ? `<a href="${linkedin}"><img src="/icons/linkedin-icon.svg" alt="Linkedin" title="Linkedin" /></a>`
            : ""
        }
        ${
          facebook
            ? `<a href="${facebook}"><img src="/icons/facebook-icon.svg" alt="Facebook" title="Facebook" /></a>`
            : ""
        }
        ${
          youtube
            ? `<a href="${youtube}"><img src="/icons/youtube-icon.svg" alt="YouTube" title="YouTube" /></a>`
            : ""
        }
      </div>

      <div class="group-btn">
        ${
          buttonLabel
            ? `<button class="btn btn-primary">${buttonLabel}</button>`
            : ""
        }
      </div>

      <div class="footertopbar-text">
        ${textHtml}
      </div>
    `;

    wrapper.append(item);
  });

  // Clear original DOM and replace with structured block
  block.innerHTML = "";
  block.append(wrapper);
}
