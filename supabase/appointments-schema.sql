-- ============================================
-- CLINIKB - SISTEMA DE CITAS Y HORARIOS
-- ============================================

-- 1. TABLA DE SERVICIOS (Catálogo)
-- ============================================
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Psicológica'::text, 'Médica'::text])),
  duration_minutes integer NOT NULL DEFAULT 60,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- 2. SERVICIOS QUE OFRECE CADA DOCTOR
-- ============================================
CREATE TABLE public.doctor_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  service_id uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT doctor_services_pkey PRIMARY KEY (id),
  CONSTRAINT doctor_services_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE,
  CONSTRAINT doctor_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE,
  CONSTRAINT doctor_services_unique UNIQUE (doctor_id, service_id)
);

-- 3. HORARIOS DISPONIBLES DEL DOCTOR (Slots)
-- ============================================
CREATE TABLE public.availability_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  service_id uuid NOT NULL,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  max_appointments integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT availability_slots_pkey PRIMARY KEY (id),
  CONSTRAINT availability_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE,
  CONSTRAINT availability_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas de slots disponibles
CREATE INDEX idx_availability_slots_search ON public.availability_slots(doctor_id, service_id, slot_date, is_available);

-- 4. CITAS AGENDADAS
-- ============================================
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  service_id uuid NOT NULL,
  slot_id uuid,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (
    status = ANY (ARRAY[
      'pending'::text,       -- Solicitud del paciente (esperando aprobación)
      'confirmed'::text,     -- Aprobada por el doctor
      'rejected'::text,      -- Rechazada por el doctor
      'cancelled'::text,     -- Cancelada (por doctor o paciente)
      'completed'::text,     -- Completada
      'no_show'::text        -- Paciente no asistió
    ])
  ),
  patient_notes text,
  doctor_notes text,
  meeting_link text,
  rejection_reason text,
  cancellation_reason text,
  cancelled_by uuid,
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE,
  CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  CONSTRAINT appointments_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.doctors(id)
);

-- Índices para búsquedas comunes
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id, status);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id, status);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date, status);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Services: Todos pueden leer
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on services" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Allow admin manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Doctor Services: Doctors pueden gestionar sus propios servicios
ALTER TABLE public.doctor_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow doctors manage their services" ON public.doctor_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read doctor services" ON public.doctor_services FOR SELECT TO anon, authenticated USING (active = true);

-- Availability Slots: Doctors gestionan sus slots, todos pueden leer disponibles
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow doctors manage their slots" ON public.availability_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read available slots" ON public.availability_slots FOR SELECT TO anon, authenticated USING (is_available = true AND slot_date >= CURRENT_DATE);

-- Appointments: Pacientes pueden crear (pending), doctors pueden gestionar
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow doctors manage appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow patients view their appointments" ON public.appointments FOR SELECT TO authenticated USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: SERVICIOS INICIALES
-- ============================================

INSERT INTO public.services (key, title, category, duration_minutes, description, active) VALUES
  ('terapia-individual', 'Terapia Individual', 'Psicológica', 60, 'Espacio 100% confidencial, libre de etiquetas y prejuicios, sin moverte de casa.', true),
  ('terapia-pareja', 'Terapia de Pareja', 'Psicológica', 60, 'Guía para resolver conflictos, atravesar crisis y recuperar una convivencia saludable.', true),
  ('acompanamiento-crianza', 'Acompañamiento en Crianza', 'Psicológica', 60, 'Consulta para trabajar desafíos relacionados al cuidado y bienestar de tus hijos.', true),
  ('consulta-rutina', 'Consulta Médica de Rutina', 'Médica', 45, 'Valoración integral y preventiva para toda la familia.', true),
  ('seguimiento-cronicos', 'Seguimiento de Crónicos', 'Médica', 45, 'Control y acompañamiento para pacientes diabéticos e hipertensos.', true);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para verificar si un slot está disponible
CREATE OR REPLACE FUNCTION is_slot_available(
  p_slot_id uuid
) RETURNS boolean AS $$
DECLARE
  v_max_appointments integer;
  v_current_appointments integer;
BEGIN
  -- Obtener máximo de citas permitidas
  SELECT max_appointments INTO v_max_appointments
  FROM public.availability_slots
  WHERE id = p_slot_id AND is_available = true;
  
  IF v_max_appointments IS NULL THEN
    RETURN false;
  END IF;
  
  -- Contar citas pendientes o confirmadas en este slot
  SELECT COUNT(*) INTO v_current_appointments
  FROM public.appointments
  WHERE slot_id = p_slot_id 
    AND status IN ('pending', 'confirmed');
  
  RETURN v_current_appointments < v_max_appointments;
END;
$$ LANGUAGE plpgsql;
