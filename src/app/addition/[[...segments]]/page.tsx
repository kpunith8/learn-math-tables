'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generatePracticeProblems,
  generateQuizQuestions,
} from '@/lib/operations/addition';

export default function AdditionPage() {
  return (
    <OperationFlow
      operation="addition"
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
    />
  );
}
