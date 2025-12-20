'use client';

import { useForm } from 'react-hook-form';
import { Select, Button } from '@/components/ui';
import type { PreferencesData } from '@/types/registration';

interface PreferencesStepProps {
  data?: Partial<PreferencesData>;
  onNext: (data: PreferencesData) => void;
  onBack: () => void;
}

export function PreferencesStep({ data, onNext, onBack }: PreferencesStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesData>({
    defaultValues: {
      receivePlans: true,
      ...data,
    },
  });

  const onSubmit = (formData: PreferencesData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border-light">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Tus Preferencias
        </h2>
        <p className="text-muted text-sm md:text-base">
          Ayúdanos a personalizar tu experiencia en el gimnasio
        </p>
      </div>

      {/* Objetivos y Nivel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <Select
          label="Objetivo Principal"
          options={[
            { value: '', label: 'Selecciona tu objetivo' },
            { value: 'weight_loss', label: 'Perder peso / Quemar grasa' },
            { value: 'muscle_gain', label: 'Ganar masa muscular' },
            { value: 'general_health', label: 'Salud general y bienestar' },
            { value: 'sports_performance', label: 'Rendimiento deportivo' },
            { value: 'toning', label: 'Tonificación' },
            { value: 'rehabilitation', label: 'Rehabilitación / Terapia' },
            { value: 'other', label: 'Otro' },
          ]}
          {...register('mainMotivation', { required: 'Este campo es obligatorio' })}
          error={errors.mainMotivation?.message}
          required
        />

        <Select
          label="Nivel de Entrenamiento"
          options={[
            { value: '', label: 'Selecciona tu nivel' },
            { value: 'beginner', label: 'Principiante (Menos de 6 meses)' },
            { value: 'intermediate', label: 'Intermedio (6 meses a 2 años)' },
            { value: 'advanced', label: 'Avanzado (Más de 2 años)' },
            { value: 'athlete', label: 'Atleta (Deporte profesional)' },
          ]}
          {...register('trainingLevel', { required: 'Este campo es obligatorio' })}
          error={errors.trainingLevel?.message}
          required
        />
      </div>

      {/* Referencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-5 md:mt-6">
        <Select
          label="¿Cómo nos conociste?"
          options={[
            { value: '', label: 'Selecciona una opción' },
            { value: 'social_media', label: 'Redes Sociales (Facebook/Instagram/TikTok)' },
            { value: 'friend_family', label: 'Recomendación de Amigo/Familiar' },
            { value: 'google', label: 'Búsqueda en Google / Maps' },
            { value: 'passing_by', label: 'Pasaba por aquí / Vi el local' },
            { value: 'flyer', label: 'Folleto / Publicidad impresa' },
            { value: 'other', label: 'Otro medio' },
          ]}
          {...register('referredBy', { required: 'Este campo es obligatorio' })}
          error={errors.referredBy?.message}
          required
        />
      </div>

      {/* Checkbox de Comunicaciones */}
      <div className="pt-6 mt-8 border-t border-border-light">
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center h-5">
            <input
              id="receivePlans"
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary bg-surface"
              {...register('receivePlans')}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="receivePlans" className="font-medium text-foreground cursor-pointer">
              Deseo recibir planes de entrenamiento
            </label>
            <p className="text-muted mt-1">
              Me gustaría recibir las rutinas gratuitas y opciones de entrenamiento que ofrece el gimnasio.
            </p>
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
