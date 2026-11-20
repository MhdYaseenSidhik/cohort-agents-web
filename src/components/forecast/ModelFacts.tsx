import { useCore } from '../../app/CoreData';
import { formatNumber, monthLabel } from '../../data/format';
import { Panel } from '../ui/Panel';

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="grid gap-1 min-w-0"><dt className="text-xs text-muted">{label}</dt><dd className="text-sm font-semibold text-ink num break-words" title={hint}>{value}</dd></div>
  );
}

export function ModelFacts() {
  const { manifest } = useCore();
  const f = manifest.forecast;
  if (!f) return null;
  return (
    <Panel title="Model and experiment" subtitle="Time-series experiment trained on plant HZL_DEMO_01, target net consumption (movement 261 minus 262), preset fast, primary metric RMSE.">
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Fact label="Experiment id" value={f.experimentId} />
        <Fact label="Created" value={f.experimentCreatedAt.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')} />
        <Fact label="Best model" value={f.bestModel} />
        <Fact label={`${f.metric.name} (validation)`} value={formatNumber(f.metric.value, 3)} hint="Leaderboard validation score" />
        <Fact label="Backtest MAE" value={formatNumber(f.backtestError.mae, 3)} />
        <Fact label="Backtest WAPE" value={f.backtestError.wape.toFixed(3)} hint="1 or more means no better than predicting zero" />
        <Fact label="Series" value={formatNumber(f.seriesCount)} />
        <Fact label="Months covered" value={`${monthLabel(f.forecastFrom)} to ${monthLabel(f.forecastTo)} (${f.predictionLength})`} />
      </dl>
    </Panel>
  );
}
