'use client';

import { useState } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PhoneInput({ value, onChange, placeholder = 'e.g., 08012345678', disabled }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    onChange(input);
  };

  const displayValue = value.startsWith('234') ? value.slice(3) : value;

  return (
    <div className="relative">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
        <div className="px-3 py-2 bg-gray-50 border-r border-gray-300 text-gray-700 font-medium">
          +234
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2 outline-none disabled:bg-gray-100 disabled:text-gray-500"
          maxLength={10}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Enter your Nigerian phone number without the country code
      </p>
    </div>
  );
}

