import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: Obtener slots del doctor (con filtros opcionales)
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

    if (overlapError) {
      console.error("Error checking overlap:", overlapError);
    } else if (overlappingSlots && overlappingSlots.length > 0) {
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
    const updateData: any = {};
    if (slotDate !== undefined) updateData.slot_date = slotDate;
    if (startTime !== undefined) updateData.start_time = startTime;
    if (endTime !== undefined) updateData.end_time = endTime;
    if (maxAppointments !== undefined) updateData.max_appointments = maxAppointments;
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
      } else if (overlappingSlots && overlappingSlots.length > 0) {
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
