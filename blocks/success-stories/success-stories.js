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
  const items = json?.data?.newsList?.items || [];

  block.innerHTML = items.map(item => `
    <div class="news-card">
      <h3>${item.title}</h3>
      <div>${item.description?.html || ''}</div>
    </div>
  `).join('');
}
