import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code !== 'Escape') return;

  const nav = document.getElementById('nav');
  if (!nav) return;

  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');

  if (navSectionExpanded && isDesktop.matches) {
    // collapse only the open dropdown on desktop
    toggleAllNavSections(navSections);
    navSectionExpanded.focus();
  } else if (!isDesktop.matches) {
    // close full menu on mobile
    toggleMenu(nav, navSections);
    const btn = nav.querySelector('button');
    if (btn) btn.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav) return;

  // focus moved completely outside of nav
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;

    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (!focused) return;

  const isNavDrop = focused.classList.contains('nav-drop');
  if (!isNavDrop) return;

  if (e.code === 'Enter' || e.code === 'Space') {
    e.preventDefault();
    const navSections = focused.closest('.nav-sections');
    if (!navSections) return;

    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(navSections);
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement?.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|String} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  const value = expanded === true || expanded === 'true' ? 'true' : 'false';

  sections
    .querySelectorAll(':scope .default-content-wrapper > ul > li')
    .forEach((section) => {
      section.setAttribute('aria-expanded', value);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) return;

  const currentlyExpanded = nav.getAttribute('aria-expanded') === 'true';
  // if forceExpanded is not null, we want nav to be exactly that, not inverted
  const willBeExpanded = forceExpanded !== null ? !!forceExpanded : !currentlyExpanded;

  const button = nav.querySelector('.nav-hamburger button');

  // lock scroll on mobile when menu open
  document.body.style.overflowY = (willBeExpanded || isDesktop.matches) ? '' : 'hidden';

  nav.setAttribute('aria-expanded', willBeExpanded ? 'true' : 'false');

  // collapse or expand dropdowns according to new state / breakpoint
  const dropdownExpanded = willBeExpanded && !isDesktop.matches ? 'true' : 'false';
  toggleAllNavSections(navSections, dropdownExpanded);

  if (button) {
    button.setAttribute('aria-label', willBeExpanded ? 'Close navigation' : 'Open navigation');
  }

  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // escape / focus-out handling
  if (willBeExpanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPathMain = navMeta ? new URL(navMeta, window.location).pathname : '/en/nav';
  const isAero = window.location.pathname.startsWith('/aero-gmr/');
  const navPath = isAero ? '/aero-gmr/en/nav' : navPathMain;
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  
  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const btnContainer = brandLink.closest('.button-container');
      if (btnContainer) btnContainer.className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections
      .querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) {
          navSection.classList.add('nav-drop');
        }
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // initialize state based on current breakpoint
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

