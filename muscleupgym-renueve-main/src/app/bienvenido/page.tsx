'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, FileText, Mail, MessageCircle, Home, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Componente interno que usa useSearchParams/window.location
function BienvenidoContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    const processVerification = async () => {
      try {
        // 1. Intentar obtener el token del hash de la URL (Magic Link)
        let token = '';
        if (typeof window !== 'undefined' && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          token = params.get('access_token') || '';
        }

        // Si no hay token en el hash, intentamos obtener la sesión actual
        if (!token) {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }

        if (!token) {
          // Esperamos un poco por si Supabase está procesando el hash
          await new Promise(resolve => setTimeout(resolve, 2000));
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }

        if (!token) {
          throw new Error('No se pudo verificar la sesión. Por favor inicia sesión nuevamente.');
        }

        // 2. Llamar a la API de Welcome Package con el token explícito
        const response = await fetch('/api/welcome-package', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Tu cuenta ha sido verificada exitosamente');
        } else {
          throw new Error(data.error || 'Error al procesar el paquete de bienvenida');
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Hubo un problema al verificar tu cuenta.');
      }
    };

    processVerification();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary mb-2">Procesando...</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-surface border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center shadow-lg bg-red-500/5">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-surface border border-green-500/30 rounded-xl p-8 max-w-md w-full text-center shadow-lg bg-green-500/5">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-primary mb-2">¡Bienvenido!</h1>
        <p className="text-xl text-foreground mb-6">Tu cuenta ha sido verificada</p>
        
        <div className="space-y-4 mb-8">
          <p className="text-muted-foreground">Hemos preparado todo para ti:</p>
          
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-surface border border-border">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">Contrato</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-surface border border-border">
                <Mail className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">Correo</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-surface border border-border">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">WhatsApp</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Tu registro en nuestro sitio web ha sido exitoso. Para activar tu membresía, contáctanos directamente y revisa nuestros planes.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition-colors w-full"
        >
          <Home className="w-5 h-5" />
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}

export default function BienvenidoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BienvenidoContent />
    </Suspense>
  );
}
