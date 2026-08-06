'use client';

import { useParams } from 'next/navigation';
import TablesPage from '../page';

export default function TableRoute() {
  const params = useParams<{ table: string }>();
  const n = Number(params.table);
  const initialTable = Number.isInteger(n) && n >= 1 && n <= 20 ? n : undefined;
  return <TablesPage initialTable={initialTable} />;
}