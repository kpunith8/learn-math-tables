'use client';

import { memo } from 'react';
import { CHARACTERS } from '@/lib/constants';
import { generateStoryText } from '@/lib/utils';

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
  const character = CHARACTERS[currentTable] || { name: `Table of ${currentTable}`, emoji: '✨' };

  const btnClass = `border-none bg-[#0D9488] cursor-pointer text-white py-2 px-4 rounded-full flex items-center gap-1.5 font-display text-[13px]`;

  if (!activeCard) {
    return (
      <aside className="illustration-panel w-full md:w-[320px] shrink-0 flex flex-col items-center gap-3 md:sticky md:top-5">
        <div className="illustration-placeholder w-full max-w-[320px]">
          <div className="placeholder-emoji flex items-center justify-center h-[100px] md:h-[160px] bg-[#F5F5F5] rounded-[20px] text-[50px] md:text-[72px]">
            {character.emoji}
          </div>
        </div>
        <div className="equation-badge font-display text-[clamp(22px,5vw,30px)] text-[#C2410C] text-center py-2 px-10 bg-[#FAFAFA] rounded-full border-[2.5px] border-[#E2E8F0]">
          {currentTable} × ?
        </div>
        <p className="character-name font-display text-sm text-[#334155] text-center">
          {character.name}
        </p>
        <div className="story-placeholder hidden md:block text-sm leading-[1.75] text-[#555] bg-white rounded-[14px] p-[14px_16px] border-2 border-[#E5E5E5] shadow-[0_4px_12px_rgba(0,0,0,0.08)] w-full max-w-[460px]">
          👆 Tap any card above to reveal its illustration and story!
        </div>
      </aside>
    );
  }

  const groupCount = parseInt(activeCard.split('x')[1], 10);

  return (
    <aside className="illustration-panel w-full md:w-[320px] shrink-0 flex flex-col items-center gap-3 md:sticky md:top-5">
      <div className="equation-badge font-display text-[clamp(22px,5vw,30px)] text-[#C2410C] text-center py-2 px-10 bg-[#FAFAFA] rounded-full border-[2.5px] border-[#E2E8F0]">
        {currentTable} × {groupCount} = {currentTable * groupCount}
      </div>
      <p className="character-name font-display text-sm text-[#334155] text-center">
        {character.name}
      </p>
      <div className="audio-controls flex gap-2 items-center">
        <button
          onClick={() => {
            const story = generateStoryText(currentTable, groupCount);
            onToggleSpeak(story.replace(/<[^>]+>/g, ''));
          }}
          className={`listen-btn ${btnClass}`}
          aria-label={isSpeaking ? 'Stop reading aloud' : 'Read story aloud'}
        >
          <span className="btn-icon text-base">{isSpeaking ? '🔇' : '🔊'}</span>
          <span className="btn-label text-xs">{isSpeaking ? 'Stop' : 'Listen'}</span>
        </button>
      </div>
    </aside>
  );
}

export const IllustrationPanel = memo(IllustrationPanelInner);
