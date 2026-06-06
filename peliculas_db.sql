-- ════════════════════════════════════════════
--  CineVault — script de base de datos MySQL
--  Archivo: peliculas_db.sql
-- ════════════════════════════════════════════

-- 1. Crear (o reutilizar) la base de datos
CREATE DATABASE IF NOT EXISTS peliculas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peliculas_db;

-- 2. Crear la tabla principal
CREATE TABLE IF NOT EXISTS peliculas (
  id          INT            UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(120)   NOT NULL,
  descripcion TEXT,
  puntaje     DECIMAL(3, 1)  NOT NULL CHECK (puntaje BETWEEN 0 AND 10),
  duracion    SMALLINT       UNSIGNED NOT NULL COMMENT 'Duración en minutos',
  creada_en   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- 3. Datos de prueba (puedes eliminar este bloque)
INSERT INTO peliculas (titulo, descripcion, puntaje, duracion) VALUES
  ('Interstellar',
   'Un equipo de astronautas viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.',
   8.6, 169),
  ('El padrino',
   'La historia de la familia Corleone, una de las más poderosas organizaciones criminales de Nueva York.',
   9.2, 175),
  ('Parasite',
   'La familia Kim se infiltra en la vida de una familia adinerada con consecuencias inesperadas.',
   8.5, 132),
  ('Mad Max: Fury Road',
   'En un mundo post-apocalíptico, Max se alía con Furiosa para escapar de un tirano del desierto.',
   8.1, 120),
  ('Coco',
   'Miguel viaja al mundo de los muertos en busca de su bisabuelo para comprender la historia de su familia.',
   8.4, 105);

-- ════════════════════════════════════════════
--  CONSULTAS CRUD DE REFERENCIA
--  (para usar desde tu API o cliente MySQL)
-- ════════════════════════════════════════════

-- ── CREATE ──────────────────────────────────
-- INSERT INTO peliculas (titulo, descripcion, puntaje, duracion)
-- VALUES ('Nuevo título', 'Descripción aquí', 7.8, 110);

-- ── READ (todas) ────────────────────────────
-- SELECT * FROM peliculas ORDER BY creada_en DESC;

-- ── READ (por ID) ───────────────────────────
-- SELECT * FROM peliculas WHERE id = 1;

-- ── READ (búsqueda por título) ───────────────
-- SELECT * FROM peliculas WHERE titulo LIKE '%inter%';

-- ── UPDATE ──────────────────────────────────
-- UPDATE peliculas
-- SET titulo = 'Título editado', puntaje = 9.0, duracion = 180
-- WHERE id = 1;

-- ── DELETE ──────────────────────────────────
-- DELETE FROM peliculas WHERE id = 1;

-- ── ESTADÍSTICAS ────────────────────────────
-- SELECT
--   COUNT(*)              AS total_peliculas,
--   AVG(puntaje)          AS puntaje_promedio,
--   AVG(duracion)         AS duracion_promedio_min,
--   MAX(puntaje)          AS puntaje_maximo,
--   MIN(puntaje)          AS puntaje_minimo
-- FROM peliculas;
