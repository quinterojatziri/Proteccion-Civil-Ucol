'use strict';

const router = require('express').Router();
const pool = require('../db');
const { authenticate, requireRole } = require('../auth');
const { asyncHandler, HttpError, clean, toInt, bad, ok } = require('../http');
const { optionalAuth } = require('../optionalAuth');

const ESTADOS = ['disponible', 'en_servicio', 'no_disponible', 'fuera_de_servicio'];
const STAFF = ['admin', 'tecnico'];

// Búsqueda pública: nunca expone teléfono, correo ni ubicación.
// El personal autorizado (admin, técnico) sí recibe los datos de contacto.
router.get('/buscar', optionalAuth, asyncHandler(async (req, res) => {
  const { nombre, brigada_id, estado, facultad } = req.query;
  const staff = req.user && STAFF.includes(req.user.rol);

  let sql = `SELECT b.id, b.nombre_completo, br.nombre AS brigada_nombre, b.facultad,
                    b.estado_disponibilidad, b.cursos_imparte
                    ${staff ? ', b.email, b.telefono, b.ubicacion_actual' : ''}
             FROM brigadistas b JOIN brigadas br ON br.id = b.brigada_id
             WHERE b.activo = 1`;
  const params = [];

  if (nombre) { sql += ' AND b.nombre_completo LIKE ?'; params.push(`%${clean(nombre, 100)}%`); }
  if (toInt(brigada_id)) { sql += ' AND b.brigada_id = ?'; params.push(toInt(brigada_id)); }
  if (ESTADOS.includes(estado)) { sql += ' AND b.estado_disponibilidad = ?'; params.push(estado); }
  if (facultad) { sql += ' AND b.facultad LIKE ?'; params.push(`%${clean(facultad, 100)}%`); }

  sql += ' ORDER BY b.nombre_completo LIMIT 200';
  const [rows] = await pool.query(sql, params);
  ok(res, rows);
}));

// Mapa. Personal autorizado: posición exacta y datos de contacto.
// Público: solo brigadistas disponibles o en servicio, sin nombre ni contacto
// y con la posición redondeada a una zona de unos 100 m.
const aproximar = (n) => Math.round(n * 1000) / 1000;

router.get('/mapa', optionalAuth, asyncHandler(async (req, res) => {
  const staff = req.user && STAFF.includes(req.user.rol);
  const [rows] = await pool.query(
    `SELECT b.id, b.brigada_id, b.nombre_completo, br.nombre AS brigada_nombre, b.estado_disponibilidad,
            b.latitud, b.longitud, b.ubicacion_actual, b.telefono
     FROM brigadistas b JOIN brigadas br ON br.id = b.brigada_id
     WHERE b.activo = 1 AND b.latitud IS NOT NULL AND b.longitud IS NOT NULL
       ${staff ? '' : "AND b.estado_disponibilidad IN ('disponible','en_servicio')"}
     ORDER BY b.estado_disponibilidad`
  );
  ok(res, staff ? rows : rows.map((b) => ({
    brigada_id: b.brigada_id, brigada_nombre: b.brigada_nombre, estado_disponibilidad: b.estado_disponibilidad,
    latitud: aproximar(b.latitud), longitud: aproximar(b.longitud)
  })));
}));

// Perfil del brigadista autenticado (se vincula por correo).
router.get('/me', authenticate, requireRole('brigadista'), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.nombre_completo, b.email, b.telefono, b.facultad, b.estado_disponibilidad,
            b.ubicacion_actual, b.ubicacion_actualizada, b.cursos_imparte, b.horas_servicio,
            b.fecha_ingreso, br.nombre AS brigada_nombre,
            (SELECT COUNT(*) FROM inscripciones_cursos i
              WHERE i.email = b.email AND i.estatus = 'completada') AS cursos_completados
     FROM brigadistas b JOIN brigadas br ON br.id = b.brigada_id
     WHERE b.email = ? AND b.activo = 1`,
    [req.user.email]
  );
  if (!rows.length) throw new HttpError(404, 'No hay un perfil de brigadista asociado a tu correo');
  ok(res, rows[0]);
}));

// Un brigadista solo puede modificar su propio registro.
router.put('/me/ubicacion', authenticate, requireRole('brigadista'), asyncHandler(async (req, res) => {
  const lat = Number(req.body.latitud);
  const lng = Number(req.body.longitud);
  const estado = req.body.estado;
  const descripcion = clean(req.body.ubicacion, 255);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) bad('Latitud no válida');
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) bad('Longitud no válida');
  if (!ESTADOS.includes(estado)) bad('Estado no válido');

  const [result] = await pool.query(
    `UPDATE brigadistas SET latitud = ?, longitud = ?, ubicacion_actual = ?,
            estado_disponibilidad = ?, ubicacion_actualizada = NOW()
     WHERE email = ? AND activo = 1`,
    [lat, lng, descripcion || null, estado, req.user.email]
  );
  if (!result.affectedRows) throw new HttpError(404, 'No hay un perfil de brigadista asociado a tu correo');
  res.json({ success: true, message: 'Ubicación actualizada' });
}));

router.put('/me/estado', authenticate, requireRole('brigadista'), asyncHandler(async (req, res) => {
  if (!ESTADOS.includes(req.body.estado)) bad('Estado no válido');
  const [result] = await pool.query(
    'UPDATE brigadistas SET estado_disponibilidad = ? WHERE email = ? AND activo = 1',
    [req.body.estado, req.user.email]
  );
  if (!result.affectedRows) throw new HttpError(404, 'No hay un perfil de brigadista asociado a tu correo');
  res.json({ success: true, message: 'Estado actualizado' });
}));

module.exports = router;
