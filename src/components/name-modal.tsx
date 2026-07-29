'use client';

import { useRef, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, initialName]);

  const handleSave = () => {
    onSave(name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent showCloseButton={false} className="max-w-[380px] text-center p-7 md:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-[24px] text-indigo">
            What&apos;s your name?
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Enter your name so we can track your scores!
          </DialogDescription>
        </DialogHeader>
        <div className="my-2">
          <label htmlFor="playerName" className="sr-only">Player name</label>
          <Input
            id="playerName"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name..."
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
            className="font-display text-base py-2.5 px-7 rounded-full bg-indigo text-white hover:bg-indigo-hover active:bg-indigo-active shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
          >
            Let&apos;s Go!
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="font-display text-base py-2.5 px-7 rounded-full"
          >
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}