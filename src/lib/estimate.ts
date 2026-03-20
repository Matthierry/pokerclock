import { BlindLevel } from '../types/tournament';

/**
 * Home-game estimate heuristic, not a mathematically exact tournament predictor.
 * It starts from a pressure-point schedule and applies small multipliers for:
 * player count, rebuy window, and likely casual rebuy chip inflation.
 */
export function estimateTournamentMinutes(input: {
  levels: BlindLevel[];
  players: number;
  startingStack: number;
  rebuyWindowMinutes: number;
}): number {
  const totalStructure = input.levels.reduce((sum, level) => sum + level.durationMinutes, 0);
  const pressurePoint = Math.round(totalStructure * 0.8);

  const playerFactor = 1 + Math.max(0, input.players - 6) * 0.035;
  const rebuyWindowFactor = 1 + Math.max(0, input.rebuyWindowMinutes - 60) / 600;

  const baselineStack = input.players * input.startingStack;
  const expectedRebuyChips = Math.max(1, Math.round(input.players * 0.3)) * input.startingStack;
  const chipInflationFactor = 1 + expectedRebuyChips / (baselineStack * 8);

  return Math.round(pressurePoint * playerFactor * rebuyWindowFactor * chipInflationFactor);
}
