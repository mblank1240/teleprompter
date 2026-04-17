const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain',
  '.css':  'text/css; charset=utf-8',
};

function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  const rawPath = req.url.split('?')[0].split('#')[0];
  const safePath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(ROOT, safePath === '/' ? 'index.html' : safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

const ip = getLocalIP();
server.listen(PORT, '0.0.0.0', () => {
  console.log('\nPrompter Dev Server');
  console.log('─────────────────────────────────────────');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${ip}:${PORT}   <- open on iPad`);
  console.log(`  Remote:  http://${ip}:${PORT}/remote.html`);
  console.log('');
  console.log('  Note: Service Worker requires HTTPS.');
  console.log('        WebRTC data channels work over HTTP.');
  console.log('─────────────────────────────────────────\n');
  console.log('Press Ctrl+C to stop.\n');
});
