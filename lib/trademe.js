// Conector para la API de TradeMe Jobs (https://developer.trademe.co.nz)
//
// TradeMe requiere autenticación OAuth 1.0a con una aplicación registrada y
// aprobada (Consumer Key + Consumer Secret), a diferencia de Adzuna que solo
// pide una app_id/app_key. Este archivo queda listo para activarse apenas
// Jorge tenga esas credenciales — por ahora, si no están configuradas,
// simplemente no aporta avisos (no rompe el sitio).
//
// Pasos para conseguir las credenciales (una sola vez, los hace Jorge):
// 1. Crear/usar una cuenta en trademe.co.nz
// 2. Ir a My Trade Me → Settings → API Applications y registrar una app
// 3. Copiar el Consumer Key y Consumer Secret al archivo .env
// 4. Esperar la aprobación de TradeMe para el ambiente de producción

function isConfigured() {
  return Boolean(
    process.env.TRADEME_CONSUMER_KEY && process.env.TRADEME_CONSUMER_SECRET
  );
}

async function fetchTradeMeJobs() {
  if (!isConfigured()) {
    return { configured: false, jobs: [] };
  }

  // TODO: implementar la firma OAuth 1.0a y llamar a
  // https://api.trademe.co.nz/v1/Search/Jobs.json cuando Jorge tenga las
  // credenciales aprobadas. Lo dejamos pendiente para no bloquear el resto
  // del sitio mientras tanto.
  console.warn('[trademe] credenciales encontradas pero el conector aún no está implementado');
  return { configured: true, jobs: [] };
}

module.exports = { fetchTradeMeJobs, isConfigured };
