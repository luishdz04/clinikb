-- ============================================
-- CORRECCIÓN: GRANTS FALTANTES + RLS EN medical_records
-- ============================================
-- Contexto: appointments-schema.sql y medical-records-schema.sql definen
-- políticas RLS pero nunca otorgan privilegios de tabla a anon/authenticated.
-- Sin los GRANT, PostgREST responde "permission denied for table ...".
-- Además medical_records nunca habilitó RLS ni definió políticas.
--
-- Aplicar DESPUÉS de: schema.sql, appointments-schema.sql,
-- medical-records-schema.sql, add-modality-field.sql, patients-rls.sql

-- 1. RLS en medical_records (contiene historial clínico)
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow doctors manage medical records" ON public.medical_records;
CREATE POLICY "Allow doctors manage medical records" ON public.medical_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass medical records" ON public.medical_records;
CREATE POLICY "Service role bypass medical records" ON public.medical_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Privilegios de tabla faltantes
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;

GRANT SELECT ON public.doctor_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_services TO authenticated;

GRANT SELECT ON public.availability_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
