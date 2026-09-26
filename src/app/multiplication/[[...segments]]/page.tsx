'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generatePracticeProblems,
  generateQuizQuestions,
} from '@/lib/operations/multiplication';

export default function MultiplicationPage() {
  return (
    <OperationFlow
      operation="multiplication"
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
    />
  );
}
