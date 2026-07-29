import { DailyMission, MissionTask } from './types';

const MISSION_TEMPLATES: Array<(playerName: string) => MissionTask[]> = [
  (name) => [
    { description: 'Solve 5 addition questions', type: 'practice', target: 5, progress: 0, completed: false },
    { description: 'Review one times table', type: 'review', target: 1, progress: 0, completed: false },
    { description: 'Complete one challenge', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Solve 3 multiplication questions', type: 'practice', target: 3, progress: 0, completed: false },
    { description: 'Try a subtraction challenge', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Practice for 5 minutes', type: 'practice', target: 5, progress: 0, completed: false },
    { description: 'Complete a quiz', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Solve 3 division questions', type: 'practice', target: 3, progress: 0, completed: false },
    { description: 'Review 2 weak facts', type: 'review', target: 2, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Solve 8 questions in any topic', type: 'practice', target: 8, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Complete a full lesson (learn + practice)', type: 'practice', target: 1, progress: 0, completed: false },
    { description: 'Earn 5 stars', type: 'challenge', target: 5, progress: 0, completed: false },
  ],
  (name) => [
    { description: 'Practice 4 different operations', type: 'practice', target: 4, progress: 0, completed: false },
    { description: 'Get 3 answers right in a row', type: 'challenge', target: 3, progress: 0, completed: false },
  ],
];

export function generateDailyMission(playerName: string): DailyMission {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b, 10), 0);
  const templateIndex = seed % MISSION_TEMPLATES.length;
  const tasks = MISSION_TEMPLATES[templateIndex](playerName);

  return {
    generatedDate: today,
    tasks,
    completed: false,
    starsAwarded: false,
  };
}

export function isMissionExpired(mission: DailyMission): boolean {
  return mission.generatedDate < new Date().toISOString().split('T')[0];
}

export function isMissionComplete(mission: DailyMission): boolean {
  return mission.tasks.every((t) => t.completed);
}

export function updateMissionProgress(
  mission: DailyMission,
  type: MissionTask['type'],
  increment = 1
): DailyMission {
  const tasks = mission.tasks.map((task) => {
    if (task.type === type && !task.completed) {
      const progress = task.progress + increment;
      return { ...task, progress, completed: progress >= task.target };
    }
    return task;
  });
  return {
    ...mission,
    tasks,
    completed: tasks.every((t) => t.completed),
  };
}
