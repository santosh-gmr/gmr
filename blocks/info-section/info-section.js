export default function decorate(block) {

  const data = block.json;

  block.innerHTML = `
    <div class="info-wrapper">
      <div class="info-left">
        <h2 class="info-title">${data.title || ""}</h2>
        <p class="info-subtitle">${data.subtitle || ""}</p>
      </div>

      <div class="info-right">
        <p class="info-description">${data.description || ""}</p>
      </div>
    </div>

    <div class="info-stats">
      ${Array.isArray(data.stats)
        ? data.stats.map(item => `
          <div class="stat-item">
            <h3 class="stat-number">${item.number}</h3>
            <p class="stat-label">${item.label}</p>
          </div>
        `).join("")
        : ""
      }
    </div>
  `;
}
