import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los servicios
export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { data, error } = await adminSupabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ services: data || [] });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error al cargar servicios' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo servicio
export async function POST(request: Request) {
  try {
    const { key, title, category, duration_minutes, description } = await request.json();

    if (!key || !title || !category || !duration_minutes) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { data, error } = await adminSupabase
      .from('services')
      .insert({
        key: key.toLowerCase().replace(/\s+/g, '-'),
        title,
        category,
        duration_minutes,
        description,
        active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un servicio con ese identificador' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      service: data,
      message: 'Servicio creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar servicio
export async function PUT(request: Request) {
  try {
    const { id, title, category, duration_minutes, description, active } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID del servicio es requerido' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const { data, error } = await adminSupabase
      .from('services')
      .update({
        title,
        category,
        duration_minutes,
        description,
        active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      service: data,
      message: 'Servicio actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar servicio
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del servicio es requerido' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Desactivar en lugar de eliminar
    const { error } = await adminSupabase
      .from('services')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Servicio desactivado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    );
  }
}
