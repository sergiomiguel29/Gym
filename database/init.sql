CREATE DATABASE IF NOT EXISTS gimnasio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gimnasio;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) DEFAULT NULL,
  verificado TINYINT(1) DEFAULT 0,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  usuario_id INT(11) DEFAULT NULL,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) DEFAULT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_correo (correo),
  KEY idx_clientes_usuario_id (usuario_id),
  CONSTRAINT fk_clientes_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rutinas (
  id INT(11) NOT NULL AUTO_INCREMENT,
  cliente_id INT(11) NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL,
  PRIMARY KEY (id),
  KEY idx_rutinas_cliente_id (cliente_id),
  CONSTRAINT fk_rutinas_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ejercicios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  rutina_id INT(11) NOT NULL,
  tipo_ejercicio VARCHAR(100) NOT NULL,
  series INT(11) NOT NULL,
  repeticiones INT(11) NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ejercicios_rutina_id (rutina_id),
  CONSTRAINT fk_ejercicios_rutinas
    FOREIGN KEY (rutina_id) REFERENCES rutinas(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mediciones (
  id INT(11) NOT NULL AUTO_INCREMENT,
  cliente_id INT(11) NOT NULL,
  fecha DATE NOT NULL,
  peso DECIMAL(5,2) DEFAULT NULL,
  cintura DECIMAL(5,2) DEFAULT NULL,
  pecho DECIMAL(5,2) DEFAULT NULL,
  brazo DECIMAL(5,2) DEFAULT NULL,
  pierna DECIMAL(5,2) DEFAULT NULL,
  grasa DECIMAL(5,2) DEFAULT NULL,
  notas VARCHAR(255) DEFAULT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mediciones_cliente_id (cliente_id),
  CONSTRAINT fk_mediciones_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
