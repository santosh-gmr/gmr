export default async function decorate(block) {
  const cfPath = block.dataset.cfpath;

  if (!cfPath) {
    block.innerHTML = "<p>No Content Fragment selected.</p>";
    return;
  }

  try {
    const response = await fetch(`${cfPath}.model.json`);
    if (!response.ok) throw new Error("Failed to fetch CF");

    const data = await response.json();

    // Create HTML using CF fields
    block.innerHTML = `
      <div class="cf-card">
        ${data.image? `<img src="${data.image._path}" alt="${data.title}">`: ""}
        <h2>${data.title || ""}</h2>
        <p>${data.description || ""}</p>
        ${data.ctaLink? `<a class="cta" href="${data.ctaLink}">${data.ctaText || "Learn more"}</a>` : ""}
      </div>
    `;
  } catch (error) {
    block.innerHTML = `<p>Error loading content.</p>`;
  }
}
