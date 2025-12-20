// ============================================================================
// API ROUTE: Guardar progreso de evaluación de patrones alimentarios
// POST /api/patrones/save-progress
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { PatronesRespuestas } from "@/types/patrones";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verificar autenticación
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

    // Obtener datos del body
    const body = await request.json();
    const {
      paso_actual,
      respuestas,
    }: {
      paso_actual: number;
      respuestas: PatronesRespuestas;
    } = body;

    // Validar datos requeridos
    if (!paso_actual || !respuestas) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Obtener datos del perfil del usuario y verificar autorización
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("nombre, email, telefono, edad, sexo, patrones_autorizado")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario esté autorizado
    if (!profile.patrones_autorizado) {
      return NextResponse.json(
        { error: "No tienes autorización para realizar esta evaluación" },
        { status: 403 }
      );
    }

    // Obtener IP del cliente
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Buscar si ya existe una evaluación incompleta del usuario
    const { data: existing, error: existingError } = await supabase
      .from("patrones_evaluaciones")
      .select("id")
      .eq("user_id", user.id)
      .eq("completado", false)
      .single();

    let result;

    if (existing) {
      // Actualizar evaluación existente
      const { data, error } = await supabase
        .from("patrones_evaluaciones")
        .update({
          paso_actual,
          respuestas,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error al actualizar evaluación:", error);
        return NextResponse.json(
          { error: "Error al guardar progreso" },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Crear nueva evaluación
      const { data, error } = await supabase
        .from("patrones_evaluaciones")
        .insert({
          user_id: user.id,
          nombre: profile.nombre || "Sin nombre",
          email: profile.email || user.email || "Sin email",
          telefono: profile.telefono || null,
          edad: profile.edad || null,
          sexo: profile.sexo || null,
          paso_actual,
          respuestas,
          ip_address: ip,
        })
        .select()
        .single();

      if (error) {
        console.error("Error al crear evaluación:", error);
        return NextResponse.json(
          { error: "Error al crear evaluación" },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      evaluacion: result,
    });
  } catch (error) {
    console.error("Error en save-progress:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
