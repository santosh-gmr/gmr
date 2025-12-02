export default async function decorate(block) {

  // ✅ Correct EDS persistent query endpoint
  const resp = await fetch('/graphql/execute.json?persistedQuery=GMR/news-list', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  console.log("Response object:", resp);
}

