import { describe, expect, it } from 'vitest';
import { priorMonth, summarizeKpi, toneFor } from '../kpiSelectors';
import type { KpiCatalogItem, KpiRow } from '../types';

const item = (direction: KpiCatalogItem['direction']): KpiCatalogItem => ({ code: 'K', label: 'K', uom: 'INR', direction, definition: 'd' });
const row = (month: string, plantId: string, value: number): KpiRow => ({ month, plantId, kpiCode: 'K', value, scenario: 'S' });

describe('direction colouring', () => {
  it('lower_is_better: a fall is good, a rise is bad', () => {
    expect(toneFor('lower_is_better', -1)).toBe('good');
    expect(toneFor('lower_is_better', 1)).toBe('bad');
  });
  it('higher_is_better: a rise is good, a fall is bad', () => {
    expect(toneFor('higher_is_better', 1)).toBe('good');
    expect(toneFor('higher_is_better', -1)).toBe('bad');
  });
  it('neutral is never good or bad, and no change is neutral', () => {
    expect(toneFor('neutral', 5)).toBe('neutral');
    expect(toneFor('neutral', -5)).toBe('neutral');
    expect(toneFor('higher_is_better', 0)).toBe('neutral');
    expect(toneFor('higher_is_better', null)).toBe('neutral');
  });
});

describe('priorMonth', () => {
  it('steps back across year boundaries', () => {
    expect(priorMonth('2025-01')).toBe('2024-12');
    expect(priorMonth('2025-12', 12)).toBe('2024-12');
    expect(priorMonth('2024-03', 3)).toBe('2023-12');
  });
});

describe('summarizeKpi: the All plants rule', () => {
  const rows = [
    row('2024-12', 'ALL_PLANTS', 100), row('2025-11', 'ALL_PLANTS', 120), row('2025-12', 'ALL_PLANTS', 90),
    row('2025-11', 'HZL_DEMO_01', 10), row('2025-12', 'HZL_DEMO_01', 20),
    row('2025-12', 'HZL_DEMO_02', 30),
  ];
  it('All plants uses the ALL_PLANTS source row and never sums plants', () => {
    const s = summarizeKpi(rows, item('lower_is_better'), 'ALL_PLANTS');
    expect(s.latest).toBe(90);
    expect(s.latest).not.toBe(20 + 30);
    expect(s.prior).toBe(120);
    expect(s.change).toBe(-30);
    expect(s.tone).toBe('good');
    expect(s.yearAgo).toBe(100);
    expect(s.changeYoY).toBe(-10);
  });
  it('a single plant uses that plant only', () => {
    const s = summarizeKpi(rows, item('higher_is_better'), 'HZL_DEMO_01');
    expect(s.latest).toBe(20);
    expect(s.change).toBe(10);
    expect(s.tone).toBe('good');
    expect(s.yearAgo).toBeNull();
    expect(s.changeYoY).toBeNull();
  });
  it('a single-month KPI has no prior month and no tone', () => {
    const s = summarizeKpi([row('2025-12', 'ALL_PLANTS', 5)], item('higher_is_better'), 'ALL_PLANTS');
    expect(s.change).toBeNull();
    expect(s.tone).toBe('neutral');
  });
  it('respects the month range', () => {
    const s = summarizeKpi(rows, item('neutral'), 'ALL_PLANTS', '', '2025-11');
    expect(s.latest).toBe(120);
  });
});
