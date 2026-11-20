import { CircleCheck, CircleX } from 'lucide-react';
import { useCore } from '../../app/CoreData';
import { formatNumber } from '../../data/format';
import { forecastMatchesMetrics, groupOutputs } from '../../data/forecastSelectors';
import type { Forecast } from '../../data/types';
import { Panel } from '../ui/Panel';

/** The metrics.json cross-check and the gs:// files the forecast and backtest came from. */
export function Provenance({ fc }: { fc: Forecast }) {
  const { manifest } = useCore();
  const f = manifest.forecast;
  if (!f) return null;
  const c = f.metricsCheck;
  const match = forecastMatchesMetrics(fc, c);
  const g = f.outputs ? groupOutputs(f.outputs) : null;
  return (
    <Panel title="Source and checks" subtitle="Forecast and backtest rows come from the experiment's output files in Google Cloud Storage.">
      <p className={`flex items-center gap-2 text-sm font-medium ${match.ok ? 'text-success' : 'text-danger'}`} role={match.ok ? undefined : 'alert'}>
        {match.ok ? <CircleCheck size={18} aria-hidden="true" /> : <CircleX size={18} aria-hidden="true" />}
        {match.ok ? `metrics.json matches forecast.json: experiment ${fc.experimentId}, horizon ${fc.predictionLength}.` : match.reason}
      </p>
      {c && (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-xs text-muted">metrics.json checked</dt><dd className="num">{c.checkedAt}</dd></div>
          <div><dt className="text-xs text-muted">Forecast rows (metrics / file)</dt><dd className="num">{formatNumber(c.metricsForecastRows)} / {formatNumber(c.forecastJsonRows)}</dd></div>
          <div><dt className="text-xs text-muted">Backtest RMSE (held-out)</dt><dd className="num">{formatNumber(c.backtestRmse, 2)}</dd></div>
          <div><dt className="text-xs text-muted">Generalization verdict</dt><dd>{c.generalizationVerdict ?? 'Not read back'}</dd></div>
        </dl>
      )}
      {c && <p className="text-xs text-muted max-w-prose">{c.note}</p>}
      {f.outputs && g && (
        <details className="group">
          <summary className="cursor-pointer min-h-10 inline-flex items-center text-sm font-medium text-accent">{f.outputs.length} gs:// files: {g.forecast} forecast, {g.backtest} backtest, {g.metrics} metrics (row counts per file are not published; total {formatNumber(c?.metricsForecastRows ?? 0)})</summary>
          <ul className="mt-2 grid gap-1 text-xs text-muted num max-h-64 overflow-auto">
            {f.outputs.map((o) => <li key={o.uri} className="break-all">{o.uri}</li>)}
          </ul>
        </details>
      )}
    </Panel>
  );
}
