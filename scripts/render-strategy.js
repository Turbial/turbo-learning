#!/usr/bin/env node
const marked = require('/usr/lib/node_modules/openclaw/node_modules/marked');
const fs = require('fs');
const path = require('path');

const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'TURBOED_STRATEGY.md'), 'utf-8');
const html = marked.parse(md);

const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TurboEd — The Complete Product Strategy</title>
<style>
  body { max-width: 900px; margin: 2rem auto; padding: 0 1.5rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; color: #1a1a2e; background: #f8f9fa; }
  h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 0.5rem; font-size: 2rem; }
  h2 { color: #16213e; margin-top: 2.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3rem; }
  h3 { color: #374151; margin-top: 1.5rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
  th { background: #059669; color: white; padding: 0.6rem 0.8rem; text-align: left; font-weight: 700; }
  td { padding: 0.5rem 0.8rem; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  code { background: #ecfdf5; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #065f46; }
  pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #059669; padding-left: 1rem; margin-left: 0; color: #4b5563; }
  strong { color: #059669; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  a { color: #059669; }
  .meta { color: #9ca3af; font-size: 0.85rem; margin-bottom: 2rem; }
</style>
</head>
<body>
<h1>🚀 TurboEd — The Complete Product Strategy</h1>
<div class="meta">Compiled from CEO working session — June 1, 2026 · Turbo CEO + Marcus · <a href="https://github.com/Turbial/turbo-learning">Turbial/turbo-learning</a></div>
${html}
</body>
</html>`;

fs.writeFileSync('/tmp/turboed-strategy.html', full);
console.log('✅ Rendered ' + full.length + ' bytes');
