import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Contraseña para autorizar la actualización de firma
const ADMIN_PASSWORD = 'MUP2025';

export async function POST(request: Request) {
  try {
    const { signature, password } = await request.json();

    // Verificar contraseña
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 403 }
      );
    }

    // Verificar que se envió la firma
    if (!signature) {
      return NextResponse.json(
        { error: 'No se proporcionó una firma' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const adminSupabase = createAdminClient();

    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Obtener perfil del usuario para conseguir el nombre de carpeta
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('first_name, last_name, signature_url')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'No se encontró el perfil del usuario' },
        { status: 404 }
      );
    }

    // Nombre de carpeta del usuario (sanitizado)
    const userFolder = `${profile.first_name.trim()}_${profile.last_name.trim()}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_");

    // Si existe una firma anterior, eliminarla del bucket
    if (profile.signature_url) {
      try {
        // Extraer el path del archivo de la URL
        const urlParts = profile.signature_url.split('/muscleup-files/');
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1];
          console.log('Eliminando firma anterior:', oldFilePath);
          
          const { error: deleteError } = await adminSupabase.storage
            .from('muscleup-files')
            .remove([oldFilePath]);
          
          if (deleteError) {
            console.error('Error eliminando firma anterior:', deleteError);
            // No fallar si no se puede eliminar, continuar con la subida
          }
        }
      } catch (err) {
        console.error('Error procesando eliminación de firma:', err);
      }
    }

    // Subir nueva firma
    const base64Data = signature.replace(/^data:image\/\w+;base64,/, "");
    const signatureBuffer = Buffer.from(base64Data, 'base64');
    const fileName = `${userFolder}/signature_${Date.now()}.png`;

    const { error: uploadError } = await adminSupabase.storage
      .from('muscleup-files')
      .upload(fileName, signatureBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Error subiendo firma:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir la nueva firma' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: publicUrlData } = adminSupabase.storage
      .from('muscleup-files')
      .getPublicUrl(fileName);
    
    const signatureUrl = publicUrlData.publicUrl;

    // Actualizar perfil con nueva URL de firma
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ 
        signature_url: signatureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error actualizando perfil:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signature_url: signatureUrl,
      message: 'Firma actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en update-signature:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
