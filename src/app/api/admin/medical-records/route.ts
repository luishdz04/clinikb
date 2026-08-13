import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";

// GET - Obtener registros médicos
export async function GET(request: NextRequest) {
  try {
    // Cliente admin, no el de cookies: los doctores no están en Supabase Auth,
    // así que el cliente anónimo corría sin permisos sobre medical_records y
    // la consulta fallaba siempre. La identidad ya se verifica con la sesión.
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patient_id");
    const recordId = searchParams.get("record_id");

    // Si se solicita un registro específico
    if (recordId) {
      const { data: record, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          patient:patients(id, full_name, email, phone, date_of_birth, attention_type),
          doctor:doctors(id, full_name, specialty),
          appointment:appointments(id, appointment_date, service:services(title))
        `)
        .eq("id", recordId)
        .single();

      if (error) {
        console.error("Error fetching medical record:", error);
        return NextResponse.json(
          { error: "Error al obtener el registro médico" },
          { status: 500 }
        );
      }

      return NextResponse.json({ record });
    }

    // Construir query
    let query = supabase
      .from("medical_records")
      .select(`
        *,
        patient:patients(id, full_name, email, phone, date_of_birth, attention_type),
        doctor:doctors(id, full_name, specialty)
      `)
      .order("visit_date", { ascending: false });

    // Filtrar por paciente
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    // El doctor sale de la sesión, no de la query. Antes, sin `doctor_id` en
    // la URL, la ruta devolvía los expedientes de TODOS los doctores: notas
    // clínicas, diagnósticos y evaluaciones de salud mental de pacientes
    // ajenos, a la vista de cualquier miembro del personal.
    const galletas = await cookies();
    const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
    if (!sesion) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    query = query.eq("doctor_id", sesion.id);

    const { data: records, error } = await query;

    if (error) {
      console.error("Error fetching medical records:", error);
      return NextResponse.json(
        { error: "Error al obtener los registros médicos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error in medical records GET:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro médico
export async function POST(request: NextRequest) {
  try {
    // El autor del expediente es quien tiene la sesión, no lo que venga en el
    // cuerpo: si no, un miembro del personal podría firmar notas clínicas a
    // nombre de otro doctor.
    const galletas = await cookies();
    const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
    if (!sesion) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }


    // Cliente admin, no el de cookies: los doctores no están en Supabase Auth,
    // así que el cliente anónimo corría sin permisos sobre medical_records y
    // la consulta fallaba siempre. La identidad ya se verifica con la sesión.
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }
    const body = await request.json();

    const {
      patient_id,
      appointment_id,
      visit_date,
      chief_complaint,
      blood_pressure,
      heart_rate,
      temperature,
      weight,
      height,
      bmi,
      current_illness,
      medical_history,
      family_history,
      allergies,
      current_medications,
      mental_status,
      mood,
      affect,
      thought_process,
      thought_content,
      perception,
      cognition,
      insight,
      judgment,
      risk_assessment,
      physical_examination,
      diagnosis,
      differential_diagnosis,
      treatment_plan,
      prescriptions,
      recommendations,
      next_visit_date,
      follow_up_notes,
      attachments,
    } = body;

    // Validar campos requeridos
    if (!patient_id || !visit_date || !diagnosis) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: patient_id, visit_date, diagnosis" },
        { status: 400 }
      );
    }

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({
        patient_id,
        appointment_id,
        doctor_id: sesion.id,
        visit_date,
        chief_complaint,
        blood_pressure,
        heart_rate,
        temperature,
        weight,
        height,
        bmi,
        current_illness,
        medical_history,
        family_history,
        allergies,
        current_medications,
        mental_status,
        mood,
        affect,
        thought_process,
        thought_content,
        perception,
        cognition,
        insight,
        judgment,
        risk_assessment,
        physical_examination,
        diagnosis,
        differential_diagnosis,
        treatment_plan,
        prescriptions,
        recommendations,
        next_visit_date,
        follow_up_notes,
        attachments: attachments || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating medical record:", error);
      return NextResponse.json(
        { error: "Error al crear el registro médico" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registro médico creado exitosamente",
      record,
    });
  } catch (error) {
    console.error("Error in medical records POST:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar registro médico
export async function PUT(request: NextRequest) {
  try {
    // El autor del expediente es quien tiene la sesión, no lo que venga en el
    // cuerpo: si no, un miembro del personal podría firmar notas clínicas a
    // nombre de otro doctor.
    const galletas = await cookies();
    const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
    if (!sesion) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }


    // Cliente admin, no el de cookies: los doctores no están en Supabase Auth,
    // así que el cliente anónimo corría sin permisos sobre medical_records y
    // la consulta fallaba siempre. La identidad ya se verifica con la sesión.
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del registro es requerido" },
        { status: 400 }
      );
    }

    const { data: record, error } = await supabase
      .from("medical_records")
      .update(updateData)
      .eq("id", id)
      // Acotado al autor: nadie edita el expediente de otro doctor.
      .eq("doctor_id", sesion.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating medical record:", error);
      return NextResponse.json(
        { error: "Error al actualizar el registro médico" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registro médico actualizado exitosamente",
      record,
    });
  } catch (error) {
    console.error("Error in medical records PUT:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro médico
export async function DELETE(request: NextRequest) {
  try {
    // El autor del expediente es quien tiene la sesión, no lo que venga en el
    // cuerpo: si no, un miembro del personal podría firmar notas clínicas a
    // nombre de otro doctor.
    const galletas = await cookies();
    const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
    if (!sesion) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }


    // Cliente admin, no el de cookies: los doctores no están en Supabase Auth,
    // así que el cliente anónimo corría sin permisos sobre medical_records y
    // la consulta fallaba siempre. La identidad ya se verifica con la sesión.
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del registro es requerido" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("medical_records")
      .delete()
      .eq("id", id)
      .eq("doctor_id", sesion.id);

    if (error) {
      console.error("Error deleting medical record:", error);
      return NextResponse.json(
        { error: "Error al eliminar el registro médico" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registro médico eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error in medical records DELETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
