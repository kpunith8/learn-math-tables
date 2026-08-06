'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CHARACTERS } from '@/lib/constants';

interface IllustrationPanelProps {
  currentTable: number;
  activeCard: string | null;
  onToggleSpeak: (text: string) => void;
  isSpeaking: boolean;
}

function IllustrationPanelInner({
  currentTable,
  activeCard,
  onToggleSpeak,
  isSpeaking,
}: IllustrationPanelProps) {
  const { t } = useTranslation();
  const character = CHARACTERS[currentTable] || { name: `Table of ${currentTable}`, emoji: '✨' };
  const characterName = CHARACTERS[currentTable]?.name ?? t('tables.illustrationPanel.fallbackCharacterName', { table: currentTable });

  const btnClass = `border-none bg-coral cursor-pointer text-white py-2 px-4 rounded-full flex items-center gap-1.5 font-display text-[13px] hover:bg-coral-hover active:bg-coral-active`;

  if (!activeCard) {
    return (
      <aside className="illustration-panel w-full md:w-[320px] shrink-0 flex flex-col items-center gap-3 md:sticky md:top-5">
        <div className="illustration-placeholder w-full max-w-[320px]">
          <div className="placeholder-emoji flex items-center justify-center h-[100px] md:h-[160px] bg-mist/40 rounded-[20px] text-[50px] md:text-[72px]">
            {character.emoji}
          </div>
        </div>
        <div className="equation-badge font-display text-[clamp(22px,5vw,30px)] text-castle text-center py-2 px-10 bg-card rounded-full border-[2.5px] border-mist">
          {t('tables.illustrationPanel.equationPlaceholder', { table: currentTable })}
        </div>
        <p className="character-name font-display text-sm text-ink text-center">
          {characterName}
        </p>
        <div className="story-placeholder hidden md:block text-sm leading-[1.75] text-text-secondary bg-card rounded-[14px] p-[14px_16px] border-2 border-mist shadow-[0_4px_12px_rgba(0,0,0,0.08)] w-full max-w-[460px]">
          {t('tables.illustrationPanel.placeholderStory', '👆 Tap any card above to reveal its illustration and story!')}
        </div>
      </aside>
    );
  }

  const groupCount = parseInt(activeCard.split('x')[1], 10);

  return (
    <aside className="illustration-panel w-full md:w-[320px] shrink-0 flex flex-col items-center gap-3 md:sticky md:top-5">
      <div className="equation-badge font-display text-[clamp(22px,5vw,30px)] text-castle text-center py-2 px-10 bg-card rounded-full border-[2.5px] border-mist">
        {t('tables.illustrationPanel.equationSolved', { table: currentTable, group: groupCount, answer: currentTable * groupCount })}
      </div>
      <p className="character-name font-display text-sm text-ink text-center">
        {characterName}
      </p>
      <div className="audio-controls flex gap-2 items-center">
        <button
          onClick={() => onToggleSpeak(t('tables.factCard.ariaRevealed', { table: currentTable, group: groupCount, answer: currentTable * groupCount }))}
          className={`listen-btn ${btnClass}`}
          aria-label={isSpeaking ? t('tables.illustrationPanel.ariaStop', 'Stop reading aloud') : t('tables.illustrationPanel.ariaListen', 'Read equation aloud')}
        >
          <span className="btn-icon text-base">{isSpeaking ? '🔇' : '🔊'}</span>
          <span className="btn-label text-xs">{isSpeaking ? t('tables.illustrationPanel.stop', 'Stop') : t('tables.illustrationPanel.listen', 'Listen')}</span>
        </button>
      </div>
    </aside>
  );
}

export const IllustrationPanel = memo(IllustrationPanelInner);
