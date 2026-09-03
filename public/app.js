const jobsListEl = document.getElementById('jobs-list');
const statusLineEl = document.getElementById('status-line');
const searchInput = document.getElementById('search-input');
const regionInput = document.getElementById('region-input');
const searchButton = document.getElementById('search-button');

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatSalary(job) {
  if (!job.salaryMin && !job.salaryMax) return null;
  if (job.salaryMin && job.salaryMax) {
    return `$${Math.round(job.salaryMin)} - $${Math.round(job.salaryMax)} NZD`;
  }
  return `$${Math.round(job.salaryMin || job.salaryMax)} NZD`;
}

function renderJobs(jobs) {
  jobsListEl.innerHTML = '';

  if (jobs.length === 0) {
    jobsListEl.innerHTML = '<p class="empty-state">No se encontraron avisos con esos filtros.</p>';
    return;
  }

  for (const job of jobs) {
    const card = document.createElement('article');
    card.className = 'job-card';

    const salary = formatSalary(job);
    const isSample = job.source === 'Ejemplo';

    card.innerHTML = `
      <h2><a href="${job.url}" target="_blank" rel="noopener">${job.title}</a></h2>
      <div class="job-meta">${job.company} · ${job.location}${job.postedAt ? ' · ' + formatDate(job.postedAt) : ''}</div>
      <p class="job-desc">${job.description ? job.description.slice(0, 220) + (job.description.length > 220 ? '…' : '') : ''}</p>
      <div class="job-tags">
        ${salary ? `<span class="tag">${salary}</span>` : ''}
        ${job.category ? `<span class="tag">${job.category}</span>` : ''}
        <span class="tag ${isSample ? 'sample' : ''}">${job.source}${isSample ? ' (datos de ejemplo)' : ''}</span>
      </div>
    `;
    jobsListEl.appendChild(card);
  }
}

async function loadJobs() {
  statusLineEl.textContent = 'Cargando avisos...';
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
  if (regionInput.value.trim()) params.set('region', regionInput.value.trim());

  try {
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();

    renderJobs(data.jobs);

    const updated = data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('es-NZ') : 'nunca';
    const sampleNote = data.usingSampleData
      ? ' — mostrando datos de ejemplo (aún no hay API conectada)'
      : '';
    statusLineEl.textContent = `${data.total} avisos encontrados · última actualización: ${updated}${sampleNote}`;
  } catch (err) {
    statusLineEl.textContent = 'Ocurrió un error cargando los avisos. Intenta de nuevo.';
    console.error(err);
  }
}

searchButton.addEventListener('click', loadJobs);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadJobs();
});
regionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadJobs();
});

loadJobs();

// Registrar service worker para capacidades PWA (instalable, funciona offline básico)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('No se pudo registrar el service worker:', err);
    });
  });
}
