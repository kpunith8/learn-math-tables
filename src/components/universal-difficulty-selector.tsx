'use client';

import { useTranslation } from 'react-i18next';
import { Select } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { useDifficulty } from '@/lib/contexts/DifficultyContext';
import { DifficultyLevel } from '@/lib/operations/types';

interface UniversalDifficultySelectorProps {
  dark?: boolean;
  className?: string;
}

const LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard'];

export function UniversalDifficultySelector({ dark = false, className = '' }: UniversalDifficultySelectorProps) {
  const { t } = useTranslation();
  const { difficulty, setDifficulty } = useDifficulty();
  const items = LEVELS.map((level) => ({
    value: level,
    label: t(`common.difficulty.${level}.badge`),
  }));

  return (
    <Select.Root
      items={items}
      value={difficulty}
      onValueChange={(value) => {
        if (value) setDifficulty(value as DifficultyLevel);
      }}
    >
      <Select.Trigger
        type="button"
        aria-label={t('common.difficulty.label', 'Difficulty')}
        className={`press ${dark ? 'bg-ink text-paper border-ink-2' : 'press-quiet'} ${className}`}
      >
        <Select.Value className="whitespace-nowrap" />
        <Select.Icon className="flex items-center transition-transform duration-150 data-[popup-open]:rotate-180">
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" alignItemWithTrigger>
          <Select.Popup className="min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-2xl border-2 border-rule bg-card p-1.5 shadow-card animate-[popup-in_0.15s_ease-out]">
            <Select.List className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 font-display text-sm text-ink outline-none data-[highlighted]:bg-paper-2 data-[selected]:font-bold"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className="text-growth-ink">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
