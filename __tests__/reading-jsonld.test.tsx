import { renderToStaticMarkup } from 'react-dom/server';
import JsonLd from '@/components/seo/JsonLd';

test('article schema cannot close its script tag and keeps the original text', () => {
  const data = { '@context': 'https://schema.org', headline: '</script><script>alert(1)</script>' };
  const html = renderToStaticMarkup(<JsonLd data={data} />);
  expect((html.match(/<script/g) || [])).toHaveLength(1);
  const json = html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
  expect(json).not.toContain('<');
  expect(JSON.parse(json)).toEqual(data);
});
