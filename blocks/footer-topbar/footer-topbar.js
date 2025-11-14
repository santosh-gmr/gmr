export default function decorate(block) {
  const data = block.json || {};

  const {
    logo,
    social = [],
    buttonLabel = "Group Websites",
    buttonIcon = "+",
    buttonLink,

    buttonBgColor = "#fbb040",
    buttonTextColor = "#000000",
    buttonIconBgColor = "#000000",
    buttonIconColor = "#ffffff",

    backgroundColor = "#06356b",
    padding = "15px 40px",
    logoHeight = "40",
    gap = "20"
  } = data;

  block.innerHTML = `
    <div class="footer-topbar-container" 
         style="background:${backgroundColor}; padding:${padding};">
      
      <div class="footer-topbar-logo">
        ${logo ? `<img src="${logo}" alt="Logo" style="height:${logoHeight}px">` : ""}
      </div>

      <div class="footer-topbar-right" style="gap:${gap}px">

        <div class="footer-topbar-social">
          ${social
            .map(
              (s) => `
              <a href="${s.url}" 
                 class="social-icon"
                 target="_blank"
                 style="
                   background:${s.bgColor};
                   color:${s.iconColor};
                   width:${s.size}px;
                   height:${s.size}px;
                   font-size:${s.size - 4}px;
                 ">
                ${s.icon}
              </a>`
            )
            .join("")}
        </div>

        <button class="footer-topbar-btn"
                style="background:${buttonBgColor}; color:${buttonTextColor};">
          ${buttonLabel}
          <span class="footer-topbar-btn-icon"
                style="
                  background:${buttonIconBgColor};
                  color:${buttonIconColor};
                ">
            ${buttonIcon}
          </span>
        </button>

      </div>
    </div>
  `;

  // Button behavior: Navigate or toggle
  const btn = block.querySelector(".footer-topbar-btn");
  btn.addEventListener("click", () => {
    if (buttonLink) {
      window.location.href = buttonLink;
    } else {
      const columns = document.querySelector("footer-columns");
      columns?.classList.toggle("footer-columns-collapsed");
    }
  });
}
