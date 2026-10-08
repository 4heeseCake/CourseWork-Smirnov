const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const routes = { '/': ['pages/index.html', 'text/html; charset=utf-8'], '/attacker.js': ['public/attacker.js', 'text/javascript'] };
http.createServer((req, res) => {
  const entry = routes[new URL(req.url, 'http://localhost').pathname];
  if (!entry || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': entry[1], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(path.join(__dirname, entry[0]));
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}).listen(Number(process.env.PORT || 4000), '0.0.0.0');
