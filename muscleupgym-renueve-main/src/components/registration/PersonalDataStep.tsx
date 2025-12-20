'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Button, EmailInput } from '@/components/ui';
import { ProfilePhotoUploader } from '@/components/ui/ProfilePhotoUploader';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PostalCodeInput } from '@/components/ui/PostalCodeInput';
import type { PersonalData } from '@/types/registration';

interface PersonalDataStepProps {
  data?: Partial<PersonalData>;
  onNext: (data: PersonalData) => void;
}

export function PersonalDataStep({ data, onNext }: PersonalDataStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalData>({
    defaultValues: {
      country: 'México',
      ...data,
    },
  });

  const password = watch('password');
  const dateOfBirth = watch('dateOfBirth');
  const [isMinor, setIsMinor] = useState(false);

  // Registrar campo whatsapp para validación
  useEffect(() => {
    register('whatsapp', { required: 'El número de WhatsApp es obligatorio' });
  }, [register]);

  useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      const minor = age < 18;
      setIsMinor(minor);
      setValue('isMinor', minor);
    }
  }, [dateOfBirth, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('tutorIdFile', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (formData: PersonalData) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border-light">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Información Personal
        </h2>
        <p className="text-muted text-sm md:text-base">
          Proporciona tus datos básicos para crear tu cuenta
        </p>
      </div>

      {/* Foto de perfil */}
      <div className="flex justify-center mb-8">
        <ProfilePhotoUploader
          value={watch('profilePhoto')}
          onChange={(value) => setValue('profilePhoto', value)}
        />
      </div>

      {/* Nombre y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <Input
          label="Nombre(s)"
          placeholder="Escribe tu nombre"
          {...register('firstName', { required: 'Este campo es obligatorio' })}
          error={errors.firstName?.message}
          required
        />
        <Input
          label="Apellidos"
          placeholder="Escribe tus apellidos"
          {...register('lastName', { required: 'Este campo es obligatorio' })}
          error={errors.lastName?.message}
          required
        />
      </div>

      {/* Email */}
      <div>
        <EmailInput
          label="Correo electrónico"
          placeholder="tu@email.com"
          {...register('email', {
            required: 'Este campo es obligatorio',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido',
            },
          })}
          error={errors.email?.message}
          required
          helperText="Tu información está protegida con los más altos estándares de seguridad"
        />
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <Input
          label="Contraseña"
          type="password"
          placeholder="Al menos 8 caracteres"
          {...register('password', {
            required: 'Este campo es obligatorio',
            minLength: {
              value: 8,
              message: 'Mínimo 8 caracteres',
            },
          })}
          error={errors.password?.message}
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          {...register('confirmPassword', {
            required: 'Este campo es obligatorio',
            validate: (value) => value === password || 'Las contraseñas no coinciden',
          })}
          error={errors.confirmPassword?.message}
          required
        />
      </div>

      {/* WhatsApp y Fecha de nacimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <PhoneInput
          label="WhatsApp"
          value={watch('whatsapp')}
          onChange={(value) => setValue('whatsapp', value, { shouldValidate: true })}
          error={errors.whatsapp?.message}
          required
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          {...register('dateOfBirth', { required: 'Este campo es obligatorio' })}
          error={errors.dateOfBirth?.message}
          required
        />
      </div>

      {/* Sección para menores de edad */}
      {isMinor && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
          <h4 className="text-yellow-500 font-semibold mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Usuario menor de edad
          </h4>
          <p className="text-sm text-gray-300 mb-4">
            Al ser menor de 18 años, es obligatorio subir una identificación oficial (INE/Pasaporte) del padre, madre o tutor legal.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Identificación del Tutor <span className="text-primary">*</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-black
                hover:file:bg-primary/90
                cursor-pointer"
              required={isMinor}
            />
            {errors.tutorIdFile && (
              <p className="text-red-500 text-xs mt-1">{errors.tutorIdFile.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Dirección */}
      <div className="pt-6 mt-8 border-t border-border-light">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
          Dirección de Residencia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-5 md:mb-6">
          <div>
            <PostalCodeInput
              label="Código Postal"
              value={watch('zipCode')}
              onChange={(data) => {
                setValue('zipCode', data.zipCode);
                setValue('state', data.state);
                setValue('city', data.city);
                setValue('colony', data.colony);
              }}
              error={errors.zipCode?.message}
              required
            />
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">
              Ingresa tu CP para autocompletar dirección. Puedes editar los campos si es necesario.
            </p>
          </div>
          <Input
            label="País"
            {...register('country', { required: 'Este campo es obligatorio' })}
            error={errors.country?.message}
            required
            readOnly
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mt-5 md:mt-6">
          <Input
            label="Estado"
            placeholder="Estado"
            {...register('state', { required: 'Este campo es obligatorio' })}
            error={errors.state?.message}
            required
          />
          <Input
            label="Ciudad"
            placeholder="Ciudad"
            {...register('city', { required: 'Este campo es obligatorio' })}
            error={errors.city?.message}
            required
          />
        </div>

        <div className="mt-5 md:mt-6">
          <Input
            label="Colonia"
            placeholder="Nombre de la colonia"
            {...register('colony', { required: 'Este campo es obligatorio' })}
            error={errors.colony?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-5 md:mt-6">
          <div className="md:col-span-2">
            <Input
              label="Calle"
              placeholder="Nombre de la calle"
              {...register('street', { required: 'Este campo es obligatorio' })}
              error={errors.street?.message}
              required
            />
          </div>
          <Input
            label="Número"
            placeholder="Número"
            {...register('number', { required: 'Este campo es obligatorio' })}
            error={errors.number?.message}
            required
          />
        </div>
      </div>

      {/* Género y Estado Civil */}
      <div className="pt-6 mt-8 border-t border-border-light">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
          Información Adicional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <Select
            label="Género"
            options={[
              { value: '', label: 'Selecciona' },
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' },
            ]}
            {...register('gender', { required: 'Este campo es obligatorio' })}
            error={errors.gender?.message}
            required
          />
          <Select
            label="Estado Civil"
            options={[
              { value: '', label: 'Selecciona' },
              { value: 'single', label: 'Soltero(a)' },
              { value: 'married', label: 'Casado(a)' },
              { value: 'divorced', label: 'Divorciado(a)' },
              { value: 'widowed', label: 'Viudo(a)' },
            ]}
            {...register('civilStatus', { required: 'Este campo es obligatorio' })}
            error={errors.civilStatus?.message}
            required
          />
        </div>
      </div>

      {/* Botón Siguiente */}
      <div className="pt-8 mt-8 border-t border-border-light">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            Cancelar
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
