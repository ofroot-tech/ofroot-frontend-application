// Test the HTML sanitization utility
import { sanitizeHtml } from '../app/lib/sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags to prevent XSS', () => {
    const input = '<p>Safe content</p><script>alert("XSS")</script>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p>Safe content</p>');
    expect(output).not.toContain('script');
  });

  it('removes event handlers to prevent XSS', () => {
    const input = '<p onclick="alert(\'XSS\')">Click me</p>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p>Click me</p>');
    expect(output).not.toContain('onclick');
  });

  it('preserves safe HTML elements', () => {
    const input = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>';
    const output = sanitizeHtml(input);
    expect(output).toContain('<h1>Title</h1>');
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
  });

  it('preserves links', () => {
    const input = '<a href="https://example.com">Link</a>';
    const output = sanitizeHtml(input);
    expect(output).toContain('<a href="https://example.com">Link</a>');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'XSS\')">Bad Link</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('javascript:');
  });

  it('preserves code blocks', () => {
    const input = '<pre><code>const x = 1;</code></pre>';
    const output = sanitizeHtml(input);
    expect(output).toContain('<pre><code>const x = 1;</code></pre>');
  });

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('removes iframes', () => {
    const input = '<p>Content</p><iframe src="https://evil.com"></iframe>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p>Content</p>');
    expect(output).not.toContain('iframe');
  });
});
