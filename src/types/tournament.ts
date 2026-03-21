export type BlindPresetKey = 'turbo' | 'average' | 'long';

export interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
  durationMinutes: number;
}

export interface TournamentSetup {
  players: number;
  startingStack: number;
  buyIn: number;
  preset: BlindPresetKey;
  levels: BlindLevel[];
  rebuyWindowMinutes: number;
  soundEnabled: boolean;
}

export interface LiveTournamentState {
  setup: TournamentSetup;
  startedAt: number;
  levelStartTimestamp: number;
  levelStartElapsedMsTotal: number;
  pausedAtTimestamp: number | null;
  accumulatedPausedMs: number;
  paused: boolean;
  currentLevelIndex: number;
  playersRemaining: number;
  rebuys: number;
  completed: boolean;
  completedAt: number | null;
}

export type AppScreen = 'setup' | 'live' | 'complete';

export interface PersistedAppState {
  screen: AppScreen;
  setupDraft: TournamentSetup;
  liveState: LiveTournamentState | null;
}
