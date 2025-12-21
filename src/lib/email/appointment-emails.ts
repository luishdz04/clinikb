// Template HTML para email de confirmación de cita
export function getAppointmentConfirmationEmailHTML(
  patientName: string,
  appointmentDetails: {
    service: string;
    date: string;
    time: string;
    doctor: string;
    modality?: string;
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
                  <td style="background-color: #55c5c4; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📅 Solicitud Recibida</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${patientName}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Hemos recibido tu solicitud de cita. El doctor la revisará y te confirmará la disponibilidad pronto. Estos son los detalles:
                    </p>
                    
                    <!-- Appointment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Servicio</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.service}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Fecha</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.date}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Hora</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.time}</p>
                        </td>
                      </tr>
                      ${appointmentDetails.modality ? `
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Modalidad</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">
                            ${appointmentDetails.modality === 'online' ? '💻 En línea (videollamada)' : '🏥 Presencial'}
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="border-top: 1px solid #e0e0e0; padding-top: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">Profesional</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${appointmentDetails.doctor}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #f57c00; font-weight: bold; font-size: 15px;">⏰ Pendiente de Confirmación</p>
                      <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        El doctor revisará tu solicitud y te confirmará la cita en las próximas 24 horas. Recibirás un email cuando sea confirmada.
                      </p>
                    </div>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                      ¡Gracias por tu paciencia! 😊
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

// Template HTML para email de solicitud de cita pendiente
export function getAppointmentRequestEmailHTML(
  patientName: string,
  requestDetails: {
    service: string;
    modality?: string;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
  }
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud Recibida - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #55c5c4; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📝 Solicitud Recibida</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${patientName}</strong>,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Hemos recibido tu solicitud de cita. Nuestro equipo la revisará y se pondrá en contacto contigo pronto para confirmar la disponibilidad.
                    </p>
                    
                    <!-- Request Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8e1; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="margin: 0; color: #f57c00; font-size: 14px;">Servicio solicitado</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: bold;">${requestDetails.service}</p>
                        </td>
                      </tr>
                      ${requestDetails.modality ? `
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #ffe082; padding-top: 15px;">
                          <p style="margin: 0; color: #f57c00; font-size: 14px;">Modalidad preferida</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${requestDetails.modality}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${requestDetails.preferredDate ? `
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #ffe082; padding-top: 15px;">
                          <p style="margin: 0; color: #f57c00; font-size: 14px;">Fecha preferida</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${requestDetails.preferredDate}</p>
                        </td>
                      </tr>
                      ` : ''}
                      ${requestDetails.preferredTime ? `
                      <tr>
                        <td style="padding-bottom: 15px; border-top: 1px solid #ffe082; padding-top: 15px;">
                          <p style="margin: 0; color: #f57c00; font-size: 14px;">Hora preferida</p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${requestDetails.preferredTime}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #1976d2; font-weight: bold; font-size: 15px;">⏰ ¿Qué sigue?</p>
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

// Template HTML para notificación al admin de nueva cita reservada
export function getAdminAppointmentNotificationEmailHTML(
  patientName: string,
  patientEmail: string,
  appointmentDetails: {
    service: string;
    date: string;
    time: string;
    doctor: string;
    modality: string;
    notes?: string;
  },
  dashboardUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Cita Pendiente - CliniKB</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #367c84; padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔔 Nueva Cita Pendiente</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Se ha recibido una nueva solicitud de cita que requiere confirmación.
                    </p>
                    
                    <!-- Patient Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px 0; color: #1976d2; font-weight: bold; font-size: 16px;">👤 Información del Paciente</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Nombre:</strong> ${patientName}</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Email:</strong> ${patientEmail}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Appointment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8e1; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px 0; color: #f57c00; font-weight: bold; font-size: 16px;">📋 Detalles de la Cita</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Servicio:</strong> ${appointmentDetails.service}</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Fecha:</strong> ${appointmentDetails.date}</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Hora:</strong> ${appointmentDetails.time}</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Doctor:</strong> ${appointmentDetails.doctor}</p>
                          <p style="margin: 5px 0; color: #333333; font-size: 15px;"><strong>Modalidad:</strong> ${appointmentDetails.modality}</p>
                          ${appointmentDetails.notes ? `<p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;"><strong>Notas:</strong> ${appointmentDetails.notes}</p>` : ''}
                        </td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; background-color: #55c5c4; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Ver en Dashboard
                      </a>
                    </div>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                      Por favor revisa y confirma esta cita lo antes posible.
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
