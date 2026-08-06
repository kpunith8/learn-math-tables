import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Times Tables - Learn Multiplication Tables',
  description:
    'Practice multiplication times tables from 1 to 20 with pattern discovery, fact cards, audio, practice mode, and quizzes. Free times tables practice for kids.',
  alternates: { canonical: `${SITE_URL}/tables` },
};

export default function TablesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}