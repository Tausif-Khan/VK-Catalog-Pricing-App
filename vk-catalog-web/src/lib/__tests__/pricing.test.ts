import { describe, expect, it } from 'vitest';
import { diffPrices, formatPrice, parsePriceInput, type PriceMap } from '../pricing';

describe('parsePriceInput', () => {
  it('accepts plain and grouped numbers', () => {
    expect(parsePriceInput('180')).toBe(180);
    expect(parsePriceInput(' 1,200 ')).toBe(1200);
    expect(parsePriceInput('0')).toBe(0);
    expect(parsePriceInput('180.5')).toBe(180.5);
  });

  it('rejects blanks, junk, negatives and overflow', () => {
    expect(parsePriceInput('')).toBeNull();
    expect(parsePriceInput('abc')).toBeNull();
    expect(parsePriceInput('-5')).toBeNull();
    expect(parsePriceInput('1000000001')).toBeNull();
  });
});

describe('formatPrice', () => {
  it('formats rupees with the unit', () => {
    expect(formatPrice({ value: 180, unit: 'kg' })).toBe('₹180/kg');
    expect(formatPrice({ value: 180.5, unit: 'roll' })).toBe('₹180.50/roll');
  });
});

describe('diffPrices', () => {
  const stored: PriceMap = {
    'polyester-twine#18-3': { value: 180, unit: 'kg' },
    'cord-twine#60-3': { value: 90, unit: 'kg' },
  };

  it('reports nothing when no field was edited', () => {
    expect(diffPrices(stored, {}, ['polyester-twine#18-3'])).toEqual({
      set: [],
      clear: [],
      invalid: [],
    });
  });

  it('ignores a draft that matches the stored value', () => {
    expect(diffPrices(stored, { 'polyester-twine#18-3': '180' }, ['polyester-twine#18-3']).set)
      .toEqual([]);
    expect(diffPrices(stored, { 'polyester-twine#18-3': '180.0' }, ['polyester-twine#18-3']).set)
      .toEqual([]);
  });

  it('collects new values, clears and invalid input', () => {
    const diff = diffPrices(
      stored,
      {
        'polyester-twine#18-3': '210',
        'polyester-twine#24-3': '195',
        'cord-twine#60-3': '',
        'cord-twine#72-3': 'oops',
      },
      [
        'polyester-twine#18-3',
        'polyester-twine#24-3',
        'cord-twine#60-3',
        'cord-twine#72-3',
      ],
    );
    expect(diff.set).toEqual([
      { id: 'polyester-twine#18-3', value: 210 },
      { id: 'polyester-twine#24-3', value: 195 },
    ]);
    expect(diff.clear).toEqual(['cord-twine#60-3']);
    expect(diff.invalid).toEqual(['cord-twine#72-3']);
  });

  it('does not clear a variant that was never priced', () => {
    const diff = diffPrices(stored, { 'polyester-twine#30-3': '' }, ['polyester-twine#30-3']);
    expect(diff.clear).toEqual([]);
  });
});