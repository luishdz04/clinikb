# Checklist de Configuración para Muscle Up Gym

Antes de probar el flujo de registro completo, asegúrate de tener configurados los siguientes elementos:

## 1. Variables de Entorno (.env.local)
Asegúrate de que tu archivo `.env.local` contenga la clave de API de Resend.
```env
RESEND_API_KEY=re_123456789...
```
*Si no tienes una, obtenla en [resend.com](https://resend.com).*

## 2. Supabase Storage
Debes tener un "Bucket" público llamado `muscleup-files`.
1. Ve a tu proyecto en Supabase > Storage.
2. Crea un nuevo bucket llamado `muscleup-files`.
3. Asegúrate de que sea **Public**.
4. (Opcional pero recomendado) Configura políticas RLS si es necesario, pero para pruebas iniciales el acceso público de lectura es vital para que el PDF se pueda descargar.

## 3. Supabase Database (Tabla `profiles`)
Asegúrate de que la tabla `profiles` exista y tenga las columnas necesarias.
Puedes ejecutar este SQL en el Editor SQL de Supabase para verificar/crear:

```sql
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  whatsapp text,
  birth_date date,
  gender text,
  marital_status text,
  is_minor boolean,
  tutor_id_url text,
  profile_picture_url text,
  address_street text,
  address_number text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_postal_code text,
  address_country text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_condition text,
  blood_type text,
  main_motivation text,
  training_level text,
  referred_by text,
  receive_plans boolean,
  rol text default 'cliente',
  signature_url text,
  contract_pdf_url text, -- Importante para el segundo correo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Política básica (ajustar según necesidad)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

## 4. Prueba
1. **IMPORTANTE**: Reinicia tu servidor de desarrollo (`Ctrl+C` y luego `npm run dev`) para que se apliquen los cambios de dependencias.
2. Ve a `http://localhost:3000/register`.
3. Completa el formulario. **Usa un correo nuevo** si el anterior falló pero se creó el usuario (o borra el usuario en Supabase Auth).
4. Revisa tu correo (o la consola de Resend si estás en modo prueba) para el correo de confirmación.
5. Haz clic en el enlace de confirmación.
6. Deberías ser redirigido a la página de bienvenida y recibir el segundo correo con el PDF.
