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
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "Se requiere start_date y end_date" },
        { status: 400 }
      );
    }

    // Obtener todos los slots disponibles en el rango de fechas
    const { data: slots, error: slotsError } = await supabase
      .from("availability_slots")
      .select(`
        *,
        doctor:doctors (
          id,
          full_name,
          specialty
        ),
        service:services (
          id,
          title,
          category,
          duration_minutes
        )
      `)
      .gte("slot_date", start_date)
      .lte("slot_date", end_date)
      .eq("is_available", true)
      .order("slot_date", { ascending: true })
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
      start_date,
      end_date,
    });
  } catch (error) {
    console.error("Error in GET /api/patient/available-slots/month:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
