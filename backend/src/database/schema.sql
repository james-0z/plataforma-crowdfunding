-- =====================================================================
-- Esquema de la plataforma de crowdfunding All-or-Nothing (PostgreSQL)
-- Es idempotente: se puede ejecutar varias veces sin romper nada.
-- Los registros financieros NUNCA se borran en cascada (ON DELETE RESTRICT).
-- =====================================================================

-- 1. Usuarios -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- El correo es único sin distinguir mayúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email ON usuarios (LOWER(email));

-- 2. Categorías ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

INSERT INTO categorias (nombre, slug, descripcion) VALUES
    ('Tecnología',        'tecnologia',        'Proyectos de software, hardware y gadgets'),
    ('Videojuegos',       'videojuegos',       'Juegos indie, plataformas y experiencias interactivas'),
    ('Arte & Cine',       'arte-cine',         'Producciones audiovisuales, ilustración y arte'),
    ('Diseño & Hardware', 'diseno-hardware',   'Diseño de productos y accesorios físicos')
ON CONFLICT (slug) DO NOTHING;

-- 3. Campañas (modelo All-or-Nothing) -----------------------------------
-- estado: activa  -> acepta aportes hasta fecha_limite (inclusive)
--         exitosa -> venció habiendo alcanzado la meta (fondos liberados)
--         fallida -> venció sin alcanzar la meta (aportes reembolsados)
CREATE TABLE IF NOT EXISTS campanas (
    id              SERIAL PRIMARY KEY,
    creador_id      INT           NOT NULL REFERENCES usuarios(id)   ON DELETE RESTRICT,
    categoria_id    INT           REFERENCES categorias(id)          ON DELETE SET NULL,
    titulo          VARCHAR(150)  NOT NULL,
    descripcion     TEXT          NOT NULL,
    meta_monto      NUMERIC(12,2) NOT NULL CHECK (meta_monto > 0),
    monto_recaudado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_recaudado >= 0),
    fecha_limite    DATE          NOT NULL,
    estado          VARCHAR(20)   NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'exitosa', 'fallida')),
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    cerrado_en      TIMESTAMPTZ
);

-- 4. Aportes -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aportes (
    id             SERIAL PRIMARY KEY,
    campana_id     INT           NOT NULL REFERENCES campanas(id)  ON DELETE RESTRICT,
    usuario_id     INT           NOT NULL REFERENCES usuarios(id)  ON DELETE RESTRICT,
    monto          NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    reembolsado    BOOLEAN       NOT NULL DEFAULT FALSE,
    reembolsado_en TIMESTAMPTZ,
    fecha_aporte   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reembolso_coherente CHECK (reembolsado OR reembolsado_en IS NULL)
);

-- 5. Tokens de refresco (se guarda solo el hash SHA-256) -----------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash  CHAR(64)    NOT NULL UNIQUE,
    expira_en   TIMESTAMPTZ NOT NULL,
    revocado    BOOLEAN     NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Índices --------------------------------------------------------------
-- Cierre automático: campañas activas ordenadas por vencimiento.
CREATE INDEX IF NOT EXISTS idx_campanas_activas_vencimiento ON campanas (fecha_limite) WHERE estado = 'activa';
CREATE INDEX IF NOT EXISTS idx_campanas_estado       ON campanas (estado);
CREATE INDEX IF NOT EXISTS idx_campanas_creador      ON campanas (creador_id);
CREATE INDEX IF NOT EXISTS idx_campanas_categoria    ON campanas (categoria_id);
CREATE INDEX IF NOT EXISTS idx_aportes_campana       ON aportes (campana_id);
CREATE INDEX IF NOT EXISTS idx_aportes_usuario       ON aportes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario       ON refresh_tokens (usuario_id);
