'use client';

import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Card } from '@/components/ui';
import { Contract } from '@/types/registration';

interface ContractStepProps {
  onNext: (data: Contract) => void;
  onBack: () => void;
}

export const ContractStep = ({ onNext, onBack }: ContractStepProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 256 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setCanvasDimensions({
          width: width,
          height: 256 // h-64 equivalent
        });
      }
    };

    // Initial measurement with a small delay to account for animations
    const timer = setTimeout(updateDimensions, 100);

    // Use ResizeObserver for robust size tracking
    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setError(null);
  };

  const handleSubmit = () => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Debes aceptar los términos y condiciones y la política de privacidad.');
      return;
    }

    if (sigCanvas.current?.isEmpty()) {
      setError('Por favor, firma el contrato para continuar.');
      return;
    }

    const signature = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '';

    onNext({
      signature,
      acceptedTerms,
      acceptedPrivacy,
      signedDate: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">Contrato de registro</h2>
        <p className="text-gray-400">
          Por favor, lee y firma el contrato para finalizar tu registro.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-surface border-border/50 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Área del Contrato (Scrollable) */}
          <div className="h-64 overflow-y-auto p-4 bg-background/50 rounded-lg border border-border text-sm text-gray-300 space-y-4 custom-scrollbar">
            <h3 className="font-bold text-white text-lg text-center mb-4">NORMATIVAS PARA SER USUARIO DE MUSCLE UP GYM</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white mb-2">RESPECTO AL CONTROL DE ACCESO Y VIGENCIA DE MEMBRESÍA</h4>
                <p className="font-medium text-primary mb-2 italic">"La renovación del pago se deberá realizar mínimo con dos días de antelación a la fecha de corte".</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>El acceso a las instalaciones se realizará mediante la identificación oportuna de su huella digital, respetando los horarios establecidos.</li>
                  <li>El biométrico de huella digital liberará el acceso siempre y cuando su membresía esté vigente.</li>
                  <li>Su vigencia terminará el día indicado en su comprobante de pago.</li>
                  <li>Si el usuario tiene que ausentarse debido a cuestiones personales, su membresía no podrá ser congelada ni transferida.</li>
                  <li>Después de 6 meses continuos de inactividad, se depurarán sus datos y tendrá que cubrir el pago de inscripción nuevamente.</li>
                  <li>Una vez utilizada la membresía no podrá ser cambiada a otra modalidad.</li>
                  <li>Podrá realizar su pago con antelación e indicar cuándo comenzará a asistir.</li>
                  <li>La dirección se reserva el derecho de realizar cambios en la reglamentación, costos y horarios.</li>
                  <li>El usuario podrá acceder en dos ocasiones con su huella digital durante el día; si regresa una tercera vez se negará el acceso.</li>
                  <li>Los menores de 18 años deberán presentar la firma del padre, madre o tutor.</li>
                  <li>La edad mínima para inscribirse es de 12 años.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">RESPECTO A LOS HORARIOS DE OPERACIÓN</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Horarios: Lunes a viernes de 6:30 am a 10:00 pm y sábados de 9:00 am a 5:00 pm.</li>
                  <li>En días festivos nacionales de lunes a viernes: 8:30 am a 6:30 pm; sábados festivos: 9:00 am a 3:00 pm.</li>
                  <li>Los días 25 de diciembre, 1 de enero y viernes y sábado de semana santa permanecerán cerradas.</li>
                  <li>MUSCLE UP GYM podrá modificar el horario por trabajos de reparación, notificando con antelación.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">RESPECTO A LA RESPONSABILIDAD POR EL USO DE LAS INSTALACIONES</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>MUSCLE UP GYM no será responsable de lesiones salvo que se deriven de un mal estado de la instalación.</li>
                  <li>No se promete indemnización en caso de accidentes por incumplimiento de normas o negligencia.</li>
                  <li>MUSCLE UP GYM no se hace responsable por robo de pertenencias.</li>
                  <li>El staff tiene prohibido resguardar objetos personales en la oficina.</li>
                  <li>Los usuarios mantendrán limpieza, orden y comportamiento respetuoso. El incumplimiento resulta en baja definitiva.</li>
                  <li>Es recomendable pasar una revisión médica antes de comenzar actividad física.</li>
                  <li><strong>OBLIGATORIO:</strong> Protocolo de ingreso con huella digital, tapete sanitizante y secado de suela.</li>
                  <li><strong>OBLIGATORIO:</strong> Uso de 2 toallas para utilización de máquinas.</li>
                  <li>Colocar el material en su lugar y limpiar aparatos después de usar.</li>
                  <li>Dejar libres las máquinas entre descansos para otros usuarios.</li>
                  <li><strong>OBLIGATORIO:</strong> Portar ropa deportiva (shorts, pants, playeras, tenis).</li>
                  <li><strong>PROHIBIDO:</strong> Lanzar, arrojar o azotar equipos. Incumplimiento = baja definitiva.</li>
                  <li><strong>PROHIBIDO:</strong> Actividades físicas ajenas al entrenamiento que dañen usuarios o instalaciones.</li>
                  <li><strong>PROHIBIDO:</strong> Comercialización u ofertamiento de servicios dentro de las instalaciones.</li>
                  <li><strong>PROHIBIDO:</strong> Fingir como entrenador personal u ofertar planes.</li>
                  <li><strong>PROHIBIDO:</strong> Difusión de volantes, folletos, promociones o actividades lucrativas.</li>
                  <li><strong>PROHIBIDO:</strong> Ingreso de mascotas o dejarlas en recepción.</li>
                  <li>Acompañantes no inscritos mayores de 12 años pueden esperar en oficina, no ingresar a áreas de entrenamiento.</li>
                  <li><strong>PROHIBIDO:</strong> Bebidas alcohólicas, drogas o fumar.</li>
                  <li>Se negará acceso a usuarios bajo influencia de alcohol o drogas.</li>
                  <li><strong>PROHIBIDO:</strong> Portar armas u objetos punzocortantes.</li>
                  <li>La compra y consumo de suplementos es responsabilidad del usuario.</li>
                  <li>Permitido fotografías/videos propios, prohibido a otras personas sin consentimiento.</li>
                  <li>El usuario se compromete a respetar la normativa desde la inscripción.</li>
                  <li>MUSCLE UP GYM se reserva el derecho de admisión.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Checkboxes de Aceptación */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-all checked:border-primary checked:bg-primary hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (error) setError(null);
                  }}
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors pt-0.5">
                He leído y acepto los <span className="text-primary hover:underline">Términos y Condiciones</span>.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-all checked:border-primary checked:bg-primary hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  checked={acceptedPrivacy}
                  onChange={(e) => {
                    setAcceptedPrivacy(e.target.checked);
                    if (error) setError(null);
                  }}
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors pt-0.5">
                Acepto la <span className="text-primary hover:underline">Política de Privacidad</span>.
              </span>
            </label>
          </div>

          {/* Área de Firma */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Firma Digital <span className="text-primary">*</span>
            </label>
            <div 
              ref={containerRef}
              className="border border-border rounded-lg overflow-hidden bg-white relative max-w-xl mx-auto shadow-inner h-64"
            >
              {canvasDimensions.width > 0 && (
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    width: canvasDimensions.width,
                    height: canvasDimensions.height,
                    className: 'cursor-crosshair',
                  }}
                  onEnd={() => {
                    if (error) setError(null);
                  }}
                />
              )}
              <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
                <div className="h-px w-3/4 bg-gray-300 mx-auto"></div>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="absolute top-2 right-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md transition-colors border border-gray-200 font-medium"
              >
                Borrar firma
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Dibuja tu firma en el recuadro blanco (encima de la línea).
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-1/2"
            >
              Atrás
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-black font-bold"
            >
              Finalizar Registro
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
