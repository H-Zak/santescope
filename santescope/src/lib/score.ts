// Score inversion: raw score = higher = more vulnerable
// Display score = higher = better health (more intuitive)
const SCORE_MIN = 2.5;
const SCORE_MAX = 7.7;

export function toHealthScore(vulnScore: number): number {
  const normalized = (vulnScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const inverted = (1 - normalized) * 10;
  return Math.round(inverted * 10) / 10; // 1 decimal
}
