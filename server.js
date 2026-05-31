// ─── Turbo Learning Server ───
// Serves: Expo web build (dist/), docs (admin dashboard, learning path), admin API

const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleAdminRoute } = require('./src/server/admin-api');

const PORT = process.env.PORT || 3092;
const DIST = path.join(__dirname, 'dist');
const DOCS = path.join(__dirname, 'docs');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // ── Admin API routes ──
  if (url.startsWith('/api/admin/') && method === 'GET') {
    try {
      const result = await handleAdminRoute(url);
      if (result) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(result));
        return;
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
      return;
    }
  }

  // ── Serve /docs/* files ──
  if (url.startsWith('/docs/')) {
    const docPath = path.join(DOCS, url.slice(6)); // strip '/docs/'
    // Prevent directory traversal
    if (!docPath.startsWith(DOCS)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (fs.existsSync(docPath) && fs.statSync(docPath).isFile()) {
      serveFile(res, docPath);
      return;
    }
    // Fallback: serve index.html docs directory
    serveFile(res, path.join(DOCS, 'index.html'));
    return;
  }

  // ── Serve static files from dist ──
  let filePath = path.join(DIST, url || '/');
  let ext = path.extname(filePath);

  if (ext && ext !== '') {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveFile(res, filePath);
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // ── SPA fallback → serve index.html ──
  serveFile(res, path.join(DIST, 'index.html'));
}).listen(PORT, () => {
  console.log(`✅ Turbo Learning Server`);
  console.log(`   📊 Admin dashboard: http://localhost:${PORT}/docs/admin-dashboard.html`);
  console.log(`   📚 Learning path:   http://localhost:${PORT}/docs/learning-path.html`);
  console.log(`   🏠 App:              http://localhost:${PORT}`);
  console.log(`   🛠️  API:             http://localhost:${PORT}/api/admin/summary`);
});
