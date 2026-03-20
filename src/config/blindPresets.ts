import { BlindLevel, BlindPresetKey } from '../types/tournament';

interface PresetConfig {
  name: string;
  defaultRebuyWindowMinutes: number;
  levels: BlindLevel[];
}

export const BLIND_PRESETS: Record<BlindPresetKey, PresetConfig> = {
  turbo: {
    name: 'Turbo',
    defaultRebuyWindowMinutes: 30,
    levels: [
      { smallBlind: 25, bigBlind: 50, durationMinutes: 10 },
      { smallBlind: 50, bigBlind: 100, durationMinutes: 10 },
      { smallBlind: 75, bigBlind: 150, durationMinutes: 10 },
      { smallBlind: 100, bigBlind: 200, durationMinutes: 10 },
      { smallBlind: 150, bigBlind: 300, durationMinutes: 10 },
      { smallBlind: 200, bigBlind: 400, durationMinutes: 10 },
      { smallBlind: 300, bigBlind: 600, durationMinutes: 10 },
      { smallBlind: 400, bigBlind: 800, durationMinutes: 10 },
      { smallBlind: 500, bigBlind: 1000, durationMinutes: 10 },
      { smallBlind: 1000, bigBlind: 2000, durationMinutes: 10 }
    ]
  },
  average: {
    name: 'Average',
    defaultRebuyWindowMinutes: 60,
    levels: [
      { smallBlind: 25, bigBlind: 50, durationMinutes: 15 },
      { smallBlind: 50, bigBlind: 100, durationMinutes: 15 },
      { smallBlind: 75, bigBlind: 150, durationMinutes: 15 },
      { smallBlind: 100, bigBlind: 200, durationMinutes: 15 },
      { smallBlind: 150, bigBlind: 300, durationMinutes: 15 },
      { smallBlind: 200, bigBlind: 400, durationMinutes: 15 },
      { smallBlind: 300, bigBlind: 600, durationMinutes: 15 },
      { smallBlind: 400, bigBlind: 800, durationMinutes: 15 },
      { smallBlind: 500, bigBlind: 1000, durationMinutes: 15 },
      { smallBlind: 600, bigBlind: 1200, durationMinutes: 15 },
      { smallBlind: 800, bigBlind: 1600, durationMinutes: 15 },
      { smallBlind: 1000, bigBlind: 2000, durationMinutes: 15 }
    ]
  },
  long: {
    name: 'Long',
    defaultRebuyWindowMinutes: 90,
    levels: [
      { smallBlind: 25, bigBlind: 50, durationMinutes: 20 },
      { smallBlind: 50, bigBlind: 100, durationMinutes: 20 },
      { smallBlind: 75, bigBlind: 150, durationMinutes: 20 },
      { smallBlind: 100, bigBlind: 200, durationMinutes: 20 },
      { smallBlind: 150, bigBlind: 300, durationMinutes: 20 },
      { smallBlind: 200, bigBlind: 400, durationMinutes: 20 },
      { smallBlind: 300, bigBlind: 600, durationMinutes: 20 },
      { smallBlind: 400, bigBlind: 800, durationMinutes: 20 },
      { smallBlind: 500, bigBlind: 1000, durationMinutes: 20 },
      { smallBlind: 600, bigBlind: 1200, durationMinutes: 20 },
      { smallBlind: 800, bigBlind: 1600, durationMinutes: 20 },
      { smallBlind: 1000, bigBlind: 2000, durationMinutes: 20 }
    ]
  }
};
