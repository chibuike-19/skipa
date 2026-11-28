// Dev toolbar for mock scenarios (brief §5). Only loaded when VITE_USE_MOCKS=true.
import {
  SCENARIOS,
  getScenario,
  isScenario,
  setScenario,
  type Scenario,
} from '@skipa/mocks/scenarios';

const CANVAS_URL = import.meta.env.VITE_CANVAS_URL;

export default function ScenarioBar() {
  const current = getScenario();
  return (
    <div className="fixed right-2 bottom-2 z-50 flex items-center gap-2 rounded-md bg-inverse px-3 py-2 text-inverse shadow-2">
      <label htmlFor="scenario" className="t-micro">
        Mocks
      </label>
      <select
        id="scenario"
        value={current}
        onChange={(e) => {
          if (isScenario(e.target.value)) {
            setScenario(e.target.value);
            location.reload();
          }
        }}
        className="t-micro rounded-sm bg-surface px-2 py-1 text-primary"
      >
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <option key={s} value={s} disabled={!SCENARIOS[s].built}>
            {s}
            {SCENARIOS[s].built ? '' : ' (not built yet)'}
          </option>
        ))}
      </select>
      {CANVAS_URL !== undefined && (
        <a href={CANVAS_URL} target="_blank" rel="noreferrer" className="t-micro text-inverse">
          Canvas
        </a>
      )}
    </div>
  );
}
