import { renderBlogMarkdown } from '@/app/lib/blog-markdown';

describe('Published blog content',()=>{
  it('keeps source HTML visible without executing it',async()=>{
    const html=await renderBlogMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>'); expect(html).not.toContain('<img'); expect(html).toContain('&lt;script&gt;');
  });
  it('rejects executable links and images but preserves useful text',async()=>{
    const html=await renderBlogMarkdown('[Read this](javascript:alert%281%29)\n\n![Picture](data:text/html,unsafe)');
    expect(html).not.toContain('href="javascript:'); expect(html).not.toContain('src="data:'); expect(html).toContain('Read this');
  });
  it('retains ordinary links and a single article title hierarchy',async()=>{
    const html=await renderBlogMarkdown('# Body heading\n\n[Primary source](https://example.org/source)');
    expect(html).toContain('<h2>Body heading</h2>'); expect(html).not.toContain('<h1>'); expect(html).toContain('href="https://example.org/source"');
  });
});
