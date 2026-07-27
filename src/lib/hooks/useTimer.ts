'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTimer(startTime: number) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (startTime <= 0) {
      setElapsed(0); // eslint-disable-line react-hooks/set-state-in-effect
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setElapsed(Math.floor((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsRunning(false);
    };
  }, [startTime]);

  const formatDisplay = useCallback(() => {
    if (elapsed < 0) return '';
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return (minutes > 0 ? `${minutes}m ` : '') + `${seconds}s`;
  }, [elapsed]);

  return { elapsed, formatDisplay: formatDisplay(), isRunning };
}
