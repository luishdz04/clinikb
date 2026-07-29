import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { hasDoctorGateAccess } from "@/lib/auth/doctorGate";

/**
 * Guardia del portal médico.
 *
 * Se comprueba en el servidor: sin la cookie del portón, la página de login ni
 * siquiera se envía al navegador.
 *
 * Ojo: esto es solo una barrera de acceso para que el portal no quede expuesto
 * públicamente. La autenticación real sigue siendo el login con credenciales
 * del doctor que hay detrás.
 */
export default async function DoctorLoginLayout({ children }: { children: ReactNode }) {
  if (!(await hasDoctorGateAccess())) {
    redirect("/acceso-medico");
  }

  return <>{children}</>;
}
