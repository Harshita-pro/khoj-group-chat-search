const http = require('http');
const fs = require('fs');
const path = require('path');
const { corpus, queries, search } = require('./public/search-engine');

const root = path.join(__dirname, 'public');
const chatCorpora = new Map([['synthetic', corpus]]);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost:4173');
  if (url.pathname === '/api/corpora' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify([...chatCorpora.entries()].map(([id, messages]) => ({ id, name: id === 'synthetic' ? 'Synthetic demo chat' : id, count: messages.length }))));
    return;
  }
  if (url.pathname === '/api/benchmark' && request.method === 'GET') {
    const results = queries.map(item => search(item.text, corpus)[0]?.id === item.answer);
    const hardQueries = queries.filter(item => item.hard);
    const hardResults = hardQueries.map(item => search(item.text, corpus)[0]?.id === item.answer);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ all: results.filter(Boolean).length, total: results.length, hard: hardResults.filter(Boolean).length, hardTotal: hardResults.length }));
    return;
  }
  if (url.pathname === '/api/import' && request.method === 'POST') {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', chunk => { body += chunk; if (body.length > 10 * 1024 * 1024) request.destroy(); });
    request.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const input = Array.isArray(payload) ? payload : payload.messages;
        if (!Array.isArray(input) || input.length === 0 || input.length > 100000) throw new Error('JSON must contain 1 to 100,000 messages');
        const messages = input.map((message, index) => {
          const text = message.text ?? message.message ?? message.content;
          if (!text || !String(text).trim()) throw new Error(`Message ${index + 1} is missing text`);
          return { id: String(message.id ?? `imported-${index + 1}`), sender: String(message.sender ?? message.from ?? 'Unknown'), timestamp: message.timestamp ?? message.date ?? new Date().toISOString(), text: String(text) };
        });
        const id = `imported-${Date.now()}`;
        chatCorpora.set(id, messages);
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ id, name: id, count: messages.length }));
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  if (url.pathname === '/api/search') {
    const query = url.searchParams.get('q')?.trim();
    if (!query) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Query is required' }));
      return;
    }
    const corpusId = url.searchParams.get('corpus') || 'synthetic';
    const selectedCorpus = chatCorpora.get(corpusId);
    if (!selectedCorpus) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Corpus not found' }));
      return;
    }
    const results = search(query, selectedCorpus).slice(0, 5);
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
