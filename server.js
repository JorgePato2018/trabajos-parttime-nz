const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { loadEnv } = require('./lib/env');
loadEnv();

const { startAutoRefresh, getState, refresh } = require('./lib/cache');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // seguridad básica: no salir de la carpeta public
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Prohibido');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function filterJobs(jobs, params) {
  let result = jobs;

  const q = (params.get('q') || '').trim().toLowerCase();
  if (q) {
    result = result.filter((job) =>
      [job.title, job.company, job.description, job.category]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }

  const region = (params.get('region') || '').trim().toLowerCase();
  if (region) {
    result = result.filter((job) => (job.location || '').toLowerCase().includes(region));
  }

  return result;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/jobs') {
    const state = getState();
    const filtered = filterJobs(state.jobs, url.searchParams);
    sendJson(res, 200, {
      total: filtered.length,
      lastUpdated: state.lastUpdated,
      usingSampleData: state.usingSampleData,
      sources: state.sources,
      jobs: filtered,
    });
    return;
  }

  if (url.pathname === '/api/status') {
    const state = getState();
    sendJson(res, 200, {
      lastUpdated: state.lastUpdated,
      usingSampleData: state.usingSampleData,
      sources: state.sources,
      totalJobs: state.jobs.length,
    });
    return;
  }

  if (url.pathname === '/api/refresh' && req.method === 'POST') {
    // permite forzar una actualización manual (útil para pruebas)
    const state = await refresh();
    sendJson(res, 200, { ok: true, totalJobs: state.jobs.length });
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  startAutoRefresh();
});
