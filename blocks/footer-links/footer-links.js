/**
 * footer-links block with:
 * - read value from 2nd div's 1st child div
 * - append that value as classname to secondDiv
 * - hide the 2nd child div of secondDiv
 */

export default function decorate(block) {
  console.log("footer-links: decorate() running");

  // 1️⃣ Get root children
  const rootChildren = Array.from(block.querySelectorAll(":scope > div"));

  // if (rootChildren.length < 2) {
  //   console.warn("footer-links: need at least 2 child divs under block");
  //   return;
  // }

  const secondDiv = rootChildren[0]; // ⭐ second <div> under "footer-links block"

  // 2️⃣ Get inner divs inside secondDiv
  const innerDivs = Array.from(secondDiv.querySelectorAll(":scope > div"));

  if (innerDivs.length < 2) {
    console.warn("footer-links: secondDiv has less than 2 child divs");
    return;
  }

  const valueDiv = innerDivs[0];   // ⭐ first inner div
  const hideDiv = innerDivs[1];    // ⭐ second inner div (to hide)

  // 3️⃣ Get text/value from first inner div
  const value = valueDiv.textContent.trim();
  console.log("Value extracted:", value);

  // 4️⃣ Add that value as classname to secondDiv
  // convert spaces → hyphen for valid class
  const safeClass = value.toLowerCase().replace(/\s+/g, "-");
  secondDiv.classList.add(safeClass);

  console.log("Added class:", safeClass);

  // 5️⃣ Hide the second inner div
  hideDiv.style.display = "none";

  console.log("Hid 2nd inner div of secondDiv");

  // OPTIONAL: remove the valueDiv from UI (if needed)
  // valueDiv.remove();
}
