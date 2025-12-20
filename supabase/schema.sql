-- Create doctors table (admins)
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    specialty TEXT, -- 'Psicología' o 'Medicina Familiar'
    role TEXT DEFAULT 'doctor' NOT NULL CHECK (role IN ('doctor', 'admin')),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    _deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_doctors_status ON public.doctors(status);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    referral_source TEXT,
    attention_type TEXT NOT NULL CHECK (attention_type IN ('Psicológica', 'Médica')),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by UUID REFERENCES public.doctors(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    terms_accepted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);

-- Create index on status for admin queries
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

-- Create index on attention_type
CREATE INDEX IF NOT EXISTS idx_patients_attention_type ON public.patients(attention_type);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies for doctors table
CREATE POLICY "Allow doctors to select themselves" ON public.doctors
    FOR SELECT
    TO authenticated
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Allow public select on active doctors" ON public.doctors
    FOR SELECT
    TO public
    USING (status = 'active' AND _deleted = false);

-- Policies for patients table
CREATE POLICY "Allow public insert on patients" ON public.patients
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on patients" ON public.patients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow select for authenticated users only (admin and approved patients)
CREATE POLICY "Allow authenticated select on patients" ON public.patients
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow update for authenticated users only (admin)
CREATE POLICY "Allow authenticated update on patients" ON public.patients
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for doctors
CREATE TRIGGER set_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to automatically update updated_at for patients
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT SELECT, INSERT ON public.patients TO anon;
GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.doctors TO authenticated;

-- Insert initial doctor (Dra. Cynthia de Luna Hernández)
-- Password: Clinikb2025
INSERT INTO public.doctors (email, password_hash, full_name, phone, specialty, role, status)
VALUES (
    'cynthia@clinikb.com',
    '$2b$10$rxEKQBnqGdi/l8kU.HaBaez9vhe0YFsErC985RsStIqDpBOgZituS',
    'Dra. Cynthia Kristell de Luna Hernández',
    '8661597283',
    'Psicología',
    'admin',
    'active'
)
ON CONFLICT (email) DO NOTHING;
