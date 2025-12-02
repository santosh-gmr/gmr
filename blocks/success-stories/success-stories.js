export default async function decorate(block) {

  const endpoint = '/graphql/execute.json?persistedQuery=GMR/news-list';

  const resp = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  console.log(resp);
  const json = await resp.json();
  console.log("DATA:", json);
}
