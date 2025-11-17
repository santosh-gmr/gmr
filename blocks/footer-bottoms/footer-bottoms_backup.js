/**
 * footer-links block with:
 * - read value from 2nd div's 1st child div
 * - append that value as classname to secondDiv
 * - hide the 2nd child div of secondDiv
 */

export default function decorate(block) {
  block.classList.add("row");
  // Get root children
  const rootChildren = Array.from(block.querySelectorAll(":scope > div"));

  rootChildren.forEach((child) => {
    const secondDiv = child; // ⭐ second <div> under "footer-links block"
    // Get inner divs inside secondDiv
    const innerDivs = Array.from(secondDiv.querySelectorAll(":scope > div"));

    if (innerDivs.length < 2) {
      console.warn("footer-bottoms: secondDiv has less than 2 child divs");
      return;
    }

    const valueDiv = innerDivs[0];
    const hideDiv = innerDivs[3]; // second inner div (to hide)

    // Get text/value from first inner div
    const value = hideDiv.textContent.trim();

    // Add that value as classname to secondDiv
    // convert spaces → hyphen for valid class
    const safeClass = value.toLowerCase().replace(/\s+/g, "-");
    secondDiv.classList.add(safeClass);

    // Hide the second inner div
    hideDiv.style.display = "none";

    // OPTIONAL: remove the valueDiv from UI (if needed)
    // valueDiv.remove();
  });
}
