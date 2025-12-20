import { sendEmail, getApprovalEmailHTML } from '@/lib/email/nodemailer';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customEmail = searchParams.get('to');
    const testEmail = customEmail || process.env.SMTP_USER; // Usar parámetro o tu correo
    
    if (!testEmail) {
      return NextResponse.json(
        { error: 'No se encontró SMTP_USER configurado' },
        { status: 500 }
      );
    }

    const html = getApprovalEmailHTML(
      'Usuario de Prueba',
      'http://localhost:3000/login/paciente'
    );

    await sendEmail({
      to: testEmail,
      subject: 'Prueba de Email - CliniKB',
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${testEmail}`,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Error al enviar email',
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
