-- Datos de ejemplo para desarrollo. Contenido ficticio: reemplázalo antes de publicar.
-- Ejecutar solo sobre una base de datos vacía.

USE proteccion_civil;

INSERT INTO brigadas (nombre, descripcion, coordinador, email_coordinador, telefono_coordinador, requisitos) VALUES
('Brigada de Primeros Auxilios',
 'Atención básica y estabilización de personas lesionadas o en crisis dentro de las instalaciones universitarias.',
 'Coordinación de Primeros Auxilios', 'proteccioncivil@ucol.mx', '312 316 1000, ext. 30011',
 'Curso básico de primeros auxilios; disponibilidad de tiempo; compromiso de capacitación continua.'),
('Brigada de Evacuación',
 'Coordinación del desalojo ordenado de inmuebles y conducción de las personas a los puntos de reunión.',
 'Coordinación de Evacuación', 'proteccioncivil@ucol.mx', '312 316 1000, ext. 30011',
 'Conocimiento de las instalaciones; capacidad de liderazgo; disponibilidad inmediata.'),
('Brigada Contra Incendios',
 'Prevención, detección y control de conatos de incendio, y capacitación en el uso de extintores.',
 'Coordinación Contra Incendios', 'proteccioncivil@ucol.mx', '312 316 1000, ext. 30011',
 'Curso de combate de incendios; buena condición física.'),
('Brigada de Comunicación',
 'Difusión de información oficial durante emergencias y enlace con autoridades externas.',
 'Coordinación de Comunicación', 'proteccioncivil@ucol.mx', '312 316 1000, ext. 30011',
 'Habilidades de comunicación; manejo de redes sociales; disponibilidad de dispositivo móvil.'),
('Brigada de Búsqueda y Rescate',
 'Localización y rescate de personas en situaciones de emergencia dentro de las instalaciones.',
 'Coordinación de Búsqueda y Rescate', 'proteccioncivil@ucol.mx', '312 316 1000, ext. 30011',
 'Excelente condición física; curso básico de rescate.');

INSERT INTO cursos (titulo, descripcion, duracion_horas, cupo_maximo, instructor, modalidad, ubicacion, fecha_inicio, fecha_fin, horario, costo, estatus) VALUES
('Primeros Auxilios Básico',
 'Curso teórico-práctico de técnicas básicas de primeros auxilios, reanimación cardiopulmonar y uso de desfibrilador externo automático.',
 20, 30, 'Instructor por asignar', 'presencial', 'Campus Central',
 CURDATE() + INTERVAL 21 DAY, CURDATE() + INTERVAL 35 DAY, 'Lunes a viernes, 16:00 a 18:00', 0, 'inscripciones_abiertas'),
('Combate de Incendios, Nivel I',
 'Prevención, detección y control de conatos de incendio con prácticas de uso de extintores.',
 16, 25, 'Instructor por asignar', 'presencial', 'Campus Central',
 CURDATE() + INTERVAL 45 DAY, CURDATE() + INTERVAL 60 DAY, 'Martes y jueves, 15:00 a 17:00', 0, 'programado'),
('Evacuación y Puntos de Reunión',
 'Protocolos y técnicas para la evacuación segura de edificios.',
 12, 40, 'Instructor por asignar', 'hibrido', 'Campus Central',
 CURDATE() + INTERVAL 50 DAY, CURDATE() + INTERVAL 58 DAY, 'Miércoles y viernes, 17:00 a 19:00', 0, 'programado');

INSERT INTO documentos (titulo, descripcion, tipo_documento, archivo_url) VALUES
('Ley General de Protección Civil', 'Legislación federal en materia de protección civil.', 'protocolo', 'docs/LGPC.pdf'),
('Ley de Protección Civil del Estado de Colima', 'Marco legal de protección civil en el estado de Colima.', 'protocolo', 'docs/LeyPCestadodeColima.pdf');

INSERT INTO novedades (titulo, resumen, contenido, categoria, destacado, publicado, fecha_publicacion) VALUES
('Convocatoria al curso de Primeros Auxilios Básico',
 'Abrimos inscripciones para el curso de primeros auxilios nivel básico.',
 'Se abre la convocatoria para el curso de Primeros Auxilios Básico. El cupo es limitado y las inscripciones se realizan desde la sección de cursos de este sitio.',
 'aviso', 1, 1, NOW() - INTERVAL 2 DAY),
('Registro abierto para nuevos brigadistas',
 'Si formas parte de la comunidad universitaria puedes solicitar tu ingreso a una brigada.',
 'Las brigadas de Primeros Auxilios, Evacuación, Contra Incendios, Comunicación y Búsqueda y Rescate reciben solicitudes durante todo el año. Consulta los requisitos de cada una en la sección de brigadas.',
 'noticia', 0, 1, NOW() - INTERVAL 9 DAY),
('Participación en simulacros',
 'Recuerda conocer las rutas de evacuación y los puntos de reunión de tu plantel.',
 'La participación de toda la comunidad universitaria en los simulacros es fundamental para reducir riesgos. Identifica la ruta de evacuación y el punto de reunión de tu edificio.',
 'comunicado', 0, 1, NOW() - INTERVAL 20 DAY);

-- Brigadistas ficticios para probar el mapa y los paneles.
INSERT INTO brigadistas (brigada_id, nombre_completo, email, telefono, n_cuenta, facultad, estado_disponibilidad, latitud, longitud, ubicacion_actual, cursos_imparte, horas_servicio, fecha_ingreso) VALUES
(1, 'Brigadista de Ejemplo', 'brigadista@demo.local', '3120000001', '20200001', 'Medicina', 'disponible', 19.245200, -103.724100, 'Edificio de Rectoría', 'Primeros Auxilios Básico', 64, CURDATE() - INTERVAL 400 DAY),
(2, 'Persona Voluntaria Uno', 'voluntaria1@demo.local', '3120000002', '20200002', 'Ingeniería', 'en_servicio', 19.244600, -103.723300, 'Explanada principal', NULL, 40, CURDATE() - INTERVAL 300 DAY),
(3, 'Persona Voluntaria Dos', 'voluntaria2@demo.local', '3120000003', '20200003', 'Química', 'disponible', 19.246100, -103.725000, 'Laboratorios', NULL, 22, CURDATE() - INTERVAL 150 DAY),
(5, 'Persona Voluntaria Tres', 'voluntaria3@demo.local', '3120000004', '20200004', 'Derecho', 'no_disponible', 19.243900, -103.724800, NULL, NULL, 12, CURDATE() - INTERVAL 90 DAY);
