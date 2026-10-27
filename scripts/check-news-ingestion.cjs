const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const original = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) { return original.call(this, name.startsWith('@/') ? path.join(root, name.slice(2)) : name, ...args); };
require.extensions['.ts'] = function (module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
};
const norm = require('../app/lib/news/normalize.ts');
const { NEWS_SOURCES } = require('../app/lib/news/sources.ts');
const { parseSourceBody, readSourceBody } = require('../app/lib/news/ingest.ts');
const { authorizedRefresh } = require('../app/lib/news/auth.ts');
const now = Date.parse('2026-10-27T12:00:00Z');
const fda = NEWS_SOURCES.find(s => s.id === 'fda');
assert.equal(norm.canonicalUrl('https://www.fda.gov.evil.test/a', ['www.fda.gov']), null);
assert.equal(norm.canonicalUrl('javascript:alert(1)', ['www.fda.gov']), null);
assert.equal(norm.canonicalUrl('https://www.fda.gov/a?utm_source=x&foo=1#top', ['www.fda.gov']), 'https://www.fda.gov/a?foo=1');
assert.equal(norm.parseNewsDate('2027-01-01', now), null);
assert.equal(norm.parseNewsDate('2026-10-27', now), '2026-10-27');
assert.equal(norm.plainText('<script>alert(1)</script><b>Safe &amp; useful</b>'), 'Safe & useful');
assert.throws(() => norm.rssItems('<!DOCTYPE x><rss/>'), /Unsupported XML/);
assert.equal(authorizedRefresh('Bearer secret', 'secret'), true);
assert.equal(authorizedRefresh('Bearer wrong', 'secret'), false);
const parsed = parseSourceBody(fda, '<rss><channel><item><title>A headline</title><link>http://www.fda.gov/a</link><pubDate>Mon, 26 Oct 2026 12:00:00 EDT</pubDate><description>Do not copy</description></item></channel></rss>', now);
assert.equal(parsed.length, 1);
assert.equal(parsed[0].url, 'https://www.fda.gov/a');
assert.equal(parsed[0].publishedAt, '2026-10-26T16:00:00.000Z');
assert.equal(JSON.stringify(parsed).includes('Do not copy'), false);
assert.equal(norm.deduplicateArticles([parsed[0], {...parsed[0], title: 'Corrected'}])[0].title, 'Corrected');
assert.equal(norm.makeArticle({title:'x',url:'https://www.fda.gov/a', date:'2027-01-01',category:'healthcare',kind:'release'},fda,['www.fda.gov'],now),null);
const tc = NEWS_SOURCES.find(source => source.id === 'techcrunch');
const originalTitle = 'A full headline '.repeat(40).trim();
const tcItem = parseSourceBody(tc, `<rss><channel><item><title>${originalTitle}</title><link>https://techcrunch.com/story/?utm_source=publisher</link><pubDate>Mon, 26 Oct 2026 12:00:00 GMT</pubDate><dc:creator>Original author</dc:creator></item></channel></rss>`, now)[0];
assert.equal(tcItem.title, originalTitle);
assert.equal(tcItem.url, 'https://techcrunch.com/story/?utm_source=publisher');
assert.equal(tcItem.author, 'Original author');
console.log('PASS metadata safety, correction, date precision, source-body exclusion, publisher attribution and refresh authentication');
(async () => {
  const outcomes = await Promise.all(NEWS_SOURCES.filter(s => s.enabled).map(async source => {
    try { const items = parseSourceBody(source, await readSourceBody(source)); return { source:source.id,status:'ok', count:items.length, latest:items[0]?.publishedAt, categories:[...new Set(items.map(i=>i.category))] }; }
    catch(error) { return { source:source.id,status:'error',message:error.message }; }
  }));
  console.log(JSON.stringify(outcomes,null,2));
  if (outcomes.some(outcome => outcome.status === 'error')) process.exitCode = 1;
})().catch(error=>{ console.error(error); process.exitCode=1; });
