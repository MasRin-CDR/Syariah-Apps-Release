const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const STATS_FILE = path.join(__dirname, 'stats.json');
// SSE clients for live updates
let sseClients = [];

function broadcastStats(stats) {
  const payload = JSON.stringify(stats);
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // ignore
    }
  });
}

function loadStats() {
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { visits: 0, downloads: 0 };
  }
}

function saveStats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error('Gagal menyimpan stats:', e);
  }
}

function sendJSON(res, obj, status = 200) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(pathname));

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }

    if (stats.isDirectory()) {
      return serveStatic(req, res, path.join(pathname, 'index.html'));
    }

    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = map[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Server error');
    });
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Server-Sent Events endpoint for live stats
  if (req.method === 'GET' && pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    // send current stats immediately
    const stats = loadStats();
    res.write(`data: ${JSON.stringify(stats)}\n\n`);

    // keep connection open
    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(r => r !== res);
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/track') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const stats = loadStats();
        const event = (payload.event || '').toLowerCase();
        if (event === 'visit') stats.visits = (stats.visits || 0) + 1;
        if (event === 'download') stats.downloads = (stats.downloads || 0) + 1;
        saveStats(stats);
        // broadcast to SSE clients
        try { broadcastStats(stats); } catch (e) {}
        sendJSON(res, { ok: true, stats });
      } catch (e) {
        sendJSON(res, { ok: false, error: 'invalid_json' }, 400);
      }
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/stats') {
    const stats = loadStats();
    return sendJSON(res, { ok: true, stats });
  }

  // otherwise serve static files
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Static server + tracking listening on http://localhost:${PORT}`);
});
