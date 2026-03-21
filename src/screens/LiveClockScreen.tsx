import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmModal } from '../components/ConfirmModal';
import { StatCard } from '../components/StatCard';
import { formatCurrencyGBP, formatNumber, formatSeconds } from '../lib/format';
import { calcCurrentChips, calcCurrentPrizePool, getRebuyRemainingSeconds, getTimeline } from '../lib/tournament';
import { LiveTournamentState } from '../types/tournament';

interface Props {
  state: LiveTournamentState;
  nowMs: number;
  onPauseToggle: () => void;
  onNextLevel: () => void;
  onPrevLevel: () => void;
  onPlayerOut: () => void;
  onPlayerRebuy: () => void;
  onToggleSound: () => void;
}

export function LiveClockScreen({ state, nowMs, onPauseToggle, onNextLevel, onPrevLevel, onPlayerOut, onPlayerRebuy, onToggleSound }: Props): JSX.Element {
  const [confirmOut, setConfirmOut] = useState(false);
  const [confirmRebuy, setConfirmRebuy] = useState(false);
  const timeline = useMemo(() => getTimeline(state, nowMs), [state, nowMs]);
  const current = state.setup.levels[timeline.levelIndex];
  const next = state.setup.levels[timeline.levelIndex + 1] ?? null;
  const prizePool = calcCurrentPrizePool(state);
  const chips = calcCurrentChips(state);
  const average = chips / Math.max(state.playersRemaining, 1);
  const rebuyRemaining = getRebuyRemainingSeconds(state);
  const rebuyOpen = rebuyRemaining > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Live Clock</h1>
        <div className="text-xs text-muted">{state.paused ? 'Paused' : 'Running'}</div>
      </header>

      <Card className="text-center">
        <div className="text-xs uppercase tracking-wide text-muted">Level {timeline.levelIndex + 1}</div>
        <div className="mt-1 text-4xl font-bold text-white">{formatNumber(current.smallBlind)} / {formatNumber(current.bigBlind)}</div>
        <div className={`mt-3 font-mono text-6xl font-bold ${timeline.levelRemainingSeconds <= 10 ? 'text-warning' : 'text-accent'}`}>{formatSeconds(timeline.levelRemainingSeconds)}</div>
        <div className="mt-2 text-sm text-muted">Next: {next ? `${formatNumber(next.smallBlind)} / ${formatNumber(next.bigBlind)}` : 'Final level loop'}</div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Prize Pool" value={formatCurrencyGBP(prizePool)} />
        <StatCard label="Players Left" value={String(state.playersRemaining)} />
        <StatCard label="Average Stack" value={formatNumber(average)} />
        <StatCard label="Chips in Play" value={formatNumber(chips)} />
      </div>

      <Card>
        <div className="text-sm">Rebuy Status</div>
        <div className={`mt-1 text-lg font-semibold ${rebuyOpen ? 'text-success' : 'text-danger'}`}>{rebuyOpen ? `Open (${formatSeconds(rebuyRemaining)} left)` : 'Rebuy Closed'}</div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-white">Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="danger" onClick={() => setConfirmOut(true)} disabled={state.playersRemaining <= 1}>Player Out</Button>
          <Button variant="success" onClick={() => setConfirmRebuy(true)} disabled={!rebuyOpen}>Player Rebuy</Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-white">Controls</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="secondary" onClick={onPauseToggle}>{state.paused ? 'Resume' : 'Pause'}</Button>
          <Button variant="secondary" onClick={onPrevLevel}>Previous</Button>
          <Button variant="secondary" onClick={onNextLevel}>Next</Button>
          <Button variant="secondary" onClick={onToggleSound}>{state.setup.soundEnabled ? 'Mute' : 'Unmute'}</Button>
        </div>
      </Card>

      <ConfirmModal
        open={confirmOut}
        title="Confirm Player Out"
        message="Remove one player from the remaining count?"
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          onPlayerOut();
          setConfirmOut(false);
        }}
        tone="danger"
      />

      <ConfirmModal
        open={confirmRebuy}
        title="Confirm Rebuy"
        message={rebuyOpen ? 'Add one rebuy (player + stack + buy-in) now?' : 'Rebuy window has closed.'}
        onCancel={() => setConfirmRebuy(false)}
        onConfirm={() => {
          if (rebuyOpen) onPlayerRebuy();
          setConfirmRebuy(false);
        }}
        confirmLabel="Yes"
      />
    </main>
  );
}
