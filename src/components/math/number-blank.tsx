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

  const toggleNegative = useCallback(() => {
    if (disabled) return;
    if (value.startsWith('-')) {
      onChange(value.slice(1));
    } else {
      onChange('-' + value);
    }
  }, [value, onChange, disabled]);

  return (
    <div className="number-blank-container inline-flex items-center justify-center gap-1.5">
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
        className="number-blank-input w-[clamp(70px,25vw,100px)] text-center font-display text-[clamp(20px,4vw,24px)] text-orange bg-warm-bg border-2 border-warm-border rounded-xl py-1.5 px-2 outline-none focus:border-indigo-light focus:bg-white transition-colors duration-150 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={toggleNegative}
        disabled={disabled}
        type="button"
        aria-label="Toggle negative number"
        className="font-display text-base text-indigo bg-indigo/10 border-2 border-indigo/20 rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-indigo/20 active:bg-indigo/30 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        +/−
      </button>
    </div>
  );
}
