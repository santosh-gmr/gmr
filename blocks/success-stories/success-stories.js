export default async function decorate(block) {
  const resp = await fetch('/graphql/execute.json/GMR/news-list', {
    headers: { Accept: 'application/json' },
  });

  if (!resp.ok) {
    console.error('GraphQL error:', resp.status);
    block.textContent = 'Error loading news.';
    return;
  }

  const json = await resp.json();
}




