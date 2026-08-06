import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tables`, changeFrequency: 'weekly', priority: 0.9 },
  ];

  for (const op of OPERATIONS) {
    entries.push({ url: `${SITE_URL}/${op}`, changeFrequency: 'weekly', priority: 0.8 });
    for (const difficulty of DIFFICULTIES) {
      entries.push({
        url: `${SITE_URL}/${op}/${difficulty}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  for (let table = 1; table <= 20; table++) {
    entries.push({
      url: `${SITE_URL}/tables/${table}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return entries;
}