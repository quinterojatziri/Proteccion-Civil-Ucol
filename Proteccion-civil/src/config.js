'use strict';

require('dotenv').config();

const crypto = require('crypto');
const env = process.env;
const isProd = env.NODE_ENV === 'production';

let jwtSecret = env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) {
    throw new Error('JWT_SECRET es obligatorio cuando NODE_ENV=production.');
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[config] JWT_SECRET no definido: se usa un secreto temporal. Las sesiones se pierden al reiniciar.');
}

module.exports = {
  isProd,
  port: Number(env.PORT) || 3000,
  jwtSecret,
  jwtExpiresIn: env.JWT_EXPIRES_IN || '8h',
  // Dominios adicionales de mosaicos de mapa permitidos por la política de seguridad.
  mapImgHosts: (env.MAP_IMG_HOSTS || '').split(',').map((s) => s.trim()).filter((s) => /^https:\/\/[\w.*-]+(:\d+)?$/.test(s)),
  corsOrigins: (env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    host: env.DB_HOST || env.MYSQLHOST || 'localhost',
    port: Number(env.DB_PORT || env.MYSQLPORT) || 3306,
    user: env.DB_USER || env.MYSQLUSER || 'root',
    password: env.DB_PASSWORD || env.MYSQLPASSWORD || '',
    database: env.DB_NAME || env.MYSQLDATABASE || 'proteccion_civil'
  }
};
