import { CompleteScreen } from './screens/CompleteScreen';
import { LiveClockScreen } from './screens/LiveClockScreen';
import { SetupScreen } from './screens/SetupScreen';
import { useTournamentEngine } from './hooks/useTournamentEngine';

function App(): JSX.Element {
  const engine = useTournamentEngine();

  if (engine.screen === 'live' && engine.liveState) {
    return (
      <LiveClockScreen
        state={engine.liveState}
        onPauseToggle={engine.pauseToggle}
        onNextLevel={engine.nextLevel}
        onPrevLevel={engine.prevLevel}
        onPlayerOut={engine.playerOut}
        onPlayerRebuy={engine.playerRebuy}
        onToggleSound={engine.toggleSound}
      />
    );
  }

  if (engine.screen === 'complete' && engine.liveState) {
    return <CompleteScreen state={engine.liveState} onReset={engine.reset} />;
  }

  return <SetupScreen setup={engine.setup} onChange={engine.setSetup} onStart={engine.startTournament} />;
}

export default App;
