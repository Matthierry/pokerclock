import { useEffect, useMemo, useState } from 'react';
import { BLIND_PRESETS } from '../config/blindPresets';
import { playLevelUpAlert, primeLevelUpAudio } from '../lib/sound';
import { loadState, saveState } from '../lib/storage';
import { getElapsedMs } from '../lib/tournament';
import { AppScreen, LiveTournamentState, PersistedAppState, TournamentSetup } from '../types/tournament';

const defaultSetup: TournamentSetup = {
  players: 6,
  startingStack: 3000,
  buyIn: 10,
  preset: 'average',
  levels: BLIND_PRESETS.average.levels.map((level) => ({ ...level })),
  rebuyWindowMinutes: BLIND_PRESETS.average.defaultRebuyWindowMinutes,
  soundEnabled: true
};

const defaultState: PersistedAppState = {
  screen: 'setup',
  setupDraft: defaultSetup,
  liveState: null
};

function getEffectiveNow(state: LiveTournamentState, now = Date.now()): number {
  if (state.paused && state.pausedAtTimestamp) return state.pausedAtTimestamp;
  return now;
}

function getLevelRemainingMs(state: LiveTournamentState, now = Date.now()): number {
  const elapsed = getElapsedMs(state, getEffectiveNow(state, now));
  const levelElapsed = Math.max(0, elapsed - state.levelStartElapsedMsTotal);
  const durationMs = state.setup.levels[state.currentLevelIndex].durationMinutes * 60_000;
  return durationMs - levelElapsed;
}

function migrateState(state: PersistedAppState): PersistedAppState {
  if (!state.liveState) return state;
  const live = state.liveState as LiveTournamentState & {
    elapsedMsBeforePause?: number;
    lastResumedAt?: number | null;
  };
  if (typeof live.levelStartTimestamp === 'number' && typeof live.levelStartElapsedMsTotal === 'number') return state;

  const now = Date.now();
  const elapsedMsBeforePause = typeof live.elapsedMsBeforePause === 'number' ? live.elapsedMsBeforePause : 0;
  const lastResumedAt = typeof live.lastResumedAt === 'number' ? live.lastResumedAt : null;
  const effectiveElapsed = live.paused || lastResumedAt === null ? elapsedMsBeforePause : elapsedMsBeforePause + (now - lastResumedAt);
  const levelStartElapsedMsTotal = live.setup.levels.slice(0, live.currentLevelIndex).reduce((sum, x) => sum + x.durationMinutes, 0) * 60_000;

  return {
    ...state,
    liveState: {
      ...live,
      startedAt: now - effectiveElapsed,
      levelStartTimestamp: now,
      levelStartElapsedMsTotal,
      pausedAtTimestamp: live.paused ? now : null,
      accumulatedPausedMs: 0
    }
  };
}

export function useTournamentEngine() {
  const [appState, setAppState] = useState<PersistedAppState>(() => {
    const loaded = loadState();
    return loaded ? migrateState(loaded) : defaultState;
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const liveState = appState.liveState;
  const autoAdvanceAnchor = useMemo(() => {
    if (!liveState || liveState.paused || liveState.completed) return null;
    return `${liveState.currentLevelIndex}:${Math.floor(getLevelRemainingMs(liveState, nowMs) / 1000)}`;
  }, [liveState, nowMs]);

  useEffect(() => {
    if (!liveState || liveState.paused || liveState.completed) return;
    if (getLevelRemainingMs(liveState, nowMs) > 0) return;

    setAppState((prev) => {
      if (!prev.liveState || prev.liveState.paused || prev.liveState.completed) return prev;
      const current = prev.liveState;
      if (getLevelRemainingMs(current) > 0) return prev;

      const nextLevelIndex = Math.min(current.setup.levels.length - 1, current.currentLevelIndex + 1);
      const elapsedNow = getElapsedMs(current);
      if (current.setup.soundEnabled && nextLevelIndex > current.currentLevelIndex) {
        playLevelUpAlert();
      }

      return {
        ...prev,
        liveState: {
          ...current,
          currentLevelIndex: nextLevelIndex,
          levelStartTimestamp: Date.now(),
          levelStartElapsedMsTotal: elapsedNow,
          pausedAtTimestamp: null
        }
      };
    });
  }, [liveState, nowMs, autoAdvanceAnchor]);

  const setSetup = (setup: TournamentSetup): void => setAppState((prev) => ({ ...prev, setupDraft: setup }));

  const startTournament = (): void => {
    const now = Date.now();
    const live: LiveTournamentState = {
      setup: appState.setupDraft,
      startedAt: now,
      levelStartTimestamp: now,
      levelStartElapsedMsTotal: 0,
      pausedAtTimestamp: null,
      accumulatedPausedMs: 0,
      paused: false,
      currentLevelIndex: 0,
      playersRemaining: appState.setupDraft.players,
      rebuys: 0,
      completed: false,
      completedAt: null
    };
    primeLevelUpAudio();
    setAppState((prev) => ({ ...prev, screen: 'live', liveState: live }));
  };

  const updateLive = (updater: (state: LiveTournamentState) => LiveTournamentState): void => {
    setAppState((prev) => {
      if (!prev.liveState) return prev;
      const updated = updater(prev.liveState);
      const completed = updated.playersRemaining <= 1;
      if (completed && !updated.completed) {
        const end = Date.now();
        return {
          ...prev,
          screen: 'complete',
          liveState: {
            ...updated,
            completed: true,
            completedAt: end,
            paused: true,
            pausedAtTimestamp: end
          }
        };
      }
      return { ...prev, liveState: updated };
    });
  };

  const pauseToggle = (): void => {
    updateLive((state) => {
      const now = Date.now();
      if (state.paused) {
        const pauseDelta = state.pausedAtTimestamp ? now - state.pausedAtTimestamp : 0;
        return {
          ...state,
          paused: false,
          pausedAtTimestamp: null,
          accumulatedPausedMs: state.accumulatedPausedMs + Math.max(0, pauseDelta)
        };
      }
      return { ...state, paused: true, pausedAtTimestamp: now };
    });
  };

  const nextLevel = (): void => {
    updateLive((state) => {
      const next = Math.min(state.setup.levels.length - 1, state.currentLevelIndex + 1);
      if (next > state.currentLevelIndex && state.setup.soundEnabled) playLevelUpAlert();
      const elapsedNow = getElapsedMs(state, getEffectiveNow(state));
      return {
        ...state,
        currentLevelIndex: next,
        levelStartTimestamp: Date.now(),
        levelStartElapsedMsTotal: elapsedNow
      };
    });
  };

  const prevLevel = (): void => {
    updateLive((state) => {
      const prevIndex = Math.max(0, state.currentLevelIndex - 1);
      const elapsedNow = getElapsedMs(state, getEffectiveNow(state));
      return {
        ...state,
        currentLevelIndex: prevIndex,
        levelStartTimestamp: Date.now(),
        levelStartElapsedMsTotal: elapsedNow
      };
    });
  };

  const playerOut = (): void => updateLive((state) => ({ ...state, playersRemaining: Math.max(1, state.playersRemaining - 1) }));

  const playerRebuy = (): void => {
    updateLive((state) => {
      const rebuyLimitMs = state.setup.rebuyWindowMinutes * 60000;
      if (getElapsedMs(state, getEffectiveNow(state)) > rebuyLimitMs) return state;
      return { ...state, playersRemaining: state.playersRemaining + 1, rebuys: state.rebuys + 1 };
    });
  };

  const toggleSound = (): void => updateLive((state) => ({ ...state, setup: { ...state.setup, soundEnabled: !state.setup.soundEnabled } }));

  const reset = (): void => setAppState({ screen: 'setup', setupDraft: defaultSetup, liveState: null });

  return {
    screen: appState.screen as AppScreen,
    setup: appState.setupDraft,
    liveState: appState.liveState,
    nowMs,
    setSetup,
    startTournament,
    pauseToggle,
    nextLevel,
    prevLevel,
    playerOut,
    playerRebuy,
    toggleSound,
    reset
  };
}
