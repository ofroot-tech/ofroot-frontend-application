/** Public structured data follows visible content, never an invented publish
 * date, an unavailable brief, or an audio file that has not been produced. */
const site = 'https://www.ofroot.technology';

export function readingCollection(path: string, name: string, items: { title: string; path: string }[]) {
  return { '@context':'https://schema.org', '@type':'CollectionPage', name, url:`${site}${path}`,
    mainEntity:{ '@type':'ItemList', itemListElement:items.map((item,index)=>({ '@type':'ListItem', position:index+1, name:item.title, url:`${site}${item.path}` })) } };
}

export function signalArticleSchema(input: { id:string; title:string; description:string; generatedAt:string; sourceUrl:string; evidenceUrl:string; evidencePublisher:string }) {
  const url = `${site}/news/brief/${input.id}`;
  return { '@context':'https://schema.org', '@type':'Article', headline:input.title, description:input.description,
    url, mainEntityOfPage:{ '@type':'WebPage', '@id':url },
    author:{ '@type':'Organization', name:'OfRoot Signal', url:`${site}/news/methodology` },
    publisher:{ '@type':'Organization', name:'OfRoot Technology', url:site },
    citation:[{ '@type':'CreativeWork', url:input.sourceUrl },{ '@type':'CreativeWork', url:input.evidenceUrl, publisher:{ '@type':'Organization', name:input.evidencePublisher } }],
    isAccessibleForFree:true, inLanguage:'en', genre:'Automated primary-source digest' };
}
