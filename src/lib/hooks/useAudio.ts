'use client';

import { useRef, useCallback, useState } from 'react';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const suspendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSongPlayingRef = useRef(false);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const oscillatorNodesRef = useRef<OscillatorNode[]>([]);
  const songTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      if (suspendTimeoutRef.current) clearTimeout(suspendTimeoutRef.current);
      suspendTimeoutRef.current = setTimeout(() => {
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend();
        }
      }, 30000);
      return audioContextRef.current;
    } catch (error) {
      console.warn('Audio context unavailable:', error);
      return null;
    }
  }, []);

  const stopSong = useCallback(() => {
    isSongPlayingRef.current = false;
    setIsSongPlaying(false);
    if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
    oscillatorNodesRef.current.forEach((osc) => {
      try { osc.stop(); } catch {}
    });
    oscillatorNodesRef.current = [];
  }, []);

  const playSound = useCallback(
    (soundType: string) => {
      if (isMuted) return;
      try {
        const context = getAudioContext();
        if (!context) return;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.setValueAtTime(0.08, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

        const soundConfigs: Record<string, () => void> = {
          reveal: () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, context.currentTime);
            oscillator.frequency.linearRampToValueAtTime(880, context.currentTime + 0.1);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.15);
          },
          complete: () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, context.currentTime);
            oscillator.frequency.setValueAtTime(659, context.currentTime + 0.12);
            oscillator.frequency.setValueAtTime(784, context.currentTime + 0.24);
            oscillator.frequency.setValueAtTime(1047, context.currentTime + 0.36);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
          },
          'quiz-correct': () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, context.currentTime);
            oscillator.frequency.setValueAtTime(784, context.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.2);
          },
          'quiz-wrong': () => {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, context.currentTime);
            oscillator.frequency.linearRampToValueAtTime(120, context.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.05, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.2);
          },
          'quiz-done': () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, context.currentTime);
            oscillator.frequency.setValueAtTime(659, context.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, context.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1047, context.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.4);
          },
          certificate: () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, context.currentTime);
            oscillator.frequency.setValueAtTime(659, context.currentTime + 0.13);
            oscillator.frequency.setValueAtTime(784, context.currentTime + 0.26);
            oscillator.frequency.setValueAtTime(1047, context.currentTime + 0.39);
            oscillator.frequency.setValueAtTime(1319, context.currentTime + 0.52);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.7);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.6);
          },
          click: () => {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, context.currentTime);
            gainNode.gain.setValueAtTime(0.04, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.06);
          },
        };

        const config = soundConfigs[soundType];
        if (config) config();
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }
    },
    [getAudioContext, isMuted]
  );

  const playConfettiSound = useCallback(() => {
    if (isMuted) return;
    try {
      const context = getAudioContext();
      if (!context) return;
      const melodyNotes = [523, 659, 784, 1047, 1319, 1568];
      melodyNotes.forEach((frequency, noteIndex) => {
        const startTime = context.currentTime + noteIndex * 0.08;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.06, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.12);
      });
    } catch (error) {
      console.warn('Confetti sound failed:', error);
    }
  }, [getAudioContext, isMuted]);

  const playSong = useCallback(
    (tableNumber: number, onEnd?: () => void) => {
      if (isSongPlayingRef.current) {
        stopSong();
        return;
      }
      const context = getAudioContext();
      if (!context) return;
      isSongPlayingRef.current = true;
      setIsSongPlaying(true);

      const nodes: OscillatorNode[] = [];
      const startTime = context.currentTime;
      const beatDuration = 0.28;
      const scaleFrequencies = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

      for (let beatIndex = 0; beatIndex < 10; beatIndex++) {
        const noteIndex = beatIndex % scaleFrequencies.length;
        const frequency = scaleFrequencies[noteIndex];
        const noteStart = startTime + beatIndex * beatDuration;

        const mainOsc = context.createOscillator();
        const mainGain = context.createGain();
        mainOsc.connect(mainGain);
        mainGain.connect(context.destination);
        mainOsc.type = 'triangle';
        mainOsc.frequency.setValueAtTime(frequency, noteStart);
        mainGain.gain.setValueAtTime(0, noteStart);
        mainGain.gain.linearRampToValueAtTime(0.08, noteStart + 0.02);
        mainGain.gain.setValueAtTime(0.08, noteStart + beatDuration * 0.7);
        mainGain.gain.exponentialRampToValueAtTime(0.001, noteStart + beatDuration * 0.95);
        mainOsc.start(noteStart);
        mainOsc.stop(noteStart + beatDuration);
        nodes.push(mainOsc);

        const harmonyOsc = context.createOscillator();
        const harmonyGain = context.createGain();
        harmonyOsc.connect(harmonyGain);
        harmonyGain.connect(context.destination);
        harmonyOsc.type = 'sine';
        harmonyOsc.frequency.setValueAtTime(frequency * 1.5, noteStart);
        harmonyGain.gain.setValueAtTime(0, noteStart);
        harmonyGain.gain.linearRampToValueAtTime(0.03, noteStart + 0.02);
        harmonyGain.gain.exponentialRampToValueAtTime(0.001, noteStart + beatDuration * 0.9);
        harmonyOsc.start(noteStart);
        harmonyOsc.stop(noteStart + beatDuration);
        nodes.push(harmonyOsc);
      }

      const flourishStart = startTime + 10 * beatDuration;
      const flourishNotes = [1047, 1319, 1568];
      flourishNotes.forEach((frequency, flourishIndex) => {
        const noteTime = flourishStart + flourishIndex * 0.12;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, noteTime);
        gainNode.gain.setValueAtTime(0.07, noteTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);
        oscillator.start(noteTime);
        oscillator.stop(noteTime + 0.25);
        nodes.push(oscillator);
      });

      oscillatorNodesRef.current = nodes;

      songTimeoutRef.current = setTimeout(() => {
        isSongPlayingRef.current = false;
        setIsSongPlaying(false);
        oscillatorNodesRef.current = [];
        onEnd?.();
      }, (10 * beatDuration + flourishNotes.length * 0.12 + 0.5) * 1000);
    },
    [getAudioContext, stopSong]
  );

  return { playSound, playConfettiSound, playSong, stopSong, isSongPlaying, isMuted, toggleMute };
}
