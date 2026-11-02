'use client';

import { useState, useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation, Trans } from 'react-i18next';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import {
  Award,
  Castle,
  Check,
  ClipboardCheck,
  Compass,
  Crown,
  Divide,
  Flame,
  LogIn,
  LogOut,
  Minus,
  Mountain,
  Palmtree,
  Plus,
  Search,
  Sparkles,
  Star,
  User,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { NameModal } from '@/components/name-modal';
import { LanguageSelector } from '@/components/language-selector';
import { UniversalDifficultySelector } from '@/components/universal-difficulty-selector';

import { getStarsToNextMilestone, isOperationFullyCompleted } from '@/lib/engines/star-economy';

type World = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'tables';

const TRAIL: { id: World; Icon: LucideIcon; route: string; world: string }[] = [
  { id: 'addition', Icon: Palmtree, route: '/addition/play', world: 'var(--color-lagoon)' },
  { id: 'subtraction', Icon: Waves, route: '/subtraction/play', world: 'var(--color-valley)' },
  { id: 'multiplication', Icon: Mountain, route: '/multiplication/play', world: 'var(--color-periwinkle)' },
  { id: 'division', Icon: Castle, route: '/division/play', world: 'var(--color-castle)' },
  { id: 'tables', Icon: Crown, route: '/tables', world: 'var(--color-kingdom)' },
];

/* The achievement badges are stored with emoji glyphs; the landing renders
   them as drawn marks instead, one icon library for the whole page. */
const BADGE_ICONS: Record<string, LucideIcon> = {
  'addition-hero': Plus,
  'subtraction-ninja': Minus,
  'multiplication-master': X,
  'division-champion': Divide,
  'table-detective': Search,
  'pattern-hunter': Sparkles,
  'math-explorer': Compass,
  'first-quiz': ClipboardCheck,
  'perfect-score': Award,
  'streak-3': Flame,
  'streak-7': Zap,
  'star-collector-50': Star,
};

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient();
  const { state, setPlayerName } = useAppContext();
  const { engineState, isEngineLoaded, getNewBadges } = useEngineState();
  const [showNameModal, setShowNameModal] = useState(false);

  const openNameModal = () => {
    setShowNameModal(true);
  };

  const sessionName = user?.given_name || '';

  const mission = isEngineLoaded ? engineState.dailyMission : null;
  const starProgress = isEngineLoaded ? getStarsToNextMilestone(engineState.stars) : 0;
  const newBadges = useMemo(
    () => (isEngineLoaded ? getNewBadges() : []),
    [isEngineLoaded, getNewBadges]
  );
  const completedOps = useMemo(
    () =>
      new Set(
        TRAIL.flatMap((w) =>
          w.id !== 'tables' && isOperationFullyCompleted(engineState.milestoneStars, w.id) ? [w.id] : []
        )
      ),
    [engineState.milestoneStars]
  );

  const milestoneTarget = Number.isFinite(starProgress) ? engineState.stars + starProgress : null;
  const milestonePct =
    milestoneTarget && milestoneTarget > 0 ? Math.min(100, Math.round((engineState.stars / milestoneTarget) * 100)) : 100;

  return (
    <div className="paper-page font-body flex min-h-screen flex-col">
      <header className="site-nav">
        <div className="shell nav-row">
          <span className="wordmark">
            <span className="wordmark-mark" aria-hidden="true">
              <Compass className="h-[22px] w-[22px]" strokeWidth={2.5} />
            </span>
            {t('home.header.title')}
          </span>

          <div className="nav-selects">
            <UniversalDifficultySelector />
            <LanguageSelector />
          </div>
          <div className="nav-account">
            {isAuthenticated ? (
              <>
                <span className="session-chip" title={sessionName}>
                  {sessionName}
                </span>
                <LogoutLink className="press press-primary">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="nav-label">{t('common.auth.signOut')}</span>
                </LogoutLink>
              </>
            ) : (
              <>
                <button type="button" onClick={openNameModal} className="press press-primary">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="nav-name nav-label" title={state.playerName}>
                    {state.playerName || t('common.nav.addNameShort')}
                  </span>
                </button>
                {!isLoading && (
                  <LoginLink className="press press-quiet">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    <span className="nav-label">{t('common.auth.signIn')}</span>
                  </LoginLink>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — the trail is the action, set large beside a short head */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="shell fold-grid">
            <div className="welcome-copy">
              <div className="welcome-head">
                <h1 id="hero-title" className="welcome-title">
                  {t('home.hero.welcome')}
                </h1>
                <p className="welcome-lead">
                  <Trans i18nKey="home.hero.subtitle" components={[<span key="stars" className="mark" />]} />
                </p>
              </div>
              {isEngineLoaded && milestoneTarget !== null && (
                <div className="star-meter">
                  <span className="star-meter-figure">
                    <Star className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                    {starProgress}
                  </span>
                  <span className="star-meter-note">{t('home.hero.starsToNextMilestone')}</span>
                  <span className="meter-track" aria-hidden="true">
                    <span className="meter-fill" style={{ width: `${milestonePct}%` }} />
                  </span>
                </div>
              )}
            </div>

            <div className="trail-col">
              <div className="trail-head">
                <h2 id="trail-title" className="trail-title">
                  {t('home.trail.sectionTitle')}
                </h2>
                <p className="trail-line">{t('home.trail.sectionSubtitle')}</p>
              </div>

              <div className="trail-grid" aria-labelledby="trail-title">
                {TRAIL.map((world) => {
                  const completed = world.id !== 'tables' && completedOps.has(world.id);
                  const Icon = world.Icon;
                  return (
                    <button
                      key={world.id}
                      type="button"
                      onClick={() => router.push(world.route)}
                      className="trail-card"
                      style={{ '--world': world.world } as CSSProperties}
                    >
                      <span className="trail-heading">
                        <span className="trail-mark" aria-hidden="true">
                          <Icon className="h-[26px] w-[26px]" strokeWidth={2.25} />
                        </span>
                        <span className="trail-name">{t(`home.trail.worlds.${world.id}.name`)}</span>
                      </span>
                      <span className="trail-tag">{t(`home.trail.worlds.${world.id}.tagline`)}</span>
                      <span className="trail-go">{t('common.buttons.explore')}</span>
                      {completed && <span className="trail-stamp">{t('home.trail.done')}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {isEngineLoaded && mission && (
          <section className="mission-band">
            <div className="shell">
              <article className="postcard">
                <div className="postcard-head">
                  <h2 className="postcard-title">{t('home.mission.todaysMission')}</h2>
                  {mission.completed ? (
                    <span className="postcard-status">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      {t('home.mission.complete')}
                    </span>
                  ) : (
                    <span className="postcard-status postcard-status-reward">
                      <Star className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      {t('home.mission.reward')}
                    </span>
                  )}
                </div>

                <div className="postcard-body">
                  <ul className="mission-list">
                    {mission.tasks.map((task, i) => (
                      <li key={i} className="mission-task" data-done={task.completed || undefined}>
                        <span className="mission-mark" aria-hidden="true">
                          {task.completed ? (
                            <Check className="h-4 w-4" strokeWidth={3} />
                          ) : (
                            <Star className="h-4 w-4" strokeWidth={2} />
                          )}
                        </span>
                        <span className="mission-text">
                          {task.descriptionKey ? t(task.descriptionKey) : task.description}
                        </span>
                        {!task.completed && task.target > 1 && (
                          <span className="mission-count">
                            {task.progress}/{task.target}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="postcard-stamp">
                    <span className="postmark" aria-hidden="true">
                      <Compass className="h-10 w-10" strokeWidth={2} />
                    </span>
                    <span className="postcard-from">{t('home.mission.postcardFrom')}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}

        {isEngineLoaded && (
          <section className="figures-band">
            <div className="shell">
              <dl className="figures-row">
                <div className="figure-cell">
                  <dt className="figure-label">
                    <Star className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
                    {t('home.stats.stars')}
                  </dt>
                  <dd className="figure-value">{engineState.stars}</dd>
                </div>
                <div className="figure-cell">
                  <dt className="figure-label">
                    <Award className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
                    {t('home.stats.badges')}
                  </dt>
                  <dd className="figure-value">{newBadges.length}</dd>
                </div>
                <div className="figure-cell">
                  <dt className="figure-label">
                    <Flame className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
                    {t('home.stats.dayStreak')}
                  </dt>
                  <dd className="figure-value">{engineState.streak}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {isEngineLoaded && (
          <section className="stamps-band" aria-labelledby="stamps-title">
            <div className="shell">
              <h2 id="stamps-title" className="stamps-title">
                {t('home.badges.sectionTitle')}
              </h2>
              {engineState.achievements.length > 0 ? (
                <>
                  <ul className="stamps-row">
                    {engineState.achievements.map((badge) => {
                      const earned = badge.unlockedAt !== null;
                      const Icon = BADGE_ICONS[badge.id] ?? Award;
                      return (
                        <li
                          key={badge.id}
                          className="stamp"
                          data-earned={earned || undefined}
                          title={t(`achievements.${badge.id}.description`)}
                        >
                          <span className="stamp-ring" aria-hidden="true">
                            <Icon className="h-4 w-4" strokeWidth={2.5} />
                          </span>
                          <span>{t(`achievements.${badge.id}.label`)}</span>
                          <span className="sr-only">{earned ? t('home.badges.earned') : t('home.badges.locked')}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="stamps-count">
                    {t('home.badges.count', { earned: newBadges.length, total: engineState.achievements.length })}
                  </p>
                </>
              ) : (
                <div className="stamps-empty">
                  <Award className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
                  <p>{t('home.badges.empty')}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="site-foot">
        <div className="shell foot-grid">
          <p className="foot-close">{t('home.footer.closing')}</p>
          <p className="foot-sign">{t('home.footer.signOff')}</p>
          <nav className="foot-links" aria-label={t('home.trail.sectionTitle')}>
            <Link className="foot-link" href="/addition/play">
              {t('operations.meta.addition.name')}
            </Link>
            <Link className="foot-link" href="/subtraction/play">
              {t('operations.meta.subtraction.name')}
            </Link>
            <Link className="foot-link" href="/multiplication/play">
              {t('operations.meta.multiplication.name')}
            </Link>
            <Link className="foot-link" href="/division/play">
              {t('operations.meta.division.name')}
            </Link>
            <Link className="foot-link" href="/tables">
              {t('header.title')}
            </Link>
          </nav>
          <p className="foot-note">{t('home.footer.madeFor')}</p>
        </div>
      </footer>

      <NameModal
        isOpen={showNameModal}
        initialName={state.playerName}
        onSave={(name) => {
          setPlayerName(name);
          setShowNameModal(false);
        }}
        onCancel={() => setShowNameModal(false)}
      />
    </div>
  );
}
