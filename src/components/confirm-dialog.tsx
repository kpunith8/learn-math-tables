'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay fixed inset-0 z-[1300] bg-black/50 flex items-center justify-center p-5 opacity-100 pointer-events-auto transition-opacity duration-300">
      <div className="confirm-dialog bg-white rounded-[20px] p-7 md:p-6 max-w-[380px] w-full text-center shadow-[0_12px_40px_rgba(0,0,0,0.2)] animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="confirm-title font-display text-[22px] text-[#4F46E5] mb-2">
          {title}
        </div>
        <p className="confirm-message text-[15px] text-[#555] leading-relaxed mb-5">
          {message}
        </p>
        <div className="confirm-actions flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="confirm-yes font-display text-base py-2.5 px-7 rounded-full border-none bg-[#4F46E5] text-white cursor-pointer transition-all duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
          >
            Yes, sure!
          </button>
          <button
            onClick={onCancel}
            className="confirm-no font-display text-base py-2.5 px-7 rounded-full border-none bg-[#E5E5E5] text-[#555] cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
          >
            No, go back
          </button>
        </div>
      </div>
    </div>
  );
}
