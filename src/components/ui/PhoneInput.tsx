"use client";

import PhoneInputWithCountry from "react-phone-number-input";
import type { E164Number } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export interface PhoneInputProps {
  value?: E164Number;
  onChange?: (value: E164Number | undefined) => void;
  placeholder?: string;
  defaultCountry?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "866 123 4567",
  defaultCountry = "MX",
  className = "",
}: PhoneInputProps) {
  return (
    <PhoneInputWithCountry
      international
      defaultCountry={defaultCountry as any}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      numberInputProps={{
        className:
          "flex-1 h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#55c5c4] focus:border-transparent",
      }}
      countrySelectProps={{
        className:
          "px-2 h-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#55c5c4] cursor-pointer",
      }}
      style={
        {
          "--PhoneInputCountryFlag-height": "1.25rem",
          "--PhoneInputCountryFlag-width": "1.75rem",
        } as React.CSSProperties
      }
    />
  );
}
