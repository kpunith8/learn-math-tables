'use client';

import { useEffect, useCallback, useState, useRef, useMemo, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useAudio } from '@/lib/hooks/useAudio';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { calculateStarRating, getMaxAllowedTable, calculateLeaderboardStats, speakStoryText, cancelSpeech, generateQuizQuestions, toQuizQuestions } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';
import { ProgressBar } from '@/components/progress-bar';
import { FactCard } from '@/components/fact-card';
import { IllustrationPanel } from '@/components/illustration-panel';

const QuizOverlay = dynamic(() => import('@/components/quiz-overlay').then((m) => m.QuizOverlay), { ssr: false });
const CelebrationOverlay = dynamic(() => import('@/components/celebration-overlay').then((m) => m.CelebrationOverlay), { ssr: false });
const CertificateOverlay = dynamic(() => import('@/components/certificate-overlay').then((m) => m.CertificateOverlay), { ssr: false });
const LeaderboardOverlay = dynamic(() => import('@/components/leaderboard-overlay').then((m) => m.LeaderboardOverlay), { ssr: false });
const ConfirmDialog = dynamic(() => import('@/components/confirm-dialog').then((m) => m.ConfirmDialog), { ssr: false });
const PatternDiscovery = dynamic(() => import('@/components/pattern-discovery').then((m) => m.PatternDiscovery), { ssr: false });
const RetrievalPractice = dynamic(() => import('@/components/retrieval-practice').then((m) => m.RetrievalPractice), { ssr: false });

export default function TablesPage() {
  const {
    state,
    isLoaded,
    switchToTable,
    saveCurrentTableState,
    setDifficulty,
    togglePracticeMode,
    resetProgress,
    playAgain,
    revealCard,
    clearActiveCard,
    completeTable,
    saveQuizResult,
    saveLeaderboardEntry,
  } = useAppContext();

  const { playSound, playConfettiSound, stopSong, isMuted, toggleMute } = useAudio();
  const engine = useEngineState();
  const router = useRouter();

  // UI state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ elapsed: number; stars: number }>({ elapsed: 0, stars: 0 });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTableNumber, setQuizTableNumber] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<{ title: string; message: string; callback: () => void }>({
    title: '',
    message: '',
    callback: () => {},
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPatternDiscovery, setShowPatternDiscovery] = useState(false);
  const [showRetrievalPractice, setShowRetrievalPractice] = useState(false);
  const [retrievalWeakFacts, setRetrievalWeakFacts] = useState<string[]>([]);

  const handleCloseLeaderboard = useCallback(() => setShowLeaderboard(false), []);
  const handleCloseConfirm = useCallback(() => setShowConfirm(false), []);

  const completedCheckRef = useRef(new Set<string>());
  const prevTableRef = useRef(state.currentTable);
  const activeCardRef = useRef(state.activeCard);
  const confirmDataRef = useRef(confirmData);

  useEffect(() => {
    activeCardRef.current = state.activeCard;
  }, [state.activeCard]);

  useEffect(() => {
    confirmDataRef.current = confirmData;
  }, [confirmData]);

  // Show pattern discovery when entering a new table
  useEffect(() => {
    if (!engine.isEngineLoaded || !isLoaded) return;
    if (prevTableRef.current === state.currentTable) return;
    prevTableRef.current = state.currentTable;

    if (!engine.engineState.discoveredPatterns.includes(state.currentTable)) {
      startTransition(() => setShowPatternDiscovery(true));
    }
  }, [state.currentTable, engine.isEngineLoaded, isLoaded, engine.engineState.discoveredPatterns]);

  // Check table completion using ref to avoid cascading setState
  useEffect(() => {
    if (!isLoaded) return;
    const checkKey = `${state.currentTable}`;
    if (completedCheckRef.current.has(checkKey)) return;

    for (let groupCount = 1; groupCount <= 10; groupCount++) {
      if (!state.revealedCards.has(`${state.currentTable}x${groupCount}`)) return;
    }
    if (state.completedTables.has(state.currentTable)) return;

    completedCheckRef.current.add(checkKey);
    const elapsedSeconds = Math.floor((Date.now() - state.tableStartTime) / 1000);
    const starRating = calculateStarRating(elapsedSeconds);
    completeTable(state.currentTable, starRating);
    stopSong();
    playSound('complete');
    startTransition(() => {
      setCelebrationData({ elapsed: elapsedSeconds, stars: starRating });
      setShowCelebration(true);
    });
  }, [state.revealedCards, state.currentTable, state.completedTables, state.tableStartTime, isLoaded, completeTable, stopSong, playSound]);

  // Reset completed check when table changes
  useEffect(() => {
    completedCheckRef.current.clear();
  }, [state.currentTable]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { callback } = confirmDataRef.current;
      if (showConfirm) {
        if (e.key === 'Escape') {
          setShowConfirm(false);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          setShowConfirm(false);
          callback();
        }
        return;
      }
      if (showLeaderboard) {
        if (e.key === 'Escape') setShowLeaderboard(false);
        return;
      }
      if (showCertificate) return;
      if (showQuiz) return;
      if (showCelebration) return;

      const cards = document.querySelectorAll('.fact-card-keyboard');
      if (!cards.length) return;

      let activeIndex = -1;
      cards.forEach((card, index) => {
        if (card.classList.contains('active-card-kb')) activeIndex = index;
      });

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = activeIndex < cards.length - 1 ? activeIndex + 1 : 0;
        const nextCard = cards[nextIndex] as HTMLElement;
        nextCard?.click();
        nextCard?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : cards.length - 1;
        const prevCard = cards[prevIndex] as HTMLElement;
        prevCard?.click();
        prevCard?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex >= 0) {
          (cards[activeIndex] as HTMLElement)?.click();
        } else if (cards.length > 0) {
          (cards[0] as HTMLElement)?.click();
          (cards[0] as HTMLElement)?.focus();
        }
      } else if (e.key === 'Escape') {
        if (activeCardRef.current) {
          clearActiveCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirm, showLeaderboard, showCertificate, showQuiz, showCelebration, clearActiveCard]);

  // Initialize speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  const handleRevealCard = useCallback(
    (cardKey: string) => {
      const isNew = revealCard(cardKey);
      if (isNew) {
        playSound('reveal');
        engine.addStars(1, `Revealed ${cardKey}`);
        engine.updateMission('practice', 1);
      }
      if (cardKey !== state.activeCard) {
        stopSpeaking();
      }
      if (!isMuted) {
        const parts = cardKey.split('x');
        const table = parseInt(parts[0], 10);
        const group = parseInt(parts[1], 10);
        const answer = table * group;
        speakStoryText(`${table} times ${group} equals ${answer}`, () => setIsSpeaking(false));
        setIsSpeaking(true);
      }
    },
    [revealCard, playSound, stopSpeaking, state.activeCard, isMuted, engine]
  );

  const handlePatternComplete = useCallback(() => {
    engine.discoverPattern(state.currentTable);
    setShowPatternDiscovery(false);
  }, [engine, state.currentTable]);

  const handleRetrievalComplete = useCallback(
    (results: Array<{ fact: string; correct: boolean }>) => {
      setShowRetrievalPractice(false);
      results.forEach((r) => engine.recordFactAttempt(r.fact, r.correct));
      engine.updateMission('review', results.length);
      if (state.playerName) {
        const stats = calculateLeaderboardStats(state.tableStarRatings);
        const maxTables = getMaxAllowedTable(state.practiceMode, state.difficulty);
        saveLeaderboardEntry(state.playerName, stats.totalStars, stats.estimatedTime, stats.completedCount, maxTables);
      }
    },
    [engine, state.playerName, state.tableStarRatings, state.practiceMode, state.difficulty, saveLeaderboardEntry]
  );

  const handleCelebrationProceed = useCallback(() => {
    setShowCelebration(false);
    engine.unlockBadge('table-detective');
    const weakFactsList = engine.getWeakFacts().map((f) => f.fact);
    if (weakFactsList.length > 0) {
      setRetrievalWeakFacts(weakFactsList);
      setShowRetrievalPractice(true);
      return;
    }
    const maxAllowed = getMaxAllowedTable(state.practiceMode, state.difficulty);
    if (state.currentTable < maxAllowed) {
      setQuizTableNumber(state.currentTable);
      setShowQuiz(true);
    } else {
      if (state.playerName) {
        const stats = calculateLeaderboardStats(state.tableStarRatings);
        const maxTables = getMaxAllowedTable(state.practiceMode, state.difficulty);
        saveLeaderboardEntry(state.playerName, stats.totalStars, stats.estimatedTime, stats.completedCount, maxTables);
      }
      setShowCertificate(true);
    }
  }, [state.currentTable, state.practiceMode, state.difficulty, state.playerName, state.tableStarRatings, saveLeaderboardEntry, engine]);

  const handleQuizComplete = useCallback(
    (correct: number, total: number) => {
      engine.updateMission('challenge', 1);
      saveQuizResult(quizTableNumber, correct, total);
      setShowQuiz(false);
      saveCurrentTableState();
      if (state.playerName) {
        const updatedRatings = { ...state.tableStarRatings };
        const stats = calculateLeaderboardStats(updatedRatings);
        const maxTables = getMaxAllowedTable(state.practiceMode, state.difficulty);
        saveLeaderboardEntry(state.playerName, stats.totalStars, stats.estimatedTime, stats.completedCount, maxTables);
      }
      const maxAllowed = getMaxAllowedTable(state.practiceMode, state.difficulty);
      if (quizTableNumber < maxAllowed) {
        switchToTable(quizTableNumber + 1);
      }
    },
    [quizTableNumber, saveQuizResult, saveCurrentTableState, switchToTable, state.practiceMode, state.difficulty, state.playerName, state.tableStarRatings, saveLeaderboardEntry, engine]
  );

  const handleQuizSkip = useCallback(() => {
    setShowQuiz(false);
    saveCurrentTableState();
    if (state.playerName) {
      const stats = calculateLeaderboardStats(state.tableStarRatings);
      const maxTables = getMaxAllowedTable(state.practiceMode, state.difficulty);
      saveLeaderboardEntry(state.playerName, stats.totalStars, stats.estimatedTime, stats.completedCount, maxTables);
    }
    const maxAllowed = getMaxAllowedTable(state.practiceMode, state.difficulty);
    if (quizTableNumber < maxAllowed) {
      switchToTable(quizTableNumber + 1);
    }
  }, [quizTableNumber, saveCurrentTableState, switchToTable, state.practiceMode, state.difficulty, state.playerName, state.tableStarRatings, saveLeaderboardEntry]);

  const handleReset = useCallback(() => {
    setConfirmData({
      title: 'Reset Progress?',
      message: 'All your progress will be lost. This cannot be undone!',
      callback: () => {
        resetProgress();
        stopSong();
        stopSpeaking();
      },
    });
    setShowConfirm(true);
  }, [resetProgress, stopSong, stopSpeaking]);

  const handlePlayAgain = useCallback(() => {
    setConfirmData({
      title: 'Play Again?',
      message: 'This will reset all your progress. Are you sure?',
      callback: () => {
        playAgain();
        stopSong();
        stopSpeaking();
        setShowCertificate(false);
      },
    });
    setShowConfirm(true);
  }, [playAgain, stopSong, stopSpeaking]);

  const handleSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakStoryText(text, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  }, [isSpeaking, stopSpeaking]);

  const quizQuestions = useMemo(
    () => showQuiz && quizTableNumber > 0
      ? toQuizQuestions(generateQuizQuestions(quizTableNumber), quizTableNumber)
      : [],
    [showQuiz, quizTableNumber]
  );

  if (!isLoaded) return null;

  return (
    <div className="app-root font-body h-screen flex flex-col">
      <h2 className="sr-only">
        Free interactive times tables learning app for kids under 8 — tap each multiplication card to
        reveal the answer, see a fun illustration, and read a short story that makes learning maths tables easy and
        enjoyable for children aged 5 to 8.
      </h2>

      <AppHeader
        currentTable={state.currentTable}
        completedTables={state.completedTables}
        difficulty={state.difficulty}
        practiceMode={state.practiceMode}
        playerName={state.playerName}
        isMuted={isMuted}
        onSelectTable={(table) => {
          switchToTable(table);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSetDifficulty={setDifficulty}
        onTogglePractice={togglePracticeMode}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowPlayerName={() => router.push('/')}
        onReset={handleReset}
        onToggleMute={toggleMute}
        onHome={() => router.push('/')}
      />

      <ProgressBar
        completedTables={state.completedTables}
        difficulty={state.difficulty}
        practiceMode={state.practiceMode}
        tableStartTime={state.tableStartTime}
      />

      {showPatternDiscovery && (
        <PatternDiscovery
          tableNumber={state.currentTable}
          onComplete={handlePatternComplete}
        />
      )}

      {!showPatternDiscovery && !showRetrievalPractice && (
        <main className="main-content flex gap-6 p-5 overflow-hidden flex-col md:flex-row-reverse flex-1 min-h-0 md:items-start md:justify-center">
          <IllustrationPanel
            currentTable={state.currentTable}
            activeCard={state.activeCard}
            onToggleSpeak={handleSpeak}
            isSpeaking={isSpeaking}
          />

          <section className="cards-column flex-1 min-w-0 min-h-0 overflow-y-auto md:max-w-[400px] md:self-stretch pb-10">
            <p className="cards-hint font-display text-[13px] font-semibold text-text-muted text-center mb-2">
              Tap a card to reveal the answer!
            </p>
            <div className="cards-grid grid grid-cols-1 gap-2.5 w-full">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((groupCount) => {
                const cardKey = `${state.currentTable}x${groupCount}`;
                const isRevealed = state.revealedCards.has(cardKey);
                const isActive = state.activeCard === cardKey;
                return (
                  <div
                    key={groupCount}
                    className={`fact-card-keyboard w-full ${isActive ? 'active-card-kb' : ''}`}
                  >
                    <FactCard
                      groupCount={groupCount}
                      currentTable={state.currentTable}
                      isRevealed={isRevealed}
                      isActive={isActive}
                      onReveal={handleRevealCard}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {showRetrievalPractice && (
        <RetrievalPractice
          tableNumber={state.currentTable}
          weakFacts={retrievalWeakFacts}
          onComplete={handleRetrievalComplete}
        />
      )}

      {/* Overlays */}
      {showCelebration && (
        <CelebrationOverlay
          tableNumber={state.currentTable}
          elapsedSeconds={celebrationData.elapsed}
          starRating={celebrationData.stars}
          difficulty={state.difficulty}
          practiceMode={state.practiceMode}
          onProceed={handleCelebrationProceed}
          onPlayConfettiSound={playConfettiSound}
        />
      )}

      {showQuiz && (
        <QuizOverlay
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onSkip={handleQuizSkip}
          onPlaySound={playSound}
        />
      )}

      <CertificateOverlay
        isOpen={showCertificate}
        tableStarRatings={state.tableStarRatings}
        quizResults={state.quizResults}
        onPlayAgain={handlePlayAgain}
        onPlaySound={playSound}
      />

      <LeaderboardOverlay
        isOpen={showLeaderboard}
        onClose={handleCloseLeaderboard}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={() => {
          setShowConfirm(false);
          confirmData.callback();
        }}
        onCancel={handleCloseConfirm}
      />

    </div>
  );
}
