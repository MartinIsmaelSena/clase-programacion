-- =========================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: DESAFÍOS EN VIVO
-- CODE: DEL PROBLEMA AL PROGRAMA
-- =========================================================

-- 1. Tabla de Sesiones de Desafío
CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(12) NOT NULL UNIQUE,
    challenge_id VARCHAR(50) NOT NULL,
    challenge_title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING', -- 'WAITING', 'ACTIVE', 'FINISHED'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    winner_name VARCHAR(150),
    winner_time VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Participantes
CREATE TABLE IF NOT EXISTS live_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'JOINED', -- 'JOINED', 'SOLVING', 'COMPLETED', 'ERROR'
    finish_time_ms BIGINT,
    finish_time_formatted VARCHAR(20),
    rank_position INT,
    tries INT NOT NULL DEFAULT 0,
    last_message TEXT,
    joined_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Respuestas / Intentos
CREATE TABLE IF NOT EXISTS live_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES live_participants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    solution JSONB NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT false,
    validation_message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar publicación en tiempo real de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE live_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE live_participants;
