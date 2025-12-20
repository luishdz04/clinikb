'use client';

import { useForm } from 'react-hook-form';
import { Input, Select, Button } from '@/components/ui';
import { PhoneInput } from '@/components/ui/PhoneInput';
import type { EmergencyData } from '@/types/registration';

interface EmergencyDataStepProps {
  data?: Partial<EmergencyData>;
  onNext: (data: EmergencyData) => void;
  onBack: () => void;
}

export function EmergencyDataStep({ data, onNext, onBack }: EmergencyDataStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmergencyData>({
    defaultValues: data || {},
  });

  const onSubmit = (formData: EmergencyData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border-light">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Contacto de Emergencia
        </h2>
        <p className="text-muted text-sm md:text-base">
          Información importante para tu seguridad
        </p>
      </div>

      {/* Contacto de Emergencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <Input
          label="Nombre completo del contacto"
          placeholder="Nombre de familiar o amigo"
          {...register('emergencyContactName', { required: 'Este campo es obligatorio' })}
          error={errors.emergencyContactName?.message}
          required
        />
        <PhoneInput
          label="Teléfono de emergencia"
          value={watch('emergencyContactPhone')}
          onChange={(value) => setValue('emergencyContactPhone', value)}
          error={errors.emergencyContactPhone?.message}
          required
        />
      </div>

      {/* Información Médica */}
      <div className="pt-6 mt-8 border-t border-border-light">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
          Información Médica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <Select
            label="Tipo de Sangre"
            options={[
              { value: '', label: 'Selecciona' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' },
            ]}
            {...register('bloodType', { required: 'Este campo es obligatorio' })}
            error={errors.bloodType?.message}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Condiciones Médicas / Alergias"
              placeholder="Describe condiciones o alergias (escribe 'Ninguna' si no aplica)"
              {...register('medicalCondition', { required: 'Este campo es obligatorio' })}
              error={errors.medicalCondition?.message}
              required
            />
          </div>
        </div>
      </div>

      {/* Botones de Navegación */}
      <div className="pt-8 mt-8 border-t border-border-light">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={onBack}
          >
            Atrás
          </Button>
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto min-w-[160px]">
            Continuar
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </form>
  );
}
