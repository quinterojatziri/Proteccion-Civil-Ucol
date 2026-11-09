-- Protección Civil UCOL: base de datos completa (esquema + datos de ejemplo + cuentas de prueba).
-- Importar en un servidor MySQL 8 / MariaDB vacío. Crea la base 'proteccion_civil'.

-- Esquema de la base de datos de Protección Civil UCOL.
-- Compatible con MySQL 8 y MariaDB 10.5 o superior.
-- Es seguro ejecutarlo varias veces: no elimina datos existentes.

CREATE DATABASE IF NOT EXISTS proteccion_civil
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proteccion_civil;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','tecnico','brigadista','capacitador','usuario') NOT NULL DEFAULT 'usuario',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_rol (rol)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brigadas (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  coordinador VARCHAR(255) NOT NULL,
  email_coordinador VARCHAR(255) DEFAULT NULL,
  telefono_coordinador VARCHAR(40) DEFAULT NULL,
  requisitos TEXT,
  imagen_url VARCHAR(500) DEFAULT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_brigadas_activa (activa)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brigadistas (
  id INT NOT NULL AUTO_INCREMENT,
  brigada_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(40) DEFAULT NULL,
  n_cuenta VARCHAR(50) DEFAULT NULL,
  facultad VARCHAR(255) DEFAULT NULL,
  estado_disponibilidad ENUM('disponible','en_servicio','no_disponible','fuera_de_servicio')
    NOT NULL DEFAULT 'disponible',
  latitud DECIMAL(9,6) DEFAULT NULL,
  longitud DECIMAL(9,6) DEFAULT NULL,
  ubicacion_actual VARCHAR(255) DEFAULT NULL,
  ubicacion_actualizada DATETIME DEFAULT NULL,
  cursos_imparte VARCHAR(500) DEFAULT NULL,
  horas_servicio INT NOT NULL DEFAULT 0,
  fecha_ingreso DATE NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brigadistas_email (email),
  KEY idx_brigadistas_brigada (brigada_id),
  KEY idx_brigadistas_estado (estado_disponibilidad),
  CONSTRAINT fk_brigadistas_brigada FOREIGN KEY (brigada_id) REFERENCES brigadas (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS solicitudes_brigadistas (
  id INT NOT NULL AUTO_INCREMENT,
  brigada_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  n_cuenta VARCHAR(50) DEFAULT NULL,
  carrera VARCHAR(255) DEFAULT NULL,
  facultad VARCHAR(255) DEFAULT NULL,
  semestre INT DEFAULT NULL,
  experiencia_previa TEXT,
  motivacion TEXT NOT NULL,
  estatus ENUM('pendiente','aceptado','rechazado') NOT NULL DEFAULT 'pendiente',
  fecha_solicitud DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_solicitudes_estatus (estatus),
  KEY idx_solicitudes_brigada (brigada_id),
  CONSTRAINT fk_solicitudes_brigada FOREIGN KEY (brigada_id) REFERENCES brigadas (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cursos (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_horas INT NOT NULL,
  cupo_maximo INT NOT NULL DEFAULT 30,
  instructor VARCHAR(255) DEFAULT NULL,
  modalidad ENUM('presencial','virtual','hibrido') NOT NULL DEFAULT 'presencial',
  ubicacion VARCHAR(255) DEFAULT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  horario VARCHAR(255) DEFAULT NULL,
  requisitos TEXT,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estatus ENUM('programado','inscripciones_abiertas','en_curso','finalizado','cancelado')
    NOT NULL DEFAULT 'programado',
  certificado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cursos_estatus (estatus),
  KEY idx_cursos_inicio (fecha_inicio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inscripciones_cursos (
  id INT NOT NULL AUTO_INCREMENT,
  curso_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  n_cuenta VARCHAR(50) DEFAULT NULL,
  carrera VARCHAR(255) DEFAULT NULL,
  semestre INT DEFAULT NULL,
  motivacion TEXT,
  estatus ENUM('pendiente','confirmada','cancelada','completada') NOT NULL DEFAULT 'pendiente',
  certificado_emitido TINYINT(1) NOT NULL DEFAULT 0,
  fecha_inscripcion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_confirmacion TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_inscripciones_curso (curso_id),
  KEY idx_inscripciones_estatus (estatus),
  KEY idx_inscripciones_email (email),
  CONSTRAINT fk_inscripciones_curso FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documentos (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_documento ENUM('manual','protocolo','reporte','guia','otro') NOT NULL DEFAULT 'otro',
  archivo_url VARCHAR(500) NOT NULL,
  publico TINYINT(1) NOT NULL DEFAULT 1,
  vigente TINYINT(1) NOT NULL DEFAULT 1,
  fecha_subida TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documentos_publico (publico, vigente)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS novedades (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(255) NOT NULL,
  resumen TEXT,
  contenido TEXT NOT NULL,
  categoria ENUM('noticia','evento','aviso','logro','comunicado') NOT NULL DEFAULT 'noticia',
  destacado TINYINT(1) NOT NULL DEFAULT 0,
  publicado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_publicacion TIMESTAMP NULL DEFAULT NULL,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_novedades_listado (publicado, destacado, fecha_publicacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(40) DEFAULT NULL,
  tipo ENUM('consulta','sugerencia','queja','felicitacion','otro') NOT NULL DEFAULT 'consulta',
  asunto VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  estatus ENUM('nuevo','leido','respondido','cerrado') NOT NULL DEFAULT 'nuevo',
  fecha_envio TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mensajes_estatus (estatus)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS emergencias (
  id INT NOT NULL AUTO_INCREMENT,
  folio VARCHAR(30) NOT NULL,
  nombre_solicitante VARCHAR(255) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  tipo_emergencia ENUM('medica','incendio','evacuacion','accidente','estructural','quimica','otra') NOT NULL,
  nivel_urgencia ENUM('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  edificio VARCHAR(100) DEFAULT NULL,
  piso VARCHAR(50) DEFAULT NULL,
  ubicacion_detallada VARCHAR(500) NOT NULL,
  descripcion TEXT NOT NULL,
  numero_afectados INT NOT NULL DEFAULT 1,
  estatus ENUM('reportada','en_camino','atendiendo','resuelta','cancelada') NOT NULL DEFAULT 'reportada',
  tiempo_respuesta INT DEFAULT NULL COMMENT 'Minutos entre el reporte y la primera atención',
  atendido_por INT DEFAULT NULL,
  fecha_reporte TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_atencion TIMESTAMP NULL DEFAULT NULL,
  fecha_resolucion TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_emergencias_folio (folio),
  KEY idx_emergencias_estatus (estatus, nivel_urgencia),
  KEY idx_emergencias_fecha (fecha_reporte),
  CONSTRAINT fk_emergencias_atendido FOREIGN KEY (atendido_por) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB;

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

-- Cuentas de prueba (contrasena: Demo1234!). Elimínalas antes de usar el sistema en producción.
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administración Demo', 'admin@demo.local', '$2a$10$I7ONGZEWUtP.yu6tRVGXO.MEuMbLcBzzUKn0wQQfkdROhNWd6aZ4e', 'admin'),
('Técnico Demo', 'tecnico@demo.local', '$2a$10$I7ONGZEWUtP.yu6tRVGXO.MEuMbLcBzzUKn0wQQfkdROhNWd6aZ4e', 'tecnico'),
('Brigadista Demo', 'brigadista@demo.local', '$2a$10$I7ONGZEWUtP.yu6tRVGXO.MEuMbLcBzzUKn0wQQfkdROhNWd6aZ4e', 'brigadista'),
('Capacitación Demo', 'capacitador@demo.local', '$2a$10$I7ONGZEWUtP.yu6tRVGXO.MEuMbLcBzzUKn0wQQfkdROhNWd6aZ4e', 'capacitador'),
('Usuario Demo', 'usuario@demo.local', '$2a$10$I7ONGZEWUtP.yu6tRVGXO.MEuMbLcBzzUKn0wQQfkdROhNWd6aZ4e', 'usuario');
