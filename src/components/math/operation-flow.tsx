'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useAudio } from '@/lib/hooks/useAudio';
import {
  Operation, DifficultyLevel, Example, PracticeProblem,
  QuizQuestion, ConceptIntro, OPERATION_META,
} from '@/lib/operations/types';
import { resetEmojiPool } from '@/lib/operations/emoji-pool';
import { DifficultySelector } from './difficulty-selector';
import { ConceptIntroCard } from './concept-intro-card';
import { WorkedExample } from './worked-example';
import { PracticeProblemView } from './practice-problem';
import { ProblemSummaryList } from './problem-summary';

const QuizOverlay = dynamic(() => import('@/components/quiz-overlay').then((m) => m.QuizOverlay), { ssr: false });

interface OperationFlowProps {
  operation: Operation;
  generateLearnExamples: (d: DifficultyLevel) => Example[];
  generatePracticeProblems: (d: DifficultyLevel) => PracticeProblem[];
  generateQuizQuestions: (d: DifficultyLevel) => QuizQuestion[];
  getConceptIntro: (d: DifficultyLevel) => ConceptIntro | null;
}

export function OperationFlow({
  operation,
  generateLearnExamples: genExamples,
  generatePracticeProblems: genPractice,
  generateQuizQuestions: genQuiz,
  getConceptIntro,
}: OperationFlowProps) {
  const router = useRouter();
  const params = useParams();
  const { state } = useAppContext();
  const { playSound } = useAudio();

  const segments = params.segments as string[] | undefined;
  const urlDifficulty = segments?.[0] as DifficultyLevel | undefined;
  const urlStage = !segments || segments.length === 0
    ? 'difficulty'
    : segments.length >= 2
      ? (segments[1] as 'learn' | 'practice' | 'quiz')
      : 'learn';

  const meta = OPERATION_META[operation];

  const [learnExamples, setLearnExamples] = useState<Example[]>([]);
  const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [conceptIntro, setConceptIntro] = useState<ConceptIntro | null>(null);
  const [showConcept, setShowConcept] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const generatedForRef = useRef<DifficultyLevel | null>(null);
  const prevStageRef = useRef(urlStage);

  useEffect(() => {
    if (!urlDifficulty) return;
    if (generatedForRef.current === urlDifficulty) return;
    generatedForRef.current = urlDifficulty;

    resetEmojiPool();
    setLearnExamples(genExamples(urlDifficulty));
    setPracticeProblems(genPractice(urlDifficulty));
    setQuizQuestions(genQuiz(urlDifficulty));
    setCurrentExampleIndex(0);
    setCurrentProblemIndex(0);
    setPracticeCorrectCount(0);
    setShowSummary(false);
    setFadeOut(false);

    const intro = getConceptIntro(urlDifficulty);
    if (intro) {
      setConceptIntro(intro);
      setShowConcept(true);
    } else {
      setShowConcept(false);
    }
  }, [urlDifficulty, genExamples, genPractice, genQuiz, getConceptIntro]);

  useEffect(() => {
    if (prevStageRef.current !== urlStage) {
      if (urlStage === 'practice' || urlStage === 'learn') {
        setShowSummary(false);
      }
    }
    prevStageRef.current = urlStage;
  }, [urlStage]);

  const handleSelectDifficulty = useCallback(
    (d: DifficultyLevel) => {
      router.push(`/${operation}/${d}`);
    },
    [router, operation]
  );

  const handleConceptDone = useCallback(() => {
    setShowConcept(false);
  }, []);

  const handleNextExample = useCallback(() => {
    if (currentExampleIndex < learnExamples.length - 1) {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentExampleIndex((i) => i + 1);
        setFadeOut(false);
        playSound('click');
      }, 200);
    } else {
      router.push(`/${operation}/${urlDifficulty}/practice`);
    }
  }, [currentExampleIndex, learnExamples.length, playSound, router, operation, urlDifficulty]);

  const handlePracticeComplete = useCallback(
    (correct: boolean) => {
      if (correct) {
        setPracticeCorrectCount((c) => c + 1);
      }
      setTimeout(() => {
        if (currentProblemIndex < practiceProblems.length - 1) {
          setFadeOut(true);
          setTimeout(() => {
            setCurrentProblemIndex((i) => i + 1);
            setFadeOut(false);
          }, 200);
        } else {
          setShowSummary(true);
        }
      }, correct ? 800 : 2000);
    },
    [currentProblemIndex, practiceProblems.length]
  );

  const handleSummaryContinue = useCallback(() => {
    setShowSummary(false);
    router.push(`/${operation}/${urlDifficulty}/quiz`);
  }, [router, operation, urlDifficulty]);

  const handleQuizComplete = useCallback(
    (_correct: number, _total: number) => {
      router.push(`/${operation}`);
    },
    [router, operation]
  );

  const handleQuizSkip = useCallback(() => {
    router.push(`/${operation}`);
  }, [router, operation]);

  const handleBackToMenu = useCallback(() => {
    router.push('/');
  }, [router]);

  const currentExample = learnExamples[currentExampleIndex];
  const currentProblem = practiceProblems[currentProblemIndex];

  return (
    <div className="font-body min-h-screen bg-surface">
      <div className="bg-header text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToMenu}
            className="text-white/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white transition-colors cursor-pointer"
            aria-label="Home"
          >
            🏠
          </button>
          <button
            onClick={() => router.push(`/${operation}`)}
            className="font-display text-base text-white p-1.5 min-h-[44px] flex items-center gap-1 hover:text-white/80 transition-colors cursor-pointer"
          >
            <span style={{ filter: 'brightness(0) invert(1)' }}>{meta.emoji}</span>
            {meta.name}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {urlStage !== 'difficulty' && urlDifficulty && (
            <span className="font-display text-sm text-white">
              {urlDifficulty === 'easy' ? '🌟 Easy' : urlDifficulty === 'medium' ? '⭐ Medium' : '🏆 Hard'}
            </span>
          )}
          <button
            onClick={() => router.push('/')}
            className="font-display text-xs bg-indigo-light text-white py-1.5 px-3 rounded-full border-none cursor-pointer hover:bg-indigo transition-colors min-h-[44px] flex items-center"
          >
            <span
              className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap"
              title={state.playerName}
            >
              {state.playerName || '👤 Add Name'}
            </span>
          </button>
        </div>
      </div>

      {(urlStage === 'learn' || (urlStage === 'practice' && !showSummary)) && (
        <div className="flex justify-center gap-2 py-3">
          {urlStage === 'learn'
            ? learnExamples.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                    i === currentExampleIndex ? 'bg-indigo' : i < currentExampleIndex ? 'bg-green' : 'bg-[#ddd]'
                  }`}
                />
              ))
            : practiceProblems.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                    i === currentProblemIndex ? 'bg-indigo' : i < currentProblemIndex ? 'bg-green' : 'bg-[#ddd]'
                  }`}
                />
              ))}
        </div>
      )}

      {urlStage === 'difficulty' && !showConcept && (
        <DifficultySelector
          operationEmoji={meta.emoji}
          operationName={meta.name}
          description={meta.description}
          onSelect={handleSelectDifficulty}
        />
      )}

      {showConcept && conceptIntro && (
        <div className="flex justify-center p-6">
          <ConceptIntroCard copy={conceptIntro.copy} onDone={handleConceptDone} />
        </div>
      )}

      {urlStage === 'learn' && !showConcept && currentExample && (
        <div className="flex flex-col items-center p-6">
          <h2 className="font-display text-[20px] text-orange mb-4">
            Let's Learn {meta.name}! {meta.emoji}
          </h2>
          <div className={`transition-opacity duration-200 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <WorkedExample example={currentExample} />
          </div>
          <button
            onClick={handleNextExample}
            className="mt-5 font-display text-base py-2.5 px-8 rounded-full border-none bg-indigo text-white cursor-pointer transition-colors duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:bg-indigo-hover active:bg-indigo-active"
          >
            {currentExampleIndex < learnExamples.length - 1 ? 'Next →' : 'Let\'s Practice! 💪'}
          </button>

          {currentExampleIndex < learnExamples.length - 1 && (
            <p className="font-body text-sm text-text-dim mt-3">
              View all examples to unlock practice
            </p>
          )}
        </div>
      )}

      {urlStage === 'practice' && !showSummary && currentProblem && (
        <div className="flex flex-col items-center p-4 sm:p-6">
          <h2 className="font-display text-[20px] text-orange mb-4">
            Time to Practice! 💪
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
    </div>
  );
}
