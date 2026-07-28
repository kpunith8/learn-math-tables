'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generateLearnExamples,
  generatePracticeProblems,
  generateQuizQuestions,
  getConceptIntro,
} from '@/lib/operations/multiplication';

export default function MultiplicationPage() {
  return (
    <OperationFlow
      operation="multiplication"
      generateLearnExamples={generateLearnExamples}
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
      getConceptIntro={getConceptIntro}
    />
  );
}
