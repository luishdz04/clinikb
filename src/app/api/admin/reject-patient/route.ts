import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { patientId, doctorId, rejectionReason } = await request.json();

    if (!patientId || !doctorId || !rejectionReason) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
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

    // Obtener datos del paciente
    const { data: patient, error: patientError } = await adminSupabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (patient.status !== 'pending') {
      return NextResponse.json(
        { error: 'El paciente ya fue procesado' },
        { status: 400 }
      );
    }

    // Actualizar estado del paciente a rechazado
    const { error: updateError } = await adminSupabase
      .from('patients')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        approved_by: doctorId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', patientId);

    if (updateError) {
      console.error('Error updating patient:', updateError);
      return NextResponse.json(
        { error: 'Error al rechazar paciente' },
        { status: 500 }
      );
    }

    // Opcional: Eliminar usuario de Auth si fue rechazado
    if (patient.user_id) {
      try {
        await adminSupabase.auth.admin.deleteUser(patient.user_id);
        console.log('Auth user deleted for rejected patient:', patient.user_id);
      } catch (deleteError) {
        console.error('Error deleting auth user:', deleteError);
        // No fallar el rechazo si falla eliminar el usuario
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Paciente rechazado',
    });
  } catch (error) {
    console.error('Reject patient error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
