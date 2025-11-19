export default function decorate(block) {
  const row = block.querySelector(":scope > div");
  if (!row) return;

  const [logoDiv, menuDiv, searchDiv] = [...row.children];

  const logoImg = logoDiv?.querySelector("img");
  const menuItems = [...menuDiv?.children || []];
  const searchIcon = searchDiv?.querySelector("img");

  const header = document.createElement("header");
  header.className = "gmr-header";

  const container = document.createElement("div");
  container.className = "gmr-header-container";

  /* --- Logo --- */
  const logoWrapper = document.createElement("div");
  logoWrapper.className = "gmr-header-logo";
  if (logoImg) logoWrapper.append(logoImg);

  /* --- Menu --- */
  const nav = document.createElement("nav");
  const ul = document.createElement("ul");
  ul.className = "gmr-header-menu";

  menuItems.forEach((item) => {
    const label = item.children[0]?.innerText.trim();
    const url = item.children[1]?.innerText.trim();

    if (label) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = label;
      a.href = url || "#";
      li.append(a);
      ul.append(li);
    }
  });

  nav.append(ul);

  /* --- Search Icon --- */
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "gmr-header-search";
  if (searchIcon) searchWrapper.append(searchIcon);

  /* Assemble */
  container.append(logoWrapper, nav, searchWrapper);
  header.append(container);

  block.innerHTML = "";
  block.append(header);
}
