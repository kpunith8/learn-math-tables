'use client';

import { useCallback } from 'react';

interface NumberBlankProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NumberBlank({ value, onChange, onSubmit, disabled, placeholder }: NumberBlankProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9-]/g, '');
      onChange(raw);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <div className="number-blank-container inline-flex items-center justify-center">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || '?'}
        inputMode="numeric"
        autoComplete="off"
        aria-label="Answer"
        className="number-blank-input w-[clamp(90px,35vw,140px)] text-center font-display text-[clamp(24px,5vw,32px)] text-orange bg-warm-bg border-2 border-warm-border rounded-xl py-2.5 px-3 outline-none focus:border-indigo-light focus:bg-white transition-colors duration-150 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}
