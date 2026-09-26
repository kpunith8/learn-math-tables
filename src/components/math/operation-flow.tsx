'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@base-ui/react/toast';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useDifficulty } from '@/lib/contexts/DifficultyContext';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { useAudio } from '@/lib/hooks/useAudio';
import {
  Operation, DifficultyLevel, PracticeProblem,
  QuizQuestion, OPERATION_META, Translate,
} from '@/lib/operations/types';
import { Button } from '@/components/ui/button';
import { House, User, ArrowLeft, ArrowRight, BicepsFlexed, Check } from 'lucide-react';
import { resetEmojiPool } from '@/lib/operations/emoji-pool';
import { isOperationFullyCompleted } from '@/lib/engines/star-economy';
import { STAR_CAPS } from '@/lib/engines/types';
import { PracticeProblemView } from './practice-problem';
import { ProblemSummaryList } from './problem-summary';

// Playgrounds render randomized content on first paint, so (like QuizOverlay)
// they mount client-only to keep SSR HTML deterministic for hydration.
const AdditionPlayground = dynamic(() => import('@/components/playground/addition-playground').then((m) => m.AdditionPlayground), { ssr: false });
const SubtractionPlayground = dynamic(() => import('@/components/playground/subtraction-playground').then((m) => m.SubtractionPlayground), { ssr: false });
const MultiplicationPlayground = dynamic(() => import('@/components/playground/show-then-answer').then((m) => m.MultiplicationPlayground), { ssr: false });
const DivisionPlayground = dynamic(() => import('@/components/playground/show-then-answer').then((m) => m.DivisionPlayground), { ssr: false });

const QuizOverlay = dynamic(() => import('@/components/quiz-overlay').then((m) => m.QuizOverlay), { ssr: false });

const practiceToastManager = Toast.createToastManager();

function getToastMessage(t: Translate): string {
  const pool = t('messages.practiceToast.title', { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'You got it!';
}

function PracticeToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} swipeDirection="up" className="group">
      <Toast.Content className="overflow-hidden">
        <div className="bg-green/10 border-2 border-green/30 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2.5">
          <Check className="w-5 h-5 shrink-0 text-green" strokeWidth={2.5} />
          <div>
            <Toast.Title className="font-display text-sm font-bold text-green" />
            <Toast.Description className="font-body text-xs text-text-secondary" />
          </div>
        </div>
      </Toast.Content>
    </Toast.Root>
  ));
}

interface OperationFlowProps {
  operation: Operation;
  generatePracticeProblems: (d: DifficultyLevel, t: Translate) => PracticeProblem[];
  generateQuizQuestions: (d: DifficultyLevel, t: Translate) => QuizQuestion[];
}

function OperationIcon({ operation, className }: { operation: Operation; className?: string }) {
  const Icon = OPERATION_META[operation].icon;
  return <Icon className={className} strokeWidth={2.5} aria-hidden="true" />;
}

export function OperationFlow({
  operation,
  generatePracticeProblems: genPractice,
  generateQuizQuestions: genQuiz,
}: OperationFlowProps) {
  const router = useRouter();
  const params = useParams();
  const { state } = useAppContext();
  const { playSound } = useAudio();
  const engine = useEngineState();
  const { t } = useTranslation();
  const { difficulty, isLoaded: difficultyLoaded } = useDifficulty();
  const { isAuthenticated, user } = useKindeBrowserClient();
  const sessionName = isAuthenticated ? user?.given_name || '' : '';

  const segments = params.segments as string[] | undefined;
  const STAGES = ['play', 'practice', 'quiz'] as const;
  const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

  // Legacy URLs like /addition/easy/practice carried the difficulty in the path.
  // Today difficulty is global (context), so rewrite any such segment away.
  const legacyDifficulty = segments && segments.length > 0 && (DIFFICULTIES as readonly string[]).includes(segments[0])
    ? (segments[0] as DifficultyLevel)
    : null;
  const legacyStage = legacyDifficulty
    ? segments && segments.length > 1 && (STAGES as readonly string[]).includes(segments[1])
      ? (segments[1] as (typeof STAGES)[number])
      : 'play'
    : 'play';

  // `/learn` is retired — the playground is the learning entry now.
  const rawStage = segments && segments.length > 0 && (STAGES as readonly string[]).includes(segments[0])
    ? (segments[0] as (typeof STAGES)[number])
    : legacyStage;
  const retiredLearn = segments?.[0] === 'learn';
  const bareOperation = !segments || segments.length === 0;
  const urlStage: (typeof STAGES)[number] = retiredLearn || bareOperation ? 'play' : rawStage;

  const activeDifficulty = legacyDifficulty ?? difficulty;

  useEffect(() => {
    if (legacyDifficulty) {
      router.replace(`/${operation}/${urlStage}`);
      return;
    }
    // Retired routes land on the playground.
    if (retiredLearn || bareOperation) {
      router.replace(`/${operation}/play`);
    }
  }, [legacyDifficulty, retiredLearn, bareOperation, urlStage, operation, router]);

  const meta = OPERATION_META[operation];

  const generatedContent = useMemo(() => {
    if (!activeDifficulty) return null;
    resetEmojiPool();
    const problems = genPractice(activeDifficulty, t);
    const quizzes = genQuiz(activeDifficulty, t);
    return { problems, quizzes };
  }, [activeDifficulty, genPractice, genQuiz, t]);

  const practiceProblems: PracticeProblem[] = generatedContent?.problems ?? [];
  const quizQuestions: QuizQuestion[] = generatedContent?.quizzes ?? [];

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (difficulty) {
      const id = setTimeout(() => {
        setCurrentProblemIndex(0);
        setPracticeCorrectCount(0);
        setShowSummary(false);
        setFadeOut(false);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [difficulty]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (urlStage === 'practice' || urlStage === 'play') {
        setShowSummary(false);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [urlStage]);

  const handlePracticeComplete = useCallback(
    (correct: boolean) => {
      const key = `${operation}:${activeDifficulty}`;
      engine.updateMission('practice', 1);
      if (correct) {
        setPracticeCorrectCount((c) => c + 1);
        engine.awardCorrectAnswer(key);
        playSound('quiz-correct');
        practiceToastManager.add({
          title: getToastMessage(t),
          description: t('messages.practiceToast.description', 'Keep it up, Math Explorer!'),
          type: 'success',
          timeout: 2000,
        });
        setTimeout(() => {
          if (currentProblemIndex < practiceProblems.length - 1) {
            setFadeOut(true);
            setTimeout(() => {
              setCurrentProblemIndex((i) => i + 1);
              setFadeOut(false);
            }, 200);
          } else {
            engine.awardPracticeComplete(key);
            setShowSummary(true);
          }
        }, 800);
      } else {
        setTimeout(() => {
          if (currentProblemIndex < practiceProblems.length - 1) {
            setFadeOut(true);
            setTimeout(() => {
              setCurrentProblemIndex((i) => i + 1);
              setFadeOut(false);
            }, 200);
          } else {
            engine.awardPracticeComplete(key);
            setShowSummary(true);
          }
        }, 1500);
      }
    },
    [currentProblemIndex, practiceProblems.length, engine, operation, activeDifficulty, t, playSound]
  );

  const handleSummaryContinue = useCallback(() => {
    setShowSummary(false);
    engine.awardLessonComplete(`${operation}:${activeDifficulty}`);
    router.push(`/${operation}/quiz`);
  }, [router, operation, activeDifficulty, engine]);

  const handleQuizComplete = useCallback(
    (correct: number, total: number) => {
      engine.awardQuizComplete(`${operation}:${activeDifficulty}`);
      engine.updateMission('challenge', 1);
      if (correct === total) {
        engine.unlockBadge('perfect-score');
      }
      engine.unlockBadge('first-quiz');
      engine.markOperationComplete(operation);
      const hypotheticalStars = {
        ...engine.engineState.milestoneStars,
        [`${operation}:${activeDifficulty}:quiz`]: STAR_CAPS.quiz,
      };
      const allOps: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
      if (allOps.every((op) => isOperationFullyCompleted(hypotheticalStars, op))) {
        engine.unlockBadge('math-explorer');
      }
      router.push(`/${operation}/play`);
    },
    [router, operation, activeDifficulty, engine]
  );

  const handleQuizSkip = useCallback(() => {
    router.push(`/${operation}/play`);
  }, [router, operation]);

  const handleBackToMenu = useCallback(() => {
    router.push('/');
  }, [router]);

  const handlePlayToPractice = useCallback(() => {
    router.push(`/${operation}/practice`);
  }, [router, operation]);

  const currentProblem = practiceProblems[currentProblemIndex];

  // The playground is its own full screen (no stars awarded — pure learning).
  // Keyed by problem signature so a regenerated problem set (difficulty /
  // language change) remounts with fresh round state instead of stale drops.
  if (urlStage === 'play') {
    const playKey = practiceProblems.map((p) => `${p.operand1}x${p.operand2}`).join('|');
    const playground = (() => {
      switch (operation) {
        case 'addition':
          return <AdditionPlayground key={playKey} problems={practiceProblems} accent={meta.color} onPractice={handlePlayToPractice} onHome={handleBackToMenu} />;
        case 'subtraction':
          return <SubtractionPlayground key={playKey} problems={practiceProblems} accent={meta.color} onPractice={handlePlayToPractice} onHome={handleBackToMenu} />;
        case 'multiplication':
          return <MultiplicationPlayground key={playKey} problems={practiceProblems} accent={meta.color} onPractice={handlePlayToPractice} onHome={handleBackToMenu} />;
        case 'division':
          return <DivisionPlayground key={playKey} problems={practiceProblems} accent={meta.color} onPractice={handlePlayToPractice} onHome={handleBackToMenu} />;
      }
    })();
    return (
      <Toast.Provider toastManager={practiceToastManager}>
        {playground}
        <Toast.Portal>
          <Toast.Viewport className="fixed top-20 inset-x-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:right-4 sm:items-end sm:max-w-[360px]">
            <PracticeToastList />
          </Toast.Viewport>
        </Toast.Portal>
      </Toast.Provider>
    );
  }

  return (
    <Toast.Provider toastManager={practiceToastManager}>
    <div
      className="font-body min-h-screen"
      style={{ background: `linear-gradient(180deg, ${meta.color}1f 0%, var(--color-paper) 30%)` }}
    >
      <div className="bg-header text-white px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBackToMenu}
            className="text-white/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white transition-colors cursor-pointer"
            aria-label={t('common.aria.home', 'Home')}
          >
            <House className="w-6 h-6 text-white/80" strokeWidth={2} />
          </button>
          <button
            onClick={() => router.push(`/${operation}/play`)}
            className="font-display text-base text-white p-1.5 min-h-[44px] flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer"
          >
            <OperationIcon operation={operation} className="w-6 h-6 text-white" />
            {t(`operations.meta.${operation}.name`, meta.name)}
          </button>
        </div>
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {engine.isEngineLoaded && (
            <span className="font-display text-sm text-yellow-300">⭐{engine.engineState.stars}</span>
          )}
          <Button
            onClick={() => router.push('/')}
            variant="indigo"
            size="sm"
          >
            {!sessionName && !state.playerName && <User className="w-4 h-4" />}
            <span
              className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap"
              title={sessionName || state.playerName}
            >
              {sessionName || state.playerName || t('common.nav.addNameShort')}
            </span>
          </Button>
        </div>
      </div>

      {urlStage === 'practice' && !showSummary && (
        <div className="flex justify-center gap-2 py-3">
          {practiceProblems.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                i === currentProblemIndex ? 'bg-coral' : i < currentProblemIndex ? 'bg-leaf' : 'bg-mist'
              }`}
            />
          ))}
        </div>
      )}

      {urlStage === 'practice' && !difficultyLoaded && (
        <div className="flex flex-col items-center p-4 sm:p-6" aria-busy="true">
          <h2 className="font-display text-[20px] text-orange mb-2 flex items-center gap-1.5">
            {t('operations.screen.timeToPractice')}
            <BicepsFlexed className="w-5 h-5" />
          </h2>
          <div className="w-full max-w-[420px] bg-card rounded-2xl border-2 border-mist p-5 animate-pulse min-h-[280px]" />
        </div>
      )}

      {urlStage === 'practice' && difficultyLoaded && !showSummary && currentProblem && (
        <div className="flex flex-col items-center p-4 sm:p-6">
          <h2 className="font-display text-[20px] text-orange mb-2 flex items-center gap-1.5">
            {t('operations.screen.timeToPractice')}
            <BicepsFlexed className="w-5 h-5" />
          </h2>
          <div className={`w-full max-w-[420px] transition-opacity duration-200 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <PracticeProblemView
              key={currentProblemIndex}
              problem={currentProblem}
              index={currentProblemIndex}
              total={practiceProblems.length}
              onComplete={handlePracticeComplete}
            />
          </div>
          <Button
            onClick={() => router.push(`/${operation}/play`)}
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('playground.title')}
          </Button>
        </div>
      )}

      {showSummary && (
        <div className="p-6">
          <ProblemSummaryList
            problems={practiceProblems}
            correctCount={practiceCorrectCount}
            onContinue={handleSummaryContinue}
          />
        </div>
      )}

      {urlStage === 'quiz' && (
        <QuizOverlay
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onSkip={handleQuizSkip}
          onPlaySound={playSound}
        />
      )}

      {urlStage === 'practice' && !showSummary && (
        <div className="flex justify-center pb-6">
          <Button
            onClick={() => router.push(`/${operation}/quiz`)}
            variant="ghost"
            size="sm"
          >
            {t('common.buttons.skip')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>

      <Toast.Portal>
        <Toast.Viewport className="fixed top-20 inset-x-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:right-4 sm:items-end sm:max-w-[360px]">
          <PracticeToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
