'use strict';

// Crea las tablas y, con --seed, carga los datos de ejemplo.
//   npm run db:init           -> solo esquema
//   npm run db:init -- --seed -> esquema + datos de ejemplo
//   npm run db:reset          -> BORRA la base, la recrea y carga datos de ejemplo

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { db } = require('../src/config');
const { describeDbError } = require('../src/dbError');

(async () => {
  const conn = await mysql.createConnection({
    host: db.host, port: db.port, user: db.user, password: db.password,
    multipleStatements: true, charset: 'utf8mb4'
  });
  try {
    if (process.argv.includes('--reset')) {
      await conn.query(`DROP DATABASE IF EXISTS \`${db.database}\``);
      console.log(`Base de datos ${db.database} eliminada.`);
    }
    const dir = path.join(__dirname, '..', 'database');
    const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8').replace(/proteccion_civil/g, db.database);
    await conn.query(read('schema.sql'));
    console.log('Esquema aplicado.');
    if (process.argv.includes('--seed') || process.argv.includes('--reset')) {
      await conn.query(read('seed.sql'));
      console.log('Datos de ejemplo cargados.');
    }
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error('No se pudo inicializar la base de datos:', describeDbError(err));
  process.exit(1);
});
