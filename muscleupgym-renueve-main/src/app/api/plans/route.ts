import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    if (!supabaseAdmin) {
      console.error('[API /api/plans] Error: No se pudo crear cliente admin de Supabase');
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json([], { status: 200 });
      }
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }
    
    const { data, error } = await supabaseAdmin
      .from('membership_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /api/plans] Supabase error:', error);
      // En desarrollo, retornar array vacío en lugar de error
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json([], { status: 200 });
      }
      return NextResponse.json(
        { 
          error: error.message,
          details: error.details || null,
          hint: error.hint || null
        }, 
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/plans] Unexpected error:', error);
    
    // En desarrollo, retornar array vacío
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error?.message || 'Error desconocido'
      }, 
      { status: 500 }
    );
  }
}
