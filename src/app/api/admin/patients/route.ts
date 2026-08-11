import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Se trae la estructura familiar en la misma consulta: son pocas filas por
    // paciente y evita una petición por cada ficha que se abra.
    const { data, error } = await adminSupabase
      .from('patients')
      .select('*, family_members:patient_family_members(*)')
      .order('created_at', { ascending: false })
      .order('position', { referencedTable: 'patient_family_members', ascending: true });

    if (error) throw error;

    return NextResponse.json({ patients: data || [] });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Error al cargar pacientes' },
      { status: 500 }
    );
  }
}
