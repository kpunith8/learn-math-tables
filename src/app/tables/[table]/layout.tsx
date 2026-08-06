import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

interface TableLayoutProps {
  children: React.ReactNode;
  params: Promise<{ table: string }>;
}

export async function generateMetadata({ params }: TableLayoutProps): Promise<Metadata> {
  const { table } = await params;
  const n = Number(table);

  if (!Number.isInteger(n) || n < 1 || n > 20) {
    return { title: 'Times Tables - Learn Multiplication Tables | Math Adventure' };
  }

  return {
    title: `${n} Times Table - Learn & Practice | Math Adventure`,
    description: `Learn the ${n} times table with pattern discovery, fact cards, audio, and practice. ${n}×1 to ${n}×10 facts for kids.`,
    alternates: { canonical: `${SITE_URL}/tables/${n}` },
  };
}

export default function TableLayout({ children }: TableLayoutProps) {
  return <>{children}</>;
}