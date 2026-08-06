'use client';

import { useTranslation } from 'react-i18next';
import { Select } from '@base-ui/react/select';
import { SUPPORTED_LANGUAGES } from '@/i18n/client';

interface LanguageSelectorProps {
  dark?: boolean;
  className?: string;
}

const items = SUPPORTED_LANGUAGES.map((lang) => ({ value: lang.code, label: lang.native }));

export function LanguageSelector({ dark = false, className = '' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const current = i18n.language.split('-')[0];

  return (
    <Select.Root
      items={items}
      value={current}
      onValueChange={(value) => {
        if (value) i18n.changeLanguage(value);
      }}
    >
      <Select.Trigger
        type="button"
        aria-label={t('common.nav.language', 'Language')}
        className={`inline-flex items-center gap-1.5 font-display text-xs font-bold rounded-full cursor-pointer select-none min-h-[44px] px-3 py-1.5 border-2 transition-colors ${className} ${
          dark
            ? 'bg-white/15 text-white border-white/25 hover:bg-white/25'
            : 'bg-white/80 text-ink border-[#DED5F0] hover:bg-white'
        }`}
      >
        <span aria-hidden="true">🌐</span>
        <Select.Value className="whitespace-nowrap" />
        <Select.Icon className="flex items-center" aria-hidden="true">
          <span
            className={`transform transition-transform duration-150 data-[popup-open]:rotate-180 ${
              dark ? 'text-white/70' : 'text-ink/50'
            }`}
          >
            ▾
          </span>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" alignItemWithTrigger>
          <Select.Popup className="min-w-[var(--anchor-width)] rounded-2xl bg-white border-2 border-[#E4DDCB] shadow-[0_12px_32px_rgba(27,20,71,0.18)] p-1.5 origin-[var(--transform-origin)] animate-[popup-in_0.15s_ease-out]">
            <Select.List className="flex flex-col gap-0.5">
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 font-display text-sm text-ink cursor-pointer outline-none data-[highlighted]:bg-[#F3EFFB] data-[selected]:font-bold"
                >
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator className="text-coral">
                    <span aria-hidden="true">✓</span>
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