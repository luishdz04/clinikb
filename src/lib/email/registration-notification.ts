// Template HTML para email de registro pendiente (para admin)
export function getNewRegistrationEmailHTML(patientName: string, patientEmail: string, dashboardUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Registro Pendiente - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header con Logo -->
                <tr>
                  <td style="background-color: #367c84; padding: 40px 30px; text-align: center;">
                    <img src="https://eiepzafndtiimxtadvuy.supabase.co/storage/v1/object/public/assets/clinikb-logo.png" alt="CliniKB" style="width: 100px; height: 100px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Nuevo Registro Pendiente</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Se ha registrado un nuevo paciente en <strong>CliniKB</strong> y está pendiente de aprobación.
                    </p>
                    
                    <!-- Datos del Paciente -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f8f8f8; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Nombre del Paciente:</p>
                          <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; font-weight: bold;">${patientName}</p>
                          
                          <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Correo Electrónico:</p>
                          <p style="margin: 0; color: #333333; font-size: 16px; font-weight: bold;">${patientEmail}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Por favor, revisa la solicitud en el panel de administración para aprobarla o rechazarla.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 40px; background-color: #367c84; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                            Ir al Panel de Administración
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                      Este es un correo automático, por favor no respondas a este mensaje.
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
