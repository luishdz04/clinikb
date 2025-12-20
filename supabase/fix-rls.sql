-- Eliminar política existente y crear nuevas
DROP POLICY IF EXISTS "Allow public insert on patients" ON public.patients;

-- Crear política para usuarios anónimos (registro público)
CREATE POLICY "Allow anon insert on patients" ON public.patients
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Crear política para usuarios autenticados
CREATE POLICY "Allow authenticated insert on patients" ON public.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
