'use client';

import { useRef, useEffect } from 'react';

interface NameModalProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function NameModal({ isOpen, initialName, onSave, onCancel }: NameModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(inputRef.current?.value || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="name-modal-overlay fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-5 opacity-100 pointer-events-auto transition-opacity duration-300">
      <div className="name-modal-dialog bg-white rounded-[20px] p-7 md:p-6 max-w-[380px] w-full text-center shadow-[0_12px_40px_rgba(0,0,0,0.2)] animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="name-modal-title font-display text-[24px] text-[#4F46E5] mb-1.5">
          What&apos;s your name?
        </div>
        <p className="name-modal-hint text-sm text-[#888] mb-4">
          Enter your name so we can track your scores!
        </p>
        <input
          ref={inputRef}
          type="text"
          defaultValue={initialName}
          onKeyDown={handleKeyDown}
          placeholder="Type your name..."
          maxLength={20}
          autoComplete="off"
          className="name-modal-input w-full font-display text-lg py-3 px-4 rounded-xl border-[2.5px] border-[#E5E5E5] bg-[#FAFAFA] text-[#555] text-center outline-none transition-[border-color] duration-150 focus:border-[#4F46E5]"
        />
        <div className="name-modal-actions flex gap-3 justify-center mt-4">
          <button
            onClick={handleSave}
            className="name-modal-save font-display text-base py-2.5 px-7 rounded-full border-none bg-[#4F46E5] text-white cursor-pointer shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all duration-150 hover:scale-105 active:scale-95"
          >
            Let&apos;s Go!
          </button>
          <button
            onClick={onCancel}
            className="name-modal-skip font-display text-base py-2.5 px-7 rounded-full border-none bg-[#E5E5E5] text-[#555] cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
