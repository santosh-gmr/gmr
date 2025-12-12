export default function decorate(block) {
  const children = Array.from(block.children);

  if (children.length < 4) return;

  // --- BUILD HEADER ---
  const header = document.createElement("header");
  header.className = "d-md-flex align-items-center gap-3";

  const headerCol = document.createElement("div");
  headerCol.className = "entry-container";

  // Title (move original node)
  const titleNode = children[0];
  headerCol.appendChild(titleNode);

  // Description (move original)
  const descNode = children[1];
  headerCol.appendChild(descNode);

  header.appendChild(headerCol);

  // Top Button (move original, keep editable)
  const topBtnNode = children[2];
  topBtnNode.classList.add("btn", "btn-orange");
  header.appendChild(topBtnNode);

  // --- COMPANIES SECTION ---
  const companiesCol = document.createElement("div");
  companiesCol.className = "companiesCol";

  const row = document.createElement("div");
  row.className = "row";

  // Company items start at index 3
  for (let i = 3; i < children.length; i++) {
    const company = children[i];
    const fields = Array.from(company.children);

    if (fields.length < 6) continue;

    // Bootstrap column wrapper
    const col = document.createElement("div");
    col.className = "col-md-6 mb-4";

    // companiesGrid wrapper
    const companiesGrid = document.createElement("div");
    companiesGrid.className = "companiesGrid";

    // Move Company Name (<p> or <h3>)
    companiesGrid.appendChild(fields[0]);

    // Move Company Description
    companiesGrid.appendChild(fields[1]);

    // --- LINKS WRAPPER ---
    const links = document.createElement("div");
    links.className = "companies-links mt-5 mb-4";

    // Visit Website Button
    if (fields[3]) {
      fields[3].classList.add("btn", "btn-link");
      links.appendChild(fields[3]);
    }

    // Explore Highlights Button
    if (fields[5]) {
      fields[5].classList.add("btn", "btn-link");
      links.appendChild(fields[5]);
    }

    companiesGrid.appendChild(links);
    col.appendChild(companiesGrid);

    // Stock number OUTSIDE companiesGrid
    const stockNode = fields[2];
    if (stockNode) {
      const stockWrap = document.createElement("div");
      stockWrap.className = "companiesStock";
      stockWrap.appendChild(stockNode);
      col.appendChild(stockWrap);
    }

    row.appendChild(col);
  }

  companiesCol.appendChild(row);

  // CLEAR BLOCK BUT KEEP NODES (we rebuild using original nodes)
  block.textContent = "";
  block.appendChild(header);
  block.appendChild(companiesCol);
}
