import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata("footer");
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : "/footer";
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = "";
  const footer = document.createElement("div");
  footer.className = "page-footer";

  const logoWrapper = document.createElement("div");
  logoWrapper.className = "footer-logo-wrapper";
  const logoContainer = document.createElement("div");
  logoContainer.className = "container";

  const logo = document.createElement("img");
  logo.src = "/icons/logo.svg";
  logo.alt = "GMR";
  logo.className = "footer-logo";
  footer.appendChild(logo);

  footer.appendChild(logoWrapper);
  logoWrapper.appendChild(logoContainer);
  logoContainer.appendChild(logo);

  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
