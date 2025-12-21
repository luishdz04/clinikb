// Template HTML para email de aprobación de cita
export function getAppointmentApprovedEmailHTML(
  patientName: string,
  appointmentDetails: {
    service: string;
    date: string;
    time: string;
    doctor: string;
    modality: string;
  }
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Confirmada - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #52c41a; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✅ ¡Cita Confirmada!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${patientName}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      ¡Buenas noticias! Tu cita ha sido confirmada. Aquí están los detalles:
                    </p>
                    
                    <!-- Appointment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6ffed; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 2px solid #52c41a;">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="margin: 0; color: #52c41a; font-size: 14px;">Servicio</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.service}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #b7eb8f; padding-top: 15px;">
                          <p style="margin: 0; color: #52c41a; font-size: 14px;">Fecha</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${appointmentDetails.date}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #b7eb8f; padding-top: 15px;">
                          <p style="margin: 0; color: #52c41a; font-size: 14px;">Hora</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${appointmentDetails.time}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #b7eb8f; padding-top: 15px;">
                          <p style="margin: 0; color: #52c41a; font-size: 14px;">Doctor</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${appointmentDetails.doctor}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #b7eb8f; padding-top: 15px;">
                          <p style="margin: 0; color: #52c41a; font-size: 14px;">Modalidad</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${appointmentDetails.modality}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #1890ff; font-weight: bold; font-size: 15px;">📝 Importante</p>
                      <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        ${appointmentDetails.modality.includes('Presencial') || appointmentDetails.modality.includes('presencial')
                          ? 'Por favor llega 5-10 minutos antes de tu cita para el registro.' 
                          : 'Recibirás el enlace de videollamada 15 minutos antes de tu cita.'}
                      </p>
                    </div>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                      ¡Te esperamos! Si necesitas reprogramar o cancelar, por favor contáctanos con anticipación. 💚
                    </p>
                    
                    ${appointmentDetails.modality.includes('online') || appointmentDetails.modality.includes('Online')
                      ? `<div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin-top: 20px;">
                          <p style="margin: 0; color: #1890ff; font-weight: bold; font-size: 15px;">🎥 Videollamada</p>
                          <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                            El enlace para unirte a tu consulta virtual estará disponible en tu panel de paciente, sección "Mis Citas".
                          </p>
                        </div>`
                      : ''}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 13px; margin: 0;">
                      © ${new Date().getFullYear()} CliniKB. Todos los derechos reservados.
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

// Template HTML para email de rechazo de cita
export function getAppointmentRejectedEmailHTML(
  patientName: string,
  appointmentDetails: {
    service: string;
    date: string;
    time: string;
  },
  rejectionReason: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud de Cita - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #ff4d4f; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📅 Sobre tu Solicitud de Cita</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${patientName}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Lamentamos informarte que no podemos confirmar tu solicitud de cita en el horario solicitado.
                    </p>
                    
                    <!-- Appointment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="margin: 0; color: #ff4d4f; font-size: 14px;">Servicio Solicitado</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.service}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #ffccc7; padding-top: 15px;">
                          <p style="margin: 0; color: #ff4d4f; font-size: 14px;">Fecha/Hora Solicitada</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${appointmentDetails.date} - ${appointmentDetails.time}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid #ffccc7; padding-top: 15px;">
                          <p style="margin: 0; color: #ff4d4f; font-size: 14px;">Motivo</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${rejectionReason}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #1890ff; font-weight: bold; font-size: 15px;">💡 ¿Qué puedes hacer?</p>
                      <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        Puedes solicitar una nueva cita en otro horario desde tu portal de pacientes, o contáctanos para encontrar una fecha que funcione mejor.
                      </p>
                    </div>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                      Lamentamos las molestias. Estamos aquí para ayudarte a encontrar el mejor momento para tu atención. 💚
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 13px; margin: 0;">
                      © ${new Date().getFullYear()} CliniKB. Todos los derechos reservados.
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
