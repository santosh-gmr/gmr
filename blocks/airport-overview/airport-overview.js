export default function decorate(block) {
  const title = block.dataset.title || "";
  const description = block.dataset.description || "";

  let stats = [];
  try {
    stats = JSON.parse(block.dataset.stats || "[]");
  } catch (e) {
    console.error("Stats parsing error:", e);
  }

  block.innerHTML = `
    <div class="airport-overview-wrapper">
      <div class="airport-left">
        <h1>${title}</h1>
        <div class="description">${description}</div>
      </div>

      <div class="airport-stats">
        ${stats
          .map(
            (s) => `
          <div class="stat-item">
            <h2>${s.value}</h2>
            <p>${s.label}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}
