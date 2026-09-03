# Trabajos Part-Time NZ

Sitio web (PWA) que junta avisos de trabajos part-time en Nueva Zelanda y los
muestra en español. Se actualiza solo cada cierto tiempo (por defecto cada 3
horas), como un pequeño "scraper" que consulta APIs de trabajo y guarda los
resultados.

## Estado actual

- ✅ Conector de **Adzuna** listo (falta solo poner tus credenciales)
- ⏳ Conector de **TradeMe Jobs** dejado preparado, pendiente de que TradeMe
  apruebe una aplicación (requiere OAuth, ver más abajo)
- ✅ Frontend en español, instalable como app (PWA)
- ✅ Búsqueda por palabra clave y por región/ciudad
- Mientras no haya credenciales configuradas, el sitio muestra 4 avisos de
  **ejemplo** claramente marcados, para que se pueda ver funcionando.

## Cómo correrlo

No usa paquetes externos (todo con Node.js nativo), así que no hace falta
`npm install`.

```
node server.js
```

Después abre `http://localhost:3000` en el navegador.

## Cómo conectar datos reales (Adzuna)

1. Ve a https://developer.adzuna.com/signup y regístrate (gratis).
2. Te van a dar un `app_id` y un `app_key`.
3. Copia el archivo `.env.example` y renómbralo a `.env`.
4. Pega tu `app_id` y `app_key` ahí.
5. Reinicia el servidor (`node server.js`).

El sitio va a empezar a mostrar avisos reales automáticamente, y se va a
volver a actualizar solo cada 3 horas (ajustable con
`REFRESH_INTERVAL_MINUTES` en el `.env`).

## Cómo conectar TradeMe Jobs (más adelante)

TradeMe es más exigente que Adzuna: no basta con una API key, hay que
autenticarse con OAuth y su aplicación debe ser aprobada por TradeMe. Pasos:

1. Crea/usa una cuenta en trademe.co.nz
2. Ve a **My Trade Me → Settings → API Applications** y registra una
   aplicación
3. Copia el Consumer Key y Consumer Secret al `.env`
4. Espera la aprobación de TradeMe para el ambiente de producción
5. Avísame cuando tengas esas credenciales — falta terminar de programar la
   conexión (`lib/trademe.js` tiene el lugar listo, pero la llamada a la API
   con la firma OAuth todavía no está implementada)

## Estructura del proyecto

```
server.js              servidor web (sin librerías externas)
lib/adzuna.js           conecta con la API de Adzuna
lib/trademe.js          conecta con la API de TradeMe (pendiente)
lib/cache.js            junta los avisos de todas las fuentes y los
                         actualiza automáticamente cada cierto tiempo
lib/sample-data.js       avisos de ejemplo que se muestran si no hay
                         credenciales configuradas
public/                 sitio web (HTML/CSS/JS), instalable como PWA
data/jobs-cache.json     copia guardada en disco de los últimos avisos
```

## Próximos pasos posibles

- Conseguir credenciales de Adzuna y probar con datos reales
- Decidir cómo generar ingresos: avisos publicitarios (Google AdSense) o
  cobrar a empresas por destacar sus avisos
- Cuando esté listo para mostrarlo al público, hay que subirlo a un
  servicio de hosting (por ejemplo Render o Railway) porque este espacio de
  trabajo es temporal y no queda disponible como sitio público permanente
