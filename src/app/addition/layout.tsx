import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Addition for Kids - Learn, Practice & Quiz',
  description:
    'Learn addition step by step: easy, medium, and hard levels with worked examples, practice problems, and fun quizzes for kids aged 5-8.',
  alternates: { canonical: `${SITE_URL}/addition` },
};

export default function AdditionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}