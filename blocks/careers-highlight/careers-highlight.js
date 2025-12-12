export default function decorate(block) {
  // keep original nodes (AEM editable fields)
  const original = [...block.children];

  // helpers
  const hasPicture = (node) => !!node.querySelector && !!node.querySelector('picture');

  // FIELD HOLDERS
  let sectionTitleNode = null;
  const pictureNodes = [];
  let blueCardNode = null;

  // CTA fields
  let ctaLabelNode = null; // <p> before CTA button
  let ctaLinkNode = null;  // <a class="button">

  // CLASSIFY ALL CHILD NODES
  original.forEach((child, index) => {
    const p = child.querySelector && child.querySelector('p');
    const a = child.querySelector && child.querySelector('a.button');

    // Found CTA BUTTON <a>
    if (!ctaLinkNode && a) {
      ctaLinkNode = child;

      // The CTA LABEL is ALWAYS the previous sibling <div><p>Label</p></div>
      const prev = original[index - 1];
      if (prev && prev.querySelector && prev.querySelector('p')) {
        ctaLabelNode = prev;
      }
      return;
    }

    // Section title (first text node)
    if (!sectionTitleNode && p && !p.closest("a")) {
      sectionTitleNode = child;
      return;
    }

    // Pictures
    if (hasPicture(child)) {
      pictureNodes.push(child);
      return;
    }

    // Blue card content (H2, H3, or P)
    if (!blueCardNode && (child.querySelector('h2') || child.querySelector('h3') || child.querySelector('p'))) {
      blueCardNode = child;
      return;
    }
  });

  // MAIN WRAPPERS
  const container = document.createElement('div');
  container.className = 'careerSection';

  const row = document.createElement('div');
  row.className = 'row';

  const col1 = document.createElement('div');
  col1.className = 'col-md-4';

  const col2 = document.createElement('div');
  col2.className = 'col-md-4';

  const col3 = document.createElement('div');
  col3.className = 'col-md-4';


  /* -------------------------
     COLUMN 1 – TWO IMAGES
  ------------------------- */

  if (pictureNodes[0]) {
    const wrap1 = document.createElement('div');
    wrap1.className = 'careerImg picone';
    wrap1.appendChild(pictureNodes[0]);

    const img = wrap1.querySelector('img');
    if (img) {
      img.setAttribute('data-aue-prop', 'imageOffice');
      img.setAttribute('data-aue-label', 'Image 1 (Top Left)');
      img.setAttribute('data-aue-type', 'media');
    }

    col1.appendChild(wrap1);
  }

  if (pictureNodes[1]) {
    const wrap2 = document.createElement('div');
    wrap2.className = 'careerImg pictwo';
    wrap2.appendChild(pictureNodes[1]);

    const img = wrap2.querySelector('img');
    if (img) {
      img.setAttribute('data-aue-prop', 'imageTeamSmall');
      img.setAttribute('data-aue-label', 'Image 2 (Bottom Left)');
      img.setAttribute('data-aue-type', 'media');
    }

    col1.appendChild(wrap2);
  }


  /* -------------------------
     COLUMN 2 – BLUE CARD
  ------------------------- */

  if (blueCardNode) {
    const cardContent = document.createElement('div');
    cardContent.className = 'cardContent';
    cardContent.appendChild(blueCardNode);
    col2.appendChild(cardContent);
  }


  /* -------------------------
     COLUMN 3 – LARGE IMAGE + CTA
  ------------------------- */

  if (pictureNodes[2]) {
    const wrap3 = document.createElement('div');
    wrap3.className = 'careerImg picthree';
    wrap3.appendChild(pictureNodes[2]);

    const img = wrap3.querySelector('img');
    if (img) {
      img.setAttribute('data-aue-prop', 'imageTeamLarge');
      img.setAttribute('data-aue-label', 'Image 3 (Right Side)');
      img.setAttribute('data-aue-type', 'media');
    }

    col3.appendChild(wrap3);
  }

  // CTA MERGE FIX
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta careerBtn';

  const finalBtn = document.createElement('a');
  finalBtn.className = 'btn btn-orange w-100';

  // CTA LABEL (always correct now)
  if (ctaLabelNode) {
    const p = ctaLabelNode.querySelector('p');
    if (p) finalBtn.textContent = p.textContent.trim();
  }

  // CTA LINK
  if (ctaLinkNode) {
    const a = ctaLinkNode.querySelector('a');
    if (a) {
      finalBtn.href = a.href;
      if (a.title) finalBtn.title = a.title;
    }
  }

  ctaWrap.appendChild(finalBtn);
  col3.appendChild(ctaWrap);


  /* -------------------------
     ASSEMBLE STRUCTURE
  ------------------------- */

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  container.appendChild(row);

  block.innerHTML = '';

  if (sectionTitleNode) {
    const header = document.createElement('header');
    header.className = 'entry-container text-center';

    const p = sectionTitleNode.querySelector('p');
    if (p) p.classList.add('title');
    else sectionTitleNode.classList.add('title');

    header.appendChild(sectionTitleNode);
    block.appendChild(header);
  }

  block.appendChild(container);
}
