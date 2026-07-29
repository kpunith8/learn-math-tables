'use client';

import { useAppContext } from '@/lib/contexts/AppContext';
import { formatElapsedTime } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardOverlay({ isOpen, onClose }: LeaderboardOverlayProps) {
  const { leaderboardData } = useAppContext();

  const data = leaderboardData();
  const sortedEntries = Object.entries(data)
    .map(([name, entry]) => ({ name, data: entry }))
    .sort((a, b) => {
      if (b.data.totalStars !== a.data.totalStars) return b.data.totalStars - a.data.totalStars;
      return a.data.totalTime - b.data.totalTime;
    });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[480px] p-7 md:p-6 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-[26px] text-text-primary text-center">
            🏆 Scoreboard
          </DialogTitle>
        </DialogHeader>

        {sortedEntries.length === 0 ? (
          <p className="text-center text-text-dim text-sm py-5">
            No scores yet! Complete tables to appear here.
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full border-collapse font-body">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">#</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Name</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Stars</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Tables</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-[#E5E5E5]">Time</th>
                </tr>
              </thead>
              <tbody>
              {sortedEntries.map((entry, index) => {
                const maxTables = entry.data.maxTables || 10;
                const maxStars = maxTables * 3;
                return (
                  <tr key={entry.name} className={`text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="py-2.5 px-1.5 text-text-secondary">{index + 1}</td>
                    <td className="py-2.5 px-1.5 text-text-primary font-medium">{entry.name}</td>
                    <td className="py-2.5 px-1.5 text-text-secondary">{entry.data.totalStars}/{maxStars}</td>
                    <td className="py-2.5 px-1.5 text-text-secondary">{entry.data.completedTables}/{maxTables}</td>
                    <td className="py-2.5 px-1.5 text-text-secondary">{formatElapsedTime(entry.data.totalTime)}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button onClick={onClose} variant="ghost" className="text-text-muted hover:text-text-primary">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}