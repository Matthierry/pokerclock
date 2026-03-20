import { LiveTournamentState, TournamentSetup } from '../types/tournament';

export const calcInitialPrizePool = (setup: TournamentSetup): number => setup.players * setup.buyIn;
export const calcInitialChips = (setup: TournamentSetup): number => setup.players * setup.startingStack;

export const calcCurrentPrizePool = (state: LiveTournamentState): number => calcInitialPrizePool(state.setup) + state.rebuys * state.setup.buyIn;
export const calcCurrentChips = (state: LiveTournamentState): number => calcInitialChips(state.setup) + state.rebuys * state.setup.startingStack;

export function getElapsedMs(state: LiveTournamentState, now = Date.now()): number {
  if (state.paused || state.lastResumedAt === null) return state.elapsedMsBeforePause;
  return state.elapsedMsBeforePause + (now - state.lastResumedAt);
}

export function getTimeline(state: LiveTournamentState, now = Date.now()): {
  elapsedMs: number;
  levelIndex: number;
  levelRemainingSeconds: number;
} {
  const elapsedMs = getElapsedMs(state, now);
  const elapsedMinutes = elapsedMs / 60000;
  let consumed = 0;
  const levels = state.setup.levels;

  for (let i = 0; i < levels.length; i += 1) {
    const duration = levels[i].durationMinutes;
    const end = consumed + duration;
    if (elapsedMinutes < end) {
      const remaining = Math.ceil((end - elapsedMinutes) * 60);
      return { elapsedMs, levelIndex: i, levelRemainingSeconds: remaining };
    }
    consumed = end;
  }

  const last = levels.length - 1;
  const levelSeconds = levels[last].durationMinutes * 60;
  const overflow = Math.floor((elapsedMinutes - consumed) * 60);
  const loopRemaining = levelSeconds - (overflow % levelSeconds);
  return { elapsedMs, levelIndex: last, levelRemainingSeconds: loopRemaining };
}

export const getRebuyRemainingSeconds = (state: LiveTournamentState, now = Date.now()): number =>
  Math.max(0, Math.ceil((state.setup.rebuyWindowMinutes * 60_000 - getElapsedMs(state, now)) / 1000));
