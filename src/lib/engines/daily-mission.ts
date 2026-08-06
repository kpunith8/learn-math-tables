import { DailyMission, MissionTask } from './types';

const MISSION_TEMPLATES: Array<() => MissionTask[]> = [
  () => [
    { description: 'Solve 5 addition questions', descriptionKey: 'missions.template1.0', type: 'practice', target: 5, progress: 0, completed: false },
    { description: 'Review one times table', descriptionKey: 'missions.template1.1', type: 'review', target: 1, progress: 0, completed: false },
    { description: 'Complete one challenge', descriptionKey: 'missions.template1.2', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  () => [
    { description: 'Solve 3 multiplication questions', descriptionKey: 'missions.template2.0', type: 'practice', target: 3, progress: 0, completed: false },
    { description: 'Try a subtraction challenge', descriptionKey: 'missions.template2.1', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  () => [
    { description: 'Practice for 5 minutes', descriptionKey: 'missions.template3.0', type: 'practice', target: 5, progress: 0, completed: false },
    { description: 'Complete a quiz', descriptionKey: 'missions.template3.1', type: 'challenge', target: 1, progress: 0, completed: false },
  ],
  () => [
    { description: 'Solve 3 division questions', descriptionKey: 'missions.template4.0', type: 'practice', target: 3, progress: 0, completed: false },
    { description: 'Review 2 weak facts', descriptionKey: 'missions.template4.1', type: 'review', target: 2, progress: 0, completed: false },
  ],
  () => [
    { description: 'Solve 8 questions in any topic', descriptionKey: 'missions.template5.0', type: 'practice', target: 8, progress: 0, completed: false },
  ],
  () => [
    { description: 'Complete a full lesson (learn + practice)', descriptionKey: 'missions.template6.0', type: 'practice', target: 1, progress: 0, completed: false },
    { description: 'Earn 5 stars', descriptionKey: 'missions.template6.1', type: 'challenge', target: 5, progress: 0, completed: false },
  ],
  () => [
    { description: 'Practice 4 different operations', descriptionKey: 'missions.template7.0', type: 'practice', target: 4, progress: 0, completed: false },
    { description: 'Get 3 answers right in a row', descriptionKey: 'missions.template7.1', type: 'challenge', target: 3, progress: 0, completed: false },
  ],
];

export function generateDailyMission(): DailyMission {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b, 10), 0);
  const templateIndex = seed % MISSION_TEMPLATES.length;
  const tasks = MISSION_TEMPLATES[templateIndex]();

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

const TEMPLATE_BY_DESCRIPTION: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  MISSION_TEMPLATES.forEach((makeTasks, templateIndex) => {
    makeTasks().forEach((task, taskIndex) => {
      map[task.description] = `missions.template${templateIndex + 1}.${taskIndex}`;
    });
  });
  return map;
})();

export function ensureDescriptionKeys(mission: DailyMission): DailyMission {
  const needsMigration = mission.tasks.some((t) => !t.descriptionKey);
  if (!needsMigration) return mission;
  return {
    ...mission,
    tasks: mission.tasks.map((task) =>
      task.descriptionKey ? task : { ...task, descriptionKey: TEMPLATE_BY_DESCRIPTION[task.description] }
    ),
  };
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
