-- Agregar campo de modalidad a appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS modality text DEFAULT 'online' CHECK (modality IN ('online', 'presencial'));

-- Agregar comentario
COMMENT ON COLUMN public.appointments.modality IS 'Modalidad de la cita: online (videollamada) o presencial (en consultorio)';

-- Agregar campo de modalidad a availability_slots
ALTER TABLE public.availability_slots
ADD COLUMN IF NOT EXISTS modality text DEFAULT 'online' CHECK (modality IN ('online', 'presencial'));

COMMENT ON COLUMN public.availability_slots.modality IS 'Modalidad del slot: online o presencial';

-- Agregar campo de modalidades disponibles a services (JSONB array)
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS available_modalities jsonb DEFAULT '["online"]'::jsonb;

COMMENT ON COLUMN public.services.available_modalities IS 'Modalidades disponibles para este servicio: ["online"], ["presencial"], o ["online", "presencial"]';

-- Actualizar servicios existentes para que tengan ambas modalidades por defecto
UPDATE public.services 
SET available_modalities = '["online", "presencial"]'::jsonb
WHERE available_modalities IS NULL OR available_modalities = '["online"]'::jsonb;
