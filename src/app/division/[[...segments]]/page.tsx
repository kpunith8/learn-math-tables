'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generateLearnExamples,
  generatePracticeProblems,
  generateQuizQuestions,
  getConceptIntro,
} from '@/lib/operations/division';

export default function DivisionPage() {
  return (
    <OperationFlow
      operation="division"
      generateLearnExamples={generateLearnExamples}
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
      getConceptIntro={getConceptIntro}
    />
  );
}
