export default function decorate(block) {
  const data = block.json || {};

  const logo = data.logo || "";
  const social = data.social || [];
  const buttonLabel = data.buttonLabel || "Group Websites";
  const buttonIcon = data.buttonIcon || "+";

  block.innerHTML = `
    <div class="footer-topbar">
      
      <div class="footer-topbar-left">
        ${logo ? `<img src="${logo}" alt="logo" class="footer-logo">` : ""}
      </div>

      <div class="footer-topbar-right">

        <div class="footer-social-icons">
          ${social
            .map(
              (s) => `
              <a href="${s.url}" class="footer-social-icon" target="_blank">
                <span>${s.icon}</span>
              </a>`
            )
            .join("")}
        </div>

        <button class="footer-topbar-btn">
          ${buttonLabel}
          <span class="footer-topbar-btn-icon">${buttonIcon}</span>
        </button>

      </div>
    </div>
  `;
}
