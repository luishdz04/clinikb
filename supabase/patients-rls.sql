-- Políticas RLS para la tabla patients

-- Habilitar RLS si no está habilitado
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public insert on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow anon insert on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow authenticated insert on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public select on patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view own data" ON public.patients;
DROP POLICY IF EXISTS "Service role bypass" ON public.patients;

-- Política para permitir registro público (INSERT anónimo)
CREATE POLICY "Allow anon insert on patients" 
ON public.patients
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir INSERT autenticado
CREATE POLICY "Allow authenticated insert on patients" 
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para que los pacientes puedan ver su propia información
CREATE POLICY "Patients can view own data" 
ON public.patients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para que los pacientes puedan actualizar su propia información
CREATE POLICY "Patients can update own data" 
ON public.patients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role tiene acceso total (usado por admin client)
CREATE POLICY "Service role bypass" 
ON public.patients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Comentario
COMMENT ON TABLE public.patients IS 'Tabla de pacientes con RLS habilitado. Service role tiene acceso completo.';
