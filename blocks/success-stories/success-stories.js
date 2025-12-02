// /blocks/news-list/news-list.js
export default async function decorate(block) {
  const query = `{
  newsList {
    items {
      title
      category
      description { html }
      _id
    }
  }
}`;

const url = `https://main--gmr--santosh-gmr.aem.page/content/cq:graphql/GMR/endpoint.json?query=${encodeURIComponent(query)}`;

const resp = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
const json = await resp.json();

}


