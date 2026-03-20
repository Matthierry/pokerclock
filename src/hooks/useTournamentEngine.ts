import { useEffect, useMemo, useState } from 'react';
import { BLIND_PRESETS } from '../config/blindPresets';
import { playLevelUpAlert } from '../lib/sound';
import { loadState, saveState } from '../lib/storage';
import { getElapsedMs, getTimeline } from '../lib/tournament';
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

export function useTournamentEngine() {
  const [appState, setAppState] = useState<PersistedAppState>(() => loadState() ?? defaultState);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const liveState = appState.liveState;

  const autoAdvanceAnchor = useMemo(() => {
    if (!liveState || liveState.paused || liveState.completed) return null;
    const timeline = getTimeline(liveState);
    return timeline.levelIndex;
  }, [liveState, tick]);

  useEffect(() => {
    if (!liveState || liveState.paused || liveState.completed) return;
    const timeline = getTimeline(liveState);
    if (timeline.levelIndex !== liveState.currentLevelIndex) {
      setAppState((prev) => {
        if (!prev.liveState) return prev;
        const next = { ...prev.liveState, currentLevelIndex: timeline.levelIndex };
        if (next.setup.soundEnabled && timeline.levelIndex > prev.liveState.currentLevelIndex) playLevelUpAlert();
        return { ...prev, liveState: next };
      });
    }
  }, [tick, liveState, autoAdvanceAnchor]);

  const setSetup = (setup: TournamentSetup): void => setAppState((prev) => ({ ...prev, setupDraft: setup }));

  const startTournament = (): void => {
    const now = Date.now();
    const live: LiveTournamentState = {
      setup: appState.setupDraft,
      startedAt: now,
      elapsedMsBeforePause: 0,
      lastResumedAt: now,
      paused: false,
      currentLevelIndex: 0,
      playersRemaining: appState.setupDraft.players,
      rebuys: 0,
      completed: false,
      completedAt: null
    };
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
            elapsedMsBeforePause: getElapsedMs(updated, end),
            lastResumedAt: null
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
        return { ...state, paused: false, lastResumedAt: now };
      }
      return { ...state, paused: true, elapsedMsBeforePause: getElapsedMs(state, now), lastResumedAt: null };
    });
  };

  const nextLevel = (): void => {
    updateLive((state) => {
      const next = Math.min(state.setup.levels.length - 1, state.currentLevelIndex + 1);
      const consumed = state.setup.levels.slice(0, next).reduce((sum, x) => sum + x.durationMinutes, 0) * 60000;
      const now = Date.now();
      return { ...state, currentLevelIndex: next, elapsedMsBeforePause: consumed, lastResumedAt: state.paused ? null : now };
    });
  };

  const prevLevel = (): void => {
    updateLive((state) => {
      const prevIndex = Math.max(0, state.currentLevelIndex - 1);
      const consumed = state.setup.levels.slice(0, prevIndex).reduce((sum, x) => sum + x.durationMinutes, 0) * 60000;
      const now = Date.now();
      return { ...state, currentLevelIndex: prevIndex, elapsedMsBeforePause: consumed, lastResumedAt: state.paused ? null : now };
    });
  };

  const playerOut = (): void => updateLive((state) => ({ ...state, playersRemaining: Math.max(1, state.playersRemaining - 1) }));

  const playerRebuy = (): void => {
    updateLive((state) => {
      const rebuyLimitMs = state.setup.rebuyWindowMinutes * 60000;
      if (getElapsedMs(state) > rebuyLimitMs) return state;
      return { ...state, playersRemaining: state.playersRemaining + 1, rebuys: state.rebuys + 1 };
    });
  };

  const toggleSound = (): void => updateLive((state) => ({ ...state, setup: { ...state.setup, soundEnabled: !state.setup.soundEnabled } }));

  const reset = (): void => setAppState({ screen: 'setup', setupDraft: defaultSetup, liveState: null });

  return {
    screen: appState.screen as AppScreen,
    setup: appState.setupDraft,
    liveState: appState.liveState,
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
