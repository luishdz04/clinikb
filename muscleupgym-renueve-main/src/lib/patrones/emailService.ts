// ============================================================================
// SERVICIO DE EMAILS PARA PATRONES ALIMENTARIOS
// Integración con Resend y React Email templates
// ============================================================================

import { Resend } from "resend";
import PatronesCompletedEmail from "@/emails/PatronesCompletedEmail";
import PatronesAdminSummaryEmail from "@/emails/PatronesAdminSummaryEmail";
import type { PatronesRespuestas } from "@/types/patrones";

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email desde
const FROM_EMAIL = "Muscle Up GYM <administracion@muscleupgym.fitness>";

// Email admin
const ADMIN_EMAIL = "administracion@muscleupgym.fitness";

// ============================================================================
// ENVIAR EMAIL DE CONFIRMACIÓN AL USUARIO
// ============================================================================

export async function sendUserConfirmationEmail(
  userName: string,
  userEmail: string,
  evaluationDate: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: "✅ Evaluación de Patrones Alimentarios Completada",
      react: PatronesCompletedEmail({
        userName,
        evaluationDate,
      }),
    });

    if (error) {
      console.error("Error al enviar email al usuario:", error);
      return { success: false, error };
    }

    console.log(`Email de confirmación enviado a ${userEmail}`, data);
    return { success: true };
  } catch (error) {
    console.error("Error en sendUserConfirmationEmail:", error);
    return { success: false, error };
  }
}

// ============================================================================
// ENVIAR EMAIL RESUMEN AL EQUIPO ADMINISTRATIVO
// ============================================================================

export async function sendAdminSummaryEmail(
  userName: string,
  userEmail: string,
  respuestas: PatronesRespuestas,
  evaluationId: string,
  evaluationDate: string,
  edad?: number,
  sexo?: string,
  telefono?: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📋 Nueva Evaluación de Patrones - ${userName}`,
      react: PatronesAdminSummaryEmail({
        userName,
        userEmail,
        edad,
        sexo,
        telefono,
        respuestas,
        evaluationId,
        evaluationDate,
      }),
    });

    if (error) {
      console.error("Error al enviar email administrativo:", error);
      return { success: false, error };
    }

    console.log("Email administrativo enviado", data);
    return { success: true };
  } catch (error) {
    console.error("Error en sendAdminSummaryEmail:", error);
    return { success: false, error };
  }
}

// ============================================================================
// ENVIAR AMBOS EMAILS (función helper)
// ============================================================================

export async function sendEvaluationEmails(params: {
  userName: string;
  userEmail: string;
  respuestas: PatronesRespuestas;
  evaluationId: string;
  evaluationDate: string;
  edad?: number;
  sexo?: string;
  telefono?: string;
}): Promise<{
  userEmailSent: boolean;
  adminEmailSent: boolean;
  errors: any[];
}> {
  const errors: any[] = [];

  // Email al usuario
  const userResult = await sendUserConfirmationEmail(
    params.userName,
    params.userEmail,
    params.evaluationDate
  );

  if (!userResult.success) {
    errors.push({
      type: "user_email",
      error: userResult.error,
    });
  }

  // Email al admin
  const adminResult = await sendAdminSummaryEmail(
    params.userName,
    params.userEmail,
    params.respuestas,
    params.evaluationId,
    params.evaluationDate,
    params.edad,
    params.sexo,
    params.telefono
  );

  if (!adminResult.success) {
    errors.push({
      type: "admin_email",
      error: adminResult.error,
    });
  }

  return {
    userEmailSent: userResult.success,
    adminEmailSent: adminResult.success,
    errors,
  };
}
