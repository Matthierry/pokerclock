import { LiveTournamentState, TournamentSetup } from '../types/tournament';

export const calcInitialPrizePool = (setup: TournamentSetup): number => setup.players * setup.buyIn;
export const calcInitialChips = (setup: TournamentSetup): number => setup.players * setup.startingStack;

export const calcCurrentPrizePool = (state: LiveTournamentState): number => calcInitialPrizePool(state.setup) + state.rebuys * state.setup.buyIn;
export const calcCurrentChips = (state: LiveTournamentState): number => calcInitialChips(state.setup) + state.rebuys * state.setup.startingStack;

export function getElapsedMs(state: LiveTournamentState, now = Date.now()): number {
  const pausedMs = state.paused && state.pausedAtTimestamp ? now - state.pausedAtTimestamp : 0;
  return Math.max(0, now - state.startedAt - state.accumulatedPausedMs - pausedMs);
}

export function getTimeline(state: LiveTournamentState, now = Date.now()): {
  elapsedMs: number;
  levelIndex: number;
  levelRemainingSeconds: number;
} {
  const elapsedMs = getElapsedMs(state, now);
  const level = state.setup.levels[state.currentLevelIndex];
  const levelDurationMs = level.durationMinutes * 60_000;
  const levelElapsedMs = Math.max(0, elapsedMs - state.levelStartElapsedMsTotal);
  const levelRemainingSeconds = Math.max(0, Math.ceil((levelDurationMs - levelElapsedMs) / 1000));
  return { elapsedMs, levelIndex: state.currentLevelIndex, levelRemainingSeconds };
}

export const getRebuyRemainingSeconds = (state: LiveTournamentState, now = Date.now()): number =>
  Math.max(0, Math.ceil((state.setup.rebuyWindowMinutes * 60_000 - getElapsedMs(state, now)) / 1000));
