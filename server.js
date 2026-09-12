const http = require('http');
const fs = require('fs');
const path = require('path');
const { corpus, search } = require('./public/search-engine');

const root = path.join(__dirname, 'public');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost:4173');
  if (url.pathname === '/api/search') {
    const query = url.searchParams.get('q')?.trim();
    if (!query) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Query is required' }));
      return;
    }
    const results = search(query, corpus).slice(0, 5);
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ query, results, source: 'node-backend' }));
    return;
  }
  const requested = request.url === '/' ? '/index.html' : request.url;
  const filePath = path.join(root, requested.split('?')[0]);
  if (!filePath.startsWith(root)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(4173, () => console.log('Group Chat Search running at http://localhost:4173'));
