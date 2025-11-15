/**
 * footer-links block renderer for AEM EDS
 * Applies CSS class to 2nd <div> inside the block
 */

export default async function decorate(block) {

  console.log("footer-links: decorate() invoked", block);

  // 1️⃣ Load model data if UE has provided it
  const modelData = block.dataset?.model
    ? JSON.parse(block.dataset.model)
    : null;

  // fallback JSON load (optional)
  let jsonData = modelData;
  if (!jsonData) {
    try {
      const lang = document.documentElement.lang || "en";
      const resp = await fetch(`/blocks/footer-links/footer-links.${lang}.json`);
      if (resp.ok) jsonData = await resp.json();
    } catch {
      console.warn("footer-links: no JSON data found, continuing without it");
    }
  }

  // 2️⃣ Access DIV children
  const children = Array.from(block.querySelectorAll(":scope > div"));

  if (children.length < 2) {
    console.warn("footer-links: block does not contain 2 child divs");
    return;
  }

  const secondDiv = children[1]; // ⭐ this is the one we modify

  // 3️⃣ Apply CSS class from JSON/model
  if (jsonData && jsonData.className) {
    console.log("Applying CSS class:", jsonData.className);
    secondDiv.classList.add(...jsonData.className.split(/\s+/));
  }

  // 4️⃣ If you want to test it without JSON, use default
  else {
    console.log("Applying default class: footer-second-div");
    secondDiv.classList.add("footer-second-div");
  }

  // 5️⃣ OPTIONAL: render footer content
  if (jsonData && jsonData.items) {
    secondDiv.innerHTML = ""; // empty first

    jsonData.items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "footer-link-item";

      // rich text
      if (item.text) {
        const rt = document.createElement("div");
        rt.className = "footer-link-text";
        rt.innerHTML = item.text;
        div.appendChild(rt);
      }

      // per-item CSS class
      if (item.className) {
        div.classList.add(...item.className.split(/\s+/));
      }

      secondDiv.appendChild(div);
    });
  }
}

