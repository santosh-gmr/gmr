export default async function decorate(block) {

  // your GraphQL query to fetch CF list
  const query = `
    query {
      cardModelList {
        items {
          title
          description
          ctaText
          ctaLink
          image {
            ... on ImageRef {
              _path
            }
          }
        }
      }
    }
  `;

  // Fetch from your GraphQL endpoint
  const response = await fetch('/content/cq:graphql/genstudio/endpoint.json', {
    method: 'POST',
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  const { data } = await response.json();

  if (!data || !data.cardModelList) {
    block.innerHTML = "<p>No content found.</p>";
    return;
  }

  const items = data.cardModelList.items;

  // Build the HTML layout
  block.innerHTML = `
    <div class="cf-grid">
      ${items
        .map(item => `
          <div class="cf-card">
            ${item.image ? `<img src="${item.image._path}" alt="">` : ""}
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${item.ctaLink ? `<a href="${item.ctaLink}" class="cta">${item.ctaText}</a>` : ""}
          </div>
        `)
        .join("")}
    </div>
  `;
}
