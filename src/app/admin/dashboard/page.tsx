import { redirect } from "next/navigation";

/**
 * El dashboard y la lista de pacientes mostraban lo mismo (estadísticas, tabla
 * y ficha), así que se fusionaron en `/admin/pacientes`.
 *
 * Esta ruta se conserva porque es la que quedó guardada en marcadores y en el
 * correo de aviso de registro que ya se envió.
 */
export default function AdminDashboardRedirect() {
  redirect("/admin/pacientes");
}
