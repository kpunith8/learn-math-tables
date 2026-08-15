'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Script from 'next/script';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export interface TurnstileHandle {
  getToken: () => string | undefined;
  reset: () => void;
}

interface TurnstileProps {
  action: string;
  enabled?: boolean;
  sitekey?: string;
  className?: string;
}

export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { action, enabled = true, sitekey, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      getToken: () => window.turnstile?.getResponse(widgetIdRef.current),
      reset: () => window.turnstile?.reset(widgetIdRef.current),
    }),
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    if (!scriptLoaded && typeof window.turnstile === 'undefined') return;
    let cancelled = false;
    let retries = 0;
    let container: HTMLDivElement | null = containerRef.current;

    const renderWidget = () => {
      if (cancelled) return;
      container = containerRef.current;
      // The dialog portal mounts the container in a follow-up render, so retry
      // a few frames until it exists before giving up.
      if (!container) {
        if (retries < 10) {
          retries++;
          requestAnimationFrame(renderWidget);
        }
        return;
      }
      if (container.getAttribute('data-turnstile-rendered') === '1') return;
      const el = container;
      const widgetId = window.turnstile?.render(container, {
        sitekey: sitekey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
        action,
        callback: () => {
          el.style.display = 'none';
          const wrapper = el.parentElement;
          if (wrapper) wrapper.style.display = 'none';
        },
      });
      if (widgetId) {
        container.setAttribute('data-turnstile-rendered', '1');
        container.setAttribute('data-turnstile-widget-id', String(widgetId));
        widgetIdRef.current = widgetId;
      }
    };

    renderWidget();

    return () => {
      cancelled = true;
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
      if (container) {
        container.removeAttribute('data-turnstile-rendered');
        container.removeAttribute('data-turnstile-widget-id');
      }
    };
  }, [enabled, scriptLoaded, action, sitekey]);

  return (
    <>
      {enabled && (
        <>
          <Script
            src={TURNSTILE_SCRIPT_SRC}
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
          />
          <div className={`flex w-full justify-center ${className ?? ''}`}>
            <div
              ref={containerRef}
              data-turnstile-name
              className="cf-turnstile"
              data-sitekey={sitekey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
              data-action={action}
            />
          </div>
        </>
      )}
    </>
  );
});
