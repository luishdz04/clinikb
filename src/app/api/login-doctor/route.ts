import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Buscar doctor por email
    const { data: doctor, error } = await adminClient
      .from('doctors')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Doctor lookup:', {
      email,
      found: !!doctor,
      error,
      doctorData: doctor
        ? {
            id: doctor.id,
            email: doctor.email,
            hasPasswordHash: !!doctor.password_hash,
            status: doctor.status,
            deleted: doctor._deleted,
          }
        : null,
    });

    if (error || !doctor) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar si está eliminado o inactivo
    if (doctor._deleted) {
      return NextResponse.json({ error: 'Cuenta eliminada' }, { status: 403 });
    }

    if (doctor.status !== 'active') {
      return NextResponse.json({ error: 'Cuenta inactiva' }, { status: 403 });
    }

    // Verificar contraseña
    if (!doctor.password_hash) {
      console.log('No password_hash found for doctor');
      return NextResponse.json(
        { error: 'Configuración de contraseña incorrecta' },
        { status: 500 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, doctor.password_hash);

    if (!passwordMatch) {
      console.log('Password mismatch');
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Login exitoso - devolver datos del doctor
    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        full_name: doctor.full_name,
        phone: doctor.phone,
        specialty: doctor.specialty,
        role: doctor.role,
      },
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
