import type { ReactNode } from "react";
import { ConsultaProvider } from "./ConsultaProvider";

/**
 * Marco de la consulta en línea. El cliente de Stream vive aquí, encima del
 * lobby y de la sala, para que pasar de uno a otro no reconecte.
 */
export default async function ConsultaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return <ConsultaProvider appointmentId={appointmentId}>{children}</ConsultaProvider>;
}
