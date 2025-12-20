import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendEmail, getApprovalEmailHTML } from '@/lib/email/nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { patientId, doctorId } = await request.json();

    if (!patientId || !doctorId) {
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

    // Confirmar el email del usuario en Auth
    if (patient.user_id) {
      const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
        patient.user_id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('Error confirming email:', confirmError);
      }
    }

    // Actualizar estado del paciente a aprobado
    const { error: updateError } = await adminSupabase
      .from('patients')
      .update({
        status: 'approved',
        approved_by: doctorId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', patientId);

    if (updateError) {
      console.error('Error updating patient:', updateError);
      return NextResponse.json(
        { error: 'Error al aprobar paciente' },
        { status: 500 }
      );
    }

    // Enviar email de aprobación
    try {
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const loginUrl = `${origin}/login/paciente`;
      const html = getApprovalEmailHTML(patient.full_name, loginUrl);

      await sendEmail({
        to: patient.email,
        subject: '¡Tu cuenta en CliniKB ha sido aprobada!',
        html,
      });

      console.log('Approval email sent to:', patient.email);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // No fallar la aprobación si falla el correo
    }

    return NextResponse.json({
      success: true,
      message: 'Paciente aprobado exitosamente',
    });
  } catch (error) {
    console.error('Approve patient error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}