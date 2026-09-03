// Maneja la actualización periódica ("scraper") de avisos de trabajo,
// combinando todas las fuentes configuradas y guardando el resultado tanto
// en memoria como en un archivo JSON en disco (para que sobreviva reinicios
// del servidor).

const fs = require('fs');
const path = require('path');
const { fetchAdzunaJobs, isConfigured: adzunaConfigured } = require('./adzuna');
const { fetchTradeMeJobs, isConfigured: trademeConfigured } = require('./trademe');
const { sampleJobs } = require('./sample-data');

const CACHE_FILE = path.join(__dirname, '..', 'data', 'jobs-cache.json');
const REFRESH_INTERVAL_MS = Number(process.env.REFRESH_INTERVAL_MINUTES || 180) * 60 * 1000; // 3 horas por defecto

let state = {
  jobs: [],
  lastUpdated: null,
  sources: {
    adzuna: { configured: false, count: 0, error: null },
    trademe: { configured: false, count: 0, error: null },
  },
  usingSampleData: true,
};

function dedupe(jobs) {
  const seen = new Set();
  const result = [];
  for (const job of jobs) {
    if (seen.has(job.id)) continue;
    seen.add(job.id);
    result.push(job);
  }
  return result;
}

function persistToDisk() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('[cache] no se pudo guardar en disco:', err.message);
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      state = JSON.parse(raw);
    }
  } catch (err) {
    console.error('[cache] no se pudo leer el cache de disco:', err.message);
  }
}

async function refresh() {
  console.log('[cache] actualizando avisos de trabajo...');
  const collected = [];
  const sourcesStatus = {
    adzuna: { configured: adzunaConfigured(), count: 0, error: null },
    trademe: { configured: trademeConfigured(), count: 0, error: null },
  };

  try {
    const { jobs } = await fetchAdzunaJobs({ pages: 3 });
    sourcesStatus.adzuna.count = jobs.length;
    collected.push(...jobs);
  } catch (err) {
    sourcesStatus.adzuna.error = err.message;
    console.error('[cache] error consultando Adzuna:', err.message);
  }

  try {
    const { jobs } = await fetchTradeMeJobs();
    sourcesStatus.trademe.count = jobs.length;
    collected.push(...jobs);
  } catch (err) {
    sourcesStatus.trademe.error = err.message;
    console.error('[cache] error consultando TradeMe:', err.message);
  }

  const usingSampleData = collected.length === 0;
  const jobs = dedupe(usingSampleData ? sampleJobs : collected);

  state = {
    jobs,
    lastUpdated: new Date().toISOString(),
    sources: sourcesStatus,
    usingSampleData,
  };

  persistToDisk();
  console.log(
    `[cache] listo: ${jobs.length} avisos (${usingSampleData ? 'datos de ejemplo' : 'datos reales'})`
  );
  return state;
}

function getState() {
  return state;
}

function startAutoRefresh() {
  loadFromDisk();
  refresh(); // primera carga inmediata
  setInterval(refresh, REFRESH_INTERVAL_MS);
  console.log(
    `[cache] auto-actualización cada ${REFRESH_INTERVAL_MS / 60000} minutos`
  );
}

module.exports = { startAutoRefresh, refresh, getState };
