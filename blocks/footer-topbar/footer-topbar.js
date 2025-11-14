export default function decorate(block) {
  const json = block.json || {};

  block.innerHTML = `
    <div class="footer-topbar-wrapper">
      <div class="footer-logo">
        <img src="${json.logo || ''}" alt="Logo">
      </div>

      <div class="footer-social-icons">
        ${json.social?.map(s =>
          `<a href="${s.url}" class="social-icon">${s.icon}</a>`
        ).join("") || ""}
      </div>

      <button class="group-websites-btn">${json.buttonLabel || "Group Websites"}</button>
    </div>
  `;

  // TOGGLE FOOTER-COLUMNS BLOCK
  const btn = block.querySelector(".group-websites-btn");

  btn?.addEventListener("click", () => {
    const columns = document.querySelector("footer-columns");
    columns?.classList.toggle("footer-columns-collapsed");
  });
}
