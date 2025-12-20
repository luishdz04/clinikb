import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Obtener servicios del doctor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctor_id');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'doctor_id es requerido' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { data, error } = await adminSupabase
      .from('doctor_services')
      .select(`
        *,
        service:services(*)
      `)
      .eq('doctor_id', doctorId)
      .eq('active', true);

    if (error) throw error;

    return NextResponse.json({ doctorServices: data || [] });
  } catch (error: any) {
    console.error('Error fetching doctor services:', error);
    return NextResponse.json(
      { error: 'Error al cargar servicios' },
      { status: 500 }
    );
  }
}

// POST - Actualizar servicios del doctor
export async function POST(request: Request) {
  try {
    const { doctorId, serviceIds } = await request.json();

    if (!doctorId || !Array.isArray(serviceIds)) {
      return NextResponse.json(
        { error: 'doctorId y serviceIds son requeridos' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Desactivar todos los servicios existentes
    await adminSupabase
      .from('doctor_services')
      .update({ active: false })
      .eq('doctor_id', doctorId);

    // Insertar o reactivar servicios seleccionados
    for (const serviceId of serviceIds) {
      const { data: existing } = await adminSupabase
        .from('doctor_services')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('service_id', serviceId)
        .single();

      if (existing) {
        // Reactivar
        await adminSupabase
          .from('doctor_services')
          .update({ active: true })
          .eq('id', existing.id);
      } else {
        // Insertar nuevo
        await adminSupabase
          .from('doctor_services')
          .insert({
            doctor_id: doctorId,
            service_id: serviceId,
            active: true,
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Servicios actualizados exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating doctor services:', error);
    return NextResponse.json(
      { error: 'Error al actualizar servicios' },
      { status: 500 }
    );
  }
}
