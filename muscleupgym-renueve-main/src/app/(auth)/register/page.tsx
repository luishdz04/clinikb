'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PersonalDataStep } from '@/components/registration/PersonalDataStep';
import { EmergencyDataStep } from '@/components/registration/EmergencyDataStep';
import { PreferencesStep } from '@/components/registration/PreferencesStep';
import { ContractStep } from '@/components/registration/ContractStep';
import type { PersonalData, EmergencyData, PreferencesData, Contract, RegistrationStep } from '@/types/registration';
import { Button } from '@/components/ui';

// Iconos SVG profesionales
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<any>(null);

  const steps = [
    { id: 'personal', label: 'Datos Personales', icon: UserIcon },
    { id: 'emergency', label: 'Contacto de Emergencia', icon: PhoneIcon },
    { id: 'preferences', label: 'Preferencias', icon: SettingsIcon },
    { id: 'contract', label: 'Contrato', icon: DocumentIcon },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handlePersonalDataNext = (data: PersonalData) => {
    setFormData({ ...formData, personalData: data });
    setCurrentStep('emergency');
  };

  const handleEmergencyDataNext = (data: EmergencyData) => {
    setFormData({ ...formData, emergencyData: data });
    setCurrentStep('preferences');
  };

  const handlePreferencesNext = (data: PreferencesData) => {
    setFormData({ ...formData, preferences: data });
    setCurrentStep('contract');
  };

  const handleContractNext = async (data: Contract) => {
    const finalData = { ...formData, contract: data };
    setFormData(finalData);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el registro');
      }

      // Éxito
      setRegisteredProfile(result.profile);
      setRegistrationSuccess(true);

    } catch (error) {
      console.error('Error al registrar:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const stepsOrder: RegistrationStep[] = ['personal', 'emergency', 'preferences', 'contract'];
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepsOrder[currentIndex - 1]);
    }
  };

  if (registrationSuccess && registeredProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-border text-center space-y-6 animate-in fade-in zoom-in duration-500 shadow-2xl shadow-black/50">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/50">
            <CheckIcon className="w-10 h-10" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-400">
              Revisa tu email para confirmar tu cuenta.
            </p>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border border-border text-left text-sm space-y-2">
            <p className="flex justify-between"><span className="text-gray-400">Nombre:</span> <span className="text-white font-medium">{registeredProfile.first_name} {registeredProfile.last_name}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="text-white font-medium">{registeredProfile.email}</span></p>
            <p className="flex justify-between"><span className="text-gray-400">Fecha:</span> <span className="text-white font-medium">{new Date(registeredProfile.created_at).toLocaleString('es-MX')}</span></p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/login" className="block w-full">
              <Button variant="primary" className="w-full h-12">
                Ir al Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* Logo */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logos/logo.png"
              alt="MuscleUp Gym"
              width={180}
              height={60}
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
              priority
            />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Tu salud y bienestar son nuestra misión
            </h1>
            <p className="text-muted text-base md:text-lg max-w-2xl mx-auto">
              Completa tu registro en 4 sencillos pasos
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-10 md:mb-16">
            <div className="flex items-center justify-between relative">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface -translate-y-1/2 -z-10" style={{ left: '7%', right: '7%' }}></div>
              {/* Progress Bar Fill */}
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 ease-out"
                style={{ 
                  left: '7%',
                  width: currentStepIndex === 0 ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 86}%`
                }}
              ></div>

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-primary text-background shadow-lg shadow-primary/30'
                          : isActive
                          ? 'bg-primary text-background shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                          : 'bg-surface text-muted border-2 border-border-light'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-background' : 'text-muted'}`} />
                      )}
                    </div>
                    <span
                      className={`mt-3 text-xs md:text-sm font-medium text-center max-w-[90px] md:max-w-[120px] leading-tight ${
                        isActive || isCompleted ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="mt-1 text-xs text-primary font-semibold">
                        Paso {index + 1} de {steps.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-surface rounded-xl md:rounded-2xl border border-border-light shadow-xl">
            <div className="p-6 md:p-10 lg:p-12">
              {currentStep === 'personal' && (
                <PersonalDataStep
                  data={formData.personalData}
                  onNext={handlePersonalDataNext}
                />
              )}
              {currentStep === 'emergency' && (
                <EmergencyDataStep
                  data={formData.emergencyData}
                  onNext={handleEmergencyDataNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 'preferences' && (
                <PreferencesStep
                  data={formData.preferences}
                  onNext={handlePreferencesNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 'contract' && (
                <div className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
                  <ContractStep
                    onNext={handleContractNext}
                    onBack={handleBack}
                  />
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer con botón de regreso */}
            <div className="px-6 md:px-10 lg:px-12 pb-6 md:pb-10 lg:pb-12 pt-0 border-t border-border-light">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="md"
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Regresar al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
