'use client';

import { forwardRef } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import { cn } from '@/lib/utils';
import 'react-phone-number-input/style.css';

export interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  defaultCountry?: string;
  placeholder?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, label, error, required, defaultCountry = 'MX', placeholder }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-primary ml-1">*</span>}
          </label>
        )}
        <div className="flex gap-2">
          <PhoneInputWithCountry
            international
            defaultCountry={defaultCountry as any}
            value={value}
            onChange={(val) => onChange(val || '')}
            placeholder={placeholder || '123 456 7890'}
            numberInputProps={{
              ref: ref as any,
              className: cn(
                'flex-1 px-4 py-3 rounded-lg bg-surface border border-border',
                'text-foreground placeholder:text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'transition-all duration-200',
                error && 'border-error focus:ring-error'
              ),
            }}
            countrySelectProps={{
              className: cn(
                'px-3 py-3 rounded-lg bg-surface border border-border',
                'text-foreground focus:outline-none focus:ring-2 focus:ring-primary',
                'transition-all duration-200',
                'hover:border-primary cursor-pointer flex items-center gap-2',
                error && 'border-error'
              ),
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              },
            }}
            className="PhoneInput"
            style={{
              '--PhoneInputCountryFlag-height': '1.5rem',
              '--PhoneInputCountryFlag-width': '1.5rem',
            } as React.CSSProperties}
          />
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
