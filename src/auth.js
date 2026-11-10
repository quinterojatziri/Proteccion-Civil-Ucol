'use strict';

const jwt = require('jsonwebtoken');
const pool = require('./db');
const { jwtSecret, jwtExpiresIn } = require('./config');
const { HttpError, asyncHandler } = require('./http');

const signToken = (user) =>
  jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });

const readToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

// Valida el token y recarga al usuario desde la base de datos, de modo que
// un cambio de rol o una baja surtan efecto de inmediato.
const authenticate = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) throw new HttpError(401, 'Sesión no iniciada');

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new HttpError(401, 'Sesión inválida o expirada');
  }

  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1',
    [payload.id]
  );
  if (!rows.length) throw new HttpError(401, 'Sesión inválida o expirada');

  req.user = rows[0];
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return next(new HttpError(403, 'No tienes permiso para esta acción'));
  }
  next();
};

module.exports = { signToken, authenticate, requireRole };
