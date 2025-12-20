-- ============================================================================
-- MIGRACIÓN: Agregar autorización para evaluación de patrones
-- Fecha: 2025-12-19
-- ============================================================================

-- Agregar columna para autorizar acceso al cuestionario de patrones
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS patrones_autorizado BOOLEAN DEFAULT FALSE;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_patrones_autorizado 
ON profiles(patrones_autorizado) 
WHERE patrones_autorizado = TRUE;

-- Comentario
COMMENT ON COLUMN profiles.patrones_autorizado IS 'Indica si el usuario tiene autorización para realizar la evaluación de patrones alimentarios';
