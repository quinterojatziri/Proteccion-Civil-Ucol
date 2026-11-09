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
