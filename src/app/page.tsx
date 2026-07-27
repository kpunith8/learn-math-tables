'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useAudio } from '@/lib/hooks/useAudio';
import { useTimer } from '@/lib/hooks/useTimer';
import { calculateStarRating, getMaxAllowedTable, calculateLeaderboardStats, speakStoryText, cancelSpeech } from '@/lib/utils';
import { LandingScreen } from '@/components/landing-screen';
import { AppHeader } from '@/components/app-header';
import { ProgressBar } from '@/components/progress-bar';
import { FactCard } from '@/components/fact-card';
import { IllustrationPanel } from '@/components/illustration-panel';
import { QuizOverlay } from '@/components/quiz-overlay';
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { CertificateOverlay } from '@/components/certificate-overlay';
import { LeaderboardOverlay } from '@/components/leaderboard-overlay';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { NameModal } from '@/components/name-modal';

export default function Home() {
  const {
    state,
    isLoaded,
    showLanding,
    switchToTable,
    saveCurrentTableState,
    setDifficulty,
    togglePracticeMode,
    setPlayerName,
    startLearning,
    resetProgress,
    playAgain,
    revealCard,
    clearActiveCard,
    completeTable,
    saveQuizResult,
    leaderboardData,
    saveLeaderboardEntry,
  } = useAppContext();

  const { playSound, playConfettiSound, stopSong } = useAudio();
  const { formatDisplay } = useTimer(state.tableStartTime);

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
  const [showNameModal, setShowNameModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const completedCheckRef = useRef(new Set<string>());

  // Check table completion using ref to avoid cascading setState
  useEffect(() => {
    if (!isLoaded || showLanding) return;
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
    setCelebrationData({ elapsed: elapsedSeconds, stars: starRating }); // eslint-disable-line react-hooks/set-state-in-effect
    setShowCelebration(true);  
  }, [state.revealedCards, state.currentTable, state.completedTables, state.tableStartTime, isLoaded, showLanding, completeTable, stopSong, playSound]);

  // Reset completed check when table changes
  useEffect(() => {
    completedCheckRef.current.clear();
  }, [state.currentTable]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirm) {
        if (e.key === 'Escape') {
          setShowConfirm(false);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          setShowConfirm(false);
          confirmData.callback();
        }
        return;
      }
      if (showNameModal) {
        if (e.key === 'Escape') setShowNameModal(false);
        return;
      }
      if (showLeaderboard) {
        if (e.key === 'Escape') setShowLeaderboard(false);
        return;
      }
      if (showCertificate) return;
      if (showQuiz) return;
      if (showCelebration) return;
      if (showLanding) return;

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
        if (state.activeCard) {
          clearActiveCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirm, showNameModal, showLeaderboard, showCertificate, showQuiz, showCelebration, showLanding, state.activeCard]);

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
      }
      if (cardKey !== state.activeCard) {
        stopSpeaking();
      }
    },
    [revealCard, playSound, stopSpeaking, state.activeCard]
  );

  const handleCelebrationProceed = useCallback(() => {
    setShowCelebration(false);
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
  }, [state.currentTable, state.practiceMode, state.difficulty, state.playerName, state.tableStarRatings, saveLeaderboardEntry, getMaxAllowedTable]);

  const handleQuizComplete = useCallback(
    (correct: number, total: number) => {
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
    [quizTableNumber, saveQuizResult, saveCurrentTableState, switchToTable, state.practiceMode, state.difficulty, state.playerName, state.tableStarRatings, saveLeaderboardEntry]
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

  const handleStartLearning = useCallback(() => {
    startLearning();
    if (!state.playerName) {
      setTimeout(() => setShowNameModal(true), 500);
    }
  }, [startLearning, state.playerName]);

  const handleSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakStoryText(text, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  }, [isSpeaking, stopSpeaking]);

  if (!isLoaded) return null;

  return (
    <div className="app-root font-body h-screen flex flex-col">
      {showLanding && <LandingScreen onStart={handleStartLearning} />}

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
        onSelectTable={(table) => {
          switchToTable(table);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSetDifficulty={setDifficulty}
        onTogglePractice={togglePracticeMode}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowPlayerName={() => setShowNameModal(true)}
        onReset={handleReset}
      />

      <ProgressBar
        completedTables={state.completedTables}
        difficulty={state.difficulty}
        practiceMode={state.practiceMode}
        timerDisplay={formatDisplay}
      />

      <main className="main-content flex gap-6 p-5 overflow-hidden flex-col md:flex-row-reverse flex-1 min-h-0 md:items-start md:justify-center">
        <IllustrationPanel
          currentTable={state.currentTable}
          activeCard={state.activeCard}
          onToggleSpeak={handleSpeak}
          isSpeaking={isSpeaking}
        />

        <section className="cards-column flex-1 min-w-0 min-h-0 overflow-y-auto md:max-w-[400px] md:self-stretch">
          <p className="cards-hint font-display text-[13px] text-[#777] text-center mb-2">
            Tap a card to reveal the answer!
          </p>
          <div className="cards-grid grid grid-cols-1 gap-2.5 w-full pb-4">
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

      <QuizOverlay
        isOpen={showQuiz}
        tableNumber={quizTableNumber}
        onComplete={handleQuizComplete}
        onSkip={handleQuizSkip}
        onPlaySound={playSound}
      />

      <CertificateOverlay
        isOpen={showCertificate}
        tableStarRatings={state.tableStarRatings}
        quizResults={state.quizResults}
        onPlayAgain={handlePlayAgain}
        onPlaySound={playSound}
      />

      <LeaderboardOverlay
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <ConfirmDialog
        isOpen={showConfirm}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={() => {
          setShowConfirm(false);
          confirmData.callback();
        }}
        onCancel={() => setShowConfirm(false)}
      />

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
