'use client';

import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center p-5 opacity-100 pointer-events-auto transition-opacity duration-300">
      <div className="confirm-dialog bg-card rounded-[20px] p-7 md:p-6 max-w-[380px] w-full text-center shadow-[0_12px_40px_rgba(0,0,0,0.2)] animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="confirm-title font-display text-[22px] text-coral mb-2">
          {title}
        </div>
        <p className="confirm-message text-[15px] text-text-secondary leading-relaxed mb-5">
          {message}
        </p>
        <div className="confirm-actions flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="confirm-yes font-display text-sm py-2 px-5 rounded-full border-none bg-coral text-white cursor-pointer transition-all duration-150 shadow-[0_4px_12px_rgba(255,107,82,0.3)] hover:scale-105 hover:bg-coral-hover active:scale-95"
          >
            {t('common.buttons.yesSure')}
          </button>
          <button
            onClick={onCancel}
            className="confirm-no font-display text-sm py-2 px-5 rounded-full border-none bg-mist text-text-secondary cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
          >
            {t('common.buttons.noGoBack')}
          </button>
        </div>
      </div>
    </div>
  );
}
