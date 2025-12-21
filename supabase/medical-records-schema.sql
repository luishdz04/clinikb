-- Tabla de Historial Clínico / Medical Records
-- Esta tabla almacena los registros médicos y psicológicos de cada consulta

CREATE TABLE public.medical_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  appointment_id uuid,
  doctor_id uuid NOT NULL,
  
  -- Información de la consulta
  visit_date date NOT NULL,
  chief_complaint text, -- Motivo de consulta principal
  
  -- Signos vitales (principalmente para atención médica)
  blood_pressure text, -- Presión arterial (ej: "120/80")
  heart_rate integer, -- Frecuencia cardíaca (bpm)
  temperature numeric(4,1), -- Temperatura corporal (°C)
  weight numeric(5,2), -- Peso (kg)
  height numeric(5,2), -- Altura (cm)
  bmi numeric(4,2), -- Índice de masa corporal (calculado)
  
  -- Historia clínica
  current_illness text, -- Padecimiento actual
  medical_history text, -- Antecedentes médicos personales
  family_history text, -- Antecedentes familiares
  allergies text, -- Alergias conocidas
  current_medications text, -- Medicamentos actuales
  
  -- Evaluación psicológica (principalmente para atención psicológica)
  mental_status text, -- Estado mental
  mood text, -- Estado de ánimo
  affect text, -- Afecto
  thought_process text, -- Proceso de pensamiento
  thought_content text, -- Contenido del pensamiento
  perception text, -- Percepción
  cognition text, -- Cognición
  insight text, -- Insight
  judgment text, -- Juicio
  risk_assessment text, -- Evaluación de riesgo (suicidio, homicidio, etc.)
  
  -- Examen físico (para atención médica)
  physical_examination text, -- Examen físico general
  
  -- Diagnóstico y tratamiento
  diagnosis text NOT NULL, -- Diagnóstico principal
  differential_diagnosis text, -- Diagnóstico diferencial
  treatment_plan text, -- Plan de tratamiento
  prescriptions text, -- Recetas médicas
  recommendations text, -- Recomendaciones generales
  
  -- Seguimiento
  next_visit_date date, -- Fecha de próxima cita sugerida
  follow_up_notes text, -- Notas de seguimiento
  
  -- Archivos adjuntos (JSON array de URLs)
  attachments jsonb DEFAULT '[]'::jsonb,
  -- Ejemplo: [{"type": "lab_result", "url": "...", "name": "..."}]
  
  -- Metadatos
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT medical_records_pkey PRIMARY KEY (id),
  CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE,
  CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON public.medical_records(visit_date DESC);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_medical_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_records_updated_at();

-- Comentarios de la tabla
COMMENT ON TABLE public.medical_records IS 'Historial clínico de los pacientes. Incluye registros médicos y psicológicos.';
COMMENT ON COLUMN public.medical_records.chief_complaint IS 'Motivo principal de la consulta';
COMMENT ON COLUMN public.medical_records.risk_assessment IS 'Evaluación de riesgo suicida u homicida (principalmente para psicología)';
COMMENT ON COLUMN public.medical_records.attachments IS 'Array JSON de archivos adjuntos (estudios, recetas, etc.)';
