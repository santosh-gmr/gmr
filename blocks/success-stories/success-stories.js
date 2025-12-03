// block.js
export default async function decorate(block) {
  const variables = { limit: 1, offset: 0, category: "news1" };

  try {
    const resp = await fetch('/graphql/execute.json/GMR/news-list-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables)
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      throw new Error(`Request failed: ${resp.status} ${resp.statusText} ${text ? `- ${text}` : ''}`);
    }

    
}
}
