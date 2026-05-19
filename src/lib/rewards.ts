
/**
 * Turfista Rewards Logic
 * Points:
 * signup +20
 * booking +50
 * review +15
 * invite friend +100
 * challenge win +40
 */

export const REWARD_POINTS = {
  SIGNUP: 20,
  BOOKING: 50,
  REVIEW: 15,
  INVITE: 100,
  WIN: 40
};

export const LEVELS = [
  { name: 'Rookie', min: 0, max: 100, color: 'text-muted-foreground' },
  { name: 'Player', min: 101, max: 500, color: 'text-blue-500' },
  { name: 'Pro', min: 501, max: 1000, color: 'text-primary' },
  { name: 'Legend', min: 1001, max: Infinity, color: 'text-yellow-500' }
];

export function calculateLevel(points: number) {
  return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
}

export function getProgressToNextLevel(points: number) {
  const current = calculateLevel(points);
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  if (!next) return 100;
  
  const range = next.min - current.min;
  const progress = points - current.min;
  return Math.min(100, Math.round((progress / range) * 100));
}
