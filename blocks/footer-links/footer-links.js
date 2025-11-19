/**
 * Safe footer-nav decorator for AEM EDS / Universal Editor
 * - waits briefly to let UE attach editing behavior
 * - wraps rows -> columns without breaking UE editability
 */

const WAIT_MS = 60; // small delay so UE can initialize (increase if needed)

function sanitizeClassName(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .substring(0, 64);
}

export default function decorate(block) {
  // quick guard
  if (!block) return;

  // Some debug info in author instance
  // console.log('footer-nav decorate called for', block);

  // Defer restructuring so UE has time to attach edit overlays
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        // Mark the block (so you can see it in devtools)
        block.classList.add('footer-nav--enhanced');

        // Add bootstrap container class to block root if you want
        if (!block.classList.contains('container')) {
          block.classList.add('container');
        }

        // collect direct child "rows" (the content editors created)
        const rows = Array.from(block.querySelectorAll(':scope > div'));

        if (!rows.length) {
          // nothing to transform
          return;
        }

        // We'll create a row wrapper that will contain columns
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'row';

        // Use a DocumentFragment to build structure before replacing DOM
        const frag = document.createDocumentFragment();

        rows.forEach((row, rowIndex) => {
          // Expect each row to have at least two child DIVs (title and content)
          const cells = Array.from(row.querySelectorAll(':scope > div'));

          // If there are less than 2 children, keep as-is (or wrap)
          if (cells.length < 2) {
            // Move the existing node into a full-width column
            const fallbackCol = document.createElement('div');
            fallbackCol.className = 'col-12 mb-3';
            // Move the row's children into the column preserving nodes
            while (row.firstChild) {
              fallbackCol.appendChild(row.firstChild);
            }
            frag.appendChild(fallbackCol);
            return;
          }

          const titleDiv = cells[0];
          const contentDiv = cells[1];

          // extract a class-name seed from the titleDiv (if desired)
          const seedText = titleDiv.textContent && titleDiv.textContent.trim();
          const derivedClass = sanitizeClassName(seedText);

          // Create column wrapper
          const col = document.createElement('div');
          // Example layout: col-md-2 (user asked earlier). Use whatever grid you want
          col.className = 'col-md-2 mb-3';
          if (derivedClass) col.classList.add(derivedClass);

          // Create title & content wrappers but **do not clone** — move nodes to preserve editability
          const titleWrapper = document.createElement('div');
          titleWrapper.className = 'footer-nav-title';

          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'footer-nav-content';

          // Move children (this preserves original DOM nodes and their attributes)
          while (titleDiv.firstChild) {
            titleWrapper.appendChild(titleDiv.firstChild);
          }
          while (contentDiv.firstChild) {
            contentWrapper.appendChild(contentDiv.firstChild);
          }

          // Append wrappers to column
          col.appendChild(titleWrapper);
          col.appendChild(contentWrapper);

          // Append column to fragment
          frag.appendChild(col);
        });

        // Replace the original children with our new rowWrapper containing columns
        // Clear existing content of block first
        block.innerHTML = '';
        rowWrapper.appendChild(frag);
        block.appendChild(rowWrapper);

        // OPTIONAL: hide or remove original editor placeholders if still present (should be moved already)
        // No further action required.

        // Debug mark
        // console.log('footer-nav transformed successfully');
      } catch (err) {
        console.error('footer-nav decorate error', err);
      }
    }, WAIT_MS);
  });
}
