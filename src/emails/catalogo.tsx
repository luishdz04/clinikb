import type { ReactElement } from "react";
import { VerificationCodeEmail } from "./VerificationCodeEmail";
import { CitaConfirmadaEmail } from "./CitaConfirmadaEmail";
import { CitaRechazadaEmail } from "./CitaRechazadaEmail";
import { SolicitudRecibidaEmail } from "./SolicitudRecibidaEmail";
import { AvisoInternoEmail } from "./AvisoInternoEmail";
import { CuentaListaEmail } from "./CuentaListaEmail";

/**
 * Catálogo de plantillas con datos de ejemplo.
 *
 * Lo comparten la vista previa del navegador y el envío de prueba, para que
 * lo que se revisa y lo que se manda sean exactamente el mismo correo.
 */
export const PLANTILLAS: Record<string, { asunto: string; elemento: () => ReactElement }> = {
  verificacion: {
    asunto: "Tu código de verificación",
    elemento: () => <VerificationCodeEmail {...VerificationCodeEmail.PreviewProps} />,
  },
  "cita-confirmada": {
    asunto: "Cita confirmada, en línea, con enlace de Meet",
    elemento: () => <CitaConfirmadaEmail {...CitaConfirmadaEmail.PreviewProps} />,
  },
  "cita-confirmada-sin-sala": {
    asunto: "Cita en línea cuando Google no generó la sala",
    elemento: () => (
      <CitaConfirmadaEmail {...CitaConfirmadaEmail.PreviewProps} enlaceMeet={null} />
    ),
  },
  "cita-reprogramada": {
    asunto: "Cita que cambió de horario",
    elemento: () => (
      <CitaConfirmadaEmail
        {...CitaConfirmadaEmail.PreviewProps}
        reprogramada
        fecha="lunes 18 de agosto de 2026"
        hora="11:30"
      />
    ),
  },
  "cita-presencial": {
    asunto: "Cita confirmada, presencial",
    elemento: () => (
      <CitaConfirmadaEmail
        {...CitaConfirmadaEmail.PreviewProps}
        enLinea={false}
        enlaceMeet={null}
        servicio="Consulta Médica de Rutina"
        doctor="Dr. Baldo Daniel Martínez González"
      />
    ),
  },
  "cita-rechazada": {
    asunto: "No se pudo agendar la cita",
    elemento: () => <CitaRechazadaEmail {...CitaRechazadaEmail.PreviewProps} />,
  },
  "solicitud-recibida": {
    asunto: "Acuse de una solicitud de cita",
    elemento: () => <SolicitudRecibidaEmail {...SolicitudRecibidaEmail.PreviewProps} />,
  },
  "horario-apartado": {
    asunto: "Acuse cuando el paciente apartó un horario abierto",
    elemento: () => (
      <SolicitudRecibidaEmail
        {...SolicitudRecibidaEmail.PreviewProps}
        horarioReservado
        notas={undefined}
        horaPreferida="11:00 - 12:00"
      />
    ),
  },
  "aviso-solicitud": {
    asunto: "Aviso interno: nueva solicitud de cita",
    elemento: () => <AvisoInternoEmail {...AvisoInternoEmail.PreviewProps} />,
  },
  "aviso-paciente": {
    asunto: "Aviso interno: nuevo paciente registrado",
    elemento: () => (
      <AvisoInternoEmail
        titulo="Nuevo paciente registrado"
        resumen="Luis Diego De Luna completó su registro y ya puede agendar."
        datos={[
          { etiqueta: "Paciente", valor: "Luis Diego De Luna" },
          { etiqueta: "Correo", valor: "ing.luisdeluna@outlook.com" },
        ]}
        enlace="https://clinikb.com.mx/admin/pacientes"
        textoEnlace="Ver su expediente"
      />
    ),
  },
  "cuenta-lista": {
    asunto: "Bienvenida: la cuenta quedó activa",
    elemento: () => <CuentaListaEmail {...CuentaListaEmail.PreviewProps} />,
  },
};
