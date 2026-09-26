'use client';

import { OperationFlow } from '@/components/math/operation-flow';
import {
  generatePracticeProblems,
  generateQuizQuestions,
} from '@/lib/operations/division';

export default function DivisionPage() {
  return (
    <OperationFlow
      operation="division"
      generatePracticeProblems={generatePracticeProblems}
      generateQuizQuestions={generateQuizQuestions}
    />
  );
}
