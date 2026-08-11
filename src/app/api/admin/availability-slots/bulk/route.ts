import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Generación masiva de horarios.
 *
 * Crear los bloques de un mes uno por uno es inviable, así que aquí se recibe
 * la regla —rango de fechas, días de la semana y franja horaria— y el servidor
 * expande los bloques.
 *
 * Las fechas y horas se tratan como texto de reloj de pared, sin objetos Date:
 * `slot_date` es `date` y `start_time`/`end_time` son `time without time zone`.
 * Meter zonas horarias aquí desplazaría los valores.
 */

interface CuerpoBulk {
  doctorId?: string;
  serviceId?: string;
  /** YYYY-MM-DD */
  startDate?: string;
  endDate?: string;
  /** 0 = domingo … 6 = sábado */
  weekdays?: number[];
  /** HH:MM:SS — franja que se parte en bloques */
  dayStart?: string;
  dayEnd?: string;
  /** Minutos por bloque. */
  blockMinutes?: number;
  /** Minutos de descanso entre bloques. */
  gapMinutes?: number;
  maxAppointments?: number;
  modality?: string;
  notes?: string | null;
}

const aMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const aHora = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}:00`;

/** Suma días a una fecha YYYY-MM-DD sin pasar por zonas horarias. */
function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  const t = Date.UTC(a, m - 1, d) + dias * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

const diaDeLaSemana = (fecha: string) => {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
};

/** ¿Se encima [aIni,aFin) con [bIni,bFin)? Contiguo no cuenta. */
const seEnciman = (aIni: number, aFin: number, bIni: number, bFin: number) =>
  aIni < bFin && bIni < aFin;

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }

    const {
      doctorId,
      serviceId,
      startDate,
      endDate,
      weekdays = [],
      dayStart,
      dayEnd,
      blockMinutes = 60,
      gapMinutes = 0,
      maxAppointments = 1,
      modality = "online",
      notes = null,
    } = (await request.json()) as CuerpoBulk;

    if (!doctorId || !serviceId || !startDate || !endDate || !dayStart || !dayEnd) {
      return NextResponse.json({ error: "Faltan datos para generar los horarios" }, { status: 400 });
    }
    if (weekdays.length === 0) {
      return NextResponse.json({ error: "Elige al menos un día de la semana" }, { status: 400 });
    }
    if (startDate > endDate) {
      return NextResponse.json(
        { error: "La fecha inicial debe ser anterior a la final" },
        { status: 400 },
      );
    }
    if (blockMinutes < 5) {
      return NextResponse.json({ error: "Cada bloque debe durar al menos 5 minutos" }, { status: 400 });
    }
    if (aMinutos(dayEnd) - aMinutos(dayStart) < blockMinutes) {
      return NextResponse.json(
        { error: "La franja horaria es más corta que un bloque" },
        { status: 400 },
      );
    }

    // El doctor tiene que ofrecer el servicio; misma regla que el alta unitaria.
    const { data: ofrece } = await supabase
      .from("doctor_services")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("service_id", serviceId)
      .eq("active", true)
      .maybeSingle();

    if (!ofrece) {
      return NextResponse.json({ error: "No ofreces este servicio" }, { status: 400 });
    }

    // Expandir la regla en bloques concretos.
    const candidatos: { slot_date: string; inicio: number; fin: number }[] = [];
    const finFranja = aMinutos(dayEnd);

    for (let fecha = startDate; fecha <= endDate; fecha = sumarDias(fecha, 1)) {
      if (!weekdays.includes(diaDeLaSemana(fecha))) continue;
      for (
        let inicio = aMinutos(dayStart);
        inicio + blockMinutes <= finFranja;
        inicio += blockMinutes + gapMinutes
      ) {
        candidatos.push({ slot_date: fecha, inicio, fin: inicio + blockMinutes });
      }
    }

    if (candidatos.length === 0) {
      return NextResponse.json(
        { error: "La combinación elegida no genera ningún horario" },
        { status: 400 },
      );
    }
    if (candidatos.length > 500) {
      return NextResponse.json(
        { error: `Se generarían ${candidatos.length} horarios. Acota el rango: el máximo es 500.` },
        { status: 400 },
      );
    }

    // Lo que ya existe en ese rango, para no chocar con la restricción de la
    // base y poder reportar cuántos se omiten.
    const { data: existentes, error: errorExistentes } = await supabase
      .from("availability_slots")
      .select("slot_date, start_time, end_time")
      .eq("doctor_id", doctorId)
      .gte("slot_date", startDate)
      .lte("slot_date", endDate);

    if (errorExistentes) {
      console.error("Error leyendo horarios existentes:", errorExistentes);
      return NextResponse.json({ error: "No se pudo verificar los horarios" }, { status: 500 });
    }

    const ocupadoPorFecha = new Map<string, { ini: number; fin: number }[]>();
    for (const e of existentes ?? []) {
      const lista = ocupadoPorFecha.get(e.slot_date) ?? [];
      lista.push({ ini: aMinutos(e.start_time), fin: aMinutos(e.end_time) });
      ocupadoPorFecha.set(e.slot_date, lista);
    }

    const aInsertar = candidatos.filter((c) => {
      const ocupados = ocupadoPorFecha.get(c.slot_date) ?? [];
      return !ocupados.some((o) => seEnciman(c.inicio, c.fin, o.ini, o.fin));
    });

    const omitidos = candidatos.length - aInsertar.length;

    if (aInsertar.length === 0) {
      return NextResponse.json({
        creados: 0,
        omitidos,
        message: "Todos los bloques chocaban con horarios que ya tenías.",
      });
    }

    const { data, error } = await supabase
      .from("availability_slots")
      .insert(
        aInsertar.map((c) => ({
          doctor_id: doctorId,
          service_id: serviceId,
          slot_date: c.slot_date,
          start_time: aHora(c.inicio),
          end_time: aHora(c.fin),
          max_appointments: maxAppointments,
          modality,
          notes,
          is_available: true,
        })),
      )
      .select("id");

    if (error) {
      console.error("Error en alta masiva:", error);
      // 23P01: la restricción EXCLUDE atrapó un traslape que la verificación
      // previa no vio (por ejemplo, dos altas simultáneas).
      if (error.code === "23P01") {
        return NextResponse.json(
          { error: "Alguno de los bloques se encima con un horario recién creado. Vuelve a intentar." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: "Error al generar los horarios" }, { status: 500 });
    }

    return NextResponse.json({
      creados: data?.length ?? 0,
      omitidos,
      message:
        omitidos > 0
          ? `Se crearon ${data?.length ?? 0} horarios. Se omitieron ${omitidos} que se encimaban.`
          : `Se crearon ${data?.length ?? 0} horarios.`,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/availability-slots/bulk:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
