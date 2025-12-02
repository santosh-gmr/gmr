export default async function decorate(block) {
  const resp = await fetch('https://publish-p168597-e1803019.adobeaemcloud.com/graphql/execute.json/GMR/news-list', {
    headers: { Accept: 'application/json' },
  });

  console.log(resp);
}


