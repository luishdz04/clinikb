import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Obtener registros médicos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patient_id");
    const doctorId = searchParams.get("doctor_id");
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

    // Filtrar por doctor
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

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
    const supabase = await createClient();
    const body = await request.json();

    const {
      patient_id,
      appointment_id,
      doctor_id,
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
    if (!patient_id || !doctor_id || !visit_date || !diagnosis) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: patient_id, doctor_id, visit_date, diagnosis" },
        { status: 400 }
      );
    }

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert({
        patient_id,
        appointment_id,
        doctor_id,
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
    const supabase = await createClient();
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
    const supabase = await createClient();
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
      .eq("id", id);

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
