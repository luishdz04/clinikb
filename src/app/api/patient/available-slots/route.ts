import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const service_id = searchParams.get("service_id");
    const date = searchParams.get("date");

    if (!service_id || !date) {
      return NextResponse.json(
        { error: "Se requiere service_id y date" },
        { status: 400 }
      );
    }

    // Obtener slots disponibles para el servicio y fecha
    const { data: slots, error: slotsError } = await supabase
      .from("availability_slots")
      .select(`
        *,
        doctor:doctors (
          id,
          full_name,
          specialty
        )
      `)
      .eq("service_id", service_id)
      .eq("slot_date", date)
      .eq("is_available", true)
      .order("start_time", { ascending: true });

    if (slotsError) {
      console.error("Error fetching slots:", slotsError);
      return NextResponse.json(
        { error: "Error al cargar horarios disponibles" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slots: slots || [],
      date,
      service_id,
    });
  } catch (error) {
    console.error("Error in GET /api/patient/available-slots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
