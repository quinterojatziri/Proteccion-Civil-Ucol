'use strict';

const jwt = require('jsonwebtoken');
const pool = require('./db');
const { jwtSecret } = require('./config');

// Si llega un token válido, adjunta req.user; si no, continúa como visitante.
const optionalAuth = async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme === 'Bearer' && token) {
      const payload = jwt.verify(token, jwtSecret);
      const [rows] = await pool.query(
        'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1', [payload.id]
      );
      if (rows.length) req.user = rows[0];
    }
  } catch {
    // Token inválido: se trata como visitante.
  }
  next();
};

module.exports = { optionalAuth };
