import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log("🎬 [WELCOME-PACKAGE] API iniciada");

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const adminSupabase = createAdminClient();

    if (!adminSupabase) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // 1. Verificar autenticación
    let user = null;
    
    // Intentar obtener usuario desde el header Authorization (Bearer token)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }

    // Si no se obtuvo por token, intentar por cookies
    if (!user) {
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && cookieUser) {
        user = cookieUser;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener perfil del usuario
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Verificar si ya se completó el registro
    if (profile.registration_completed) {
      console.log("⚠️ [WELCOME-PACKAGE] Ya procesado anteriormente");
      return NextResponse.json({
        success: true,
        message: "Paquete de bienvenida ya fue procesado anteriormente",
        alreadyProcessed: true
      });
    }

    // Marcar como en proceso
    console.log("💾 [WELCOME-PACKAGE] Marcando como en proceso...");
    await adminSupabase
      .from('profiles')
      .update({
        pending_welcome_email: false,
        email_confirmed: true,
        email_confirmed_at: new Date().toISOString()
      })
      .eq('id', user.id);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    let attachments = [];

    // 4. Descargar PDF si existe URL
    if (profile.contract_pdf_url) {
      try {
        const urlParts = profile.contract_pdf_url.split('/muscleup-files/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          
          const { data: pdfData, error: downloadError } = await adminSupabase
            .storage
            .from('muscleup-files')
            .download(filePath);

          if (!downloadError && pdfData) {
            const arrayBuffer = await pdfData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            attachments.push({
              filename: `Contrato_MuscleUp_${profile.first_name}_${profile.last_name}.pdf`,
              content: buffer,
            });
          } else {
            console.error('Error downloading PDF:', downloadError);
          }
        }
      } catch (e) {
        console.error('Error processing PDF attachment:', e);
      }
    }

    // 5. Ejecutar envíos (Email y WhatsApp)
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    
    // Enviar Email
    const sendEmailPromise = async () => {
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Muscle Up GYM <onboarding@resend.dev>',
            to: user.email || '',
            subject: '¡Bienvenido a Muscle Up GYM! - Tu Contrato',
            react: WelcomeEmail({ 
                firstName: profile.first_name,
                contractUrl: profile.contract_pdf_url 
            }),
            attachments: attachments
        });

        if (emailError) throw emailError;
        
        // Actualizar estado de email
        await adminSupabase.from('profiles').update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
        }).eq('id', user.id);
        
        return emailData;
    };

    // Enviar WhatsApp
    const sendWhatsappPromise = async () => {
        if (profile.whatsapp) {
            const response = await fetch(`${baseUrl}/api/send-welcome-whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error sending WhatsApp');
            }
            return await response.json();
        }
        return null;
    };

    const results = await Promise.allSettled([
        sendEmailPromise(),
        sendWhatsappPromise()
    ]);

    results.forEach((result, index) => {
        const type = index === 0 ? 'Email' : 'WhatsApp';
        if (result.status === 'fulfilled') {
            console.log(`✅ [${type}] Completado`);
        } else {
            console.error(`💥 [${type}] Falló:`, result.reason);
        }
    });

    // 6. Actualizar estado final
    console.log("🎯 [WELCOME-PACKAGE] Actualizando estado final...");
    await adminSupabase
      .from('profiles')
      .update({
        registration_completed: true,
        registration_completed_at: new Date().toISOString(),
        processing_errors: results.some(r => r.status === 'rejected')
      })
      .eq('id', user.id);

    console.log("🎉 [WELCOME-PACKAGE] Paquete de bienvenida completado");

    return NextResponse.json({ 
      success: true, 
      results: results.map(r => r.status === 'fulfilled' ? 'success' : 'error')
    });

  } catch (error) {
    console.error('Welcome package error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
