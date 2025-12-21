import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const adminSupabase = createAdminClient();
    
    if (!adminSupabase) {
      console.error('Admin client not available');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Verificar que el paciente existe y está aprobado usando admin client
    const { data: patient, error: patientError } = await adminSupabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .single();

    if (patientError || !patient) {
      console.error('Patient not found:', patientError);
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

    // Si el paciente no tiene user_id, no puede hacer login
    if (!patient.user_id) {
      console.error('Patient has no user_id');
      return NextResponse.json(
        { error: 'Error en la configuración de tu cuenta. Contacta al administrador.' },
        { status: 500 }
      );
    }

    // Login con Supabase Auth usando client normal
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      // Proporcionar más detalles del error en desarrollo
      return NextResponse.json(
        { 
          error: 'Credenciales incorrectas',
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al iniciar sesión' },
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
