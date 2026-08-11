import { createAdminClient } from '@/lib/supabase/admin';
import { createAuthAnonClient, traducirErrorAuth } from '@/lib/supabase/auth-anon';
import { NextResponse } from 'next/server';
import { PatientFormData } from '@/types/patient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData: PatientFormData = await request.json();
    const adminSupabase = createAdminClient();
    const anonSupabase = createAuthAnonClient();

    if (!adminSupabase || !anonSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Se normaliza a minúsculas: Auth ya lo hace por su cuenta, y sin esto la
    // tabla `patients` acaba con variantes del mismo correo que no se
    // reconocen entre sí ("Ing.luis@..." vs "ing.luis@...").
    const email = formData.email.trim().toLowerCase();

    // ¿Ya hay un registro con este correo? ilike para alcanzar también los
    // registros anteriores a esta normalización.
    const { data: existingPatient } = await adminSupabase
      .from('patients')
      .select('id, user_id')
      .ilike('email', email)
      .maybeSingle();

    if (existingPatient) {
      // Distinguir "ya registrado" de "registró pero nunca confirmó": en el
      // segundo caso no hay que bloquearlo, hay que dejarlo terminar.
      const { data: existingUser } = existingPatient.user_id
        ? await adminSupabase.auth.admin.getUserById(existingPatient.user_id)
        : { data: { user: null } };

      const yaConfirmo = Boolean(existingUser?.user?.email_confirmed_at);

      if (yaConfirmo) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado' },
          { status: 400 }
        );
      }

      // Correo sin confirmar: se le manda un código nuevo y el formulario
      // salta directo a la pantalla de verificación.
      const { error: resendError } = await anonSupabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        console.error('Error resending signup code:', resendError);
        return NextResponse.json(
          {
            pendingVerification: true,
            email,
            error: traducirErrorAuth(resendError.message),
          },
          { status: 429 }
        );
      }

      return NextResponse.json({
        pendingVerification: true,
        email,
        message: 'Ya tenías un registro sin confirmar. Te enviamos un código nuevo.',
      });
    }

    // Alta nueva. Se usa signUp (no admin.createUser) porque es lo que dispara
    // el correo de confirmación: admin.createUser crea al usuario en silencio.
    // El usuario queda sin confirmar en Auth hasta que valide el código.
    const { data: authData, error: authError } = await anonSupabase.auth.signUp({
      email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'patient',
          status: 'pending',
        },
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: traducirErrorAuth(authError.message) },
        { status: 400 }
      );
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
          email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          marital_status: formData.marital_status,
          religion: formData.religion,
          education_level: formData.education_level,
          recurrent_illnesses: formData.recurrent_illnesses,
          consultation_goals: formData.consultation_goals,
          family_structure_status: formData.family_structure_status,
          family_structure_reason: formData.family_structure_reason,
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

    // Estructura familiar. Va en su propia tabla (1 fila por integrante).
    // Sólo se guardan si el paciente declaró que iba a registrarlos: así la
    // declaración y las filas nunca se contradicen, aunque el POST no venga
    // del formulario.
    const declaroIntegrantes = formData.family_structure_status === 'registrada';
    const familyMembers = (declaroIntegrantes ? formData.family_members ?? [] : [])
      .filter((member) => member?.full_name?.trim() && member?.relationship?.trim())
      .map((member, index) => ({
        patient_id: patient.id,
        full_name: member.full_name.trim(),
        relationship: member.relationship.trim(),
        age: member.age ?? null,
        occupation: member.occupation?.trim() || null,
        position: index,
      }));

    if (familyMembers.length > 0) {
      const { error: familyError } = await adminSupabase
        .from('patient_family_members')
        .insert(familyMembers);

      // No abortamos el registro: el paciente ya existe y su alta es lo crítico.
      // La estructura familiar se puede completar después desde la ficha.
      if (familyError) {
        console.error('Error inserting family members:', familyError);
      }
    }

    // El aviso al admin ya NO se manda aquí: se manda al verificar el código
    // (ver /api/auth/verify-code). Si se mandara ahora, el admin recibiría
    // solicitudes de gente que nunca confirmó su correo.
    console.log('Patient registered - awaiting email verification:', patient.id);

    return NextResponse.json({
      success: true,
      pendingVerification: true,
      email: patient.email,
      message: 'Te enviamos un código de verificación a tu correo.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
