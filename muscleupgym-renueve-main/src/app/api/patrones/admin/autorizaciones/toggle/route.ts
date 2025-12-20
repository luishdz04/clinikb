// ============================================================================
// API ROUTE: Cambiar autorización de usuario (ADMIN)
// POST /api/patrones/admin/autorizaciones/toggle
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
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

    if (!employee || !employee.id) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const supabase = createClient(cookieStore);

    // Obtener datos del body
    const body = await request.json();
    const { userId, autorizado } = body;

    if (!userId || typeof autorizado !== 'boolean') {
      return NextResponse.json(
        { error: "Datos incompletos o inválidos" },
        { status: 400 }
      );
    }

    // Actualizar autorización
    const { error } = await supabase
      .from("profiles")
      .update({ patrones_autorizado: autorizado })
      .eq("id", userId);

    if (error) {
      console.error("Error al actualizar autorización:", error);
      return NextResponse.json(
        { error: "Error al actualizar autorización" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: autorizado
        ? "Usuario autorizado correctamente"
        : "Autorización removida correctamente",
    });
  } catch (error) {
    console.error("Error en API autorizaciones/toggle:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
