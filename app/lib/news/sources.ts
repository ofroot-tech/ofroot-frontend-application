import type { NewsCategory, NewsSource } from './types';

export const NEWS_CATEGORIES: { id: NewsCategory; label: string; description: string }[] = [
  { id: 'ai', label: 'Artificial intelligence', description: 'Models, research, and the people building AI.' },
  { id: 'integrations', label: 'Integrations', description: 'APIs, interoperability, and connected systems.' },
  { id: 'healthcare', label: 'Healthcare & startups', description: 'Healthcare developments; startup reporting expands as publishers are approved.' },
  { id: 'policy', label: 'Policy', description: 'Technology rules, proposals, and official announcements.' },
  { id: 'cybersecurity', label: 'Cybersecurity', description: 'Known exploited vulnerabilities and security developments.' },
];

// Permission is an explicit source-level gate. A public feed alone is not a reuse license.
// We store discovery metadata only, never article bodies, abstracts, or publisher images.
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'arxiv', name: 'arXiv via DataCite', homepage: 'https://arxiv.org',
    categories: ['ai', 'integrations'], enabled: true,
    feedUrl: 'https://api.datacite.org/dois?provider-id=arxiv&query=titles.title%3A%28%22language%20model%22%20OR%20%22artificial%20intelligence%22%20OR%20%22model%20context%20protocol%22%20OR%20%22interoperability%22%20OR%20%22API%20integration%22%29&sort=-created&page%5Bsize%5D=35',
    rights: {
      status: 'approved',
      basis: 'Descriptive metadata is CC0. arXiv documents DataCite as a metadata access option; DataCite CC0 policy: https://support.datacite.org/docs/datacite-data-file-use-policy. Links open the original abstract page; research is not labelled reporting.',
      termsUrl: 'https://info.arxiv.org/help/api/tou.html',
    },
  },
  {
    id: 'arxiv-integrations', name: 'arXiv interoperability research', homepage: 'https://arxiv.org',
    categories: ['integrations'], enabled: true,
    feedUrl: 'https://api.datacite.org/dois?provider-id=arxiv&query=titles.title%3A%28%22model%20context%20protocol%22%20OR%20%22interoperability%22%20OR%20%22API%20integration%22%29&sort=-created&page%5Bsize%5D=15',
    rights: {
      status: 'approved',
      basis: 'CC0 descriptive metadata via DataCite. This is an explicitly labelled research feed about interoperability, not a claim of product release or startup reporting.',
      termsUrl: 'https://info.arxiv.org/help/api/tou.html',
    },
  },
  {
    id: 'federal-register', name: 'Federal Register', homepage: 'https://www.federalregister.gov',
    categories: ['policy'], enabled: true,
    feedUrl: 'https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22artificial%20intelligence%22&order=newest&per_page=25&fields%5B%5D=title&fields%5B%5D=html_url&fields%5B%5D=publication_date&fields%5B%5D=type',
    rights: {
      status: 'approved',
      basis: 'U.S. government document metadata through the public API. Document labels distinguish proposals and notices from enacted rules; the official edition must be consulted for legal reliance.',
      termsUrl: 'https://www.federalregister.gov/developers/documentation/api/v1',
    },
  },
  {
    id: 'fda', name: 'U.S. FDA', homepage: 'https://www.fda.gov',
    categories: ['healthcare'], enabled: true,
    feedUrl: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml',
    rights: {
      status: 'approved',
      basis: 'Agency-created material is public domain unless otherwise marked. Only headline, source, date, and original link are used; no logo, imagery, or implied endorsement.',
      termsUrl: 'https://www.fda.gov/about-fda/about-website/website-policies',
    },
  },
  {
    id: 'cisa', name: 'CISA', homepage: 'https://www.cisa.gov',
    categories: ['cybersecurity'], enabled: true,
    feedUrl: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    rights: {
      status: 'approved',
      basis: 'Public government KEV catalog metadata, attributed to CISA with CVE-specific original links. CISA trademarks and logos are not reused. Catalog addition dates are shown, not invented article timestamps.',
      termsUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
    },
  },
  {
    id: 'techcrunch', name: 'TechCrunch · AI', homepage: 'https://techcrunch.com/category/artificial-intelligence/',
    categories: ['ai', 'integrations', 'cybersecurity'], enabled: true,
    feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    rights: {
      status: 'approved',
      basis: 'RSS terms permit this ad-free display of feed-supplied complete headlines, author attribution, original links, and publication dates. No summaries, article text, feed advertising, or publisher images are used; feed fields are not rewritten.',
      termsUrl: 'https://techcrunch.com/rss-terms-of-use/',
    },
  },
  {
    id: 'techcrunch-healthcare', name: 'TechCrunch · Healthcare', homepage: 'https://techcrunch.com/category/biotech-health/',
    categories: ['healthcare'], enabled: true,
    feedUrl: 'https://techcrunch.com/category/biotech-health/feed/',
    rights: {
      status: 'approved',
      basis: 'Same TechCrunch RSS terms: ad-free, unchanged feed headlines, source and author attribution, dates, and original publisher links only. No copied article bodies or images.',
      termsUrl: 'https://techcrunch.com/rss-terms-of-use/',
    },
  },
  {
    id: 'techcrunch-integrations', name: 'TechCrunch · Enterprise', homepage: 'https://techcrunch.com/category/enterprise/',
    categories: ['integrations', 'cybersecurity'], enabled: true,
    feedUrl: 'https://techcrunch.com/category/enterprise/feed/',
    rights: {
      status: 'approved',
      basis: 'Same TechCrunch RSS terms for unchanged attributed metadata with original links and no feed advertising. Only integration/API/interoperability-related enterprise headlines are included.',
      termsUrl: 'https://techcrunch.com/rss-terms-of-use/',
    },
  },
  {
    id: 'nist', name: 'NIST · Information technology', homepage: 'https://www.nist.gov',
    categories: ['ai', 'integrations', 'cybersecurity'], enabled: true,
    feedUrl: 'https://www.nist.gov/news-events/information%20technology/rss.xml',
    rights: {
      status: 'approved', web: 'metadata-only', email: 'metadata-only', reviewedAt: '2026-10-29',
      basis: 'NIST permits distribution of its public information except material marked copyrighted. This official RSS adapter uses attributed headlines, dates, and NIST links only; event listings, bodies, images, and third-party materials are excluded. Website and email metadata reuse reviewed separately; this does not enable article-body digests.',
      termsUrl: 'https://www.nist.gov/copyrights-disclaimers',
    },
  },
  {
    id: 'cms', name: 'CMS · Health technology', homepage: 'https://www.cms.gov',
    categories: ['healthcare'], enabled: true,
    feedUrl: 'https://www.cms.gov/newsroom/rss-feeds',
    rights: {
      status: 'approved', web: 'metadata-only', email: 'metadata-only', reviewedAt: '2026-10-29',
      basis: 'CMS identifies CMS.gov as a public-domain website and permits contextual links. Only agency newsroom headlines, calendar dates, and original links concerning digital health, health data, or technology are indexed. Website and email metadata reuse reviewed separately; no third-party works, imagery, logos, or release-body digests are included.',
      termsUrl: 'https://www.cms.gov/about-cms/web-policies-important-links/about-website/link-to-us',
    },
  },
  {
    id: 'the-verge', name: 'The Verge', homepage: 'https://www.theverge.com',
    categories: ['ai', 'policy'], enabled: false,
    rights: {
      status: 'pending', basis: 'Publisher permission or a suitable syndication license is required before this source is ingested.',
      termsUrl: 'https://www.voxmedia.com/legal/terms-of-use',
    },
  },
  {
    id: 'ftc', name: 'Federal Trade Commission', homepage: 'https://www.ftc.gov',
    categories: ['policy'], enabled: false,
    rights: {
      status: 'pending',
      basis: 'Agency-created material is generally public domain, but the officially listed press feed returned 404 during validation. Activate after a working official endpoint is verified.',
      termsUrl: 'https://www.ftc.gov/policy-notices/website-policy',
    },
  },
];
