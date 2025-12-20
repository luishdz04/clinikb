import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Buscar empleado por email
    const { data: employee, error } = await adminClient
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Employee lookup:', { 
      email, 
      found: !!employee, 
      error,
      employeeData: employee ? {
        id: employee.id,
        email: employee.email,
        hasPasswordHash: !!employee.password_hash,
        status: employee.status,
        deleted: employee._deleted
      } : null
    });

    if (error || !employee) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Verificar si está eliminado
    if (employee._deleted) {
      return NextResponse.json({ error: 'Cuenta eliminada' }, { status: 403 });
    }

    // Verificar contraseña
    if (!employee.password_hash) {
      console.log('No password_hash found for employee');
      return NextResponse.json({ error: 'Configuración de contraseña incorrecta' }, { status: 500 });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password_hash);
    
    if (!passwordMatch) {
      console.log('Password mismatch');
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // Verificar que esté activo
    if (employee.status !== 'active') {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
    }

    // Establecer cookie de sesión de empleado
    const cookieStore = await cookies();
    const employeeData = {
      id: employee.id,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      position: employee.position,
      department: employee.department,
      employee_number: employee.employee_number,
    };
    
    cookieStore.set('employee_session', JSON.stringify(employeeData), {
      httpOnly: false, // Necesita ser false para que JavaScript pueda leerla
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      employee: employeeData
    });
  } catch (error) {
    console.error('Error in employee login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
