'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generateLearnExamples,
  generatePracticeProblems,
  generateQuizQuestions,
  getConceptIntro,
} from '@/lib/operations/subtraction';

export default function SubtractionPage() {
  return (
    <OperationFlow
      operation="subtraction"
      generateLearnExamples={generateLearnExamples}
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
      getConceptIntro={getConceptIntro}
    />
  );
}
