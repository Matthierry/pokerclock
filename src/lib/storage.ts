import { PersistedAppState } from '../types/tournament';

const KEY = 'poker-match-clock-state-v1';

export function saveState(state: PersistedAppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState(): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}
