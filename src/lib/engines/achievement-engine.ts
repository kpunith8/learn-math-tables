import { Achievement, ALL_ACHIEVEMENTS, BadgeId } from './types';

export function checkAchievement(
  achievements: Achievement[],
  badgeId: BadgeId
): Achievement | null {
  const existing = achievements.find((a) => a.id === badgeId);
  if (existing?.unlockedAt) return null;

  const match = ALL_ACHIEVEMENTS.find((a) => a.id === badgeId);
  if (!match) return null;

  return {
    ...match,
    unlockedAt: Date.now(),
  };
}

export function unlockAchievement(
  achievements: Achievement[],
  badgeId: BadgeId
): Achievement[] {
  const unlocked = checkAchievement(achievements, badgeId);
  if (!unlocked) return achievements;
  return achievements.map((a) => (a.id === badgeId ? unlocked : a));
}

export function getUnlockedBadges(achievements: Achievement[]): Achievement[] {
  return achievements.filter((a) => a.unlockedAt !== null);
}

export function getRecentUnlocks(achievements: Achievement[], count = 3): Achievement[] {
  return getUnlockedBadges(achievements)
    .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
    .slice(0, count);
}

export function getNextAchievement(achievements: Achievement[]): Achievement | null {
  return achievements.find((a) => a.unlockedAt === null) ?? null;
}
