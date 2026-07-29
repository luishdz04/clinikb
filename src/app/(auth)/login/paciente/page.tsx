import { redirect } from "next/navigation";

/**
 * El login de paciente vive ahora en `/login`.
 *
 * Esta ruta se conserva porque sigue apareciendo en correos ya enviados y en
 * las redirecciones de `cliente/layout.tsx`.
 */
export default function LoginPacienteRedirect() {
  redirect("/login");
}
