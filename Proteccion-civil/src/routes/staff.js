'use strict';

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, requireRole } = require('../auth');
const { asyncHandler, HttpError, clean, isEmail, toInt, bad, ok } = require('../http');

const ROLES = ['admin', 'tecnico', 'brigadista', 'capacitador', 'usuario'];

router.use(['/usuarios', '/solicitudes', '/mensajes', '/emergencias', '/inscripciones', '/panel'], authenticate);

/* ------------------------------ Usuarios ------------------------------ */

router.get('/usuarios', requireRole('admin'), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, activo, fecha_registro FROM usuarios ORDER BY fecha_registro DESC'
  );
  ok(res, rows);
}));

router.post('/usuarios', requireRole('admin'), asyncHandler(async (req, res) => {
  const nombre = clean(req.body.nombre);
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const rol = req.body.rol;

  if (nombre.length < 3) bad('Escribe el nombre completo');
  if (!isEmail(email)) bad('Correo electrónico no válido');
  if (password.length < 8 || password.length > 72) bad('La contraseña debe tener entre 8 y 72 caracteres');
  if (!ROLES.includes(rol)) bad('Rol no válido');

  const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (exists.length) throw new HttpError(409, 'Ese correo ya está registrado');

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  res.status(201).json({ success: true, message: 'Usuario creado', id: result.insertId });
}));

router.patch('/usuarios/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) bad('Usuario no válido');
  if (id === req.user.id) throw new HttpError(400, 'No puedes modificar tu propia cuenta desde aquí');

  const sets = [];
  const params = [];
  if (req.body.rol !== undefined) {
    if (!ROLES.includes(req.body.rol)) bad('Rol no válido');
    sets.push('rol = ?'); params.push(req.body.rol);
  }
  if (req.body.activo !== undefined) {
    sets.push('activo = ?'); params.push(req.body.activo ? 1 : 0);
  }
  if (!sets.length) bad('No hay cambios que aplicar');

  const [result] = await pool.query(`UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  if (!result.affectedRows) throw new HttpError(404, 'Usuario no encontrado');
  res.json({ success: true, message: 'Usuario actualizado' });
}));

router.delete('/usuarios/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) bad('Usuario no válido');
  if (id === req.user.id) throw new HttpError(400, 'No puedes eliminar tu propia cuenta');
  const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  if (!result.affectedRows) throw new HttpError(404, 'Usuario no encontrado');
  res.json({ success: true, message: 'Usuario eliminado' });
}));

/* ------------------------ Solicitudes de brigada ------------------------ */

router.get('/solicitudes', requireRole('admin'), asyncHandler(async (req, res) => {
  const estatus = ['pendiente', 'aceptado', 'rechazado'].includes(req.query.estatus) ? req.query.estatus : null;
  const [rows] = await pool.query(
    `SELECT s.*, b.nombre AS brigada_nombre
     FROM solicitudes_brigadistas s JOIN brigadas b ON b.id = s.brigada_id
     ${estatus ? 'WHERE s.estatus = ?' : ''}
     ORDER BY s.fecha_solicitud DESC LIMIT 200`,
    estatus ? [estatus] : []
  );
  ok(res, rows);
}));

// Al aceptar una solicitud se crea el registro del brigadista.
router.patch('/solicitudes/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const estatus = req.body.estatus;
  if (!id) bad('Solicitud no válida');
  if (!['aceptado', 'rechazado'].includes(estatus)) bad('Estatus no válido');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM solicitudes_brigadistas WHERE id = ? FOR UPDATE', [id]);
    const s = rows[0];
    if (!s) throw new HttpError(404, 'Solicitud no encontrada');
    if (s.estatus !== 'pendiente') throw new HttpError(409, 'La solicitud ya fue resuelta');

    await conn.query('UPDATE solicitudes_brigadistas SET estatus = ? WHERE id = ?', [estatus, id]);
    if (estatus === 'aceptado') {
      await conn.query(
        `INSERT INTO brigadistas (brigada_id, nombre_completo, email, telefono, n_cuenta, facultad, fecha_ingreso)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE brigada_id = VALUES(brigada_id), activo = 1`,
        [s.brigada_id, s.nombre_completo, s.email, s.telefono, s.n_cuenta, s.facultad]
      );
    }
    await conn.commit();
    res.json({ success: true, message: estatus === 'aceptado' ? 'Solicitud aceptada' : 'Solicitud rechazada' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

/* ------------------------------ Mensajes ------------------------------ */

router.get('/mensajes', requireRole('admin'), asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM mensajes_contacto ORDER BY fecha_envio DESC LIMIT 200');
  ok(res, rows);
}));

router.patch('/mensajes/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) bad('Mensaje no válido');
  if (!['leido', 'respondido', 'cerrado'].includes(req.body.estatus)) bad('Estatus no válido');
  const [result] = await pool.query('UPDATE mensajes_contacto SET estatus = ? WHERE id = ?', [req.body.estatus, id]);
  if (!result.affectedRows) throw new HttpError(404, 'Mensaje no encontrado');
  res.json({ success: true, message: 'Mensaje actualizado' });
}));

/* ----------------------------- Emergencias ----------------------------- */

router.get('/emergencias', requireRole('admin', 'tecnico'), asyncHandler(async (req, res) => {
  const soloActivas = req.query.activas === '1';
  const [rows] = await pool.query(
    `SELECT id, folio, nombre_solicitante, telefono, tipo_emergencia, nivel_urgencia, edificio, piso,
            ubicacion_detallada, descripcion, numero_afectados, estatus, fecha_reporte
     FROM emergencias
     ${soloActivas ? "WHERE estatus IN ('reportada','en_camino','atendiendo')" : ''}
     ORDER BY FIELD(nivel_urgencia,'critica','alta','media','baja'), fecha_reporte DESC LIMIT 100`
  );
  ok(res, rows);
}));

router.patch('/emergencias/:id', requireRole('admin', 'tecnico'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const estatus = req.body.estatus;
  if (!id) bad('Emergencia no válida');
  if (!['en_camino', 'atendiendo', 'resuelta', 'cancelada'].includes(estatus)) bad('Estatus no válido');

  const [result] = await pool.query(
    `UPDATE emergencias SET estatus = ?, atendido_por = ?,
       fecha_atencion = IF(fecha_atencion IS NULL AND ? IN ('en_camino','atendiendo'), NOW(), fecha_atencion),
       tiempo_respuesta = IF(tiempo_respuesta IS NULL AND ? IN ('en_camino','atendiendo'),
                             TIMESTAMPDIFF(MINUTE, fecha_reporte, NOW()), tiempo_respuesta),
       fecha_resolucion = IF(? IN ('resuelta','cancelada'), NOW(), fecha_resolucion)
     WHERE id = ?`,
    [estatus, req.user.id, estatus, estatus, estatus, id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Emergencia no encontrada');
  res.json({ success: true, message: 'Emergencia actualizada' });
}));

/* ---------------------------- Inscripciones ---------------------------- */

router.get('/inscripciones', requireRole('admin', 'capacitador'), asyncHandler(async (req, res) => {
  const estatus = ['pendiente', 'confirmada', 'cancelada', 'completada'].includes(req.query.estatus)
    ? req.query.estatus : null;
  const cursoId = toInt(req.query.curso_id);
  const where = [];
  const params = [];
  if (estatus) { where.push('i.estatus = ?'); params.push(estatus); }
  if (cursoId) { where.push('i.curso_id = ?'); params.push(cursoId); }

  const [rows] = await pool.query(
    `SELECT i.id, i.curso_id, i.nombre_completo, i.email, i.telefono, i.carrera, i.estatus,
            i.fecha_inscripcion, c.titulo AS curso_titulo
     FROM inscripciones_cursos i JOIN cursos c ON c.id = i.curso_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY i.fecha_inscripcion DESC LIMIT 300`,
    params
  );
  ok(res, rows);
}));

router.patch('/inscripciones/:id', requireRole('admin', 'capacitador'), asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) bad('Inscripción no válida');
  if (!['confirmada', 'cancelada'].includes(req.body.estatus)) bad('Estatus no válido');
  const [result] = await pool.query(
    `UPDATE inscripciones_cursos SET estatus = ?,
       fecha_confirmacion = IF(? = 'confirmada', NOW(), fecha_confirmacion)
     WHERE id = ? AND estatus = 'pendiente'`,
    [req.body.estatus, req.body.estatus, id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Inscripción no encontrada o ya resuelta');
  res.json({ success: true, message: 'Inscripción actualizada' });
}));

/* ------------------------------ Resúmenes ------------------------------ */

router.get('/panel/admin', requireRole('admin'), asyncHandler(async (req, res) => {
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM usuarios WHERE activo = 1) AS usuarios,
       (SELECT COUNT(*) FROM brigadistas WHERE activo = 1) AS brigadistas,
       (SELECT COUNT(*) FROM emergencias WHERE estatus IN ('reportada','en_camino','atendiendo')) AS emergencias_activas,
       (SELECT COUNT(*) FROM solicitudes_brigadistas WHERE estatus = 'pendiente') AS solicitudes_pendientes,
       (SELECT COUNT(*) FROM mensajes_contacto WHERE estatus = 'nuevo') AS mensajes_nuevos`
  );
  const [actividad] = await pool.query(
    `SELECT * FROM (
       SELECT 'solicitud' AS tipo, CONCAT('Solicitud de ingreso de ', nombre_completo) AS descripcion, fecha_solicitud AS fecha
         FROM solicitudes_brigadistas
       UNION ALL
       SELECT 'inscripcion', CONCAT('Inscripción de ', nombre_completo, ' a un curso'), fecha_inscripcion
         FROM inscripciones_cursos
       UNION ALL
       SELECT 'emergencia', CONCAT('Emergencia ', folio, ' (', tipo_emergencia, ')'), fecha_reporte
         FROM emergencias
       UNION ALL
       SELECT 'mensaje', CONCAT('Mensaje de ', nombre, ': ', asunto), fecha_envio
         FROM mensajes_contacto
     ) a ORDER BY fecha DESC LIMIT 8`
  );
  ok(res, { stats, actividad });
}));

router.get('/panel/tecnico', requireRole('admin', 'tecnico'), asyncHandler(async (req, res) => {
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM emergencias WHERE DATE(fecha_reporte) = CURDATE()) AS emergencias_hoy,
       (SELECT COUNT(*) FROM emergencias WHERE estatus IN ('reportada','en_camino','atendiendo')) AS emergencias_activas,
       (SELECT COUNT(*) FROM brigadistas WHERE activo = 1 AND estado_disponibilidad = 'disponible') AS brigadistas_disponibles,
       (SELECT COUNT(*) FROM brigadistas WHERE activo = 1 AND estado_disponibilidad = 'en_servicio') AS brigadistas_en_servicio,
       (SELECT ROUND(AVG(tiempo_respuesta), 1) FROM emergencias WHERE tiempo_respuesta IS NOT NULL) AS tiempo_respuesta_promedio`
  );
  ok(res, stats);
}));

router.get('/panel/capacitador', requireRole('admin', 'capacitador'), asyncHandler(async (req, res) => {
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM cursos WHERE estatus IN ('programado','inscripciones_abiertas','en_curso')) AS cursos_activos,
       (SELECT COUNT(*) FROM inscripciones_cursos WHERE estatus IN ('confirmada','completada')) AS inscritos,
       (SELECT COUNT(*) FROM inscripciones_cursos WHERE estatus = 'pendiente') AS pendientes,
       (SELECT COUNT(*) FROM inscripciones_cursos WHERE certificado_emitido = 1) AS certificados`
  );
  ok(res, stats);
}));

module.exports = router;
