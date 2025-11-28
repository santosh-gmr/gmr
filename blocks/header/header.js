export default function decorate(block) {

  const logo = block.querySelector('[data-field="logo"]')?.textContent.trim();
  const logoLink = block.querySelector('[data-field="logoLink"]')?.textContent.trim();
  
  const navItems = [...block.querySelectorAll('.nav-item')].map(item => {
    return {
      label: item.querySelector('[data-field="label"]')?.textContent.trim(),
      link: item.querySelector('[data-field="link"]')?.textContent.trim(),
      children: [...item.querySelectorAll('.nav-child')].map(child => ({
        label: child.querySelector('[data-field="childLabel"]')?.textContent.trim(),
        link: child.querySelector('[data-field="childLink"]')?.textContent.trim()
      }))
    };
  });

  const searchIcon = block.dataset.searchIcon;

  const wrapper = document.createElement('div');
  wrapper.className = 'header-container';

  wrapper.innerHTML = `
    <div class="header-logo">
      <a href="${logoLink}">
        <img src="${logo}" alt="Logo"/>
      </a>
    </div>

    <nav class="header-nav">
      <ul>
        ${navItems.map(item => `
          <li class="nav-item-parent">
            <a href="${item.link}">${item.label}</a>
            ${item.children.length > 0 ? `
              <ul class="dropdown">
                ${item.children.map(c => `
                  <li><a href="${c.link}">${c.label}</a></li>
                `).join('')}
              </ul>
            ` : ''}
          </li>
        `).join('')}
      </ul>
    </nav>

    <div class="header-search">
      <img src="${searchIcon}" alt="Search"/>
    </div>
  `;

  block.innerHTML = '';
  block.appendChild(wrapper);
}
