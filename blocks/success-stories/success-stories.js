// /blocks/news-list/news-list.js
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

  // Execution endpoint derived from your AEM config path (from screenshot)
  const endpoint = '/content/cq:graphql/GMR/endpoint.json';

  async function fetchPost() {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query }),
    });
  }

  async function fetchGet() {
    const url = `${endpoint}?query=${encodeURIComponent(query)}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  try {
    // First try POST (works on Author)
    let resp = await fetchPost();

    // If POST is not allowed (405) or blocked, fallback to GET with query param
    if (resp.status === 405 || !resp.ok && resp.status >= 400) {
      // try GET fallback
      resp = await fetchGet();
    }

    if (!resp.ok) {
      console.error('GraphQL response error', resp.status, await resp.text());
      block.textContent = 'Failed to load news.';
      return;
    }

    const json = await resp.json();
    const items = json?.data?.newsList?.items || [];

    block.innerHTML = '';

    if (!items.length) {
      block.textContent = 'No news found.';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'news-list';

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'news-item';
      li.innerHTML = `
        <h3>${item.title || ''}</h3>
        <span class="news-category">${item.category || ''}</span>
        <div class="news-description">${item.description?.html || ''}</div>
      `;
      ul.appendChild(li);
    });

    block.appendChild(ul);
  } catch (e) {
    console.error('Failed to load news', e);
    block.textContent = 'Failed to load news (check console).';
  }
}
