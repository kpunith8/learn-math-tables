'use client';

import { useAppContext } from '@/lib/contexts/AppContext';
import { formatElapsedTime } from '@/lib/utils';

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardOverlay({ isOpen, onClose }: LeaderboardOverlayProps) {
  const { state, leaderboardData } = useAppContext();

  if (!isOpen) return null;

  const data = leaderboardData();
  const sortedEntries = Object.entries(data)
    .map(([name, entry]) => ({ name, data: entry }))
    .sort((a, b) => {
      if (b.data.totalStars !== a.data.totalStars) return b.data.totalStars - a.data.totalStars;
      return a.data.totalTime - b.data.totalTime;
    });

  return (
    <div className="leaderboard-overlay fixed inset-0 z-[1200] bg-black/50 flex items-center justify-center p-5 opacity-100 pointer-events-auto transition-opacity duration-300">
      <div className="leaderboard-dialog bg-white rounded-3xl p-7 md:p-6 max-w-[480px] w-full max-h-[80vh] shadow-[0_12px_40px_rgba(0,0,0,0.2)] animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="leaderboard-title font-display text-[26px] text-[#333] text-center mb-4">
          🏆 Scoreboard
        </div>
        {sortedEntries.length === 0 ? (
          <p className="leaderboard-empty text-center text-[#aaa] text-sm py-5">
            No scores yet! Complete tables to appear here.
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
            <table className="leaderboard-table w-full border-collapse font-body">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="font-display text-xs text-[#aaa] py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">#</th>
                  <th className="font-display text-xs text-[#aaa] py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Name</th>
                  <th className="font-display text-xs text-[#aaa] py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Stars</th>
                  <th className="font-display text-xs text-[#aaa] py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Tables</th>
                  <th className="font-display text-xs text-[#aaa] py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Time</th>
                </tr>
              </thead>
              <tbody>
              {sortedEntries.map((entry, index) => {
                const maxTables = entry.data.maxTables || 10;
                const maxStars = maxTables * 3;
                return (
                <tr
                  key={entry.name}
                  className={`leaderboard-row ${entry.name === state.playerName ? 'current-player bg-[#EEF2FF] text-[#4F46E5] font-bold' : ''}`}
                >
                  <td className="text-sm py-2.5 px-1.5 text-[#555] border-b border-[#E5E5E5]">{index + 1}</td>
                  <td className="text-sm py-2.5 px-1.5 text-[#555] border-b border-[#E5E5E5]">{entry.name}</td>
                  <td className="text-sm py-2.5 px-1.5 text-[#555] border-b border-[#E5E5E5]">⭐ {entry.data.totalStars}/{maxStars}</td>
                  <td className="text-sm py-2.5 px-1.5 text-[#555] border-b border-[#E5E5E5]">{entry.data.completedTables}/{maxTables}</td>
                  <td className="text-sm py-2.5 px-1.5 text-[#555] border-b border-[#E5E5E5]">{formatElapsedTime(entry.data.totalTime)}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
        <button
          onClick={onClose}
          className="leaderboard-close block mx-auto mt-4 font-display text-sm py-2 px-5 rounded-full border-none bg-[#B91C1C] text-white cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}
