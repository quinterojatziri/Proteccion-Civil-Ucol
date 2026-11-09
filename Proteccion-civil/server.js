'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./src/config');
const pool = require('./src/db');
const { HttpError } = require('./src/http');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  // OpenStreetMap rechaza los mosaicos del mapa si no recibe el origen de la página.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Proveedores de mosaicos del mapa (ver public/js/pages/busqueda.js).
      imgSrc: ["'self'", 'data:', 'https://server.arcgisonline.com', 'https://tile.openstreetmap.org',
               'https://*.tile.openstreetmap.org', ...config.mapImgHosts],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'self'"],
      upgradeInsecureRequests: null
    }
  }
}));

// Sin CORS_ORIGINS la API solo responde a su propio origen.
app.use(cors({ origin: config.corsOrigins.length ? config.corsOrigins : false }));
app.use(express.json({ limit: '50kb' }));

const limiter = (windowMin, max) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos, espera unos minutos' }
  });

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/auth/login', limiter(15, 15));
app.use('/api/auth/register', limiter(60, 10));
app.use('/api/contacto', limiter(60, 10));
app.use('/api/emergencias', (req, res, next) => (req.method === 'POST' ? limiter(60, 10)(req, res, next) : next()));
app.use('/api/brigadas/:id/solicitudes', limiter(60, 10));
app.use('/api/cursos/:id/inscripciones', limiter(60, 10));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/brigadistas', require('./src/routes/brigadistas'));
app.use('/api', require('./src/routes/public'));
app.use('/api', require('./src/routes/staff'));

app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }));

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON no válido' });
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
});
