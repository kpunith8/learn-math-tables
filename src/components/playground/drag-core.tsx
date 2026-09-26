'use client';

import { useRef, useCallback, type ReactNode, type PointerEvent, type MouseEvent } from 'react';

const zoneElements = new Map<string, HTMLElement>();

function registerZone(id: string, el: HTMLElement | null) {
  if (el) zoneElements.set(id, el);
  else zoneElements.delete(id);
}

/**
 * Point-in-rect hit test against mounted drop zones (8px forgiveness for small
 * fingers). Uses live geometry instead of elementFromPoint so stacking order,
 * overlays, and the dragged chip itself can never swallow the drop.
 */
function hitTestZoneAt(x: number, y: number, inflate = 8): string | null {
  for (const [id, el] of zoneElements) {
    if (!el.isConnected) {
      zoneElements.delete(id);
      continue;
    }
    const r = el.getBoundingClientRect();
    if (x >= r.left - inflate && x <= r.right + inflate && y >= r.top - inflate && y <= r.bottom + inflate) {
      return id;
    }
  }
  return null;
}

/**
 * Cosmetic fly-to-target animation for taps: clones the tapped chip and arcs
 * it to the drop zone while gameplay state commits instantly underneath.
 * The clone strips test ids so selectors never see double elements, and
 * honors prefers-reduced-motion by skipping the flight entirely.
 */
export function flyClone(sourceTestId: string, targetTestId: string, duration = 450): void {
  try {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const source = document.querySelector(`[data-testid="${sourceTestId}"]`);
    const target = document.querySelector(`[data-testid="${targetTestId}"]`);
    if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) return;
    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    if (s.width === 0 || t.width === 0) return;
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('data-testid');
    clone.removeAttribute('data-draggable');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'fixed';
    clone.style.left = `${s.left}px`;
    clone.style.top = `${s.top}px`;
    clone.style.width = `${s.width}px`;
    clone.style.height = `${s.height}px`;
    clone.style.margin = '0';
    clone.style.transition = '';
    clone.style.transform = '';
    clone.style.zIndex = '60';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);
    const dx = t.left + t.width / 2 - (s.left + s.width / 2);
    const dy = t.top + t.height / 2 - (s.top + s.height / 2);
    const flight = clone.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate3d(${(dx * 0.6).toFixed(1)}px, ${(dy * 0.6 - 28).toFixed(1)}px, 0) scale(0.9)`,
          opacity: 1,
          offset: 0.65,
        },
        { transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(0.45)`, opacity: 0.55 },
      ],
      { duration, easing: 'cubic-bezier(0.22, 0.9, 0.34, 1)' }
    );
    flight.onfinish = () => clone.remove();
    window.setTimeout(() => clone.remove(), duration + 500);
  } catch {
    // Cosmetic only — gameplay state is committed by the caller regardless.
  }
}

interface DraggableItemProps {
  id: string;
  label: string;
  disabled?: boolean;
  /** Fired on pointer-up after a real drag. zoneId is null when dropped outside any zone (snap back). */
  onDrop: (id: string, zoneId: string | null) => void;
  /** Fired on tap / keyboard activate — parent should auto-place the item. */
  onTap: (id: string) => void;
  className?: string;
  testId?: string;
  children: ReactNode;
}

/**
 * Pointer-Events draggable (touch + mouse + keyboard).
 * Position lives in refs/DOM transform — no per-frame React renders.
 * Move/up are tracked on `window` (deliberately NOT pointer capture, which can
 * throw on some mouse/pen stacks and silently kill the gesture) so fast drags
 * that outrun the chip still finish. Tap (no movement) and keyboard
 * Enter/Space fall back to `onTap` auto-place.
 */
export function DraggableItem({ id, label, disabled, onDrop, onTap, className = '', testId, children }: DraggableItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef({ active: false, pointerId: -1, moved: false, startX: 0, startY: 0, raf: 0 });

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled || drag.current.active) return;
      const gesture = { onDrop, onTap };
      drag.current = { active: true, pointerId: e.pointerId, moved: false, startX: e.clientX, startY: e.clientY, raf: 0 };
      const el = ref.current;
      if (el) {
        el.style.zIndex = '30';
        el.style.pointerEvents = 'none';
        el.classList.add('play-dragging');
      }

      const setTransform = (dx: number, dy: number) => {
        const node = ref.current;
        if (node) node.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.12)`;
      };
      const clearTransform = () => {
        const node = ref.current;
        if (node) {
          node.style.transition = 'transform 180ms ease-out';
          node.style.transform = '';
          window.setTimeout(() => {
            if (ref.current) ref.current.style.transition = '';
          }, 200);
        }
      };
      const detach = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        window.removeEventListener('blur', onBlur);
      };
      // If the pointer is released off-window (or the gesture is otherwise
      // interrupted), abandon it so a stuck drag can never block later taps.
      const onBlur = () => {
        const d = drag.current;
        if (!d.active || d.pointerId !== e.pointerId) return;
        d.active = false;
        cancelAnimationFrame(d.raf);
        detach();
        const node = ref.current;
        if (node) {
          node.style.zIndex = '';
          node.style.pointerEvents = '';
          node.style.transform = '';
          node.classList.remove('play-dragging');
        }
      };
      const onMove = (ev: globalThis.PointerEvent) => {
        const d = drag.current;
        if (!d.active || ev.pointerId !== d.pointerId) return;
        const dx = ev.clientX - d.startX;
        const dy = ev.clientY - d.startY;
        if (Math.hypot(dx, dy) > 6) d.moved = true;
        if (!d.moved) return;
        cancelAnimationFrame(d.raf);
        d.raf = requestAnimationFrame(() => setTransform(dx, dy));
      };
      const onUp = (ev: globalThis.PointerEvent) => {
        const d = drag.current;
        if (!d.active || ev.pointerId !== d.pointerId) return;
        d.active = false;
        cancelAnimationFrame(d.raf);
        detach();
        const node = ref.current;
        if (node) {
          node.style.zIndex = '';
          node.style.pointerEvents = '';
          node.classList.remove('play-dragging');
        }
        if (!d.moved) {
          clearTransform();
          gesture.onTap(id);
          return;
        }
        const zoneId = hitTestZoneAt(ev.clientX, ev.clientY);
        clearTransform();
        gesture.onDrop(id, zoneId);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      window.addEventListener('blur', onBlur);
    },
    [disabled, id, onDrop, onTap]
  );

  const onKeyboardClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      // Keyboard-activated clicks have detail === 0; real taps already went through onTap.
      if (e.detail === 0 && !disabled) onTap(id);
    },
    [disabled, id, onTap]
  );

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={label}
      data-draggable={id}
      data-testid={testId}
      onPointerDown={onPointerDown}
      onClick={onKeyboardClick}
      className={`touch-none select-none cursor-grab active:cursor-grabbing disabled:cursor-default disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

interface DropZoneProps {
  id: string;
  label: string;
  accent: string;
  className?: string;
  testId?: string;
  children: ReactNode;
}

/** A drop target. Always visibly glowing so kids know where to drag (no hover tracking needed). */
export function DropZone({ id, label, accent, className = '', testId, children }: DropZoneProps) {
  return (
    <div
      data-dropzone={id}
      ref={(el) => {
        registerZone(id, el);
      }}
      data-testid={testId}
      role="region"
      aria-label={label}
      className={`play-glow rounded-2xl border-[3px] border-dashed bg-card px-4 py-5 text-center ${className}`}
      style={{ borderColor: accent }}
    >
      {children}
    </div>
  );
}
