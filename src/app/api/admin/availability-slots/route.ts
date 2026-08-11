import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Obtener slots del doctor (con filtros opcionales)
/**
 * Traduce los errores de integridad de la base a algo que el usuario entienda.
 *
 * `availability_slots` tiene una restricción EXCLUDE que impide traslapes por
 * doctor, más CHECKs de rango y de cupo. Son la última línea de defensa: cubren
 * las condiciones de carrera que la verificación previa en la API no puede.
 */
function traducirErrorDeHorario(error: { code?: string; message?: string }): string | null {
  if (error.code === "23P01") {
    return "Ese horario se encima con otro que ya tienes ese día.";
  }
  if (error.code === "23514") {
    if (error.message?.includes("rango_valido")) {
      return "La hora de fin debe ser posterior a la de inicio.";
    }
    if (error.message?.includes("cupo_valido")) {
      return "El cupo debe ser de al menos una cita.";
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");
    const serviceId = searchParams.get("serviceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId es requerido" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("availability_slots")
      .select(`
        *,
        service:services(id, key, title, category, duration_minutes)
      `)
      .eq("doctor_id", doctorId)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }

    if (startDate) {
      query = query.gte("slot_date", startDate);
    }

    if (endDate) {
      query = query.lte("slot_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching slots:", error);
      return NextResponse.json(
        { error: "Error al obtener slots" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/admin/availability-slots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo slot
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      doctorId,
      serviceId,
      slotDate,
      startTime,
      endTime,
      maxAppointments = 1,
      modality = 'online',
      notes,
    } = body;

    // Validaciones
    if (!doctorId || !serviceId || !slotDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar que la hora de inicio sea menor que la hora de fin
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "La hora de inicio debe ser menor que la hora de fin" },
        { status: 400 }
      );
    }

    // Verificar que el servicio existe
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("id", serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el doctor ofrece este servicio
    const { data: doctorService, error: doctorServiceError } = await supabase
      .from("doctor_services")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("service_id", serviceId)
      .eq("active", true)
      .single();

    if (doctorServiceError || !doctorService) {
      return NextResponse.json(
        { error: "El doctor no ofrece este servicio" },
        { status: 400 }
      );
    }

    // Verificar solapamiento de horarios
    const { data: overlappingSlots, error: overlapError } = await supabase
      .from("availability_slots")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("slot_date", slotDate)
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    // Si la verificación falla hay que abortar, no seguir: antes se registraba
    // el error y se insertaba igual, creando justo el traslape que se buscaba
    // evitar. La base lo bloquea de todos modos, pero conviene un mensaje claro.
    if (overlapError) {
      console.error("Error checking overlap:", overlapError);
      return NextResponse.json(
        { error: "No se pudo verificar el horario. Intenta de nuevo." },
        { status: 500 }
      );
    }
    if (overlappingSlots && overlappingSlots.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un horario en este rango de tiempo" },
        { status: 400 }
      );
    }

    // Crear el slot
    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        doctor_id: doctorId,
        service_id: serviceId,
        slot_date: slotDate,
        start_time: startTime,
        end_time: endTime,
        max_appointments: maxAppointments,
        modality: modality,
        notes: notes || null,
        is_available: true,
      })
      .select(`
        *,
        service:services(id, key, title, category, duration_minutes)
      `)
      .single();

    if (error) {
      console.error("Error creating slot:", error);
      const amigable = traducirErrorDeHorario(error);
      if (amigable) return NextResponse.json({ error: amigable }, { status: 400 });
      return NextResponse.json(
        { error: "Error al crear el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/availability-slots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar slot existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      id,
      slotDate,
      startTime,
      endTime,
      maxAppointments,
      modality,
      notes,
      isAvailable,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
        { status: 400 }
      );
    }

    // Validar que la hora de inicio sea menor que la hora de fin
    if (startTime && endTime && startTime >= endTime) {
      return NextResponse.json(
        { error: "La hora de inicio debe ser menor que la hora de fin" },
        { status: 400 }
      );
    }

    // Obtener el slot actual
    const { data: currentSlot, error: fetchError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentSlot) {
      return NextResponse.json(
        { error: "Slot no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: {
      slot_date?: string;
      start_time?: string;
      end_time?: string;
      max_appointments?: number;
      modality?: string;
      notes?: string | null;
      is_available?: boolean;
    } = {};
    if (slotDate !== undefined) updateData.slot_date = slotDate;
    if (startTime !== undefined) updateData.start_time = startTime;
    if (endTime !== undefined) updateData.end_time = endTime;
    if (maxAppointments !== undefined) updateData.max_appointments = maxAppointments;
    if (modality !== undefined) updateData.modality = modality;
    if (notes !== undefined) updateData.notes = notes;
    if (isAvailable !== undefined) updateData.is_available = isAvailable;

    // Si se está cambiando fecha/hora, verificar solapamiento
    if (slotDate || startTime || endTime) {
      const checkDate = slotDate || currentSlot.slot_date;
      const checkStart = startTime || currentSlot.start_time;
      const checkEnd = endTime || currentSlot.end_time;

      const { data: overlappingSlots, error: overlapError } = await supabase
        .from("availability_slots")
        .select("id")
        .eq("doctor_id", currentSlot.doctor_id)
        .eq("slot_date", checkDate)
        .neq("id", id)
        .or(`and(start_time.lte.${checkStart},end_time.gt.${checkStart}),and(start_time.lt.${checkEnd},end_time.gte.${checkEnd}),and(start_time.gte.${checkStart},end_time.lte.${checkEnd})`);

      if (overlapError) {
        console.error("Error checking overlap:", overlapError);
        return NextResponse.json(
          { error: "No se pudo verificar el horario. Intenta de nuevo." },
          { status: 500 }
        );
      }
      if (overlappingSlots && overlappingSlots.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un horario en este rango de tiempo" },
          { status: 400 }
        );
      }
    }

    // Actualizar el slot
    const { data, error } = await supabase
      .from("availability_slots")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        service:services(id, key, title, category, duration_minutes)
      `)
      .single();

    if (error) {
      console.error("Error updating slot:", error);
      const amigable = traducirErrorDeHorario(error);
      if (amigable) return NextResponse.json({ error: amigable }, { status: 400 });
      return NextResponse.json(
        { error: "Error al actualizar el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/admin/availability-slots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar slot
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
        { status: 400 }
      );
    }

    // Verificar si hay citas asociadas
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id")
      .eq("slot_id", id)
      .in("status", ["pending", "confirmed"]);

    if (appointmentsError) {
      console.error("Error checking appointments:", appointmentsError);
    } else if (appointments && appointments.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un slot con citas pendientes o confirmadas" },
        { status: 400 }
      );
    }

    // Eliminar el slot
    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting slot:", error);
      return NextResponse.json(
        { error: "Error al eliminar el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Slot eliminado exitosamente" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/availability-slots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
