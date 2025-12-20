import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getGymSettings, getGymEmail } from '@/lib/gymSettings';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }

    console.log('🔐 [FORGOT-PASSWORD] Procesando solicitud para:', email);

    // Obtener configuración del gimnasio
    const gymSettings = await getGymSettings();

    // Crear cliente admin
    const supabaseAdmin = createAdminClient();
    
    if (!supabaseAdmin) {
      console.error('❌ [FORGOT-PASSWORD] No se pudo crear cliente admin');
      return NextResponse.json(
        { error: 'Error al procesar la solicitud' },
        { status: 500 }
      );
    }

    // ✅ 1. GENERAR LINK DE RESTABLECIMIENTO MANUALMENTE CON SUPABASE ADMIN
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://muscleupgym.fitness'}/reset-password`
      }
    });

    if (linkError || !linkData?.properties) {
      console.error('❌ [FORGOT-PASSWORD] Error al generar link:', linkError);

      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    const actionLink = linkData.properties.action_link;
    console.log('✅ [FORGOT-PASSWORD] Link de restablecimiento generado');

    // ✅ 2. ENVIAR EMAIL CON RESEND
    console.log('📤 [RESEND] Enviando email de restablecimiento con Resend...');

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${gymSettings.gym_name} <${getGymEmail(gymSettings)}>`,
          to: [email],
          subject: `Restablece tu contraseña - ${gymSettings.gym_name}`,
          html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Restablecimiento de Contraseña - ${gymSettings.gym_name}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">

            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
                <tr>
                    <td align="center" style="padding: 20px;">

                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">

                            <tr>
                                <td style="height: 6px; background-color: #ffcc00; border-radius: 8px 8px 0 0;"></td>
                            </tr>

                            <tr>
                                <td align="center" style="padding: 30px 20px 20px 20px;">
                                    <img src="https://muscleupgym.fitness/logos/logo.png" alt="${gymSettings.gym_name} Logo" style="max-width: 180px; margin-bottom: 20px; display: block;">
                                    <h2 style="margin: 0; color: #000000;">Restablecimiento de Contraseña</h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 0 30px;">
                                    <p style="font-size: 18px; font-weight: bold; color: #000000; margin-bottom: 15px;">Hola,</p>

                                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${gymSettings.gym_name}</strong>.</p>

                                    <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>

                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <a href="${actionLink}" style="background-color: #ffcc00; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p>O copia y pega este enlace en tu navegador:</p>
                                    <p style="word-break: break-all; font-size: 12px; color: #555555;">${actionLink}</p>

                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff8e1; border-left: 4px solid #ffcc00; border-radius: 5px; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 15px 20px;">
                                                <p style="color: #000000; font-weight: bold; margin: 0 0 5px 0;">⚠️ Importante</p>
                                                <p style="margin: 0; font-size: 14px;">Este enlace expirará en <strong>24 horas</strong> por seguridad.</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos:</p>
                                    <p>📞 Tel: ${gymSettings.gym_phone}<br>
                                       📧 Email: ${getGymEmail(gymSettings)}</p>

                                    <p style="margin-top: 25px;">Saludos,<br>El equipo de ${gymSettings.gym_name}</p>
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding: 20px 30px; margin-top: 30px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777777;">
                                    <p style="margin: 0;">© 2025 ${gymSettings.gym_name} | Tel: ${gymSettings.gym_phone} | ${getGymEmail(gymSettings)}</p>
                                    <p style="margin: 10px 0 0 0;">"Tu salud y bienestar son nuestra misión"</p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

            </body>
            </html>
          `
        })
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error('❌ [RESEND] Error al enviar email:', emailResult);
        throw new Error('Error al enviar email');
      }

      console.log('✅ [RESEND] Email enviado exitosamente. ID:', emailResult.id);

      return NextResponse.json({
        success: true,
        message: 'Instrucciones enviadas correctamente'
      });

    } catch (emailError) {
      console.error('❌ [RESEND] Error al enviar email:', emailError);

      // Aún así devolvemos success por seguridad
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

  } catch (error) {
    console.error('❌ [FORGOT-PASSWORD] Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
