import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { PatientFormData } from '@/types/patient';
import { sendEmail } from '@/lib/email/nodemailer';
import { getNewRegistrationEmailHTML } from '@/lib/email/registration-notification';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData: PatientFormData = await request.json();
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Validar que el email no esté registrado usando admin client
    const { data: existingPatient } = await adminSupabase
      .from('patients')
      .select('id')
      .eq('email', formData.email)
      .single();

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Crear usuario en Auth con generateLink (no confirmado hasta aprobación)
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const { data: authData, error: authError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email: formData.email,
      password: formData.password,
      options: {
        redirectTo: `${origin}/cliente/dashboard`,
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'patient',
          status: 'pending', // Guardamos status en metadata
        },
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      );
    }

    // Insertar paciente en la base de datos con status='pending'
    // Usamos adminSupabase para bypasear RLS
    const { data: patient, error: insertError } = await adminSupabase
      .from('patients')
      .insert([
        {
          user_id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          referral_source: formData.referral_source,
          attention_type: formData.attention_type,
          status: 'pending',
          terms_accepted: formData.terms_accepted,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting patient:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar el paciente' },
        { status: 500 }
      );
    }

    // Enviar notificación al admin
    try {
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const dashboardUrl = `${origin}/admin/dashboard`;
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      
      if (adminEmail) {
        const html = getNewRegistrationEmailHTML(
          patient.full_name,
          patient.email,
          dashboardUrl
        );

        await sendEmail({
          to: adminEmail,
          subject: `CliniKB - Nuevo Registro Pendiente: ${patient.full_name}`,
          html,
        });

        console.log('Admin notification sent to:', adminEmail);
      }
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // No fallar el registro si falla el email
    }

    console.log('Patient registered successfully - pending approval:', patient.id);

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Tu solicitud está pendiente de aprobación.',
      patient: {
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
