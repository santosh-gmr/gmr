export default async function decorate(block) {
  const resp = await fetch('/graphql/execute.json/GMR/news-list', {
    headers: { Accept: 'application/json' },
  });

  console.log(resp);
}



