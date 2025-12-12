export default function decorate(block) {
  const original = [...block.children];

  const hasPicture = (node) => !!node.querySelector && !!node.querySelector('picture');

  let sectionTitleNode = null;
  const pictureNodes = [];
  let blueCardNode = null;

  // NEW: CTA Label = last text <p> node
  let ctaLabelNode = null;

  original.forEach((child) => {
    const p = child.querySelector && child.querySelector('p');

    // Section Title (first p)
    if (!sectionTitleNode && p) {
      sectionTitleNode = child;
      return;
    }

    // Pictures
    if (hasPicture(child)) {
      pictureNodes.push(child);
      return;
    }

    // Blue Card Text (first text after images)
    if (!blueCardNode && p) {
      blueCardNode = child;
      return;
    }

    // CTA LABEL (last <p> in the block)
    if (p) {
      ctaLabelNode = child;
    }
  });

  // MAIN LAYOUT
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


  /* COLUMN 1 – 2 Images */
  if (pictureNodes[0]) {
    const wrap = document.createElement('div');
    wrap.className = 'careerImg picone';
    wrap.appendChild(pictureNodes[0]);
    col1.appendChild(wrap);
  }

  if (pictureNodes[1]) {
    const wrap = document.createElement('div');
    wrap.className = 'careerImg pictwo';
    wrap.appendChild(pictureNodes[1]);
    col1.appendChild(wrap);
  }

  /* COLUMN 2 – Blue Card */
  if (blueCardNode) {
    const cardContent = document.createElement('div');
    cardContent.className = 'cardContent';
    cardContent.appendChild(blueCardNode);
    col2.appendChild(cardContent);
  }

  /* COLUMN 3 – Image + CTA */
  if (pictureNodes[2]) {
    const wrap = document.createElement('div');
    wrap.className = 'careerImg picthree';
    wrap.appendChild(pictureNodes[2]);
    col3.appendChild(wrap);
  }

  // CTA BUTTON
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta careerBtn';

  const finalBtn = document.createElement('a');
  finalBtn.className = 'btn btn-orange w-100';

  // TEXT FROM CTA LABEL FIELD
  if (ctaLabelNode) {
    const p = ctaLabelNode.querySelector('p');
    finalBtn.textContent = p ? p.textContent.trim() : '';
  }

  finalBtn.href = "#"; // no link field in AEM dialog
  ctaWrap.appendChild(finalBtn);
  col3.appendChild(ctaWrap);

  /* ASSEMBLE */
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  container.appendChild(row);

  block.innerHTML = '';

  /* HEADER */
  if (sectionTitleNode) {
    const header = document.createElement('header');
    header.className = 'entry-container text-center';

    const p = sectionTitleNode.querySelector('p');
    if (p) p.classList.add('title');

    header.appendChild(sectionTitleNode);
    block.appendChild(header);
  }

  block.appendChild(container);
}
