import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Table Playground - Play with Times Tables | Math Adventure',
  description:
    'Play with multiplication times tables 1 to 20: watch skip-count shows, spot patterns, and drag the answer. Free interactive tables playground for kids.',
  alternates: { canonical: `${SITE_URL}/tables/play` },
};

export default function TablesPlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
