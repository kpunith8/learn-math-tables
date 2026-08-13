'use client';

import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NameModalProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function NameModal({ isOpen, initialName, onSave, onCancel }: NameModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      const initTimer = setTimeout(() => setName(initialName), 0);
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => {
        clearTimeout(initTimer);
        clearTimeout(focusTimer);
      };
    }
  }, [isOpen, initialName]);

  const handleSave = async () => {
    if (submitting) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const widget = document.querySelector<HTMLElement>('[data-turnstile-name]');
    const widgetId = widget?.getAttribute('data-turnstile-widget-id') ?? '';
    const token = window.turnstile?.getResponse(widgetId);

    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, 'cf-turnstile-response': token }),
      });
      if (!res.ok) {
        window.turnstile?.reset(widgetId);
        return;
      }
      onSave(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent showCloseButton={false} className="max-w-[380px] text-center p-7 md:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-[24px] text-ink">
            {t('modals.nameModal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            {t('modals.nameModal.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="my-2">
          <label htmlFor="playerName" className="sr-only">{t('modals.nameModal.title')}</label>
          <Input
            id="playerName"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('modals.nameModal.placeholder')}
            maxLength={20}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            className="font-display text-lg text-center h-11"
          />
        </div>
        <DialogFooter className="flex-row justify-center gap-3 border-none bg-transparent p-0 -mb-2">
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="font-display text-base py-2.5 px-7 rounded-full bg-coral text-white hover:bg-coral-hover active:bg-coral-active shadow-[0_4px_12px_rgba(255,107,82,0.35)]"
          >
            {t('modals.nameModal.save')}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="font-display text-base py-2.5 px-7 rounded-full"
          >
            {t('modals.nameModal.skip')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}