import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { RegistrationFormData } from '@/types/registration';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Resend } from 'resend';
import ConfirmationEmail from '@/emails/ConfirmationEmail';

// Force dynamic to avoid static optimization issues
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData: RegistrationFormData = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const adminSupabase = createAdminClient();

    if (!adminSupabase) {
      return NextResponse.json({ error: 'Configuration error: Admin client not available' }, { status: 500 });
    }

    // Usar admin client para storage si está disponible, si no, usar el cliente normal
    const storageClient = adminSupabase || supabase;

    // 1. Crear usuario en Auth y generar link de confirmación
    // Usamos generateLink para obtener el link y enviarlo con nuestro propio template
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const { data: authData, error: authError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email: formData.personalData.email,
      password: formData.personalData.password,
      options: {
        redirectTo: `${origin}/bienvenido`,
        data: {
          first_name: formData.personalData.firstName,
          last_name: formData.personalData.lastName,
          role: 'client',
          phone: formData.personalData.whatsapp,
        },
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    // Enviar correo de confirmación con Resend (con logs detallados)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const confirmationUrl = authData.properties?.action_link || '';

        if (confirmationUrl) {
          const fromAddress = process.env.RESEND_FROM || 'Muscle Up GYM <onboarding@resend.dev>';
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: fromAddress,
            to: formData.personalData.email,
            subject: 'Confirma tu cuenta en Muscle Up GYM',
            react: ConfirmationEmail({
              firstName: formData.personalData.firstName,
              confirmationUrl,
            }),
          });

          if (emailError) {
            console.error('Resend email error:', emailError);
          } else {
            console.log('Resend email sent. id:', emailData?.id);
          }
        } else {
          console.warn('No confirmation URL generated, skipping email send');
        }
      } catch (emailException) {
        console.error('Exception sending confirmation email:', emailException);
        // No fallamos el registro si falla el correo, pero logueamos el error
      }
    } else {
      console.warn('RESEND_API_KEY not found, skipping email sending');
    }

    // Actualizar el teléfono en user_metadata de auth.users
    // Nota: No podemos usar el campo 'phone' directamente porque Supabase requiere verificación SMS
    // El teléfono se guarda en user_metadata y en raw_user_meta_data
    if (adminSupabase && formData.personalData.whatsapp) {
      const phoneNumber = formData.personalData.whatsapp;
      console.log('Updating phone metadata for user:', authData.user.id, 'Phone:', phoneNumber);
      
      try {
        const { error: phoneError } = await adminSupabase.auth.admin.updateUserById(authData.user.id, {
          user_metadata: {
            ...authData.user.user_metadata,
            phone: phoneNumber,
            whatsapp: phoneNumber
          },
          app_metadata: {
            ...authData.user.app_metadata,
            phone: phoneNumber
          }
        });
        
        if (phoneError) {
          console.error('Error updating auth phone metadata:', phoneError);
        } else {
          console.log('Phone metadata updated successfully');
        }
      } catch (err) {
        console.error('Exception updating auth phone:', err);
      }
    } else {
      console.warn('Phone not updated - adminSupabase:', !!adminSupabase, 'whatsapp:', formData.personalData.whatsapp);
    }

    // Nombre de carpeta para el usuario (Sanitizado)
    const userFolder = `${formData.personalData.firstName.trim()}_${formData.personalData.lastName.trim()}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_");

    // Variables para guardar buffers y URLs
    let signatureBuffer: Buffer | null = null;
    let signatureUrl: string | null = null;
    
    let profilePhotoBuffer: Buffer | null = null;
    let profilePictureUrl: string | null = null;
    
    let tutorIdUrl: string | null = null;

    // 2. Subir firma a Storage
    if (formData.contract.signature) {
      const base64Data = formData.contract.signature.replace(/^data:image\/\w+;base64,/, "");
      signatureBuffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${userFolder}/signature_${Date.now()}.png`;
      
      const { error: uploadError } = await storageClient.storage
        .from('muscleup-files')
        .upload(fileName, signatureBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading signature:', uploadError);
      } else {
        const { data: publicUrlData } = storageClient.storage
          .from('muscleup-files')
          .getPublicUrl(fileName);
        signatureUrl = publicUrlData.publicUrl;
      }
    }

    // 2.5 Subir foto de perfil
    if (formData.personalData.profilePhoto) {
      const base64Data = formData.personalData.profilePhoto.replace(/^data:image\/\w+;base64,/, "");
      profilePhotoBuffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${userFolder}/profile_photo_${Date.now()}.png`;
      
      const { error: uploadError } = await storageClient.storage
        .from('muscleup-files')
        .upload(fileName, profilePhotoBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading profile photo:', uploadError);
      } else {
        const { data: publicUrlData } = storageClient.storage
          .from('muscleup-files')
          .getPublicUrl(fileName);
        profilePictureUrl = publicUrlData.publicUrl;
      }
    }

    // 3. Subir identificación de tutor
    if (formData.personalData.isMinor && formData.personalData.tutorIdFile) {
      const base64Data = formData.personalData.tutorIdFile.replace(/^data:.*,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${userFolder}/tutor_id_${Date.now()}`;
      
      const { error: uploadError } = await storageClient.storage
        .from('muscleup-files')
        .upload(fileName, buffer, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading tutor ID:', uploadError);
      } else {
        const { data: publicUrlData } = storageClient.storage
          .from('muscleup-files')
          .getPublicUrl(fileName);
        tutorIdUrl = publicUrlData.publicUrl;
      }
    }

    // 4. Insertar en la tabla profiles
    const profileData = {
      id: authData.user.id,
      first_name: formData.personalData.firstName,
      last_name: formData.personalData.lastName,
      email: formData.personalData.email,
      whatsapp: formData.personalData.whatsapp,
      birth_date: formData.personalData.dateOfBirth,
      gender: formData.personalData.gender,
      marital_status: formData.personalData.civilStatus,
      is_minor: formData.personalData.isMinor,
      tutor_id_url: tutorIdUrl,
      profile_picture_url: profilePictureUrl,
      
      address_street: formData.personalData.street,
      address_number: formData.personalData.number,
      address_neighborhood: formData.personalData.colony,
      address_city: formData.personalData.city,
      address_state: formData.personalData.state,
      address_postal_code: formData.personalData.zipCode,
      address_country: formData.personalData.country,

      emergency_contact_name: formData.emergencyData.emergencyContactName,
      emergency_contact_phone: formData.emergencyData.emergencyContactPhone,
      medical_condition: formData.emergencyData.medicalCondition,
      blood_type: formData.emergencyData.bloodType,

      main_motivation: formData.preferences.mainMotivation,
      training_level: formData.preferences.trainingLevel,
      referred_by: formData.preferences.referredBy,
      receive_plans: formData.preferences.receivePlans,
      
      rol: 'cliente',
      signature_url: signatureUrl,
    };

    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Error inserting profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // --- Generación y Guardado del PDF con PDFKit ---
    try {
      if (!adminSupabase) throw new Error('Admin client not initialized');

      // Definir rutas de fuentes personalizadas para evitar error de Helvetica
      const fontRegularPath = path.join(process.cwd(), 'public', 'fonts', 'arial.ttf');
      const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'arialbd.ttf');

      // Verificar si las fuentes existen, si no, usar Helvetica (que fallará si no se arregla el path, pero es el fallback)
      // Pero al pasar 'font' en opciones, evitamos que cargue la default inmediatamente si la custom existe.
      const docOptions: any = { size: 'A4', margin: 40 };
      if (fs.existsSync(fontRegularPath)) {
        docOptions.font = fontRegularPath;
      }

      const doc = new PDFDocument(docOptions);
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      
      const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
      });

      // --- Diseño del PDF ---
      
      // Registrar fuentes si existen
      if (fs.existsSync(fontRegularPath)) {
        doc.registerFont('Arial', fontRegularPath);
      }
      if (fs.existsSync(fontBoldPath)) {
        doc.registerFont('Arial-Bold', fontBoldPath);
      }

      // Fondo Oscuro
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
      
      // Logo
      const logoPath = path.join(process.cwd(), 'public', 'logos', 'logo.png');
      if (fs.existsSync(logoPath)) {
        try {
           doc.image(logoPath, 50, 40, { width: 120 });
        } catch (e) {
           console.error("Error loading logo", e);
        }
      }

      // Título
      doc.fillColor('#FACC15') // Yellow-400
         .fontSize(16);
         
      if (fs.existsSync(fontBoldPath)) {
         doc.font('Arial-Bold');
      } else {
         doc.font('Helvetica-Bold');
      }

      doc.text('CONTRATO DE REGISTRO', 150, 60, { align: 'right' });
      
      // Subtítulo eliminado a petición del usuario
      // doc.fontSize(10).fillColor('#FFFFFF').text('MUSCLE UP GYM', 150, 85, { align: 'right' });

      doc.moveDown(2);

      // --- Mapeos de Traducción ---
      const genderMap: Record<string, string> = { 'male': 'Masculino', 'female': 'Femenino', 'other': 'Otro' };
      const civilStatusMap: Record<string, string> = { 'single': 'Soltero/a', 'married': 'Casado/a', 'divorced': 'Divorciado/a', 'widowed': 'Viudo/a' };
      
      const motivationMap: Record<string, string> = { 
        'muscle_gain': 'Ganancia Muscular', 
        'weight_loss': 'Pérdida de Peso', 
        'general_health': 'Salud General', 
        'sports_performance': 'Rendimiento Deportivo',
        'toning': 'Tonificación',
        'rehabilitation': 'Rehabilitación',
        'other': 'Otro' 
      };

      const levelMap: Record<string, string> = { 
        'beginner': 'Principiante', 
        'intermediate': 'Intermedio', 
        'advanced': 'Avanzado',
        'athlete': 'Atleta'
      };

      const referralMap: Record<string, string> = { 
        'social_media': 'Redes Sociales', 
        'friend_family': 'Amigo/Familiar', 
        'passing_by': 'Pasaba por aquí', 
        'google': 'Google', 
        'flyer': 'Folleto',
        'other': 'Otro' 
      };

      // --- SECCIÓN 1: DATOS PERSONALES ---
      doc.fillColor('#FACC15').fontSize(12).text('DATOS DEL MIEMBRO', 50, doc.y, { underline: true });
      doc.moveDown(0.5);
      
      doc.fillColor('#FFFFFF').fontSize(9);
      if (fs.existsSync(fontRegularPath)) doc.font('Arial');
      
      let currentY = doc.y;
      const col1 = 50;
      const col2 = 300;
      const lineHeight = 15;

      // Corrección de Fecha (Añadir T12:00:00 para evitar desfase de zona horaria al convertir)
      const birthDateObj = new Date(formData.personalData.dateOfBirth + 'T12:00:00');
      const birthDateStr = !isNaN(birthDateObj.getTime()) 
        ? birthDateObj.toLocaleDateString('es-MX') 
        : formData.personalData.dateOfBirth;

      // Fila 1
      doc.text(`Nombre Completo:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.firstName} ${formData.personalData.lastName}`, col1 + 100, currentY);
      
      doc.fillColor('#FFFFFF').text(`Fecha Nacimiento:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(birthDateStr, col2 + 100, currentY);
      
      currentY += lineHeight;

      // Fila 2
      doc.fillColor('#FFFFFF').text(`Género:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(genderMap[formData.personalData.gender] || formData.personalData.gender, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Estado Civil:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(civilStatusMap[formData.personalData.civilStatus] || formData.personalData.civilStatus, col2 + 100, currentY);

      currentY += lineHeight;

      // Fila 3
      doc.fillColor('#FFFFFF').text(`Email:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.email}`, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Teléfono:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.whatsapp}`, col2 + 100, currentY);

      currentY += lineHeight * 1.5;

      // --- SECCIÓN 2: DIRECCIÓN ---
      doc.fillColor('#FACC15').fontSize(12).text('DIRECCIÓN', col1, currentY, { underline: true });
      currentY += lineHeight * 1.5;
      
      doc.fillColor('#FFFFFF').fontSize(9);

      // Fila 1
      doc.text(`Calle y Número:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.street} ${formData.personalData.number}`, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Colonia:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.colony}`, col2 + 100, currentY);

      currentY += lineHeight;

      // Fila 2
      doc.fillColor('#FFFFFF').text(`Ciudad/Estado:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.city}, ${formData.personalData.state}`, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`CP / País:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.personalData.zipCode}, ${formData.personalData.country}`, col2 + 100, currentY);

      currentY += lineHeight * 1.5;

      // --- SECCIÓN 3: PERFIL DEPORTIVO ---
      doc.fillColor('#FACC15').fontSize(12).text('PERFIL DEPORTIVO', col1, currentY, { underline: true });
      currentY += lineHeight * 1.5;
      
      doc.fillColor('#FFFFFF').fontSize(9);

      // Fila 1
      doc.text(`Motivación:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(motivationMap[formData.preferences.mainMotivation] || formData.preferences.mainMotivation, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Nivel:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(levelMap[formData.preferences.trainingLevel] || formData.preferences.trainingLevel, col2 + 100, currentY);

      currentY += lineHeight;

      // Fila 2
      doc.fillColor('#FFFFFF').text(`Referido por:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(referralMap[formData.preferences.referredBy] || formData.preferences.referredBy || 'N/A', col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Desea Planes:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.preferences.receivePlans ? 'Sí' : 'No'}`, col2 + 100, currentY);

      currentY += lineHeight * 1.5;

      // --- SECCIÓN 4: EMERGENCIA ---
      doc.fillColor('#FACC15').fontSize(12).text('CONTACTO DE EMERGENCIA', col1, currentY, { underline: true });
      currentY += lineHeight * 1.5;
      
      doc.fillColor('#FFFFFF').fontSize(9);

      // Fila 1
      doc.text(`Nombre:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.emergencyData.emergencyContactName}`, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Teléfono:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.emergencyData.emergencyContactPhone || 'No especificado'}`, col2 + 100, currentY);

      currentY += lineHeight;

      // Fila 2
      doc.fillColor('#FFFFFF').text(`Condición Médica:`, col1, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.emergencyData.medicalCondition || 'Ninguna'}`, col1 + 100, currentY);

      doc.fillColor('#FFFFFF').text(`Tipo de Sangre:`, col2, currentY);
      doc.fillColor('#CCCCCC').text(`${formData.emergencyData.bloodType || 'No especificado'}`, col2 + 100, currentY);

      currentY += lineHeight * 2;

      // --- SECCIÓN 5: REGLAMENTO ---
      doc.fillColor('#FACC15').fontSize(12).text('NORMATIVAS PARA SER USUARIO DE MUSCLE UP GYM', col1, currentY, { underline: true });
      currentY += lineHeight * 1.5;
      
      doc.fillColor('#CCCCCC').fontSize(8);
      
      // Reglamento completo extraído del componente ContractStep.tsx
      const regulations = [
        "RESPECTO AL CONTROL DE ACCESO Y VIGENCIA DE MEMBRESÍA:",
        "• La renovación del pago se deberá realizar mínimo con dos días de antelación a la fecha de corte.",
        "• El acceso a las instalaciones se realizará mediante la identificación oportuna de su huella digital, respetando los horarios establecidos.",
        "• El biométrico de huella digital liberará el acceso siempre y cuando su membresía esté vigente.",
        "• Su vigencia terminará el día indicado en su comprobante de pago.",
        "• Si el usuario tiene que ausentarse debido a cuestiones personales, su membresía no podrá ser congelada ni transferida.",
        "• Después de 6 meses continuos de inactividad, se depurarán sus datos y tendrá que cubrir el pago de inscripción nuevamente.",
        "• Una vez utilizada la membresía no podrá ser cambiada a otra modalidad.",
        "• Podrá realizar su pago con antelación e indicar cuándo comenzará a asistir.",
        "• La dirección se reserva el derecho de realizar cambios en la reglamentación, costos y horarios.",
        "• El usuario podrá acceder en dos ocasiones con su huella digital durante el día; si regresa una tercera vez se negará el acceso.",
        "• Los menores de 18 años deberán presentar la firma del padre, madre o tutor.",
        "• La edad mínima para inscribirse es de 12 años.",
        "",
        "RESPECTO A LOS HORARIOS DE OPERACIÓN:",
        "• Horarios: Lunes a viernes de 6:30 am a 10:00 pm y sábados de 9:00 am a 5:00 pm.",
        "• En días festivos nacionales de lunes a viernes: 8:30 am a 6:30 pm; sábados festivos: 9:00 am a 3:00 pm.",
        "• Los días 25 de diciembre, 1 de enero y viernes y sábado de semana santa permanecerán cerradas.",
        "• MUSCLE UP GYM podrá modificar el horario por trabajos de reparación, notificando con antelación.",
        "",
        "RESPECTO A LA RESPONSABILIDAD POR EL USO DE LAS INSTALACIONES:",
        "• MUSCLE UP GYM no será responsable de lesiones salvo que se deriven de un mal estado de la instalación.",
        "• No se promete indemnización en caso de accidentes por incumplimiento de normas o negligencia.",
        "• MUSCLE UP GYM no se hace responsable por robo de pertenencias.",
        "• El staff tiene prohibido resguardar objetos personales en la oficina.",
        "• Los usuarios mantendrán limpieza, orden y comportamiento respetuoso. El incumplimiento resulta en baja definitiva.",
        "• Es recomendable pasar una revisión médica antes de comenzar actividad física.",
        "• OBLIGATORIO: Protocolo de ingreso con huella digital, tapete sanitizante y secado de suela.",
        "• OBLIGATORIO: Uso de 2 toallas para utilización de máquinas.",
        "• Colocar el material en su lugar y limpiar aparatos después de usar.",
        "• Dejar libres las máquinas entre descansos para otros usuarios.",
        "• OBLIGATORIO: Portar ropa deportiva (shorts, pants, playeras, tenis).",
        "• PROHIBIDO: Lanzar, arrojar o azotar equipos. Incumplimiento = baja definitiva.",
        "• PROHIBIDO: Actividades físicas ajenas al entrenamiento que dañen usuarios o instalaciones.",
        "• PROHIBIDO: Comercialización u ofertamiento de servicios dentro de las instalaciones.",
        "• PROHIBIDO: Fingir como entrenador personal u ofertar planes.",
        "• PROHIBIDO: Difusión de volantes, folletos, promociones o actividades lucrativas.",
        "• PROHIBIDO: Ingreso de mascotas o dejarlas en recepción.",
        "• Acompañantes no inscritos mayores de 12 años pueden esperar en oficina, no ingresar a áreas de entrenamiento.",
        "• PROHIBIDO: Bebidas alcohólicas, drogas o fumar.",
        "• Se negará acceso a usuarios bajo influencia de alcohol o drogas.",
        "• PROHIBIDO: Portar armas u objetos punzocortantes.",
        "• La compra y consumo de suplementos es responsabilidad del usuario.",
        "• Permitido fotografías/videos propios, prohibido a otras personas sin consentimiento.",
        "• El usuario se compromete a respetar la normativa desde la inscripción.",
        "• MUSCLE UP GYM se reserva el derecho de admisión."
      ];
      
      regulations.forEach(reg => {
        // Verificar si cabe en la página, si no, nueva página
        if (currentY + 20 > doc.page.height - 50) {
            doc.addPage();
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
            currentY = 50;
            doc.fillColor('#CCCCCC').fontSize(8);
        }

        if (reg.startsWith("RESPECTO")) {
            doc.font(fs.existsSync(fontBoldPath) ? 'Arial-Bold' : 'Helvetica-Bold').fillColor('#FFFFFF');
            currentY += 5;
        } else {
            doc.font(fs.existsSync(fontRegularPath) ? 'Arial' : 'Helvetica').fillColor('#CCCCCC');
        }
        
        doc.text(reg, col1, currentY, { width: 500, align: 'left' });
        currentY += doc.heightOfString(reg, { width: 500 }) + 3;
      });

      currentY += 20;

      // --- SECCIÓN 6: FIRMAS Y FOTOS ---
      
      // Verificar si cabe en la página, si no, nueva página
      if (currentY + 150 > doc.page.height) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
        currentY = 50;
      }

      const photoY = currentY;
      
      // Foto de Perfil (Con fondo blanco)
      if (profilePhotoBuffer) {
        try {
            doc.fillColor('#FFFFFF').fontSize(10).text('FOTO DE PERFIL', col1, photoY - 15);
            
            // Fondo blanco para la foto
            doc.roundedRect(col1, photoY, 100, 100, 5).fill('#FFFFFF');
            
            // Imagen centrada en el cuadro blanco
            doc.image(profilePhotoBuffer, col1 + 5, photoY + 5, { fit: [90, 90], align: 'center' });
        } catch (e) {
            console.error("Error adding profile photo to PDF", e);
        }
      }

      // Firma (Con fondo blanco)
      if (signatureBuffer) {
        try {
            doc.fillColor('#FFFFFF').fontSize(10).text('FIRMA DEL MIEMBRO', col2, photoY - 15);
            
            // Fondo blanco para la firma
            doc.roundedRect(col2, photoY, 200, 100, 5).fill('#FFFFFF');
            
            // Imagen de la firma
            doc.image(signatureBuffer, col2 + 10, photoY + 10, { fit: [180, 80], align: 'center' });
            
            // Línea de firma (negra ahora porque el fondo es blanco)
            doc.strokeColor('#000000').moveTo(col2 + 20, photoY + 85).lineTo(col2 + 180, photoY + 85).stroke();
        } catch (e) {
            console.error("Error adding signature to PDF", e);
        }
      }

      // Fecha al pie
      doc.fontSize(8).fillColor('#666666')
         .text(`Fecha de registro: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`, 
               50, 
               doc.page.height - 50, 
               { align: 'center' }
         );

      doc.end();

      const pdfBuffer = await pdfBufferPromise;

      // Subir PDF al Storage
      const pdfFileName = `${userFolder}/contract_${Date.now()}.pdf`;
      const { error: pdfUploadError } = await storageClient
        .storage
        .from('muscleup-files')
        .upload(pdfFileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (pdfUploadError) {
        console.error('Error uploading PDF:', pdfUploadError);
      } else {
        const { data: { publicUrl: pdfPublicUrl } } = storageClient
          .storage
          .from('muscleup-files')
          .getPublicUrl(pdfFileName);

        await adminSupabase
          .from('profiles')
          .update({ contract_pdf_url: pdfPublicUrl })
          .eq('id', authData.user.id);
          
        if (newProfile) {
            newProfile.contract_pdf_url = pdfPublicUrl;
        }
      }

    } catch (pdfError) {
      console.error('Error generating/uploading PDF:', pdfError);
    }

    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      profile: newProfile
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
