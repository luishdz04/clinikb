'use client';

import { useState, useEffect } from 'react';
import { Input } from './Input';
import { cn } from '@/lib/utils';

export interface PostalCodeData {
  zipCode: string;
  state: string;
  city: string;
  colony: string;
}

export interface PostalCodeInputProps {
  value?: string;
  onChange: (data: PostalCodeData) => void;
  label?: string;
  error?: string;
  required?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export function PostalCodeInput({
  value = '',
  onChange,
  label = 'Código Postal',
  error,
  required,
  onLoadingChange,
}: PostalCodeInputProps) {
  const [zipCode, setZipCode] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setZipCode(value);
  }, [value]);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  const fetchPostalCodeData = async (code: string) => {
    if (code.length !== 5 || !/^\d+$/.test(code)) {
      return;
    }

    setIsLoading(true);
    try {
      // Usar nuestro API route que actúa como proxy (evita problemas de CORS)
      const response = await fetch(`/api/postal-code/${code}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Si no se encuentra, simplemente no autocompletar
        return;
      }

      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Tomar el primer resultado (puede haber múltiples colonias para un mismo CP)
        const firstResult = data[0];
        
        onChange({
          zipCode: code,
          state: firstResult.estado || firstResult.state || '',
          city: firstResult.municipio || firstResult.municipality || firstResult.ciudad || '',
          colony: firstResult.colonia || firstResult.settlement || firstResult.asentamiento || '',
        });
      } else if (data && data.estado) {
        // Si la respuesta es un objeto único
        onChange({
          zipCode: code,
          state: data.estado || data.state || '',
          city: data.municipio || data.municipality || data.ciudad || '',
          colony: data.colonia || data.settlement || data.asentamiento || '',
        });
      }
    } catch (err) {
      console.error('Error al buscar código postal:', err);
      // No mostrar error al usuario, simplemente no autocompletar
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(newValue);
    
    if (newValue.length === 5) {
      fetchPostalCodeData(newValue);
    }
  };

  return (
    <div className="w-full relative">
      <Input
        label={label}
        type="text"
        value={zipCode}
        onChange={handleZipCodeChange}
        placeholder="12345"
        error={error}
        required={required}
        maxLength={5}
        className={cn(
          isLoading && 'pr-10'
        )}
      />
      {isLoading && (
        <div className="absolute right-4 top-[2.75rem]">
          <svg
            className="animate-spin h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}

