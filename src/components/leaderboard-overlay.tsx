'use client';

import { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/lib/contexts/AppContext';
import { formatElapsedTime } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function LeaderboardOverlayInner({ isOpen, onClose }: LeaderboardOverlayProps) {
  const { leaderboardData } = useAppContext();
  const { t } = useTranslation();

  const sortedEntries = useMemo(() => {
    if (!isOpen) return [];
    const data = leaderboardData();
    return Object.entries(data)
      .map(([name, entry]) => ({ name, data: entry }))
      .sort((a, b) => {
        if (b.data.totalStars !== a.data.totalStars) return b.data.totalStars - a.data.totalStars;
        return a.data.totalTime - b.data.totalTime;
      });
  }, [isOpen, leaderboardData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-[480px] p-7 md:p-6 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-[26px] text-text-primary text-center">
            {t('modals.leaderboard.title')}
          </DialogTitle>
        </DialogHeader>

        {sortedEntries.length === 0 ? (
          <p className="text-center text-text-dim text-sm py-5">
            {t('modals.leaderboard.empty')}
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full border-collapse font-body">
              <thead className="sticky top-0 bg-card z-10">
                <tr>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-mist">{t('modals.leaderboard.columns.rank')}</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-mist">{t('modals.leaderboard.columns.name')}</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-mist">{t('modals.leaderboard.columns.stars')}</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-mist">{t('modals.leaderboard.columns.tables')}</th>
                  <th className="font-display text-xs text-text-dim py-2 px-1.5 text-left border-b-2 border-mist">{t('modals.leaderboard.columns.time')}</th>
                </tr>
              </thead>
              <tbody>
              {sortedEntries.map((entry, index) => {
                const maxTables = entry.data.maxTables || 10;
                const maxStars = maxTables * 3;
                return (
                  <tr key={entry.name} className={`text-xs ${index % 2 === 0 ? 'bg-card' : 'bg-paper'}`}>
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
            {t('modals.leaderboard.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const LeaderboardOverlay = memo(LeaderboardOverlayInner);