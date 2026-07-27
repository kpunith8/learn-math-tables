'use client';

import { useEffect } from 'react';

interface CertificateOverlayProps {
  isOpen: boolean;
  tableStarRatings: Record<number, number>;
  quizResults: Record<number, { correct: number; total: number }>;
  onPlayAgain: () => void;
  onPlaySound: (type: string) => void;
}

export function CertificateOverlay({
  isOpen,
  tableStarRatings,
  quizResults,
  onPlayAgain,
  onPlaySound,
}: CertificateOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      onPlaySound('certificate');
    }
  }, [isOpen, onPlaySound]);

  if (!isOpen) return null;

  let totalStars = 0;
  const tableEntries = Array.from({ length: 10 }, (_, i) => i + 1).map((tableIndex) => {
    const starCount = tableStarRatings[tableIndex] || 1;
    totalStars += starCount;
    const quizResult = quizResults[tableIndex];
    return { tableIndex, starCount, quizResult };
  });

  let grade = '';
  if (totalStars >= 27) grade = 'A';
  else if (totalStars >= 22) grade = 'B';
  else if (totalStars >= 17) grade = 'C';
  else if (totalStars >= 10) grade = 'D';
  else grade = 'E';

  return (
    <div className="certificate-overlay fixed inset-0 z-[1200] bg-gradient-to-br from-[#F8F8F8] to-[#EDEDED] flex items-center justify-center p-6 opacity-100 pointer-events-auto transition-opacity duration-400">
      <div className="certificate-card bg-white border-4 border-[#FFD700] rounded-[24px] p-8 md:p-7 max-w-[480px] w-full text-center shadow-[0_16px_48px_rgba(0,0,0,0.12)] animate-[pop-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="certificate-title font-display text-[clamp(28px,7vw,38px)] text-[#FFD700] [text-shadow:1px_1px_0_rgba(0,0,0,0.2)]">
          🏆 Multiplication Master!
        </div>
        <div className="certificate-subtitle font-body text-base text-[#888] mt-1.5 mb-4">
          You completed all 10 times tables!
        </div>
        <div className="certificate-grid grid grid-cols-5 gap-1.5 my-3">
          {tableEntries.map(({ tableIndex, starCount, quizResult }) => (
            <div
              key={tableIndex}
              className="certificate-table-entry font-display text-xs bg-[#FAFAFA] rounded-lg py-1.5 px-1 border-[1.5px] border-[#E5E5E5]"
            >
              <span className="block text-sm text-[#C2410C]">Table {tableIndex}</span>
              <span className="text-[10px] tracking-wider">{'⭐'.repeat(starCount)}</span>
              {quizResult && (
                <span className="block text-[10px] text-[#999] mt-0.5">
                  Quiz {quizResult.correct}/{quizResult.total}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="certificate-total font-display text-lg text-[#C2410C] my-2">
          Total: {totalStars}/30 — Grade <strong className="text-xl">{grade}</strong>
        </p>
        <p className="certificate-note text-sm text-[#aaa] mt-2">Each star shows how fast you finished</p>
        <button
          onClick={onPlayAgain}
          className="certificate-play-again font-display text-lg py-3.5 px-10 rounded-full border-none bg-[#4F46E5] text-white cursor-pointer mt-4 transition-all duration-150 shadow-[0_4px_16px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
