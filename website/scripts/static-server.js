const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = Number(process.argv[2] || 4173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.exe': 'application/vnd.microsoft.portable-executable',
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const safePath = pathname.replace(/^\/+/, '');
  let filePath = path.join(root, safePath);
  if (pathname === '/' || !path.extname(filePath)) filePath = path.join(root, safePath, 'index.html');
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ok: true,
      stats: {
        visits: 0,
        downloads: 0,
        visitors: { total: 0, today: 0, week: 0, month: 0 },
        downloadStats: { total: 0, today: 0, week: 0, month: 0, byVersion: [] },
        trend: [],
      },
    }));
    return;
  }

  const filePath = resolvePath(req.url);
  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`Static server listening on http://localhost:${port}`);
});
