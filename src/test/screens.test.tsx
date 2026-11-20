import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { clearDatasetCache } from '../data/loader';
import { FIXTURES } from './fixtures';

vi.mock('echarts-for-react/lib/core', () => ({ default: () => <div data-testid="chart" /> }));

function mockFetch(overrides: Record<string, unknown> = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const name = String(url).split('/').pop()!.replace('.json', '');
    const body = name in overrides ? overrides[name] : (FIXTURES as unknown as Record<string, unknown>)[name];
    return body === undefined ? { ok: false, status: 404, json: async () => ({}) } : { ok: true, status: 200, json: async () => body };
  }));
}

function open(route: string, search = '') {
  window.history.replaceState(null, '', `/${search}#/${route}`);
  return render(<App />);
}

beforeEach(() => { clearDatasetCache(); mockFetch(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('screens render with fixture data', () => {
  it('Overview shows KPI tiles, alerts, the disclaimer and the as-of date', async () => {
    open('overview');
    expect(await screen.findByRole('heading', { name: 'Overview', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Gross inventory value')).toBeInTheDocument();
    expect(screen.getAllByText(/Simulated POC figure/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2025-12-31/).length).toBeGreaterThan(0);
    expect(await screen.findByText('Bush Assembly')).toBeInTheDocument();
  });

  it('Overview All plants uses the ALL_PLANTS KPI row and a single plant its own', async () => {
    open('overview');
    expect(await screen.findByText('187 days')).toBeInTheDocument();
    cleanup();
    clearDatasetCache();
    open('overview', '?plant=HZL_DEMO_01');
    expect(await screen.findByText('101 days')).toBeInTheDocument();
  });

  it('KPI filters on type say the KPIs are not filtered', async () => {
    open('overview', '?type=ZSPR');
    expect(await screen.findByText(/not filtered by material type ZSPR/)).toBeInTheDocument();
  });

  it('Scorecard lists every catalog KPI', async () => {
    open('scorecard');
    expect(await screen.findByRole('heading', { name: 'KPI scorecard', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Days on hand')).toBeInTheDocument();
    expect(screen.getByText('Lower is better')).toBeInTheDocument();
  });

  it('Inventory health shows the ZSPR / ZSPN split and the plant drill-down', async () => {
    open('health');
    expect(await screen.findByText('By material type')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /ZSPR/ })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Open HZL_DEMO_01' })).toBeInTheDocument();
  });

  it('Inventory health shows an empty state when filters match nothing', async () => {
    open('health', '?group=NOPE');
    expect(await screen.findByText('No inventory matches these filters')).toBeInTheDocument();
  });

  it('Replenishment shows totals and filters', async () => {
    open('replenishment');
    expect(await screen.findByText('Recommendations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Low' }));
    expect(await screen.findByText('No reorder recommendations match')).toBeInTheDocument();
  });

  it('Demand forecast shows the horizons, the exact long-range label, the verdict and the backtest label', async () => {
    open('forecast');
    expect(await screen.findByText('11-month forecast (maximum for 36 months of history)')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '3 months' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '6 months' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '11 months (max)' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /12 months/ })).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent(/WAPE 1\.172/);
    fireEvent.click(screen.getByRole('radio', { name: '3 months' }));
    expect(await screen.findByText('3-month forecast')).toBeInTheDocument();
    expect((await screen.findAllByText(/Backtest, not a forecast/)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/metrics.json matches forecast.json/)).toBeInTheDocument();
  });

  it('Demand forecast says plainly when the plant is not covered', async () => {
    open('forecast', '?plant=HZL_DEMO_02');
    expect(await screen.findByText('No forecast for HZL_DEMO_02')).toBeInTheDocument();
  });

  it('Demand forecast with available=false shows the reason', async () => {
    mockFetch({ forecast: { ...FIXTURES.forecast, available: false, reason: 'Not trained yet', rows: [], byPlantMonth: [] } });
    open('forecast');
    expect(await screen.findByText('Not trained yet')).toBeInTheDocument();
  });

  it('Plan vs actual shows the monthly table', async () => {
    open('plan');
    expect(await screen.findByRole('heading', { name: 'Plan versus actual', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('By plant')).toBeInTheDocument();
  });
});

describe('shell errors', () => {
  it('names a schemaVersion mismatch instead of guessing', async () => {
    mockFetch({ manifest: { ...FIXTURES.manifest, schemaVersion: 2 } });
    open('overview');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/schemaVersion mismatch/));
  });
  it('shows a recoverable error when a dataset fails', async () => {
    mockFetch({ reorder: undefined });
    open('replenishment');
    expect(await screen.findByText(/Could not load reorder.json/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument();
  });
});
