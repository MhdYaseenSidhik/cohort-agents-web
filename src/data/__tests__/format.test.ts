import { describe, expect, it } from 'vitest';
import { formatDelta, formatInr, formatInrFull, formatKpi, formatPct } from '../format';

describe('INR formatting (lakh / crore)', () => {
  it('formats crores with up to two decimals', () => {
    expect(formatInr(12500000)).toBe('₹1.25 Cr');
    expect(formatInr(5125222946.78)).toBe('₹512.52 Cr');
    expect(formatInr(10000000)).toBe('₹1 Cr');
  });
  it('formats lakhs with up to one decimal', () => {
    expect(formatInr(430000)).toBe('₹4.3 L');
    expect(formatInr(100000)).toBe('₹1 L');
  });
  it('formats small values in Indian grouping and handles negatives and null', () => {
    expect(formatInr(99999)).toBe('₹99,999');
    expect(formatInr(-4300000)).toBe('−₹43 L');
    expect(formatInr(null)).toBe('—');
  });
  it('keeps the full value for tooltips', () => {
    expect(formatInrFull(12345678.9)).toBe('₹1,23,45,678.9');
  });
  it('formats percentages with one decimal and KPIs by unit', () => {
    expect(formatPct(25.6405)).toBe('25.6%');
    expect(formatKpi(88.7485, 'PCT')).toBe('88.7%');
    expect(formatKpi(186.9764, 'DAYS')).toBe('187 days');
    expect(formatKpi(1.9521, 'RATIO')).toBe('1.95×');
    expect(formatKpi(5148, 'COUNT')).toBe('5,148');
  });
  it('formats deltas with sign', () => {
    expect(formatDelta(-2.5, 'PCT')).toBe('−2.5 pp');
    expect(formatDelta(1500000, 'INR')).toBe('+₹15 L');
    expect(formatDelta(null, 'INR')).toBe('—');
  });
});
