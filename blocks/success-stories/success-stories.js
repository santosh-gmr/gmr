export default async function decorate(block) {
  const query = `
    query {
      newsList {
        items {
          title
          category
          description {
            html
            markdown
            plaintext
            json
          }
          _id
        }
      }
    }
  `;

  try {
    const resp = await fetch('/graphql/execute.json/data/', {
      method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
      body: JSON.stringify({ query }),
    });

    if (!resp.ok) {
      console.error('GraphQL error status:', resp.status, await resp.text());
      return;
    }

    const json = await resp.json();
    const items = json?.data?.newsList?.items || [];

    // Clear original block content
    block.innerHTML = '';

    if (!items.length) {
      block.textContent = 'No news found.';
      return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('news-list');

    items.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('news-item');

      const title = document.createElement('h3');
      title.textContent = item.title;

      const category = document.createElement('span');
      category.classList.add('news-category');
      category.textContent = item.category || '';

      const desc = document.createElement('div');
      // you can choose html / plaintext / markdown etc.
      desc.innerHTML = item.description?.html || '';

      li.appendChild(title);
      li.appendChild(category);
      li.appendChild(desc);
      ul.appendChild(li);
    });

    block.appendChild(ul);
  } catch (e) {
    console.error('Failed to load news', e);
  }
}




