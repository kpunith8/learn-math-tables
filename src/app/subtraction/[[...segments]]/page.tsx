'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generatePracticeProblems,
  generateQuizQuestions,
} from '@/lib/operations/subtraction';

export default function SubtractionPage() {
  return (
    <OperationFlow
      operation="subtraction"
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
    />
  );
}
