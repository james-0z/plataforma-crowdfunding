-- CREATE DATABASE crowdfunding_db;

-- Extensión para generación de UUIDs (opcional) o usaremos identificadores SERIAL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Insertar categorías base
INSERT INTO categorias (nombre, descripcion) VALUES
('Tecnología', 'Proyectos de software, hardware y gadgets'),
('Videojuegos', 'Juegos indie, plataformas y experiencias interactivas'),
('Arte & Cine', 'Producciones audiovisuales, ilustración y arte'),
('Diseño & Hardware', 'Diseño de productos y accesorios físicos')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Tabla de Campañas (Modelo All-or-Nothing)
CREATE TABLE IF NOT EXISTS campanas (
    id SERIAL PRIMARY KEY,
    creador_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    meta_monto NUMERIC(12, 2) NOT NULL CHECK (meta_monto > 0),
    monto_recaudado NUMERIC(12, 2) DEFAULT 0.00 CHECK (monto_recaudado >= 0),
    fecha_limite DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'exitosa', 'fallida')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Aportes Financieros
CREATE TABLE IF NOT EXISTS aportes (
    id SERIAL PRIMARY KEY,
    campana_id INT NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    reembolsado BOOLEAN DEFAULT FALSE,
    fecha_aporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índice para consultas rápidas de campañas activas por fecha límite
CREATE INDEX IF NOT EXISTS idx_campanas_estado ON campanas(estado);
CREATE INDEX IF NOT EXISTS idx_aportes_campana ON aportes(campana_id);