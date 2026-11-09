'use strict';

// Crea o actualiza un usuario sin tocar a los demás.
//   npm run user:create -- --email admin@ejemplo.mx --nombre "Nombre Apellido" --rol admin [--password ...]
// Si no se indica contraseña se genera una aleatoria y se muestra una sola vez.
//   npm run user:create -- --demo   crea cuentas de prueba (solo fuera de producción)

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../src/db');
const config = require('../src/config');
const { describeDbError } = require('../src/dbError');

const ROLES = ['admin', 'tecnico', 'brigadista', 'capacitador', 'usuario'];

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function upsert({ nombre, email, rol, password }) {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), password = VALUES(password), rol = VALUES(rol), activo = 1`,
    [nombre, email.toLowerCase(), hash, rol]
  );
}

(async () => {
  if (process.argv.includes('--demo')) {
    if (config.isProd) throw new Error('Las cuentas de demostración no se crean en producción.');
    const password = 'Demo1234!';
    const demo = [
      ['Administración Demo', 'admin@demo.local', 'admin'],
      ['Técnico Demo', 'tecnico@demo.local', 'tecnico'],
      ['Brigadista Demo', 'brigadista@demo.local', 'brigadista'],
      ['Capacitación Demo', 'capacitador@demo.local', 'capacitador'],
      ['Usuario Demo', 'usuario@demo.local', 'usuario']
    ];
    for (const [nombre, email, rol] of demo) await upsert({ nombre, email, rol, password });
    console.log(`Cuentas de demostración creadas. Contraseña común: ${password}`);
    return;
  }

  const email = arg('email');
  const nombre = arg('nombre');
  const rol = arg('rol') || 'usuario';
  if (!email || !nombre) throw new Error('Uso: --email <correo> --nombre "<nombre>" --rol <rol> [--password <clave>]');
  if (!ROLES.includes(rol)) throw new Error(`Rol no válido. Opciones: ${ROLES.join(', ')}`);

  const password = arg('password') || crypto.randomBytes(9).toString('base64url');
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
  await upsert({ nombre, email, rol, password });
  console.log(`Usuario ${email} (${rol}) listo.`);
  if (!arg('password')) console.log(`Contraseña generada (guárdala, no se volverá a mostrar): ${password}`);
})()
  .catch((err) => { console.error(describeDbError(err)); process.exitCode = 1; })
  .finally(() => pool.end());
