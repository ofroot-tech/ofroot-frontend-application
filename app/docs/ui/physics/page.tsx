import fs from 'fs';
import path from 'path';
import React from 'react';

export default function PhysicsDocs() {
  const mdPath = path.join(process.cwd(), 'app', 'lib', 'ui', 'PHYSICS.md');
  let content = '';
  try {
    content = fs.readFileSync(mdPath, 'utf8');
  } catch (e) {
    content = 'Documentation not found.';
  }

  // Very small local markdown -> HTML mapper: split on double newlines into paragraphs.
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>`) 
    .join('\n');

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-4">LiquidOpen spring engine</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: paragraphs }} />
    </main>
  );
}
