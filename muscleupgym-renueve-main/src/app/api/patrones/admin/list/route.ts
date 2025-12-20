// ============================================================================
// API ROUTE: Listar evaluaciones (ADMIN)
// GET /api/patrones/admin/list
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Verificar que la sesión contenga datos válidos
    if (!employee || !employee.id) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const supabase = createClient(cookieStore);

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const completado = searchParams.get("completado"); // 'true', 'false', o null (todas)
    const busqueda = searchParams.get("busqueda"); // búsqueda por nombre o email
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from("patrones_evaluaciones")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filtrar por completado
    if (completado === "true") {
      query = query.eq("completado", true);
    } else if (completado === "false") {
      query = query.eq("completado", false);
    }

    // Búsqueda por nombre o email
    if (busqueda && busqueda.trim() !== "") {
      query = query.or(
        `nombre.ilike.%${busqueda}%,email.ilike.%${busqueda}%`
      );
    }

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error al listar evaluaciones:", error);
      return NextResponse.json(
        { error: "Error al obtener evaluaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluaciones: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error en admin/list:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
