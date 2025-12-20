// ============================================================================
// API ROUTE: Finalizar evaluación de patrones alimentarios
// POST /api/patrones/finalize
// Marca la evaluación como completada y envía emails
// ============================================================================

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { PatronesRespuestas } from "@/types/patrones";
import { Resend } from "resend";
import PatronesCompletedEmail from "@/emails/PatronesCompletedEmail";
import PatronesAdminSummaryEmail from "@/emails/PatronesAdminSummaryEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos del body
    const body = await request.json();
    const { respuestas }: { respuestas: PatronesRespuestas } = body;

    // Validar datos requeridos
    if (!respuestas) {
      return NextResponse.json(
        { error: "Respuestas incompletas" },
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

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Obtener IP del cliente
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = new Date().toISOString();

    // Buscar si ya existe una evaluación incompleta del usuario
    const { data: existing, error: existingError } = await supabase
      .from("patrones_evaluaciones")
      .select("id")
      .eq("user_id", user.id)
      .eq("completado", false)
      .single();

    let evaluacionFinal;

    if (existing) {
      // Actualizar evaluación existente y marcarla como completada
      const { data, error } = await supabase
        .from("patrones_evaluaciones")
        .update({
          paso_actual: 13,
          respuestas,
          completado: true,
          fecha_completado: now,
          updated_at: now,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error al finalizar evaluación:", error);
        return NextResponse.json(
          { error: "Error al finalizar evaluación" },
          { status: 500 }
        );
      }

      evaluacionFinal = data;
    } else {
      // Crear nueva evaluación directamente completada
      const { data, error } = await supabase
        .from("patrones_evaluaciones")
        .insert({
          user_id: user.id,
          nombre: profile.nombre || "Sin nombre",
          email: profile.email || user.email || "Sin email",
          telefono: profile.telefono || null,
          edad: profile.edad || null,
          sexo: profile.sexo || null,
          paso_actual: 13,
          respuestas,
          completado: true,
          fecha_completado: now,
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

      evaluacionFinal = data;
    }

    // ============================================================================
    // ENVÍO DE EMAILS
    // ============================================================================

    const userName = profile.nombre || "Cliente";
    const userEmail = profile.email || user.email || "";
    const evaluationDate = new Date(now).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Email 1: Confirmación al usuario
    try {
      await resend.emails.send({
        from: "Muscle Up GYM <administracion@muscleupgym.fitness>",
        to: userEmail,
        subject: "✅ Evaluación de Patrones Alimentarios Completada",
        react: PatronesCompletedEmail({
          userName,
          evaluationDate,
        }),
      });
      console.log(`Email de confirmación enviado a ${userEmail}`);
    } catch (emailError) {
      console.error("Error al enviar email al usuario:", emailError);
      // No detenemos el proceso si falla el email
    }

    // Email 2: Resumen al equipo administrativo
    try {
      await resend.emails.send({
        from: "Muscle Up GYM <administracion@muscleupgym.fitness>",
        to: "administracion@muscleupgym.fitness",
        subject: `📋 Nueva Evaluación de Patrones - ${userName}`,
        react: PatronesAdminSummaryEmail({
          userName,
          userEmail,
          edad: profile.edad || undefined,
          sexo: profile.sexo || undefined,
          telefono: profile.telefono || undefined,
          respuestas,
          evaluationId: evaluacionFinal.id,
          evaluationDate,
        }),
      });
      console.log("Email administrativo enviado");
    } catch (emailError) {
      console.error("Error al enviar email administrativo:", emailError);
      // No detenemos el proceso si falla el email
    }

    return NextResponse.json({
      success: true,
      evaluacion: evaluacionFinal,
      message: "Evaluación finalizada exitosamente",
    });
  } catch (error) {
    console.error("Error en finalize:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
