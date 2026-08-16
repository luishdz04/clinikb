import 'server-only';
import { render } from '@react-email/components';
import { CitaConfirmadaEmail } from '@/emails/CitaConfirmadaEmail';
import { CitaRechazadaEmail } from '@/emails/CitaRechazadaEmail';
import { SolicitudRecibidaEmail } from '@/emails/SolicitudRecibidaEmail';
import { AvisoInternoEmail } from '@/emails/AvisoInternoEmail';
import { CuentaListaEmail } from '@/emails/CuentaListaEmail';
import type { DatoFicha } from '@/emails/componentes/FichaCita';

/**
 * Puente entre las rutas y las plantillas de React Email.
 *
 * Las rutas sólo arman datos y llaman a estas funciones; no saben de JSX ni
 * de `render`. Así el correo se rediseña sin tocar la lógica de negocio, que
 * es justo lo que no pasaba con las plantillas viejas de HTML pegado.
 */

/** Fecha legible en español a partir de un `YYYY-MM-DD` sin zona horaria. */
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Formatea sin `Date` ni dayjs a propósito: la columna es `date` sin zona, y
 * pasarla por un objeto de fecha la corre un día según el huso del servidor.
 * Ya nos mordió antes.
 */
export function fechaLegible(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  if (!a || !m || !d) return iso;
  // Sólo para saber el día de la semana; el mediodía UTC evita el corrimiento.
  const diaSemana = DIAS[new Date(Date.UTC(a, m - 1, d, 12)).getUTCDay()];
  return `${diaSemana} ${d} de ${MESES[m - 1]} de ${a}`;
}

/** `15:00:00` -> `15:00`. */
export const horaLegible = (t: string) => t.slice(0, 5);

export const sitio = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinikb.com.mx';

interface DatosCita {
  nombrePaciente: string;
  servicio: string;
  fecha: string;
  hora: string;
  doctor: string;
  enLinea: boolean;
  enlaceMeet?: string | null;
  reprogramada?: boolean;
}

export const correoCitaConfirmada = (d: DatosCita) =>
  render(<CitaConfirmadaEmail {...d} />);

export const correoCitaRechazada = (d: {
  nombrePaciente: string;
  servicio: string;
  fecha: string;
  hora: string;
  motivo: string;
}) => render(<CitaRechazadaEmail {...d} />);

export const correoSolicitudRecibida = (d: {
  nombrePaciente: string;
  servicio: string;
  enLinea: boolean;
  fechaPreferida?: string;
  horaPreferida?: string;
  notas?: string;
  horarioReservado?: boolean;
}) => render(<SolicitudRecibidaEmail {...d} />);

export const correoAvisoInterno = (d: {
  titulo: string;
  resumen: string;
  datos: DatoFicha[];
  enlace: string;
  textoEnlace: string;
}) => render(<AvisoInternoEmail {...d} />);

export const correoCuentaLista = (d: { nombrePaciente: string; urlAcceso: string }) =>
  render(<CuentaListaEmail {...d} />);
