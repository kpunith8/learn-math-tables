import type { ReactElement } from 'react';

export const OG_ALT = 'Math Adventure - Fun Math Learning for Kids';
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png' as const;

export function OgCard(): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#1B1447',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            borderRadius: '32px',
            background: '#FF6B52',
            fontSize: '80px',
            color: '#FFFFFF',
          }}
        >
          123
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: '84px', fontWeight: 800, color: '#FFB648', lineHeight: 1.1 }}>
            Math Adventure
          </div>
          <div style={{ fontSize: '40px', marginTop: '12px' }}>
            Learn • Practice • Quiz
          </div>
          <div style={{ fontSize: '34px', color: '#E4DDCB', marginTop: '4px' }}>
            Addition, subtraction, multiplication, division &amp; times tables
          </div>
        </div>
      </div>
    </div>
  );
}
