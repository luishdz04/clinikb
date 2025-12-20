// ============================================================================
// API ROUTE: Obtener evaluación específica (ADMIN)
// GET /api/patrones/admin/[id]
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;
    
    // Verificar sesión de empleado (admin)
    const employeeSession = cookieStore.get('employee_session')?.value;
    
    if (!employeeSession) {
      return NextResponse.json({ error: "No autenticado - Sesión de empleado requerida" }, { status: 401 });
    }

    let employee;
    try {
      employee = JSON.parse(employeeSession);
    } catch (e) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // Verificar que la sesión contenga datos válidos
    if (!employee || !employee.id) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const supabase = createClient(cookieStore);

    // Obtener evaluación específica
    const { data: evaluacion, error } = await supabase
      .from("patrones_evaluaciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !evaluacion) {
      return NextResponse.json(
        { error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluacion,
    });
  } catch (error) {
    console.error("Error en admin/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
