export default function decorate(block) {
  const data = block.json || {};

  const logo = data.logo || "";
  const social = data.social || [];
  const button = data.button || "Group Websites";
  const text = data.text || "";

  block.innerHTML = `
    <div class="footer-topbar">

      <div class="footer-topbar-left">
        ${logo ? `<img src="${logo}" alt="logo" class="footer-logo">` : ""}
      </div>

      <div class="footer-topbar-right">

        <div class="footer-social-icons">
          ${social.map(item => `
            <a href="${item.url}" target="_blank" class="footer-social-link">
              <img src="${item.icon}" class="footer-social-icon" />
            </a>
          `).join("")}
        </div>

        <button class="footer-topbar-btn">
          ${button}
          <span class="footer-btn-icon">+</span>
        </button>

      </div>
    </div>
  `;
}
