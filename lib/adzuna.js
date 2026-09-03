// Conector para la API de Adzuna (https://developer.adzuna.com)
// Requiere ADZUNA_APP_ID y ADZUNA_APP_KEY en el archivo .env

const { fetchJson } = require('./http-client');

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/nz/search';

function isConfigured() {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

// Normaliza un resultado de Adzuna al formato común que usa el sitio
function normalize(job) {
  return {
    id: `adzuna-${job.id}`,
    source: 'Adzuna',
    title: job.title ? job.title.replace(/<[^>]+>/g, '') : 'Sin título',
    company: job.company && job.company.display_name ? job.company.display_name : 'No especificado',
    location: job.location && job.location.display_name ? job.location.display_name : 'Nueva Zelanda',
    description: job.description ? job.description.replace(/<[^>]+>/g, '') : '',
    url: job.redirect_url || '',
    salaryMin: job.salary_min || null,
    salaryMax: job.salary_max || null,
    contractTime: job.contract_time || null, // 'part_time' | 'full_time'
    postedAt: job.created || null,
    category: job.category && job.category.label ? job.category.label : null,
  };
}

// Busca trabajos part-time en Adzuna NZ. `pages` controla cuántas páginas de
// resultados se piden (cada página trae hasta `resultsPerPage` avisos).
async function fetchAdzunaJobs({ what = '', pages = 3, resultsPerPage = 50 } = {}) {
  if (!isConfigured()) {
    return { configured: false, jobs: [] };
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const allJobs = [];

  for (let page = 1; page <= pages; page++) {
    const url = new URL(`${BASE_URL}/${page}`);
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('results_per_page', String(resultsPerPage));
    url.searchParams.set('part_time', '1'); // 'contract_time=part_time' devuelve error 400 en esta API
    url.searchParams.set('content-type', 'application/json');
    if (what) url.searchParams.set('what', what);

    let data;
    try {
      data = await fetchJson(url.toString());
    } catch (err) {
      console.error('[adzuna] error consultando la API:', err.message);
      break;
    }

    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) break;
    allJobs.push(...results.map(normalize));
  }

  return { configured: true, jobs: allJobs };
}

module.exports = { fetchAdzunaJobs, isConfigured };
