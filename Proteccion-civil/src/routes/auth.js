'use strict';

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken, authenticate } = require('../auth');
const { asyncHandler, HttpError, clean, isEmail, bad } = require('../http');

// Hash ficticio para igualar el tiempo de respuesta cuando el correo no existe.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.0Y1uXh6E0n6cX3V6r3a4wYyH9xKa';

const publicUser = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });

router.post('/login', asyncHandler(async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!isEmail(email) || !password) bad('Correo y contraseña son obligatorios');

  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
  const user = rows[0];
  const match = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !match) throw new HttpError(401, 'Correo o contraseña incorrectos');

  res.json({ success: true, token: signToken(user), user: publicUser(user) });
}));

// El registro público siempre crea cuentas con rol "usuario".
// Los demás roles los asigna un administrador.
router.post('/register', asyncHandler(async (req, res) => {
  const nombre = clean(req.body.nombre);
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (nombre.length < 3) bad('Escribe tu nombre completo');
  if (!isEmail(email)) bad('Correo electrónico no válido');
  if (password.length < 8 || password.length > 72) bad('La contraseña debe tener entre 8 y 72 caracteres');

  const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (exists.length) throw new HttpError(409, 'Ese correo ya está registrado');

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'usuario')",
    [nombre, email, hash]
  );
  res.status(201).json({ success: true, message: 'Cuenta creada. Ya puedes iniciar sesión', id: result.insertId });
}));

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

module.exports = router;
