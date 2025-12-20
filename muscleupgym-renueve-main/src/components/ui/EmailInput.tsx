'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Input, InputProps } from './Input';
import { cn } from '@/lib/utils';

const COMMON_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'live.com.mx',
  'yahoo.com.mx'
];

export interface EmailInputProps extends InputProps {
  onValueChange?: (value: string) => void;
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, onChange, onValueChange, ...props }, ref) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const internalInputRef = useRef<HTMLInputElement | null>(null);

    // Combinar refs
    const setRefs = (element: HTMLInputElement | null) => {
      internalInputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as any).current = element;
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const atIndex = value.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const domainPart = value.slice(atIndex + 1);
        const filtered = COMMON_DOMAINS.filter(domain => 
          domain.startsWith(domainPart) && domain !== domainPart
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }

      if (onChange) {
        onChange(e);
      }
      if (onValueChange) {
        onValueChange(value);
      }
    };

    const handleSelectDomain = (domain: string) => {
      if (internalInputRef.current) {
        const value = internalInputRef.current.value;
        const atIndex = value.lastIndexOf('@');
        const newValue = value.slice(0, atIndex + 1) + domain;
        
        // Crear un evento sintético para notificar el cambio a react-hook-form
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(internalInputRef.current, newValue);
        
        const event = new Event('input', { bubbles: true });
        internalInputRef.current.dispatchEvent(event);
        
        setShowSuggestions(false);
        internalInputRef.current.focus();
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        <Input
          {...props}
          ref={setRefs}
          type="email"
          onChange={handleChange}
          autoComplete="email"
          className={className}
        />
        
        {showSuggestions && (
          <ul className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto py-1 text-sm">
            {suggestions.map((domain) => (
              <li
                key={domain}
                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-foreground transition-colors"
                onClick={() => handleSelectDomain(domain)}
              >
                <span className="text-muted">
                  {internalInputRef.current?.value.split('@')[0]}@
                </span>
                <span className="font-medium text-primary">{domain}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

EmailInput.displayName = 'EmailInput';

export { EmailInput };
