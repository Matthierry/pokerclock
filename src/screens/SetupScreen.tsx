import { ChangeEvent } from 'react';
import { BLIND_PRESETS } from '../config/blindPresets';
import { estimateTournamentMinutes } from '../lib/estimate';
import { formatCurrencyGBP, formatDuration, formatNumber } from '../lib/format';
import { BlindPresetKey, TournamentSetup } from '../types/tournament';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NumericStepper } from '../components/NumericStepper';

interface Props {
  setup: TournamentSetup;
  onChange: (setup: TournamentSetup) => void;
  onStart: () => void;
}

export function SetupScreen({ setup, onChange, onStart }: Props): JSX.Element {
  const preset = BLIND_PRESETS[setup.preset];
  const startChips = setup.players * setup.startingStack;
  const startPool = setup.players * setup.buyIn;
  const estimated = estimateTournamentMinutes({
    levels: setup.levels,
    players: setup.players,
    startingStack: setup.startingStack,
    rebuyWindowMinutes: setup.rebuyWindowMinutes
  });

  const update = <K extends keyof TournamentSetup>(key: K, value: TournamentSetup[K]) => onChange({ ...setup, [key]: value });

  const onPresetChange = (key: BlindPresetKey): void => {
    const presetCfg = BLIND_PRESETS[key];
    onChange({ ...setup, preset: key, levels: presetCfg.levels.map((l) => ({ ...l })), rebuyWindowMinutes: presetCfg.defaultRebuyWindowMinutes });
  };

  const updateLevel = (index: number, field: 'smallBlind' | 'bigBlind' | 'durationMinutes', value: number): void => {
    const levels = setup.levels.map((level, i) => (i === index ? { ...level, [field]: value } : level));
    onChange({ ...setup, levels });
  };

  const addLevel = (): void => onChange({ ...setup, levels: [...setup.levels, { smallBlind: 1200, bigBlind: 2400, durationMinutes: 15 }] });
  const removeLevel = (index: number): void => onChange({ ...setup, levels: setup.levels.filter((_, i) => i !== index) });

  const numeric = (event: ChangeEvent<HTMLInputElement>, fallback: number): number => {
    const next = Number.parseInt(event.target.value, 10);
    return Number.isFinite(next) ? next : fallback;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Poker Match Clock</h1>
        <p className="text-sm text-muted">Configure your single-table Texas Hold'em home game.</p>
      </header>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-white">Tournament Setup</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumericStepper
            label="Players"
            value={setup.players}
            onChange={(value) => update('players', value)}
            min={2}
            max={10}
            step={1}
            helperText="2-10"
          />
          <NumericStepper
            label="Starting Stack"
            value={setup.startingStack}
            onChange={(value) => update('startingStack', value)}
            min={1000}
            max={20000}
            step={500}
            unit="chips"
          />
          <NumericStepper
            label="Buy-in"
            value={setup.buyIn}
            onChange={(value) => update('buyIn', value)}
            min={5}
            max={500}
            step={5}
            unit="£"
          />
          <NumericStepper
            label="Rebuy Window"
            value={setup.rebuyWindowMinutes}
            onChange={(value) => update('rebuyWindowMinutes', value)}
            min={0}
            max={240}
            step={5}
            unit="mins"
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-borderTone bg-bgSecondary p-3">
          <span>Sound Alerts</span>
          <button className={`rounded-full px-3 py-1 text-sm ${setup.soundEnabled ? 'bg-success text-bg' : 'bg-borderTone'}`} onClick={() => update('soundEnabled', !setup.soundEnabled)}>{setup.soundEnabled ? 'On' : 'Off'}</button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-white">Blind Speed Preset</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(BLIND_PRESETS) as BlindPresetKey[]).map((key) => (
            <Button key={key} variant={setup.preset === key ? 'primary' : 'secondary'} onClick={() => onPresetChange(key)}>
              {BLIND_PRESETS[key].name}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Blind Structure</h2>
          <Button variant="secondary" onClick={addLevel}>Add Level</Button>
        </div>
        <div className="space-y-2">
          {setup.levels.map((level, index) => (
            <div key={`${index}-${level.smallBlind}-${level.bigBlind}`} className="grid grid-cols-12 gap-2 rounded-xl border border-borderTone bg-bgSecondary p-2">
              <div className="col-span-2 text-xs text-muted">L{index + 1}</div>
              <input className="col-span-3 rounded bg-bg p-2 text-sm" type="number" inputMode="numeric" value={level.smallBlind} onChange={(e) => updateLevel(index, 'smallBlind', Math.max(1, numeric(e, level.smallBlind)))} />
              <input className="col-span-3 rounded bg-bg p-2 text-sm" type="number" inputMode="numeric" value={level.bigBlind} onChange={(e) => updateLevel(index, 'bigBlind', Math.max(1, numeric(e, level.bigBlind)))} />
              <input className="col-span-3 rounded bg-bg p-2 text-sm" type="number" inputMode="numeric" value={level.durationMinutes} onChange={(e) => updateLevel(index, 'durationMinutes', Math.max(1, numeric(e, level.durationMinutes)))} />
              <button className="col-span-1 text-danger" onClick={() => removeLevel(index)} aria-label={`Remove level ${index + 1}`}>✕</button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-semibold text-white">Pre-start Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Players: <strong>{setup.players}</strong></p>
          <p>Starting Stack: <strong>{formatNumber(setup.startingStack)}</strong></p>
          <p>Buy-in: <strong>{formatCurrencyGBP(setup.buyIn)}</strong></p>
          <p>Structure: <strong>{preset.name}</strong></p>
          <p>Rebuy Window: <strong>{formatDuration(setup.rebuyWindowMinutes)}</strong></p>
          <p>Starting Chips: <strong>{formatNumber(startChips)}</strong></p>
          <p>Starting Prize Pool: <strong>{formatCurrencyGBP(startPool)}</strong></p>
          <p>Estimated Duration: <strong>{formatDuration(estimated)}</strong></p>
        </div>
      </Card>

      <Button className="w-full" onClick={onStart}>Start Tournament</Button>
    </main>
  );
}
