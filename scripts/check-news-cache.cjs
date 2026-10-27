const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const original = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) { return original.call(this, name.startsWith('@/') ? path.join(root, name.slice(2)) : name, ...args); };
require.extensions['.ts'] = function (module, filename) { module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename); };
const {getNewsSnapshot, refreshNews, publicSnapshot} = require('../app/lib/news/index.ts');
const {NEWS_SOURCES} = require('../app/lib/news/sources.ts');
delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;
delete process.env.NEWS_DATABASE_URL;
delete process.env.POSTGRES_URL;
let count=0;
global.fetch=async url=>{count++; return url.includes('known_exploited') ? new Response(JSON.stringify({vulnerabilities:[{cveID:'CVE-2026-12345',vulnerabilityName:'Test metadata',dateAdded:'2026-01-01'}]})) : new Response('',{status:503});};
(async()=>{
 const results=await Promise.all([getNewsSnapshot(),getNewsSnapshot(),getNewsSnapshot()]);
 const first=results[0];
 assert.equal(first.status,'partial');
 assert.equal(first.articles.length,1);
 assert.equal(count,NEWS_SOURCES.filter(s=>s.enabled&&s.rights.status==='approved').length);
 await getNewsSnapshot(); assert.equal(count,NEWS_SOURCES.filter(s=>s.enabled&&s.rights.status==='approved').length);
 global.fetch=async()=>new Response('',{status:503});
 const stale=await refreshNews();
 assert.equal(stale.status,'stale');assert.equal(stale.articles[0].id,first.articles[0].id);
 assert.equal(stale.lastSuccessfulAt,first.lastSuccessfulAt);
 assert.equal(stale.sourceHealth.find(s=>s.sourceId==='cisa').lastSuccessfulAt,first.checkedAt);
 assert.equal(publicSnapshot({...first,checkedAt:'2020-01-01T00:00:00Z'}).status,'stale');
 const relevance = publicSnapshot({...first,articles:[
  {id:'1234567890abcdefabcd',title:'Notice: Critical Material List; Addition of Helium',sourceId:'federal-register',url:'https://www.federalregister.gov/documents/helium',category:'policy',kind:'policy',publishedAt:null},
  {id:'1234567890abcdefabce',title:'Japan internet giant GMO says hackers posted stolen customer data',sourceId:'techcrunch',url:'https://techcrunch.com/news/breach',category:'ai',kind:'reporting',publishedAt:null}
 ]});
 assert.equal(relevance.articles.length,1);assert.equal(relevance.articles[0].category,'cybersecurity');
 process.env.NEWS_BLOCKED_ARTICLE_IDS=first.articles[0].id;
 assert.equal(publicSnapshot(first).articles.length,0);
 console.log('PASS 12 cache, concurrency, stale-retention, health, takedown and cached relevance assertions');
})().catch(error=>{console.error(error);process.exitCode=1;});
