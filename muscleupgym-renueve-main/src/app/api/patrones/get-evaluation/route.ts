// ============================================================================
// API ROUTE: Obtener evaluación actual del usuario
// GET /api/patrones/get-evaluation
// Recupera la evaluación incompleta o última completada
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar autorización del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("patrones_autorizado")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    if (!profile.patrones_autorizado) {
      return NextResponse.json(
        { error: "No tienes autorización para realizar esta evaluación" },
        { status: 403 }
      );
    }

    // Primero buscar evaluación incompleta
    const { data: incompleta, error: incompletaError } = await supabase
      .from("patrones_evaluaciones")
      .select("*")
      .eq("user_id", user.id)
      .eq("completado", false)
      .single();

    if (incompleta) {
      return NextResponse.json({
        success: true,
        evaluacion: incompleta,
        tipo: "incompleta",
      });
    }

    // Si no hay incompleta, buscar la última completada
    const { data: completada, error: completadaError } = await supabase
      .from("patrones_evaluaciones")
      .select("*")
      .eq("user_id", user.id)
      .eq("completado", true)
      .order("fecha_completado", { ascending: false })
      .limit(1)
      .single();

    if (completada) {
      return NextResponse.json({
        success: true,
        evaluacion: completada,
        tipo: "completada",
      });
    }

    // No tiene ninguna evaluación
    return NextResponse.json({
      success: true,
      evaluacion: null,
      tipo: "ninguna",
    });
  } catch (error) {
    console.error("Error en get-evaluation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
