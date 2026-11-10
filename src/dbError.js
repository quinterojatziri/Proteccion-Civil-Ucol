'use strict';

// Traduce errores de conexión de MySQL a mensajes comprensibles.
// Con Node reciente, un puerto cerrado produce un AggregateError sin mensaje.
const HINTS = {
  ECONNREFUSED: 'No hay un servidor MySQL escuchando en DB_HOST:DB_PORT. Instala MySQL Server y verifica que el servicio esté iniciado.',
  ER_ACCESS_DENIED_ERROR: 'Usuario o contraseña incorrectos. Revisa DB_USER y DB_PASSWORD en el archivo .env.',
  ER_BAD_DB_ERROR: 'La base de datos no existe. Ejecuta: npm run db:init -- --seed',
  ENOTFOUND: 'No se encontró el servidor. Revisa DB_HOST en el archivo .env.',
  ETIMEDOUT: 'El servidor no respondió a tiempo. Revisa DB_HOST, DB_PORT y el firewall.'
};

function describeDbError(err) {
  const inner = err && err.errors && err.errors[0];
  const code = (err && err.code) || (inner && inner.code) || '';
  const hint = HINTS[code];
  const base = (err && err.message) || (inner && inner.message) || code || 'Error desconocido';
  return hint ? `${hint} (${code})` : base;
}

module.exports = { describeDbError };
