/** Public structured data follows visible content, never an invented publish
 * date, an unavailable brief, or an audio file that has not been produced. */
const site = 'https://www.ofroot.technology';

export function readingCollection(path: string, name: string, items: { title: string; path: string }[]) {
  return { '@context':'https://schema.org', '@type':'CollectionPage', name, url:`${site}${path}`,
    mainEntity:{ '@type':'ItemList', itemListElement:items.map((item,index)=>({ '@type':'ListItem', position:index+1, name:item.title, url:new URL(item.path, site).href })) } };
}

/** Authored news context and practical guides have different article types.
 * Dates come from editorial content, never the current render or fetch time. */
export function authoredArticleSchema(input: {
  type: 'BlogPosting' | 'NewsArticle'; path: string; title: string; description: string;
  publishedAt: string; modifiedAt?: string; section: string;
  parent: { name: string; path: string };
  sources: { label: string; href: string }[];
}) {
  const url = `${site}${input.path}`;
  const parentUrl = `${site}${input.parent.path}`;
  return [
    {
      '@context': 'https://schema.org', '@type': input.type, '@id': `${url}#article`,
      headline: input.title, description: input.description, url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: input.publishedAt, dateModified: input.modifiedAt ?? input.publishedAt,
      author: { '@type': 'Organization', name: 'OfRoot Technology', url: site },
      publisher: { '@type': 'Organization', name: 'OfRoot Technology', url: site },
      citation: input.sources.map(source => ({ '@type': 'CreativeWork', name: source.label, url: source.href })),
      articleSection: input.section, inLanguage: 'en-US', isAccessibleForFree: true,
      isPartOf: { '@type': input.type === 'BlogPosting' ? 'Blog' : 'CollectionPage', name: input.parent.name, url: parentUrl },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: input.parent.name, item: parentUrl },
        { '@type': 'ListItem', position: 2, name: input.title, item: url },
      ],
    },
  ];
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
