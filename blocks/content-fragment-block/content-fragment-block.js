const NEWS_GQL = '/content/cq:graphql/genstudio/endpoint.json';

const query = `
  {
    newsArticlesList {
      items {
        title
        description
        publishDate
        thumbnailImage {
          _path
        }
        ctaText
        ctaLink
      }
    }
  }
`;

export default async function decorate(block) {
  const response = await fetch(NEWS_GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();

  console.log('NEWS DATA:', data);

  // Build your UI here using data.newsArticlesList.items
}
