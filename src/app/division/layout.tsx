import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Division for Kids - Learn, Practice & Quiz',
  description:
    'Learn division step by step: easy, medium, and hard levels with worked examples, practice problems, and fun quizzes for kids aged 5-8.',
  alternates: { canonical: `${SITE_URL}/division` },
};

export default function DivisionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}