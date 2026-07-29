'use client';

interface CelebrationMessageProps {
  size: 'small' | 'medium' | 'large';
  label?: string;
}

const CELEBRATIONS = {
  small: {
    icon: '⭐',
    messages: ['Great job!', 'Nice!', 'Well done!', 'Awesome!', 'Super!'],
    className: 'bg-green/10 border-green/30',
  },
  medium: {
    icon: '⭐⭐',
    messages: ['Amazing!', 'Fantastic!', 'Wonderful!', 'You\'re on fire!', 'Brilliant!'],
    className: 'bg-indigo/10 border-indigo/30',
  },
  large: {
    icon: '🎉🎊',
    messages: ['Incredible!', 'Outstanding!', 'You\'re a Math Champion!', 'Phenomenal!', 'Extraordinary!'],
    className: 'bg-orange/10 border-orange/30',
  },
};

export function CelebrationMessage({ size, label }: CelebrationMessageProps) {
  const config = CELEBRATIONS[size];
  const message = label ?? config.messages[Math.floor(Math.random() * config.messages.length)];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-lg" aria-hidden="true">{config.icon}</span>
      <span className="font-display text-sm font-bold text-text-primary">{message}</span>
    </div>
  );
}

export const WRONG_ANSWER_MESSAGES = [
  'Nice try! Let\'s solve it together.',
  'Almost there! Try again!',
  'Good effort! Let\'s figure this out.',
];

export const ENCOURAGEMENT_MESSAGES = [
  'Keep going! You\'ve got this!',
  'Every question makes you stronger!',
  'You\'re doing great — keep trying!',
  'Math Explorers never give up!',
];

export function getWrongAnswerMessage(): string {
  return WRONG_ANSWER_MESSAGES[Math.floor(Math.random() * WRONG_ANSWER_MESSAGES.length)];
}

export function getEncouragementMessage(): string {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

export const LEVEL_UP_MESSAGES = [
  'You\'re leveling up your math skills!',
  'Getting stronger every question!',
  'You\'re becoming a math master!',
];
