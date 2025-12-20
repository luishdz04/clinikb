import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Configuración SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // ej: smtp.gmail.com
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER, // tu correo
      pass: process.env.SMTP_PASS, // tu contraseña o app password
    },
  });

  // Enviar email
  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'CliniKB'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log('Email sent:', info.messageId);
  return info;
}

// Template HTML para email de aprobación
export function getApprovalEmailHTML(patientName: string, loginUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Aprobada - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header con Logo -->
                <tr>
                  <td style="background-color: #55c5c4; padding: 40px 30px; text-align: center;">
                    <img src="https://eiepzafndtiimxtadvuy.supabase.co/storage/v1/object/public/assets/clinikb-logo.png" alt="CliniKB" style="width: 100px; height: 100px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">¡Solicitud Aprobada!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${patientName}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ¡Excelentes noticias! Tu solicitud de registro en <strong>CliniKB</strong> ha sido aprobada exitosamente.
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Ya puedes acceder a tu cuenta y comenzar a disfrutar de nuestros servicios especializados:
                    </p>
                    
                    <!-- Servicios -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #55c5c4; margin-bottom: 10px;">
                          <p style="margin: 0; color: #367c84; font-weight: bold; font-size: 15px;">✓ Terapia Individual</p>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Espacio 100% confidencial, libre de prejuicios</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #55c5c4;">
                          <p style="margin: 0; color: #367c84; font-weight: bold; font-size: 15px;">✓ Terapia de Pareja</p>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Resuelve conflictos y recupera la armonía</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #55c5c4;">
                          <p style="margin: 0; color: #367c84; font-weight: bold; font-size: 15px;">✓ Acompañamiento en Crianza</p>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Guía para el cuidado y bienestar de tus hijos</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #55c5c4;">
                          <p style="margin: 0; color: #367c84; font-weight: bold; font-size: 15px;">✓ Consulta Médica de Rutina</p>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Valoración integral y preventiva</p>
                        </td>
                      </tr>
                      <tr><td style="height: 10px;"></td></tr>
                      <tr>
                        <td style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #55c5c4;">
                          <p style="margin: 0; color: #367c84; font-weight: bold; font-size: 15px;">✓ Valoración de Especialidad</p>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Consulta por video con especialistas certificados</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background-color: #55c5c4; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                            Iniciar Sesión
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      Si no solicitaste este registro, por favor ignora este correo.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 13px; margin: 0;">
                      © ${new Date().getFullYear()} CliniKB. Todos los derechos reservados.
                    </p>
                    <p style="color: #999999; font-size: 13px; margin: 10px 0 0 0;">
                      Atención Psicológica y Médica Profesional
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
