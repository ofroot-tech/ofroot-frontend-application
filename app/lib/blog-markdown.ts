import { Marked, Renderer } from 'marked';

function escapeHtml(value:string) {
  return value.replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
}
function safeUrl(value:string, image=false) {
  try { const url=new URL(value,'https://www.ofroot.technology'); return (image ? ['https:','http:'] : ['https:','http:','mailto:']).includes(url.protocol); }
  catch { return false; }
}

/** Published Markdown is content, not executable HTML. Per-render instances
 * avoid changing other callers' parser state in a shared server process. */
export async function renderBlogMarkdown(body:string):Promise<string> {
  const renderer=new Renderer();
  renderer.html=({text})=>escapeHtml(text);
  renderer.link=function({href,title,tokens}) {
    const label=this.parser.parseInline(tokens);
    return safeUrl(href) ? `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}>${label}</a>` : label;
  };
  renderer.image=({href,title,text})=>safeUrl(href,true) ? `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">` : escapeHtml(text);
  const parser=new Marked({renderer,walkTokens(token){ if(token.type==='heading' && token.depth===1) token.depth=2; }});
  return await parser.parse(body);
}
