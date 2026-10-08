const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const backend = new URL(process.env.BACKEND_URL || 'http://localhost:8000');
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const headers = { ...req.headers, host: backend.host };
    delete headers.connection;
    delete headers['x-forwarded-host'];
    delete headers['x-forwarded-proto'];
    const upstream = http.request({ hostname: backend.hostname, port: backend.port, path: req.url, method: req.method, headers }, (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });
    upstream.setTimeout(10000, () => upstream.destroy());
    upstream.on('error', () => {
      if (res.headersSent) return res.destroy();
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Backend unavailable' }));
    });
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  if (url.pathname === '/') { res.writeHead(302, { Location: '/protected' }); return res.end(); }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/protected') res.setHeader('Content-Security-Policy', csp);
  const page = ['/protected', '/vulnerable'].includes(url.pathname);
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(page ? '/index.html' : url.pathname)); }
  catch { res.writeHead(400); return res.end(); }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
});
server.requestTimeout = 15000;
server.listen(Number(process.env.PORT || 3000), '0.0.0.0');
