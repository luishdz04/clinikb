// ============================================================================
// API ROUTE: Listar usuarios para autorización (ADMIN)
// GET /api/patrones/admin/autorizaciones/list
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

    if (!employee || !employee.id) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const supabase = createClient(cookieStore);

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const busqueda = searchParams.get("busqueda");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase
      .from("profiles")
      .select("id, first_name, last_name, email, whatsapp, patrones_autorizado", { count: "exact" })
      .order("first_name", { ascending: true });

    // Búsqueda por nombre o email
    if (busqueda) {
      query = query.or(`first_name.ilike.%${busqueda}%,last_name.ilike.%${busqueda}%,email.ilike.%${busqueda}%`);
    }

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data: usuarios, error, count } = await query;

    if (error) {
      console.error("Error al obtener usuarios:", error);
      return NextResponse.json(
        { error: "Error al obtener usuarios" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      usuarios: usuarios || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Error en API autorizaciones/list:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
