import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

    const supabase = await createClient();

    // Verificar que el paciente existe y está aprobado
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (patient.status === 'pending') {
      return NextResponse.json(
        { error: 'Tu cuenta está pendiente de aprobación' },
        { status: 403 }
      );
    }

    if (patient.status === 'rejected') {
      return NextResponse.json(
        { error: 'Tu solicitud fue rechazada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: patient.full_name,
        phone: patient.phone,
        attention_type: patient.attention_type,
      },
    });
  } catch (error) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
