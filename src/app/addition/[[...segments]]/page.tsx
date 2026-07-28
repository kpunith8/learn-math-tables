'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generateLearnExamples,
  generatePracticeProblems,
  generateQuizQuestions,
  getConceptIntro,
} from '@/lib/operations/addition';

export default function AdditionPage() {
  return (
    <OperationFlow
      operation="addition"
      generateLearnExamples={generateLearnExamples}
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
      getConceptIntro={getConceptIntro}
    />
  );
}
