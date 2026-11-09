// Backend de demostración que corre en el navegador. Replica los endpoints de
// la API real con datos ficticios y guarda los cambios en localStorage, de modo
// que el sitio completo pueda explorarse en un hosting estático (GitHub Pages).
// No es seguridad real: cualquier persona puede inspeccionar estos datos.
window.PC = window.PC || {};

PC.demo = (function () {
  const KEY = 'pc_demo_v1';
  const DEMO_PASSWORD = 'Demo1234!';

  const day = (n) => new Date(Date.now() + n * 86400000).toISOString();
  const date = (n) => day(n).slice(0, 10);

  function seed() {
    const contact = {
      coordinador_email: window.PC_CONFIG.contacto.email,
      tel: window.PC_CONFIG.contacto.telefono
    };
    const brig = (id, nombre, descripcion, coord, requisitos) => ({
      id, nombre, descripcion, coordinador: coord, email_coordinador: contact.coordinador_email,
      telefono_coordinador: contact.tel, requisitos
    });
    return {
      seq: 100,
      usuarios: [
        { id: 1, nombre: 'Administración Demo', email: 'admin@demo.local', password: DEMO_PASSWORD, rol: 'admin', activo: 1, fecha_registro: day(-90) },
        { id: 2, nombre: 'Técnico Demo', email: 'tecnico@demo.local', password: DEMO_PASSWORD, rol: 'tecnico', activo: 1, fecha_registro: day(-80) },
        { id: 3, nombre: 'Brigadista Demo', email: 'brigadista@demo.local', password: DEMO_PASSWORD, rol: 'brigadista', activo: 1, fecha_registro: day(-70) },
        { id: 4, nombre: 'Capacitación Demo', email: 'capacitador@demo.local', password: DEMO_PASSWORD, rol: 'capacitador', activo: 1, fecha_registro: day(-60) },
        { id: 5, nombre: 'Usuario Demo', email: 'usuario@demo.local', password: DEMO_PASSWORD, rol: 'usuario', activo: 1, fecha_registro: day(-30) }
      ],
      brigadas: [
        brig(1, 'Brigada de Primeros Auxilios', 'Atención básica y estabilización de personas lesionadas o en crisis dentro de las instalaciones universitarias.', 'Coordinación de Primeros Auxilios', 'Curso básico de primeros auxilios; disponibilidad de tiempo; compromiso de capacitación continua.'),
        brig(2, 'Brigada de Evacuación', 'Coordinación del desalojo ordenado de inmuebles y conducción de las personas a los puntos de reunión.', 'Coordinación de Evacuación', 'Conocimiento de las instalaciones; capacidad de liderazgo; disponibilidad inmediata.'),
        brig(3, 'Brigada Contra Incendios', 'Prevención, detección y control de conatos de incendio, y capacitación en el uso de extintores.', 'Coordinación Contra Incendios', 'Curso de combate de incendios; buena condición física.'),
        brig(4, 'Brigada de Comunicación', 'Difusión de información oficial durante emergencias y enlace con autoridades externas.', 'Coordinación de Comunicación', 'Habilidades de comunicación; manejo de redes sociales; disponibilidad de dispositivo móvil.'),
        brig(5, 'Brigada de Búsqueda y Rescate', 'Localización y rescate de personas en situaciones de emergencia dentro de las instalaciones.', 'Coordinación de Búsqueda y Rescate', 'Excelente condición física; curso básico de rescate.')
      ],
      brigadistas: [
        { id: 1, brigada_id: 1, nombre_completo: 'Brigadista de Ejemplo', email: 'brigadista@demo.local', telefono: '3120000001', facultad: 'Medicina', estado_disponibilidad: 'disponible', latitud: 19.2452, longitud: -103.7241, ubicacion_actual: 'Edificio de Rectoría', ubicacion_actualizada: day(-1), cursos_imparte: 'Primeros Auxilios Básico', horas_servicio: 64, fecha_ingreso: date(-400), activo: 1 },
        { id: 2, brigada_id: 2, nombre_completo: 'Persona Voluntaria Uno', email: 'voluntaria1@demo.local', telefono: '3120000002', facultad: 'Ingeniería', estado_disponibilidad: 'en_servicio', latitud: 19.2446, longitud: -103.7233, ubicacion_actual: 'Explanada principal', ubicacion_actualizada: day(-1), cursos_imparte: null, horas_servicio: 40, fecha_ingreso: date(-300), activo: 1 },
        { id: 3, brigada_id: 3, nombre_completo: 'Persona Voluntaria Dos', email: 'voluntaria2@demo.local', telefono: '3120000003', facultad: 'Química', estado_disponibilidad: 'disponible', latitud: 19.2461, longitud: -103.725, ubicacion_actual: 'Laboratorios', ubicacion_actualizada: day(-2), cursos_imparte: null, horas_servicio: 22, fecha_ingreso: date(-150), activo: 1 },
        { id: 4, brigada_id: 5, nombre_completo: 'Persona Voluntaria Tres', email: 'voluntaria3@demo.local', telefono: '3120000004', facultad: 'Derecho', estado_disponibilidad: 'no_disponible', latitud: 19.2439, longitud: -103.7248, ubicacion_actual: null, ubicacion_actualizada: null, cursos_imparte: null, horas_servicio: 12, fecha_ingreso: date(-90), activo: 1 }
      ],
      solicitudes: [
        { id: 1, brigada_id: 1, nombre_completo: 'Solicitante de Ejemplo', email: 'solicitante@demo.local', telefono: '3125550101', carrera: 'Enfermería', facultad: 'Medicina', semestre: 3, experiencia_previa: 'Curso de RCP.', motivacion: 'Quiero apoyar a mi comunidad universitaria.', estatus: 'pendiente', fecha_solicitud: day(-2) }
      ],
      cursos: [
        { id: 1, titulo: 'Primeros Auxilios Básico', descripcion: 'Curso teórico-práctico de técnicas básicas de primeros auxilios, reanimación cardiopulmonar y uso de desfibrilador externo automático.', duracion_horas: 20, cupo_maximo: 30, instructor: 'Instructor por asignar', modalidad: 'presencial', ubicacion: 'Campus Central', fecha_inicio: date(21), fecha_fin: date(35), horario: 'Lunes a viernes, 16:00 a 18:00', costo: 0, estatus: 'inscripciones_abiertas' },
        { id: 2, titulo: 'Combate de Incendios, Nivel I', descripcion: 'Prevención, detección y control de conatos de incendio con prácticas de uso de extintores.', duracion_horas: 16, cupo_maximo: 25, instructor: 'Instructor por asignar', modalidad: 'presencial', ubicacion: 'Campus Central', fecha_inicio: date(45), fecha_fin: date(60), horario: 'Martes y jueves, 15:00 a 17:00', costo: 0, estatus: 'programado' },
        { id: 3, titulo: 'Evacuación y Puntos de Reunión', descripcion: 'Protocolos y técnicas para la evacuación segura de edificios.', duracion_horas: 12, cupo_maximo: 40, instructor: 'Instructor por asignar', modalidad: 'hibrido', ubicacion: 'Campus Central', fecha_inicio: date(50), fecha_fin: date(58), horario: 'Miércoles y viernes, 17:00 a 19:00', costo: 0, estatus: 'programado' }
      ],
      inscripciones: [
        { id: 1, curso_id: 1, nombre_completo: 'Estudiante de Ejemplo', email: 'estudiante1@demo.local', telefono: '3125550102', carrera: 'Psicología', estatus: 'confirmada', certificado_emitido: 0, fecha_inscripcion: day(-5) },
        { id: 2, curso_id: 1, nombre_completo: 'Estudiante de Ejemplo Dos', email: 'estudiante2@demo.local', telefono: '3125550103', carrera: 'Derecho', estatus: 'pendiente', certificado_emitido: 0, fecha_inscripcion: day(-1) }
      ],
      documentos: [
        { id: 1, titulo: 'Ley General de Protección Civil', descripcion: 'Legislación federal en materia de protección civil.', tipo_documento: 'protocolo', archivo_url: 'docs/LGPC.pdf' },
        { id: 2, titulo: 'Ley de Protección Civil del Estado de Colima', descripcion: 'Marco legal de protección civil en el estado de Colima.', tipo_documento: 'protocolo', archivo_url: 'docs/LeyPCestadodeColima.pdf' }
      ],
      novedades: [
        { id: 1, titulo: 'Convocatoria al curso de Primeros Auxilios Básico', resumen: 'Abrimos inscripciones para el curso de primeros auxilios nivel básico.', contenido: 'Se abre la convocatoria para el curso de Primeros Auxilios Básico. El cupo es limitado y las inscripciones se realizan desde la sección de cursos de este sitio.', categoria: 'aviso', destacado: 1, fecha_publicacion: day(-2) },
        { id: 2, titulo: 'Registro abierto para nuevos brigadistas', resumen: 'Si formas parte de la comunidad universitaria puedes solicitar tu ingreso a una brigada.', contenido: 'Las brigadas de Primeros Auxilios, Evacuación, Contra Incendios, Comunicación y Búsqueda y Rescate reciben solicitudes durante todo el año. Consulta los requisitos de cada una en la sección de brigadas.', categoria: 'noticia', destacado: 0, fecha_publicacion: day(-9) },
        { id: 3, titulo: 'Participación en simulacros', resumen: 'Recuerda conocer las rutas de evacuación y los puntos de reunión de tu plantel.', contenido: 'La participación de toda la comunidad universitaria en los simulacros es fundamental para reducir riesgos. Identifica la ruta de evacuación y el punto de reunión de tu edificio.', categoria: 'comunicado', destacado: 0, fecha_publicacion: day(-20) }
      ],
      mensajes: [
        { id: 1, nombre: 'Persona de Ejemplo', email: 'contacto@demo.local', telefono: null, tipo: 'consulta', asunto: '¿Cómo me uno a una brigada?', mensaje: 'Quisiera información sobre cómo ser parte de una brigada.', estatus: 'nuevo', fecha_envio: day(-3) }
      ],
      emergencias: [
        { id: 1, folio: 'EM-DEMO-0001', nombre_solicitante: 'Reporte de ejemplo', telefono: '3125550199', tipo_emergencia: 'medica', nivel_urgencia: 'media', edificio: 'Edificio A', piso: 'Planta baja', ubicacion_detallada: 'Pasillo principal (dato ficticio)', descripcion: 'Persona con mareo, consciente. Reporte ficticio de demostración.', numero_afectados: 1, estatus: 'reportada', tiempo_respuesta: null, fecha_reporte: day(0) }
      ]
    };
  }

  let state = null;
  function load() {
    if (state) return state;
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
    if (!state) state = seed();
    return state;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ }
  }
  const nextId = () => ++load().seq;

  const fail = (status, message) => { throw new PC.ApiError(message, status); };
  const trim = (v, max = 255) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
  const ok = (data, extra) => Object.assign({ success: true, data }, extra);
  const ACTIVE_EMERGENCY = ['reportada', 'en_camino', 'atendiendo'];
  const OCCUPIED = ['pendiente', 'confirmada', 'completada'];
  const ROLES = ['admin', 'tecnico', 'brigadista', 'capacitador', 'usuario'];

  function sessionUser(token) {
    if (!token || !token.startsWith('demo.')) return null;
    const id = Number(token.slice(5));
    return load().usuarios.find((u) => u.id === id && u.activo) || null;
  }
  const pub = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });

  function need(me, ...roles) {
    if (!me) fail(401, 'Sesión no iniciada');
    if (!roles.includes(me.rol)) fail(403, 'No tienes permiso para esta acción');
  }

  const cupoDisponible = (c) =>
    c.cupo_maximo - load().inscripciones.filter((i) => i.curso_id === c.id && OCCUPIED.includes(i.estatus)).length;

  /* ---------------------- Tabla de rutas ---------------------- */
  const routes = [];
  const route = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern + '$'), fn });

  // Autenticación
  route('POST', '/auth/login', ({ body }) => {
    const email = trim(body.email).toLowerCase();
    const u = load().usuarios.find((x) => x.email === email && x.activo);
    if (!u || u.password !== body.password) fail(401, 'Correo o contraseña incorrectos');
    return { success: true, token: 'demo.' + u.id, user: pub(u) };
  });
  route('POST', '/auth/register', ({ body }) => {
    const nombre = trim(body.nombre), email = trim(body.email).toLowerCase(), password = body.password || '';
    if (nombre.length < 3) fail(400, 'Escribe tu nombre completo');
    if (!isEmail(email)) fail(400, 'Correo electrónico no válido');
    if (password.length < 8) fail(400, 'La contraseña debe tener al menos 8 caracteres');
    const s = load();
    if (s.usuarios.some((u) => u.email === email)) fail(409, 'Ese correo ya está registrado');
    s.usuarios.push({ id: nextId(), nombre, email, password, rol: 'usuario', activo: 1, fecha_registro: day(0) });
    persist();
    return { success: true, message: 'Cuenta creada. Ya puedes iniciar sesión' };
  });
  route('GET', '/auth/me', ({ me }) => { need(me, ...ROLES); return { success: true, user: pub(me) }; });

  // Contenido público
  route('GET', '/novedades', () => ok(load().novedades.slice().sort((a, b) => b.destacado - a.destacado || new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))));
  route('GET', '/brigadas', () => ok(load().brigadas.map((b) => ({
    ...b, miembros_activos: load().brigadistas.filter((x) => x.brigada_id === b.id && x.activo).length
  }))));
  route('GET', '/cursos', () => ok(load().cursos
    .filter((c) => ['programado', 'inscripciones_abiertas'].includes(c.estatus))
    .map((c) => ({ ...c, cupo_disponible: cupoDisponible(c) }))));
  route('GET', '/documentos', () => ok(load().documentos));
  route('GET', '/estadisticas', () => {
    const s = load();
    return ok({
      brigadas: s.brigadas.length,
      brigadistas: s.brigadistas.filter((b) => b.activo).length,
      cursos: s.cursos.filter((c) => ['programado', 'inscripciones_abiertas'].includes(c.estatus)).length
    });
  });

  route('POST', '/brigadas/(\\d+)/solicitudes', ({ m, body }) => {
    const s = load();
    const brigadaId = Number(m[1]);
    if (!s.brigadas.some((b) => b.id === brigadaId)) fail(404, 'La brigada no existe');
    const nombre = trim(body.nombre_completo), email = trim(body.email).toLowerCase();
    if (nombre.length < 3) fail(400, 'Escribe tu nombre completo');
    if (!isEmail(email)) fail(400, 'Correo electrónico no válido');
    if (trim(body.telefono, 40).length < 7) fail(400, 'Teléfono no válido');
    if (trim(body.motivacion, 2000).length < 10) fail(400, 'Cuéntanos brevemente tu motivación');
    if (s.solicitudes.some((x) => x.email === email && x.brigada_id === brigadaId && x.estatus === 'pendiente')) {
      fail(409, 'Ya tienes una solicitud pendiente en esta brigada');
    }
    s.solicitudes.push({
      id: nextId(), brigada_id: brigadaId, nombre_completo: nombre, email, telefono: trim(body.telefono, 40),
      n_cuenta: trim(body.n_cuenta, 50) || null, carrera: trim(body.carrera) || null, facultad: trim(body.facultad) || null,
      semestre: Number(body.semestre) || null, experiencia_previa: trim(body.experiencia_previa, 2000) || null,
      motivacion: trim(body.motivacion, 2000), estatus: 'pendiente', fecha_solicitud: day(0)
    });
    persist();
    return { success: true, message: 'Solicitud enviada (demostración). No se notificó a nadie' };
  });

  route('POST', '/cursos/(\\d+)/inscripciones', ({ m, body }) => {
    const s = load();
    const curso = s.cursos.find((c) => c.id === Number(m[1]));
    if (!curso) fail(404, 'El curso no está disponible');
    const nombre = trim(body.nombre_completo), email = trim(body.email).toLowerCase();
    if (nombre.length < 3) fail(400, 'Escribe tu nombre completo');
    if (!isEmail(email)) fail(400, 'Correo electrónico no válido');
    if (trim(body.telefono, 40).length < 7) fail(400, 'Teléfono no válido');
    if (cupoDisponible(curso) <= 0) fail(409, 'El curso ya no tiene cupo');
    if (s.inscripciones.some((i) => i.curso_id === curso.id && i.email === email && i.estatus !== 'cancelada')) {
      fail(409, 'Ya estás inscrito en este curso');
    }
    s.inscripciones.push({
      id: nextId(), curso_id: curso.id, nombre_completo: nombre, email, telefono: trim(body.telefono, 40),
      carrera: trim(body.carrera) || null, estatus: 'pendiente', certificado_emitido: 0, fecha_inscripcion: day(0)
    });
    persist();
    return { success: true, message: 'Inscripción registrada (demostración). No se notificó a nadie' };
  });

  route('POST', '/contacto', ({ body }) => {
    const nombre = trim(body.nombre), email = trim(body.email).toLowerCase(), asunto = trim(body.asunto), mensaje = trim(body.mensaje, 4000);
    if (nombre.length < 2) fail(400, 'Escribe tu nombre');
    if (!isEmail(email)) fail(400, 'Correo electrónico no válido');
    if (asunto.length < 3) fail(400, 'Escribe un asunto');
    if (mensaje.length < 10) fail(400, 'El mensaje es demasiado corto');
    load().mensajes.push({ id: nextId(), nombre, email, telefono: trim(body.telefono, 40) || null, tipo: body.tipo || 'consulta', asunto, mensaje, estatus: 'nuevo', fecha_envio: day(0) });
    persist();
    return { success: true, message: 'Mensaje registrado (demostración). No se envió a Protección Civil' };
  });

  route('POST', '/emergencias', ({ body }) => {
    const nombre = trim(body.nombre_solicitante), telefono = trim(body.telefono, 40);
    if (nombre.length < 2) fail(400, 'Escribe tu nombre');
    if (telefono.length < 7) fail(400, 'Escribe un teléfono de contacto');
    if (!body.tipo_emergencia) fail(400, 'Selecciona el tipo de emergencia');
    if (trim(body.ubicacion_detallada, 500).length < 3) fail(400, 'Indica dónde ocurre la emergencia');
    if (trim(body.descripcion, 4000).length < 5) fail(400, 'Describe brevemente lo que ocurre');
    const s = load();
    const id = nextId();
    const folio = 'EM-DEMO-' + String(id).padStart(4, '0');
    s.emergencias.push({
      id, folio, nombre_solicitante: nombre, telefono, tipo_emergencia: body.tipo_emergencia,
      nivel_urgencia: body.nivel_urgencia || 'media', edificio: trim(body.edificio, 100) || null, piso: trim(body.piso, 50) || null,
      ubicacion_detallada: trim(body.ubicacion_detallada, 500), descripcion: trim(body.descripcion, 4000),
      numero_afectados: Number(body.numero_afectados) || 1, estatus: 'reportada', tiempo_respuesta: null, fecha_reporte: day(0)
    });
    persist();
    return { success: true, message: 'Reporte de demostración registrado. No se despachó ningún equipo.', data: { folio, tipo: body.tipo_emergencia, nivel: body.nivel_urgencia } };
  });

  // Brigadistas
  const isStaff = (me) => me && ['admin', 'tecnico'].includes(me.rol);
  route('GET', '/brigadistas/buscar(?:\\?.*)?', ({ q, me }) => {
    const s = load();
    let rows = s.brigadistas.filter((b) => b.activo);
    if (q.nombre) rows = rows.filter((b) => b.nombre_completo.toLowerCase().includes(q.nombre.toLowerCase()));
    if (q.brigada_id) rows = rows.filter((b) => b.brigada_id === Number(q.brigada_id));
    if (q.estado) rows = rows.filter((b) => b.estado_disponibilidad === q.estado);
    if (q.facultad) rows = rows.filter((b) => (b.facultad || '').toLowerCase().includes(q.facultad.toLowerCase()));
    return ok(rows.map((b) => {
      const out = {
        id: b.id, nombre_completo: b.nombre_completo, facultad: b.facultad, estado_disponibilidad: b.estado_disponibilidad,
        cursos_imparte: b.cursos_imparte, brigada_nombre: s.brigadas.find((x) => x.id === b.brigada_id).nombre
      };
      if (isStaff(me)) Object.assign(out, { email: b.email, telefono: b.telefono, ubicacion_actual: b.ubicacion_actual });
      return out;
    }));
  });
  const aproximar = (n) => Math.round(n * 1000) / 1000;
  route('GET', '/brigadistas/mapa', ({ me }) => {
    const s = load();
    const staff = isStaff(me);
    return ok(s.brigadistas
      .filter((b) => b.activo && b.latitud != null && (staff || ['disponible', 'en_servicio'].includes(b.estado_disponibilidad)))
      .map((b) => {
        const brigada_nombre = s.brigadas.find((x) => x.id === b.brigada_id).nombre;
        return staff
          ? { id: b.id, brigada_id: b.brigada_id, nombre_completo: b.nombre_completo, brigada_nombre, estado_disponibilidad: b.estado_disponibilidad, latitud: b.latitud, longitud: b.longitud, ubicacion_actual: b.ubicacion_actual, telefono: b.telefono }
          : { brigada_id: b.brigada_id, brigada_nombre, estado_disponibilidad: b.estado_disponibilidad, latitud: aproximar(b.latitud), longitud: aproximar(b.longitud) };
      }));
  });
  const mine = (me) => {
    need(me, 'brigadista');
    const b = load().brigadistas.find((x) => x.email === me.email && x.activo);
    if (!b) fail(404, 'No hay un perfil de brigadista asociado a tu correo');
    return b;
  };
  route('GET', '/brigadistas/me', ({ me }) => {
    const b = mine(me);
    const s = load();
    return ok({
      ...b, brigada_nombre: s.brigadas.find((x) => x.id === b.brigada_id).nombre,
      cursos_completados: s.inscripciones.filter((i) => i.email === b.email && i.estatus === 'completada').length
    });
  });
  route('PUT', '/brigadistas/me/ubicacion', ({ me, body }) => {
    const b = mine(me);
    const lat = Number(body.latitud), lng = Number(body.longitud);
    if (!Number.isFinite(lat) || Math.abs(lat) > 90) fail(400, 'Latitud no válida');
    if (!Number.isFinite(lng) || Math.abs(lng) > 180) fail(400, 'Longitud no válida');
    if (!['disponible', 'en_servicio', 'no_disponible', 'fuera_de_servicio'].includes(body.estado)) fail(400, 'Estado no válido');
    Object.assign(b, { latitud: lat, longitud: lng, ubicacion_actual: trim(body.ubicacion) || null, estado_disponibilidad: body.estado, ubicacion_actualizada: day(0) });
    persist();
    return { success: true, message: 'Ubicación actualizada' };
  });
  route('PUT', '/brigadistas/me/estado', ({ me, body }) => {
    const b = mine(me);
    if (!['disponible', 'en_servicio', 'no_disponible', 'fuera_de_servicio'].includes(body.estado)) fail(400, 'Estado no válido');
    b.estado_disponibilidad = body.estado;
    persist();
    return { success: true, message: 'Estado actualizado' };
  });

  // Personal: usuarios
  route('GET', '/usuarios', ({ me }) => {
    need(me, 'admin');
    return ok(load().usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, fecha_registro: u.fecha_registro })));
  });
  route('POST', '/usuarios', ({ me, body }) => {
    need(me, 'admin');
    const nombre = trim(body.nombre), email = trim(body.email).toLowerCase();
    if (nombre.length < 3) fail(400, 'Escribe el nombre completo');
    if (!isEmail(email)) fail(400, 'Correo electrónico no válido');
    if ((body.password || '').length < 8) fail(400, 'La contraseña debe tener al menos 8 caracteres');
    if (!ROLES.includes(body.rol)) fail(400, 'Rol no válido');
    const s = load();
    if (s.usuarios.some((u) => u.email === email)) fail(409, 'Ese correo ya está registrado');
    s.usuarios.push({ id: nextId(), nombre, email, password: body.password, rol: body.rol, activo: 1, fecha_registro: day(0) });
    persist();
    return { success: true, message: 'Usuario creado' };
  });
  route('PATCH', '/usuarios/(\\d+)', ({ me, m, body }) => {
    need(me, 'admin');
    const u = load().usuarios.find((x) => x.id === Number(m[1]));
    if (!u) fail(404, 'Usuario no encontrado');
    if (u.id === me.id) fail(400, 'No puedes modificar tu propia cuenta desde aquí');
    if (body.rol !== undefined) { if (!ROLES.includes(body.rol)) fail(400, 'Rol no válido'); u.rol = body.rol; }
    if (body.activo !== undefined) u.activo = body.activo ? 1 : 0;
    persist();
    return { success: true, message: 'Usuario actualizado' };
  });
  route('DELETE', '/usuarios/(\\d+)', ({ me, m }) => {
    need(me, 'admin');
    const s = load();
    const id = Number(m[1]);
    if (id === me.id) fail(400, 'No puedes eliminar tu propia cuenta');
    if (!s.usuarios.some((u) => u.id === id)) fail(404, 'Usuario no encontrado');
    s.usuarios = s.usuarios.filter((u) => u.id !== id);
    persist();
    return { success: true, message: 'Usuario eliminado' };
  });

  // Personal: solicitudes y mensajes
  route('GET', '/solicitudes(?:\\?.*)?', ({ me, q }) => {
    need(me, 'admin');
    const s = load();
    return ok(s.solicitudes.filter((x) => !q.estatus || x.estatus === q.estatus)
      .map((x) => ({ ...x, brigada_nombre: s.brigadas.find((b) => b.id === x.brigada_id).nombre }))
      .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud)));
  });
  route('PATCH', '/solicitudes/(\\d+)', ({ me, m, body }) => {
    need(me, 'admin');
    const s = load();
    const x = s.solicitudes.find((r) => r.id === Number(m[1]));
    if (!x) fail(404, 'Solicitud no encontrada');
    if (x.estatus !== 'pendiente') fail(409, 'La solicitud ya fue resuelta');
    if (!['aceptado', 'rechazado'].includes(body.estatus)) fail(400, 'Estatus no válido');
    x.estatus = body.estatus;
    if (body.estatus === 'aceptado' && !s.brigadistas.some((b) => b.email === x.email)) {
      s.brigadistas.push({
        id: nextId(), brigada_id: x.brigada_id, nombre_completo: x.nombre_completo, email: x.email, telefono: x.telefono,
        facultad: x.facultad, estado_disponibilidad: 'disponible', latitud: null, longitud: null, ubicacion_actual: null,
        ubicacion_actualizada: null, cursos_imparte: null, horas_servicio: 0, fecha_ingreso: date(0), activo: 1
      });
    }
    persist();
    return { success: true, message: body.estatus === 'aceptado' ? 'Solicitud aceptada' : 'Solicitud rechazada' };
  });
  route('GET', '/mensajes', ({ me }) => {
    need(me, 'admin');
    return ok(load().mensajes.slice().sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio)));
  });
  route('PATCH', '/mensajes/(\\d+)', ({ me, m, body }) => {
    need(me, 'admin');
    const x = load().mensajes.find((r) => r.id === Number(m[1]));
    if (!x) fail(404, 'Mensaje no encontrado');
    if (!['leido', 'respondido', 'cerrado'].includes(body.estatus)) fail(400, 'Estatus no válido');
    x.estatus = body.estatus;
    persist();
    return { success: true, message: 'Mensaje actualizado' };
  });

  // Personal: emergencias
  const URG = { critica: 0, alta: 1, media: 2, baja: 3 };
  route('GET', '/emergencias(?:\\?.*)?', ({ me, q }) => {
    need(me, 'admin', 'tecnico');
    let rows = load().emergencias.slice();
    if (q.activas === '1') rows = rows.filter((e) => ACTIVE_EMERGENCY.includes(e.estatus));
    rows.sort((a, b) => URG[a.nivel_urgencia] - URG[b.nivel_urgencia] || new Date(b.fecha_reporte) - new Date(a.fecha_reporte));
    return ok(rows);
  });
  route('PATCH', '/emergencias/(\\d+)', ({ me, m, body }) => {
    need(me, 'admin', 'tecnico');
    const e = load().emergencias.find((r) => r.id === Number(m[1]));
    if (!e) fail(404, 'Emergencia no encontrada');
    if (!['en_camino', 'atendiendo', 'resuelta', 'cancelada'].includes(body.estatus)) fail(400, 'Estatus no válido');
    if (e.tiempo_respuesta == null && ['en_camino', 'atendiendo'].includes(body.estatus)) {
      e.tiempo_respuesta = Math.max(0, Math.round((Date.now() - new Date(e.fecha_reporte)) / 60000));
    }
    e.estatus = body.estatus;
    persist();
    return { success: true, message: 'Emergencia actualizada' };
  });

  // Personal: inscripciones
  route('GET', '/inscripciones(?:\\?.*)?', ({ me, q }) => {
    need(me, 'admin', 'capacitador');
    const s = load();
    return ok(s.inscripciones
      .filter((i) => (!q.estatus || i.estatus === q.estatus) && (!q.curso_id || i.curso_id === Number(q.curso_id)))
      .map((i) => ({ ...i, curso_titulo: s.cursos.find((c) => c.id === i.curso_id).titulo }))
      .sort((a, b) => new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion)));
  });
  route('PATCH', '/inscripciones/(\\d+)', ({ me, m, body }) => {
    need(me, 'admin', 'capacitador');
    const i = load().inscripciones.find((r) => r.id === Number(m[1]) && r.estatus === 'pendiente');
    if (!i) fail(404, 'Inscripción no encontrada o ya resuelta');
    if (!['confirmada', 'cancelada'].includes(body.estatus)) fail(400, 'Estatus no válido');
    i.estatus = body.estatus;
    persist();
    return { success: true, message: 'Inscripción actualizada' };
  });

  // Personal: resúmenes
  route('GET', '/panel/admin', ({ me }) => {
    need(me, 'admin');
    const s = load();
    const actividad = [
      ...s.solicitudes.map((x) => ({ tipo: 'solicitud', descripcion: 'Solicitud de ingreso de ' + x.nombre_completo, fecha: x.fecha_solicitud })),
      ...s.inscripciones.map((x) => ({ tipo: 'inscripcion', descripcion: 'Inscripción de ' + x.nombre_completo + ' a un curso', fecha: x.fecha_inscripcion })),
      ...s.emergencias.map((x) => ({ tipo: 'emergencia', descripcion: 'Emergencia ' + x.folio + ' (' + x.tipo_emergencia + ')', fecha: x.fecha_reporte })),
      ...s.mensajes.map((x) => ({ tipo: 'mensaje', descripcion: 'Mensaje de ' + x.nombre + ': ' + x.asunto, fecha: x.fecha_envio }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8);
    return ok({
      stats: {
        usuarios: s.usuarios.filter((u) => u.activo).length,
        brigadistas: s.brigadistas.filter((b) => b.activo).length,
        emergencias_activas: s.emergencias.filter((e) => ACTIVE_EMERGENCY.includes(e.estatus)).length,
        solicitudes_pendientes: s.solicitudes.filter((x) => x.estatus === 'pendiente').length,
        mensajes_nuevos: s.mensajes.filter((x) => x.estatus === 'nuevo').length
      },
      actividad
    });
  });
  route('GET', '/panel/tecnico', ({ me }) => {
    need(me, 'admin', 'tecnico');
    const s = load();
    const hoy = new Date().toDateString();
    const tiempos = s.emergencias.map((e) => e.tiempo_respuesta).filter((t) => t != null);
    return ok({
      emergencias_hoy: s.emergencias.filter((e) => new Date(e.fecha_reporte).toDateString() === hoy).length,
      emergencias_activas: s.emergencias.filter((e) => ACTIVE_EMERGENCY.includes(e.estatus)).length,
      brigadistas_disponibles: s.brigadistas.filter((b) => b.activo && b.estado_disponibilidad === 'disponible').length,
      brigadistas_en_servicio: s.brigadistas.filter((b) => b.activo && b.estado_disponibilidad === 'en_servicio').length,
      tiempo_respuesta_promedio: tiempos.length ? Math.round((tiempos.reduce((a, b) => a + b, 0) / tiempos.length) * 10) / 10 : null
    });
  });
  route('GET', '/panel/capacitador', ({ me }) => {
    need(me, 'admin', 'capacitador');
    const s = load();
    return ok({
      cursos_activos: s.cursos.filter((c) => ['programado', 'inscripciones_abiertas', 'en_curso'].includes(c.estatus)).length,
      inscritos: s.inscripciones.filter((i) => ['confirmada', 'completada'].includes(i.estatus)).length,
      pendientes: s.inscripciones.filter((i) => i.estatus === 'pendiente').length,
      certificados: s.inscripciones.filter((i) => i.certificado_emitido).length
    });
  });

  /* ---------------------- Despacho ---------------------- */
  async function handle(method, path, body, token) {
    await new Promise((r) => setTimeout(r, 120)); // simula latencia de red
    const [pathname, qs] = path.split('?');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    const me = sessionUser(token);
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = r.re.exec(path) || r.re.exec(pathname);
      if (m) return r.fn({ m, q, me, body: body || {} });
    }
    fail(404, 'Ruta no encontrada');
  }

  const reset = () => { state = null; try { localStorage.removeItem(KEY); } catch (e) { /* sin almacenamiento */ } };

  return { handle, reset, password: DEMO_PASSWORD };
})();
