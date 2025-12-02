export default async function decorate(block) {
  const query = `
    query {
      newsList {
        items {
          title
          category
          description {
            html
          }
          _id
        }
      }
    }
  `;

  const endpoint = '/content/cq:graphql/GMR/endpoint.json';

  // 1. Try POST first (only works on AUTHOR)
  let resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  // 2. If POST fails (PUBLISH/EDS), fallback to GET
  if (!resp.ok) {
    const url = `${endpoint}?query=${encodeURIComponent(query)}`;
    resp = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  if (!resp.ok) {
    block.textContent = `GraphQL error: ${resp.status}`;
    console.error('GraphQL error:', resp.status, await resp.text());
    return;
  }

  const json = await resp.json();
  const items = json?.data?.newsList?.items || [];

  block.innerHTML = '';

  items.forEach((item) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${item.title}</h3>
      <div>${item.description?.html || ''}</div>
    `;
    block.appendChild(div);
  });
}
