'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const pool = require('../db');
const { asyncHandler, HttpError, clean, isEmail, toInt, bad, ok } = require('../http');

const TIPOS_CONTACTO = ['consulta', 'sugerencia', 'queja', 'felicitacion', 'otro'];
const TIPOS_EMERGENCIA = ['medica', 'incendio', 'evacuacion', 'accidente', 'estructural', 'quimica', 'otra'];
const URGENCIAS = ['baja', 'media', 'alta', 'critica'];

router.get('/novedades', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, titulo, resumen, contenido, categoria, destacado, fecha_publicacion
     FROM novedades WHERE publicado = 1
     ORDER BY destacado DESC, fecha_publicacion DESC LIMIT 20`
  );
  ok(res, rows);
}));

router.get('/brigadas', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.nombre, b.descripcion, b.coordinador, b.email_coordinador,
            b.telefono_coordinador, b.requisitos,
            (SELECT COUNT(*) FROM brigadistas x WHERE x.brigada_id = b.id AND x.activo = 1) AS miembros_activos
     FROM brigadas b WHERE b.activa = 1 ORDER BY b.nombre`
  );
  ok(res, rows);
}));

router.post('/brigadas/:id/solicitudes', asyncHandler(async (req, res) => {
  const brigadaId = toInt(req.params.id);
  const b = req.body;
  const nombre = clean(b.nombre_completo);
  const email = clean(b.email).toLowerCase();
  const telefono = clean(b.telefono, 40);
  const motivacion = clean(b.motivacion, 2000);
  const semestre = toInt(b.semestre);

  if (!brigadaId) bad('Brigada no válida');
  if (nombre.length < 3) bad('Escribe tu nombre completo');
  if (!isEmail(email)) bad('Correo electrónico no válido');
  if (telefono.length < 7) bad('Teléfono no válido');
  if (motivacion.length < 10) bad('Cuéntanos brevemente tu motivación');
  if (semestre !== null && (semestre < 1 || semestre > 14)) bad('Semestre no válido');

  const [brigada] = await pool.query('SELECT id FROM brigadas WHERE id = ? AND activa = 1', [brigadaId]);
  if (!brigada.length) throw new HttpError(404, 'La brigada no existe');

  const [dup] = await pool.query(
    "SELECT id FROM solicitudes_brigadistas WHERE email = ? AND brigada_id = ? AND estatus = 'pendiente'",
    [email, brigadaId]
  );
  if (dup.length) throw new HttpError(409, 'Ya tienes una solicitud pendiente en esta brigada');

  const [result] = await pool.query(
    `INSERT INTO solicitudes_brigadistas
     (brigada_id, nombre_completo, email, telefono, n_cuenta, carrera, facultad, semestre, experiencia_previa, motivacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [brigadaId, nombre, email, telefono, clean(b.n_cuenta, 50) || null, clean(b.carrera) || null,
     clean(b.facultad) || null, semestre, clean(b.experiencia_previa, 2000) || null, motivacion]
  );
  res.status(201).json({ success: true, message: 'Solicitud enviada. Nos pondremos en contacto contigo', id: result.insertId });
}));

// Cupo disponible = cupo máximo - inscripciones vigentes.
router.get('/cursos', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.titulo, c.descripcion, c.duracion_horas, c.cupo_maximo, c.instructor,
            c.modalidad, c.ubicacion, c.fecha_inicio, c.fecha_fin, c.horario, c.costo, c.estatus,
            c.cupo_maximo - COUNT(i.id) AS cupo_disponible
     FROM cursos c
     LEFT JOIN inscripciones_cursos i
       ON i.curso_id = c.id AND i.estatus IN ('pendiente','confirmada','completada')
     WHERE c.estatus IN ('programado','inscripciones_abiertas')
     GROUP BY c.id ORDER BY c.fecha_inicio`
  );
  ok(res, rows);
}));

router.post('/cursos/:id/inscripciones', asyncHandler(async (req, res) => {
  const cursoId = toInt(req.params.id);
  const b = req.body;
  const nombre = clean(b.nombre_completo);
  const email = clean(b.email).toLowerCase();
  const telefono = clean(b.telefono, 40);
  const semestre = toInt(b.semestre);

  if (!cursoId) bad('Curso no válido');
  if (nombre.length < 3) bad('Escribe tu nombre completo');
  if (!isEmail(email)) bad('Correo electrónico no válido');
  if (telefono.length < 7) bad('Teléfono no válido');
  if (semestre !== null && (semestre < 1 || semestre > 14)) bad('Semestre no válido');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cursos] = await conn.query(
      "SELECT id, cupo_maximo, estatus FROM cursos WHERE id = ? FOR UPDATE", [cursoId]
    );
    const curso = cursos[0];
    if (!curso || !['programado', 'inscripciones_abiertas'].includes(curso.estatus)) {
      throw new HttpError(404, 'El curso no está disponible');
    }
    const [[{ ocupados }]] = await conn.query(
      "SELECT COUNT(*) AS ocupados FROM inscripciones_cursos WHERE curso_id = ? AND estatus IN ('pendiente','confirmada','completada')",
      [cursoId]
    );
    if (ocupados >= curso.cupo_maximo) throw new HttpError(409, 'El curso ya no tiene cupo');

    const [dup] = await conn.query(
      "SELECT id FROM inscripciones_cursos WHERE curso_id = ? AND email = ? AND estatus <> 'cancelada'",
      [cursoId, email]
    );
    if (dup.length) throw new HttpError(409, 'Ya estás inscrito en este curso');

    const [result] = await conn.query(
      `INSERT INTO inscripciones_cursos (curso_id, nombre_completo, email, telefono, n_cuenta, carrera, semestre, motivacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cursoId, nombre, email, telefono, clean(b.n_cuenta, 50) || null, clean(b.carrera) || null,
       semestre, clean(b.motivacion, 2000) || null]
    );
    await conn.commit();
    res.status(201).json({ success: true, message: 'Inscripción registrada. Un capacitador la confirmará pronto', id: result.insertId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

router.get('/documentos', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, titulo, descripcion, tipo_documento, archivo_url
     FROM documentos WHERE publico = 1 AND vigente = 1 ORDER BY titulo`
  );
  ok(res, rows);
}));

router.post('/contacto', asyncHandler(async (req, res) => {
  const b = req.body;
  const nombre = clean(b.nombre);
  const email = clean(b.email).toLowerCase();
  const asunto = clean(b.asunto);
  const mensaje = clean(b.mensaje, 4000);
  const tipo = TIPOS_CONTACTO.includes(b.tipo) ? b.tipo : 'consulta';

  if (nombre.length < 2) bad('Escribe tu nombre');
  if (!isEmail(email)) bad('Correo electrónico no válido');
  if (asunto.length < 3) bad('Escribe un asunto');
  if (mensaje.length < 10) bad('El mensaje es demasiado corto');

  await pool.query(
    'INSERT INTO mensajes_contacto (nombre, email, telefono, tipo, asunto, mensaje) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, email, clean(b.telefono, 40) || null, tipo, asunto, mensaje]
  );
  res.status(201).json({ success: true, message: 'Mensaje enviado. Gracias por escribirnos' });
}));

const nuevoFolio = () => {
  const d = new Date();
  const fecha = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `EM-${fecha}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

router.post('/emergencias', asyncHandler(async (req, res) => {
  const b = req.body;
  const nombre = clean(b.nombre_solicitante);
  const telefono = clean(b.telefono, 40);
  const ubicacion = clean(b.ubicacion_detallada, 500);
  const descripcion = clean(b.descripcion, 4000);
  const afectados = toInt(b.numero_afectados) || 1;

  if (nombre.length < 2) bad('Escribe tu nombre');
  if (telefono.length < 7) bad('Escribe un teléfono de contacto');
  if (!TIPOS_EMERGENCIA.includes(b.tipo_emergencia)) bad('Selecciona el tipo de emergencia');
  if (!URGENCIAS.includes(b.nivel_urgencia)) bad('Selecciona el nivel de urgencia');
  if (ubicacion.length < 3) bad('Indica dónde ocurre la emergencia');
  if (descripcion.length < 5) bad('Describe brevemente lo que ocurre');
  if (afectados < 1 || afectados > 10000) bad('Número de personas no válido');
  if (b.email && !isEmail(clean(b.email))) bad('Correo electrónico no válido');

  for (let intento = 0; intento < 3; intento++) {
    const folio = nuevoFolio();
    try {
      await pool.query(
        `INSERT INTO emergencias
         (folio, nombre_solicitante, telefono, email, tipo_emergencia, nivel_urgencia, edificio, piso,
          ubicacion_detallada, descripcion, numero_afectados)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [folio, nombre, telefono, clean(b.email) || null, b.tipo_emergencia, b.nivel_urgencia,
         clean(b.edificio, 100) || null, clean(b.piso, 50) || null, ubicacion, descripcion, afectados]
      );
      return res.status(201).json({
        success: true,
        message: 'Reporte recibido. Mantén tu teléfono disponible.',
        data: { folio, tipo: b.tipo_emergencia, nivel: b.nivel_urgencia }
      });
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') throw err;
    }
  }
  throw new HttpError(500, 'No se pudo generar el folio, intenta de nuevo');
}));

router.get('/estadisticas', asyncHandler(async (req, res) => {
  const [[s]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM brigadas WHERE activa = 1) AS brigadas,
       (SELECT COUNT(*) FROM brigadistas WHERE activo = 1) AS brigadistas,
       (SELECT COUNT(*) FROM cursos WHERE estatus IN ('programado','inscripciones_abiertas')) AS cursos`
  );
  ok(res, s);
}));

module.exports = router;
