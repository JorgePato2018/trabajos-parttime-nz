// Cliente HTTP que funciona tanto en este espacio de trabajo en la nube
// (que exige pasar por un proxy HTTPS para acceder a internet) como en
// cualquier otro lugar donde se despliegue el sitio más adelante (donde
// normalmente no hay proxy y basta con el `fetch` normal de Node).
//
// No depende de paquetes externos (npm está bloqueado en este entorno),
// así que el túnel HTTPS a través del proxy está armado a mano con los
// módulos nativos de Node (http/https/tls).

const http = require('http');
const https = require('https');
const tls = require('tls');
const { URL } = require('url');

function getProxyUrl() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  return proxy ? new URL(proxy) : null;
}

function fetchViaProxy(targetUrl, proxyUrl, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(targetUrl);

    const connectReq = http.request({
      host: proxyUrl.hostname,
      port: proxyUrl.port,
      method: 'CONNECT',
      path: `${target.hostname}:443`,
      timeout: timeoutMs,
    });

    connectReq.on('timeout', () => {
      connectReq.destroy(new Error('Tiempo de espera agotado conectando al proxy'));
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        reject(new Error(`El proxy rechazó la conexión (status ${res.statusCode})`));
        return;
      }

      const tlsSocket = tls.connect({ socket, servername: target.hostname }, () => {
        const req = https.request(
          {
            createConnection: () => tlsSocket,
            hostname: target.hostname,
            path: target.pathname + target.search,
            method: 'GET',
            headers: { host: target.hostname, accept: 'application/json' },
          },
          (res2) => {
            let data = '';
            res2.on('data', (chunk) => (data += chunk));
            res2.on('end', () => resolve({ statusCode: res2.statusCode, body: data }));
          }
        );
        req.on('error', reject);
        req.end();
      });
      tlsSocket.on('error', reject);
    });

    connectReq.on('error', reject);
    connectReq.end();
  });
}

async function fetchViaDirectFetch(targetUrl) {
  const response = await fetch(targetUrl);
  const body = await response.text();
  return { statusCode: response.status, body };
}

// Devuelve { statusCode, body } igual que una respuesta HTTP simple.
async function fetchJson(targetUrl) {
  const proxyUrl = getProxyUrl();
  const result = proxyUrl
    ? await fetchViaProxy(targetUrl, proxyUrl)
    : await fetchViaDirectFetch(targetUrl);

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`Respuesta ${result.statusCode}: ${result.body.slice(0, 300)}`);
  }

  return JSON.parse(result.body);
}

module.exports = { fetchJson };
