export default function decorate(block) {
  // keep original nodes (AEM editable fields)
  const original = [...block.children];

  // helpers to detect node types
  const hasPicture = (node) => !!node.querySelector && !!node.querySelector('picture');
  const hasButton = (node) => !!node.querySelector && !!node.querySelector('a.button');
  const hasCTAtext = (node) => {
    const p = node.querySelector && node.querySelector('p');
    return p && p.textContent && p.textContent.includes('Explore Life at');
  };

  // Collect nodes by likely order / type
  let sectionTitleNode = null;
  const pictureNodes = [];
  let blueCardNode = null;
  let ctaNode = null;

  // iterate original children and classify
  original.forEach((child) => {
    // Prefer to keep first plain text/paragraph as section title (but not CTA)
    if (!sectionTitleNode) {
      const p = child.querySelector && child.querySelector('p');
      if (p && !p.textContent.includes('Explore Life')) {
        sectionTitleNode = child;
        return;
      }
    }

    if (hasPicture(child)) {
      pictureNodes.push(child);
      return;
    }

    // CTA link/button node
    if (hasButton(child) || hasCTAtext(child)) {
      ctaNode = child;
      return;
    }

    // fallback: blue card content (h2/h3/p)
    if (!blueCardNode && (child.querySelector && (child.querySelector('h2') || child.querySelector('h3') || child.querySelector('p')))) {
      blueCardNode = child;
      return;
    }
  });

  // Create layout wrappers
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

  // Build Column 1: image 1 (top) and image 2 (bottom)
  if (pictureNodes[0]) {
    const wrap1 = document.createElement('div');
    wrap1.className = 'careerImg picone';
    // move the existing picture node inside wrapper
    wrap1.appendChild(pictureNodes[0]);
    // add data-aue attributes to contained img if available
    const imgEl = wrap1.querySelector('img');
    if (imgEl) {
      imgEl.setAttribute('data-aue-prop', 'imageOffice');
      imgEl.setAttribute('data-aue-label', 'Image 1 (Top Left)');
      imgEl.setAttribute('data-aue-type', 'media');
    }
    col1.appendChild(wrap1);
  }

  if (pictureNodes[1]) {
    const wrap2 = document.createElement('div');
    wrap2.className = 'careerImg pictwo';
    wrap2.appendChild(pictureNodes[1]);
    const imgEl = wrap2.querySelector('img');
    if (imgEl) {
      imgEl.setAttribute('data-aue-prop', 'imageTeamSmall');
      imgEl.setAttribute('data-aue-label', 'Image 2 (Bottom Left)');
      imgEl.setAttribute('data-aue-type', 'media');
    }
    col1.appendChild(wrap2);
  }

  // Build Column 2: blue card text (wrap inside .cardContent)
  if (blueCardNode) {
    const cardContent = document.createElement('div');
    cardContent.className = 'cardContent';
    // move existing blueCardNode inside cardContent
    cardContent.appendChild(blueCardNode);
    col2.appendChild(cardContent);
  } else {
    // if there's no explicit blueCardNode, but maybe h2/h3 exists in other nodes -> try to find
    // (this is conservative; we don't clone or remove other nodes)
  }

  // Build Column 3: large image and CTA
  if (pictureNodes[2]) {
    const wrap3 = document.createElement('div');
    wrap3.className = 'careerImg picthree';
    wrap3.appendChild(pictureNodes[2]);
    const imgEl = wrap3.querySelector('img');
    if (imgEl) {
      imgEl.setAttribute('data-aue-prop', 'imageTeamLarge');
      imgEl.setAttribute('data-aue-label', 'Image 3 (Right Side)');
      imgEl.setAttribute('data-aue-type', 'media');
    }
    col3.appendChild(wrap3);
  }

  // CTA handling: wrap CTA node in .cta.careerBtn and ensure link has btn classes
  if (ctaNode) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'cta careerBtn';

    // If the CTA node already contains the <a>, keep it; else we append the node as-is
    const link = ctaNode.querySelector && ctaNode.querySelector('a');
    if (link) {
      // add expected button classes if missing
      link.classList.add('btn', 'btn-orange', 'w-100');
      // move the whole ctaNode's contents into the wrapper so AEM field remains visible
      ctaWrap.appendChild(ctaNode);
    } else {
      // maybe it's a paragraph with CTA text; keep it inside wrapper
      ctaWrap.appendChild(ctaNode);
    }

    col3.appendChild(ctaWrap);
  } else {
    // If there is no explicit CTA node, optionally create a fallback button (commented out)
    // const ctaWrap = document.createElement('div');
    // ctaWrap.className = 'cta careerBtn';
    // const fallback = document.createElement('a');
    // fallback.className = 'btn btn-orange w-100';
    // fallback.href = '#';
    // fallback.textContent = 'Explore Life at GMR';
    // ctaWrap.appendChild(fallback);
    // col3.appendChild(ctaWrap);
  }

  // Assemble row/container
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  container.appendChild(row);

  // Clear the block but keep the original section title at top (wrapped inside header)
  block.innerHTML = '';

  if (sectionTitleNode) {
    const header = document.createElement('header');
    header.className = 'entry-container text-center';

    // If the title node is a paragraph, add 'title' class to it (don't replace it)
    if (sectionTitleNode.querySelector && sectionTitleNode.querySelector('p')) {
      const p = sectionTitleNode.querySelector('p');
      p.classList.add('title');
    } else {
      // otherwise add class to the node itself
      sectionTitleNode.classList.add('title');
    }

    header.appendChild(sectionTitleNode);
    block.appendChild(header);
  }

  block.appendChild(container);
}
