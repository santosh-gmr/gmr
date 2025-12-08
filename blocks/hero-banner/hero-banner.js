/**
 * Hero Banner Carousel - Universal Editor Compatible (Auto-detecting version)
 * @param {HTMLElement} block
 */
export default function decorate(block) {

  // Prevent duplicate initialization
  if (block.querySelector('.hero-carousel-wrapper')) return;

  // Do not run in authoring placeholder mode
  if (block.querySelector('.aem-block-placeholder')) return;

  // Helper: find field by data-name (best way)
  function getField(slide, name) {
    return slide.querySelector(`[data-name="${name}"]`);
  }

  // Helper: fallback text extractor
  function extractText(element) {
    return element?.textContent?.trim() || "";
  }

  // Helper: extract link inside any structure
  function extractLink(element) {
    return element?.querySelector("a")?.href || "#";
  }

  // --- Extract slides & ignore empty ones ---
  let rawSlides = [...block.children].filter(slide => {
    const text = slide.innerText.trim();
    const hasImg = slide.querySelector("img");
    return text.length > 0 || hasImg;
  });

  if (rawSlides.length === 0) return;

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "hero-carousel-wrapper";

  const track = document.createElement("div");
  track.className = "hero-carousel-track";

  rawSlides.forEach((slide, index) => {

    // --- AUTO-DETECT ALL FIELDS ---

    // Title
    let titleEl =
      getField(slide, "title") ||
      slide.querySelector(".title, h2, h3, div:nth-child(1)");
    let title = extractText(titleEl);

    // Description
    let descEl =
      getField(slide, "description") ||
      slide.querySelector(".description, p, div:nth-child(2)");
    let description = extractText(descEl);

    // Background Image
    let imgEl =
      getField(slide, "background-image")?.querySelector("img") ||
      slide.querySelector("img, picture img");
    let bgImg = imgEl?.src || "";

    // Know More Label
    let knowLabelEl =
      getField(slide, "know-more-label") ||
      slide.querySelector('[data-field="know-more-label"]') ||
      slide.querySelector("div, span, p:nth-child(4)");
    let knowLabel = extractText(knowLabelEl) || "Know More";

    // Know More Link
    let knowLinkEl =
      getField(slide, "know-more-link") ||
      slide.querySelector('[data-field="know-more-link"]') ||
      slide.querySelector("a:nth-of-type(1)");
    let knowLink = extractLink(knowLinkEl);

    // Watch Video Label
    let watchLabelEl =
      getField(slide, "watch-video-label") ||
      slide.querySelector('[data-field="watch-video-label"]') ||
      slide.querySelector("div, span, p:nth-child(6)");
    let watchLabel = extractText(watchLabelEl) || "Watch Video";

    // Watch Video Link
    let watchLinkEl =
      getField(slide, "watch-video-link") ||
      slide.querySelector('[data-field="watch-video-link"]') ||
      slide.querySelector("a:nth-of-type(2)");
    let watchLink = extractLink(watchLinkEl);

    // --- Render slide ---
    slide.className = "hero-slide";
    slide.style.backgroundImage = `url('${bgImg}')`;

    slide.innerHTML = `
      <div class="hero-slide-content">
        <h2 class="hero-title">${title}</h2>
        <p class="hero-description">${description}</p>
        <div class="hero-cta-group">
          <a href="${knowLink}" class="hero-btn primary">${knowLabel}</a>
          <a href="${watchLink}" class="hero-btn secondary">${watchLabel}</a>
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  wrapper.appendChild(track);

  // Controls
  const controls = document.createElement("div");
  controls.className = "hero-controls";

  controls.innerHTML = `
    <button class="hero-prev">←</button>
    <div class="hero-pagination">01 / ${String(rawSlides.length).padStart(2, "0")}</div>
    <button class="hero-next">→</button>
  `;

  wrapper.appendChild(controls);

  // Replace original block contents
  block.innerHTML = "";
  block.appendChild(wrapper);

  // Carousel logic
  let current = 0;
  const total = rawSlides.length;

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    controls.querySelector(".hero-pagination").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }

  controls.querySelector(".hero-prev").onclick = () => {
    current = current === 0 ? total - 1 : current - 1;
    update();
  };

  controls.querySelector(".hero-next").onclick = () => {
    current = current === total - 1 ? 0 : current + 1;
    update();
  };

  update();
}
