import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Obtener contraseña de acceso desde variable de entorno
    const correctPassword = process.env.ADMIN_ACCESS_PASSWORD || 'muscleup2025';
    
    if (password === correctPassword) {
      // Establecer cookie de acceso válida por 8 horas
      const cookieStore = await cookies();
      cookieStore.set('admin_access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 horas
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
  } catch (error) {
    console.error('Error validating admin access:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
