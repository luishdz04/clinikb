import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctor_id");

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

    // Filtrar por doctor si se proporciona
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

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
