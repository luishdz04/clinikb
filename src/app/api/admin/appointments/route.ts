import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { COOKIE_SESION_DOCTOR, verificarSesionDoctor } from "@/lib/auth/doctorSession";

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    // El doctor sale de la sesión, no de la query. Antes, sin `doctor_id` en
    // la URL, la ruta devolvía las citas de TODOS los doctores: los datos de
    // pacientes ajenos quedaban a la vista de cualquier miembro del personal.
    const galletas = await cookies();
    const sesion = await verificarSesionDoctor(galletas.get(COOKIE_SESION_DOCTOR)?.value);
    if (!sesion) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const doctorId = sesion.id;

    // Construir query base
    let query = supabase
      .from("appointments")
      .select(`
        *,
        patient:patients(id, full_name, email, phone),
        service:services(id, key, title, category, duration_minutes)
      `)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });

    query = query.eq("doctor_id", doctorId);

    const { data: appointments, error } = await query;

    if (error) {
      console.error("Error fetching appointments:", error);
      return NextResponse.json(
        { error: "Error al obtener las citas" },
        { status: 500 }
      );
    }

    console.log("Appointments fetched:", appointments?.length || 0);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error in appointments GET:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
