export default async function decorate(block) {
  const data = block.json || {};

  const { title, description, image, ctaText, ctaLink } = data;

  const wrapper = document.createElement('div');
  wrapper.classList.add('experience-banner-wrapper');

  wrapper.innerHTML = `
    <div class="experience-left">
      <h2 class="exp-title">${title || ""}</h2>
      <div class="exp-description">${description || ""}</div>
      ${ctaText ? `<a href="${ctaLink || '#'}" class="exp-button">${ctaText}</a>` : ""}
    </div>

    <div class="experience-right">
      ${image ? `<img src="${image}" alt="Experience Image">` : ""}
    </div>
  `;

  block.textContent = "";
  block.append(wrapper);
}
