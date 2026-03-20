import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatCurrencyGBP, formatDuration } from '../lib/format';
import { calcCurrentPrizePool, getElapsedMs, getTimeline } from '../lib/tournament';
import { LiveTournamentState } from '../types/tournament';

interface Props {
  state: LiveTournamentState;
  onReset: () => void;
}

export function CompleteScreen({ state, onReset }: Props): JSX.Element {
  const duration = Math.round(getElapsedMs(state, state.completedAt ?? Date.now()) / 60000);
  const finalLevel = getTimeline(state, state.completedAt ?? Date.now()).levelIndex + 1;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-8">
      <Card>
        <h1 className="text-2xl font-bold text-white">Tournament Complete</h1>
        <p className="mt-1 text-sm text-muted">Your home game has finished.</p>
      </Card>
      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>Starting Players: <strong>{state.setup.players}</strong></p>
          <p>Total Rebuys: <strong>{state.rebuys}</strong></p>
          <p>Final Prize Pool: <strong>{formatCurrencyGBP(calcCurrentPrizePool(state))}</strong></p>
          <p>Total Duration: <strong>{formatDuration(duration)}</strong></p>
          <p>Final Level Reached: <strong>{finalLevel}</strong></p>
          <p>Starting Stack: <strong>{state.setup.startingStack}</strong></p>
          <p>Buy-in: <strong>{formatCurrencyGBP(state.setup.buyIn)}</strong></p>
          <p>Structure: <strong>{state.setup.preset}</strong></p>
        </div>
      </Card>
      <Button onClick={onReset}>Start New Tournament</Button>
    </main>
  );
}
