/**
 * Hero Banner Carousel (Franklin / AEM)
 * Fully rewritten – no index dependency – reads fields by label
 */

export default function decorate(block) {
  if (block.querySelector('.hero-carousel-wrapper')) return;
  if (block.querySelector('.aem-block-placeholder')) return;

  const slides = [...block.children].filter(slide => {
    return slide.innerText.trim().length > 0 || slide.querySelector("img");
  });

  if (slides.length === 0) return;

  const carouselWrapper = document.createElement("div");
  carouselWrapper.className = "hero-carousel-wrapper";

  const track = document.createElement("div");
  track.className = "hero-carousel-track";

  slides.forEach((slide, index) => {
    slide.className = "hero-slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);

    const fields = extractFields(slide);
    renderSlide(slide, fields);
    track.appendChild(slide);
  });

  carouselWrapper.appendChild(track);
  block.innerHTML = "";
  block.appendChild(carouselWrapper);

  addCarouselControls(carouselWrapper, slides.length);
}

/* ---------------------------------------------
   Extract AEM/Franklin Formatted Fields by Label
---------------------------------------------- */
function extractFields(slide) {
  const fieldValues = {};

  [...slide.querySelectorAll(":scope > div")].forEach(div => {
    const strong = div.querySelector("strong");
    const label = strong?.textContent?.trim();

    if (!label) return;

    const rawText = div.innerText.replace(label, "").trim();
    const link = div.querySelector("a")?.href || "";
    const img = div.querySelector("img")?.src || "";

    switch (label) {
      case "Title":
        fieldValues.title = rawText;
        break;

      case "Description":
        fieldValues.description = div.innerHTML.replace(label, "").trim();
        break;

      case "Background Image":
        fieldValues.backgroundImage = img;
        break;

      case "Background Video (MP4)":
        fieldValues.backgroundVideo = img;
        break;

      case "Know More Label":
        fieldValues.knowMoreLabel = rawText;
        break;

      case "Know More Link URL":
        fieldValues.knowMoreLink = link;
        break;

      case "Watch Video Label":
        fieldValues.watchVideoLabel = rawText;
        break;

      case "Watch Video Link URL":
        fieldValues.watchVideoLink = link;
        break;
    }
  });

  return {
    title: fieldValues.title || "",
    description: fieldValues.description || "",
    backgroundImage: fieldValues.backgroundImage || "",
    backgroundVideo: fieldValues.backgroundVideo || "",
    knowMoreLabel: fieldValues.knowMoreLabel || "",
    knowMoreLink: fieldValues.knowMoreLink || "",
    watchVideoLabel: fieldValues.watchVideoLabel || "",
    watchVideoLink: fieldValues.watchVideoLink || ""
  };
}

/* ---------------------------------------------
   Render Single Slide
---------------------------------------------- */
function renderSlide(slide, f) {
  // Background image
  if (f.backgroundImage) {
    slide.style.backgroundImage = `url('${f.backgroundImage}')`;
  }

  // Slide content
  slide.innerHTML = `
    <div class="hero-slide-content">
      ${f.title ? `<h1 class="hero-title">${f.title}</h1>` : ""}
      ${f.description ? `<div class="hero-description">${f.description}</div>` : ""}

      <div class="hero-cta-group">
        ${f.knowMoreLink
    ? `<a href="${f.knowMoreLink}" class="hero-btn primary">${f.knowMoreLabel || "Know More"}</a>`
    : ""
  }

        ${f.watchVideoLink
    ? `<a href="${f.watchVideoLink}" class="hero-btn secondary">${f.watchVideoLabel || "Watch Video"}</a>`
    : ""
  }
      </div>
    </div>
  `;
}

/* ---------------------------------------------
   Carousel Controls
---------------------------------------------- */
function addCarouselControls(wrapper, slideCount) {
  const controls = document.createElement("div");
  controls.className = "hero-controls";

  controls.innerHTML = `
    <button class="hero-prev" aria-label="Previous slide">❮</button>
    <div class="hero-pagination">1 / ${slideCount}</div>
    <button class="hero-next" aria-label="Next slide">❯</button>
  `;

  wrapper.appendChild(controls);

  let currentIndex = 0;
  const track = wrapper.querySelector(".hero-carousel-track");

  function updateSlide() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    wrapper.querySelector(".hero-pagination").textContent =
      `${currentIndex + 1} / ${slideCount}`;
  }

  controls.querySelector(".hero-prev").addEventListener("click", () => {
    if (currentIndex > 0) currentIndex--;
    updateSlide();
  });

  controls.querySelector(".hero-next").addEventListener("click", () => {
    if (currentIndex < slideCount - 1) currentIndex++;
    updateSlide();
  });
}
