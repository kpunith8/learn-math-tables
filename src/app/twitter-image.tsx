import { ImageResponse } from 'next/og';
import { OgCard, OG_ALT, OG_SIZE, OG_CONTENT_TYPE } from './og-image';

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function TwitterImage() {
  return new ImageResponse(<OgCard />, { ...size });
}
